// popup.js - Single Product Scraper Controller

document.addEventListener('DOMContentLoaded', async () => {
  const statusBadge = document.getElementById('statusBadge');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const scrapeBtn = document.getElementById('scrapeBtn');
  const resetCacheBtn = document.getElementById('resetCacheBtn');
  const progressBox = document.getElementById('progressBox');
  const progressTitle = document.getElementById('progressTitle');
  const progressDetail = document.getElementById('progressDetail');

  const modelSelect = document.getElementById('modelSelect');

  // Đọc Cấu hình Model AI đã lưu
  const storage = await new Promise(resolve => chrome.storage.local.get(['geminiApiKey', 'selectedModel'], resolve));
  const hasKey = !!storage?.geminiApiKey;

  if (modelSelect) {
    if (storage?.selectedModel) {
      modelSelect.value = storage.selectedModel;
    }
    modelSelect.addEventListener('change', (e) => {
      const chosen = e.target.value;
      chrome.storage.local.set({ selectedModel: chosen }, () => {
        console.log("⚡ [Popup] Đã chọn mô hình Gemini AI:", chosen);
      });
    });
  }

  // Check Current Tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || '';
  const isOliveYoung = /oliveyoung\.co\.kr|oliveyoung\.com/i.test(url);

  // Update Status Indicator
  if (hasKey && isOliveYoung) {
    statusBadge.className = 'status-badge status-online';
    statusDot.className = 'dot dot-green';
    statusText.textContent = 'Sẵn sàng cào sản phẩm';
  } else if (!hasKey) {
    statusBadge.className = 'status-badge status-offline';
    statusDot.className = 'dot dot-red';
    statusText.textContent = 'Thiếu API Key';
  } else {
    statusBadge.className = 'status-badge status-offline';
    statusDot.className = 'dot dot-red';
    statusText.textContent = 'Chưa vào Olive Young';
  }

  // Click Scrape Current Product Event
  if (scrapeBtn) {
    scrapeBtn.addEventListener('click', async () => {
      if (!hasKey) {
        alert("Bạn chưa cài đặt Gemini API Key!\nVui lòng bấm vào 'Cài đặt API Key Gemini' bên dưới.");
        chrome.runtime.openOptionsPage();
        return;
      }

      if (!isOliveYoung) {
        alert("Vui lòng mở trang sản phẩm chi tiết trên Olive Young (oliveyoung.co.kr) trước khi bấm cào!");
        return;
      }

      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      } catch (e) {
        console.warn("Scripting injection note:", e);
      }

      if (progressBox) {
        progressBox.style.display = 'block';
        progressTitle.textContent = 'Đang bóc tách Album HD, Infographic & Đánh giá...';
        progressDetail.textContent = 'Hệ thống đang bóc tách trọn vẹn thông số kỹ thuật, thành phần và truyền trực tiếp về Web Admin.';
      }

      chrome.tabs.sendMessage(tab.id, { action: "SCRAPE_PRODUCT" }, (_res) => {});
      setTimeout(() => window.close(), 1200);
    });
  }

  // Click Reset Cache Event
  if (resetCacheBtn) {
    resetCacheBtn.addEventListener('click', () => {
      chrome.storage.local.set({ scrapedGoodsList: [] }, () => {
        alert('Đã làm sạch bộ nhớ đệm thành công!');
      });
    });
  }

  const optionsLink = document.getElementById('optionsLink');
  if (optionsLink) {
    optionsLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
  }
});
