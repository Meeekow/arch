window.onfocus = () => {
  document.querySelector('.mb-2 > .form-control.form-control-second-primary').blur();
}


const detectUnknownBinding = () => {
  const observer = new MutationObserver(function(mutations, me) {
    const cardBody = document.querySelector('.col-md-5.mb-2.react-draggable .card-body');
    const binding = document.querySelector('.form-control');

    if (binding) {
      if (binding.value !== 'Unknown') {
        cardBody.removeAttribute('style');
      } else {
        cardBody.style.cssText = 'background-color: #E74C3C';
      }
    }

  });
  observer.observe(document, { childList: true, subtree: true });
}
detectUnknownBinding();


const waitForElement = (selector, callback) => {
  const observer = new MutationObserver(function(mutations, me) {
    const element = document.querySelector(selector);
    if (element) {
      me.disconnect(); // Once the element has been found, we can stop observing for mutations
      callback(element);
      return;
    }
  });
  observer.observe(document, { childList: true, subtree: true });
}


const changeImageSize = (selector) => {
  selector.style.cssText = 'height: 600px; width: 800px';
}
waitForElement('img', changeImageSize);


const renderTranscribeButton = (selector) => {
  const transcribeButton = document.createElement('button');
  transcribeButton.id = 'dictation-microphone';
  transcribeButton.innerText = 'Transcribe';
  transcribeButton.style.cssText = 'position: relative; left: 43%; background-color: #F3F3F3; border-style: none; top: 8px;';
  transcribeButton.onclick = () => { transcribe() };
  selector.parentNode.appendChild(transcribeButton);
}
waitForElement('.form-control-select.w-100', renderTranscribeButton);


const setNativeValue = (element, value) => {
  let lastValue = element.value;
  element.value = value;
  let event = new Event("input", { target: element, bubbles: true });
  // React 15
  event.simulated = true;
  // React 16
  let tracker = element._valueTracker;
  if (tracker) {
      tracker.setValue(lastValue);
  }
  element.dispatchEvent(event);
}


const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


const transcribe = async (isPartialTextReplace = false) => {
  const titleBox = document.querySelector('.mb-2 > .form-control.form-control-second-primary');
  const transcribeButton = document.getElementById('dictation-microphone');

  const wordSelectionStart = titleBox.value.slice(0, titleBox.selectionStart);
  const wordSelectionEnd = titleBox.value.slice(titleBox.selectionEnd);

  const speechRecognition = window.webkitSpeechRecognition;
  const recognition = new speechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;

  recognition.addEventListener('audiostart', () => {
    transcribeButton.innerText = 'Transcribing...';
    transcribeButton.style.cssText = 'position: relative; left: 43%; background-color: #FAA0A0; border-style: none; top: 8px;';
  });

  recognition.addEventListener('audioend', () => {
    transcribeButton.innerText = 'Transcribe';
    transcribeButton.style.cssText = 'position: relative; left: 43%; background-color: #F3F3F3; border-style: none; top: 8px;';
    recognition.stop();
  });

  recognition.addEventListener('result', (e) => {
    const transcript = Array.from(e.results)
      .map((result) => result[0])
      .map((result) => result.transcript);

    switch(isPartialTextReplace) {
      case true:
        replaceSelectedText(transcript, wordSelectionStart, wordSelectionEnd);
        break;
      default:
        setNativeValue(titleBox, transcript);
    }
    titleBox.focus();
  });

  let retryCount = 0;
  while (true) {
    try {
      recognition.start();
      break;
    } catch (error) {
      console.log(error);
      retryCount++;
      if (retryCount >= 3) {
        recognition.stop();
        break;
      }
    }
  await sleep(1000);
  }
}


const replaceSelectedText = (replacementText, wordSelectionStart, wordSelectionEnd) => {
  const titleBox = document.querySelector('.mb-2 > .form-control.form-control-second-primary');
  const result = `${wordSelectionStart} ${replacementText} ${wordSelectionEnd}`;
  setNativeValue(titleBox, result.replace(/^\s+/g, '').replace(/\s+/g, ' ').replace(/\s+$/g, ''));
}


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

  if(title) {
    window.open(`https://www.amazon.com/s?k=${title}${_binding}`, '_blank', 'width=200,height=200');
  }
}


const rotateImage = () => {
  document.addEventListener('keydown', (e) => {
    if(e.target.nodeName === 'BODY') {
      switch(e.key) {
        case 'ArrowUp':
          document.querySelector('.card-body').style.transform = 'rotate(0deg)';
          break;
        case 'ArrowRight':
          document.querySelector('.card-body').style.transform = 'rotate(90deg)';
          break;
        case 'ArrowDown':
          document.querySelector('.card-body').style.transform = 'rotate(180deg)';
          break;
        case 'ArrowLeft':
          document.querySelector('.card-body').style.transform = 'rotate(270deg)';
          break;
      }
    }
  });
}


const resetImageOrientation = () => {
  const observer = new MutationObserver(function(mutations, me) {
    const element = document.querySelector('.out-label.ms-auto');
    if (element) {
      document.querySelector('.card-body').style.transform = null;
      return;
    }
  });
  observer.observe(document, { characterData: true, subtree: true });
}
resetImageOrientation();


const customActions = () => {
  const titleBox = document.querySelector('.mb-2 > .form-control.form-control-second-primary');

  titleBox.addEventListener('keydown', (e) => {
    switch(e.key) {
      case 'Escape':
        e.preventDefault();
        linkBuilder();
        break;
      case 'Enter':
        if(e.ctrlKey) {
          e.preventDefault();
          titleBox.blur();
          document.querySelector('.btn-outline.mb-2').focus();
        } else {
          e.preventDefault();
          transcribe(true);
        }
        break;
      case 's':
        if(e.ctrlKey) {
          e.preventDefault();
          transcribe();
        }
        break;
    }
  });


  // Apply changes made via Surfingkeys VIM mode.
  titleBox.addEventListener('change', (e) => {
    const event = new Event('input', { bubbles: true });
    titleBox.dispatchEvent(event);
  });


  const bindingBox = document.querySelector('.form-control-select.w-100');

  bindingBox.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') {
      e.preventDefault();
      titleBox.focus();
    }
  });
}


// Click button on page load to hide side panel.
waitForElement('.navigation-btn.ms-auto', () => { document.querySelector('.navigation-btn.ms-auto').click() });


const main = () => {
  rotateImage();
  customActions();
}
waitForElement('.mb-2 > .form-control.form-control-second-primary', main);