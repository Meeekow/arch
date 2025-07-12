function unifiedSearch(query) {
  let title = document.querySelector('#queryText_body') || document.querySelector('#queryText_d') || document.querySelector('.gh-tb.ui-autocomplete-input');
  const searchButton = document.querySelector('.searchBar-hp__btn.wpButton.yellowBtn') || document.querySelector('.wpButton.yellowBtn') || document.querySelector('.btn.btn-prim.gh-spr') || document.querySelector('.gh-search-button__label');
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
    chrome.windows.getAll({ populate: false }, function(windows) {
      chrome.windows.getLastFocused({}, function(lastFocused) {
        const otherWindow = windows.find(win => win.id !== lastFocused.id);
        if (otherWindow) {
          chrome.windows.update(otherWindow.id, { focused: true });
        }
      });
    });
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


// AMAZON, WORTHPOINT, EBAY
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.message === "focus-bookparse") {
    chrome.tabs.query({ currentWindow: false }, function(tabs) {
      const indexToFind = 1;
      const targetTab = tabs.find(tab => tab.index === indexToFind);
      if (targetTab) {
        chrome.windows.update(targetTab.windowId, { focused: true }, function() {
          chrome.tabs.update(targetTab.id, { active: true });
        })
      } else {
        console.log("Tab with the given index not found!");
      }
    })
    sendResponse({ reply: "focusing-bookparse" });
  }

  if (message.message === "switch-tab-left") {
    chrome.tabs.query({ currentWindow: true }, function(tabs) {
      for (let i = 0, l = tabs.length - 1; i <= l; i++) {
        if (tabs[i].active) {
          if (tabs[i].index === 0) {
            chrome.tabs.update(tabs[l].id, { active: true });
          } else {
            chrome.tabs.update(tabs[i-1].id, { active: true });
          }
        }
      }
    })
    sendResponse({ reply: "switching-tab-left" });
  }

  if (message.message === "switch-tab-right") {
    chrome.tabs.query({ currentWindow: true }, function(tabs) {
      chrome.tabs.query({ currentWindow: true }, function(tabs) {
      for (let i = 0, l = tabs.length - 1; i <= l; i++) {
        if (tabs[i].active) {
          if (tabs[i].index === l) {
            chrome.tabs.update(tabs[0].id, { active: true });
          } else {
            chrome.tabs.update(tabs[i+1].id, { active: true });
          }
        }
      }
    })
    })
    sendResponse({ reply: "switching-tab-right" });
  }

  // Return true to keep the message channel open for an asynchronous response
  return true;
})


// Move tab automatically to amz / worthpoint / ebay
const TARGET_URL = "https://cdn.bookparse.com";
const movedTabs = new Set();                    // Tracks moved tabs
const originToMovedMap = new Map();             // originTabId → movedTabId

function shouldMove(url) {
  return typeof url === "string" && url.includes(TARGET_URL);
}

async function moveTabIfNeeded(tabId, tab) {
  if (movedTabs.has(tabId)) return;
  if (tab.openerTabId === undefined) return; // Ignore manually opened tabs

  const url = tab.pendingUrl || tab.url || "";
  if (!shouldMove(url)) return;

  const sourceWindowId = tab.windowId;
  if (!sourceWindowId) return;

  const windows = await chrome.windows.getAll({ populate: false });
  const targetWindows = windows.filter(w =>
    w.id !== sourceWindowId && w.type === "normal" && !w.incognito
  );

  if (targetWindows.length === 0) return;

  const destinationWindow = targetWindows[0];

  const movedTab = await chrome.tabs.move(tabId, {
    windowId: destinationWindow.id,
    index: -1
  });

  await chrome.tabs.update(movedTab.id, { active: true });

  movedTabs.add(tabId);
  originToMovedMap.set(tab.openerTabId, movedTab.id);
}

// Listen for tab creation (only works for programmatic tabs with openerTabId)
chrome.tabs.onCreated.addListener(async (tab) => {
  await moveTabIfNeeded(tab.id, tab);
});

// Fallback for programmatically opened tabs with delayed URLs
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const url = changeInfo.url || changeInfo.pendingUrl;
  if (shouldMove(url)) {
    await moveTabIfNeeded(tabId, tab);
  }
});

// Close moved tab when origin tab is closed
chrome.tabs.onRemoved.addListener(async (closedTabId) => {
  const movedTabId = originToMovedMap.get(closedTabId);
  if (!movedTabId) return;

  try {
    await chrome.tabs.remove(movedTabId);
    originToMovedMap.delete(closedTabId);
    movedTabs.delete(movedTabId);
  } catch (e) {
    console.warn("Failed to auto-close moved tab:", e);
  }
});