chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.message === "focus-bookparse") {
    chrome.tabs.query({ currentWindow: false }, function(tabs) {
      const indexToFind = 0;
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