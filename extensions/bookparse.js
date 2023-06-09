/*
 * Wait for the image to load and zoom automatically
**/
const _waitForImg = setInterval( () => {
    const img = document.querySelector("#task-specific-image");

    if (img.complete) {
        document.getElementById('task-specific-image').style.width = '1000px';
        clearInterval(_waitForImg);
    }

}, 100);


/*
 * Pressing escape while still in the title box
 * will open the amazon generated link in a new window
**/
document.querySelector('input#link-title-input').addEventListener("keydown", e => {
    if ( e.keyCode === 27 ) {
        const _preview = document.getElementById('link-preview');
        const _title_input = document.getElementById('link-title-input');
        const _binding_selected = document.getElementById('link-binding-selected');

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


/*
 * Wait for 100ms and set book binding
**/
const _whatBinding = setInterval( () => {
    let binding = document.querySelector('#submission-container div.d-flex.mb-2:nth-child(2) input').value;

    if ( binding === "Unknown" || binding === "Spiral" ) {
        clearInterval(_whatBinding);
    } else if ( binding === "Hardcover" ) {
        document.querySelector('#link-binding-selected').value = "Hardcover";
    } else if (binding === "Paperback") {
        document.querySelector('#link-binding-selected').value = "Paperback";
    }

    clearInterval(_whatBinding);
}, 100)