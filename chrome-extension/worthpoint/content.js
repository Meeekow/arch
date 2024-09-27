function command(instruction) {
  chrome.runtime.sendMessage({ message: instruction }, function() {});
}


document.addEventListener('keydown', function(e) {
  if (e.target.nodeName === 'BODY') {
    switch(e.key) {
      case 'c':
        command('focus-bookparse');
        break;
      case 's':
        command('switch-tab');
    }
  }
})