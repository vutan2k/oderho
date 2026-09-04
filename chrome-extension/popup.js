// popup.js - Single Product & Batch Scraper Controller v21.0 DEV

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

  const devModeToggle = document.getElementById('devModeToggle');
  const batchScrapeSection = document.getElementById('batchScrapeSection');
  const batchFoundBadge = document.getElementById('batchFoundBadge');
  const startBatchBtn = document.getElementById('startBatchBtn');
  const pauseBatchBtn = document.getElementById('pauseBatchBtn');
  const stopBatchBtn = document.getElementById('stopBatchBtn');
  const batchProgressBox = document.getElementById('batchProgressBox');
  const batchStatusText = document.getElementById('batchStatusText');
  const batchCountText = document.getElementById('batchCountText');
  const batchProgressBar = document.getElementById('batchProgressBar');

  let foundBatchItems = [];

  // 1. Đọc Cấu hình đã lưu
  const storage = await new Promise(resolve => {
    chrome.storage.local.get(['geminiApiKey', 'selectedModel', 'devMode'], resolve);
  });
  const hasKey = !!storage?.geminiApiKey;

  // 2. Cài đặt Dev Mode Toggle
  if (devModeToggle) {
    devModeToggle.checked = !!storage?.devMode;
    devModeToggle.addEventListener('change', async (e) => {
      const isEnabled = e.target.checked;
      await new Promise(r => chrome.storage.local.set({ devMode: isEnabled }, r));

      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab?.id) {
        chrome.tabs.sendMessage(activeTab.id, {
          action: "TOGGLE_DEV_MODE",
          enabled: isEnabled
        }, () => {
          if (chrome.runtime.lastError) {}
        });
      }
    });
  }

  // 3. Cài đặt Model AI Selector
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

  // 4. Kiểm tra Tab hiện tại
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || '';
  const isOliveYoung = /oliveyoung\.co\.kr|oliveyoung\.com/i.test(url);
  const isListingPage = /getBestList|getMCategoryList|getPlanShopDetail|search|display/i.test(url);

  // Update Status Indicator & Check Duplicate Product
  const duplicateAlertBox = document.getElementById('duplicateAlertBox');
  const duplicateItemDetail = document.getElementById('duplicateItemDetail');
  const goodsNoMatch = url.match(/goodsNo=([A-Za-z0-9_]+)/i);
  const goodsNo = goodsNoMatch ? goodsNoMatch[1].toUpperCase() : '';

  if (hasKey && isOliveYoung) {
    statusBadge.className = 'status-badge status-online';
    statusDot.className = 'dot dot-green';
    statusText.textContent = 'Sẵn sàng cào sản phẩm';

    // Tự động kiểm tra xem sản phẩm đã có trong hệ thống chưa
    if (goodsNo) {
      chrome.runtime.sendMessage({
        action: "CHECK_PRODUCT_EXISTS",
        goodsNo: goodsNo,
        url: url
      }, (res) => {
        if (chrome.runtime.lastError) return;
        if (res && res.exists) {
          if (duplicateAlertBox) duplicateAlertBox.style.display = 'block';
          if (duplicateItemDetail && res.item?.name) {
            duplicateItemDetail.textContent = `Tên gốc: "${res.item.name}". Bấm nút bên dưới để cập nhật/ghi đè bản ghi.`;
          }
          if (scrapeBtn) {
            scrapeBtn.innerHTML = `<span>🔄</span><span>Cập Nhật Sản Phẩm (Ghi Đè)</span>`;
            scrapeBtn.style.background = 'linear-gradient(135deg, #C5A059 0%, #8C6D2D 100%)';
          }
        }
      });
    }
  } else if (!hasKey) {
    statusBadge.className = 'status-badge status-offline';
    statusDot.className = 'dot dot-red';
    statusText.textContent = 'Thiếu API Key';
  } else {
    statusBadge.className = 'status-badge status-offline';
    statusDot.className = 'dot dot-red';
    statusText.textContent = 'Chưa vào Olive Young';
  }

  // 5. Kiểm tra và kích hoạt Batch Scrape nếu đang ở trang danh sách
  if (isOliveYoung && tab?.id) {
    // Thử trích xuất các sản phẩm trên trang
    chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_PAGE_PRODUCTS" }, (res) => {
      if (chrome.runtime.lastError) return;
      if (res && res.items && res.items.length > 0) {
        foundBatchItems = res.items;
        if (batchScrapeSection) {
          batchScrapeSection.style.display = 'block';
          if (batchFoundBadge) {
            batchFoundBadge.textContent = `${res.items.length} SP`;
          }
        }
      } else if (isListingPage && batchScrapeSection) {
        batchScrapeSection.style.display = 'block';
      }
    });

    // Kiểm tra trạng thái Batch Scraper từ Background
    chrome.runtime.sendMessage({ action: "GET_BATCH_STATUS" }, (res) => {
      if (chrome.runtime.lastError || !res?.state) return;
      updateBatchUI(res.state);
    });
  }

  const updateBatchUI = (state) => {
    if (!state) return;
    if (state.isRunning) {
      if (batchProgressBox) batchProgressBox.style.display = 'block';
      if (startBatchBtn) startBatchBtn.style.display = 'none';
      if (pauseBatchBtn) {
        pauseBatchBtn.style.display = 'inline-block';
        pauseBatchBtn.textContent = state.isPaused ? '▶️ Tiếp Tục' : '⏸️ Tạm Dừng';
      }
      if (stopBatchBtn) stopBatchBtn.style.display = 'inline-block';

      if (batchCountText) {
        batchCountText.textContent = `${state.currentIndex}/${state.total}`;
      }
      if (batchStatusText) {
        batchStatusText.textContent = state.isPaused ? 'Đang tạm dừng...' : `Đang cào: ${state.currentGoodsNo || '...'}`;
      }
      if (batchProgressBar) {
        const pct = state.total > 0 ? Math.round((state.currentIndex / state.total) * 100) : 0;
        batchProgressBar.style.width = `${pct}%`;
      }
    } else {
      if (startBatchBtn) startBatchBtn.style.display = 'inline-block';
      if (pauseBatchBtn) pauseBatchBtn.style.display = 'none';
      if (stopBatchBtn) stopBatchBtn.style.display = 'none';
      if (state.total > 0 && state.currentIndex >= state.total) {
        if (batchProgressBox) batchProgressBox.style.display = 'block';
        if (batchStatusText) batchStatusText.textContent = `Hoàn tất (${state.successCount} thành công, ${state.failedCount} lỗi)`;
        if (batchProgressBar) batchProgressBar.style.width = '100%';
      }
    }
  };

  // Lắng nghe thay đổi trạng thái Batch Scraper từ Background
  if (chrome?.storage?.onChanged) {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.batchScrapeState?.newValue) {
        updateBatchUI(changes.batchScrapeState.newValue);
      }
    });
  }

  // Sự kiện Nút Khởi Động Cào Hàng Loạt
  if (startBatchBtn) {
    startBatchBtn.addEventListener('click', () => {
      if (!hasKey) {
        alert("Bạn chưa cài đặt Gemini API Key! Vui lòng vào Cài đặt.");
        chrome.runtime.openOptionsPage();
        return;
      }
      if (!foundBatchItems || foundBatchItems.length === 0) {
        alert("Không tìm thấy mã sản phẩm nào trên trang này để cào hàng loạt.");
        return;
      }

      chrome.runtime.sendMessage({
        action: "START_BATCH_SCRAPE",
        items: foundBatchItems
      }, (res) => {
        if (chrome.runtime.lastError) return;
        if (res?.success) {
          if (batchProgressBox) batchProgressBox.style.display = 'block';
          if (startBatchBtn) startBatchBtn.style.display = 'none';
          if (pauseBatchBtn) pauseBatchBtn.style.display = 'inline-block';
          if (stopBatchBtn) stopBatchBtn.style.display = 'inline-block';
        }
      });
    });
  }

  // Sự kiện Nút Tạm Dừng / Tiếp Tục
  if (pauseBatchBtn) {
    pauseBatchBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: "PAUSE_BATCH_SCRAPE" }, (res) => {
        if (chrome.runtime.lastError) return;
        if (res?.state) updateBatchUI(res.state);
      });
    });
  }

  // Sự kiện Nút Dừng Cào
  if (stopBatchBtn) {
    stopBatchBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: "STOP_BATCH_SCRAPE" }, (res) => {
        if (chrome.runtime.lastError) return;
        if (res?.state) updateBatchUI(res.state);
      });
    });
  }

  // Click Scrape Current Product Event
  if (scrapeBtn) {
    scrapeBtn.addEventListener('click', async () => {
      if (!hasKey) {
        alert("Bạn chưa cài đặt Gemini API Key!\nVui lòng bấm vào 'Cài đặt API & Cấu hình Nâng cao' bên dưới.");
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
      chrome.storage.local.set({ scrapedGoodsList: [], scrapedGoodsRegistry: {} }, () => {
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
