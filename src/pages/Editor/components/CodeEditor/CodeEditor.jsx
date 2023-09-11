import React from "react";
import useCodeEditor from "../../hooks/useCodeEditor";
import "./style.scss";
export default function CodeEditor({ value, onChange, extensions, readOnly = false,language }) {
  
  if(language === "javascript" || language === "markup"){
    language = "htmlMixed"
  }
  const ref = useCodeEditor({ value, onChange, extensions, readOnly,language });

  return <div style={{height: "100%"}} ref={ref} />;
}

