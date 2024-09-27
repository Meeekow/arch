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

  if (message.message === "switch-tab") {
    chrome.tabs.query({ currentWindow: true, active: false }, function(tabs) {
      chrome.tabs.update(tabs[0].id, { active: true });
    })
    sendResponse({ reply: "switching-tab" });
  }
  // Return true to keep the message channel open for an asynchronous response
  return true;
})