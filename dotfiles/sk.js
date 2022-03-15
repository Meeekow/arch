const {
    aceVimMap,
    mapkey,
    imap,
    imapkey,
    getClickableElements,
    vmapkey,
    map,
    unmap,
    unmapAllExcept,
    vunmap,
    cmap,
    addSearchAlias,
    removeSearchAlias,
    tabOpenLink,
    readText,
    Clipboard,
    Front,
    Hints,
    Visual,
    Normal,
    RUNTIME
} = api;

// hints will be limited to this chars;
Hints.setCharacters("aoeui");

// align hints to left instead of center;
settings.hintAlign = "left";

// smooth scroll state;
settings.smoothScroll = true;

// scroll friction
settings.scrollFriction = 0;

// scroll amount
settings.scrollStepSize = 80;

// cursor location whenever in insert mode
settings.cursorAtEndOfInput = true;

// workaround for 'i' command in 'messenger.com'
if ( self.origin === "https://www.messenger.com" ) {
  settings.cursorAtEndOfInput = false;
};


const HK = [
  // special chars
  '<Esc>', '/', '[[', ']]', ':', '?',

  // move cursor in insert mode
  '<Ctrl-">', '<Ctrl-e>', '<Ctrl-f>', '<Ctrl-u>',

  // edit boxes
  'gi',

  // cycle through result of '/'
  'n', 'N',

  // tabs / url
  'gu',

  // yank
  'yv',

  // screenshot
  'yg', 'yG',

  // change scrollable frame
  'cS', ';fs',

  // misc
  'v'
];


unmapAllExcept(HK);


// MOTION NAVIGATION
mapkey('j', '#1Scroll Down', function() {
  Normal.scroll('down');
});
mapkey('k', '#1Scroll Up', function() {
  Normal.scroll('up');
});
mapkey('h', '#1Scroll Left', function() {
  Normal.scroll('left');
});
mapkey('l', '#1Scroll Right', function() {
  Normal.scroll('right');
});
mapkey('u', '#1Half Page Up', function() {
  Normal.scroll('pageUp');
});
mapkey('d', '#1Half Page Down', function() {
  Normal.scroll('pageDown');
});
mapkey('gg', '#1Top', function() {
  Normal.scroll('top');
});
mapkey('G', '#1Bottom', function() {
  Normal.scroll('bottom');
});

// HISTORY NAVIGATION
mapkey('H', '#4Go back in history', function() {
  history.go(-1);
}, {repeatIgnore: true});
mapkey('L', '#4Go forward in history', function() {
  history.go(1);
}, {repeatIgnore: true});
mapkey('r', '#4Reload the page', function() {
  RUNTIME("reloadTab", { nocache: false });
});

// LINKS NAVIGATION
mapkey('f', '#1Open a link in non-active new tab', function() {
        Hints.create("", Hints.dispatchMouseClick);
});
mapkey('af', '#1Open a link in active new tab', function() {
        Hints.create("", Hints.dispatchMouseClick, {tabbed: true, active: true});
});
mapkey('F', '#1Open a link in non-active new tab', function() {
        Hints.create("", Hints.dispatchMouseClick, {tabbed: true, active: false});
});
mapkey('cf', '#1Open multiple links in a new tab', function() {
        Hints.create("", Hints.dispatchMouseClick, {multipleHits: true});
});

// EDIT BOX
mapkey('i', '#2Go to edit box', function() {
  Hints.create("input, textarea, *[contenteditable=true], *[role=textbox], select, div.ace_cursor", Hints.dispatchMouseClick);
});

// TAB NAVIGATION
mapkey('x', '#3Close current tab', function() {
  RUNTIME("closeTab");
});
mapkey('X', '#3Restore closed tab', function() {
  RUNTIME("openLast");
});
mapkey('yt', '#3Duplicate current tab', function() {
  RUNTIME("duplicateTab");
});
mapkey('yT', '#3Duplicate current tab in background', function() {
  RUNTIME("duplicateTab", {active: false});
});
mapkey('on', '#3Open a new tab', function() {
  tabOpenLink("about:blank");
});
mapkey('<<', '#3Move current tab to left', function() {
  RUNTIME('moveTab', {
    step: -1
  });
});
mapkey('>>', '#3Move current tab to right', function() {
  RUNTIME('moveTab', {
    step: 1
  });
});
mapkey('J', '#3Switch focus to left side tab', function() {
  RUNTIME('previousTab')
});
mapkey('K', '#3Switch focus to right side tab', function() {
  RUNTIME('nextTab')
});

// YANK
mapkey('yy', "#7Copy current page URL", function() {
  var url = window.location.href;
  if (url.indexOf(chrome.extension.getURL("/pages/pdf_viewer.html")) === 0) {
    url = window.location.search.substr(3);
  }
  Clipboard.write(url);
});

// URL
mapkey('t', '#8Open a URL in another tab', function() {
  Front.openOmnibar({type: "URLs"});
});
mapkey('o', '#8Open a URL in current tab', function() {
  Front.openOmnibar({type: "URLs", tabbed: false});
});

// MISC
mapkey('gU', '#4Go to root of current URL hierarchy', function() {
  window.location.href = window.location.origin;
});
mapkey(';e', '#11Edit Settings', function() {
  tabOpenLink("/pages/options.html");
});

// 'f' HINTS STYLE
Hints.style(
  "font-size: 15px; padding: 1px; color: black; background: none; background-color: gold;"
);
// 'v' HINTS STYLE
Hints.style(
  "div{color: black; background: none; background-color: teal;} div.begin{color: black;}",
  "text"
);
