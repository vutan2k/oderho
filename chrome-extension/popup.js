document.getElementById('scrapeBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab.url.includes("oliveyoung.co.kr") || tab.url.includes("oliveyoung.com")) {
    chrome.tabs.sendMessage(tab.id, { action: "SCRAPE_PRODUCT" });
    window.close();
  } else {
    alert("Vui lòng mở link chi tiết sản phẩm trên Olive Young!");
  }
});

document.getElementById('optionsLink').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});
