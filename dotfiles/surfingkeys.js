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
if ( self.origin === "https://www.reddit.com" ) {
  location.href=location.href.replace("www.reddit", "old.reddit");
};


// manga4life.com
if ( self.origin === "https://www.manga4life.com" || self.origin === "https://www.asurascans.com" ) {
  mapkey('i', '#1Focus username input box', function() {
      document.querySelector('input[type=email]').focus();
  }, {domain: /manga4life\.com/i} );

  mapkey('h', '#1Go to subscription', function() {
      window.open("https://www.manga4life.com/user/subscription.php", "_self");
  }, {domain: /manga4life\.com/i} );

  mapkey('zi', '#3Zoom in', function() {
    RUNTIME('setZoom', {
      zoomFactor: 0
    });

    RUNTIME('setZoom', {
      zoomFactor: 0.5
    });
  });

  mapkey('zo', '#3Zoom out', function() {
    RUNTIME('setZoom', {
      zoomFactor: 0
    });
  });
};


// bookparse
// remove everything except the ff. to avoid unwanted actions
unmapAllExcept(['r', 'l', 'h', 'gxx', '<Ctrl-i>', '<Esc>'], /bookparse\.com\/fulfilltasks/i);

map('n', 'l', /bookparse\.com\/fulfilltasks/i); unmap('l', /bookparse\.com\/fulfilltasks/i);
map('i', 'h', /bookparse\.com\/fulfilltasks/i); unmap('h', /bookparse\.com\/fulfilltasks/i);

map('c', 'gxx', /bookparse\.com\/fulfilltasks/i); unmap('gxx', /bookparse\.com\/fulfilltasks/i);

// activate voice detection
mapkey('s', 'activate voice detection', function() {
  if(document.querySelector(".form-nice-control.link-title-input")) {
    Hints.create(".form-nice-control.link-title-input", Hints.dispatchMouseClick);
    document.querySelector('.form-nice-control.link-title-input').blur();
    document.getElementById('dictation-microphone').click();
  }
}, {domain: /bookparse\.com\/fulfilltasks/i} );

// focus input box for book details like title, etc.
mapkey('t', 'focus title input box', function() {
  Hints.create(".form-nice-control.link-title-input", Hints.dispatchMouseClick);
}, {domain: /bookparse\.com\/fulfilltasks/i} );

// simulate click on the generated amazon link
mapkey('f', 'click amazon generated link', function() {
  document.querySelector('.form-nice-readonly-control.link-preview-value').click();
}, {domain: /bookparse\.com\/fulfilltasks/i} );

// open current image url to google lens
mapkey('e', 'open in google lens', function() {
  window.open(`https://lens.google.com/uploadbyurl?url=${document.querySelector(".fulfillment-container .w-100").src}`);
}, {domain: /bookparse\.com\/fulfilltasks/i} );

// paste clipboard value to title box and enter insert mode
mapkey('p', 'paste clipboard value and enter insert mode', function() {
  Clipboard.read( (response) => {
    document.querySelector('.form-nice-control.link-title-input').value = response.data;
  });
  Hints.create(".form-nice-control.link-title-input", Hints.dispatchMouseClick);
}, {domain: /bookparse\.com\/fulfilltasks/i} );

// ASIN box
mapkey('a', 'paste clipboard content, hit submit button', function() {
  Clipboard.read( (response) => {
    document.querySelector('.form-nice-control.asin-submission-value').value = response.data;
    Hints.create(".fulfill-btn.btn.btn-primary", Hints.dispatchMouseClick);
  });
}, {domain: /bookparse\.com\/fulfilltasks/i} );

// click undecided button and toggle hints for dropdown
mapkey('h', 'click undecided button and toggle hints for dropdown', function() {
  if(document.querySelector('button[aria-expanded="false"]')) {
    Hints.create(".fulfill-btn.btn.btn-outline-primary.dropdown-toggle-split", Hints.dispatchMouseClick);
  } else {
    Hints.create("button.fulfill-btn.btn.w-100", Hints.dispatchMouseClick);
  }
}, {domain: /bookparse\.com\/fulfilltasks/i} );

// click exit
mapkey('b', 'click exit', function() {
  document.querySelector('.mx-3.mt-2.link-task').click();
}, {domain: /bookparse\.com\/fulfilltasks/i} );


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


// add amazon search aliases
addSearchAlias('h', 'amazon hardcover', 'https://www.amazon.com/s?k={0}&rh=n%3A283155%2Cp_n_feature_browse-bin%3A2656020011');
addSearchAlias('p', 'amazon paperback', 'https://www.amazon.com/s?k={0}&rh=n%3A283155%2Cp_n_feature_browse-bin%3A2656022011');

