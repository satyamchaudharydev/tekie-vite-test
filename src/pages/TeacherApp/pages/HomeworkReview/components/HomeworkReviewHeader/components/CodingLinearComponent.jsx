import React from "react";
import { get } from "lodash";
import "./CodingLinearComponent.scss";
function CodingLabelComponent({ name, newHomeworkData }) {
  const codingChartData = get(newHomeworkData, "coding", {});
  const blocklyChartData = get(newHomeworkData, "blockBasedPractice", {});

  return (
    <div
    
      className={
        name === "Coding" ? "Quiz__main__component2" : "Quiz__main__component2"
      }
    >
      <div style={{paddingTop:"10px"}}>
        <span className="Quiz__title__linear__graph">{name}</span>
        <span className="Quiz__text__linear__graph_d">
          {name === "Coding" && (
            <span>({`${get(codingChartData, 'totalQuestions') || 0} Questions`})</span>
          )}
          {name === "Blockly" && (
            <span>({`${get(blocklyChartData, 'totalQuestions') || 0} Questions`})</span>
          )}
        </span>
      </div>
      <div className="Quiz__percentage__container">
        {name === "Coding" && (
          <div className="Quiz__percentage__text">{`${
              get(codingChartData, 'submittedPercentage') || 0
          }%`}</div>
        )}
        {name === "Blockly" && (
          <div className="Quiz__percentage__text">{`${get(blocklyChartData, 'submittedPercentage') || 0
          }%`}</div>
        )}
        <span className="Quiz__percentage__description__code">
          {name === "Coding" && `Avg. Coding Submission`}
          {name === "Blockly" && `Avg. Blockly Submission`}
        </span>
      </div>
    </div>
  );
}

export default CodingLabelComponent;
