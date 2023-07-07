let previousImg = "";
const zoomAuto = setInterval( () => {
  let currentImg = document.querySelector('.fulfillment-container .w-100').src;
  if ( currentImg != previousImg ) {
    previousImg = document.querySelector('.fulfillment-container .w-100').src;
    document.querySelector('.fulfillment-container').style.width = '1000px';
    clearInterval(zoomAuto);
  };
}, 1000);


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


function clickToTranscribe() {
  const dictationMic = document.createElement("button");
  dictationMic.id = "dictation-microphone";
  dictationMic.innerText = "Click to Transcribe";
  dictationMic.style.cssText = "position: relative; left: 73%; background-color: #F3F3F3;";

  dictationMic.onclick = () => {
    const titleBox = document.querySelector(".form-nice-control.link-title-input");

    var speechRecognition = window.webkitSpeechRecognition;
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
    });

    recognition.addEventListener("audioend", () => {
      dictationMic.innerText = "Click to Transcribe";
      dictationMic.style.cssText = "position: relative; left: 73%; background-color: #F3F3F3;";
      titleBox.focus();
    });
  };

  document.body.appendChild(dictationMic);
};
clickToTranscribe();


function replaceSelectedText(replacementText) {
  const title = document.querySelector(".form-nice-control.link-title-input");

  let start = title.selectionStart;
  let end = title.selectionEnd;

  let selectedText = title.value.slice(start, end);

  let before = title.value.slice(0, start);
  let after = title.value.slice(end);

  let result = before + replacementText + ' ' + after;
  title.value = result;
};


function dictateToReplace() {
  const dictationMic = document.getElementById("dictation-microphone");

  var speechRecognition = window.webkitSpeechRecognition;
  const recognition = new speechRecognition();

  recognition.start();

  recognition.addEventListener("audiostart", () => {
      dictationMic.innerText = "Transcribing...";
      dictationMic.style.cssText = "position: relative; left: 73%; background-color: #FAA0A0;";
  });

  recognition.addEventListener("result", (e) => {
    const transcript = Array.from(e.results)
      .map((result) => result[0])
      .map((result) => result.transcript);

    replaceSelectedText(transcript);
  });

  recognition.addEventListener("audioend", () => {
      dictationMic.innerText = "Click to Transcribe";
      dictationMic.style.cssText = "position: relative; left: 73%; background-color: #F3F3F3;";
      titleBox.focus();
  });
};


function customActions() {
  document.querySelector('.form-nice-control.link-title-input').addEventListener("keydown", (e) => {
    if ( e.ctrlKey && e.key === 's' ) {
      e.preventDefault();
      document.getElementById('dictation-microphone').click();
    };

    if ( e.key === "Enter" ) {
      dictateToReplace();
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


function main() {
  rotateImage();
  customActions();
};


setInterval( () => { main() }, 1000);
