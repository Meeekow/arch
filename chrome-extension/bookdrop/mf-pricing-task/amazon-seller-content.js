function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    (function check() {
      const el = document.querySelector(selector);
      if (el) return resolve(el);

      if (Date.now() - startTime > timeout) {
        return reject(new Error('Element not found: ' + selector));
      }

      requestAnimationFrame(check); // Efficient polling
    })()
  })
}

(async () => {
  try {
    const target = await waitForElement('kat-input.SearchBox-module__searchInput--T3Fdk.touched');
    const shadow = target.shadowRoot.querySelector('input');
    const button = document.querySelector('kat-icon[name="search"]');

    function searchSKU() {
      navigator.clipboard.readText()
        .then(skuToCheck => {
          target.value = skuToCheck;
          shadow.value = skuToCheck;
          target.dispatchEvent(new Event('input', { bubbles: true }));
          shadow.dispatchEvent(new Event('input', { bubbles: true }));
          setTimeout(() => { button.click() }, 100);
        })
        .catch(err => {
          return;
        })
    }

    target.addEventListener('focus', searchSKU);

    document.addEventListener('keydown', (e) => {
      const k = e.key;
      switch(k) {
        case 't':
          shadow.focus();
          shadow.blur();
          break;
        case 's':
          const bookToCheck = document.querySelector('.ProductDetails-module__titleContainer--wRcGp a');
          if (bookToCheck) {
            bookToCheck.click();
          }
          break;
        case 'r':
          if (chrome?.runtime?.sendMessage) {
            chrome.runtime.sendMessage({ message: 'focus-spreadsheet' }, function() {});
          }
          break;
      }
    })

  } catch (err) {
    return;
  }
})()
