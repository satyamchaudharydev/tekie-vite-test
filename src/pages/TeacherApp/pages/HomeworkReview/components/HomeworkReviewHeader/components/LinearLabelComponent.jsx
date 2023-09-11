import React,{useState,useEffect} from "react";
import "./LinearLabelComponent.scss";
import { get } from "lodash";
function LinearLabelComponent({ name, newHomeworkData }) {
  const [maxvalue, setMaxValue] = useState();
 
  const quizChartData = get(newHomeworkData, "quiz", {});
 

  
  const firstValue = get(quizChartData, 'averageCorrect') || 0;
  const secondValue = get(quizChartData, 'averageIncorrect') || 0;

  function graphChecker() {
    if (firstValue > secondValue) {
      setMaxValue(firstValue+secondValue);
      
    }
    if (firstValue < secondValue) {
      setMaxValue(firstValue+secondValue);
      
    }
  }
  useEffect(() => {
    graphChecker();
  }, [firstValue, secondValue]);

  return (
    <div
      className={
        name === "Quiz" ? "Quiz__main__component1" : "Quiz__main__component2"
      }
    >
      <div>
        <span className="Quiz__title__linear__graph">{name}</span>
        <span className="Quiz__text__linear__graph_c">
          ({`${get(quizChartData, 'totalQuestions') || 0} Questions`})
        </span>
      </div>
      <div className="Quiz__percentage__container_c">
        <div className="Quiz__percentage__text">{`${
          get(quizChartData, 'averageScore') || 0
        }%`}</div>
        <span className="Quiz__percentage__description__quiz">
          Avg. Quiz Score
        </span>
      </div>
      <div className="bar__graph">
        <div className="bar__graph__main__container">
          <div className="bar__graph__container1">
            <div
              style={{
                height: `${(firstValue/maxvalue)*100}%`,
              }}
              className="bar__graph__image1"
            ></div>
            <div className="bar__graph__text">
              <div className="Quiz__total__text">Correct</div>
              <div className="Quiz__total__number_c">
                {get(quizChartData, 'averageCorrect', 0) || 0}
              </div>
            </div>
          </div>
          <div className="bar__graph__container2">
            <div
              style={{
                height: `${(secondValue/maxvalue)*100}%`,
             
               }}
              className="bar__graph__image2"
            ></div>
            <div className="bar__graph__text">
              <div className="Quiz__total__text">Incorrect</div>
              <div className="Quiz__total__number_c">{`${get(quizChartData, 'averageIncorrect') || 0}`}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LinearLabelComponent;
