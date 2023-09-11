import React, { useState } from "react";
import TekieContentEditorParser from "../../../../../components/Preview/Preview";
// import McqAnswerDesign from "./McqAnswerDesign";
// import FillInTheBlanksDesign from "./FillInTheBlanks";
import Arrange from "../../../../../components/QuestionTypes/Arrange";
import Mcq from "../../../../../components/QuestionTypes/Mcq";
import FibBlock from "../../../../../components/QuestionTypes/FibBlock";
import FibInput from "../../../../../components/QuestionTypes/FibInput";
import { get } from "lodash";
import { isEmpty, get as getFromLoadash, sortBy,truncate } from "lodash";
import "./PqReportQuestion.scss";
import {
  DropdownIcon,
  QuizQuestionIcon,
} from "../components/pqReportConstants";
import "./PqReportQuestion.scss";
import TekieCEParser from "../../../../../components/Preview/Preview";
import parseMetaTags from "../../../../../utils/parseMetaTags";
import { padding } from "polished";
import PqReport from "..";

const GREEN='#01AA93'
const YELLOW='#FAAD14'
const RED='#01AA93'

function PqReportQuestionSection({
  pqQuestions,
  newPqReportData,
  newIndividualStudentReport,
  styles = {}
}) {
  const [clicked, setClicked] = useState(false);
  const [answers, setAnswers] = useState();

  // const questions = (pqQuestions && pqQuestions.questionBank) || [];

  const newArray = get(newPqReportData, "practiceQuestionOverallReport.0.pqIndividualQuestionReport", []);

  
  const percentageFinder = (item) => {
    const percentageArray = newArray.find((question) => question.questionId === item.id);
    if (percentageArray) {
      return Math.round(percentageArray.avgTries);
    }
    return 0;
  };
 
  const colorFinder = (item) => {
    const arrayItem = newArray.find(
      (question) => question.questionId === item.id
    );
    const avgNosOfTries = get(arrayItem,'avgTries',0)
    if(avgNosOfTries===0) return { background: YELLOW };
    if(avgNosOfTries>=1 && avgNosOfTries <2) return {background: GREEN}
    if(avgNosOfTries>=2 && avgNosOfTries <3) return {background: YELLOW}
    return {background: RED}
    // if (arrayItem) {
    //   if (
    //     arrayItem.avgTries >= 0 &&
    //     arrayItem.avgTries < 1
        
    //   ) {
        
    //     return { background: "#ff5744" };
    //   }
    //   if (
    //     arrayItem.avgTries >= 1 &&
    //     arrayItem.avgTries <= 2
    //   ) {
     
    //     return { background: "#faad14" };
    //   }
    //   if (
    //     arrayItem.avgTries >= 2 &&
    //     arrayItem.avgTries <= 3
    //   ) {
    //     return { background: "#01aa93" };
    //   }
    // }

  };

  const ARRANGE = "arrange";
  const FIBBLOCK = "fibBlock";
  const FIBINPUT = "fibInput";
  const MCQ = "mcq";
  const toggle = (index, item) => {
    const answer = [];
    const questionType = get(item, "questionType", "");

    let options;
    if (questionType === "mcq") {
      options = get(item, "mcqOptions", "");
    }
    if (questionType === "fibInput") {
      options = get(item, "fibInputOptions", []);
    }
    if (questionType === "fibBlock") {
      options = get(item, "fibBlocksOptions", []);
    }
    if (questionType === "arrange") {
      options = get(item, "arrangeOptions", []);
    }

    if (clicked === index) {
      return setClicked(null);
    }
    setClicked(index);

    switch (questionType) {
      case MCQ:
        options.forEach((option) => {
          if (option.isCorrect) {
            answer.push(true);
          } else {
            answer.push(false);
          }
        });
        break;
      case FIBBLOCK:
        let modOptions = sortBy(options, "correctPositions[0]");
        const positionsIncluded = [];
        modOptions.forEach((option) => {
          if (!positionsIncluded.includes(get(option, "correctPositions[0]"))) {
            answer.push(option.statement);
            positionsIncluded.push(get(option, "correctPositions[0]"));
          }
        });
        break;
      case FIBINPUT:
        modOptions = sortBy(options, "correctPosition");

        modOptions.forEach((option) => {
          answer.push(option.answers[0]);
        });
        break
      case ARRANGE:
        const sortedOptions = sortBy(options, "correctPositions[0]");
        sortedOptions.forEach((option, index) => {
          answer.push(getFromLoadash(option, "displayOrder") - 1);
        });
        break
      default:
        break
    }
    setAnswers(answer);
    return answer;
  };
  return (
    <>
      <div className="homework__review__quiz__section">
        <div className="homework__review__quiz__title">
          <span className="review__icon">
            <QuizQuestionIcon />
          </span>
          <span className="homework__review__title__text">
            {/* Practice Questions ({`${pqQuestions && pqQuestions.length}`}) */}
          </span>
        </div>
        <div className="quiz__all__questions__main__container">
          {pqQuestions && pqQuestions.map((item, index) => (
            <div
              onClick={() => toggle(index, item)}
              style={{ background: clicked === index ? "#f3effa" : "#fffffd", cursor: "pointer", ...styles }}
              className="senior__container"
            >
              <div className="quiz__all__questions__section">
                <div className="pq__questions__container" style={{ marginBottom: '0', alignItems: 'flex-start' }}>
                  <span className="span__question">Question {index + 1}: </span>
                  <div className="quiz__all__questions__text">
                    <TekieCEParser
                      value={item.statement}
                      useNativeHtmlParser
                        truncateText
                        init={{ selector: `PQ-Arrange_${item.id}` }}
                        legacyParser={(statement) =>
                          truncate(statement, {
                            length: 125,
                            omission: "...",
                            separator: "",
                          })
                        }
                    />
                  </div>
                  <div className="quiz__all__questions__tag__container">
                    <div
                      style={colorFinder(item)}
                      className="quiz__all__questions__tag_c"
                    >
                      {percentageFinder(item)===0?'Unattempted':`Avg. Tries: ${percentageFinder(item)}`}
                      {/* Avg. Tries: {`${percentageFinder(item)}`} */}
                    </div>
                    <div className="quiz__all__icon">
                     <span style={{
                       transform: clicked === index ? "rotate(180deg)" : "",
                     }}><DropdownIcon /></span> 
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  width: "100%",
                  alignItems: "flex-start",
                  display: "flex",
                  justifyContent: "start",
                  position: "relative",
                  background: "#FFFFFF",
                  padding: clicked === index ? "20px 0px" : "0px",
                }}
              >
                <div style={{ marginLeft: "90px" }}>
                  {clicked === index &&
                    get(item, "questionType", "") === "arrange" && (
                      <Arrange
                        key={get(item, "id")}
                        answerType="RS"
                        question={item}
                        withUpdatedDesign
                        answers={[answers]}
                        isSubmittedForReview={true}
                        fromChatbot
                        activeQuestionIndex={0}
                        fromHomework={true}
                      />
                    )}
                  {clicked === index &&
                    get(item, "questionType", "") === "mcq" && (
                      <Mcq
                        key={get(item, "id")}
                        answerType="RS"
                        question={item}
                        withUpdatedDesign
                        answers={[answers]}
                        isSubmittedForReview={true}
                        fromChatbot
                        fromHomework={true}
                        activeQuestionIndex={0}
                      />
                    )}
                  {clicked === index &&
                    get(item, "questionType", "") === "fibInput" && (
                      <FibInput
                        key={get(item, "id")}
                        answerType="RS"
                        question={item}
                        withUpdatedDesign
                        answers={[answers]}
                        isSubmittedForReview={true}
                        fromChatbot
                        activeQuestionIndex={0}
                        fromHomework={true}
                      />
                    )}
                  {clicked === index &&
                    get(item, "questionType", "") === "fibBlock" && (
                      <FibBlock
                        key={get(item, "id")}
                        answerType="RS"
                        question={item}
                        withUpdatedDesign
                        answers={[answers]}
                        isSubmittedForReview={true}
                        fromChatbot
                        activeQuestionIndex={0}
                        fromHomework={true}
                      />
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default PqReportQuestionSection;
