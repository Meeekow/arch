const {
  aceVimMap,
  addSearchAlias,
  Clipboard,
  cmap,
  Front,
  getClickableElements,
  Hints,
  imap,
  imapkey,
  map,
  mapkey,
  Normal,
  readText,
  removeSearchAlias,
  RUNTIME,
  tabOpenLink,
  unmap,
  unmapAllExcept,
  Visual,
  vmapkey,
  vunmap
} = api;


// hints will be limited to this characters
// Hints.setCharacters("rtshae");

// align hints to left instead of center
settings.hintAlign = "left";

// where to focus after closing a tab
settings.focusAfterClosed = "last";

// focus first result of matched result in omnibar
settings.focusFirstCandidate = false;

// return to normal mode after yanking
settings.modeAfterYank = "Normal";

// smooth scroll state
settings.smoothScroll = true;

// scroll friction
settings.scrollFriction = 1;

// scroll amount
settings.scrollStepSize = 100;

// cursor location whenever in insert mode
settings.cursorAtEndOfInput = true;

// disable sk
settings.blocklistPattern = /.*monkeytype.com.*|.*whatsapp.com.*/i;


map('F', 'af'); unmap('af');


// 'f'
Hints.style(
  "font-size: 13px; padding: 5px; color: #f8f8f2; background: none; background-color: #282a36; border: solid 1px #282a36;"
);

// 'v'
Hints.style(
  "div{border: solid 1px #ffb86c; padding: 5px; color:#000000; background: none; background-color: #ffb86c; font-size: 13px; color: #282a36;} div.begin{color:#282a36;}", "text"
);


// messenger
if ( self.origin === "https://www.messenger.com" ) {
  settings.cursorAtEndOfInput = false;

  mapkey('i', '#1Focus chat box and enter insert mode', function() {
    Hints.create("*[role=textbox]", Hints.dispatchMouseClick);
  });
};


// reddit
// if ( self.origin === "https://www.reddit.com" ) {
//   location.href=location.href.replace("www.reddit", "old.reddit");
// };


// bookparse
if ( self.origin === "https://bookparse.com" ) {
  settings.scrollStepSize = 50;
}

// remove everything except the ff. to avoid unwanted actions
unmapAllExcept(['j', 'k', 'cs', 'gg', 'gxx', '<Ctrl-i>', '<Esc>'], /bookparse.com\/dashboard\/.\/bookidentification.*/i);

// change scroll target
map('p', 'cs', /bookparse.com\/dashboard\/.\/bookidentification.*/i); unmap('cs', /bookparse.com\/dashboard\/.\/bookidentification.*/i);

// close other tabs
map('c', 'gxx', /bookparse.com\/dashboard\/.\/bookidentification.*/i); unmap('gxx', /bookparse.com\/dashboard\/.\/bookidentification.*/i);

// check if element is in viewport
function inViewport(element) {
  const { top } = element.getBoundingClientRect();
  const { clientHeight } = document.documentElement.querySelector('.sm-card > div');

  if (top > 0 && top < clientHeight) {
    return true;
  }

  return false;
}

// go to next or previous element
function scrollUpOrDown(action) {
  const results = document.querySelectorAll('.sm-card.d-flex');
  let inViewportState = [];
  results.forEach((element) => {
    const state = inViewport(element);
    inViewportState.push(state);
  })

  const isAlignToTop = action === "down" ? false : true;
  let index = action === "down" ? inViewportState.lastIndexOf(true)
                                : inViewportState.indexOf(true);
  const resultsLength = results.length - 1;

  if (index === 0 || index === resultsLength) {
    return;
  } else if (action === "down" && index + 1 <= resultsLength) {
    ++index;
  } else if (action === "up" && index - 1 > -1) {
    --index;
  }
  results[index].scrollIntoView(isAlignToTop);
}

mapkey('d', 'scroll down', function() {
  scrollUpOrDown("down");
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification.*/i} );

mapkey('u', 'scroll up', function() {
  scrollUpOrDown("up");
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification.*/i} );


// switch between not complete and undecided
mapkey('b', 'switch between not complete and undecided', function() {
  const url = location.href;
  const state = document.querySelectorAll('a.mini-navbar-item');
  if (url.indexOf('undecided') > -1) {
    state[0].click();
  } else {
    state[1].click();
  }
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification.*/i} );

// enter assigned ASIN is book is valuable
mapkey('l', 'enter assigned ASIN is book is valuable', function() {
  const ASIN = '0600621987';
  const triggerEvent = ( obj, event ) => {
    const evt = new Event( event, {target: obj, bubbles: true} );
    return obj ? obj.dispatchEvent(evt) : false;
  }
  const el = document.querySelector('.form-control.form-control-second-primary');
  el.value = ASIN;
  triggerEvent(el, 'input');
  Hints.create('.btn-second-primary', Hints.dispatchMouseClick);
  Clipboard.write(' ');
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification.*/i} );

// reset zoom level to default
mapkey('n', 'reset zoom level to default', function() {
  RUNTIME('setZoom', {
    zoomFactor: 0
  });
  RUNTIME('setZoom', {
    zoomFactor: 0.25
  });
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification.*/i} );

// zoom in
mapkey('i', 'zoom in', function() {
  RUNTIME('setZoom', {
    zoomFactor: 0.25
  });
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification.*/i} );

// show hints for 'Use ASIN button'
mapkey('r', 'show hints for Use ASIN button', function() {
  Hints.create(".btn.btn-primary", Hints.dispatchMouseClick);
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification.*/i} );

// focus input box for book details like title, etc.
mapkey('t', 'focus title input box', function() {
  Hints.create(".mb-2 > .form-control.form-control-second-primary", Hints.dispatchMouseClick);
  // Hints.create(".form-nice-control.link-title-input", function(element) {
  //   Front.showEditor(element);
  // });
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification.*/i} );

// dictate book title
mapkey('s', 'dictate book title', function() {
  const button = document.querySelector('#start-dictation-microphone');
  button.click();
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification.*/i} );

// click undecided button and toggle hints for dropdown
mapkey('h', 'click undecided button and toggle hints for dropdown', function() {
  const url = window.location.href;
  const clickReasonButton = () => {
    document.querySelector('.dropdown-body li > button').click();
  }
  if (url.indexOf('notcomplete') > -1) { // 'Not Complete' tab.
    document.querySelector('.btn-outline.mb-2').click();
    setTimeout(clickReasonButton, 100);
  } else { // 'Undecided' tab.
    document.querySelector('.btn.mb-2').click();
    setTimeout(clickReasonButton, 100)
  }
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification.*/i} );

// ASIN box
mapkey('a', 'paste clipboard content, hit submit button', function() {
  const triggerEvent = ( obj, event ) => {
    const evt = new Event( event, {target: obj, bubbles: true} );
    return obj ? obj.dispatchEvent(evt) : false;
  }
  const el = document.querySelector('.form-control.form-control-second-primary');
  if (el.value.length === 0) {
    Clipboard.read( (response) => { el.value = response.data });
  }
  triggerEvent(el, 'input');
  Hints.create('.btn-second-primary', Hints.dispatchMouseClick);
  Clipboard.write(' ');
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification.*/i} );

// get title from recognition software and focus titlebox
mapkey('e', 'get title from recognition software', function() {
  const bookDetails = document.querySelectorAll('.sm-card.d-flex');
  const titleBox = document.querySelector('.mb-2 > .form-control.form-control-second-primary');
  const triggerEvent = ( obj, event ) => {
    const evt = new Event( event, {target: obj, bubbles: true} );
    return obj ? obj.dispatchEvent(evt) : false;
  }
  function f(e) {
    let title = this.querySelector('.d-block').textContent;
    title = title.replace(/^Title:\s|[;|:||,]/gi, '').replace(/&/gi, 'and');
    titleBox.value = title;
    triggerEvent(titleBox, 'input');
    titleBox.focus();
    bookDetails.forEach((e) => {
      e.removeEventListener('click', f);
    })
  }
  bookDetails.forEach((e) => {
    e.addEventListener('click', f);
  })
  Hints.create(".sm-card.d-flex", Hints.dispatchMouseClick);
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification.*/i} );


// Worthpoint || Ebay
if ( self.origin === 'https://www.worthpoint.com' || self.origin === 'https://www.ebay.com' ) {
  settings.scrollStepSize = 150;

  window.onfocus = () => {
    let title = document.querySelector('#queryText_d') || document.querySelector('.gh-tb.ui-autocomplete-input');
    const searchButton = document.querySelector('.wpButton.yellowBtn') || document.querySelector('.btn.btn-prim.gh-spr');
    Clipboard.read(function(response) {
      const t = title.value;
      const r = response.data;
      if (t !== r) {
        title.value = r;
        searchButton.click();
      }
    });
  }
}


unmapAllExcept(['P', 'U', 'j', 'k', 'gg', '<Esc>'], /ebay\.com|worthpoint\.com/i);

// scroll full page down
map('d', 'P', /ebay\.com|worthpoint\.com/i); unmap('P', /ebay\.com|worthpoint\.com/i);

// scroll full page up
map('u', 'U', /ebay\.com|worthpoint\.com/i); unmap('U', /ebay\.com|worthpoint\.com/i);

mapkey('i', 'focus search bar', function() {
  Hints.create('.gh-tb.ui-autocomplete-input', Hints.dispatchMouseClick);
}, {domain: /ebay\.com/i} );

mapkey('i', 'focus search bar', function() {
    Hints.create('#queryText_d', Hints.dispatchMouseClick);
}, {domain: /worthpoint\.com/i} );


// QA
// remove everything except the ff. to avoid unwanted actions
unmapAllExcept(['gg', 'd', 'u', 'j', 'k', 'gxx', '<Esc>'], /bookparse.com\/dashboard\/2\/catalog\/bookparse/i);

// get ASIN and search it in Amazon.com
mapkey('o', 'get ASIN and search it in Amazon.com', function() {
    Hints.create(".box-row", function(e) {
    const imageToCheck = e.querySelector('.align-middle:nth-child(2) > img').src;
    const asinToCheck = e.querySelector('.align-middle:nth-child(5)').textContent;
    window.open(`${imageToCheck}`, '_blank');
    window.open(`https://www.amazon.com/s?k=${asinToCheck}`, '_blank');
  }, Hints.dispatchMouseClick);
}, {domain: /bookparse.com\/dashboard\/2\/catalog\/bookparse/i} );


// lens.google.com
// avoid accidental reloads
unmap('r', /lens.google\.com/i);

// press 'c' instead of 'x' to close window
map('c', 'x', /lens.google\.com/i);

// remap highlight whole element
map('t', 'zv', /lens.google\.com/i);

// yank text detected by lens
mapkey('h', 'yank text detected by lens', function() {
  let result = document.querySelector('.DeMn2d') || document.querySelector('.piBj5') || document.querySelector('.wCgoWb');
  Clipboard.write(result.textContent);
}, {domain: /lens.google\.com/i} );


// amazon
if ( self.origin === "https://www.amazon.com" ) {
  Hints.create("#twotabsearchtextbox", function(element) {
    Clipboard.write(element.value);
  });
}
// avoid accidental reloads
unmap('r', /amazon\.com/i);

// press 'n' instead of 'W' to open focused tab to a new window
map('n', 'W', /amazon\.com/i);

// press 'c' instead of 'x' to close window
map('c', 'x', /amazon\.com/i);

// unmap so we can rebind this to another scrolling option
unmap('d', /amazon\.com/i);
unmap('u', /amazon\.com/i);

// scroll full page down
map('d', 'P', /amazon\.com/i); unmap('P', /amazon\.com/i);

// scroll full page up
map('u', 'U', /amazon\.com/i); unmap('U', /amazon\.com/i);

// track clicked ASIN
let clickedElement;
// yank ASIN value
mapkey('h', 'Yank ASIN Value', function() {
  const ASIN = document.querySelectorAll('.xtaqv-copy');
  function f(e) {
    if (clickedElement !== undefined) {
      clickedElement.removeAttribute('style');
    }
    const elementToStyle = this.closest('.xtaqv-root');
    clickedElement = elementToStyle;
    elementToStyle.setAttribute('style', 'background-color: #BFE6B1 !important');
    ASIN.forEach((e) => {
      e.removeEventListener('click', f);
    })
  }
  ASIN.forEach((e) => {
    e.addEventListener('click', f);
  })
  Hints.create(".xtaqv-copy", Hints.dispatchMouseClick);
}, {domain: /amazon\.com/i} );

// enter insert mode
mapkey('i', 'Focus search box', function() {
  Hints.create("#twotabsearchtextbox", Hints.dispatchMouseClick);
}, {domain: /amazon\.com/i} );

// clear input box and set value to "blank" and enter insert mode
mapkey('gc', 'Set input value to blank', function() {
  document.querySelector('#twotabsearchtextbox').value="";
  Hints.create("#twotabsearchtextbox", Hints.dispatchMouseClick);
}, {domain: /amazon\.com/i} );

// clear input box and set value to "hardcover" and enter insert mode
mapkey('gh', 'Set input value to hardcover', function() {
  document.querySelector('#twotabsearchtextbox').value="hardcover ";
  Hints.create("#twotabsearchtextbox", Hints.dispatchMouseClick);
}, {domain: /amazon\.com/i} );

// clear input box and set value to "paperback" and enter insert mode
mapkey('gp', 'Set input value to paperback', function() {
  document.querySelector('#twotabsearchtextbox').value="paperback ";
  Hints.create("#twotabsearchtextbox", Hints.dispatchMouseClick);
}, {domain: /amazon\.com/i} );

// clear input box and set value to "spiral bound" and enter insert mode
mapkey('gs', 'Set input value to spiral', function() {
  document.querySelector('#twotabsearchtextbox').value="spiral ";
  Hints.create("#twotabsearchtextbox", Hints.dispatchMouseClick);
}, {domain: /amazon\.com/i} );

// yank values from input box without pressing hints key
mapkey('yi', 'Yank text from search box', function() {
  Hints.create("#twotabsearchtextbox", function(element) {
    Clipboard.write(element.value);
  });
}, {domain: /amazon\.com/i} );

// yank values from input box without pressing hints key
mapkey('sa', 'Site specific search', function() {
  window.close();
  window.open(`https://www.google.com/search?q=site:amazon.com+"${document.getElementById('twotabsearchtextbox').value}"`);
}, {domain: /amazon\.com/i} );


// bookrun
if ( self.origin === 'https://www.google.com' ) {
  mapkey('<Space>', 'press verify/next', function() {
    Hints.create('.rc-button-default.goog-inline-block', Hints.dispatchMouseClick);
  });
}


// add amazon search aliases
// addSearchAlias('h', 'amazon hardcover', 'https://www.amazon.com/s?k={0}&rh=n%3A283155%2Cp_n_feature_browse-bin%3A2656020011');
// addSearchAlias('p', 'amazon paperback', 'https://www.amazon.com/s?k={0}&rh=n%3A283155%2Cp_n_feature_browse-bin%3A2656022011');
