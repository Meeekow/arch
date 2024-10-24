let refocusBookparseWindow = false;
// Move newly opened amazon.com tab to amazon/worthpoint/ebay window.
chrome.tabs.onCreated.addListener(async function () {
  const queryOptions = await { active: true, currentWindow: true };
  await chrome.tabs.query(queryOptions, async function (tabs) {
    const { id, url, pendingUrl } = await tabs[0];
    if (url === "" && pendingUrl.includes('amazon.com')) {
      chrome.tabs.query({ currentWindow: false }, function(windows) {
        if (windows.length === 3) {
          const targetWindowId = windows[0].windowId;
          chrome.tabs.move(id, { windowId: targetWindowId, index: -1 }, function() {});
          chrome.windows.update(targetWindowId, { focused: true }, function() {
            chrome.tabs.update(id, { active: true });
            refocusBookparseWindow = true;
          })
        }
      })
    }
  })
})


// Refocus bookparse.com window.
chrome.tabs.onRemoved.addListener(function() {
  if (refocusBookparseWindow) {
    chrome.tabs.query({ currentWindow: false }, function(tabs) {
      if (tabs.length === 1) {
        chrome.windows.update(tabs[0].windowId, { focused: true }, function() {
          chrome.tabs.update(tabs[0].id, { active: true });
          refocusBookparseWindow = false;
        })
      }
    })
  }
})


// Close all existing tabs and open chrome page to clear cookies and data.
chrome.action.onClicked.addListener(async function () {
  await chrome.tabs.create({
    url: 'chrome://settings/privacy'
  })
  await chrome.tabs.query({ currentWindow: true }, await function (tabs) {
    tabs.forEach(async function (tab) {
      const { active } = await tab;
      if (!active) {
        await chrome.tabs.remove(tab.id);
      }
    })
  })
})

