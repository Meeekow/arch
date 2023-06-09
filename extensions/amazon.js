function detectWrongBinding() {

    let wrongBinding = document.querySelectorAll('.a-row.a-size-base.a-color-base:nth-child(1) a.a-size-base.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-bold');

    wrongBinding.forEach( (e) => {

        // https://stackoverflow.com/questions/73678256/how-to-make-a-negative-lookahead-ignores-upper-or-lowercase-characters
        let pattern = /^(?!(?:Hardcover|Paperback|Mass Market Paperback|Spiral-bound|Plastic Comb)$|.*  )\w.*/

        let re = new RegExp(pattern, "gi");

        e.innerHTML = e.innerText.replace(re, match => `<mark style="background: #ff6700!important; font-size: 24px!important">${match}</mark>`);

    } );

}


function detectOtherLang() {

    let language = document.querySelectorAll('.a-section.a-spacing-none.puis-padding-right-small.s-title-instructions-style span.a-size-base.a-color-secondary:nth-child(1)');

    language.forEach( (e) => {

        let pattern = e.innerHTML;

        let re = new RegExp(pattern, "gi");

        e.innerHTML = e.innerText.replace(re, match => `<mark style="background: #ff6700!important; font-size: 18px!important">${match}</mark>`);

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


function main() {

    detectWrongBinding();
    detectOtherLang();
    highlightPartialMatch();

}


setTimeout(main(), 5000);