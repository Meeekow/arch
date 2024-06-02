chrome.tabs.onCreated.addListener(async function () {
  const queryOptions = await { active: true, currentWindow: true };
  await chrome.tabs.query(queryOptions, async function (tabs) {
    const _id = await tabs[0].id;
    const _currentUrl = await tabs[0].url;
    const _pendingUrl = await tabs[0].pendingUrl;
    if (_currentUrl === "" && _pendingUrl.includes('amazon.com')) {
      await chrome.windows.create({
        tabId: _id
      })
    }
  })
})
