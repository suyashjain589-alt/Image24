
(function(){'use strict';
function ready(){
  if(!document.body) return;
  if(!document.querySelector('.skip-link')){var s=document.createElement('a');s.className='skip-link';s.href='#main-content';s.textContent='Skip to main content';document.body.prepend(s)}
  var main=document.querySelector('main'); if(main && !main.id) main.id='main-content';
  document.querySelectorAll('[data-action]').forEach(function(el){var a=el.getAttribute('data-action');el.addEventListener('click',function(){var map={
'choose-file':function(){var f=document.getElementById('file');if(f)f.click()},'scroll-tools':function(){var x=document.getElementById('tools');if(x)x.scrollIntoView({behavior:'smooth'})},'scroll-pricing':function(){var x=document.getElementById('pricing');if(x)x.scrollIntoView({behavior:'smooth'})},'scroll-about':function(){var x=document.getElementById('about-tools');if(x)x.scrollIntoView({behavior:'smooth'})},'scroll-guides':function(){var x=document.getElementById('guides');if(x)x.scrollIntoView({behavior:'smooth'})},'scroll-feedback':function(){var x=document.getElementById('feedback');if(x)x.scrollIntoView({behavior:'smooth'})},'open-auth':function(){if(typeof window.openAuth==='function')window.openAuth()},'mfa-setup':function(){if(typeof window.mfaSetup==='function')window.mfaSetup()},'mfa-disable':function(){if(typeof window.mfaDisable==='function')window.mfaDisable()},'ocr-remove-file':function(e){if(typeof window.removeFile==='function')window.removeFile(Number(e.currentTarget.dataset.index))},'crop-download':function(){if(typeof window.cropDownload==='function')window.cropDownload()},'download-bg-result':function(){if(typeof window.downloadBgResult==='function')window.downloadBgResult()},'apply-watermark':function(){if(typeof window.applyWatermark==='function')window.applyWatermark()},'save-organised-pdf':function(){if(typeof window.saveOrganisedPDF==='function')window.saveOrganisedPDF()},'org-select-all':function(){if(typeof window.orgSelectAll==='function')window.orgSelectAll()},'org-rotate':function(e){if(typeof window.orgRotate==='function')window.orgRotate(Number(e.currentTarget.dataset.page))},'org-delete':function(e){if(typeof window.orgDelete==='function')window.orgDelete(Number(e.currentTarget.dataset.page))},'edit-mode':function(e){if(typeof window.editMode==='function')window.editMode(e.currentTarget.dataset.mode)},'edit-add-text':function(){if(typeof window.editAddText==='function')window.editAddText()},'edit-clear-page':function(){if(typeof window.editClearPage==='function')window.editClearPage()},'apply-resize-preset':function(){if(typeof window.applyResizePreset==='function')window.applyResizePreset()},'resize-state-update':function(){if(typeof window.resizeStateUpdate==='function')window.resizeStateUpdate()},'apply-crop-preset':function(){if(typeof window.applyCropPreset==='function')window.applyCropPreset()}};if(map[a])map[a]();});});
  document.querySelectorAll('button').forEach(function(b){ if(!b.getAttribute('type')) b.setAttribute('type','button'); });
  document.querySelectorAll('input[placeholder]').forEach(function(i){ if(!i.getAttribute('aria-label') && !i.id) i.setAttribute('aria-label',i.getAttribute('placeholder')); });
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ready); else ready();
})();

// Modal accessibility: Escape-to-close, focus management, and a lightweight focus trap.
(function(){
  var lastFocus=null;
  function getModal(){return document.getElementById('auth')}
  document.addEventListener('click',function(e){
    var auth=e.target.closest && e.target.closest('#account');
    if(auth){lastFocus=document.activeElement;setTimeout(function(){var x=document.getElementById('email')||document.querySelector('#auth button');if(x)x.focus()},30)}
  });
  document.addEventListener('keydown',function(e){
    var modal=getModal(); if(!modal || !modal.classList.contains('show')) return;
    if(e.key==='Escape'){modal.classList.remove('show');if(lastFocus&&lastFocus.focus)lastFocus.focus();return}
    if(e.key!=='Tab') return;
    var els=modal.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])');
    if(!els.length)return; var first=els[0],last=els[els.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });
})();

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
    'open-auth':function(){if(typeof window.openAuth==='function')window.openAuth()},'mfa-setup':function(){if(typeof window.mfaSetup==='function')window.mfaSetup()},'mfa-disable':function(){if(typeof window.mfaDisable==='function')window.mfaDisable()},'ocr-remove-file':function(e){if(typeof window.removeFile==='function')window.removeFile(Number(e.currentTarget.dataset.index))},'crop-download':function(){if(typeof window.cropDownload==='function')window.cropDownload()},'download-bg-result':function(){if(typeof window.downloadBgResult==='function')window.downloadBgResult()},'apply-watermark':function(){if(typeof window.applyWatermark==='function')window.applyWatermark()},'save-organised-pdf':function(){if(typeof window.saveOrganisedPDF==='function')window.saveOrganisedPDF()},'org-select-all':function(){if(typeof window.orgSelectAll==='function')window.orgSelectAll()},'org-rotate':function(e){if(typeof window.orgRotate==='function')window.orgRotate(Number(e.currentTarget.dataset.page))},'org-delete':function(e){if(typeof window.orgDelete==='function')window.orgDelete(Number(e.currentTarget.dataset.page))},'edit-mode':function(e){if(typeof window.editMode==='function')window.editMode(e.currentTarget.dataset.mode)},'edit-add-text':function(){if(typeof window.editAddText==='function')window.editAddText()},'edit-clear-page':function(){if(typeof window.editClearPage==='function')window.editClearPage()},'apply-resize-preset':function(){if(typeof window.applyResizePreset==='function')window.applyResizePreset()},'resize-state-update':function(){if(typeof window.resizeStateUpdate==='function')window.resizeStateUpdate()},'apply-crop-preset':function(){if(typeof window.applyCropPreset==='function')window.applyCropPreset()}
  };
  document.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('[data-action]');if(!el)return;var fn=actions[el.dataset.action];if(fn){e.preventDefault();fn(e)}});
  document.addEventListener('input',function(e){var el=e.target.closest&&e.target.closest('[data-live-target]');if(!el)return;var target=document.getElementById(el.dataset.liveTarget);if(target)target.textContent=el.value+'%';});
  document.addEventListener('change',function(e){var el=e.target.closest&&e.target.closest('[data-live-target]');if(!el)return;var target=document.getElementById(el.dataset.liveTarget);if(target)target.textContent=el.value+'%';});
})();
