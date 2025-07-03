// THIS IS FOR GOOGLE SPREADSHEET
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.message === "focus-sellercentral") {
    chrome.windows.getAll({ populate: true }, function(windows) {
      for (const window of windows) {
        for (const tab of window.tabs) {
          if (tab.url && tab.url.includes('sellercentral.amazon.com')) {
            chrome.tabs.update(tab.id, { active: true });
            chrome.windows.update(window.id, { focused: true });
            sendResponse({ reply: "focusing-sellercentral" });
            return; // Stop after first match
          }
        }
      }
      sendResponse({ reply: "sellercentral-not-found" });
    })
  }
  return true; // Keep message channel open for async sendResponse
})


// THIS IS FOR AMAZON SELLER CENTRAL
let AMAZON_TAB_ID = null;
let GOOGLE_SPREADSHEET_WINDOW_ID = null;
let GOOGLE_SPREADSHEET_TAB_ID = null;

function getSpreadsheetId() {
  chrome.tabs.query({}, function(tabs) {
    for (const link of tabs) {
      if (link.url.includes('https://docs.google.com/spreadsheets/d/1CCCA0LQkDCqNUWgRZ40MWOHQcO0s0rD0mZF_h-OvNzQ/edit?gid=201085585#gid=201085585')) {
        GOOGLE_SPREADSHEET_WINDOW_ID = link.windowId;
        GOOGLE_SPREADSHEET_TAB_ID = link.id;
      }
    }
  })
}

function returnToSpreadsheet(sendResponse) {
  if (GOOGLE_SPREADSHEET_TAB_ID === null || GOOGLE_SPREADSHEET_WINDOW_ID === null) {
    return;
  }
  chrome.windows.getAll({ populate: true }, function(windows) {
    for (const window of windows) {
      for (const tab of window.tabs) {
        if (tab.id === GOOGLE_SPREADSHEET_TAB_ID) {
          chrome.tabs.update(GOOGLE_SPREADSHEET_TAB_ID, { active: true }, () => {
            chrome.windows.update(window.id, { focused: true }, () => {});
          })
          return; // Exit after match
        }
      }
    }
    sendResponse({ reply: "focusing-spreadsheet" });
  })
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.message === "focus-spreadsheet") {
    returnToSpreadsheet();
  }
  return true; // Keep message channel open for async sendResponse
})

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  getSpreadsheetId();
  if (changeInfo.url !== undefined && changeInfo.url.includes('https://www.amazon.com/dp/')) {
    AMAZON_TAB_ID = tabId;
  }
})

chrome.tabs.onRemoved.addListener(function(closedTabId) {
  if (closedTabId === AMAZON_TAB_ID) {
    returnToSpreadsheet();
  }
})