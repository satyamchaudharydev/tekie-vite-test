import React from 'react'
import "./Converter.scss";

const English = ({isActive, text, setText}) => {
    return (
      <div className={`wrapper ${isActive ? "active" : ""}`}>
        <textarea
          name="englishText"
          id="englishText"
          className={`textarea ${isActive ? "active" : ""}`}
                disabled={!isActive ? true : false}
        onChange={(e) => {
                    setText(e.target.value)
                }}
            value={text}
        ></textarea>
      </div>
    );
}

export default English
