const changeFontSettings = () => {
  const observer = new MutationObserver(function(mutations, me) {
    const size = document.querySelectorAll('p');
    if (size) {
      size.forEach((element) => {
        element.style.fontSize = '18px';
        element.style.lineHeight = '1.4em';
      });
    }
  });
  observer.observe(document, { childList: true, subtree: true });
}
changeFontSettings();
