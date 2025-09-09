const waitForElement = (selector, callback, isArray = false, shouldMonitor = true, options = { childList: true, subtree: true }) => {
  const observer = new MutationObserver(function(mutations, mo) {
    const element = isArray ? document.querySelectorAll(selector) : document.querySelector(selector);
    if (element) {
      if (!shouldMonitor) { mo.disconnect() };
      callback();
    }
  });
  observer.observe(document, options);
}

const setNativeValue = (element, value) => {
  let lastValue = element.value;
  element.value = value;
  let event = new Event('input', { target: element, bubbles: true });
  // React 15
  event.simulated = true;
  // React 16
  let tracker = element._valueTracker;
  if (tracker) { tracker.setValue(lastValue) };
  element.dispatchEvent(event);
}

const setPrice = () => {
  const element = document.querySelector("#avg-sold-input");
  setNativeValue(element, "49.99");
}
waitForElement(".btn.css-c6xvfb", setPrice);