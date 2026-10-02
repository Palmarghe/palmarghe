import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { imageHeader, InvalidImage, validateImage } from './image-validation';

describe('bounded full raster decoding',()=>{
  it.each(['png','jpeg','webp'] as const)('fully decodes a real %s and records actual dimensions',async format=>{
    const bytes=await sharp({create:{width:41,height:23,channels:3,background:'#9271ac'}}).toFormat(format).toBuffer();
    expect(await validateImage(bytes,`image/${format}`)).toEqual({mime:`image/${format}`,width:41,height:23});
  });
  it('handles the actual public portrait',async()=>{
    expect(await validateImage(readFileSync('public/editorial/lamine-yamal.webp'),'image/webp')).toEqual({mime:'image/webp',width:655,height:1000});
  });
  it.each(['png','jpeg','webp'] as const)('accepts normal profile metadata and accounts for EXIF orientation in %s',async format=>{
    const bytes=await sharp({create:{width:41,height:23,channels:3,background:'#9271ac'}}).withMetadata({orientation:6}).toFormat(format).toBuffer();
    expect(await validateImage(bytes,`image/${format}`)).toEqual({mime:`image/${format}`,width:23,height:41});
  });
  it('rejects the corrupt legacy one-pixel PNG fixture',async()=>{
    const bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lXcAAAAASUVORK5CYII=','base64');
    await expect(validateImage(bytes,'image/png')).rejects.toBeInstanceOf(InvalidImage);
  });
  it('rejects a signature-only file, MIME spoofing and truncated payloads',async()=>{
    await expect(validateImage(new Uint8Array([137,80,78,71,13,10,26,10]),'image/png')).rejects.toBeInstanceOf(InvalidImage);
    const good=await sharp({create:{width:20,height:20,channels:3,background:'#9271ac'}}).png().toBuffer();
    await expect(validateImage(good,'image/jpeg')).rejects.toBeInstanceOf(InvalidImage);
    await expect(validateImage(good.subarray(0,good.length-8),'image/png')).rejects.toBeInstanceOf(InvalidImage);
  });
  it('rejects excessive dimensions before allocating decoded pixels',async()=>{
    const good=await sharp({create:{width:20,height:20,channels:3,background:'#9271ac'}}).png().toBuffer();
    const huge=Buffer.from(good); huge.writeUInt32BE(50000,16);
    expect(()=>imageHeader(huge,'image/png')).toThrow('4096px');
    await expect(validateImage(huge,'image/png')).rejects.toBeInstanceOf(InvalidImage);
  });
  it('fully rejects corrupted compressed pixels and can decode again afterwards',async()=>{
    for(const format of ['png','jpeg','webp'] as const){
      const good=await sharp({create:{width:41,height:23,channels:3,background:'#9271ac'}}).toFormat(format).toBuffer();
      const corrupt=Buffer.from(good);
      // Retain valid container/header dimensions; damage the compressed stream.
      const start=format==='png' ? corrupt.indexOf(Buffer.from('IDAT'))+4 : format==='webp' ? 30 : corrupt.indexOf(Buffer.from([0xff,0xda]))+16;
      corrupt.fill(0,start,Math.min(start+32,corrupt.length-12));
      await expect(validateImage(corrupt,`image/${format}`)).rejects.toBeInstanceOf(InvalidImage);
      expect((await validateImage(good,`image/${format}`)).width).toBe(41);
    }
  });
});
