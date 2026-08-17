// popup.js v3.3 - Status Check & Reliable Execution

document.addEventListener('DOMContentLoaded', async () => {
  const statusBadge = document.getElementById('statusBadge');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const scrapeBtn = document.getElementById('scrapeBtn');

  // Check API Key
  const storage = await new Promise(resolve => chrome.storage.local.get(['geminiApiKey'], resolve));
  const hasKey = !!storage?.geminiApiKey;

  // Check Current Tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || '';
  const isOliveYoung = /oliveyoung\.co\.kr|oliveyoung\.com/i.test(url);

  // Update Status Indicator (Chấm Xanh / Chấm Đỏ)
  if (hasKey && isOliveYoung) {
    statusBadge.className = 'status-badge status-online';
    statusDot.className = 'dot dot-green';
    statusText.textContent = 'Đang hoạt động';
    scrapeBtn.disabled = false;
  } else if (!hasKey) {
    statusBadge.className = 'status-badge status-offline';
    statusDot.className = 'dot dot-red';
    statusText.textContent = 'Thiếu API Key';
    scrapeBtn.disabled = false; // Cho phép bấm để báo lỗi hướng dẫn
  } else {
    statusBadge.className = 'status-badge status-offline';
    statusDot.className = 'dot dot-red';
    statusText.textContent = 'Chưa vào Olive Young';
    scrapeBtn.disabled = false;
  }

  // Click Scrape Event
  scrapeBtn.addEventListener('click', async () => {
    if (!hasKey) {
      alert("⚠️ Bạn chưa cài đặt Gemini API Key!\nVui lòng bấm vào '⚙️ Cài đặt API Key Gemini' bên dưới để dán key.");
      chrome.runtime.openOptionsPage();
      return;
    }

    if (!isOliveYoung) {
      alert("⚠️ Vui lòng mở trang chi tiết sản phẩm trên Olive Young (oliveyoung.co.kr hoặc oliveyoung.com) trước khi bấm cào!");
      return;
    }

    // Inject content.js để đảm bảo script luôn chạy
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    } catch (e) {
      console.warn("Scripting injection note:", e);
    }

    // Gửi lệnh cào
    chrome.tabs.sendMessage(tab.id, { action: "SCRAPE_PRODUCT" }, (res) => {
      if (chrome.runtime.lastError) {
        console.warn("Message sent with notice:", chrome.runtime.lastError);
      }
    });

    window.close();
  });

  document.getElementById('optionsLink').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
});
