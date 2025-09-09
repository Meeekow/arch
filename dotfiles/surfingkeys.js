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
  Hints.setCharacters("haei");
  settings.scrollStepSize = 50;
}

// remove everything except the ff. to avoid unwanted actions
unmapAllExcept(['j', 'k', 'cs', 'gg', 'gxx', '<Ctrl-i>', '<Esc>'], /bookparse.com\/dashboard\/.\/review-task.*/i);

// change scroll target
map('p', 'cs', /bookparse.com\/dashboard\/.\/bookidentification.*/i); unmap('cs', /bookparse.com\/dashboard\/.\/review-task.*/i);

// trigger event so that new value would reflect
function triggerEvent(obj, event) {
  const evt = new Event(event, {target: obj, bubbles: true});
  return obj ? obj.dispatchEvent(evt) : false;
}

// scroll to next/previous element
function scrollUpOrDown(action) {
  const cards = document.querySelectorAll('.css-2dg54o');
  const callback = ((entries, io) => {
    let state = [];

    entries.forEach((entry) => {
      state.push(entry.isIntersecting)
      io.disconnect();
    })

    const resultsLength = state.length - 1;

    let index = action === 'down' ? state.lastIndexOf(true)
                                  : state.indexOf(true);

    const isAlignToTop = action === 'down' ? false : true;

    if (index === 0 || index === resultsLength) {
      cards[index].scrollIntoView(isAlignToTop);
    } else if (action === "down" && index + 1 <= resultsLength) {
      ++index;
    } else if (action === "up" && index - 1 > -1) {
      --index;
    }

    cards[index].scrollIntoView(isAlignToTop);
  })

  const options = ({threshold: 0.50});
  const observer = new IntersectionObserver(callback, options);

  cards.forEach((c) => {
    observer.observe(c);
  })
}

mapkey('d', 'Scroll Down', function() {
  scrollUpOrDown("down");
}, {domain: /bookparse.com\/dashboard\/.\/review-task.*/i} );

mapkey('u', 'Scroll Up', function() {
  scrollUpOrDown("up");
}, {domain: /bookparse.com\/dashboard\/.\/review-task.*/i} );

// Focus the input box for book titles
mapkey('t', 'Focus the input box for book titles', function() {
  const bookTitleBox = document.querySelector('.custom-input.w-full');
  bookTitleBox.focus();
}, {domain: /bookparse.com\/dashboard\/.\/review-task.*/i} );

// Click the "Submit Review" button and close the tab after 1.5 seconds
mapkey('s', 'Click the "Submit Review"', function() {
  Hints.create(".custom-button.w-full.css-gefgn7", Hints.dispatchMouseClick);
  setTimeout(() => {
    window.close();
  }, 1500);
}, {domain: /bookparse.com\/dashboard\/.\/review-task.*/i} );

// Open task image in a new tab
mapkey('h', 'Open task image in a new tab', function() {
  const image = document.querySelector('.css-6pg88b > img');
  window.open(image.src);
}, {domain: /bookparse.com\/dashboard\/.\/review-task.*/i} );


unmapAllExcept(['gg', '<Ctrl-i>'], /bookparse.com\/dashboard\/.\/bookidentification\/not\-complete.*/i);

mapkey('d', 'Scroll Down', function() {
  scrollUpOrDown("down");
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification\/not\-complete.*/i} );

mapkey('u', 'Scroll Up', function() {
  scrollUpOrDown("up");
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification\/not\-complete.*/i} );

// Click the "Submit Review" button
mapkey('s', 'Click the "Submit Review"', function() {
  Hints.create(".custom-button.css-dm0erh", Hints.dispatchMouseClick);
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification\/not\-complete.*/i} );

// Click the "Undecided" button
mapkey('h', 'Click the "Submit Review"', function() {
  // const element = document.querySelector('.custom-button-2.css-dm0erh') || document.querySelector('.custom-button.css-dm0erh');
  // element.click();
  Hints.create(".custom-button-2.css-dm0erh", Hints.dispatchMouseClick);
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification\/not\-complete.*/i} );

// Grab book title from recognition software
mapkey('a', 'Grab book title from recognition software"', function() {
  Hints.create(".new-sm-label.new-mb-1", function(title) {
    const inputBox = document.querySelector('.custom-input.w-full');
    inputBox.value = title.textContent;
    triggerEvent(inputBox, 'input');
    inputBox.focus();
    inputBox.blur();
  });
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification\/not\-complete.*/i} );

// Grab book title from recognition software
mapkey('e', 'Focus input box for book titles"', function() {
  Hints.create(".custom-input.w-full", Hints.dispatchMouseClick);
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification\/not\-complete.*/i} );

// Click the "Master" button
mapkey('t', 'Click the "Submit Review"', function() {
  // Hints.create(".new-sm-label.css-k48934", function(element) {
  Hints.create(".css-gywnln.buttonVisible", function(element) {
    element.click();
  });
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification\/not\-complete.*/i} );

// Click the "Alternative" buttons
mapkey('r', 'Click the "Submit Review"', function() {
  // Hints.create(".new-sm-label.css-k48934", function(element) {
  Hints.create(".css-7pjmqk.buttonVisible", function(element) {
    element.click();
  });
}, {domain: /bookparse.com\/dashboard\/.\/bookidentification\/not\-complete.*/i} );


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
