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
Hints.setCharacters("rtshae");

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


// bookparse
if ( self.origin === "https://bookparse.com" ) {
  Hints.setCharacters("tshae");
  settings.scrollStepSize = 50;
}

// remove everything except the ff. to avoid unwanted actions
unmapAllExcept(['j', 'k', 'cs', 'gg', 'gxx', '<Ctrl-i>', '<Esc>'], /bookparse.com\/dashboard\/.\/bookidentification.*/i);

// change scroll target
map('p', 'cs', /bookparse.com\/dashboard\/.\/bookidentification.*/i); unmap('cs', /bookparse.com\/dashboard\/.\/bookidentification.*/i);

// trigger event so that new value would reflect
function triggerEvent(obj, event) {
  const evt = new Event(event, {target: obj, bubbles: true});
  return obj ? obj.dispatchEvent(evt) : false;
}

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
mapkey('l', 'valuable book', function() {
  const ASIN = '0600621987';
  const el = document.querySelector('.form-control.form-control-second-primary');
  el.value = ASIN;
  triggerEvent(el, 'input');
  document.querySelector('.btn-second-primary').click();
  Clipboard.write(' ');
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification.*/i} );

// enter assigned ASIN is book is valuable
mapkey('w', 'medium valuable', function() {
  const ASIN = 'B0006XVY3S';
  const el = document.querySelector('.form-control.form-control-second-primary');
  el.value = ASIN;
  triggerEvent(el, 'input');
  document.querySelector('.btn-second-primary').click();
  Clipboard.write(' ');
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification.*/i} );

// show hints for 'Use ASIN button'
mapkey('r', 'show hints for Use ASIN button', function() {
  Hints.create(".btn.btn-primary", Hints.dispatchMouseClick);
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification.*/i} );

// focus input box for book details like title, etc.
mapkey('t', 'focus title input box', function() {
  Hints.create(".mb-2 > .form-control.form-control-second-primary", Hints.dispatchMouseClick);
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
  const el = document.querySelector('.form-control.form-control-second-primary');
  if (el.value.length === 0) {
    Clipboard.read( (response) => { el.value = response.data });
  }
  triggerEvent(el, 'input');
  document.querySelector('.btn-second-primary').click();
  Clipboard.write(' ');
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification.*/i} );

// get title from recognition software and focus titlebox
mapkey('e', 'get title from recognition software', function() {
  const titleBox = document.querySelector('.mb-2 > .form-control.form-control-second-primary');
  Hints.create(".sm-card.d-flex", function(element) {
    let title = element.querySelector('.d-block').textContent;
    title = title.replace(/^Title:\s|[;|:||,]/gi, '').replace(/&/gi, 'and');
    titleBox.value = title;
    triggerEvent(titleBox, 'input');
    titleBox.focus();
  });
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification.*/i} );

// click asin link that opens in new tab
mapkey('f', 'dictate book title', function() {
  Hints.create("a.link.d-block", Hints.dispatchMouseClick);
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification.*/i} );


// Worthpoint || Ebay
unmapAllExcept(['F', 'P', 'U', 'j', 'k', 'gg', '<Esc>'], /ebay\.com|worthpoint\.com/i);

map('f', 'F', /ebay\.com|worthpoint\.com/i); unmap('F', /ebay\.com|worthpoint\.com/i);

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


// amazon
unmapAllExcept(['F', 'P', 'U', 'j', 'k', 'gg', '<Esc>'], /amazon\.com/i);

map('f', 'F', /amazon\.com/i); unmap('F', /amazon\.com/i);

// scroll full page down
map('d', 'P', /amazon\.com/i); unmap('P', /amazon\.com/i);

// scroll full page up
map('u', 'U', /amazon\.com/i); unmap('U', /amazon\.com/i);

// track clicked ASIN
let clickedElement;
// yank ASIN value
mapkey('h', 'Yank ASIN Value', function() {
  Hints.create(".xtaqv-copy", function(element) {
    if (clickedElement !== undefined) {
      clickedElement.removeAttribute('style');
    }
    const elementToStyle = element.closest('.xtaqv-root');
    clickedElement = elementToStyle;
    elementToStyle.setAttribute('style', 'background-color: #BFE6B1 !important');
    Clipboard.write(element.textContent);
  });
}, {domain: /amazon\.com/i} );

// enter insert mode
mapkey('i', 'Focus search box', function() {
  Hints.create("#twotabsearchtextbox", Hints.dispatchMouseClick);
}, {domain: /amazon\.com/i} );

// yank values from input box without pressing hints key
mapkey('yi', 'Yank text from search box', function() {
  Hints.create("#twotabsearchtextbox", function(element) {
    Clipboard.write(element.value);
  });
}, {domain: /amazon\.com/i} );
