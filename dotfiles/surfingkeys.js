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
settings.scrollFriction = 0;

// scroll amount
settings.scrollStepSize = 75;

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
unmapAllExcept(['gg', 'j', 'k', 'd', 'u', 'cs', 'gxx', '<Ctrl-i>', '<Esc>'], /bookparse.com\/dashboard\/*\/*/i);

// change scroll target
map('p', 'cs', /bookparse.com\/dashboard\/*\/*/i); unmap('cs', /bookparse.com\/dashboard\/*\/*/i);

// close other tabs
map('c', 'gxx', /bookparse.com\/dashboard\/*\/*/i); unmap('gxx', /bookparse.com\/dashboard\/*\/*/i);

// switch between not complete and undecided
mapkey('b', 'switch between not complete and undecided', function() {
  const url = location.href;
  const state = document.querySelectorAll('a.mini-navbar-item');
  if (url.indexOf('undecided') > -1) {
    state[0].click();
  } else {
    state[1].click();
  }
}, {domain: /bookparse.com\/dashboard\/*\/*/i} );

// reset zoom level to default
mapkey('n', 'reset zoom level to default', function() {
  RUNTIME('setZoom', {
    zoomFactor: 0
  });
  RUNTIME('setZoom', {
    zoomFactor: 0.25
  });
}, {domain: /bookparse.com\/dashboard\/*\/*/i} );

// zoom in
mapkey('i', 'zoom in', function() {
  RUNTIME('setZoom', {
    zoomFactor: 0.25
  });
}, {domain: /bookparse.com\/dashboard\/*\/*/i} );

// show hints for 'Use ASIN button'
mapkey('r', 'show hints for Use ASIN button', function() {
  Hints.create(".btn.btn-primary", Hints.dispatchMouseClick);
}, {domain: /bookparse.com\/dashboard\/*\/*/i} );

// focus input box for book details like title, etc.
mapkey('t', 'focus title input box', function() {
  Hints.create(".mb-2 > .form-control.form-control-second-primary", Hints.dispatchMouseClick);
  // Hints.create(".form-nice-control.link-title-input", function(element) {
  //   Front.showEditor(element);
  // });
}, {domain: /bookparse.com\/dashboard\/*\/*/i} );

// dictate book title
mapkey('s', 'dictate book title', function() {
  const button = document.querySelector('#dictation-microphone');
  button.click();
}, {domain: /bookparse.com\/dashboard\/*\/*/i} );

// click undecided button and toggle hints for dropdown
mapkey('h', 'click undecided button and toggle hints for dropdown', function() {
  // Hints.create(".btn.mb-2", Hints.dispatchMouseClick);
  // setTimeout(() => { Hints.create("li > button", Hints.dispatchMouseClick) }, 100);
  document.querySelector('.btn.mb-2').click();
  setTimeout(() => {
    const list = document.querySelector('.dropdown-body li > button');
    list.click();
  }, 100);
}, {domain: /bookparse.com\/dashboard\/*\/*/i} );

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
}, {domain: /bookparse.com\/dashboard\/*\/*/i} );

// get title from recognition software and focus titlebox
mapkey('e', 'get title from recognition softwaren', function() {
  const triggerEvent = ( obj, event ) => {
    const evt = new Event( event, {target: obj, bubbles: true} );
    return obj ? obj.dispatchEvent(evt) : false;
  }
  const result = document.querySelector('.d-block').firstChild.nextSibling;
  const titleBox = document.querySelector('.mb-2 > .form-control.form-control-second-primary');
  titleBox.value = result.textContent;
  triggerEvent(titleBox, 'input');
  Hints.create(".mb-2 > .form-control.form-control-second-primary", Hints.dispatchMouseClick);
}, {domain: /bookparse.com\/dashboard\/*\/*/i} );


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
// avoid accidental reloads
unmap('r', /amazon\.com/i);

// press 'n' instead of 'W' to open focused tab to a new window
map('n', 'W', /amazon\.com/i);

// press 'c' instead of 'x' to close window
map('c', 'x', /amazon\.com/i);

// track clicked ASIN
let clickedElement = [];
// yank ASIN value
mapkey('h', 'Yank ASIN Value', function() {
  Hints.create(".xtaqv-copy", (element) => {
    // copy ASIN
    Clipboard.write(element.textContent);

    // remove style on all other ASIN boxes
    // only one highlighted ASIN box at any given time
    clickedElement.forEach( element => { element.removeAttribute('style') } );

    // apply style to ASIN box that we 'clicked'
    element.closest('.xtaqv-root').setAttribute('style', 'background-color: #BFE6B1 !important');

    // track ASIN box so we can remove applied style later
    clickedElement.push(element.closest('.xtaqv-root'));
  }, Hints.dispatchMouseClick);
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
