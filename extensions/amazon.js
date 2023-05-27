function search() {

    let searched = document.getElementById("twotabsearchtextbox").value.trim();

    searched = searched.replace(/hardcover |paperback |spiral /gi, "");

    let listingTitle = document.querySelectorAll('.a-size-medium.a-color-base.a-text-normal');

    let listingTitleBasePlus = document.querySelectorAll('.a-size-base-plus.a-color-base.a-text-normal');

    let re = new RegExp(searched, "gi");

    if ( listingTitle.length < listingTitleBasePlus ) {

        for ( let i = 0; i < listingTitleBasePlus.length; ++i ) {
            listingTitleBasePlus[i].innerHTML = listingTitleBasePlus[i].innerText.replace(re, match => `<mark>${match}</mark>`);
        }

    } else {

        for ( let i = 0; i < listingTitle.length; ++i ) {
            listingTitle[i].innerHTML = listingTitle[i].innerText.replace(re, match => `<mark>${match}</mark>`);
        }

    }

}


document.getElementById("twotabsearchtextbox").addEventListener("input", () => {

    search();

});


function detectOtherLang() {

    let language = document.querySelectorAll('.a-section.a-spacing-none.puis-padding-right-small.s-title-instructions-style span.a-size-base.a-color-secondary:nth-child(1)');

    for ( let i = 0; i < language.length; ++i ) {

        let pattern = language[i].innerHTML;

        let re = new RegExp(pattern, "gi");

        language[i].innerHTML = language[i].innerText.replace(re, match => `<mark>${match}</mark>`);
    }

}


setTimeout(search(), 5000);
setTimeout(detectOtherLang(), 5000);