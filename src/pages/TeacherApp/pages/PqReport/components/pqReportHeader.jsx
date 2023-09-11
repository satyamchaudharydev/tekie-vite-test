import React, { useEffect } from "react";
import "./pqReportHeader.scss";
import { Doughnut, Pie } from "react-chartjs-2";
import {ReportIcon} from "./pqReportConstants"
import GraphlabelComponentPq from "../components/GraphLabelComponentPq";
import LinearLabelComponentPq from "../components/LinearLabelComponentPq"
import CodingLabelComponentPq from "../components/CodingLabelComponentPq"

import { get } from "lodash";
import extractSubdomain from "../../../../../utils/extractSubdomain";
import { getDataFromLocalStorage } from "../../../../../utils/data-utils";
import getClassworkSummary from "../../../../../queries/teacherApp/getClassworkSummary";
import { checkIfEmbedEnabled } from "../../../../../utils/teacherApp/checkForEmbed";
function PqReportHeader({newPqReportData,pqQuestions}) {

  const overallPqData = get(newPqReportData,"practiceQuestionOverallReport.0",{})

const submittedPercentage = get(overallPqData,"submittedPercentage", 0)
const attemptedPercentage = get(overallPqData,"attemptedPercentage", 0)
const unattemptedPercentage = get(overallPqData,"unattemptedPercentage", 0)
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
  useEffect(async()=>{
    if(checkIfEmbedEnabled()){
      const classroomSessionsData = getDataFromLocalStorage('classroomSessionsData')
      const batchId = get(classroomSessionsData,'batchId')
      const topicId = get(classroomSessionsData,'topicId')
      if(checkIfEmbedEnabled()){
        await getClassworkSummary(batchId,topicId)
      }
    }
  },[])

  const styles = {
    pieContainer: {
      width: "30%",
      height: "30%",
      left: "58%",
      bottom: "32%",
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
        data: [submittedPercentage, attemptedPercentage, unattemptedPercentage],
        backgroundColor: ["#01AA93", "#FF5744", "#EEEEEE"],
      },
    ],
    labels: ["Attempted", "Attempting", "Unattempted"],
  };

  return (
    <>
      <div className="Homework__Review__Graph__Title">
        <ReportIcon />
        <span>Practice Quiz Report</span>
      </div>

      <div className="homework__review__main__component">
        <div className="Homework__Review__Overall__Title">Overall Submission Status</div>

        <div className="Homework__Review__Overall__percentage">
          <div className="Homework__Review__Overall__percentage__title">
            {`${submittedPercentage}%`}

          </div>
          <div className="Homework__Review__Overall__percentage__description">
            Total Submissions
          </div>
        </div>

        <div style={styles.pieContainer}>
          <Pie data={newData} options={pieOptions} />
        </div>
        <div id="legend" />
        <div className="graph__label">
          <GraphlabelComponentPq submittedPercentage={submittedPercentage} attemptedPercentage={attemptedPercentage} unattemptedPercentage={unattemptedPercentage}/>
        </div>
      </div>

       <div className="graph__section__homework__review">
        <LinearLabelComponentPq name="Practice Question"  overallPqData={overallPqData} pqQuestions={pqQuestions} submittedPercentage={submittedPercentage}/>
      </div>
      {/* <div className="graph__section__homework__review2">
        <CodingLabelComponentPq name="Coding"  />
      </div>  */}
    </>
  );
}

export default PqReportHeader;
