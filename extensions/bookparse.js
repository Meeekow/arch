const css =
`
  <style>
  .fulfillment-container {
    width: 1000px;
  }
  </style>
`;
document.head.insertAdjacentHTML('beforeend', css);


window.onfocus = () => {
  document.querySelector('.form-nice-control.link-title-input').blur();
}


const dictationMic = document.createElement('button');
dictationMic.id = 'dictation-microphone';
dictationMic.innerText = 'Transcribe';
dictationMic.style.cssText = 'position: relative; left: 73%; background-color: #F3F3F3;';
dictationMic.onclick = () => { transcribe() };
document.body.appendChild(dictationMic);


const triggerKeyUpEvent = () => {
  const titleBox = document.querySelector('.form-nice-control.link-title-input');
  titleBox.blur();
  titleBox.focus();
  titleBox.dispatchEvent(new Event('keyup'));
}


const transcribe = (isPartialTextReplace = false) => {
  const titleBox = document.querySelector('.form-nice-control.link-title-input');

  const wordSelectionStart = titleBox.value.slice(0, titleBox.selectionStart);
  const wordSelectionEnd = titleBox.value.slice(titleBox.selectionEnd);

  const speechRecognition = window.webkitSpeechRecognition;
  const recognition = new speechRecognition();
  recognition.interimResults = true;

  recognition.addEventListener('audiostart', () => {
    dictationMic.innerText = 'Transcribing...';
    dictationMic.style.cssText = 'position: relative; left: 73%; background-color: #FAA0A0;';
  });

  recognition.addEventListener('audioend', () => {
    dictationMic.innerText = 'Transcribe';
    dictationMic.style.cssText = 'position: relative; left: 73%; background-color: #F3F3F3;';
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
        titleBox.value = transcript;
    }

    triggerKeyUpEvent();
  });

  recognition.addEventListener('error', (e) => {
    console.log(e);
    recognition.stop();
    initialize();
  });

  async function initialize() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    recognition.start();
  }
  initialize();
}


const replaceSelectedText = (replacementText, wordSelectionStart, wordSelectionEnd) => {
  const titleBox = document.querySelector('.form-nice-control.link-title-input');
  const result = `${wordSelectionStart} ${replacementText} ${wordSelectionEnd}`;
  titleBox.value = result.replace(/^\s+/g, '').replace(/\s+/g, ' ').replace(/\s+$/g, '');
}


const linkBuilder = () => {
  const _preview = document.querySelector('.form-nice-readonly-control.link-preview-value');
  const _title_input = document.querySelector('.form-nice-control.link-title-input');
  const _binding_selected = document.querySelector('.form-select.form-select-sm.link-binding-selected');

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
    _preview.value = `https://www.amazon.com/s?k=${title}${_binding}`;
    window.open(_preview.value, '_blank', 'width=200,height=200');
  }
}


const rotateImage = () => {
  document.addEventListener('keydown', (e) => {
    if(e.target.nodeName != 'INPUT') {
      switch(e.key) {
        case 'ArrowUp':
          document.querySelector('.fulfillment-container').style.transform = 'rotate(0deg)';
          break;
        case 'ArrowRight':
          document.querySelector('.fulfillment-container').style.transform = 'rotate(90deg)';
          break;
        case 'ArrowDown':
          document.querySelector('.fulfillment-container').style.transform = 'rotate(180deg)';
          break;
        case 'ArrowLeft':
          document.querySelector('.fulfillment-container').style.transform = 'rotate(270deg)';
          break;
      }
    }
  });
}


const customActions = () => {
  document.querySelector('.form-nice-control.link-title-input').addEventListener('keydown', (e) => {
    switch(e.key) {
      case 'Escape':
        e.preventDefault();
        linkBuilder();
        break;
      case 'Enter':
        e.preventDefault();
        transcribe(true);
        break;
      case 's':
        if(e.ctrlKey) {
          e.preventDefault();
          transcribe();
        }
        break;
    }
  });
}

// https://makersaid.com/wait-for-element-to-exist-javascript/
const waitForElement = (selector, callback) => {
  const observer = new MutationObserver(function(mutations, me) {
    const element = document.querySelector(selector);
    if (element) {
      callback(element);
        // me.disconnect(); // Once the element has been found, we can stop observing for mutations
        return;
    }
  });
  observer.observe(document, { childList: true, subtree: true });
}


const main = () => {
  rotateImage();
  customActions();
}


waitForElement('.form-nice-control.link-title-input', main);
