const loseFocus = () => {
  const blob = document.body;
  blob.tabIndex = 0;
  blob.focus();
  blob.tabIndex = -1;
}


window.onfocus = () => {
  loseFocus();
  const target = document.querySelector('.form-control.form-control-second-primary');
  setNativeValue(target, '');
}


const waitForElement = (selector, callback, isArray = false, shouldMonitor = false, options = { childList: true, subtree: true }) => {
  const observer = new MutationObserver(function(mutations, me) {
    const element = isArray ? document.querySelectorAll(selector) : document.querySelector(selector);
    if (element) {
      if (!shouldMonitor) me.disconnect();
      callback(element);
    }
  });
  observer.observe(document, options);
}


// Hide side panel on page load.
waitForElement('.navigation-btn.ms-auto', (element) => { element.click() }, false, false);


// 'Not Complete', 'Undecided', 'Not Complete Multi Photo'.
waitForElement('.mini-navbar.ms-auto', (element) => { element.style.transform = 'translate(80px, -18px)' }, false, false);


// Detect wrong binding from user interface box.
const detectUnknownBinding = (element) => {
  const cardBody = document.querySelector('.col-md-5.mb-2.react-draggable .card-body');
  const binding = document.querySelector('.form-control');
  if (binding) {
    binding.value !== 'Unknown' ? cardBody.removeAttribute('style') : cardBody.style.cssText = 'background-color: #E74C3C';
  }
}
waitForElement('.form-control', detectUnknownBinding, false, true);


// Detect wrong binding from recognition software box.
const detectWrongBinding = (element) => {
  const recognitionSoftwareResults = document.querySelectorAll('.sm-card.d-flex');
  const paperbackVariants = ['paperback', 'mass_market', 'mass market paperback', 'perfect paperback'];
  if (element) {
    const validBookBindings = {
      'hardcover': ['hardcover'],
      'paperback': paperbackVariants,
      'mass market': paperbackVariants,
      'spiral': ['spiral-bound', 'spiral_bound', 'ring-bound', 'ring_bound', 'plastic comb', 'plastic_comb'],
      'board': ['board book', 'board_book']
    }
    const correctBinding = element.value.toLowerCase();
    const result = validBookBindings[correctBinding];
    recognitionSoftwareResults.forEach((e) => {
      const bindingToCheck = e.querySelector('.d-block:nth-child(3)').firstChild.nextSibling.textContent.toLowerCase();
      if (result === undefined || !result.includes(bindingToCheck)) {
        e.style.cssText = 'background-color: #000';
      }
    })
  }
}
waitForElement('.form-control', detectWrongBinding, false, true);


// See if there is sales rank and highlight.
// Set margin for recognition software results for consistency.
const highlightSalesRank = (element) => {
  const targets = document.querySelectorAll('.d-block');
  if (targets) {
    element.forEach((target) => {
      target.style.margin = '0px 10px 10px';
    });
    targets.forEach((target) => {
      if (target.textContent.includes('Sales Rank')) {
        target.style.cssText = 'background-color: #023020';
      }
    });
  }
}
waitForElement('.sm-card.d-flex', highlightSalesRank, true, true);


// Reposition recognition software results interface.
const adjustRecognitionSoftwareInterface = (element) => {
  if (element) {
    const removeThisElements = ['h6', '.col-md-6.mb-4 > .sm-label', '.sm-card > h6'];
    removeThisElements.forEach((selector) => {
      const target = document.querySelector(selector);
      if (target !== null) target.remove();
    });

    element.style.cssText = 'background-color: rgb(15, 15, 15); height: 0px; width: 697px; transform: translate(650px, -630px);'; // Recognition software results card.

    // Set height for recognition results card.
    const setHeight = document.querySelector('.sm-card > div');
    if (setHeight !== null) setHeight.style.maxHeight = '440px';
  }
}
waitForElement('.col-md-6.mb-4', adjustRecognitionSoftwareInterface, false, true);


// Change width and reposition user interface.
const adjustUserInterface = (element) => {
  if (element) {
    document.querySelector('.col-md-5.mb-2.react-draggable').style.cssText = 'width: 700px; position: absolute; right: -10px; bottom: 0px; z-index: 1; transform: translate(-60px, 0px);'; // User interface card position.
    document.querySelector('.col-md-5.mb-2.react-draggable > label').style.visibility = 'hidden'; // 'Drag Me' label on top of the card.
  }
}
waitForElement('.col-md-5.mb-2.react-draggable > .card > .card-body', adjustUserInterface, false, false);


// Reset image orientation whenever new image is rendered.
const resetImageOrientation = (element) => {
  if (element) document.querySelector('.card-body').style.transform = null;
}
waitForElement('.out-label.ms-auto', resetImageOrientation, false, true, { characterData: true, attributes: false, childList: false, subtree: true });


// Change image box position and adjust image dimension.
const adjustImage = (element) => {
  element.style.transform = 'translate(-225px, 0px)';
  element.querySelector('img').style.cssText = 'height: 557px; width: 750px';
}
waitForElement('.col-auto.mb-2', adjustImage, false, true);


const setNativeValue = (element, value) => {
  let lastValue = element.value;
  element.value = value;
  let event = new Event('input', { target: element, bubbles: true });
  // React 15
  event.simulated = true;
  // React 16
  let tracker = element._valueTracker;
  if (tracker) tracker.setValue(lastValue);
  element.dispatchEvent(event);
}


const replaceSelectedText = (replacementText, wordSelectionStart, wordSelectionEnd) => {
  const titleInputBox = document.querySelector('.mb-2 > .form-control.form-control-second-primary');
  let result = `${wordSelectionStart} ${replacementText} ${wordSelectionEnd}`;
  result = result.replace(/^\s+/g, '').replace(/\s+/g, ' ').replace(/\s+$/g, '');
  setNativeValue(titleInputBox, result);
}


let recognition;
const startListening = async (isPartialTextReplace = false) => {
  const titleInputBox = document.querySelector('.mb-2 > .form-control.form-control-second-primary');
  const transcribeButton = document.querySelector('#start-dictation-microphone');

  const wordSelectionStart = titleInputBox.value.slice(0, titleInputBox.selectionStart);
  const wordSelectionEnd = titleInputBox.value.slice(titleInputBox.selectionEnd);

  const speechRecognition = window.webkitSpeechRecognition;
  recognition = new speechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = true;

  recognition.addEventListener('audiostart', () => {
    transcribeButton.innerText = 'Transcribing';
    transcribeButton.style.cssText = 'width: 100px; position: relative; left: 42%; top: 8px; transform: translateX(-50%); background-color: #FAA0A0; border-style: none;';
  });

  recognition.addEventListener('audioend', () => {
    transcribeButton.innerText = 'Start';
    transcribeButton.style.cssText = 'width: 100px; position: relative; left: 42%; top: 8px; transform: translateX(-50%); background-color: rgb(243, 243, 243); border-style: none;';
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
  startRecordingButton.style.cssText = 'width: 100px; position: relative; left: 42%; top: 8px; transform: translateX(-50%); background-color: rgb(243, 243, 243); border-style: none;';
  startRecordingButton.onclick = () => { startListening() };
  selector.parentNode.appendChild(startRecordingButton);
}
waitForElement('.form-control-select.w-100', renderStartButton, false, false);


const renderStopButton = (selector) => {
  const stopRecordingButton = document.createElement('button');
  stopRecordingButton.id = 'stop-dictation-microphone';
  stopRecordingButton.innerText = 'Stop';
  stopRecordingButton.style.cssText = 'width: 100px; position: relative; left: 43%; top: 8px; transform: translateX(-50%); background-color: rgb(243, 243, 243); border-style: none;';
  stopRecordingButton.onclick = () => { stopListening() };
  selector.parentNode.appendChild(stopRecordingButton);
}
waitForElement('.form-control-select.w-100', renderStopButton, false, false);


const linkBuilder = () => {
  const _title_input = document.querySelector('.mb-2 > .form-control.form-control-second-primary');
  const _binding_selected = document.querySelector('.form-control-select.w-100');

  const selected_b = _binding_selected.value;
  const title = _title_input.value.toLowerCase().replace(/^\s+/g, '').replace(/\s+/g, ' ').replace(/\s+$/g, '').replaceAll(' ', '+');
  let _binding = '';

  switch(selected_b) {
    case 'Paperback':
      _binding = '&rh=n%3A283155%2Cp_n_feature_browse-bin%3A2656022011';
      break;
    case 'Hardcover':
      _binding = '&rh=n%3A283155%2Cp_n_feature_browse-bin%3A2656020011';
      break;
    case 'Spiral':
      _binding = '&rh=n%3A283155%2Cp_n_feature_browse-bin%3A23488071011';
      break;
    case 'Board':
      _binding = '&rh=n%3A283155%2Cp_n_feature_browse-bin%3A2656019011';
      break;
    default:
      _binding = '';
      break;
  }

  if (title) {
    window.open(`https://www.amazon.com/s?k=${title}${_binding}`, '_blank');
  }
}


const rotateImage = () => {
  document.addEventListener('keydown', (e) => {
    if (e.target.nodeName === 'BODY') {
      const image = document.querySelector('.card-body');
      switch(e.key) {
        case 'ArrowUp':
          image.style.transform = 'rotate(0deg)';
          break;
        case 'ArrowRight':
          image.style.transform = 'rotate(90deg)';
          break;
        case 'ArrowDown':
          image.style.transform = 'rotate(180deg)';
          break;
        case 'ArrowLeft':
          image.style.transform = 'rotate(270deg)';
          break;
      }
    }
  });
}


const customActions = () => {
  let titleInputBox = document.querySelector('.mb-2 > .form-control.form-control-second-primary');
  // Apply changes made via Surfingkeys VIM mode.
  titleInputBox.addEventListener('change', (e) => {
    const event = new Event('input', { bubbles: true });
    titleInputBox.dispatchEvent(event);
  });
  // Custom actions when title box is focused.
  titleInputBox.addEventListener('keydown', (e) => {
    switch(e.key) {
      case 'Escape':
        e.preventDefault();
        linkBuilder();
        break;
      case 'Enter':
        if (!e.ctrlKey) {
          e.preventDefault();
          startListening(true)
        } else {
          e.preventDefault();
          loseFocus();
        }
        break;
      case 's':
        if (e.ctrlKey) {
          e.preventDefault();
          startListening();
        }
        break;
    }
  });

  // Custom actions when binding selection is focused.
  const bindingBox = document.querySelector('.form-control-select.w-100');
  bindingBox.addEventListener('keydown', (e) => {
    switch(e.key) {
      case 'Escape':
        e.preventDefault();
        linkBuilder();
        loseFocus();
        break;
      case 'Tab':
        e.preventDefault();
        titleInputBox.focus();
        break;
      case 'Enter':
        e.preventDefault();
        loseFocus();
        break;
    }
  });
}


const main = () => {
  rotateImage();
  customActions();
}
waitForElement('.mb-2 > .form-control.form-control-second-primary', main, false, false);
