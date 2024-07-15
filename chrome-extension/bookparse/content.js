const waitForElement = (selector, callback, options = { childList: true, subtree: true }) => {
  const observer = new MutationObserver(function(mutations, me) {
    mutations.forEach((mutation) => {
      if (mutation.target.className === 'out-label ms-auto') {
        const element = document.querySelector(selector);
        if (element) {
          callback(element);
        }
      }
    })
  });
  observer.observe(document, options);
}


const attachListener = (element) => {
  const port = chrome.runtime.connect({name: "zoomState"});
  port.postMessage({message: 'reset-zoom-level'});
}
waitForElement('.form-control', attachListener);