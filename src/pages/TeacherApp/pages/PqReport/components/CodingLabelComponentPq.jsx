import React from 'react'
import "./CodingLabelComponentPq.scss"
function CodingLabelComponentPq({name}) {
  return (
    <div>
         <div
      className={
        name === "Quiz" ? "Quiz__main__component1" : "Quiz__main__component2"
      }
    >
      <div>
        <span className="Quiz__title__linear__graph">Practice Questions</span>
        <span className="Quiz__text__linear__graph">
          {/* ({`${codingChartData.totalQuestions} Questions`}) */}
          (4 questions)
        </span>
      </div>
      <div className="Quiz__percentage__container">
        <div className="Quiz__percentage__text">
            {/* {`${
          codingChartData.averageScore ? codingChartData.averageScore : "0"
        }%`} */}
        10%
        </div>
        <span className="Quiz__percentage__description">
          Average Coding Submission
        </span>
      </div>
    </div>
    </div>
  )
}

export default CodingLabelComponentPq