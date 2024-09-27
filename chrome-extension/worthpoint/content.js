function command(instruction) {
  chrome.runtime.sendMessage({ message: instruction }, function() {});
}


document.addEventListener('keydown', function(e) {
  const hotkeys = {
    'c': 'focus-bookparse',
    's': 'switch-tab'
  }

  if (e.target.nodeName === 'BODY') {
    command(hotkeys[e.key]);
  }
})