import fs from 'node:fs/promises';
import sharp from 'sharp';
const output='docs/mod-publications-2026-10-04';
await fs.mkdir(output,{recursive:true});
const works=[
 {key:'colony-director',title:'Colony Director',label:'STRANDED / COLONY SYSTEMS',source:'C:/Users/Palmarghe/Downloads/70-1788199479-1639880615.webp'},
 {key:'palmarghetr',title:'PalmargheTR',label:'STRANDED / LOCALIZATION',source:'C:/Users/Palmarghe/Downloads/68-1788027715-311681849.webp'},
 {key:'kaanbuilder',title:'KaanBuilder',label:'MINECRAFT / BUILDING TOOLS',source:'C:/Users/Palmarghe/Downloads/chatgpt-image-24-haz-2026-23_05_01-2-png.png'}
];
for(const [index,work] of works.entries()){
 const geometry=index===0 ? '<g fill="none" stroke="#a995dd" stroke-width="2"><path d="M700 225h280v260H700zM740 275h90v85h-90zM855 275h90v85h-90zM740 395h205v45H740zM655 355h45m280 0h45"/><circle cx="655" cy="355" r="8"/><circle cx="1025" cy="355" r="8"/></g>' : index===1 ? '<g fill="none" stroke="#a995dd" stroke-width="2"><path d="M695 240h285v230H695zM725 285h135m-135 40h215m-215 40h175m-175 40h205"/><path d="M940 220v40m-20-20h40"/></g>' : '<g fill="none" stroke="#a995dd" stroke-width="2"><path d="M695 335l135-95 145 95v165H695zM660 335l170-125 180 125M750 390h50v110m55-110h65v50h-65zM695 500h280"/></g>';
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750"><defs><linearGradient id="b"><stop stop-color="#101014"/><stop offset="1" stop-color="#211a30"/></linearGradient><pattern id="g" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0v50" fill="none" stroke="#ffffff" stroke-opacity=".035"/></pattern></defs><rect width="1200" height="750" fill="url(#b)"/><rect width="1200" height="750" fill="url(#g)"/><path d="M72 150H1128M72 600H1128" stroke="#635879" stroke-opacity=".5"/><path d="M72 95h20v32H72zM79 103h16v9H79z" fill="#ede9e2"/><text x="112" y="115" font-family="Arial" font-size="16" letter-spacing="5" fill="#ddd9e2">PALMARGHE</text><text x="72" y="265" font-family="Arial" font-size="15" letter-spacing="3" fill="#b2a0d4">${work.label}</text><text x="72" y="350" font-family="Arial" font-size="52" fill="#f2eee7">${work.title}</text><text x="72" y="405" font-family="Arial" font-size="21" fill="#a9a4b2">Independent mod project</text><path d="M72 455h80" stroke="#9875dd" stroke-width="3"/>${geometry}<text x="72" y="650" font-family="Arial" font-size="14" letter-spacing="3" fill="#a9a4b2">MOD / ${String(index+1).padStart(2,'0')}</text><text x="990" y="650" font-family="Arial" font-size="14" fill="#a9a4b2">PALMARGHE.COM</text></svg>`;
 await fs.writeFile(`${output}/${work.key}-cover.svg`,svg);
 await sharp(Buffer.from(svg)).webp({quality:90}).toFile(`${output}/${work.key}-cover.webp`);
 if (await fs.access(work.source).then(()=>true,()=>false)) await sharp(work.source).resize({width:1600,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:88}).toFile(`${output}/${work.key}-source.webp`);
}
const publications=JSON.parse(await fs.readFile(`${output}/publications.json`,'utf8'));
const escape=text=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for(const work of publications) await fs.writeFile(`${output}/${work.key}.html`,work.sections.map(([heading,text])=>`<h2>${escape(heading)}</h2><p>${escape(text)}</p>`).join('')+`<h2>Resmi indirme ve destek</h2><p><a href="${work.source}">Resmi proje sayfasını aç</a></p>`);
