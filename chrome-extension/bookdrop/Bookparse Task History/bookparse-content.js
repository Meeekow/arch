const waitForElement = (selector, callback, isArray = false, shouldMonitor = false, options = { childList: true, subtree: true }) => {
  const observer = new MutationObserver(function(mutations, mo) {
    const element = isArray ? document.querySelectorAll(selector) : document.querySelector(selector);
    if (element) {
      if (!shouldMonitor) { mo.disconnect() };
      callback(element);
    }
  });
  observer.observe(document, options);
}

// Highlight keywords in listing titles
const highlightKeywords = () => {
  const keywords = [
    'series',
    'set(?:s)?',
    'book(?:s)?',
    'year(?:s)?',
    'volume(?:s)?',
    'edition(?:s)?',
    'collection(?:s)?'
  ];
  const regex = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");
  const listingTitle = document.querySelectorAll('.new-sm-label.new-mb-1');

  listingTitle.forEach((el) => {
    // Skip if already processed
    if (el.dataset.keywordsHighlighted === "true") return;

    el.innerHTML = el.innerHTML.replace(regex, (match) => {
      return `<mark class="warning-keywords" !important; style="background: orange !important; font-size: 18px !important">${match}</mark>`;
    });

    // Mark as processed
    el.dataset.keywordsHighlighted = "true";
  });
};
waitForElement('.new-sm-label.new-mb-1', highlightKeywords, true, true);

// Highlight keywords in listing titles base on what the user types
const highlightUserQuery = () => {
  const bookTitleInputBox = document.querySelector('.custom-input.w-full');

  if (!bookTitleInputBox || bookTitleInputBox.dataset.listenerAttached === "true") {
    return; // Already attached or element not found
  }

  function handleBlur() {
    const value = bookTitleInputBox.value.trim();
    const listingTitle = document.querySelectorAll('.new-sm-label.new-mb-1');

    if (value.length > 0) {
      const keywords = value.split(" ").filter(Boolean);
      const regex = new RegExp(`\\b(${keywords.join("|")})\\b`, 'gi');

      listingTitle.forEach((el) => {
        removeQueriedKeywordMarks(el); // clean up first

        // Walk through text nodes and apply highlighting if not inside warning-keywords
        walkAndHighlight(el, regex);
      });
    } else {
      listingTitle.forEach((el) => {
        removeQueriedKeywordMarks(el);
      });
    }
  }

  function removeQueriedKeywordMarks(element) {
    const container = document.createElement('div');
    container.innerHTML = element.innerHTML;

    container.querySelectorAll('mark.queried-keywords').forEach((mark) => {
      mark.replaceWith(document.createTextNode(mark.textContent));
    });

    element.innerHTML = container.innerHTML;
  }

  function walkAndHighlight(node, regex) {
    const treeWalker = document.createTreeWalker(
      node,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (textNode) {
          // Skip empty text
          if (!textNode.textContent.trim()) return NodeFilter.FILTER_REJECT;

          // Skip if parent is already a warning-keywords mark
          const parent = textNode.parentElement;
          if (parent && parent.tagName === 'MARK' && parent.classList.contains('warning-keywords')) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      },
      false
    );

    const textNodes = [];

    // Store matches first (so we don't modify DOM during traversal)
    while (treeWalker.nextNode()) {
      textNodes.push(treeWalker.currentNode);
    }

    textNodes.forEach((textNode) => {
      const originalText = textNode.textContent;
      const replacedHTML = originalText.replace(regex, (match) => {
        return `<mark class="queried-keywords" style="background: #B4FF9F !important; font-size: 18px !important;">${match}</mark>`;
      });

      if (replacedHTML !== originalText) {
        const wrapper = document.createElement('span');
        wrapper.innerHTML = replacedHTML;
        textNode.replaceWith(...wrapper.childNodes);
      }
    });
  }

  bookTitleInputBox.addEventListener('blur', handleBlur);
  bookTitleInputBox.dataset.listenerAttached = "true"; // mark as attached
};
waitForElement('.custom-input.w-full', highlightUserQuery, false, true);


// Add a class on visible buttons for SurfingKeys
const findVisibleButton = () => {
  let callback = (entries, observer) => {
    entries.forEach((entry) => {
      const target = entry.target;
      if (entry.isIntersecting){
        target.classList.add('buttonVisible');
      } else {
        target.classList.remove('buttonVisible');
      }
    })
  }

  let observer = new IntersectionObserver(callback, {
    threshold: [1]
  })

  const buttons = document.querySelectorAll('.css-gywnln');
  for (const b of buttons) {
    observer.observe(b);
  }

  const altButtons = document.querySelectorAll('.css-7pjmqk');
  for (const b of altButtons) {
    observer.observe(b);
  }

}

// Add a class on visible buttons for SurfingKeys
waitForElement('.css-2dg54o', findVisibleButton, false, true);

// Hide side panel when page loads.
waitForElement('.material-symbols-rounded', (element) => {
  element.click()
  document.addEventListener('copy', function(e) {
      const elem = e.target.parentElement.lastElementChild.querySelector('a');
      if (elem) {
        const link = elem.getAttribute('href');
        window.open(link, '_blank');
      }
  })
}, false, false);

const linkBuilder = () => {
  const _title_input = document.querySelector('.custom-input.w-full');
  const _binding_selected = document.querySelector('.custom-select.css-ecfv9d');

  const selected_b = _binding_selected.value;
  const title = _title_input.value.toLowerCase().replace(/^\s+/g, '').replace(/\s+/g, ' ').replace(/\s+$/g, '').replaceAll(' ', '+');
  let _binding = '';

  switch(selected_b) {
    case '&rh=n%3A283155%2Cp_n_feature_browse-bin%3A2656022011': // 'Paperback'
      _binding = '&rh=n%3A283155%2Cp_n_feature_browse-bin%3A2656022011';
      break;
    case '&rh=n%3A283155%2Cp_n_feature_browse-bin%3A23488071011': // Spiral
      _binding = '&rh=n%3A283155%2Cp_n_feature_browse-bin%3A23488071011';
      break;
    case '&rh=n%3A283155%2Cp_n_feature_browse-bin%3A2656019011': // Board
      _binding = '&rh=n%3A283155%2Cp_n_feature_browse-bin%3A2656019011';
      break;
    default:
      _binding = '&rh=n%3A283155%2Cp_n_feature_browse-bin%3A2656020011'; // Hardcover
      break;
  }

  return [`https://www.amazon.com/s?k=${title}${_binding}`, _title_input.value];
}

const command = (object) => {
  chrome.runtime.sendMessage({ message: object.instruction, url: object.link, search: object.query }, function() {});
}

const unifiedSearch = () => {
  const parameters = linkBuilder();
  command({ instruction: 'new-amazon-url', link: parameters[0]});
  command({ instruction: 'search-query', query: parameters[1]});
}

const customHotkeys = (key) => {
  const hotkeys = {
    'c': 'alt-tab',
    'i': 'zoom-in',
    'n': 'reset-zoom-level'
  }
  command({ instruction: hotkeys[key] });
}

const rotateImage = (key) => {
  const image = document.querySelector('.css-6pg88b');
  const direction = {
    'ArrowUp': 'rotate(0deg)',
    'ArrowRight': 'rotate(90deg)',
    'ArrowDown': 'rotate(180deg)',
    'ArrowLeft': 'rotate(270deg)'
  }
  image.style.transform = direction[key];
}

const vim = () => {
  const hotkeys = ['c', 'i', 'n'];
  const arrowKeys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

  if (!window._keydownListenerAttached) {
    window._keydownListenerAttached = true;

    document.addEventListener('keydown', onKeyDown);
    function onKeyDown(e) {
      if (e.target.nodeName === 'BODY' && !e.ctrlKey) {
        const k = e.key;
        switch(k) {
          case 'n':
          case 'i':
            document.querySelector('.material-symbols-rounded.css-c3ghyy').click();
            customHotkeys(k);
            break;
        }

        if (hotkeys.includes(k)) {
          customHotkeys(k);
        } else if (arrowKeys.includes(k)) {
          e.preventDefault();
          rotateImage(k);
        }
      }
    }
  }

  const title = document.querySelector('.custom-input.w-full');
  // Apply changes made via Surfingkeys VIM mode.
  title.addEventListener('change', applyChanges);
  function applyChanges() {
    const event = new Event('input', { bubbles: true });
    title.dispatchEvent(event);
  }

  title.addEventListener('keydown', sendQuery);
  function sendQuery(e) {
    switch(e.key) {
      case 'Escape':
        title.blur();
        // unifiedSearch();
        // customHotkeys('n');
        break;
    }
  }

  const binding = document.querySelector('.custom-select.css-ecfv9d');
  binding.addEventListener('keydown', bindingSelection);
  function bindingSelection(e) {
    switch(e.key) {
      case 'Escape':
        unifiedSearch();
        customHotkeys('n');
      case 'Tab':
        e.preventDefault();
        title.focus();
        break;
    }
  }

}
waitForElement('.new-sm-label.css-1up6yon', vim, false, true);

const removeGeneratedLink = (element) => {
    element.hidden = true;
}
waitForElement('.css-1ad5bf3', removeGeneratedLink, false, true);
