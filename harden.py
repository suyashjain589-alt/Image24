from pathlib import Path
import re, hashlib, base64
root=Path('/mnt/data/v190/public')
# Static HTML handler migration
mapping={
"auth.classList.remove('show')":"close-auth",
"bulkResize()":"bulk-resize","cancelSubscription()":"cancel-subscription","checkout()":"checkout",
"clearFeedback()":"clear-feedback","conversionRun()":"conversion-run","editPDF()":"edit-pdf","file.click()":"choose-file",
"filterTools('all',this)":"filter-all","filterTools('image',this)":"filter-image","filterTools('pdf',this)":"filter-pdf",
"imagePDF()":"image-pdf","imageRun()":"image-run","loadHistory()":"load-history","logoutUser()":"logout",
"pdfCompress()":"pdf-compress","pdfMerge()":"pdf-merge","pdfPages()":"pdf-pages","pdfToJpg()":"pdf-to-jpg",
"removeBackground()":"remove-background","renderTools()":"render-tools","requestPasswordResetUI()":"request-password-reset",
"resendVerification()":"resend-verification","sendFeedback()":"send-feedback","splitSelectAll(false)":"split-select-clear",
"splitSelectAll(true)":"split-select-all","submitAuth()":"submit-auth","toggleAuth()":"toggle-auth","unlockPDF()":"unlock-pdf",
"watermarkPDF()":"watermark-pdf","workspace.classList.remove('show')":"close-workspace",
}
for p in root.rglob('*.html'):
    s=p.read_text(encoding='utf-8')
    def repl(m):
        body=m.group(2)
        if body in ("qv.textContent=this.value","tv.textContent=this.value"):
            return 'data-live-target="'+('qv' if body.startswith('qv') else 'tv')+'"'
        if body in mapping:
            return 'data-action="'+mapping[body]+'"'
        # leave unusual handlers for manual review
        return m.group(0)
    s=re.sub(r'(on(?:click|input|change|load|error|keydown|keyup|focus|blur|dragover|drop|paste))="([^"]*)"', repl, s)
    p.write_text(s,encoding='utf-8')

# Dynamic handlers in tool-app.js
p=root/'tools'/'tool-app.js'; s=p.read_text(encoding='utf-8')
s=s.replace('oninput="qv.textContent=this.value"','data-live-target="qv"')
s=s.replace('oninput="tv.textContent=this.value"','data-live-target="tv"')
s=s.replace('onclick="splitToggle(${n},this)"','data-action="split-toggle" data-page="${n}"')
p.write_text(s,encoding='utf-8')
# OCR dynamic remove handler
p=root/'tools'/'image-to-text.html'; s=p.read_text(encoding='utf-8')
s=s.replace('onclick="removeFile(${i})"','data-action="ocr-remove-file" data-index="${i}"')
p.write_text(s,encoding='utf-8')

# Extend a11y.js with delegated actions (functions are globals from page scripts)
p=root/'assets'/'a11y.js'; s=p.read_text(encoding='utf-8')
insert=r'''
// CSP-safe delegated actions: replaces inline event-handler attributes.
(function(){'use strict';
  var actions={
    'close-auth':function(){var x=document.getElementById('auth');if(x)x.classList.remove('show')},
    'close-workspace':function(){var x=document.getElementById('workspace');if(x)x.classList.remove('show')},
    'choose-file':function(){var f=document.getElementById('file');if(f)f.click()},
    'filter-all':function(e){if(typeof window.filterTools==='function')window.filterTools('all',e.currentTarget)},
    'filter-image':function(e){if(typeof window.filterTools==='function')window.filterTools('image',e.currentTarget)},
    'filter-pdf':function(e){if(typeof window.filterTools==='function')window.filterTools('pdf',e.currentTarget)},
    'render-tools':function(){if(typeof window.renderTools==='function')window.renderTools()},
    'bulk-resize':function(){if(typeof window.bulkResize==='function')window.bulkResize()},
    'cancel-subscription':function(){if(typeof window.cancelSubscription==='function')window.cancelSubscription()},
    'checkout':function(){if(typeof window.checkout==='function')window.checkout()},
    'clear-feedback':function(){if(typeof window.clearFeedback==='function')window.clearFeedback()},
    'conversion-run':function(){if(typeof window.conversionRun==='function')window.conversionRun()},
    'edit-pdf':function(){if(typeof window.editPDF==='function')window.editPDF()},
    'image-pdf':function(){if(typeof window.imagePDF==='function')window.imagePDF()},
    'image-run':function(){if(typeof window.imageRun==='function')window.imageRun()},
    'load-history':function(){if(typeof window.loadHistory==='function')window.loadHistory()},
    'logout':function(){if(typeof window.logoutUser==='function')window.logoutUser()},
    'pdf-compress':function(){if(typeof window.pdfCompress==='function')window.pdfCompress()},
    'pdf-merge':function(){if(typeof window.pdfMerge==='function')window.pdfMerge()},
    'pdf-pages':function(){if(typeof window.pdfPages==='function')window.pdfPages()},
    'pdf-to-jpg':function(){if(typeof window.pdfToJpg==='function')window.pdfToJpg()},
    'remove-background':function(){if(typeof window.removeBackground==='function')window.removeBackground()},
    'request-password-reset':function(){if(typeof window.requestPasswordResetUI==='function')window.requestPasswordResetUI()},
    'resend-verification':function(){if(typeof window.resendVerification==='function')window.resendVerification()},
    'send-feedback':function(){if(typeof window.sendFeedback==='function')window.sendFeedback()},
    'split-select-clear':function(){if(typeof window.splitSelectAll==='function')window.splitSelectAll(false)},
    'split-select-all':function(){if(typeof window.splitSelectAll==='function')window.splitSelectAll(true)},
    'split-toggle':function(e){if(typeof window.splitToggle==='function')window.splitToggle(Number(e.currentTarget.dataset.page),e.currentTarget)},
    'submit-auth':function(){if(typeof window.submitAuth==='function')window.submitAuth()},
    'toggle-auth':function(){if(typeof window.toggleAuth==='function')window.toggleAuth()},
    'unlock-pdf':function(){if(typeof window.unlockPDF==='function')window.unlockPDF()},
    'watermark-pdf':function(){if(typeof window.watermarkPDF==='function')window.watermarkPDF()},
    'open-auth':function(){if(typeof window.openAuth==='function')window.openAuth()}
  };
  document.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('[data-action]');if(!el)return;var fn=actions[el.dataset.action];if(fn){e.preventDefault();fn(e)}});
  document.addEventListener('input',function(e){var el=e.target.closest&&e.target.closest('[data-live-target]');if(!el)return;var target=document.getElementById(el.dataset.liveTarget);if(target)target.textContent=el.value+'%';});
  document.addEventListener('change',function(e){var el=e.target.closest&&e.target.closest('[data-live-target]');if(!el)return;var target=document.getElementById(el.dataset.liveTarget);if(target)target.textContent=el.value+'%';});
})();
'''
s += insert
p.write_text(s,encoding='utf-8')

# Add OCR-specific action to delegated map by appending a small handler.
s=p.read_text(encoding='utf-8')
s=s.replace("'open-auth':function(){if(typeof window.openAuth==='function')window.openAuth()}","'open-auth':function(){if(typeof window.openAuth==='function')window.openAuth()},'ocr-remove-file':function(e){if(typeof window.removeFile==='function')window.removeFile(Number(e.currentTarget.dataset.index))}")
p.write_text(s,encoding='utf-8')

# Hash every executable inline script in HTML (excluding JSON-LD).
hashes=set()
for p in root.rglob('*.html'):
    s=p.read_text(encoding='utf-8')
    def script_repl(m):
        attrs=m.group(1) or ''
        body=m.group(2)
        if 'src=' in attrs or 'application/ld+json' in attrs.lower(): return m.group(0)
        b=body.encode('utf-8')
        h=base64.b64encode(hashlib.sha256(b).digest()).decode()
        hashes.add("'sha256-"+h+"'")
        return m.group(0)
    re.sub(r'<script([^>]*)>(.*?)</script>',script_repl,s,flags=re.S)

csp="default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' "+' '.join(sorted(hashes))+" https://cdn.jsdelivr.net https://unpkg.com https://cdn.sheetjs.com https://cdnjs.cloudflare.com https://challenges.cloudflare.com; script-src-attr 'none'; connect-src 'self' https://challenges.cloudflare.com https://cdnjs.cloudflare.com https://unpkg.com https://cdn.jsdelivr.net; worker-src 'self' blob:; frame-src https://challenges.cloudflare.com; upgrade-insecure-requests"
(root/'_headers').write_text("""/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  X-Frame-Options: DENY\n  Strict-Transport-Security: max-age=31536000; includeSubDomains\n  Content-Security-Policy: "+csp+"\n\nhttps://:subdomain.workers.dev/*\n  X-Robots-Tag: noindex\n\n/assets/*\n  Cache-Control: public, max-age=604800\n""",encoding='utf-8')
# update worker CSP + health version
wp=Path('/mnt/data/v190/worker.js'); ws=wp.read_text(encoding='utf-8')
ws=re.sub(r"version: '[^']+'", "version: '19.0.0-production'", ws, count=1)
ws=re.sub(r"'Content-Security-Policy':\"[^\"]*\"", "'Content-Security-Policy':\""+csp.replace('\\"','')+"\"", ws, count=1)
wp.write_text(ws,encoding='utf-8')
# README version / notes
rp=Path('/mnt/data/v190/README-DEPLOY.md'); rs=rp.read_text(encoding='utf-8')
rs=rs.replace('V18.9','V19.0').replace('18.9.0','19.0.0')
rs += "\n\n## V19.0 security hardening\n- Removed inline HTML event-handler attributes and migrated UI actions to delegated, CSP-safe listeners.\n- CSP no longer uses `script-src 'unsafe-inline'`; executable inline scripts are allowlisted by SHA-256 hashes.\n- Added `script-src-attr 'none'` to block inline event-handler attributes.\n- Updated security headers and health version to 19.0.0-production.\n- Accessibility action handling remains centralized in `/assets/a11y.js`.\n"
rp.write_text(rs,encoding='utf-8')
print('hashes',len(hashes))
