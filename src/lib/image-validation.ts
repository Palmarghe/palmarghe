import { detectImage, validMediaSize, type ImageMime } from './media';
import decodeJpeg, { init as initJpeg } from '@jsquash/jpeg/decode.js';
import decodePng, { init as initPng } from '@jsquash/png/decode.js';
import decodeWebp, { init as initWebp } from '@jsquash/webp/decode.js';
import * as modules from 'virtual:palmarghe-image-codecs';

export const MAX_IMAGE_PIXELS = 3_000_000;
export const MAX_IMAGE_EDGE = 4096;
type Dimensions = { width:number; height:number };
export class InvalidImage extends Error {}
const invalid = () => { throw new InvalidImage('Invalid or unsupported image'); };
const tag = (bytes:Uint8Array, offset:number) => String.fromCharCode(...bytes.subarray(offset, offset+4));
function bounded(width:number, height:number): Dimensions {
  if (!width || !height || width>MAX_IMAGE_EDGE || height>MAX_IMAGE_EDGE || width*height>MAX_IMAGE_PIXELS) throw new InvalidImage('Image exceeds 4096px edge or 3 megapixels');
  return {width,height};
}

/** Bounds allocation before full decoding. Container parsing alone is not validation. */
export function imageHeader(bytes:Uint8Array, mime:ImageMime): Dimensions {
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  if (mime==='image/png') {
    if(bytes.length<33 || view.getUint32(8)!==13 || tag(bytes,12)!=='IHDR') return invalid();
    const dimensions=bounded(view.getUint32(16),view.getUint32(20));
    let end=false;
    for(let offset=8;offset+12<=bytes.length;) {
      const length=view.getUint32(offset), type=tag(bytes,offset+4);
      if(length>bytes.length-offset-12 || type==='acTL' || (offset!==8 && type==='IHDR')) return invalid();
      offset+=length+12;
      if(type==='IEND') {if(length!==0 || offset!==bytes.length) return invalid(); end=true; break;}
    }
    if(!end) return invalid();
    return dimensions;
  }
  if(mime==='image/webp') {
    if(bytes.length<20 || view.getUint32(4,true)+8!==bytes.length) return invalid();
    let dimensions:Dimensions|undefined;
    let offset=12;
    for(;offset+8<=bytes.length;) {
      const length=view.getUint32(offset+4,true), type=tag(bytes,offset), start=offset+8;
      if(length>bytes.length-start) return invalid();
      if(type==='ANIM' || type==='ANMF') return invalid();
      if(type==='VP8X') {
        if(length!==10 || (bytes[start]&2)) return invalid();
        const uint24=(at:number)=>bytes[at]+(bytes[at+1]<<8)+(bytes[at+2]<<16);
        dimensions=bounded(uint24(start+4)+1,uint24(start+7)+1);
      } else if(type==='VP8L') {
        if(length<5 || bytes[start]!==0x2f) return invalid();
        const bits=view.getUint32(start+1,true);
        const actual=bounded((bits&0x3fff)+1,((bits>>>14)&0x3fff)+1);
        if(dimensions && (actual.width!==dimensions.width || actual.height!==dimensions.height)) return invalid();
        dimensions=actual;
      } else if(type==='VP8 ') {
        if(length<10 || bytes[start+3]!==0x9d || bytes[start+4]!==1 || bytes[start+5]!==0x2a) return invalid();
        const actual=bounded(view.getUint16(start+6,true)&0x3fff,view.getUint16(start+8,true)&0x3fff);
        if(dimensions && (actual.width!==dimensions.width || actual.height!==dimensions.height)) return invalid();
        dimensions=actual;
      }
      offset=start+length+(length%2);
      if(offset>bytes.length) return invalid();
    }
    if(offset!==bytes.length) return invalid();
    return dimensions ?? invalid();
  }
  if(bytes.length<4 || bytes[bytes.length-2]!==0xff || bytes[bytes.length-1]!==0xd9) return invalid();
  let dimensions:Dimensions|undefined;
  for(let offset=2;offset<bytes.length;) {
    if(bytes[offset++]!==0xff) return invalid();
    while(bytes[offset]===0xff) offset++;
    const marker=bytes[offset++];
    if(marker===0xda) return dimensions ?? invalid();
    if(marker===0xd9) return invalid();
    if(marker===0x01 || (marker>=0xd0 && marker<=0xd7)) continue;
    if(offset+2>bytes.length) return invalid();
    const length=view.getUint16(offset);
    if(length<2 || length>bytes.length-offset) return invalid();
    if(marker>=0xc0 && marker<=0xcf && ![0xc0,0xc1,0xc2,0xc4,0xc8,0xcc].includes(marker)) return invalid();
    if([0xc0,0xc1,0xc2].includes(marker)) {
      if(length<8 || dimensions) return invalid();
      dimensions=bounded(view.getUint16(offset+5),view.getUint16(offset+3));
    }
    offset+=length;
  }
  return invalid();
}

async function pngMetadata(bytes:Uint8Array) {
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  let total=0;
  for(let offset=8;offset+12<=bytes.length;){
    const length=view.getUint32(offset), type=tag(bytes,offset+4), data=bytes.subarray(offset+8,offset+8+length);
    offset+=length+12;
    if(!['iCCP','zTXt','iTXt','tEXt'].includes(type)) continue;
    const nameEnd=data.indexOf(0);
    if(nameEnd<1 || nameEnd>79) return invalid();
    let compressed=false, start=nameEnd+1;
    if(type==='iCCP' || type==='zTXt') {if(data[start++]!==0) return invalid(); compressed=true;}
    else if(type==='iTXt') {
      const flag=data[start++], method=data[start++];
      if((flag!==0 && flag!==1) || method!==0) return invalid();
      compressed=flag===1;
      for(let field=0;field<2;field++){const end=data.indexOf(0,start);if(end<0) return invalid();start=end+1;}
    }
    if(start>=data.length) return invalid();
    if(!compressed) {total+=data.length-start;if(total>1024*1024) throw new InvalidImage('PNG metadata exceeds limit');continue;}
    let position=start, expanded=0;
    // Small input chunks bound temporary output even for high-ratio streams.
    const source=new ReadableStream<BufferSource>({pull(controller){
      if(position>=data.length){controller.close();return;}
      const end=Math.min(position+256,data.length);controller.enqueue(data.slice(position,end));position=end;
    }});
    const reader=source.pipeThrough(new DecompressionStream('deflate')).getReader();
    try {
      while(true){const chunk=await reader.read();if(chunk.done) break;expanded+=chunk.value.length;
        if(expanded>256*1024 || total+expanded>1024*1024) throw new InvalidImage('PNG metadata exceeds limit');}
    } finally {await reader.cancel().catch(()=>{});reader.releaseLock();}
    total+=expanded;
  }
}

function imageOrientation(bytes:Uint8Array,mime:ImageMime):number {
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  let exif:Uint8Array|undefined;
  if(mime==='image/jpeg') {
    for(let offset=2;offset+4<=bytes.length;){
      if(bytes[offset++]!==0xff) break;
      while(bytes[offset]===0xff) offset++;
      const marker=bytes[offset++]; if(marker===0xda || marker===0xd9) break;
      if(marker===1 || (marker>=0xd0 && marker<=0xd7)) continue;
      if(offset+2>bytes.length) break;
      const size=view.getUint16(offset);if(size<2 || offset+size>bytes.length) break;
      if(marker===0xe1 && tag(bytes,offset+2)==='Exif'){exif=bytes.subarray(offset+2,offset+size);break;}
      offset+=size;
    }
  } else {
    for(let offset=mime==='image/png' ? 8 : 12;offset+12<=bytes.length;){
      const png=mime==='image/png',length=view.getUint32(offset+(png ? 0 : 4),!png),start=offset+8;
      if(start+length>bytes.length) break;
      if(tag(bytes,offset+(png ? 4 : 0))===(png ? 'eXIf' : 'EXIF')) {exif=bytes.subarray(start,start+length);break;}
      offset=start+length+(png ? 4 : length%2);
    }
  }
  if(!exif) return 1;
  if(tag(exif,0)==='Exif') exif=exif.subarray(6);
  if(exif.length<8) return 1;
  const little=exif[0]===0x49 && exif[1]===0x49;
  if(!little && !(exif[0]===0x4d && exif[1]===0x4d)) return 1;
  const tiff=new DataView(exif.buffer,exif.byteOffset,exif.byteLength);
  if(tiff.getUint16(2,little)!==42) return 1;
  const directory=tiff.getUint32(4,little); if(directory>exif.length-2) return 1;
  const count=tiff.getUint16(directory,little);
  if(count>256) throw new InvalidImage('Image metadata exceeds limit');
  for(let index=0;index<count;index++){
    const entry=directory+2+index*12; if(entry+12>exif.length) return 1;
    if(tiff.getUint16(entry,little)===0x112 && tiff.getUint16(entry+2,little)===3 && tiff.getUint32(entry+4,little)===1){
      const orientation=tiff.getUint16(entry+8,little);return orientation>=1 && orientation<=8 ? orientation : 1;
    }
  }
  return 1;
}

const initialized = {
  jpeg:undefined as Promise<unknown>|undefined,
  png:undefined as Promise<unknown>|undefined,
  webp:undefined as Promise<unknown>|undefined,
};
export async function validateImage(bytes:Uint8Array, declaredType:string):Promise<Dimensions & {mime:ImageMime}> {
  const mime=detectImage(bytes);
  if(!mime || mime!==declaredType || !validMediaSize(bytes.length)) return invalid();
  const header=imageHeader(bytes,mime);
  const orientation=imageOrientation(bytes,mime);
  const buffer=bytes.slice().buffer;
  try {
    if(mime==='image/png') await pngMetadata(bytes);
    let decoded:ImageData;
    if(mime==='image/jpeg') {await (initialized.jpeg ??= initJpeg(modules.jpeg)); decoded=await decodeJpeg(buffer);}
    else if(mime==='image/png') {await (initialized.png ??= initPng(modules.png)); decoded=await decodePng(buffer);}
    else {await (initialized.webp ??= initWebp(modules.webp)); decoded=await decodeWebp(buffer);}
    const result=bounded(decoded.width,decoded.height);
    const matches=result.width===header.width && result.height===header.height;
    const rotated=mime==='image/jpeg' && result.width===header.height && result.height===header.width;
    if((!matches && !rotated) || decoded.data.length!==result.width*result.height*4) return invalid();
    const display=orientation>=5 ? {width:header.height,height:header.width} : header;
    return {...display,mime};
  } catch(error) {if(error instanceof InvalidImage) throw error; return invalid();}
}
