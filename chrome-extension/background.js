chrome.tabs.onCreated.addListener(async (tab) => {
  const newTabId = await tab.id;
  await chrome.windows.create({
    tabId: newTabId
  })
})
