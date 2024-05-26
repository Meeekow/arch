const skipButton = () => {
  const observer = new MutationObserver(function(mutations, me) {
    const button = document.querySelector('.button-primary.watch-video--skip-content-button.medium.hasLabel.default-ltr-cache-1mjzmhv');
    if (button) button.click();
  });
  observer.observe(document, { childList: true, subtree: true });
}
skipButton();
