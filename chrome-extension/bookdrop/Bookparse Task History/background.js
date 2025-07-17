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


  // Switch focus to bookparse window.
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

  // Switch tab focus in amazon/worthpoint/ebay window.
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

  // Switch tab focus in amazon/worthpoint/ebay window.
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


const TARGET_URL = "https://cdn.bookparse.com";
const tabMap = new Map(); // originTabId → movedTabId

let windowAId = null;
let windowBId = null;

// Handle tab creation (with potential opener)
chrome.tabs.onCreated.addListener(async (tab) => {
  if (windowAId === null || windowBId === null) {
    initializeWindowCache();
  }

  if (tab.url?.startsWith(TARGET_URL)) {
    await handleTargetTab(tab.id, tab, tab.openerTabId);
  }
});

// Handle navigation in existing tab
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.startsWith(TARGET_URL)) {
    await handleTargetTab(tabId, tab);
  }
});

// When any tab is closed
chrome.tabs.onRemoved.addListener(async (closedTabId) => {
  if (tabMap.has(closedTabId)) {
    const movedTabId = tabMap.get(closedTabId);
    try {
      await chrome.tabs.remove(movedTabId);
    } catch (e) {
      console.warn(`Could not close moved tab ${movedTabId}:`, e);
    }
    tabMap.delete(closedTabId);
  }

  for (const [originId, movedId] of tabMap.entries()) {
    if (movedId === closedTabId) {
      tabMap.delete(originId);
      break;
    }
  }
});

// Core tab move + tracking logic
async function handleTargetTab(tabId, tab, originTabId = null) {
  try {
    // Skip if windows not initialized or less than 2 exist
    if (!windowAId || !windowBId || windowAId === windowBId) {
      console.warn('Insufficient window info; skipping tab handling.');
      return;
    }

    const originWindowId = tab.windowId;
    const targetWindowId = (originWindowId === windowAId) ? windowBId : windowAId;

    if (!originTabId) originTabId = tab.openerTabId || tabId;

    // Avoid re-handling already-moved tabs
    if ([...tabMap.values()].includes(tabId)) return;

    const movedTab = await chrome.tabs.move(tabId, {
      windowId: targetWindowId,
      index: 0
    });

    await chrome.tabs.update(movedTab.id, { active: true });

    await chrome.windows.update(originWindowId, { focused: true });

    tabMap.set(originTabId, movedTab.id);

  } catch (e) {
    console.error('Error in handleTargetTab:', e);
  }
}

// Cache exactly 2 window IDs
async function initializeWindowCache() {
  try {
    const windows = await chrome.windows.getAll({ populate: false });

    if (windows.length === 2) {
      windowAId = windows[0].id;
      windowBId = windows[1].id;
    } else {
      windowAId = null;
      windowBId = null;
      console.warn('Expected 2 windows, found', windows.length);
    }
  } catch (e) {
    console.error('Failed to initialize window cache:', e);
  }
}
