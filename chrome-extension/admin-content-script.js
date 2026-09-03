// admin-content-script.js - Injected into TAVY KOREA Admin web page
// Receives full product payloads from background service worker via Chrome runtime messaging
// and relays them to the Web App via window.postMessage with ZERO data size limits!

console.log("🚀 [TAVY Extension] Admin content script initialized!");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === 'TAVY_NEW_SCRAPED_PRODUCT') {
    console.log("📥 [TAVY Extension] Received product payload from background worker:", message.payload?.goodsNo);
    
    // Relay full payload directly to Web App React Context in browser memory
    window.postMessage({
      source: 'TAVY_EXTENSION',
      type: 'TAVY_NEW_SCRAPED_PRODUCT',
      payload: message.payload
    }, '*');

    if (sendResponse) sendResponse({ success: true });
  }
  return true;
});

// Tự động quét và đồng bộ các mã sản phẩm đã có trong kho sang Extension để nhận diện trùng lặp
const syncLocalCatalogToExtension = () => {
  try {
    const keys = ['tavy_custom_products', 'tavy_published_products', 'tavy_pending_products'];
    const goodsNos = new Set();
    keys.forEach(k => {
      const raw = localStorage.getItem(k);
      if (raw) {
        try {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) {
            arr.forEach(p => {
              const g = p.goodsNo || p.id;
              if (g) goodsNos.add(String(g).toUpperCase());
            });
          }
        } catch {}
      }
    });

    if (goodsNos.size > 0) {
      chrome.runtime.sendMessage({
        action: 'SYNC_CATALOG_GOODS_NOS',
        goodsNos: Array.from(goodsNos)
      }, () => {
        if (chrome.runtime.lastError) {}
      });
    }
  } catch {}
};

syncLocalCatalogToExtension();
setTimeout(syncLocalCatalogToExtension, 2500);
setInterval(syncLocalCatalogToExtension, 30000);

