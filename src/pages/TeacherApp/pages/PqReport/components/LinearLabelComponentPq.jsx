import React from "react";
import "./LinearLabelComponentPq.scss";
import { get, over } from "lodash";
import { hsFor1280 } from "../../../../../utils/scale";
function LinearLabelComponentPq({
  name,
  newHomeworkData,
  overallPqData,
  pqQuestions,
  submittedPercentage,
}) {
  const averageTriesOverall = get(overallPqData, "avgTriesPerQuestion", 0);
  const averageTime = get(overallPqData, "avgTimePerQuestion", 0);
 
  const firstTryPercentage = get(overallPqData, "firstTryPercentage", 0);
  const secondTryPercentage = get(overallPqData, "secondTryPercentage", 0);
  const thirdTryPercentage = get(overallPqData, "thirdTryPercentage", 0);
  
  let submittedFirstTryPercentage = Math.round(Number((firstTryPercentage*submittedPercentage/100)))
  let submittedSecondTryPercentage = Math.round(Number((secondTryPercentage*submittedPercentage/100)))
  let submittedThirdTryPercentage = Math.round(Number((thirdTryPercentage*submittedPercentage/100)))


  if((submittedFirstTryPercentage+submittedSecondTryPercentage+submittedThirdTryPercentage)>submittedPercentage){
    const val = Math.max(submittedFirstTryPercentage,submittedSecondTryPercentage,submittedThirdTryPercentage)
    if(val===submittedFirstTryPercentage){
      submittedFirstTryPercentage=submittedFirstTryPercentage-1
    } 
    if(val===submittedSecondTryPercentage){
      submittedSecondTryPercentage=submittedSecondTryPercentage-1
    } 
    if(val===submittedThirdTryPercentage){
      submittedThirdTryPercentage=submittedThirdTryPercentage-1
    } 
  }
  
  
  return (
    <div
      className={
        name === "Quiz" ? "Quiz__main__component1" : "Quiz__main__component2"
      }
    >
      <div>
        <span className="Quiz__title__linear__graph">{name}</span>
        <span className="Quiz__text__linear__graph">
          ({`${(pqQuestions || []).length} Questions`})
        </span>
      </div>
      <div style={{ display: "flex" }}>
        <div className="Quiz__percentage__container">
          <div className="Quiz__percentage__text">{`${Math.round(averageTriesOverall)}`}</div>
          <span className="Quiz__percentage__description__pq">
            Avg. tries / question
          </span>
        </div>
        <div
          style={{ marginLeft: "20px" , display:averageTime===null ?"none":"block" }}
          className="Quiz__percentage__container"
        >
          <div className="Quiz__percentage__text">{`${averageTime} mins`}</div>
          <span className="Quiz__percentage__description__pq">
            Avg. time / student
          </span>
        </div>
      </div>

      <div className="bar__graph">
        <div className="bar__graph__main__container">
          <div className="bar__graph__container1">
            <div
              style={{ height: `${(firstTryPercentage/100)*100}%`,maxHeight:hsFor1280(90) }}
              className="bar__graph__image1_pq"
            ></div>
            <div className="bar__graph__text_s">
              <div className="Quiz__total__text_a">1st try</div>
              <div className="Quiz__total__number_ca">{`${submittedFirstTryPercentage}%`}</div>
            </div>
          </div>
          <div className="bar__graph__container2">
            <div
              style={{ height: `${(secondTryPercentage/100)*100}%`,maxHeight:hsFor1280(90) }}
              className="bar__graph__image2_pq"
            ></div>
            <div className="bar__graph__text_s">
              <div className="Quiz__total__text_a">2nd try</div>
              <div className="Quiz__total__number_ca">{`${submittedSecondTryPercentage}%`}</div>
            </div>
          </div>
          <div className="bar__graph__container3">
            <div
              style= {{ height: `${(thirdTryPercentage/100)*100}%`,maxHeight:hsFor1280(90) }}
              className="bar__graph__image2_pq"
            ></div>
            <div className="bar__graph__text_s">
              <div className="Quiz__total__text_a">3rd try</div>
              <div className="Quiz__total__number_ca">{`${submittedThirdTryPercentage}%`}</div>
            </div>
          </div>
          {/* {name === "quiz" ? (
            null
          ) : (
            <div className="bar__graph__container3">
              <div
                style={{
                  height: `${quizChartData.averagePartiallyCorrect * 10}px`,
                }}
                className="bar__graph__image3"
              ></div>
              <div className="bar__graph__text">
                <div className="Quiz__total__text">Partially Correct</div>
                <div className="Quiz__total__number">{`${quizChartData.averagePartiallyCorrect}`}</div>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}

export default LinearLabelComponentPq;
