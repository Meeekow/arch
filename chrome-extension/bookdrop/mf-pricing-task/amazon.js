// const waitForElement = (selector, callback, isArray = false, options = { childList: true, subtree: true }) => {
//   const observer = new MutationObserver(function(mutations, mo) {
//     const element = isArray ? document.querySelectorAll(selector) : document.querySelector(selector);
//     if (element) {
//       callback(element);
//     }
//     observer.observe(document, options);
//   })
// }

// const clickDropdown = (element) => {
//   console.log(element);
  // if (element) {
  //   document.addEventListener('keydown', (e) => {
  //     console.log(e.key);
  //     const k = e.key;
  //     switch(k) {
  //       case 'a':
  //         element.click();
  //         break;
  //     }
  //   })

  //   ['mousedown', 'mouseup', 'click'].forEach(type => {
  //     element.dispatchEvent(new MouseEvent(type, {
  //       bubbles: true,
  //       cancelable: true,
  //       view: window,
  //     }))
  //   })
  // }
// }

// waitForElement('[role=button].a-popover-trigger.a-declarative', clickDropdown);


// const el = document.querySelector('[role=button].a-popover-trigger.a-declarative');

// if (el) {
//   ['mousedown', 'mouseup', 'click'].forEach(type => {
//     el.dispatchEvent(new MouseEvent(type, {
//       bubbles: true,
//       cancelable: true,
//       view: window,
//     }));
//   });
// }



// document.addEventListener('keydown', (e) => {
//         console.log(e.key);
//         const k = e.key;
//         switch(k) {
//           case 'a':
//             element.click();
//             break;
//         }
//       })


// WORKING SELECTORS
// main drop down
// document.querySelector('[role=button].a-popover-trigger.a-declarative')

// shows after drop down is clicked
// get 0th element
// document.querySelectorAll('#mm-grid-aod-popover-hardcover_meta_binding-entry')[0].click()