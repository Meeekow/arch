function unifiedSearch(query) {
  let title = document.querySelector('#queryText_body') || document.querySelector('#queryText_d') || document.querySelector('.gh-tb.ui-autocomplete-input');
  const searchButton = document.querySelector('.searchBar-hp__btn.wpButton.yellowBtn') || document.querySelector('.wpButton.yellowBtn') || document.querySelector('.btn.btn-prim.gh-spr');
  title.value = query;
  searchButton.click();
}


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // For amazon, we have to do it this way since we need
  // the correct binding to be queried too.
  if (message.message === "new-amazon-url") {
    chrome.tabs.query({}, function(tabs) {
      const urlToFind = 'amazon.com';
      const targetTab = tabs.find(tab => tab.url.includes(urlToFind));
      if (targetTab) {
        chrome.windows.update(targetTab.windowId, { focused: true }, function() {
          chrome.tabs.update(targetTab.id, { url: message.url, active: true });
        })
      } else {
        console.log("Amazon tab not found!");
      }
    })
    sendResponse({ reply: "sending-new-amazon-url" });
  }

  // Update ebay and worthpoint to match what
  // is being searched on amazon.
  if (message.message === "search-query") {
    chrome.tabs.query({}, function(tabs) {
      for (const link of tabs) {
        if (link.url.includes('worthpoint.com') || link.url.includes('ebay.com')) {
          chrome.scripting.executeScript({
            target: { tabId: link.id },
            args: [message.search],
            func: unifiedSearch
          })
        }
      }
    })
    sendResponse({ reply: "sending-new-query" });
  }

  // Switch focus to amazon/worthpoint/ebay window.
  if (message.message === "alt-tab") {
    chrome.tabs.query({ currentWindow: false }, function(tabs) {
      if (tabs.length > 0) {
        const windowId = tabs[0].windowId;
        if (windowId) {
          chrome.windows.update(windowId, { focused: true }, function() {});
        }
      }
    })
    sendResponse({ reply: "alt-tabbing" });
  }

  // Reset zoom level.
  if (message.message === "reset-zoom-level") {
    chrome.tabs.query({ active: true }, function(tabs) {
      const tabId = tabs[0].id;
      chrome.tabs.setZoom(tabId, 0);
    })
    sendResponse({ reply: "resetting-zoom-level" });
  }

  // Zoom in.
  if (message.message === "zoom-in") {
    chrome.tabs.query({ active: true }, function(tabs) {
      const tabId = tabs[0].id;
      chrome.tabs.getZoom(tabId, function(zoomFactor) {
        chrome.tabs.setZoom(tabId, 2);
      })
    })
    sendResponse({ reply: "zooming-in" });
  }

  // Return true to keep the message channel open for an asynchronous response
  return true;
})
