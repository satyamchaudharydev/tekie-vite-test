//  Todo - create library from out of this

import { HTMLHint } from "htmlhint";
import { CSSLint } from "csslint";
import {JSHINT} from "jshint"

function getJSHintErrors(text) {
  JSHINT(text, linterConfig.javascript);
  return JSHINT.errors || [];
}


export const htmlLinter = async (view) => {
  const text = view.state.doc.toString();
  const errors = HTMLHint.verify(text, linterConfig.html);
  const diagnostics = errors.map((error, index) => {
    let startLine = error.line - 1;
    let startCol = error.col - 1;
    let endLine = error.line - 1;
    let endCol = startCol + 1;
    const from = view.state.doc.line(startLine).from + startCol;
    const to = view.state.doc.line(endLine).from + endCol;
    return {
      from: from,
      to: to,
      message: error.message,
      severity: "error",
    };
  });
  return diagnostics;
};

export const cssLinter = async (view) => {
  const text = view.state.doc.toString();
  const cssRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const matches = text.match(cssRegex) || [];
  
  const diagnostics = [];

  for (const match of matches){
    const cssText = match.replace(/<style[^>]*>|<\/style>/gi, '');
    const lineNumber = text.substr(0, text.indexOf(match)).split("\n").length;
    const errors = CSSLint.verify(cssText, linterConfig.css).messages;
    
    errors.forEach((error) => {
      const startLine = error.line + lineNumber - 1;
      const startCol = error.col - 1;
      const endLine = error.line + lineNumber - 1;
      const endCol = startCol + 1;
      const from = view.state.doc.line(startLine).from + startCol;
      const to = view.state.doc.line(endLine).from + endCol;
      let errorMessage = error.message;
      const lineIndex = errorMessage.indexOf('at line');
      if(lineIndex !== -1){
        errorMessage = errorMessage.substring(0, lineIndex);
      }
      diagnostics.push({
        from: from,
        to: to,
        message: errorMessage,
        severity: "error",
      });
    });

  }
  return diagnostics;
  
};

export const jsLinter = async (view) => {
    const text = view.state.doc.toString();
    const jsRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    const matches = text.match(jsRegex) || [];
  
    const diagnostics = [];
  
    for (const match of matches) {
      const jsText = match.replace(/<script[^>]*>|<\/script>/gi, '');
      const lineNumber = text.substr(0, text.indexOf(match)).split("\n").length;
      if(!jsText.trim()) return
      const errors = getJSHintErrors(jsText);

      errors.forEach((error) => {
        const startLine = error.line + lineNumber - 1;
        const startCol = error.character - 1;
        const endLine = error.line + lineNumber - 1;
        const endCol = startCol + 1;
        const from = view.state.doc.line(startLine).from + startCol;
        const to = view.state.doc.line(endLine).from + endCol;
        const code = error.code
        if(code === 'W060' ) return
        diagnostics.push({
            from: from,
            to: to,
            message: error.reason,
            severity: "error",
            });
        });
   
    }
    return diagnostics;
  };

const linterConfig = {
  html:{
    "tag-pair": true,
    "id-unique": true,
    "tagname-lowercase": true,
  },
  css: {
    "adjoining-classes": false,
    'empty-rules': false
  },    
  javascript: {
    'esversion': 6,
    "browser": true,

    'globals': {
      'browser': true,
      'console': true,
      'document': true,
      'window': true,
      'alert': true,
      'confirm': true,
    },
    'undef': true,
    'asi': true,
  

  }
}