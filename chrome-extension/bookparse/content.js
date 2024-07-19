const setToDefaultState = () => {
  const port = chrome.runtime.connect({name: "zoomState"});
  port.postMessage({message: 'reset-zoom-level'});

  const image = document.querySelector('.card-body');
  image.style.transform = null;
}


const backgroundJS = new MutationObserver(function(mutations, mo) {
  const targetNode = document.querySelector('.out-label.ms-auto');
  if (targetNode) {
    const closureObserver = new MutationObserver(function(mutations) {
      const isNewID = mutations.some((mutation) => mutation.target.className === 'out-label ms-auto');
      if (isNewID) setToDefaultState();
    })
    closureObserver.observe(targetNode, { childList: true });
    mo.disconnect();
  }
})
backgroundJS.observe(document, { childList: true, subtree: true });


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


// Hide side panel when page loads.
waitForElement('.navigation-btn.ms-auto', (element) => { element.click() }, false, false);


// Change image box position and adjust image dimensions.
const adjustImage = (element) => {
  element.style.cssText = 'overflow: hidden; transform: translate(-150px, 0px);';
  element.querySelector('img').style.cssText = 'height: 560px; width: 750px;';
}
waitForElement('.col-auto.mb-2', adjustImage, false, true);


// Reposition box for 'Not Complete', 'Undecided', 'Not Complete Multi Photo'.
waitForElement('.mini-navbar.ms-auto', (element) => { element.style.transform = 'translate(76px, 0px)' }, false, false);


// Reposition recognition software results interface.
const adjustRecognitionSoftwareInterface = (element) => {
  if (element) {
    const removeThisElements = ['h6', '.col-md-6.mb-4 > .sm-label', '.sm-card > h6'];
    removeThisElements.forEach((selector) => {
      const target = document.querySelector(selector);
      if (target !== null) target.remove();
    });

    element.style.cssText = 'background-color: rgb(15, 15, 15); position: absolute; width: 697px; transform: translate(650px, -692.5px);'; // Recognition software results card.

    // Set height for recognition results card.
    const setHeight = document.querySelector('.sm-card > div');
    if (setHeight !== null) setHeight.style.maxHeight = '450px';
  }
}
waitForElement('.sm-card', adjustRecognitionSoftwareInterface, false, true);


// Reposition and adjust user interface box width.
const adjustUserInterface = (element) => {
  document.querySelector('.col-md-5.mb-2.react-draggable').style.cssText = 'position: absolute; width: 720px; right: -10px; bottom: 0px; z-index: 1; transform: translate(-37.5px, -50px);'; // User interface card position.
  document.querySelector('.col-md-5.mb-2.react-draggable > label').style.visibility = 'hidden'; // 'Drag Me' label on top of the card.
}
waitForElement('.col-md-5.mb-2.react-draggable > .card > .card-body', adjustUserInterface, false, false);


// Run custom QOL event listeners.
const main = () => {
  rotateImage();
  customActions();
}
waitForElement('.mb-2 > .form-control.form-control-second-primary', main, false, false);


// Ensure input box for book titles is not in focus.
// Ensure input box for ASIN has no value.
window.onfocus = () => {
  loseFocus();
  const target = document.querySelector('.form-control.form-control-second-primary');
  if (target.value !== '') setNativeValue(target, '');
}