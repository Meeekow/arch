function waitForPageToLoad() {

    setTimeout( () => {

        let n = document.querySelectorAll("#available-boxes-container .mt-2").length;
        document.title = n;

    }, 15000);

}


function refreshPage() {

    setTimeout( () => {

        // refresh the page
        location.reload();

    }, 75000);

}


function main() {
    waitForPageToLoad();
    refreshPage();
}


main();