function sleep(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  })
}

function clickBuyBoxButton() {
  const element = document.querySelector('[role=button].a-popover-trigger.a-declarative');
  const binding = document.querySelectorAll('.a-link-normal.mm-grid-aod-popover-format-entry');

  if (element) {
    element.click();
  }

  sleep(300)
    .then(function() {
      if (binding.length > 0) {
        binding[0].click();
      }
      return sleep(300);
    })
}

document.addEventListener('keydown', function(e) {
  const k = e.key;
  switch (k) {
    case 'a':
      e.preventDefault();
      clickBuyBoxButton();
      break;
  }
})
