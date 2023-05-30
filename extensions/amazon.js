function detectOtherLang() {

    let language = document.querySelectorAll('.a-section.a-spacing-none.puis-padding-right-small.s-title-instructions-style span.a-size-base.a-color-secondary:nth-child(1)');

    language.forEach( (e) => {
        let pattern = e.innerHTML;
        let re = new RegExp(pattern, "gi");
        e.innerHTML = e.innerText.replace(re, match => `<mark>${match}</mark>`);
    } );

}


function highlightExactMatch() {

    let searched = document.getElementById("twotabsearchtextbox").value.trim();
    searched = searched.replace(/hardcover |paperback |spiral /gi, "");

    let listingTitleMedium = document.querySelectorAll('.a-size-medium.a-color-base.a-text-normal');
    let listingTitleBasePlus = document.querySelectorAll('.a-size-base-plus.a-color-base.a-text-normal');

    let re = new RegExp(searched, "gi");

    if ( listingTitleMedium.length < listingTitleBasePlus.length ) {
        listingTitleBasePlus.forEach( (e) => {
            e.innerHTML = e.innerText.replace(re, match => `<mark>${match}</mark>`);
        } );
    } else {
        listingTitleMedium.forEach( (e) => {
            e.innerHTML = e.innerText.replace(re, match => `<mark>${match}</mark>`);
        } );
    }

}


function highlightPartialMatch() {

    let searched = document.getElementById("twotabsearchtextbox").value.trim().split(" ");

    let listingTitleMedium = document.querySelectorAll('.a-size-medium.a-color-base.a-text-normal');
    let listingTitleBasePlus = document.querySelectorAll('.a-size-base-plus.a-color-base.a-text-normal');

    let re = new RegExp(searched.join("|"), "gi");

    if ( listingTitleMedium.length < listingTitleBasePlus.length ) {
        listingTitleBasePlus.forEach( (e) => {
            e.innerHTML = e.innerText.replace( re, match => `<mark>${match}</mark>` );
        } );
    } else {
        listingTitleMedium.forEach( (e) => {
            e.innerHTML = e.innerText.replace( re, match => `<mark>${match}</mark>` );
        } );
    }

}


document.getElementById("twotabsearchtextbox").addEventListener("input", () => {

    // highlightExactMatch();
    highlightPartialMatch();

});


// dirty way to remove the blur when pressing escape while in input box/search box
document.getElementById('nav-search-bar-form').addEventListener("keydown", e => {

    if ( e.keyCode === 27 ) {
        // simulate a click to the amazon logo at the top left
        document.getElementById('nav-logo-sprites').click();
    }

});


setTimeout(highlightPartialMatch(), 5000);
setTimeout(detectOtherLang(), 5000);

