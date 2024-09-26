const garbageSelectors = [
  '.a-section.a-spacing-none.a-spacing-top-mini', // Other bindings from DS Amazon Quick View
  '.a-row.a-size-base.a-color-base > .a-row', // Prices
  '[data-cy="delivery-recipe"]', // Delivery
  '[data-cy="secondary-offer-recipe"]', // Secondary Offer
  '[data-cy="product-details-recipe"]', // Product Details
  '.a-size-base.a-color-price', // Stock Left
  '.a-row.a-size-small.a-color-secondary > span.a-color-secondary', // Free w/ Audible Trial
  '.a-row.a-size-small.a-color-secondary', // Free with Kindle / Join Now
  '.a-row.a-size-base.a-color-secondary .a-color-base', // Available Instantly
  '.a-row.a-size-base.a-color-secondary .a-color-secondary', // Release Date?
]


const waitForElementAndRemove = (selector, isArray = false) => {
  const observer = new MutationObserver(function(mutations, me) {
    const element = isArray ? document.querySelectorAll(selector) : document.querySelector(selector);
    if (element === null) return;
    if (!isArray) return element.remove();
    element.forEach((e) => {
      e.remove();
    })
  })
  observer.observe(document, { childList: true, subtree: true });
}


const removeGarbageData = () => {
  // sidebar
  waitForElementAndRemove('.sg-col-4-of-24.sg-col-4-of-12.s-matching-dir.sg-col-4-of-16.sg-col.sg-col-4-of-20');

  // customers who viewed items in your browsing history also viewed
  waitForElementAndRemove('#rhf-shoveler');
  waitForElementAndRemove('.rhf-frame');

  // footer
  waitForElementAndRemove('#navFooter');

  // related inspiration
  waitForElementAndRemove('.s-include-content-margin.posts-feed-preview-wrapper .sg-col-inner');
  waitForElementAndRemove('#anonCarousel1');

  // loop over the array
  garbageSelectors.forEach((selector) => {
    waitForElementAndRemove(selector, true);
  });
}


const getBindingFromUrl = () => {
  const url = location.href;
  if (url.includes('&rh=n%3A283155%2Cp_n_feature_browse-bin%3A2656022011')) {
    return 'Paperback';
  } else if (url.includes('&rh=n%3A283155%2Cp_n_feature_browse-bin%3A2656020011')) {
    return 'Hardcover';
  } else if (url.includes('&rh=n%3A283155%2Cp_n_feature_browse-bin%3A23488071011')) {
    return 'Spiral-bound';
  } else if (url.includes('&rh=n%3A283155%2Cp_n_feature_browse-bin%3A2656019011')) {
    return 'Board book';
  }
}


const detectWrongBinding = () => {
  const correctBindingStyle = 'background: #5CB8FF !important; font-size: 18px !important; color: #0F1111 !important';
  const wrongBindingStyle = 'background: #FF6D74 !important; font-size: 18px !important; color: #0F1111 !important';

  const validBookBindings = {
    'Hardcover': ['Hardcover'],
    'Paperback': ['Paperback', 'Mass Market Paperback', 'Perfect Paperback'],
    'Spiral-bound': ['Spiral-bound', 'Ring-bound', 'Plastic Comb'],
    'Board book': ['Board book']
  }

  const correctBinding = getBindingFromUrl();
  const result = validBookBindings[correctBinding];

  document.querySelectorAll('.a-row.a-size-base.a-color-base:nth-child(1) a.a-size-base.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-bold').forEach((element) => {
    let listingBinding = element.textContent.trim();
    if (result === undefined || !result.includes(listingBinding)) {
      return element.setAttribute('style', wrongBindingStyle);
    }
    return element.setAttribute('style', correctBindingStyle);
  });
}


const highlightMatches = () => {
  let searchedQuery = document.getElementById('twotabsearchtextbox');
  searchedQuery.value = searchedQuery.value.replace(/\s\:\s?\w.*$/gi, '');

  const listLayout = document.querySelectorAll('.a-size-medium.a-color-base.a-text-normal');
  const gridLayout = document.querySelectorAll('.a-size-base-plus.a-color-base.a-text-normal');

  const element = listLayout.length > gridLayout.length ? listLayout : gridLayout;

  const completeMatch = searchedQuery.value.trim();
  const completeMatchRegEx = new RegExp(`\\b${completeMatch}\\b`, 'gi');
  element.forEach((e) => {
    e.innerHTML = e.innerHTML.replace(completeMatchRegEx, (match) => {
      return `<mark style="background: #B4FF9F !important; font-size: 18px !important">${match}</mark>`;
    });
  });

  const partialMatch = searchedQuery.value.trim().split(' ');
  const partialMatchJoined = partialMatch.join('|');
  const partialMatchRegEx = new RegExp(`(?!<mark[^>]*?>)\\b(${partialMatchJoined})\\b(?![^<]*?</mark>)`, 'gi');
  element.forEach((e) => {
    e.innerHTML = e.innerHTML.replace(partialMatchRegEx, (match) => {
      return `<mark style="background: #FFF562 !important; font-size: 18px !important">${match}</mark>`;
    });
  });
}


const getAuthorAndLanguage = () => {
  document.querySelectorAll('.a-row.a-size-base.a-color-secondary').forEach((e) => {
    let bookDetails = [];
    for (const child of e.children) {
      bookDetails.push(child.textContent);
    }

    const result = document.createElement('span');
    result.classList = 'a-size-base meeko';
    result.innerHTML = bookDetails.join('');
    e.replaceChildren(result);
  });
}


const highlightAuthor = () => {
  const pattern = /(?<=by\s)(\w.*?)(?=(?:\s\||$))/;
  document.querySelectorAll('.meeko').forEach((e) => {
    let re = new RegExp(pattern, 'gi');
    e.innerHTML = e.innerHTML.replace(re, function (match, group) {
      return `<mark style="background: #D7ABFF !important; font-size: 17px !important">${group}</mark>`;
    });
  });
}


const detectWrongLang = () => {
  const pattern = /(?:\w.*?)Edition/;
  document.querySelectorAll('.meeko').forEach((e) => {
    let re = new RegExp(pattern, 'gi');
    e.innerHTML = e.innerHTML.replace(re, function (match) {
      return `<mark style="background: #FF6D74 !important; font-size: 18px !important">${match}</mark>`;
    });
  });
}


const waitForElement = (selector, callback, shouldMonitor = false) => {
  const observer = new MutationObserver(function(mutations, me) {
    const element = document.querySelector(selector);
    if (element) callback(element);
    if (!shouldMonitor) me.disconnect();
  });
  observer.observe(document, { childList: true, subtree: true });
}


waitForElement('nav-search-bar-form', (element) => {
  if (element.code === 'Escape') { document.getElementById('nav-logo-sprites').click() };
});


waitForElement('#twotabsearchtextbox', (element) => {
  element.addEventListener('input', () => { highlightMatches() });
});


const changeWidth = (element) => {
  element.style.cssText = 'width: calc(.85 * (100vw - 28px)) !important';
}
waitForElement('.sg-col-20-of-24.s-matching-dir.sg-col-16-of-20.sg-col.sg-col-8-of-12.sg-col-12-of-16', changeWidth);


const main = () => {
  removeGarbageData();
  detectWrongBinding();
  highlightMatches();
  getAuthorAndLanguage();
  highlightAuthor();
  detectWrongLang();
}
waitForElement('#nav-logo-sprites', main);


let copyCount = 0;
// Listen for the copy event on the document
document.addEventListener('copy', function(event) {
  copyCount++;

  // Get the copied text from the clipboard
  const selectedText = document.getSelection().toString();

  if (copyCount >= 2) {
    // You could also send this data to the background script or popup
    chrome.runtime.sendMessage({ copiedText: selectedText });
  }
});
