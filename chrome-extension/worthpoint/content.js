document.addEventListener('keydown', function(e) {
  if (e.target.nodeName === 'BODY' && e.key === 'c') {
    chrome.runtime.sendMessage({ command: "focus-bookparse" }, function() {});
  }

  if (e.target.nodeName === 'BODY' && e.key === 's') {
    chrome.runtime.sendMessage({ command: "switch-tab" }, function() {});
  }
})