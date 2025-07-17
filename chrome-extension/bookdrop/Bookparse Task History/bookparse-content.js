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

// Hide side panel when page loads.
waitForElement('.bi.bi-chevron-right', (element) => {
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
          unifiedSearch();
          customHotkeys('n');
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
}
waitForElement('.new-sm-label.css-1up6yon', vim, false, true);

const removeGeneratedLink = (element) => {
    element.hidden = true;
}
waitForElement('.css-1ad5bf3', removeGeneratedLink, false, true);
