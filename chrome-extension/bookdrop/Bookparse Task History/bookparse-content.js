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

const loseFocus = () => {
  const blob = document.body;
  blob.tabIndex = 0;
  blob.focus();
  blob.tabIndex = -1;
}

const setNativeValue = (element, value) => {
  let lastValue = element.value;
  element.value = value;
  let event = new Event('input', { target: element, bubbles: true });
  // React 15
  event.simulated = true;
  // React 16
  let tracker = element._valueTracker;
  if (tracker) { tracker.setValue(lastValue) };
  element.dispatchEvent(event);
}

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
}

const findVisibleCard = () => {
  let callback = (entries, observer) => {
    entries.forEach((entry) => {
      const target = entry.target;
      if (entry.isIntersecting){
        target.querySelector('button').classList.add('cardVisible');
      } else {
        target.querySelector('button').classList.remove('cardVisible');
      }
    })
  }

  let observer = new IntersectionObserver(callback, {
    threshold: [0.5]
  })

  const cards = document.querySelectorAll('.css-2dg54o');
  for (const c of cards) {
    observer.observe(c);
  }
}

const replaceSelectedText = (replacementText, wordSelectionStart, wordSelectionEnd) => {
  const titleInputBox = document.querySelector('.custom-input.w-full');
  let result = `${wordSelectionStart} ${replacementText} ${wordSelectionEnd}`;
  result = result.replace(/^\s+/g, '').replace(/\s+/g, ' ').replace(/\s+$/g, '');
  setNativeValue(titleInputBox, result);
}

let recognition;
const startListening = async (isPartialTextReplace = false) => {
  const titleInputBox = document.querySelector('.custom-input.w-full');
  const transcribeButton = document.querySelector('#start-dictation-microphone');

  const wordSelectionStart = titleInputBox.value.slice(0, titleInputBox.selectionStart);
  const wordSelectionEnd = titleInputBox.value.slice(titleInputBox.selectionEnd);

  const speechRecognition = window.webkitSpeechRecognition;
  recognition = new speechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = true;

  recognition.addEventListener('audiostart', () => {
    transcribeButton.innerText = 'Transcribing';
    transcribeButton.style.cssText = 'width: 110px; position: relative; left: 16.5%; top: 35px; transform: translateX(-50%); background-color: #FAA0A0; border-style: none;';
  });

  recognition.addEventListener('audioend', () => {
    transcribeButton.innerText = 'Start';
    transcribeButton.style.cssText = 'width: 110px; position: relative; left: 16.5%; top: 35px; transform: translateX(-50%); background-color: rgb(243, 243, 243); border-style: none;';
    recognition.stop();
  });

  recognition.addEventListener('result', (e) => {
    const transcript = Array.from(e.results)
      .map((result) => result[0])
      .map((result) => result.transcript);
    isPartialTextReplace ? replaceSelectedText(transcript, wordSelectionStart, wordSelectionEnd) : setNativeValue(titleInputBox, transcript);
    titleInputBox.focus();
  });

  recognition.addEventListener('error', () => {
    recognition.stop();
    setTimeout(() => {
      recognition.start();
    }, 100);
  });
  recognition.start();
}

const stopListening = () => {
  recognition.stop();
}

const renderStartButton = (selector) => {
  const startRecordingButton = document.createElement('button');
  startRecordingButton.id = 'start-dictation-microphone';
  startRecordingButton.innerText = 'Start';
  startRecordingButton.style.cssText = 'width: 110px; position: relative; left: 16.5%; top: 35px; transform: translateX(-50%); background-color: rgb(243, 243, 243); border-style: none;';
  startRecordingButton.onclick = () => { startListening() };
  selector.parentNode.appendChild(startRecordingButton);
}
waitForElement('.new-sm-label.css-1up6yon', renderStartButton, false, false);

const renderStopButton = (selector) => {
  const stopRecordingButton = document.createElement('button');
  stopRecordingButton.id = 'stop-dictation-microphone';
  stopRecordingButton.innerText = 'Stop';
  stopRecordingButton.style.cssText = 'width: 100px; position: relative; left: 17%; top: 35px; transform: translateX(-50%); background-color: rgb(243, 243, 243); border-style: none;';
  stopRecordingButton.onclick = () => { stopListening() };
  selector.parentNode.appendChild(stopRecordingButton);
}
waitForElement('.new-sm-label.css-1up6yon', renderStopButton, false, false);

// Hide side panel when page loads.
waitForElement('.bi.bi-chevron-right', (element) => {
  element.click()
  document.addEventListener('copy', function(e) {
      link = e.target.parentElement.lastElementChild.querySelector('a').getAttribute('href')
      window.open(link, '_blank');
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
  // Custom actions when nothing is focused.
  document.addEventListener('keydown', (e) => {
    if (e.target.nodeName === 'BODY' && !e.ctrlKey) {
      const k = e.key;
      if (hotkeys.includes(k)) {
        customHotkeys(k);
      } else if (arrowKeys.includes(k)) {
        e.preventDefault();
        rotateImage(k);
      }
    }
  });

  const title = document.querySelector('.custom-input.w-full');
  // Apply changes made via Surfingkeys VIM mode.
  title.addEventListener('change', (e) => {
    const event = new Event('input', { bubbles: true });
    title.dispatchEvent(event);
  });

  // Custom actions when title box is focused.
  title.addEventListener('keydown', (e) => {
    switch(e.key) {
      case 'Escape':
        if (title.value.length !== 0) {
          unifiedSearch();
          customHotkeys('n');
        }
        break;
      case '.':
        e.preventDefault();
        document.querySelector('.custom-select.css-ecfv9d').selectedIndex = 1;
        unifiedSearch();
        customHotkeys('n');
        break;
      case ',':
        e.preventDefault();
        loseFocus();
        break;
      case 'Enter':
        e.preventDefault();
        startListening(true);
        break;
      case '/':
        e.preventDefault();
        startListening();
        break;
    }
  })

  // Custom actions when binding box is focused.
  const binding = document.querySelector('.custom-select.css-ecfv9d');
  binding.addEventListener('keydown', (e) => {
    switch(e.key) {
      case 'Escape':
        unifiedSearch();
        customHotkeys('n');
      case 'Tab':
        e.preventDefault();
        title.focus();
        break;
    }
  })
}
waitForElement('.new-sm-label.css-1up6yon', vim, false, true);

// const adjustRecognitionSoftware = () => {
//   const container = document.querySelector('.css-12rxo42');
//   container.style.cssText = "transform: translate(430px, 0px);";

//   const card = document.querySelector('.css-l5snnm');
//   card.style.cssText = "position: relative; width: 900px; max-height: 900px; transform: translate(0px, -160px);";

//   findVisibleButton();
//   findVisibleCard();
// }
// waitForElement('.new-sm-label.css-1up6yon', adjustRecognitionSoftware, false, true);

// const idImageUserInterface = () => {
//   const imageId = document.querySelector('.new-sm-label.css-1up6yon');
//   imageId.style.cssText = "transform: translate(0px, -30px);";

//   const taskImage = document.querySelector('.new-mb-4.css-iscebk');
//   taskImage.style.cssText = " width: 1000px; height: 300px; transform: translate(-50px, 0px)";

//   const ui = document.querySelector('.css-1ssh553');
//   ui.style.cssText = "transform: translate(-1050px, 500px);";

// }
// waitForElement('.new-sm-label.css-1up6yon', idImageUserInterface, false, true);

const removeGeneratedLink = (element) => {
    element.hidden = true;
}
waitForElement('.css-1ad5bf3', removeGeneratedLink, false, true);

// window.onfocus = () => {
//   loseFocus();
//   const target = document.querySelector('.custom-input.new-mb-4');
//   if (target) {
//     if (target.value !== '') { setNativeValue(target, '') };
//   }
// }


