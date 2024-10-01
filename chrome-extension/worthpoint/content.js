function command(instruction) {
  chrome.runtime.sendMessage({ message: instruction }, function() {});
}


document.addEventListener('keydown', function(e) {
  const hotkeys = {
    'c': 'focus-bookparse',
    't': 'switch-tab-left',
    's': 'switch-tab-right'
  }

  if (e.target.nodeName === 'BODY') {
    command(hotkeys[e.key]);
  }
})


function removeElements() {
  const selectors = [
    '.related-landing-page.has-3-items',
    '.footer-wrapper.container-fluid'
  ];

  for (const item of selectors) {
    const element = document.querySelector(selector);
    if (element) { element.remove() };
  }
}
removeElements();