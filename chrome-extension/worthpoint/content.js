function command(instruction) {
  chrome.runtime.sendMessage({ message: instruction }, function() {});
}


document.addEventListener('keydown', function(e) {
  const hotkeys = {
    'c': 'focus-bookparse',
    't': 'switch-tab-left',
    's': 'switch-tab-right'
  }

  if (e.target.nodeName === 'BODY' && !e.ctrlKey) {
    command(hotkeys[e.key]);
  }
})


function removeFooterElements() {
  const selectors = [
    '.related-landing-page.has-3-items',
    '.footer-wrapper.container-fluid',
    '.container.banner-bottom'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) { element.remove() };
  }
}
removeFooterElements();


// Make sure 'Sold' criteria is always selected.
function showOnlySold() {
  const sold = document.querySelector('[name=LH_Sold]');
  if (sold) {
    if (sold.value === 0) {
      sold.querySelector('.checkbox__control').click();
    }
  }
}
showOnlySold();
