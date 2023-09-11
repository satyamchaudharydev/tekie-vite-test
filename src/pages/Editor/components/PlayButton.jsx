import React from "react";
import { ReactComponent as PlayIcon } from "../../../assets/play.svg";

export default function PlayButton({ runButton, playButton, runCode,style,setWebState }) {
    const handleClick = () => {
      // running code
      runCode();
      // if the setWebState props is present, the set the  web state
      if(setWebState){
        setWebState({mobileOuputShow: true});
        }
      }
    
  return (
    <div style={style} className={runButton || "playButton"} onClick={handleClick}>
      <PlayIcon />
    </div>
  );
}
