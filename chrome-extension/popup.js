// popup.js v4.5 - Automatic Top 50 Ranking Scraper with Deduplication

document.addEventListener('DOMContentLoaded', async () => {
  const statusBadge = document.getElementById('statusBadge');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const scrapeBtn = document.getElementById('scrapeBtn');
  const autoScrapeBtn = document.getElementById('autoScrapeBtn');
  const progressBox = document.getElementById('progressBox');
  const progressTitle = document.getElementById('progressTitle');
  const progressDetail = document.getElementById('progressDetail');

  // Check API Key
  const storage = await new Promise(resolve => chrome.storage.local.get(['geminiApiKey', 'scrapedGoodsList'], resolve));
  const hasKey = !!storage?.geminiApiKey;
  const scrapedGoodsList = new Set(storage?.scrapedGoodsList || []);

  // Check Current Tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || '';
  const isOliveYoung = /oliveyoung\.co\.kr|oliveyoung\.com/i.test(url);

  // Update Status Indicator
  if (hasKey && isOliveYoung) {
    statusBadge.className = 'status-badge status-online';
    statusDot.className = 'dot dot-green';
    statusText.textContent = 'Đang hoạt động';
  } else if (!hasKey) {
    statusBadge.className = 'status-badge status-offline';
    statusDot.className = 'dot dot-red';
    statusText.textContent = 'Thiếu API Key';
  } else {
    statusBadge.className = 'status-badge status-offline';
    statusDot.className = 'dot dot-red';
    statusText.textContent = 'Chưa vào Olive Young';
  }

  // Click Scrape Current Page Event
  scrapeBtn.addEventListener('click', async () => {
    if (!hasKey) {
      alert("⚠️ Bạn chưa cài đặt Gemini API Key!\nVui lòng bấm vào '⚙️ Cài đặt API Key Gemini' bên dưới.");
      chrome.runtime.openOptionsPage();
      return;
    }

    if (!isOliveYoung) {
      alert("⚠️ Vui lòng mở trang sản phẩm trên Olive Young (oliveyoung.co.kr) trước khi bấm cào!");
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

    chrome.tabs.sendMessage(tab.id, { action: "SCRAPE_PRODUCT" }, (_res) => {});
    window.close();
  });

  const stopAutoScrapeBtn = document.getElementById('stopAutoScrapeBtn');

  // Sync live background progress if running
  const updateProgressFromStorage = async () => {
    const res = await new Promise(resolve => chrome.storage.local.get(['autoScrapeStatus'], resolve));
    const status = res?.autoScrapeStatus;
    if (status && status.isRunning) {
      progressBox.style.display = 'block';
      progressTitle.textContent = status.message || '🔄 Đang cào ngầm sản phẩm...';
      progressDetail.textContent = '⚡ Tiến trình đang chạy 100% trong background. Bạn có thể bấm nút đỏ bên trên để dừng bất cứ lúc nào!';
      if (stopAutoScrapeBtn) stopAutoScrapeBtn.style.display = 'block';
      if (autoScrapeBtn) autoScrapeBtn.style.display = 'none';
    } else {
      if (stopAutoScrapeBtn) stopAutoScrapeBtn.style.display = 'none';
      if (autoScrapeBtn) autoScrapeBtn.style.display = 'flex';
      if (status && (status.step === 'DONE' || status.step === 'STOPPED')) {
        progressBox.style.display = 'block';
        progressTitle.textContent = status.message || '🎉 Đã hoàn tất!';
        progressDetail.textContent = 'Dữ liệu đã được đồng bộ lên Admin.';
      }
    }
  };

  updateProgressFromStorage();
  setInterval(updateProgressFromStorage, 1500);

  const playwrightAiBtn = document.getElementById('playwrightAiBtn');

  // Click Playwright AI 1-Click Button Event
  if (playwrightAiBtn) {
    playwrightAiBtn.addEventListener('click', async () => {
      if (!hasKey) {
        alert("⚠️ Vui lòng cài Gemini API Key trước khi kích hoạt Playwright AI!");
        chrome.runtime.openOptionsPage();
        return;
      }

      progressBox.style.display = 'block';
      progressTitle.textContent = '🎭 Playwright AI Đang Hoạt Động (1-Click)!';
      progressDetail.textContent = 'Trình duyệt đang tự động bóc tách sản phẩm, soi ảnh HD & đẩy về trang Web Admin...';

      chrome.runtime.sendMessage({ action: "START_AUTO_SCRAPE" }, (response) => {
        if (chrome.runtime.lastError) console.warn(chrome.runtime.lastError);
      });
    });
  }

  // Click Auto-Scrape Top 50 Ranking Event (100% Background Runner)
  autoScrapeBtn.addEventListener('click', async () => {
    if (!hasKey) {
      alert("⚠️ Vui lòng cài Gemini API Key trước khi cào tự động!");
      chrome.runtime.openOptionsPage();
      return;
    }

    progressBox.style.display = 'block';
    progressTitle.textContent = '🚀 Đã kích hoạt Tiến Trình Cào Ngầm 100%!';
    progressDetail.textContent = 'Bạn có thể thoải mái đóng popup, lướt Facebook/YouTube hay mở tab khác. Extension vẫn đang tự động cào 50 mã và đẩy về Admin!';
    if (stopAutoScrapeBtn) stopAutoScrapeBtn.style.display = 'block';
    if (autoScrapeBtn) autoScrapeBtn.style.display = 'none';

    chrome.runtime.sendMessage({ action: "START_BACKGROUND_AUTO_RANKING_SCRAPE" }, (res) => {
      console.log("Background runner status:", res);
    });
  });

  // Click Stop Auto Scrape Event
  if (stopAutoScrapeBtn) {
    stopAutoScrapeBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: "STOP_BACKGROUND_AUTO_RANKING_SCRAPE" }, (res) => {
        progressTitle.textContent = '🛑 Đang dừng cào ngầm...';
        progressDetail.textContent = 'Đã gửi lệnh dừng tới Service Worker. Tiến trình sẽ dừng ở sản phẩm tiếp theo.';
      });
    });
  }

  // Click Reset Duplicate Cache Event
  const resetCacheBtn = document.getElementById('resetCacheBtn');
  if (resetCacheBtn) {
    resetCacheBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: "RESET_SCRAPED_CACHE" }, (res) => {
        alert(res?.message || '♻️ Đã xoá sạch bộ nhớ đệm mã trùng! Giờ đây bạn có thể bấm cào lại từ đầu.');
        progressBox.style.display = 'block';
        progressTitle.textContent = '♻️ Đã làm sạch bộ nhớ đệm!';
        progressDetail.textContent = 'Tất cả mã trùng đã được xoá khỏi bộ nhớ đệm Extension. Bạn có thể cào mới hoàn toàn.';
      });
    });
  }

  document.getElementById('optionsLink').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
});
