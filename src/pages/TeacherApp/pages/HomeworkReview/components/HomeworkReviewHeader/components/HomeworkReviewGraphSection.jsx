import React from "react";
import "./HomeworkReviewGraphSection.scss";
import { ReportIcon } from "../../HomeworkReviewImages/HomeworkReviewConstants";
import LinearGraphComponent from "./LinearLabelComponent";
import CodingLabelComponent from "./CodingLinearComponent";
import {
  CompletedIcon,
  AttemptingIcon,
  UnattemptedIcon,
} from "../../../../../../../constants/icons";
import { Doughnut, Pie } from "react-chartjs-2";
import { chartColors } from "./fakeData";
import GraphlabelComponent from "./GraphlabelComponent";
import { get } from "lodash";
function HomeworkReviewGraphSection({ newHomeworkData,componentNameCoding,componentNamePractice }) {
  const pieChartData = get(newHomeworkData, "overall", []);
  const submittedPercentageValue = pieChartData.submittedPercentage;
  const attemptingPercentageValue = pieChartData.attemptedPercentage;
  const unattemptedPercentageValue = pieChartData.unattemptedPercentage;

  

  const pieOptions = {
    plugins: { legend: { display: false } },

    legend: {
      display: false,
      position: "center",
      legendCallback: function(chart) {
        
      },
    },
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
  };

  const styles = {
    pieContainer: {
      width: "30%",
      height: "30%",
      left: "50%",
      bottom: "50%",
      position: "relative",
      overflowY: "visible",
    },
    relative: {
      position: "relative",
    },
  };

  const newData = {
    datasets: [
      {
        data: [
          pieChartData.submittedPercentage,
          pieChartData.attemptedPercentage,
          pieChartData.unattemptedPercentage,
        ],
        backgroundColor: ["#01AA93", "#FF5744", "#EEEEEE"],
      },
    ],
    labels: ["Attempted", "Attempting", "Unattempted"],
  };

  return (
    <>
      <div className="Homework__Review__Graph__Title">
        <ReportIcon />
        <span>Homework Report</span>
      </div>

      <div className="homework__review__main__component">
        <div className="Homework__Review__Overall__Title">Overall</div>

        <div className="Homework__Review__Overall__percentage">
          <div className="Homework__Review__Overall__percentage__title">
            {submittedPercentageValue
              ? `${pieChartData.submittedPercentage}%`
              : "0%"}
          </div>
          <div className="Homework__Review__Overall__percentage__description">
            Submission Rate
          </div>
        </div>

        <div style={styles.pieContainer}>
          <Pie data={newData} options={pieOptions} />
        </div>
        <div id="legend" />
        <div className="graph__label">
          <GraphlabelComponent
            submittedPercentage={submittedPercentageValue}
            unattemptedPercentage={unattemptedPercentageValue}
            attemptingPercentage={attemptingPercentageValue}
          />
        </div>
      </div>

      <div className="graph__section__homework__review">
        <LinearGraphComponent name="Quiz" newHomeworkData={newHomeworkData} />
      </div>
      {componentNameCoding === "homeworkAssignment" && <div className="graph__section__homework__review2">
        <CodingLabelComponent name="Coding" newHomeworkData={newHomeworkData} />
      </div>}
      
      {componentNamePractice === "homeworkPractice" && <div className="graph__section__homework__review2">
        <CodingLabelComponent name="Blockly" newHomeworkData={newHomeworkData} />
      </div>}
      
    </>
  );
}

export default HomeworkReviewGraphSection;
