function unifiedSearch(query) {
  let title = document.querySelector('#queryText_body') || document.querySelector('#queryText_d') || document.querySelector('.gh-tb.ui-autocomplete-input');
  const searchButton = document.querySelector('.searchBar-hp__btn.wpButton.yellowBtn') || document.querySelector('.wpButton.yellowBtn') || document.querySelector('.btn.btn-prim.gh-spr') || document.querySelector('.gh-search-button__label');
  title.value = query;
  searchButton.click();
}

// This is for switching focus to amazon/worthpoint/ebay window.
let lastFocusedWindowId = null;
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    lastFocusedWindowId = windowId; // Update only if it's a real window switch
  }
})

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
    chrome.windows.getAll({ populate: false }, function(windows) {
      const currentWindowId = chrome.windows.WINDOW_ID_CURRENT;
      // Find another window that's not currently focused
      const otherWindow = windows.find(win => win.id !== lastFocusedWindowId);
      if (otherWindow) {
        chrome.windows.update(otherWindow.id, { focused: true }, () => {});
      }
    })
  }

  // Reset zoom level.
  if (message.message === "reset-zoom-level") {
    chrome.tabs.query({}, function(tabs) {
      const tabId = tabs[0].id;
      chrome.tabs.setZoom(tabId, 0);
    })
    sendResponse({ reply: "resetting-zoom-level" });
  }

  // Zoom in.
  if (message.message === "zoom-in") {
    chrome.tabs.query({ active: true }, function(tabs) {
      const tabId = tabs[0].id;
      chrome.tabs.setZoom(tabId, 2);
    })
    sendResponse({ reply: "zooming-in" });
  }

  // Return true to keep the message channel open for an asynchronous response
  return true;
})
