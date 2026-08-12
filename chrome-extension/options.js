document.addEventListener('DOMContentLoaded', () => {
  // Load saved key
  chrome.storage.local.get(['geminiApiKey'], (result) => {
    if (result.geminiApiKey) {
      document.getElementById('apiKey').value = result.geminiApiKey;
    }
  });

  // Save key
  document.getElementById('saveBtn').addEventListener('click', () => {
    const key = document.getElementById('apiKey').value.trim();
    if (!key) {
      alert('Vui lòng nhập API Key!');
      return;
    }
    chrome.storage.local.set({ geminiApiKey: key }, () => {
      const status = document.getElementById('status');
      status.textContent = 'Đã lưu API Key thành công!';
      setTimeout(() => { status.textContent = ''; }, 3000);
    });
  });
});
