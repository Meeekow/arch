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


function removeGarbageData() {
  // book binding data from ds amazon quick view
  document.querySelectorAll('.a-row.a-spacing-mini').forEach(e => {
    e.remove();
  } );

  // price
  document.querySelectorAll('.a-row.a-size-base.a-color-base:nth-child(2)').forEach( e => {
    e.remove();
  } );

  // delivery
  document.querySelectorAll('.a-row.a-size-base.a-color-secondary.s-align-children-center').forEach( e => {
    e.remove();
  } );

  // more buying choices
  document.querySelectorAll('.a-row.a-size-base.a-color-secondary:nth-child(1)').forEach( e => {
    e.remove();
  } );

  // age
  document.querySelectorAll('.a-section.a-spacing-none.a-spacing-top-micro.s-product-grid-adjustment').forEach( e => {
    e.remove();
  } );

  // get free / free with audible trial
  document.querySelectorAll('.a-row.a-size-small.a-color-secondary').forEach( e => {
    e.remove();
  } );

  // other format(s)
  document.querySelectorAll('.a-row.a-spacing-top-micro.a-size-small.a-color-base').forEach( e => {
    e.remove();
  } );
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


function highlightPartialMatch() {
  let searched = document.getElementById("twotabsearchtextbox").value.trim().split(" ");

  let listingTitleMedium = document.querySelectorAll('.a-size-medium.a-color-base.a-text-normal');

  let listingTitleBasePlus = document.querySelectorAll('.a-size-base-plus.a-color-base.a-text-normal');

  let re = new RegExp(searched.join("|"), "gi");

  if ( listingTitleMedium.length < listingTitleBasePlus.length ) {
    listingTitleBasePlus.forEach( (e) => {
      e.innerHTML = e.innerText.replace( re, match => `<mark>${match}</mark>` );
    } );
  } else {
    listingTitleMedium.forEach( (e) => {
      e.innerHTML = e.innerText.replace( re, match => `<mark>${match}</mark>` );
    } );
  }
}


document.getElementById("twotabsearchtextbox").addEventListener("input", () => {
  // highlightExactMatch();
  highlightPartialMatch();
});


// dirty way to remove the blur when pressing escape while in input box/search box
document.getElementById('nav-search-bar-form').addEventListener("keydown", e => {
  if ( e.keyCode === 27 ) {
    // simulate a click to the amazon logo at the top left
    document.getElementById('nav-logo-sprites').click();
  }
});


function main() {
  removeGarbageData();
  changeBindingFontSize();
  detectWrongBinding();
  detectOtherLang();
  highlightPartialMatch();
}


setTimeout(main(), 5000); // 5 seconds


// no idea what event for url change
// naive implementation for now

// store current url
let currentPage = location.href;

// wait for x time then
setInterval( () => {
  // if current url is not equal to the previous url
  if ( currentPage != location.href) {
    // run main function
    main();

    // then wait x time before updating previous url to the current url
    setTimeout(() => {currentPage = location.href;}, 2000); // 2 seconds
  }
}, 5 * 100 ); // 500ms
