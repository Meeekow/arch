chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(message) {
    chrome.tabs.query({ active: true }, function(tabs) {
      tabId = tabs[0].id;
      chrome.tabs.setZoom(tabId, 0);
    })
  })
})