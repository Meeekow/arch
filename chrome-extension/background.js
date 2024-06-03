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
