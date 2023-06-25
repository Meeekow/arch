let previousLens = "";
let googleLens = setInterval(() => {
  let url = document.querySelector(".fulfillment-container .w-100").src;

  let lens = `https://lens.google.com/uploadbyurl?url=${url}`;

  let s = document.getElementById("googleLensButton");

  if ( s !== null ) {
    previousLens = lens;
    s.remove();
  }

  const google = document.createElement("button");

  google.id = "googleLensButton";

  google.innerText = "Google Lens";

  google.style.cssText = "position: relative; left: 73%;";

  google.onclick = () => {
    window.open(lens);
  };

  document.body.appendChild(google);
}, 1000);


let previousImg = "";
const zoomAuto = setInterval( () => {
  let currentImg = document.querySelector('.fulfillment-container .w-100').src;
  if ( currentImg != previousImg ) {
    previousImg = document.querySelector('.fulfillment-container .w-100').src;
    document.querySelector('.fulfillment-container').style.width = '1000px';
    clearInterval(zoomAuto);
  }
}, 1000);


function rotateImage() {
  document.addEventListener("keydown", e => {
    if ( e.target.nodeName != 'INPUT' ) {
      switch ( event.key ) {
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
      }
    }
  })
};


function openLinkOnEsc() {
  document.querySelector('.form-nice-control.link-title-input').addEventListener("keydown", e => {
    if ( event.key === "Escape" ) {
      const _preview = document.querySelector('.form-nice-readonly-control.link-preview-value');
      const _title_input = document.querySelector('.form-nice-control.link-title-input');
      const _binding_selected = document.querySelector('.form-select.form-select-sm.link-binding-selected');

      let title = _title_input.value;
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
      }

      title = title.replaceAll(' ', '+');
      if ( title ) {
        _preview.value = `https://www.amazon.com/s?k=${title}${_binding}`;
        window.open(_preview.value, "_blank", "width=200,height=200");
      }
    }
  });
};


function main() {
  rotateImage();
  openLinkOnEsc();
};


setInterval( () => { main() }, 1000);
