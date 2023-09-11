import onUpdate from "../utils/onUpdate";
import useCodeMirror from "./useCodeMirror";
import { useEffect } from "react";

export default function useCodeEditor({ value, onChange, extensions = [], readOnly,language }) {
  const { ref, view } = useCodeMirror({extensions: [onUpdate(onChange), ...extensions ],lint: true, readOnly,language});
 
  useEffect(() => {
    if (view) {
      const editorValue = view.state.doc.toString();

      if (value !== editorValue) {
        view.dispatch({
          changes: {
            from: 0,
            to: editorValue.length,
            insert: value || "",
          },
        });
      }
    }
  }, [value, view]);

  return ref;
}
