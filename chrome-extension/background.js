chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  const _status = changeInfo.status;
  const _url = changeInfo.url;

  if (_url === undefined) { return }

  if (_status === 'loading' &&
      _url.includes('amazon.com')) {
    chrome.windows.create({
      tabId: tabId
    })
  }
})
