document.getElementById('scrapeBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab.url.includes("oliveyoung.co.kr") || tab.url.includes("oliveyoung.com")) {
    // Inject content script nếu chưa có (trường hợp tab mở trước khi cài extension)
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    } catch {}
    // Gửi lệnh quét
    chrome.tabs.sendMessage(tab.id, { action: "SCRAPE_PRODUCT" });
    window.close();
  } else {
    alert("Vui lòng mở link chi tiết sản phẩm trên Olive Young!");
  }
});

document.getElementById('optionsLink').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});
