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
