// Move amazon to its own window.
// chrome.tabs.onCreated.addListener(async function () {
//   const queryOptions = await { active: true, currentWindow: true };
//   await chrome.tabs.query(queryOptions, async function (tabs) {
//     const { id, url, pendingUrl } = await tabs[0];
//     if (url === "" && pendingUrl.includes('amazon.com')) {
//       await chrome.windows.create({
//         tabId: id
//       })
//     }
//   })
// })


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


// let navigateToBookparse = false;
// Catch copy event in content script and determine if
// we need to go to worthpoint/ebay or bookparse tab
// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//   if (message.copiedText) {
//     navigateToBookparse = true;
//   }
// });


// Switch to worthpoint/ebay once amazon website is closed.
// chrome.windows.onRemoved.addListener(function(windowid) {
//   chrome.tabs.query({}, function(tabs) {
//     const urlToFind = navigateToBookparse ? 'bookparse.com' : 'worthpoint.com';
//     const targetTab = tabs.find(tab => tab.url.includes(urlToFind));
//     if (targetTab) {
//       chrome.windows.update(targetTab.windowId, { focused: true }, function() {
//         chrome.tabs.update(targetTab.id, { active: true });
//       })
//       navigateToBookparse = false;
//     }
//   })
// })
