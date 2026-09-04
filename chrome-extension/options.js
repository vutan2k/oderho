// options.js - Configuration Manager v21.0 DEV

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const selectedModelSelect = document.getElementById('selectedModel');
  const devModeDefaultCheckbox = document.getElementById('devModeDefault');
  const debugLoggingCheckbox = document.getElementById('debugLogging');
  const maxReviewImagesSelect = document.getElementById('maxReviewImages');
  const saveBtn = document.getElementById('saveBtn');
  const statusEl = document.getElementById('status');

  // Load saved preferences
  chrome.storage.local.get([
    'geminiApiKey',
    'selectedModel',
    'devMode',
    'debugLogging',
    'maxReviewImages'
  ], (result) => {
    if (result.geminiApiKey && apiKeyInput) {
      apiKeyInput.value = result.geminiApiKey;
    }
    if (result.selectedModel && selectedModelSelect) {
      selectedModelSelect.value = result.selectedModel;
    }
    if (devModeDefaultCheckbox) {
      devModeDefaultCheckbox.checked = !!result.devMode;
    }
    if (debugLoggingCheckbox) {
      debugLoggingCheckbox.checked = !!result.debugLogging;
    }
    if (result.maxReviewImages && maxReviewImagesSelect) {
      maxReviewImagesSelect.value = String(result.maxReviewImages);
    }
  });

  // Save preferences
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const key = apiKeyInput ? apiKeyInput.value.trim() : '';
      const model = selectedModelSelect ? selectedModelSelect.value : 'auto';
      const devMode = devModeDefaultCheckbox ? devModeDefaultCheckbox.checked : false;
      const debugLogging = debugLoggingCheckbox ? debugLoggingCheckbox.checked : false;
      const maxReviewImages = maxReviewImagesSelect ? parseInt(maxReviewImagesSelect.value, 10) : 50;

      if (!key) {
        alert('Vui lòng nhập Gemini API Key!');
        return;
      }

      chrome.storage.local.set({
        geminiApiKey: key,
        selectedModel: model,
        devMode: devMode,
        debugLogging: debugLogging,
        maxReviewImages: maxReviewImages
      }, () => {
        if (statusEl) {
          statusEl.textContent = '✓ Đã lưu toàn bộ cài đặt thành công!';
          setTimeout(() => { statusEl.textContent = ''; }, 3000);
        }
      });
    });
  }
});
