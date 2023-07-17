const cssCustom = `
  <style>
  .fulfillment-container {
    width: 1000px;
  }
  </style>
`;
document.head.insertAdjacentHTML('beforeend', cssCustom);


const dictationMic = document.createElement("button");
dictationMic.id = "dictation-microphone";
dictationMic.innerText = "Transcribe";
dictationMic.style.cssText = "position: relative; left: 73%; background-color: #F3F3F3;";
dictationMic.onclick = () => { transcribe() };
document.body.appendChild(dictationMic);


function triggerEvent() {
  const titleBox = document.querySelector(".form-nice-control.link-title-input");
  titleBox.blur();
  titleBox.focus();
  titleBox.dispatchEvent( new Event('keyup') );
};


function transcribe() {
  const titleBox = document.querySelector(".form-nice-control.link-title-input");

  const speechRecognition = window.webkitSpeechRecognition;
  const recognition = new speechRecognition();
  recognition.interimResults = true;

  recognition.start();

  recognition.addEventListener("audiostart", () => {
    dictationMic.innerText = "Transcribing...";
    dictationMic.style.cssText = "position: relative; left: 73%; background-color: #FAA0A0;";
  });

  recognition.addEventListener("result", (e) => {
    const transcript = Array.from(e.results)
      .map((result) => result[0])
      .map((result) => result.transcript);

    titleBox.value = transcript;
    triggerEvent();
  });

  recognition.addEventListener("audioend", () => {
    dictationMic.innerText = "Transcribe";
    dictationMic.style.cssText = "position: relative; left: 73%; background-color: #F3F3F3;";
  });
};


function partialTextReplace() {
  const titleBox = document.querySelector(".form-nice-control.link-title-input");

  let beforeWord = titleBox.value.slice(0, titleBox.selectionStart);
  let afterWord = titleBox.value.slice(titleBox.selectionEnd);

  const speechRecognition = window.webkitSpeechRecognition;
  const recognition = new speechRecognition();
  recognition.interimResults = true;

  recognition.start();

  recognition.addEventListener("audiostart", () => {
      dictationMic.innerText = "Transcribing...";
      dictationMic.style.cssText = "position: relative; left: 73%; background-color: #FAA0A0;";
  });

  recognition.addEventListener("result", (e) => {
    const transcript = Array.from(e.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join("");
    replaceSelectedText(transcript, beforeWord, afterWord);
  });

  recognition.addEventListener("audioend", () => {
      dictationMic.innerText = "Transcribe";
      dictationMic.style.cssText = "position: relative; left: 73%; background-color: #F3F3F3;";
  });
};


function replaceSelectedText(replacementText, beforeWord, afterWord) {
  let titleBox = document.querySelector('.form-nice-control.link-title-input');
  let result = beforeWord + replacementText + ' ' + afterWord;
  titleBox.value = result.replace(/\s+/g, " ");
  triggerEvent();
};


function customActions() {
  document.querySelector('.form-nice-control.link-title-input').addEventListener("keydown", (e) => {
    if ( e.ctrlKey && e.key === 's' ) {
      e.preventDefault();
      transcribe();
    };

    if ( e.key === "Enter" ) {
      e.preventDefault();
      partialTextReplace();
    };

    if ( e.key === "Escape" ) {
      const _preview = document.querySelector('.form-nice-readonly-control.link-preview-value');
      const _title_input = document.querySelector('.form-nice-control.link-title-input');
      const _binding_selected = document.querySelector('.form-select.form-select-sm.link-binding-selected');

      let title = _title_input.value.trim().toLowerCase();
      let selected_b = _binding_selected.value;
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
      };

      title = title.replaceAll(' ', '+');
      if ( title ) {
        _preview.value = `https://www.amazon.com/s?k=${title}${_binding}`;
        window.open(_preview.value, "_blank", "width=200,height=200");
      };
    };
  });
};


function rotateImage() {
  document.addEventListener("keydown", (e) => {
    if ( e.target.nodeName != 'INPUT' ) {
      switch ( e.key ) {
      case "ArrowLeft":
        document.querySelector('.fulfillment-container').style.transform = 'rotate(270deg)';
        break;
      case "ArrowUp":
        document.querySelector('.fulfillment-container').style.transform = 'rotate(0deg)';
        break;
      case "ArrowRight":
        document.querySelector('.fulfillment-container').style.transform = 'rotate(90deg)';
        break;
      case "ArrowDown":
        document.querySelector('.fulfillment-container').style.transform = 'rotate(180deg)';
        break;
      };
    };
  });
};


function main() {
  rotateImage();
  customActions();
};


setInterval( () => { main() }, 1000);
