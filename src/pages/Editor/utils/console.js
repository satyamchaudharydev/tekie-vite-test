import { get } from "lodash";
import { hs } from "../../../utils/size";

export const customStyle = () => `
.eruda > *{
  font-family: 'Nunito', sans-serif !important;
}

.eruda-entry-btn{
  // display: none !important;
  background: red !important;
}
.eruda-clear-console,.eruda-icon-filter,.eruda-icon-copy,.eruda-level[data-level="info"],.eruda-level[data-level="warning"]{
  display: none !important;
}
.eruda-control{
  padding-inline: 10px !important;
}
.eruda-tab{

  display: flex;
  align-items: center;
  height: ${hs(50)}px;
  position: unset;
  background: rgba(168, 167, 167, 0.15);
  border-width: 1px 1px 0px 1px;
  border-style: solid;
  border-color: #D2D2D2;
  border-radius: 16px 16px 0px 0px;
  padding: 16px 14px;

}
.luna-tab{
  position: unset;
}
.eruda-dev-tools{
  border-radius: 16px 16px 0px 0px;
  padding: 0px !important; 
  
}
.eruda-dev-tools.collapse{
  height: ${hs(50) + hs(67)}px !important;
  top: unset !important;
}
.custom-header{
  font-family: 'Nunito', sans-serif;
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding-block: ${hs(18)}px;
  justify-content: space-between;
  
}
#eruda .custom-header__title-container{
  display: flex;
  align-items: center;
}
#eruda .custom-header__title {
  font-size: ${hs(16)}px !important;
  color: #403F3F !important;
  background: unset !important;
}
.custom-header__error-count{
  display: flex;
  font-weight: 700;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #D34B57;
  background: #F9E9EA;
  font-size: ${hs(16)}px !important;
  
  margin-left: ${hs(8)}px;
  box-sizing: border-box;
  padding: ${hs(5)}px ${hs(12)}px;
  border-radius: 6px;
  transition: all 0.7s ease;
  transform: scale(1);

}
.custom-header__error-count[data-error-count="0"]{
  display: none;
}
.custom-header__error-count.blink{
  background: #FFBFC3;
  color: #901F29;
  transition: all 0.7s ease;

}
.custom-header__button{
  display: flex;
  // align-items: center;
  gap: ${hs(12)}px;

}
button{
  display: flex;
  cursor: pointer;
  flex-direction: row;
  align-items: center;
  padding: ${hs(5)}px ${hs(12)}px;
  gap: 4px;
  border: 1px solid #D2D2D2;  
  border-radius: 8px;
  color: #858585;
  font-size: ${hs(16)}px;
  font-family: inherit;

}
button svg{
  width: ${hs(16)}px;
  height: ${hs(16)}px;
}
.luna-console,.luna-console-log-item{
  font-size: 14px !important;
}
.luna-console-log-item .luna-console-icon-container .luna-console-icon{
  font-size: 14px !important;
}
.luna-console-log-container{
  pointer-events: none !important;
}
.luna-console-log-container:has(.luna-console-log-content > span)  {
  display: none !important;
}
.luna-console-log{
  color: #504F4F !important;
}
.luna-console-log-item.luna-console-error{
  color: #D34B57 !important;
}
.luna-console-icon{
  
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}
.luna-console-icon-container{
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}
.custom-header__collapse-button.rotate svg{
  transform: rotate(180deg);
  transition: all 0.2s ease-in-out;
}
.eruda-dev-tools{
  transition: opacity 0.2s ease, height 0.2s ease !important;
}
.custom-header__collapse-button,.custom-header__clear-button{
  // height: 100%;

}
.custom-header__collapse-button{
  color: #121212;
}
.custom-header__clear-button{
  font-size: ${hs(16)}px;
}
.custom-header__title-container{
  display: flex;
  gap: 10px;
  align-items: center;
}

`;

export const updateErrorCount = (iframe, iframeDocument, count = false) => {
  const erudaContainer = iframeDocument.querySelector('#eruda')
  const erudaShadowRoot =  erudaContainer.shadowRoot
  const eruda = get(iframe, "contentWindow.eruda");
  if (get(iframe, "contentWindow.eruda")) {
    const consoleLog = eruda.get("console")._logger.logs;
    const errorCountFromLogs = consoleLog.filter((log) => log.level === "error")
      .length;
    const errorCount = count || errorCountFromLogs;

    const errorCountEl = erudaShadowRoot.getElementById("error-count");
    const errorCountElParent = erudaShadowRoot.querySelector(
      ".custom-header__error-count"
    );
    if (!errorCountEl || !errorCountElParent) return;
    errorCountElParent.setAttribute("data-error-count", errorCount);
    errorCountEl.textContent = `${errorCount} errors`;
    errorCountElParent.classList.add("blink");
    setTimeout(() => {
      errorCountElParent.classList.remove("blink");
    }, 500);
  }
};
export const updateConsole = (codeString,id) => {
  const iframe = document.getElementById(`previewOutput-${id}`);
  if(!iframe) return
  const iframeDocument = iframe.contentDocument;
  const body = iframeDocument.body;
  const userOutputCode = body.querySelector("#user-code-output");

  const eruda = iframe.contentWindow.eruda;
  // clearing eruda console
  if (eruda) {
    const erudaConsole = eruda.get("console");
    erudaConsole.clear();
  }

  const script = iframeDocument.createElement("script");
  script.id = "user-code-output-script";
  const userCodeScript = iframeDocument.getElementById(
    "user-code-output-script"
  );
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(codeString, "text/html");
  const scriptFromCode = htmlDoc.body.querySelector("script")
    ? htmlDoc.body.querySelector("script").innerHTML || ""
    : "";
  const styleForCode = htmlDoc.querySelectorAll("style")
  styleForCode.forEach(style => {
    style.innerHTML = appendClassToCSSElmInCssCode(style.innerHTML)
  })
  if (userCodeScript) userCodeScript.remove();
  
  // This is done to ensure that any variables,
  // functions or other code declared in the codeString are contained within the IIFE's lexical scope,
  // and do not interfere with the global scope or other variables/functions in the parent code.
  // If we don't do this, then errors will be thrown when the user tries to access variables/functionsx
  script.innerHTML = `
    (function() {
      ${scriptFromCode}
    })();
  `;
  body.appendChild(script);
  if (!!userOutputCode) {
    userOutputCode.innerHTML = htmlDoc.documentElement.innerHTML;
  }
  setTimeout(() => {
    updateErrorCount(iframe, iframeDocument);
  }, 100);
};

export const addErudaToHead = (codeString) => {
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(codeString, "text/html");

  let head = htmlDoc.querySelector("head");
  if (!head) {
    head = htmlDoc.createElement("head");
    htmlDoc.documentElement.appendChild(head);
  }
  head.innerHTML += `
        <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
            <style>
       ${customStyle()}
       </style> 
      <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
      <script>eruda.init(
        {
          tool: ['console'],
          useShadowDom: true,
          overrideConsole: false,
          defaults: {
            theme: 'Light Owl',
            displaySize: 50,
          }
        }
      );
      const erudaContainer = document.querySelector('#eruda')
      const erudaShadowRoot =  erudaContainer.shadowRoot
      const button = erudaShadowRoot.querySelector(".eruda-entry-btn");
      button.style.display = 'none'
      </script>
        `;

  return htmlDoc.documentElement.outerHTML;
};


export const onLoadErudaConsole = (iframe) => {
  const iframeDocument = iframe.contentDocument;
  const erudaContainer = iframeDocument.querySelector('#eruda')
  const erudaShadowRoot =  erudaContainer.shadowRoot
  // const erudaHeader = erudaShadowRoot.querySelector('.eruda-tab');

  // console.log({erudaHeader})
  const erudaElm = erudaShadowRoot.querySelector(".eruda-tab");
  const erudaDevTools = erudaShadowRoot.querySelector(".eruda-dev-tools");
  if (erudaContainer) {
    const erudaShadowRoot = erudaContainer.shadowRoot;

    if (erudaShadowRoot) {
        // Create a style element with your custom styles
        const erudaCustomStyles = document.createElement('style');
        erudaCustomStyles.innerHTML = customStyle();

        // Append the style element to the shadow root
        erudaShadowRoot.appendChild(erudaCustomStyles);
    }
}
  if (erudaElm) {
    erudaElm.innerHTML = "";
    erudaElm.innerHTML = `
                    <div class="custom-header">
                    <div class="custom-header__title-container">
                        <h1 class="custom-header__title">Console</h1>
                      <div class='custom-header__error-count'>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M14.7876 12.5302L8.79592 1.4032C8.37123 0.614297 7.2399 0.614297 6.81486 1.4032L0.823535 12.5302C0.731324 12.7014 0.685094 12.8937 0.689357 13.0881C0.69362 13.2826 0.74823 13.4726 0.847857 13.6397C0.947483 13.8068 1.08872 13.9451 1.25779 14.0413C1.42685 14.1375 1.61797 14.1882 1.81248 14.1885H13.7969C13.9916 14.1885 14.1829 14.138 14.3522 14.042C14.5215 13.9459 14.663 13.8076 14.7628 13.6404C14.8627 13.4733 14.9174 13.2832 14.9218 13.0886C14.9261 12.894 14.8799 12.7016 14.7876 12.5302ZM7.80557 12.4658C7.6665 12.4658 7.53056 12.4246 7.41493 12.3473C7.2993 12.2701 7.20918 12.1602 7.15596 12.0318C7.10275 11.9033 7.08882 11.7619 7.11595 11.6255C7.14308 11.4891 7.21005 11.3638 7.30838 11.2655C7.40672 11.1672 7.532 11.1002 7.66839 11.0731C7.80479 11.046 7.94616 11.0599 8.07464 11.1131C8.20312 11.1663 8.31293 11.2564 8.39019 11.3721C8.46745 11.4877 8.50869 11.6236 8.50869 11.7627C8.50869 11.855 8.4905 11.9465 8.45517 12.0318C8.41983 12.1171 8.36804 12.1946 8.30275 12.2599C8.23746 12.3252 8.15995 12.377 8.07464 12.4123C7.98933 12.4476 7.8979 12.4658 7.80557 12.4658ZM8.56916 5.39414L8.36736 9.6832C8.36736 9.83239 8.3081 9.97546 8.20261 10.0809C8.09712 10.1864 7.95405 10.2457 7.80486 10.2457C7.65568 10.2457 7.5126 10.1864 7.40712 10.0809C7.30163 9.97546 7.24236 9.83239 7.24236 9.6832L7.04057 5.3959C7.03603 5.29345 7.05217 5.19114 7.08802 5.09506C7.12387 4.99898 7.17869 4.9111 7.24923 4.83666C7.31976 4.76222 7.40456 4.70274 7.49857 4.66178C7.59258 4.62081 7.69388 4.59919 7.79643 4.5982H7.80381C7.90705 4.59815 8.00924 4.61901 8.10419 4.65954C8.19915 4.70006 8.28492 4.7594 8.35631 4.83399C8.4277 4.90857 8.48325 4.99684 8.51959 5.09347C8.55593 5.19011 8.57231 5.29311 8.56775 5.39625L8.56916 5.39414Z" fill="#D34B57"/>
                      </svg>
                        <span id='error-count'>0 errors</span>
                      </div>
                      </div>
                      <div class="custom-header__button">
                        <button class="custom-header__clear-button">Clear
                        <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                        <path d="M0 3.25736C0 2.93439 0.230254 2.67257 0.514286 2.67257L2.29045 2.67225C2.64335 2.66208 2.95468 2.40693 3.07476 2.02945C3.07792 2.01953 3.08155 2.00729 3.09457 1.96287L3.1711 1.70175C3.21793 1.54164 3.25874 1.40216 3.31583 1.27749C3.54139 0.784947 3.95872 0.44292 4.44098 0.355353C4.56305 0.333187 4.69232 0.333281 4.84071 0.333389H7.15941C7.30779 0.333281 7.43707 0.333187 7.55914 0.355353C8.0414 0.44292 8.45872 0.784947 8.68428 1.27749C8.74138 1.40216 8.78218 1.54164 8.82901 1.70175L8.90555 1.96287C8.91857 2.00729 8.9222 2.01953 8.92535 2.02945C9.04544 2.40693 9.41852 2.6624 9.77143 2.67257H11.4857C11.7697 2.67257 12 2.93439 12 3.25736C12 3.58033 11.7697 3.84215 11.4857 3.84215H0.514286C0.230254 3.84215 0 3.58033 0 3.25736Z" fill="#858585"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.7304 13.6667H6.2696C8.12474 13.6667 9.05231 13.6667 9.65541 13.0761C10.2585 12.4855 10.3202 11.5167 10.4436 9.57904L10.6214 6.78711C10.6884 5.73578 10.7219 5.21012 10.4193 4.87701C10.1167 4.5439 9.60582 4.5439 8.58397 4.5439H3.41603C2.39418 4.5439 1.88325 4.5439 1.5807 4.87701C1.27815 5.21012 1.31163 5.73578 1.37858 6.78711L1.55639 9.57904C1.6798 11.5167 1.7415 12.4855 2.34459 13.0761C2.94769 13.6667 3.87526 13.6667 5.7304 13.6667ZM8.16418 7.23043C8.19166 6.9412 7.99119 6.68328 7.71642 6.65436C7.44165 6.62544 7.19662 6.83646 7.16915 7.12569L6.83581 10.6345C6.80834 10.9237 7.00881 11.1816 7.28358 11.2105C7.55835 11.2395 7.80337 11.0284 7.83085 10.7392L8.16418 7.23043ZM4.28358 6.65436C4.55835 6.62544 4.80337 6.83646 4.83085 7.12569L5.16419 10.6345C5.19166 10.9237 4.99119 11.1816 4.71642 11.2105C4.44165 11.2395 4.19662 11.0284 4.16915 10.7392L3.83581 7.23043C3.80834 6.9412 4.00881 6.68328 4.28358 6.65436Z" fill="currentColor"/>
                        </svg>
  
                        </button>
                        <button class="custom-header__collapse-button">
                          <svg  fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      
                        </button>
                      </div>
                      </div>
                    </div>
                  `;
    // remove class of luna tab in erudaelm
    erudaElm.classList.remove("luna-tab");
    erudaDevTools.style.cssText += `padding: 0px !important ; `;

    // const resizeHandle = iframeDocument.querySelector(".eruda-resizer");
    // const new_element = resizeHandle.cloneNode(true);
    // resizeHandle.parentNode.replaceChild(new_element, resizeHandle);
    // resizeHandle.classList = "custom-resizer";

    // let isResizing = false;
    // resizeHandle.addEventListener("click", () => {});
    // const erudaContainer = iframeDocument.querySelector(".eruda-container");
    // const erudaHeight = erudaContainer.offsetHeight;
    // const minHeight = hs(50) + hs(67);
    // const maxHeight = erudaHeight;

    // new_element.addEventListener("mousedown", function(e) {
    //   isResizing = true;
    //   let containerHeight = erudaDevTools.offsetHeight;
    //   let startY = e.clientY;
    //   let startTop = erudaDevTools.offsetTop;

    //   iframeDocument.addEventListener("mousemove", function(e) {
    //     if (isResizing) {
    //       let diffY = startY - e.clientY;
    //       let newHeight = containerHeight + diffY;
    //       if (newHeight > minHeight && newHeight < maxHeight) {
    //         // display: block;
    //         // opacity: 1;
    //         // padding: 0px !important
    //         erudaDevTools.setAttribute(
    //           "style",
    //           `height: ${newHeight}px !important; padding: 0px !important; display: block !important; opacity: 1 !important; top: ${startTop -
    //             diffY}px !important ;`
    //         );
    //       }
    //     }
    //   });

    //   iframeDocument.addEventListener("mouseup", function(e) {
    //     if (isResizing) {
    //       isResizing = false;
    //     }
    //   });
    // });

    const eruda = iframe.contentWindow.eruda;
    iframeDocument.innerHTML += `
                  <div class="eruda-console">
                  </div>
                  `;
    const collapseButton = erudaShadowRoot.querySelector(
      ".custom-header__collapse-button"
    );
    const clearButton = erudaShadowRoot.querySelector(
      ".custom-header__clear-button"
    );
    function collapseConsole() {
      // height: ${hs(50) + hs(67)}px !important;
      erudaDevTools.classList.toggle("collapse");
      collapseButton.classList.toggle("rotate");
    }
    collapseButton.addEventListener("click", () => {
      collapseConsole();
    });
    clearButton.addEventListener("click", () => {
      // clear console
      const erudaConsole = eruda.get("console");
      erudaConsole.clear();
      updateErrorCount(iframe, iframeDocument, "0");
    });
    erudaDevTools.cssText += `height: 50% !important ; `;

    setTimeout(() => {
      updateErrorCount(iframe, iframeDocument);
    }, 10);
    if (erudaDevTools) {
      collapseConsole();
    }
    eruda.show();
  }
};


export const appendClassToCSSElmInCssCode = (code) => {
  // this function is used to add class to css code
  // so that scope if css code is limited to user-code-output div
  // and doesn't affect other elements in the page
    const lines = code.split('\n');
    const modifiedLines = lines.map(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.endsWith('{')) {
        const selector = trimmedLine.slice(0, -1).trim();
        const modifiedSelector = selector
          .split(/\s+/) // split selector by spaces
          .map((part, i) => {
            if (i === 0 && !part.startsWith('#') && !part.startsWith('.') && !part.includes('body') && !part.includes('html')) {
              return `#user-code-output ${part}`;
            } else {
              return part;
            }
          })
          .join(' ');
        return `${modifiedSelector} {\n`;
      } else {
        return `${line}\n`;
      }
    });
    return modifiedLines.join('');
  }
  
  
export const moveConsoleToParentWindow = () => {
    const parentPage = window.parent.document;
    // Get the eruda div inside the iframe
    const erudaDiv = document.getElementById("eruda");
    // Move the eruda div to the parent DOM
    parentPage.body.appendChild(erudaDiv);
}
