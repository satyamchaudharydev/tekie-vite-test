import React from 'react'
import './Converter.scss'

const Binary = ({ isActive, binText, setBinText, setText }) => {

  return (
    <div className={`wrapper ${isActive ? "active" : ""}`}>
      <textarea
        name="binaryText"
        id="binaryText"
        className={`textarea ${isActive ? "active" : ""}`}
        disabled={!isActive ? true : false}
        value={binText}
        onChange={(e) => {
          let str = e.target.value
          let lastChar = str.charAt(str.length - 1)
          if (lastChar === ' ' || lastChar === '1' || lastChar === '0') {
            setBinText(e.target.value);
          }
          else {
            setBinText(str.slice(0, -1))
          }
        }}
      ></textarea>
    </div>
  );
};

export default Binary
