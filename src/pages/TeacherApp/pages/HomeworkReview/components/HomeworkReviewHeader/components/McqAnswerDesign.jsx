import React from "react";
import "./McqAnswerDesign.scss";
function McqAnswerDesign() {
  const data = [
    {
      answer: "Shaielsh",
    },
    {
      answer: "Joe",
    },
    {
      answer: "No joe",
    },
    {
      answer: "Wow",
    },
  ];

  return (
    <>
      <div style={{ display: "flex" }}>
        <div className="correct__answer__tag__pq">Correct</div>

        <div className="pq__report__answer__review__main__container">
          <div className="answer__main__container__pq">
            {data.map((item) => (
              <>
                <div className="answer__container__pq"> {item.answer}</div>
                <div className="answer__container__pq__empty"></div>
              </>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default McqAnswerDesign;
