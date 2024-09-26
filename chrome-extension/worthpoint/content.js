document.addEventListener('keydown', function(e) {
  if (e.key === 'c') {
    chrome.runtime.sendMessage({ command: "focus-bookparse" }, function() {});
  }
})