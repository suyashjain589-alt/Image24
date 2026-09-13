from pathlib import Path
import re, hashlib, base64
root=Path('/mnt/data/v190/public')
p=root/'tools'/'tool-app.js'; s=p.read_text(encoding='utf-8')
# Simple function-call inline handlers -> data-action
pairs={
'imageRun()':'image-run','removeBackground()':'remove-background','bulkResize()':'bulk-resize','pdfMerge()':'pdf-merge','pdfPages()':'pdf-pages','pdfCompress()':'pdf-compress','imagePDF()':'image-pdf','pdfToJpg()':'pdf-to-jpg','watermarkPDF()':'watermark-pdf','editPDF()':'edit-pdf','unlockPDF()':'unlock-pdf','conversionRun()':'conversion-run','cropDownload()':'crop-download','downloadBgResult()':'download-bg-result','applyWatermark()':'apply-watermark','saveOrganisedPDF()':'save-organised-pdf','orgSelectAll()':'org-select-all','editAddText()':'edit-add-text','editClearPage()':'edit-clear-page','editPDF()':'edit-pdf',
'applyResizePreset()':'apply-resize-preset','resizeStateUpdate()':'resize-state-update','applyCropPreset()':'apply-crop-preset'
}
for call,action in pairs.items(): s=s.replace(f'onclick="{call}"',f'data-action="{action}"').replace(f'onchange="{call}"',f'data-action="{action}"').replace(f'oninput="{call}"',f'data-action="{action}"')
s=s.replace('oninput="wmoVal.textContent=this.value"','data-live-target="wmoVal"')
s=s.replace('onclick="orgRotate(${obj.n})"','data-action="org-rotate" data-page="${obj.n}"')
s=s.replace('onclick="orgDelete(${obj.n})"','data-action="org-delete" data-page="${obj.n}"')
s=s.replace("onclick=\"editMode('text')\"","data-action=\"edit-mode\" data-mode=\"text\"")
s=s.replace("onclick=\"editMode('highlight')\"","data-action=\"edit-mode\" data-mode=\"highlight\"")
s=s.replace("onclick=\"editMode('whiteout')\"","data-action=\"edit-mode\" data-mode=\"whiteout\"")
s=s.replace("onclick=\"editMode('box')\"","data-action=\"edit-mode\" data-mode=\"box\"")
p.write_text(s,encoding='utf-8')

# append additional actions before delegated listener closure marker
p=root/'assets'/'a11y.js'; s=p.read_text(encoding='utf-8')
old="'open-auth':function(){if(typeof window.openAuth==='function')window.openAuth()},'ocr-remove-file':function(e){if(typeof window.removeFile==='function')window.removeFile(Number(e.currentTarget.dataset.index))}"
new="'open-auth':function(){if(typeof window.openAuth==='function')window.openAuth()},'ocr-remove-file':function(e){if(typeof window.removeFile==='function')window.removeFile(Number(e.currentTarget.dataset.index))},'crop-download':function(){if(typeof window.cropDownload==='function')window.cropDownload()},'download-bg-result':function(){if(typeof window.downloadBgResult==='function')window.downloadBgResult()},'apply-watermark':function(){if(typeof window.applyWatermark==='function')window.applyWatermark()},'save-organised-pdf':function(){if(typeof window.saveOrganisedPDF==='function')window.saveOrganisedPDF()},'org-select-all':function(){if(typeof window.orgSelectAll==='function')window.orgSelectAll()},'org-rotate':function(e){if(typeof window.orgRotate==='function')window.orgRotate(Number(e.currentTarget.dataset.page))},'org-delete':function(e){if(typeof window.orgDelete==='function')window.orgDelete(Number(e.currentTarget.dataset.page))},'edit-mode':function(e){if(typeof window.editMode==='function')window.editMode(e.currentTarget.dataset.mode)},'edit-add-text':function(){if(typeof window.editAddText==='function')window.editAddText()},'edit-clear-page':function(){if(typeof window.editClearPage==='function')window.editClearPage()},'apply-resize-preset':function(){if(typeof window.applyResizePreset==='function')window.applyResizePreset()},'resize-state-update':function(){if(typeof window.resizeStateUpdate==='function')window.resizeStateUpdate()},'apply-crop-preset':function(){if(typeof window.applyCropPreset==='function')window.applyCropPreset()}"
s=s.replace(old,new)
p.write_text(s,encoding='utf-8')

# dynamic split handler in index inline JS
p=root/'index.html'; s=p.read_text(encoding='utf-8').replace('onclick="splitToggle(${n},this)"','data-action="split-toggle" data-page="${n}"'); p.write_text(s,encoding='utf-8')

# Rebuild CSP hashes from current HTML executable inline scripts
hashes=set()
for p in root.rglob('*.html'):
 s=p.read_text(encoding='utf-8')
 for m in re.finditer(r'<script([^>]*)>(.*?)</script>',s,re.S):
  attrs,body=m.group(1),m.group(2)
  if 'src=' in attrs or 'application/ld+json' in attrs.lower(): continue
  h=base64.b64encode(hashlib.sha256(body.encode()).digest()).decode(); hashes.add("'sha256-"+h+"'")
csp="default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' "+' '.join(sorted(hashes))+" https://cdn.jsdelivr.net https://unpkg.com https://cdn.sheetjs.com https://cdnjs.cloudflare.com https://challenges.cloudflare.com; script-src-attr 'none'; connect-src 'self' https://challenges.cloudflare.com https://cdnjs.cloudflare.com https://unpkg.com https://cdn.jsdelivr.net; worker-src 'self' blob:; frame-src https://challenges.cloudflare.com; upgrade-insecure-requests"
(root/'_headers').write_text("""/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  X-Frame-Options: DENY\n  Strict-Transport-Security: max-age=31536000; includeSubDomains\n  Content-Security-Policy: "+csp+"\n\nhttps://:subdomain.workers.dev/*\n  X-Robots-Tag: noindex\n\n/assets/*\n  Cache-Control: public, max-age=604800\n""",encoding='utf-8')
wp=Path('/mnt/data/v190/worker.js'); ws=wp.read_text(encoding='utf-8')
ws=ws.replace("version: '18.7.0-production'","version: '19.0.0-production'")
# replace whole CSP property line safely
ws=re.sub(r"'Content-Security-Policy':\".*?\"", "'Content-Security-Policy':\""+csp+"\"", ws, count=1)
wp.write_text(ws,encoding='utf-8')
print('hashes',len(hashes))
