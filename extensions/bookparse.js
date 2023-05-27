/*
 * Pressing escape while still in the title box
 * will escape insert mode and simulate click
 * on the generated amazon link
**/
document.querySelector('input#link-title-input').addEventListener("keydown", e => {
    if ( e.keyCode === 27 ) {
        document.querySelector('input#link-preview').click();
    }
});


/*
 * Wait for 1 second and then fill out the details
 * base on the value of the binding box
**/
function whatBinding() {
    var binding = document.querySelector('#submission-container div.d-flex.mb-2:nth-child(2) input').value;

    if (binding === "Hardcover") {
        document.querySelector('#link-binding-selected').value = "Hardcover";
    } else if (binding === "Paperback") {
        document.querySelector('#link-binding-selected').value = "Paperback";
    } else {
        document.querySelector('#link-binding-selected').value = "Unknown";
    }
};


/*
 * Value is in milliseconds
 * Change the value accordingly
**/
setTimeout(whatBinding, 3000);

