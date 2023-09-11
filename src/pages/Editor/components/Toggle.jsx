import React from "react";
import { useState } from "react";

const styleConfig = {
  'editor': {switchStyle: ['#888888', '#00ade6'],labelStyle : ['#fff','#a8a7a7']  },
  'attendance': {switchStyle: ['#A8A7A7', '#01AA93'],labelStyle : ['#504F4F','#504F4F']  }
}

export default function Toggle({label,handleToggle,toggleState,color={}, mode = 'editor'}) {
  const toggleSwitch = () => {
    handleToggle()
  };
  // get style with mode
  const style = styleConfig[mode]
  const switchStyle = style['switchStyle']
  const labelStyle = style['labelStyle']


  return (
    <div className="toggle" data-isOn={toggleState}>
        <div className="switch"
        style={{
          background: toggleState ? switchStyle[1]: switchStyle[0] 
        }} 
         onClick={toggleSwitch}>
            <div className="handle"></div>
        </div>
        <p  style={{
          color: toggleState ? labelStyle[1]: labelStyle[0] 
        }} 
        className="toggle-label">{label}</p>
    </div>
    
  );
}

