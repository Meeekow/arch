function searchEmailAddress(emailAddress) {
  const search = document.querySelector('[role="searchbox"]');
  search.value = emailAddress;
  search.dispatchEvent(new Event('input', { bubbles: true }));
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.message === "focus-email-directory") {
    chrome.tabs.query({}, function(tabs) {
      for (const link of tabs) {
        if (link.url.includes('https://docs.google.com/spreadsheets/d/1wWJx4HWXMvoVm1jwaKwPm184d3FciGVHjTcS24yDUDY/edit?gid=591902741#gid=591902741')) {
          chrome.tabs.update(link.id, { active: true });
          chrome.scripting.executeScript({
            target: { tabId: link.id },
            args: [message.email],
            func: searchEmailAddress
          })
        }
      }
    })
    sendResponse({ reply: "focusing-email-directory" });
  }
  // Return true to keep the message channel open for an asynchronous response
  return true;
})
