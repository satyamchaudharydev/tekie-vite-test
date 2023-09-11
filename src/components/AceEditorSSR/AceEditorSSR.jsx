import React, { useEffect } from 'react'
import '../../pages/Editor/editor.scss';
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-dracula";

const AceEditorSSR = (props) => {

  useEffect(() => {
    props.mode && require(`ace-builds/src-noconflict/mode-${props.mode}`)
    props.theme && require(`ace-builds/src-noconflict/theme-${props.theme}`)
  }, [])

  return <div></div>
}

export default AceEditorSSR
