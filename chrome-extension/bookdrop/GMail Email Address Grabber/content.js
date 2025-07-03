const waitForElement = (selector, callback, isArray = false, shouldMonitor = false, options = { childList: true, subtree: true }) => {
  const observer = new MutationObserver(function(mutations, mo) {
    const element = isArray ? document.querySelectorAll(selector) : document.querySelector(selector);
    if (element) {
      if (!shouldMonitor) { mo.disconnect() };
      callback();
    }
  });
  observer.observe(document, options);
}

async function getSenderEmailAddress(emailAddress) {
  try {
    await navigator.clipboard.writeText(emailAddress);
  } catch (err) {
    console.log(err);
  }
}

function attachListener() {
  document.addEventListener('click', function(evt) {
    const emailAddress = evt.target.getAttribute('jid');
    if (emailAddress !== null) {
      getSenderEmailAddress(emailAddress);
      chrome.runtime.sendMessage({ message: 'focus-email-directory', email: emailAddress }, function() {});
    }
  })
}

function main() {
  attachListener();
}
waitForElement('.aeF', main);
