const waitForElement = (selector, callback, isArray = false, shouldMonitor = false, options = { childList: true, subtree: true }) => {
  const observer = new MutationObserver(function(mutations, mo) {
    const element = isArray ? document.querySelectorAll(selector) : document.querySelector(selector);
    if (element) {
      if (!shouldMonitor) { mo.disconnect() };
      element.click();
    }
  })
  observer.observe(document, options);
}

function sleep(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  })
}

waitForElement('[role=button].a-popover-trigger.a-declarative');

sleep(300).then(function() {
  waitForElement('.a-link-normal.mm-grid-aod-popover-format-entry');
  return sleep(300);
})
