// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // You can perform actions here based on the message
  if (message.command === "focus-bookparse") {
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
    // Respond back to the content script
    sendResponse({ reply: "focusing-bookparse" });
  }

  if (message.command === "switch-tab") {
    chrome.tabs.query({ currentWindow: true, active: false }, function(tabs) {
      chrome.tabs.update(tabs[0].id, { active: true });
    })

    sendResponse({ reply: "switching-tab" });
  }
  
  // Return true to keep the message channel open for an asynchronous response
  return true;
});