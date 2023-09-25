const garbageDataSelectors = [
  '.a-section.a-spacing-none.a-spacing-top-mini > .a-row', // 2nd, 3rd binding amazon details
  '.a-size-base.a-link-normal.s-no-hover.s-underline-text.s-underline-link-text.s-link-style.a-text-normal', // price
  '.a-row.a-size-base.a-color-secondary.s-align-children-center', // delivery, ships to
  'span.a-size-small', // usually ships within x days
  '.a-section.a-spacing-none.a-spacing-top-mini .a-row.a-size-base.a-color-secondary', // more buying choices
  '.a-size-base.a-color-price', // stock left
  '.a-section.a-spacing-none.a-spacing-top-micro.s-product-grid-adjustment', // synopsis, age
  'span[aria-label="Temporarily out of stock."]', // temporarily out of stock
  '.a-section.a-spacing-none.a-spacing-top-micro .s-align-children-center' // small business
];


const waitForElementAndRemove = (selector) => {
  const observer = new MutationObserver(function(mutations, me) {
    const element = document.querySelector(selector);
    if (element) {
      me.disconnect(); // Once the element has been found, stop observing for mutations
      element.remove(); // Delete the element that has been found
      return;
    }
  });
  observer.observe(document, { childList: true, subtree: true });
}


const removeGarbageData = () => {
  // sidebar
  waitForElementAndRemove('#s-refinements');

  // customers who viewed items in your browsing history also viewed
  waitForElementAndRemove('#rhf-shoveler');
  waitForElementAndRemove('.rhf-frame');

  // footer
  waitForElementAndRemove('#navFooter');

  // loop over the array
  garbageDataSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.remove();
    });
  });
}


const turnIntoOneWord = () => {
  document.querySelectorAll('.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal').forEach((e) => {
    let bookTitle = [];
    e.querySelectorAll('span.a-size-medium.a-color-base').forEach((el) => {
      bookTitle.push(el.closest('span').textContent);
    });

    const result = document.createElement('span');
    result.classList = 'a-size-medium a-color-base a-text-normal one-word';
    result.innerHTML = bookTitle.join('').replaceAll(/’|`/g, "\'");
    e.replaceChildren(result);
  });

  document.querySelectorAll('.a-row.a-size-base.a-color-secondary > .a-row').forEach((e) => {
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


const getBindingFromUrl = () => {
  const url = location.href;

  let binding = '';

  if (url.includes('&rh=n%3A283155%2Cp_n_feature_browse-bin%3A2656022011')) {
    binding = 'Paperback';
  } else if (url.includes('&rh=n%3A283155%2Cp_n_feature_browse-bin%3A2656020011')) {
    binding = 'Hardcover';
  } else if (url.includes('&rh=n%3A283155%2Cp_n_feature_browse-bin%3A23488071011')) {
    binding = 'Spiral-bound';
  } else if (url.includes('&rh=n%3A283155%2Cp_n_feature_browse-bin%3A2656019011')) {
    binding = 'Board';
  }

  return binding;
}


const detectWrongBinding = () => {
  const correctBinding = getBindingFromUrl();

  document.querySelectorAll('.a-row.a-size-base.a-color-base:nth-child(1) a.a-size-base.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-bold').forEach((element) => {
    let listingBinding = element.textContent.trim();

    if (correctBinding === 'Paperback' && listingBinding === 'Mass Market Paperback') {
      element.setAttribute('style', 'background: #5CB8FF !important; font-size: 18px !important; color: #0F1111 !important');
      return;
    }

    if (correctBinding === 'Spiral-bound' && listingBinding === 'Ring-bound') {
      element.setAttribute('style', 'background: #5CB8FF !important; font-size: 18px !important; color: #0F1111 !important');
      return;
    }

    if (correctBinding !== listingBinding) {
      element.setAttribute('style', 'background: #FF6D74 !important; font-size: 18px !important; color: #0F1111 !important');
      return;
    }

    element.setAttribute('style', 'background: #5CB8FF !important; font-size: 18px !important; color: #0F1111 !important');
  });
}


const highlightMatches = () => {
  let searchedQuery = document.getElementById('twotabsearchtextbox');
  searchedQuery.value = searchedQuery.value.replace(/\s\:\s?\w.*$/gi, '');

  const completeMatch = searchedQuery.value.trim();
  const completeMatchRegEx = new RegExp(`\\b${completeMatch}\\b`, 'gi');
  document.querySelectorAll('.a-size-medium.a-color-base.a-text-normal').forEach((e) => {
    e.innerHTML = e.innerText.replace(completeMatchRegEx, match => `<mark style="background: #B4FF9F !important; font-size: 18px !important">${match}</mark>`);
  });

  const partialMatch = searchedQuery.value.trim().split(' ');
  const partialMatchJoined = partialMatch.join('|');
  const partialMatchRegEx = new RegExp(`(?!<mark[^>]*?>)\\b(${partialMatchJoined})\\b(?![^<]*?</mark>)`, 'gi');
  document.querySelectorAll('.a-size-medium.a-color-base.a-text-normal').forEach((e) => {
    e.innerHTML = e.innerHTML.replace(partialMatchRegEx, function(match) {
      return `<mark style="background: #FFF562 !important; font-size: 18px !important">${match}</mark>`;
    });
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
};


const detectWrongLang = () => {
  const pattern = /(?:\w.*?)Edition/;
  document.querySelectorAll('.meeko').forEach((e) => {
    let re = new RegExp(pattern, 'gi');
    e.innerHTML = e.innerHTML.replace(re, function (match) {
      return `<mark style="background: #FF6D74 !important; font-size: 18px !important">${match}</mark>`;
    });
  });
}


document.getElementById('twotabsearchtextbox').addEventListener('input', () => {
  highlightMatches();
});


document.getElementById('nav-search-bar-form').addEventListener('keydown', (e) => {
  if (e.code === 'Escape') {
    document.getElementById('nav-logo-sprites').click(); // simulate a click to the amazon logo at the top left
  }
});


const main = () => {
  removeGarbageData();
  turnIntoOneWord();
  detectWrongBinding();
  highlightMatches();
  highlightAuthor();
  detectWrongLang();
}
main();


let previousUrl = location.href;
setInterval(() => {
  if (previousUrl !== location.href) {
    main();
    setTimeout(() => {
      main();
      previousUrl = location.href;
    }, 2500);
  }
}, 250);
