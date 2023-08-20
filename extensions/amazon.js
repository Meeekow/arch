const garbageDataSelectors = ['.a-section.a-spacing-none.a-spacing-top-mini > .a-row', // 2nd, 3rd binding amazon details
                          '.a-size-base.a-link-normal.s-no-hover.s-underline-text.s-underline-link-text.s-link-style.a-text-normal', // price
                          '.a-row.a-size-base.a-color-secondary.s-align-children-center', // delivery, ships to
                          'span.a-size-small', // usually ships within x days
                          '.a-section.a-spacing-none.a-spacing-top-mini .a-row.a-size-base.a-color-secondary', // more buying choices
                          '.a-size-base.a-color-price', // stock left
                          '.a-section.a-spacing-none.a-spacing-top-micro.s-product-grid-adjustment', // synopsis, age
                          'span[aria-label="Temporarily out of stock."]', // temporarily out of stock
                          '.a-section.a-spacing-none.a-spacing-top-micro .s-align-children-center' // small business
                         ];


const deleteSelectors = (selector) => {
  document.querySelectorAll(selector).forEach((e) => {
    e.remove();
  });
}


const waitForElement = (selector, callback) => {
  const observer = new MutationObserver(function(mutations, me) {
    const element = document.querySelector(selector);
    if ( element ) {
      callback(element);
      me.disconnect(); // Once the element has been found, we can stop observing for mutations
      return;
    }
  });
  observer.observe(document, { childList: true, subtree: true });
}


const removeGarbageData = () => {
  // sidebar
  waitForElement('#s-refinements', () => { document.getElementById('s-refinements').remove() });

  // customers who viewed items in your browsing history also viewed
  waitForElement('#rhf-shoveler', () => { document.getElementById('rhf-shoveler').remove() });
  waitForElement('.rhf-frame', () => { document.querySelector('.rhf-frame').remove() });

  // footer
  waitForElement('#navFooter', () => { document.getElementById('navFooter').remove() });

  // loop over the array
  garbageDataSelectors.forEach((e) => {
    deleteSelectors(e);
  });
}


const turnIntoOneWord = () => {
  document.querySelectorAll('.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal').forEach((e) => {
    let title = [];
    e.querySelectorAll('span.a-size-medium.a-color-base').forEach((el) => {
      title.push(el.closest('span').textContent);
      el.closest('span').remove();
    });

    const result = document.createElement('span');
    result.classList = 'a-size-medium a-color-base a-text-normal one-word';
    result.innerHTML = title.join('').replaceAll(/’/g, "\'");
    e.appendChild(result);
    title.length = 0;
  });
}


const changeBindingFontSize = () => {
  document.querySelectorAll('.a-row.a-size-base.a-color-base:nth-child(1) a.a-size-base.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-bold').forEach((e) => {
    e.setAttribute('style', 'background: #FFC562 !important; font-size: 18px !important; color: #0F1111 !important');
  });
}


const detectWrongBinding = () => {
  document.querySelectorAll('.a-row.a-size-base.a-color-base:nth-child(1) a.a-size-base.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-bold').forEach((e) => {
    // https://stackoverflow.com/questions/73678256/how-to-make-a-negative-lookahead-ignores-upper-or-lowercase-characters
    const pattern = /^(?!(?:Hardcover|Paperback|(?:Mass Market )?Paperback|Spiral-bound|Plastic Comb)$|.*  )\w.*/;
    const re = new RegExp(pattern, "gi");
    e.innerHTML = e.innerText.replace(re, match => `<mark style="background: #FF6D74 !important; font-size: 18px !important">${match}</mark>`);
  });
}


const detectOtherLang = () => {
  document.querySelectorAll('.a-section.a-spacing-none.puis-padding-right-small.s-title-instructions-style span.a-size-base.a-color-secondary:nth-child(1)').forEach((e) => {
    const pattern = e.innerHTML;
    const re = new RegExp(pattern, "gi");
    e.innerHTML = e.innerText.replace(re, match => `<mark style="background: #FF6D74 !important; font-size: 18px !important">${match}</mark>`);
  });
}


const highlightPartialMatch = () => {
  const patternToIgnore = ['a', 'i'];
  let searchQuery = document.getElementById('twotabsearchtextbox').value.trim().split(' ');
  searchQuery = searchQuery.filter( (e) => { return patternToIgnore.indexOf(e) == -1 ? true : false } );
  searchQuery.sort((a, b) => { return b.length - a.length });
  const re = new RegExp(searchQuery.join('|'), 'gi');
  document.querySelectorAll('.a-size-medium.a-color-base.a-text-normal').forEach((e) => {
    e.innerHTML = e.innerText.replace(re, (match) => `<mark>${match}</mark>`);
  });
}


document.getElementById("twotabsearchtextbox").addEventListener("input", () => {
  highlightPartialMatch();
});


document.getElementById('nav-search-bar-form').addEventListener("keydown", e => {
  if ( e.code === 'Escape' ) {
    document.getElementById('nav-logo-sprites').click(); // simulate a click to the amazon logo at the top left
  }
});


function main() {
  removeGarbageData();
  turnIntoOneWord();
  changeBindingFontSize();
  detectWrongBinding();
  detectOtherLang();
  highlightPartialMatch();
}
main();


let previousUrl = location.href;
setInterval(() => {
  if ( previousUrl !== location.href ) {
    main();
    setTimeout(() => {
      main();
      previousUrl = location.href
    }, 2500);
  }
}, 1000);
