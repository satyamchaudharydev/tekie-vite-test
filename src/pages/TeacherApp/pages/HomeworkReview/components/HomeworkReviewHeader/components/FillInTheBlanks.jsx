import React from "react";
import "./FillInTheBlanks.scss"

function FillInTheBlanksDesign() {
  return (
    <>
      <div className="pq__fill__blank__main__container">
        <div className="pq__fill__blank_tag">Correct</div>
            <div className="pq__fill__blank__answer__container">
                What is the answer of 2*2 _______ ?
            </div>
      </div>    
    </>
  );
}

export default FillInTheBlanksDesign;
