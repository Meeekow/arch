const {
    Clipboard,
    Front,
    Hints,
    //Normal,
    RUNTIME,
    Visual,
    aceVimMap,
    addSearchAlias,
    cmap,
    getClickableElements,
    imap,
    imapkey,
    map,
    mapkey,
    readText,
    removeSearchAlias,
    tabOpenLink,
    unmap,
    unmapAllExcept,
    vmapkey,
    vunmap
} = api;


const HK = [
  // help section
  '<Esc>', '?', '.',

  // mouse click section
  'f', 'af', 'cf', 'gf',
  '[[', ']]',
  'i', 'gi',
  'q', ';fs',

  // scroll page/element
  '0', '$',
  'cS',
  'u', 'd',
  'gg', 'G',
  'j', 'k', 'h', 'l',

  // tabs section
  'yt', 'yT',
  'g0', 'g$',
  'gx0', 'gx$', 'gxx',
  'E', 'R', 'T',
  '<Alt-p>', '<Alt-m>',
  'on', 'x', 'X', 'W',
  '<<', '>>',

  // page navigation section
  'gu', 'gU',
  'S', 'D',
  'r',

  // clipboard section
  'yg', 'yG',
  'yv', 'yi', 'yy',

  // omnibar section
  'go', 'oi', 'oh',
  ':',

  // visual mode section
  '/', 'v', 'V',
  '*', 'n', 'N',

  // settings section
  ';e'
];


unmapAllExcept(HK);


/* * * * * * * * * *
 *                 *
 * VIMIUM BINDINGS *
 *                 *
 * * * * * * * * * */

// open link in a new non active tab
map('F', 'gf');
unmap('C'); unmap('gf');

// open a new active tab
map('t', 'on');
unmap('on');

// open a url in the same tab
map('o', 'go');
unmap('go');

// open a url in a new active tab
mapkey('O', '#8Open a URL in new tab', function() {
  Front.openOmnibar({type: "URLs", tabbed: true});
});

// go back/forward in history
map('H', 'S');
map('L', 'D');
unmap('S'); unmap('D');

// switch tab in focus
map('J', 'E');
map('K', 'R');
unmap('E'); unmap('R');

// reset to original scroll focus when page loads
map('cs', 'cS');
unmap('cS');


/* * * * * * * * * * * *
 *                     *
 * EXTENSION BEHAVIOR  *
 *                     *
 * * * * * * * * * * * */

// hints will be limited to this characters
Hints.setCharacters("aoeui");

// align hints to left instead of center
settings.hintAlign = "left";

// where to focus after closing a tab
settings.focusAfterClosed = "last";

// focus first result of matched result in omnibar
settings.focusFirstCandidate = true;

// smooth scroll state
settings.smoothScroll = true;

// scroll friction
settings.scrollFriction = 0;

// scroll amount
settings.scrollStepSize = 50;

// cursor location whenever in insert mode
settings.cursorAtEndOfInput = true;

// workaround for 'i' command in 'messenger.com'
if ( self.origin === "https://www.messenger.com" ) {
  settings.cursorAtEndOfInput = false;

  mapkey('i', '#2Go to edit box', function() {
    Hints.create("*[role=textbox]", Hints.dispatchMouseClick);
  });
};


/* * * * * * * * * * *
 *                   *
 * VISUAL AESTHETICS *
 *                   *
 * * * * * * * * * * */

// 'f' HINTS STYLE
Hints.style(
  "font-size: 15px; padding: 1px; color: black; background: none; background-color: gold;"
);

// 'v' HINTS STYLE
Hints.style(
  "div{border: solid 2px black; padding: 2px; color: black; background: none; background-color: skyblue;} div.begin{color: black;}",
  "text"
);
