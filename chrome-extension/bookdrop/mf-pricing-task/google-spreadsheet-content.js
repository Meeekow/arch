setTimeout(() => {
  document.addEventListener('copy', async function() {
    if (window.location.href.endsWith("gid=201085585")) {
      chrome.runtime.sendMessage({ message: 'focus-sellercentral' }, function() {});
    }
  })
}, 3000)
