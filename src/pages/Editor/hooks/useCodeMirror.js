import { useState, useRef, useEffect } from "react";
import { EditorView, basicSetup,  } from "codemirror";
import { keymap} from "@codemirror/view"
import {indentWithTab} from "@codemirror/commands"

import { java } from "@codemirror/lang-java";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import {python} from "@codemirror/lang-python"
import { linter, lintGutter } from "@codemirror/lint";
import { hs } from "../../../utils/size";
import { dracula } from "@uiw/codemirror-theme-dracula";
// import { htmlLinter, cssLinter, jsLinter } from "../utils/htmlMixedLinter";

const mixedHTML = html({
  config: {
    nestedLanguages: {
      tag: {
        script: javascript(),
        style: css(),
      },
    },
  },
});

export default function useCodeMirror(
  { language = "htmlMixed", lint = true, extensions = [], readOnly = false } = {}
) {
  const ref = useRef(null);
  const [view, setView] = useState();
  if(language === "java") lint = false
  useEffect(() => {
    if (!ref.current) return;

    const lang = getLanguage(language);
    const lintExt = lint ? getLintExtension(language) : [];
    const view = new EditorView({
      extensions: [
        ...lintExt,
        lint ? lintGutter({
          renderMarker: ({ marker, severity }) => {
            const el = document.createElement("div");
            el.classList.add("cm-gutter-lint-marker", `custom-lint-marker-${severity}`);
            el.title = marker.message;
            return el;
          },
          markers: {
            error: {
              className: "custom-lint-marker error",
            },
            warning: {
              className: "custom-lint-marker warning",
            },
            info: {
              className: "custom-lint-marker info",
            },
          },
        }): [],
        basicSetup,
        keymap.of([indentWithTab]),
        lang,
 
        dracula,
        EditorView.lineWrapping,
        EditorView.theme(
          {
            "&": {
              backgroundColor: "red",
              fontSize: `${hs(22)}px`,
              height: "100%",
            },
            ".cm-scroller": {
              backgroundColor: "#002f3e",
            },
            "&.cm-focused": {
              backgroundColor: "#104b5f",
            },
            ".cm-gutters": {
              backgroundColor: "#002f3e !important",
            },
          },
          { dark: true }
        ),
        EditorView.editable.of(!readOnly),
        ...extensions,
      ],

      lint: { highlightLines: true },
      parent: ref.current,
    });

    setView(view);

    return () => {
      view.destroy();
      setView(undefined);
    };
  }, [readOnly]);

  function getLanguage(language) {
    switch (language) {
      case "htmlMixed":
        return mixedHTML;
      case "java":
        return java();
      case "python":
        return python();  
      default:
        return mixedHTML;
    }
  }

  function getLintExtension(language) {
    switch (language) {
      case "htmlMixed":
        return [];
      case "java":
        return []
        
      default:
        return [];
      
    }
  }

  return { ref, view };
}
