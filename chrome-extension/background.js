chrome.tabs.onCreated.addListener(async () => {
  const t = await chrome.tabs.query({active: true, currentWindow: true});
  const i = await t[0].id;
  await chrome.windows.create({
    tabId: i
  })
})
