chrome.tabs.onCreated.addListener(async function () {
  const queryOptions = await { active: true, currentWindow: true };
  await chrome.tabs.query(queryOptions, async function (tabs) {
    const { id, url, pendingUrl } = await tabs[0];
    if (url === "" && pendingUrl.includes('amazon.com')) {
      await chrome.windows.create({
        tabId: id
      })
    }
  })
})


chrome.action.onClicked.addListener(async function () {
  await chrome.tabs.create({
    url: 'chrome://settings/privacy'
  })
  await chrome.tabs.query({currentWindow: true}, await function (tabs) {
    tabs.forEach(async function (tab) {
      const { active } = await tab;
      if (!active) {
        await chrome.tabs.remove(tab.id);
      }
    })
  })
})
