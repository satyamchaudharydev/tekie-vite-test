import React from "react";
import {
  CompletedIcon,
  AttemptingIcon,
  UnattemptedIcon,
} from "../../../../../../../constants/icons";
import "./GraphlabelComponent.scss";
function GraphlabelComponent({
  attemptingPercentage,
  submittedPercentage,
  unattemptedPercentage,
}) {
  return (
    <div>
      <div className="label__container__section">
        <div className="label__container__section__1">
          <span>
            <CompletedIcon />
          </span>
          <span className="graph__text__label">
          Submitted: 
          </span>
          <span className="percentage__label">
            {submittedPercentage ? `${submittedPercentage}%` : "0%"}
          </span>
        </div>
        <div className="label__container__section__1">
          <span>
            <UnattemptedIcon />
          </span>
          <span className="graph__text__label">
          Attempted: 
          </span>
          <span className="percentage__label">
            {attemptingPercentage ? `${attemptingPercentage}%` : "0%"}
          </span>
        </div>
        <div className="label__container__section__1">
          <span>
            <AttemptingIcon />
          </span>
          <span className="graph__text__label">
          Unattempted: 
          </span>
          <span className="percentage__label">
            {unattemptedPercentage ? `${unattemptedPercentage}%` : "0%"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default GraphlabelComponent;
