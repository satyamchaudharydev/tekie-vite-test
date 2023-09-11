import React from "react";

import "./GraphLabelComponentPq.scss";
import {
  CompletedIcon,
  AttemptingIcon,
  UnattemptedIcon,
} from "../../../../../constants/icons";
import { get } from "lodash";
function GraphlabelComponentPq({
  submittedPercentage,
  attemptedPercentage,
  unattemptedPercentage,
}) {
  return (
    <div>
      <div className="label__container__section">
        <div className="label__container__section__1">
          <span>
            <CompletedIcon />
          </span>
         <span className="graph__text__label">Attempted:</span> 
          <span className="percentage__label">{`${submittedPercentage}%`}</span>
        </div>
        <div className="label__container__section__1">
          <span>
            <AttemptingIcon />
          </span>
          <span className="graph__text__label"> Unattempted:</span>
          
          <span className="percentage__label">
            {`${unattemptedPercentage}%`}
          </span>
        </div>
      </div>
    </div>
  );
}

export default GraphlabelComponentPq;
