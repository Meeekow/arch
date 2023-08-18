// https://makersaid.com/wait-for-element-to-exist-javascript/
const waitForElement = (selector, callback) => {
  const observer = new MutationObserver(function(mutations, me) {
    const element = document.querySelector(selector);
    if (element) {
      callback(element);
      me.disconnect(); // Once the element has been found, we can stop observing for mutations
      return;
    }
  });
  observer.observe(document, { childList: true, subtree: true });
}


function removeGarbageData() {
  // customers who viewed items in your browsing history also viewed
  waitForElement('#rhf-shoveler', () => { document.getElementById('rhf-shoveler').remove() });
  waitForElement('.rhf-frame', () => { document.querySelector('.rhf-frame').remove() });

  // footer
  waitForElement('#navFooter', () => { document.getElementById('navFooter').remove() });

  // sidebar
  waitForElement('#s-refinements', () => { document.getElementById('s-refinements').remove() });

  // 2nd, 3rd binding amazon details
  document.querySelectorAll('.a-section.a-spacing-none.a-spacing-top-mini > .a-row').forEach((e) => {
    e.remove();
  });

  // price
  document.querySelectorAll('.a-size-base.a-link-normal.s-no-hover.s-underline-text.s-underline-link-text.s-link-style.a-text-normal').forEach((e) => {
    e.remove();
  });

  // delivery, ships to
  document.querySelectorAll('.a-row.a-size-base.a-color-secondary.s-align-children-center').forEach((e) => {
    e.remove();
  });

  // usually ships within x days
  document.querySelectorAll('span.a-size-small').forEach((e) => {
    e.remove();
  });

  // more buying choices
  document.querySelectorAll('.a-section.a-spacing-none.a-spacing-top-mini .a-row.a-size-base.a-color-secondary').forEach((e) => {
    e.remove();
  });

  // stock left
  document.querySelectorAll('.a-size-base.a-color-price').forEach((e) => {
    e.remove();
  });

  // synopsis, age
  document.querySelectorAll('.a-section.a-spacing-none.a-spacing-top-micro.s-product-grid-adjustment').forEach((e) => {
    e.remove();
  });

  // temporarily out of stock
  document.querySelectorAll('span[aria-label="Temporarily out of stock."]').forEach((e) => {
    e.remove();
  });

  // small business
  document.querySelectorAll('.a-section.a-spacing-none.a-spacing-top-micro .s-align-children-center').forEach((e) => {
    e.remove();
  });
}


function turnIntoOneWord() {
  document.querySelectorAll('.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal').forEach((e) => {
    let title = [];
    e.querySelectorAll('span.a-size-medium.a-color-base').forEach((el) => {
      title.push(el.closest('span').textContent);
      el.closest('span').remove();
    });

    const result = document.createElement('span');
    result.classList = 'a-size-medium a-color-base a-text-normal';
    result.innerHTML = title.join('').replaceAll(/’/g, "\'");
    e.appendChild(result);
    title.length = 0;
  })
}


function changeBindingFontSize() {
  document.querySelectorAll('.a-row.a-size-base.a-color-base:nth-child(1) a.a-size-base.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-bold').forEach( e => {
    e.setAttribute('style', 'background: #FFC562 !important; font-size: 18px !important; color: #0F1111 !important');
  } );
}


function detectWrongBinding() {
  let wrongBinding = document.querySelectorAll('.a-row.a-size-base.a-color-base:nth-child(1) a.a-size-base.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-bold');

  wrongBinding.forEach( (e) => {
    // https://stackoverflow.com/questions/73678256/how-to-make-a-negative-lookahead-ignores-upper-or-lowercase-characters
    let pattern = /^(?!(?:Hardcover|Paperback|(?:Mass Market )?Paperback|Spiral-bound|Plastic Comb)$|.*  )\w.*/

    let re = new RegExp(pattern, "gi");

    e.innerHTML = e.innerText.replace(re, match => `<mark style="background: #FF6D74 !important; font-size: 18px !important">${match}</mark>`);
  } );
}


function detectOtherLang() {
  let language = document.querySelectorAll('.a-section.a-spacing-none.puis-padding-right-small.s-title-instructions-style span.a-size-base.a-color-secondary:nth-child(1)');

  language.forEach( (e) => {
    let pattern = e.innerHTML;

    let re = new RegExp(pattern, "gi");

    e.innerHTML = e.innerText.replace(re, match => `<mark style="background: #FF6D74 !important; font-size: 18px !important">${match}</mark>`);
  } );
}


function highlightPartialMatch() {
  let listingTitle = document.querySelectorAll('.a-size-medium.a-color-base.a-text-normal');

  let patternToIgnore = ['a', 'i'];

  let searchQuery = document.getElementById('twotabsearchtextbox').value.trim().split(' ');

  searchQuery = searchQuery.filter( (e) => { return patternToIgnore.indexOf(e) == -1 ? true : false } );

  searchQuery.sort((a, b) => { return b.length - a.length });

  let re = new RegExp(searchQuery.join('|'), 'gi');

  listingTitle.forEach((e) => {
    e.innerHTML = e.innerText.replace(re, (match) => `<mark>${match}</mark>`);
  });
}


function highlightExactMatch() {
  let searched = document.getElementById("twotabsearchtextbox").value.trim();

  searched = searched.replace(/hardcover |paperback |spiral /gi, "");

  let listingTitleMedium = document.querySelectorAll('.a-size-medium.a-color-base.a-text-normal');

  let listingTitleBasePlus = document.querySelectorAll('.a-size-base-plus.a-color-base.a-text-normal');

  let re = new RegExp(searched, "gi");

  if ( listingTitleMedium.length < listingTitleBasePlus.length ) {
    listingTitleBasePlus.forEach( (e) => {
      e.innerHTML = e.innerText.replace(re, match => `<mark>${match}</mark>`);
    } );
  } else {
    listingTitleMedium.forEach( (e) => {
      e.innerHTML = e.innerText.replace(re, match => `<mark>${match}</mark>`);
    } );
  }
}


document.getElementById("twotabsearchtextbox").addEventListener("input", () => {
  highlightPartialMatch();
});


// dirty way to remove the blur when pressing escape while in input box/search box
document.getElementById('nav-search-bar-form').addEventListener("keydown", e => {
  if ( e.keyCode === 27 ) {
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
  if (previousUrl !== location.href) {
    main();
    setTimeout(() => {previousUrl = location.href}, 2000);
  }
}, 1000);
