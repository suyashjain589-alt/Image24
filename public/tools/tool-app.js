/* IMAGE 24 V16.1 shared tool engine — standalone-page safe */
let active=null,files=[];const $=id=>document.getElementById(id),toastEl=$("toast");let activeCat="all";
const TOOLS=[
{id:"mergepdf",n:"Merge PDF",cat:"pdf"},{id:"splitpdf",n:"Split PDF",cat:"pdf"},{id:"compresspdf",n:"Compress PDF",cat:"pdf"},
{id:"wordpdf",n:"Word to PDF",cat:"pdf"},{id:"pdfexcel",n:"PDF to Excel",cat:"pdf"},{id:"pdfword",n:"PDF to Word",cat:"pdf"},
{id:"jpgpdf",n:"JPG to PDF",cat:"pdf"},{id:"pdfjpg",n:"PDF to JPG",cat:"pdf"},{id:"editpdf",n:"Edit PDF",cat:"pdf"},
{id:"excelpdf",n:"Excel to PDF",cat:"pdf"},{id:"watermarkpdf",n:"Watermark PDF",cat:"pdf"},{id:"unlockpdf",n:"Unlock PDF",cat:"pdf"},
{id:"organisepdf",n:"Organise PDF",cat:"pdf"},{id:"resize",n:"Image Resize",cat:"image"},{id:"crop",n:"Crop Image",cat:"image"},
{id:"removebg",n:"Remove Background",cat:"image"},{id:"bulkresize",n:"Bulk Image Resize",cat:"image"}
];

/* IMAGE 24 V18 performance: load heavy libraries only when a tool needs them. */
const I24_LIBS={
  pdfLib:'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',
  mammoth:'https://unpkg.com/mammoth@1.8.0/mammoth.browser.min.js',
  xlsx:'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js',
  jspdf:'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js',
  html2canvas:'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  pdfjs:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs'
};
const i24LibPromises={};
function loadI24Script(key){
  if(window[key==='pdfLib'?'PDFLib':key==='mammoth'?'mammoth':key==='xlsx'?'XLSX':key==='jspdf'?'jspdf':key==='html2canvas'?'html2canvas':'__none']) return Promise.resolve();
  if(i24LibPromises[key]) return i24LibPromises[key];
  i24LibPromises[key]=new Promise((resolve,reject)=>{
    const sc=document.createElement('script'); sc.src=I24_LIBS[key]; sc.async=true; sc.onload=resolve; sc.onerror=()=>reject(new Error('Could not load '+key+' library.')); document.head.appendChild(sc);
  });
  return i24LibPromises[key];
}
async function ensureToolLibraries(id){
  const needs=[];
  if(['mergepdf','splitpdf','compresspdf','wordpdf','pdfexcel','pdfword','jpgpdf','pdfjpg','editpdf','excelpdf','watermarkpdf','unlockpdf','organisepdf'].includes(id)) needs.push('pdfLib');
  if(['wordpdf'].includes(id)) needs.push('mammoth','html2canvas','jspdf');
  if(['excelpdf'].includes(id)) needs.push('xlsx','html2canvas','jspdf');
  if(['pdfexcel'].includes(id)) needs.push('xlsx');
  await Promise.all([...new Set(needs)].map(loadI24Script));
}
function filterTools(cat,b){activeCat=cat;document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));if(b)b.classList.add("active");renderTools()}
function renderTools(){const grid=$("grid"),count=$("count");if(!grid)return;let q=($("toolSearch")?.value||"").toLowerCase().trim();let cards=[...grid.querySelectorAll(".tool")];let shown=0;cards.forEach(c=>{let ok=(activeCat==="all"||c.dataset.toolCat===activeCat)&&(!q||(c.dataset.toolName+" "+c.dataset.toolDesc).includes(q));c.style.display=ok?"block":"none";if(ok)shown++});if(count)count.textContent=shown+" tools";}
renderTools();
function openTool(id){
const map={mergepdf:"merge-pdf",splitpdf:"split-pdf",compresspdf:"compress-pdf",wordpdf:"word-to-pdf",pdfexcel:"pdf-to-excel",pdfword:"pdf-to-word",jpgpdf:"jpg-to-pdf",pdfjpg:"pdf-to-jpg",editpdf:"edit-pdf",excelpdf:"excel-to-pdf",watermarkpdf:"watermark-pdf",unlockpdf:"unlock-pdf",organisepdf:"organise-pdf",resize:"image-resize",crop:"crop-image",removebg:"remove-background",bulkresize:"bulk-image-resize"};
const slug=map[id]; if(!slug){toast("Tool page not found.");return} location.href="/tools/"+slug+".html";
}
function showTool(id){active=id;files=[];$("workspace").classList.add("show");let t=TOOLS.find(x=>x.id===id);$("wt").textContent=t.n;$("wh").textContent=t.cat==="pdf"?"PDF workflow":"Image workflow";$("file").value="";$("file").accept=t.cat==="pdf"?".pdf,application/pdf,.doc,.docx,.xls,.xlsx":"image/*";$("file").multiple=["mergepdf","jpgpdf","bulkresize","organisepdf"].includes(id);$("controls").innerHTML="";$("status").textContent="";}
const fileInput=$("file"),dropZone=$("drop");
if(fileInput)fileInput.addEventListener("change",e=>{files=[...e.target.files];if(!validateToolFiles()){files=[];e.target.value="";return}build()});
if(dropZone){dropZone.addEventListener("dragover",e=>{e.preventDefault();dropZone.classList.add("drag")});dropZone.addEventListener("dragleave",()=>dropZone.classList.remove("drag"));dropZone.addEventListener("drop",e=>{e.preventDefault();dropZone.classList.remove("drag");files=[...e.dataTransfer.files];if(!validateToolFiles()){files=[];return}build()});}
function build(){if(!files.length)return;let id=active;
if(id==="resize")$("controls").innerHTML=`<div class="controls"><div class="control-title">Resize options</div><label class="field">Width <input id="w" type="number" placeholder="auto"></label><label class="field">Height <input id="h" type="number" placeholder="auto"></label><label class="check"><input id="lock" type="checkbox" checked> Keep ratio</label><label class="field">Unit <select id="unit"><option>px</option><option>%</option></select></label><label class="field">Format <select id="fmt"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></label><label class="field">Quality <input id="q" type="range" min="10" max="100" value="90" data-live-target="qv"></label><span id="qv" class="rangeval">90</span><button class="primary" data-action="image-run">Resize & download</button></div>`;
else if(id==="crop")$("controls").innerHTML=`<div class="controls"><label class="field">Width <input id="cw" type="number" placeholder="auto"></label><label class="field">Height <input id="ch" type="number" placeholder="auto"></label><button class="primary" data-action="image-run">Crop & download</button></div>`;
else if(id==="removebg")$("controls").innerHTML=`<div class="controls"><label class="field">Tolerance <input id="tol" type="range" min="5" max="100" value="35" data-live-target="tv"></label><span id="tv" class="rangeval">35</span><button class="primary" data-action="remove-background">Remove background</button></div><div class="tool-note">Best for images with a plain/solid background.</div>`;
else if(id==="bulkresize"){$("controls").innerHTML=`<div class="controls"><label class="field">Width <input id="bw" type="number" placeholder="e.g. 1200"></label><label class="field">Height <input id="bh" type="number" placeholder="auto"></label><label class="check"><input id="block" type="checkbox" checked> Keep ratio</label><button class="primary" data-action="bulk-resize">Process ${files.length} images</button></div>`;queue()}
else if(id==="mergepdf")$("controls").innerHTML=`<button class="primary" data-action="pdf-merge">Merge PDFs</button>`;
else if(id==="splitpdf"){$("controls").innerHTML=`<div class="controls"><button class="primary" data-action="pdf-pages">Create PDF from selected pages</button><button class="ghost" data-action="split-select-all">Select all</button><button class="ghost" data-action="split-select-clear">Clear all</button></div><div class="tool-note">Tap Delete on any page you do not want in the new PDF.</div><div id="splitPreview" class="split-preview"></div>`;buildSplitPreview();}
else if(id==="organisepdf")$("controls").innerHTML=`<div class="controls"><label class="field" style="flex:1">Pages <input id="pages" placeholder="e.g. 3,1,2 or 1,3-5"></label><button class="primary" data-action="pdf-pages">Create PDF</button></div><div class="tool-note">Enter the desired page order.</div>`;
else if(id==="compresspdf")$("controls").innerHTML=`<button class="primary" data-action="pdf-compress">Optimize PDF</button><div class="tool-note">This browser tool re-serializes the PDF and can reduce structural overhead. Scanned-image compression is not performed locally.</div>`;
else if(["jpgpdf"].includes(id))$("controls").innerHTML=`<button class="primary" data-action="image-pdf">Create PDF</button>`;
else if(id==="pdfjpg")$("controls").innerHTML=`<div class="controls"><label class="field">JPG quality <input id="jpgq" type="range" min="30" max="100" value="90"></label><button class="primary" data-action="pdf-to-jpg">Export JPGs</button></div>`;
else if(id==="watermarkpdf")$("controls").innerHTML=`<div class="controls"><label class="field">Text <input id="wm" value="IMAGE 24"></label><label class="field">Opacity <input id="wmo" type="range" min="10" max="100" value="35"></label><button class="primary" data-action="watermark-pdf">Watermark PDF</button></div>`;
else if(id==="editpdf")$("controls").innerHTML=`<div class="controls"><label class="field">Text <input id="et" placeholder="Text to add"></label><label class="field">Page <input id="ep" type="number" value="1" min="1"></label><label class="field">X <input id="ex" type="number" value="50"></label><label class="field">Y <input id="ey" type="number" value="50"></label><button class="primary" data-action="edit-pdf">Add text & download</button></div>`;
else if(id==="unlockpdf")$("controls").innerHTML=`<button class="primary" data-action="unlock-pdf">Create unlocked copy</button><div class="tool-note danger-note">Encrypted PDFs may require the correct password. IMAGE 24 cannot bypass security protections.</div>`;
else if(["wordpdf","pdfword","pdfexcel","excelpdf"].includes(id))$("controls").innerHTML=`<button class="primary" data-action="conversion-run">Convert & download</button><div class="tool-note">This conversion uses browser libraries when available. Complex layouts, formulas and scanned documents may need server-side conversion.</div>`;
}
function queue(){$("status").innerHTML=`<div class="queue">${files.map(f=>`<div class="qrow"><div class="qicon">📄</div><div class="qmeta"><b>${esc(f.name)}</b><small>${(f.size/1024).toFixed(1)} KB</small></div></div>`).join("")}</div>`}
function esc(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
async function imageRun(){let f=files[0],img=new Image();img.src=URL.createObjectURL(f);await img.decode();let c=document.createElement("canvas"),ctx=c.getContext("2d"),w=img.width,h=img.height;
if(active==="resize"){let unit=$("unit").value;if(unit==="%") {const wp=+$('w').value||0,hp=+$('h').value||0;if($('lock').checked&&wp&&!hp){w=Math.round(img.width*wp/100);h=Math.round(img.height*wp/100)}else if($('lock').checked&&hp&&!wp){h=Math.round(img.height*hp/100);w=Math.round(img.width*hp/100)}else{w=Math.round(img.width*(wp||100)/100);h=Math.round(img.height*(hp||100)/100)}} else {w=+$('w').value||w;h=+$('h').value||h;if($('lock').checked){if($('w').value&&!$('h').value)h=Math.round(img.height*w/img.width);else if($('h').value&&!$('w').value)w=Math.round(img.width*h/img.height)}}}
if(active==="crop"){w=Math.min(+$('cw').value||img.width,img.width);h=Math.min(+$('ch').value||img.height,img.height)}c.width=w;c.height=h;if(active==="crop")ctx.drawImage(img,(img.width-w)/2,(img.height-h)/2,w,h,0,0,w,h);else ctx.drawImage(img,0,0,w,h);let fmt=$("fmt")?.value||"image/jpeg";const target=+$("targetKB")?.value||0;if(active==='resize'&&$("sizeMode")?.value==='kb'&&target>0&&/image\/(jpeg|webp)/i.test(fmt)){await saveCanvasTargetKB(c,fmt,target);return}saveCanvas(c,fmt,(+$('q')?.value||90)/100)}
async function saveCanvasTargetKB(c,fmt,targetKB){let best=null,bestOver=null;for(let q=0.95;q>=0.1;q-=0.05){const blob=await new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('Canvas export failed')),fmt,q));if(blob.size<=targetKB*1024){best=blob;break}if(!bestOver||blob.size<bestOver.size)bestOver=blob}if(!best)best=bestOver;if(best)await download(best,'image24-result.'+(fmt==='image/webp'?'webp':'jpg'));if($("status"))$("status").textContent=best&&best.size<=targetKB*1024?`Done — ${(best.size/1024).toFixed(0)} KB result ready.`:'Done — closest size available; browser compression could not reach the target.'}
async function removeBackground(){let f=files[0],img=new Image();img.src=URL.createObjectURL(f);await img.decode();let c=document.createElement("canvas");c.width=img.width;c.height=img.height;let x=c.getContext("2d");x.drawImage(img,0,0);let d=x.getImageData(0,0,c.width,c.height),p=d.data,t=+$("tol").value*2.55;let samples=[];for(let yy=0;yy<Math.min(20,c.height);yy++)for(let xx=0;xx<Math.min(20,c.width);xx++){let i=(yy*c.width+xx)*4;samples.push([p[i],p[i+1],p[i+2]])}let avg=samples.reduce((a,v)=>[a[0]+v[0],a[1]+v[1],a[2]+v[2]],[0,0,0]).map(v=>v/samples.length);for(let i=0;i<p.length;i+=4){let dist=Math.hypot(p[i]-avg[0],p[i+1]-avg[1],p[i+2]-avg[2]);if(dist<t)p[i+3]=0}x.putImageData(d,0,0);saveCanvas(c,"image/png",1)}
async function bulkResize(){let w=+$("bw").value,h=+$("bh").value;for(let f of files){let img=new Image();const objectUrl=URL.createObjectURL(f);img.src=objectUrl;await img.decode();URL.revokeObjectURL(objectUrl);if(img.width*img.height>I24_MAX_IMAGE_PIXELS)throw new Error('Image is too large to process safely in this browser.');let nw=w||img.width,nh=h||Math.round(img.height*nw/img.width);if($("block").checked){if(w&&!h)nh=Math.round(img.height*nw/img.width);else if(h&&!w)nw=Math.round(img.width*nh/img.height)}let c=document.createElement("canvas");c.width=nw;c.height=nh;c.getContext("2d").drawImage(img,0,0,nw,nh);await new Promise(r=>c.toBlob(b=>{download(b,"image24-"+f.name.replace(/\.[^.]+$/,"" )+".jpg");r()},"image/jpeg",.9))}$("status").textContent="Bulk resize complete."}
async function saveCanvas(c,fmt,q){
  try{
    const blob=await new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error("Canvas export failed")),fmt,q));
    await download(blob,"image24-result."+(fmt.split("/")[1]||"png").replace("jpeg","jpg"));
    if($("status"))$("status").textContent="Done — result ready to download.";
  }catch(e){console.error(e);toast("Download failed. Please try again.")}
}
async function download(blob,name){
  if(!blob)return;
  const u=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=u;a.download=name;a.rel="noopener";a.style.display="none";
  document.body.appendChild(a);
  try{a.click()}catch(e){}
  setTimeout(()=>{try{a.remove()}catch(e){};URL.revokeObjectURL(u)},60000);
  return true;
}
async function imagePDF(){let pdf=await PDFLib.PDFDocument.create();for(let f of files){let b=new Uint8Array(await f.arrayBuffer()),im=f.type==="image/jpeg"?await pdf.embedJpg(b):await pdf.embedPng(b),s=im.scale(1),p=pdf.addPage([s.width,s.height]);p.drawImage(im,{x:0,y:0,width:s.width,height:s.height})}download(new Blob([await pdf.save()],{type:"application/pdf"}),"image24-images.pdf");$("status").textContent="PDF created."}
async function pdfMerge(){let out=await PDFLib.PDFDocument.create();for(let f of files){let d=await PDFLib.PDFDocument.load(await f.arrayBuffer());(await out.copyPages(d,d.getPageIndices())).forEach(p=>out.addPage(p))}download(new Blob([await out.save()],{type:"application/pdf"}),"image24-merged.pdf");$("status").textContent="PDFs merged."}
function parsePages(s,total){let set=[];s.split(",").forEach(part=>{let x=part.trim().split("-").map(Number);if(x.length===1&&x[0]>=1&&x[0]<=total)set.push(x[0]-1);else if(x.length===2)for(let i=x[0];i<=x[1];i++)if(i>=1&&i<=total)set.push(i-1)});return [...new Set(set)]}
async function pdfPages(){let d=await PDFLib.PDFDocument.load(await files[0].arrayBuffer()),n=d.getPageCount(),idx=parsePages(active==="splitpdf"?splitSelected.join(","):($("pages").value||"1"),n);if(!idx.length){toast("Enter valid page numbers");return}let out=await PDFLib.PDFDocument.create(),copied=await out.copyPages(d,idx);copied.forEach(p=>out.addPage(p));download(new Blob([await out.save()],{type:"application/pdf"}),"image24-pages.pdf");$("status").textContent="PDF created."}
async function pdfCompress(){let d=await PDFLib.PDFDocument.load(await files[0].arrayBuffer()),bytes=await d.save({useObjectStreams:true,addDefaultPage:false});download(new Blob([bytes],{type:"application/pdf"}),"image24-compressed.pdf");$("status").textContent="Compressed copy created."}
async function loadPDFJS(){return await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs")}
async function pdfToJpg(){try{let pdfjs=await loadPDFJS();pdfjs.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";let pdf=await pdfjs.getDocument({data:await files[0].arrayBuffer()}).promise;for(let n=1;n<=pdf.numPages;n++){let page=await pdf.getPage(n),vp=page.getViewport({scale:1.6}),c=document.createElement("canvas");c.width=vp.width;c.height=vp.height;await page.render({canvasContext:c.getContext("2d"),viewport:vp}).promise;await new Promise(r=>c.toBlob(b=>{download(b,`image24-page-${n}.jpg`);r()},"image/jpeg",(+$("jpgq").value||90)/100))}$("status").textContent=`Exported ${pdf.numPages} JPG pages.`}catch(e){toast("PDF rendering failed in this browser.")}}
async function watermarkPDF(){let d=await PDFLib.PDFDocument.load(await files[0].arrayBuffer()),font=await d.embedFont(PDFLib.StandardFonts.HelveticaBold),txt=$("wm").value||"IMAGE 24",op=(+$("wmo").value||35)/100;for(let p of d.getPages()){let {width,height}=p.getSize();p.drawText(txt,{x:25,y:25,size:22,font,color:PDFLib.rgb(0.35,0.35,0.65),opacity:op,rotate:PDFLib.degrees(0)});p.drawText("",{x:width-20,y:height-20})}download(new Blob([await d.save()],{type:"application/pdf"}),"image24-watermarked.pdf");$("status").textContent="Watermark added."}
async function editPDF(){let d=await PDFLib.PDFDocument.load(await files[0].arrayBuffer()),font=await d.embedFont(PDFLib.StandardFonts.Helvetica),p=d.getPages()[(+$("ep").value||1)-1];if(!p){toast("Invalid page number");return}p.drawText($("et").value||"IMAGE 24",{x:+$("ex").value||50,y:+$("ey").value||50,size:14,font,color:PDFLib.rgb(1,1,1)});download(new Blob([await d.save()],{type:"application/pdf"}),"image24-edited.pdf");$("status").textContent="Text added to PDF."}
async function unlockPDF(){try{let d=await PDFLib.PDFDocument.load(await files[0].arrayBuffer(),{ignoreEncryption:false});download(new Blob([await d.save()],{type:"application/pdf"}),"image24-unlocked.pdf");$("status").textContent="Unlocked copy created when the PDF permits editing."}catch(e){toast("This PDF is password-protected. A password is required.")}}
async function canvasToPagedPdf(canvas,filename,quality=.92){
  const {jsPDF}=window.jspdf;if(!jsPDF)throw new Error('PDF library is loading.');
  const margin=10,pageW=190,pageH=277,scale=pageW/canvas.width,sliceH=Math.max(1,Math.floor(pageH/scale));
  const pdf=new jsPDF({unit:'mm',format:'a4',orientation:'portrait'});let y=0,page=0;
  while(y<canvas.height){if(page>0)pdf.addPage();const h=Math.min(sliceH,canvas.height-y),slice=document.createElement('canvas');slice.width=canvas.width;slice.height=h;slice.getContext('2d').drawImage(canvas,0,y,canvas.width,h,0,0,canvas.width,h);pdf.addImage(slice.toDataURL('image/jpeg',quality),'JPEG',margin,margin,pageW,h*scale);y+=h;page++;}
  pdf.save(filename);
}
async function conversionRun(){try{if(active==="wordpdf"){if(!window.mammoth){toast("Word converter is loading. Try again.");return}let r=await mammoth.convertToHtml({arrayBuffer:await files[0].arrayBuffer()}),box=document.createElement("div");box.style.cssText="position:fixed;left:-10000px;top:0;width:720px;background:white;color:black;padding:30px;font-family:Arial;";box.innerHTML=r.value;document.body.appendChild(box);let c=await html2canvas(box,{scale:1.5});await canvasToPagedPdf(c,"image24-word.pdf",.92);box.remove();$("status").textContent="Word converted to a paginated PDF."}
else if(active==="excelpdf"){if(!window.XLSX){toast("Excel converter is loading. Try again.");return}let wb=XLSX.read(await files[0].arrayBuffer(),{type:"array"}),html="<div style='font-family:Arial;font-size:10px'>";for(let name of wb.SheetNames){html+="<h3>"+esc(name)+"</h3>"+XLSX.utils.sheet_to_html(wb.Sheets[name])}html+="</div>";let box=document.createElement("div");box.style.cssText="position:fixed;left:-10000px;top:0;width:900px;background:white;color:black;padding:30px;";box.innerHTML=html;document.body.appendChild(box);let c=await html2canvas(box,{scale:1.2});await canvasToPagedPdf(c,"image24-excel.pdf",.9);box.remove();$("status").textContent="Excel converted to a paginated PDF."}
else if(active==="pdfword"||active==="pdfexcel"){let pdfjs=await loadPDFJS();pdfjs.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";let pdf=await pdfjs.getDocument({data:await files[0].arrayBuffer()}).promise,rows=[];for(let n=1;n<=pdf.numPages;n++){let page=await pdf.getPage(n),tc=await page.getTextContent(),text=tc.items.map(x=>x.str).join(" ");rows.push([n,text])}if(active==="pdfexcel"){let ws=XLSX.utils.aoa_to_sheet([["Page","Extracted text"],...rows]),wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"PDF");XLSX.writeFile(wb,"image24-pdf.xlsx");$("status").textContent="PDF text exported to Excel."}else{let docxLib=await import("https://unpkg.com/docx@9.5.1/build/index.js"),children=rows.flatMap(r=>[new docxLib.Paragraph({text:`Page ${r[0]}`,heading:docxLib.HeadingLevel.HEADING_2}),new docxLib.Paragraph({text:r[1]})]);let doc=new docxLib.Document({sections:[{children}]}),blob=await docxLib.Packer.toBlob(doc);download(blob,"image24-pdf.docx");$("status").textContent="PDF text exported to Word."}}}catch(e){console.error(e);toast("Conversion failed. Try a simpler document or PDF.")}}


let splitSelected=[];
async function buildSplitPreview(){const box=$("splitPreview");if(!box||!files[0])return;box.innerHTML='<div class="tool-note">Loading PDF pages…</div>';try{const pdfjs=await ensurePDFJS(); const pdf=await pdfjs.getDocument({data:await files[0].arrayBuffer()}).promise;if(pdf.numPages>I24_MAX_PDF_PAGES_PREVIEW)throw new Error(`PDF has too many pages for browser preview (max ${I24_MAX_PDF_PAGES_PREVIEW}).`);splitSelected=Array.from({length:pdf.numPages},(_,i)=>i+1);box.innerHTML="";for(let n=1;n<=pdf.numPages;n++){const page=await pdf.getPage(n),vp=page.getViewport({scale:.55}),card=document.createElement("div");card.className="split-page";card.dataset.page=n;const canvas=document.createElement("canvas");canvas.width=vp.width;canvas.height=vp.height;const a=document.createElement("div");a.className="sp-actions";a.innerHTML=`<span>Page ${n}</span><button type="button" data-action="split-toggle" data-page="${n}">Delete</button>`;card.append(canvas,a);box.appendChild(card);await page.render({canvasContext:canvas.getContext("2d"),viewport:vp}).promise}$("status").textContent=`${pdf.numPages} pages loaded.`}catch(e){box.innerHTML='<div class="tool-note danger-note">Could not preview this PDF.</div>';$("status").textContent=e.message||"Preview failed"}}
function splitToggle(n,b){const c=b.closest(".split-page"),on=splitSelected.includes(n);if(on){splitSelected=splitSelected.filter(x=>x!==n);c.classList.add("removed");b.textContent="Keep"}else{splitSelected.push(n);splitSelected.sort((a,b)=>a-b);c.classList.remove("removed");b.textContent="Delete"}$("status").textContent=`${splitSelected.length} page(s) selected.`}
function splitSelectAll(on){const cs=document.querySelectorAll(".split-page");splitSelected=on?[...cs].map(c=>+c.dataset.page):[];cs.forEach(c=>{c.classList.toggle("removed",!on);const b=c.querySelector("button");if(b)b.textContent=on?"Delete":"Keep"})}


function toast(msg){const el=document.getElementById("toast");if(!el)return;el.textContent=msg;el.classList.add("show");clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>el.classList.remove("show"),2600)}
function bootToolPage(id){
  try { showTool(id); } catch(e) { console.error(e); const st=document.getElementById("status"); if(st) st.textContent="Tool could not start: "+(e.message||e); }
}

/* IMAGE 24 V16.2 feature upgrades */
let orgPages=[], orgPdfBytes=null, editPdfDoc=null, editPages=[], editSelected=1, editActions=[], cropState=null, resizeState=null, bgState=null;

async function ensurePDFJS(){
  if(window.pdfjsLib) return window.pdfjsLib;
  const pdfjs=await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";
  window.pdfjsLib=pdfjs; return pdfjs;
}
function imgEl(src){const i=new Image();i.src=src;return i}
async function loadImageFile(f){const u=URL.createObjectURL(f),i=imgEl(u);await i.decode();URL.revokeObjectURL(u);return i}
function hexRgb(hex){hex=(hex||"#ffffff").replace("#","");return [parseInt(hex.slice(0,2),16)/255,parseInt(hex.slice(2,4),16)/255,parseInt(hex.slice(4,6),16)/255]}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}

/* Enhanced build: image/PDF preview + richer controls */
function build(){
  if(!files.length)return;
  if(!validateToolFiles())return;
  const id=active;
  if(id==="resize") buildResizeUI();
  else if(id==="crop") buildCropUI();
  else if(id==="removebg") buildRemoveBgUI();
  else if(id==="watermarkpdf") buildWatermarkUI();
  else if(id==="editpdf") buildEditUI();
  else if(id==="organisepdf") buildOrganiseUI();
  else if(id==="bulkresize"){$("controls").innerHTML=`<div class="controls"><label class="field">Width <input id="bw" type="number" placeholder="e.g. 1200"></label><label class="field">Height <input id="bh" type="number" placeholder="auto"></label><label class="check"><input id="block" type="checkbox" checked> Keep ratio</label><button class="primary" data-action="bulk-resize">Process ${files.length} images</button></div>`;queue()}
  else if(id==="mergepdf"){$("controls").innerHTML=`<button class="primary" data-action="pdf-merge">Merge PDFs</button>`;queue()}
  else if(id==="splitpdf"){$("controls").innerHTML=`<div class="controls"><button class="primary" data-action="pdf-pages">Create PDF from selected pages</button><button class="ghost" data-action="split-select-all">Select all</button><button class="ghost" data-action="split-select-clear">Clear all</button></div><div class="tool-note">Tap Delete on any page you do not want in the new PDF.</div><div id="splitPreview" class="split-preview"></div>`;buildSplitPreview()}
  else if(id==="compresspdf"){$("controls").innerHTML=`<div class="controls"><label class="field">Quality <select id="pdfq"><option value="high">High</option><option value="medium" selected>Balanced</option><option value="low">Smallest</option></select></label><button class="primary" data-action="pdf-compress">Compress PDF</button></div>`;queue()}
  else if(id==="jpgpdf"){$("controls").innerHTML=`<button class="primary" data-action="image-pdf">Create PDF</button>`;queue()}
  else if(id==="pdfjpg"){$("controls").innerHTML=`<div class="controls"><label class="field">JPG quality <input id="jpgq" type="range" min="30" max="100" value="90"></label><button class="primary" data-action="pdf-to-jpg">Export JPGs</button></div>`;queue()}
  else if(id==="unlockpdf"){$("controls").innerHTML=`<button class="primary" data-action="unlock-pdf">Create unlocked copy</button><div class="tool-note danger-note">Encrypted PDFs may require the correct password.</div>`;queue()}
  else if(["wordpdf","pdfword","pdfexcel","excelpdf"].includes(id)){$("controls").innerHTML=`<button class="primary" data-action="conversion-run">Convert & download</button>`;queue()}
  else { /* fallback to original controls where present */ }
}

async function buildResizeUI(){
  const f=files[0], url=URL.createObjectURL(f);
  $("controls").innerHTML=`<div class="image-work"><div class="image-preview-card"><div class="preview-title">Preview</div><img id="resizePreview" src="${url}" alt="Preview"></div><div class="controls rich-controls">
  <label class="field wide">Preset <select id="resizePreset" data-action="apply-resize-preset"><option value="custom">Custom</option><option value="instagram">Instagram Post · 1080×1080</option><option value="instagram-story">Instagram Story · 1080×1920</option><option value="facebook">Facebook Post · 1200×630</option><option value="youtube">YouTube Thumbnail · 1280×720</option><option value="linkedin">LinkedIn Post · 1200×627</option><option value="x">X Post · 1600×900</option><option value="whatsapp">WhatsApp DP · 500×500</option></select></label>
  <label class="field">Width <input id="w" type="number" placeholder="auto" data-action="resize-state-update"></label><label class="field">Height <input id="h" type="number" placeholder="auto" data-action="resize-state-update"></label><label class="field">Unit <select id="unit"><option>px</option><option>%</option></select></label><label class="check"><input id="lock" type="checkbox" checked> Keep ratio</label>
  <label class="field wide">Target size <select id="sizeMode"><option value="none">No KB target</option><option value="kb">Target KB</option></select></label><label class="field">KB <input id="targetKB" type="number" placeholder="e.g. 200" min="1"></label>
  <label class="field">Format <select id="fmt"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></label><label class="field wide">Quality <input id="q" type="range" min="10" max="100" value="90" data-live-target="qv"></label><span id="qv" class="rangeval">90</span>
  <button class="primary" data-action="image-run">Resize & download</button></div></div>`;
  resizeState={url};
}
function applyResizePreset(){const p=$("resizePreset").value,map={instagram:[1080,1080],"instagram-story":[1080,1920],facebook:[1200,630],youtube:[1280,720],linkedin:[1200,627],x:[1600,900],whatsapp:[500,500]};if(!map[p])return;$('w').value=map[p][0];$('h').value=map[p][1];if($("lock"))$("lock").checked=false;}
function resizeStateUpdate(){}

async function buildCropUI(){
  const f=files[0],url=URL.createObjectURL(f);
  $("controls").innerHTML=`<div class="crop-editor"><div class="crop-canvas-wrap"><canvas id="cropCanvas"></canvas><div id="cropBox"></div></div><div class="controls rich-controls"><label class="field wide">Preset <select id="cropPreset" data-action="apply-crop-preset"><option value="free">Free crop</option><option value="square">Square 1:1</option><option value="passport">Passport · 35×45 mm</option><option value="passport2x2">Passport · 2×2 in</option><option value="instagram">Instagram · 1:1</option><option value="story">Story · 9:16</option><option value="youtube">YouTube · 16:9</option></select></label><label class="field">X <input id="cx" type="number"></label><label class="field">Y <input id="cy" type="number"></label><label class="field">Width <input id="cw" type="number"></label><label class="field">Height <input id="ch" type="number"></label><label class="field">Output <select id="cropFmt"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option></select></label><button class="primary" data-action="crop-download">Crop & download</button></div><div class="tool-note">Drag the crop box on the image, or enter exact X/Y/width/height values.</div></div>`;
  const img=await loadImageFile(f);cropState={img,scale:Math.min(1,760/img.width),x:0,y:0,w:img.width,h:img.height};setupCropCanvas();
}
function setupCropCanvas(){const s=cropState.scale,c=$("cropCanvas"),i=cropState.img;c.width=Math.round(i.width*s);c.height=Math.round(i.height*s);c.getContext("2d").drawImage(i,0,0,c.width,c.height);const box=$("cropBox");box.style.left="0px";box.style.top="0px";box.style.width=c.width+"px";box.style.height=c.height+"px";["cx","cy","cw","ch"].forEach((id,idx)=>$(id).value=[0,0,i.width,i.height][idx]);let dragging=false,sx=0,sy=0,ox=0,oy=0;c.onpointerdown=e=>{const r=c.getBoundingClientRect();dragging=true;sx=e.clientX-r.left;sy=e.clientY-r.top;ox=sx;oy=sy;c.setPointerCapture(e.pointerId)};c.onpointermove=e=>{if(!dragging)return;const r=c.getBoundingClientRect(),x=clamp(e.clientX-r.left,0,c.width),y=clamp(e.clientY-r.top,0,c.height);const left=Math.min(ox,x),top=Math.min(oy,y),w=Math.abs(x-ox),h=Math.abs(y-oy);if(w>5&&h>5){box.style.left=left+"px";box.style.top=top+"px";box.style.width=w+"px";box.style.height=h+"px";$("cx").value=Math.round(left/s);$("cy").value=Math.round(top/s);$("cw").value=Math.round(w/s);$("ch").value=Math.round(h/s)}};c.onpointerup=()=>dragging=false}
function applyCropPreset(){const p=$("cropPreset").value;if(!cropState)return;const iw=cropState.img.width,ih=cropState.img.height;let ratio=null;if(p==="square"||p==="instagram")ratio=1;if(p==="story")ratio=9/16;if(p==="youtube")ratio=16/9;if(p==="passport")ratio=35/45;if(p==="passport2x2")ratio=1;if(!ratio){$("cx").value=0;$("cy").value=0;$("cw").value=iw;$("ch").value=ih;return}let w=iw,h=Math.round(w/ratio);if(h>ih){h=ih;w=Math.round(h*ratio)}$("cx").value=Math.round((iw-w)/2);$("cy").value=Math.round((ih-h)/2);$("cw").value=w;$("ch").value=h;syncCropBox()}
function syncCropBox(){if(!cropState)return;const s=cropState.scale,box=$("cropBox");box.style.left=(+$('cx').value*s)+"px";box.style.top=(+$('cy').value*s)+"px";box.style.width=(+$('cw').value*s)+"px";box.style.height=(+$('ch').value*s)+"px"}
async function cropDownload(){const img=cropState.img,x=clamp(+$('cx').value||0,0,img.width-1),y=clamp(+$('cy').value||0,0,img.height-1),w=clamp(+$('cw').value||img.width,img.width-x),h=clamp(+$('ch').value||img.height,img.height-y),c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,x,y,w,h,0,0,w,h);saveCanvas(c,$('cropFmt').value,0.92)}

async function buildRemoveBgUI(){
  const f=files[0],url=URL.createObjectURL(f);$("controls").innerHTML=`<div class="bg-editor"><div class="bg-previews"><div><div class="preview-title">Original</div><img src="${url}" id="bgOriginal"></div><div><div class="preview-title">Result</div><canvas id="bgResult"></canvas></div></div><div class="controls rich-controls"><label class="field wide">Background <select id="bgColor"><option value="transparent">Transparent</option><option value="#ffffff">White</option><option value="#000000">Black</option><option value="#1e5eff">Passport Blue</option><option value="#22a447">Green</option><option value="#e9e9e9">Light Gray</option><option value="#f4d7b5">Skin/Beige</option><option value="custom">Custom</option></select></label><input id="bgCustom" type="color" value="#ffffff"><label class="field wide">Tolerance <input id="tol" type="range" min="5" max="100" value="35" data-live-target="tv"></label><span id="tv" class="rangeval">35</span><button class="primary" data-action="remove-background">Remove background</button><button class="ghost" data-action="download-bg-result">Download result</button></div></div>`;bgState={img:await loadImageFile(f)};renderBgPreview();
}
async function removeBackground(){if(!bgState)return;const img=bgState.img,c=document.createElement("canvas");c.width=img.width;c.height=img.height;const x=c.getContext("2d");x.drawImage(img,0,0);const d=x.getImageData(0,0,c.width,c.height),p=d.data,t=(+$('tol').value||35)*2.55;let samples=[];for(let yy=0;yy<Math.min(30,c.height);yy++)for(let xx=0;xx<Math.min(30,c.width);xx++){let i=(yy*c.width+xx)*4;samples.push([p[i],p[i+1],p[i+2]])}let avg=samples.reduce((a,v)=>[a[0]+v[0],a[1]+v[1],a[2]+v[2]],[0,0,0]).map(v=>v/samples.length);for(let i=0;i<p.length;i+=4){let dist=Math.hypot(p[i]-avg[0],p[i+1]-avg[1],p[i+2]-avg[2]);if(dist<t)p[i+3]=0}x.putImageData(d,0,0);bgState.result=c;renderBgPreview();$('status').textContent='Background removed. Choose a background color and download.'}
function renderBgPreview(){if(!bgState)return;const c=$('bgResult');if(!c)return;const r=bgState.result||bgState.img;c.width=Math.min(760,r.width);c.height=Math.round(r.height*(c.width/r.width));const x=c.getContext('2d');const bg=$('bgColor')?.value;if(bg&&bg!=="transparent"){x.fillStyle=bg==="custom"?$('bgCustom').value:bg;x.fillRect(0,0,c.width,c.height)}x.drawImage(r,0,0,c.width,c.height)}
function downloadBgResult(){if(!bgState?.result){removeBackground();setTimeout(downloadBgResult,250);return}const bg=$('bgColor').value,c=document.createElement('canvas');c.width=bgState.result.width;c.height=bgState.result.height;const x=c.getContext('2d');if(bg!=="transparent"){x.fillStyle=bg==="custom"?$('bgCustom').value:bg;x.fillRect(0,0,c.width,c.height)}x.drawImage(bgState.result,0,0);saveCanvas(c,"image/png",1)}

async function buildWatermarkUI(){
  const f=files[0];const isImage=f.type.startsWith('image/');let preview='';if(isImage)preview=`<img id="wmImagePreview" src="${URL.createObjectURL(f)}" alt="Preview">`;else preview=`<canvas id="wmPdfPreview"></canvas>`;
  $("controls").innerHTML=`<div class="wm-editor"><div class="wm-preview">${preview}</div><div class="controls rich-controls"><label class="field wide">Watermark text <input id="wm" value="IMAGE 24"></label><label class="field">Opacity <input id="wmo" type="range" min="5" max="100" value="35" data-live-target="wmoVal"></label><span id="wmoVal" class="rangeval">35</span><label class="field">Size <input id="wmSize" type="number" value="32" min="8"></label><label class="field">Color <input id="wmColor" type="color" value="#ffffff"></label><label class="field">Rotation <input id="wmRot" type="number" value="-25" step="5"></label><label class="field">Position <select id="wmPos"><option value="center">Center</option><option value="top-left">Top left</option><option value="top-right">Top right</option><option value="bottom-left">Bottom left</option><option value="bottom-right">Bottom right</option></select></label><button class="primary" data-action="apply-watermark">Apply watermark & download</button></div></div>`;
  if(isImage){const img=await loadImageFile(f);window.__wmImage=img;renderWatermarkImage()}else{window.__wmPdfBytes=await f.arrayBuffer();renderWatermarkPdf()}
}
function wmPosition(w,h,tw,th){switch($('wmPos').value){case'top-left':return[30,30+th];case'top-right':return[w-30-tw,30+th];case'bottom-left':return[30,h-30];case'bottom-right':return[w-30-tw,h-30];default:return[(w-tw)/2,(h+th)/2]}}
function renderWatermarkImage(){const img=window.__wmImage,c=document.createElement('canvas');c.width=Math.min(900,img.width);c.height=Math.round(img.height*c.width/img.width);const x=c.getContext('2d');x.drawImage(img,0,0,c.width,c.height);drawWm(x,c.width,c.height);const holder=document.querySelector('.wm-preview');holder.innerHTML='';holder.appendChild(c);window.__wmCanvas=c}
function drawWm(x,w,h){const text=$('wm')?.value||'IMAGE 24',size=+$('wmSize')?.value||32,op=(+$('wmo')?.value||35)/100,rot=(+$('wmRot')?.value||0)*Math.PI/180;x.save();x.globalAlpha=op;x.fillStyle=$('wmColor')?.value||'#fff';x.font=`700 ${size}px Arial`;const tw=x.measureText(text).width,[px,py]=wmPosition(w,h,tw,size);x.translate(px+tw/2,py-size/2);x.rotate(rot);x.fillText(text,-tw/2,size/2);x.restore()}
async function renderWatermarkPdf(){try{const pdfjs=await ensurePDFJS(),pdf=await pdfjs.getDocument({data:new Uint8Array(window.__wmPdfBytes)}).promise,page=await pdf.getPage(1),vp=page.getViewport({scale:.75}),c=$('wmPdfPreview');c.width=vp.width;c.height=vp.height;await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;const x=c.getContext('2d');drawWm(x,c.width,c.height)}catch(e){console.error(e)}}
async function applyWatermark(){try{if(window.__wmImage){const img=window.__wmImage,c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);drawWm(x,c.width,c.height);saveCanvas(c,'image/png',1);$('status').textContent='Watermark applied to image.';return}let d=await PDFLib.PDFDocument.load(window.__wmPdfBytes),font=await d.embedFont(PDFLib.StandardFonts.HelveticaBold),text=$('wm').value||'IMAGE 24',op=(+$('wmo').value||35)/100,size=+$('wmSize').value||32,color=hexRgb($('wmColor').value),rot=+$('wmRot').value||0;for(const p of d.getPages()){const {width,height}=p.getSize(),tw=font.widthOfTextAtSize(text,size);let [x,y]=wmPosition(width,height,tw,size);p.drawText(text,{x,y:y-size/2,size,font,color:PDFLib.rgb(...color),opacity:op,rotate:PDFLib.degrees(rot)})}download(new Blob([await d.save()],{type:'application/pdf'}),'image24-watermarked.pdf');$('status').textContent='Watermark applied to PDF.'}catch(e){console.error(e);toast('Watermark failed. Try another file.')}}
function applyWmPreview(){if(window.__wmImage)renderWatermarkImage();else renderWatermarkPdf()}

async function buildOrganiseUI(){
  $("controls").innerHTML=`<div class="controls"><button class="primary" data-action="save-organised-pdf">Save organised PDF</button><button class="ghost" data-action="org-select-all">Restore all pages</button></div><div id="orgPreview" class="org-preview"></div><div class="tool-note">Drag pages to reorder. Rotate pages or remove pages before saving.</div>`;await renderOrganise();
}
async function renderOrganise(){try{const pdfjs=await ensurePDFJS(),pdf=await pdfjs.getDocument({data:await files[0].arrayBuffer()}).promise;if(!orgPages.length||orgPages.length!==pdf.numPages)orgPages=Array.from({length:pdf.numPages},(_,i)=>({n:i+1,rot:0}));const box=$('orgPreview');box.innerHTML='';for(const obj of orgPages){const page=await pdf.getPage(obj.n),vp=page.getViewport({scale:.55,rotation:obj.rot}),card=document.createElement('div');card.className='org-page';card.draggable=true;card.dataset.n=obj.n;const c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;const a=document.createElement('div');a.className='org-actions';a.innerHTML=`<b>Page ${obj.n}</b><button type="button" data-action="org-rotate" data-page="${obj.n}">↻ Rotate</button><button type="button" data-action="org-delete" data-page="${obj.n}">Delete</button>`;card.append(c,a);box.appendChild(card);card.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',String(obj.n)));card.addEventListener('dragover',e=>e.preventDefault());card.addEventListener('drop',e=>{e.preventDefault();const from=+e.dataTransfer.getData('text/plain'),to=obj.n;if(from===to)return;const fi=orgPages.findIndex(x=>x.n===from),ti=orgPages.findIndex(x=>x.n===to),it=orgPages.splice(fi,1)[0];orgPages.splice(ti,0,it);renderOrganise()})}$('status').textContent=`${orgPages.length} page(s) ready.`}catch(e){console.error(e);$('status').textContent='Could not preview this PDF.'}}
function orgRotate(n){const o=orgPages.find(x=>x.n===n);if(o)o.rot=(o.rot+90)%360;renderOrganise()}
function orgDelete(n){orgPages=orgPages.filter(x=>x.n!==n);if(!orgPages.length){toast('Keep at least one page.');return}renderOrganise()}
function orgSelectAll(){if(!files[0])return;orgPages=[];renderOrganise()}
async function saveOrganisedPDF(){try{if(!orgPages.length){toast('No pages selected.');return}const src=await PDFLib.PDFDocument.load(await files[0].arrayBuffer()),out=await PDFLib.PDFDocument.create();for(const o of orgPages){const [p]=await out.copyPages(src,[o.n-1]);p.setRotation(PDFLib.degrees(o.rot));out.addPage(p)}download(new Blob([await out.save()],{type:'application/pdf'}),'image24-organised.pdf');$('status').textContent='Organised PDF downloaded.'}catch(e){console.error(e);toast('Could not create organised PDF.')}}

async function buildEditUI(){
  $("controls").innerHTML=`<div class="edit-editor"><div class="edit-main"><div class="preview-title">PDF preview</div><div id="editPageCanvasWrap" class="edit-page-wrap"></div><div id="editThumbs" class="edit-thumbs"></div></div><div class="edit-tools"><div class="tool-section"><b>Editing tools</b><div class="controls"><button class="ghost" data-action="edit-mode" data-mode="text">Text</button><button class="ghost" data-action="edit-mode" data-mode="highlight">Highlight</button><button class="ghost" data-action="edit-mode" data-mode="whiteout">Whiteout</button><button class="ghost" data-action="edit-mode" data-mode="box">Box</button></div></div><label class="field wide">Text <input id="et" placeholder="Type text"></label><label class="field">Size <input id="eSize" type="number" value="18"></label><label class="field">Color <input id="eColor" type="color" value="#111111"></label><label class="field">Opacity <input id="eOpacity" type="range" min="10" max="100" value="70"></label><div class="controls"><button class="primary" data-action="edit-add-text">Add text</button><button class="ghost" data-action="edit-clear-page">Clear page changes</button></div><button class="primary wide-btn" data-action="edit-pdf">Save edited PDF</button><div class="tool-note">Select a page, choose a tool, then tap/click the PDF preview to place it. Text can also be entered with exact coordinates below.</div><div class="controls"><label class="field">X <input id="ex" type="number" value="50"></label><label class="field">Y <input id="ey" type="number" value="50"></label><label class="field">W <input id="ew" type="number" value="120"></label><label class="field">H <input id="eh" type="number" value="60"></label></div></div></div>`;
  await loadEditPdf();
}
async function loadEditPdf(){try{const pdfjs=await ensurePDFJS(),pdf=await pdfjs.getDocument({data:await files[0].arrayBuffer()}).promise;editPdfDoc=pdf;editPages=Array.from({length:pdf.numPages},(_,i)=>i+1);editSelected=1;editActions=[];await renderEditPage();renderEditThumbs();$('status').textContent=`${pdf.numPages} page(s) loaded. Click a page to edit.`}catch(e){console.error(e);$('status').textContent='Could not render this PDF.'}}
async function renderEditPage(){const page=await editPdfDoc.getPage(editSelected),vp=page.getViewport({scale:Math.min(1.05,820/page.getViewport({scale:1}).width)}),wrap=$('editPageCanvasWrap');wrap.innerHTML='';const c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;wrap.appendChild(c);await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;c.addEventListener('pointerdown',e=>{const r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;const base=page.getViewport({scale:1});$('ex').value=Math.round(px*base.width);$('ey').value=Math.round((1-py)*base.height);if(window.__editMode==='text')editAddText();else if(window.__editMode==='highlight')editAddShape('highlight',px*base.width,(1-py)*base.height,140,45);else if(window.__editMode==='whiteout')editAddShape('whiteout',px*base.width,(1-py)*base.height,160,55);else if(window.__editMode==='box')editAddShape('box',px*base.width,(1-py)*base.height,160,70)});renderEditActionsOverlay(c, page.getViewport({scale:1}), vp)}
function renderEditActionsOverlay(c,base,vp){const wrap=$('editPageCanvasWrap');for(const a of editActions.filter(x=>x.page===editSelected)){const el=document.createElement('div');el.className='edit-marker '+a.type;let x=a.x/base.width*vp.width,y=(1-a.y/base.height)*vp.height;if(a.type==='text')el.textContent=a.text;el.style.left=x+'px';el.style.top=Math.max(0,y-(a.h||a.size||20))+'px';el.style.width=(a.w||140)/base.width*vp.width+'px';el.style.height=(a.h||a.size||20)/base.height*vp.height+'px';wrap.appendChild(el)}}
function renderEditThumbs(){const box=$('editThumbs');box.innerHTML='';editPages.forEach(n=>{const b=document.createElement('button');b.className='edit-thumb'+(n===editSelected?' active':'');b.textContent='Page '+n;b.addEventListener('click',()=>{editSelected=n;renderEditPage();renderEditThumbs()});box.appendChild(b)})}
function editMode(m){window.__editMode=m;toast(m==='text'?'Tap the page where the text should go.':'Tap the page to place '+m+'.')}
function editAddText(){const text=$('et').value||'IMAGE 24';editActions.push({page:editSelected,type:'text',text,x:+$('ex').value||50,y:+$('ey').value||50,size:+$('eSize').value||18,color:$('eColor').value,opacity:+$('eOpacity').value/100,w:Math.max(80,text.length*10),h:+$('eSize').value||18});renderEditPage()}
function editAddShape(type,x,y,w,h){editActions.push({page:editSelected,type,x,y,w:+$('ew').value||w,h:+$('eh').value||h,color:type==='highlight'?'#ffe66d':type==='whiteout'?'#ffffff':'#ef4444',opacity:+$('eOpacity').value/100});renderEditPage()}
function editClearPage(){editActions=editActions.filter(a=>a.page!==editSelected);renderEditPage()}
async function editPDF(){try{const d=await PDFLib.PDFDocument.load(await files[0].arrayBuffer()),font=await d.embedFont(PDFLib.StandardFonts.Helvetica);for(const a of editActions){const p=d.getPages()[a.page-1];if(!p)continue;if(a.type==='text'){const [r,g,b]=hexRgb(a.color);p.drawText(a.text,{x:a.x,y:a.y,size:a.size,font,color:PDFLib.rgb(r,g,b),opacity:a.opacity})}else{const [r,g,b]=hexRgb(a.color);p.drawRectangle({x:a.x,y:a.y-a.h,width:a.w,height:a.h,color:PDFLib.rgb(r,g,b),opacity:a.opacity,borderColor:a.type==='box'?PDFLib.rgb(r,g,b):undefined,borderWidth:a.type==='box'?2:0})}}download(new Blob([await d.save()],{type:'application/pdf'}),'image24-edited.pdf');$('status').textContent='Edited PDF downloaded.'}catch(e){console.error(e);toast('Could not save the edited PDF.')}}

/* Live image watermark controls */
document.addEventListener('input',e=>{if(['wm','wmo','wmSize','wmColor','wmRot','wmPos'].includes(e.target.id)){if(window.__wmImage)renderWatermarkImage();else if(window.__wmPdfBytes)renderWatermarkPdf();}if(['bgColor','bgCustom'].includes(e.target.id))renderBgPreview();});

/* Allow the watermark tool to accept both PDF and image files. */
function showTool(id){
  active=id;files=[];orgPages=[];editActions=[];cropState=null;bgState=null;window.__wmImage=null;window.__wmPdfBytes=null;
  $("workspace").classList.add("show");let t=TOOLS.find(x=>x.id===id);if(t){$("wt").textContent=t.n;$("wh").textContent=(id==="watermarkpdf"?"PDF + image workflow":t.cat==="pdf"?"PDF workflow":"Image workflow")}
  $("file").value="";
  const acceptMap={
    mergepdf:".pdf,application/pdf",splitpdf:".pdf,application/pdf",compresspdf:".pdf,application/pdf",
    wordpdf:".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    pdfexcel:".pdf,application/pdf",pdfword:".pdf,application/pdf",jpgpdf:".jpg,.jpeg,image/jpeg",pdfjpg:".pdf,application/pdf",
    editpdf:".pdf,application/pdf",excelpdf:".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xls",
    watermarkpdf:".pdf,application/pdf,image/jpeg,image/png,image/webp",unlockpdf:".pdf,application/pdf",
    organisepdf:".pdf,application/pdf",resize:"image/*",crop:"image/*",removebg:"image/*",bulkresize:"image/*"
  };
  $("file").accept=acceptMap[id]||"";
  $("file").multiple=["mergepdf","jpgpdf","bulkresize"].includes(id);
  $("controls").innerHTML="";$("status").textContent="";
  const dz=$("drop"); if(dz && !dz.querySelector(".drop-note")){const n=document.createElement("div");n.className="drop-note";n.textContent="Maximum 50 MB per file. Browser-first tools process files locally whenever possible.";dz.querySelector("div")?.appendChild(n);}
}

/* IMAGE 24 V17 production guard: file validation + server-side usage reservation */
const I24_MAX_FILE_BYTES = 50 * 1024 * 1024;
const I24_MAX_IMAGE_PIXELS = 40_000_000;
const I24_MAX_PDF_PAGES_PREVIEW = 250;
const I24_MAX_BULK_FILES = 50;
function validateToolFiles(){
  if(!files.length)return false;
  if(files.length > I24_MAX_BULK_FILES){ toast(`Please select no more than ${I24_MAX_BULK_FILES} files at once.`); return false; }
  for(const f of files){ if(f.size > I24_MAX_FILE_BYTES){ toast(`${f.name} is larger than 50 MB.`); return false; } }
  const imageIds=new Set(['resize','crop','removebg','bulkresize']);
  const imageOk=f=>/^image\/(jpeg|png|webp|gif|bmp|avif)$/i.test(f.type)||/\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(f.name);
  const pdfOk=f=>f.type==='application/pdf'||/\.pdf$/i.test(f.name);
  const docxOk=f=>f.type==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'||/\.docx$/i.test(f.name);
  const xlsOk=f=>['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel'].includes(f.type)||/\.(xlsx?|xls)$/i.test(f.name);
  if(imageIds.has(active) && files.some(f=>!imageOk(f))){toast('Please choose a supported image file.');return false;}
  if(active==='jpgpdf' && files.some(f=>!/^image\/(jpeg|jpg)$/i.test(f.type)&&!/\.jpe?g$/i.test(f.name))){toast('JPG to PDF accepts JPG/JPEG files only.');return false;}
  if(['mergepdf','splitpdf','compresspdf','pdfexcel','pdfword','pdfjpg','editpdf','unlockpdf','organisepdf'].includes(active) && files.some(f=>!pdfOk(f))){toast('Please choose a PDF file.');return false;}
  if(active==='wordpdf' && files.some(f=>!docxOk(f))){toast('Word to PDF currently supports DOCX files.');return false;}
  if(active==='excelpdf' && files.some(f=>!xlsOk(f))){toast('Excel to PDF accepts XLS/XLSX files.');return false;}
  if(active==='watermarkpdf' && files.some(f=>!(pdfOk(f)||/^image\/(jpeg|png|webp)$/i.test(f.type)||/\.(jpe?g|png|webp)$/i.test(f.name)))){toast('Watermark accepts PDF, JPG, PNG or WebP files.');return false;}
  return true;
}
async function reserveToolJob(){
  if(!validateToolFiles())return null;
  try{
    const r=await fetch('/api/jobs/reserve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tool:active})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok){toast(j.error||'Daily limit reached.');return null;}
    if($('status'))$('status').textContent=`Processing… ${j.remaining} jobs remaining today.`;
    return j.jobId||null;
  }catch(e){toast('Usage service is unavailable. Please try again.');return null;}
}
async function completeToolJob(jobId,status){if(!jobId)return;try{await fetch('/api/jobs/complete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jobId,status})})}catch(e){}}
function guardToolAction(name){
  const original=window[name];
  if(typeof original!=='function')return;
  window[name]=async function(...args){
    try{await ensureToolLibraries(active);}catch(e){toast(e.message||'A required library could not be loaded.');return;}
    const jobId=await reserveToolJob();
    if(!jobId)return;
    try{const result=await original.apply(this,args);await completeToolJob(jobId,'completed');return result;}catch(e){await completeToolJob(jobId,'failed');throw e;}
  };
}
['imageRun','removeBackground','bulkResize','pdfMerge','pdfPages','pdfCompress','imagePDF','pdfToJpg','watermarkPDF','editPDF','unlockPDF','conversionRun','cropDownload','applyWatermark','saveOrganisedPDF'].forEach(guardToolAction);
