async function sleep(ms){
    return new Promise((resolve)=>{
        setTimeout(resolve, ms);
    });
}


const detectChatBox = async () => {
  const observer = new MutationObserver(function(mutations, me) {
    const chatBox = document.querySelector('#chat-container');
    if (chatBox) {
      const buttonArray = document.querySelector('#chatframe').contentWindow.document.querySelector('#close-button .yt-spec-touch-feedback-shape__fill');
      if (buttonArray) {
        sleep(1000);
        buttonArray.click();
        observer.disconnect();
      }
    }

  });
  observer.observe(document, { childList: true, subtree: true });
}
detectChatBox();
