import React, { useState } from "react";
import "./HomeworkReviewQuizSection.scss";
import "./HomeworkReviewCodingQuestion.scss";
import "./HomeworkReviewBlocklyQuestion.scss";
import myStyles from "./HomeworkReviewCodingQuestion.module.scss";
import { get } from "lodash";
import { CodingIcon } from "../../HomeworkReviewImages/HomeworkReviewConstants";
import { DropdownIcon } from "../../HomeworkReviewImages/HomeworkReviewConstants";
import TekieCEParser from "../../../../../../../components/Preview/Preview";
import { truncate } from "lodash";
import hs from "../../../../../../../utils/scale";
import SyntaxHighlighter from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import Editor from "../../../../../../Editor/EditorPage";
import AnswerTabs from "../../../../../components/ReportQuestionStudentTabs/AnswerTabs";
import ProgressBarHorizontal from "../../../../DetailedReport/ProgressBarHorizontal";
import parseMetaTags from "../../../../../../../utils/parseMetaTags";
import "./questionContainer.scss";
import YourEvaluation from "./YourEvaluation";
import studentSubmissionCross from '../../HomeworkReviewImages/studentSubmissionCross.svg'
import { decodeBase64, isBase64 } from "../../../../../../../utils/base64Utility";

const blocklyWorkspaceConfiguration = {
  // hide toolbox
  readOnly: true,
  // disable zoom
  zoom: {
    controls: false,
    wheel: false,
    startScale: 1,
    maxScale: 1,
    minScale: 1,
    scaleSpeed: 1,
  },
  // hide trashcan
  trashcan: false,
  // show grid
  grid: {
    spacing: 30,
    length: 3,
  },
};

const GREEN = "#01AA93";
const YELLOW = "#FAAD14";
const RED = "#FF5744";
function HomeworkReviewCodingQuestion({ newCodingQuestionsData, newHomeworkData, styles = {}, fromPqReport, ...props }) {
  const [clicked, setClicked] = useState();
  const [selectedQuestionAnswer, setSelectedQuestionAnswer] = useState("");
  const withUpdatedDesign = false;
  const [selectedAnswerType, setSelectedAnswerType] = useState("student");
  const terminalStyles = {
    minHeight: hs("59"),
    objectFit: "contain",
    borderRadius: hs("3"),
    backgroundColor: "#013d4e",
    fontFamily: "Nunito",
  };

  function toggle(index, item) {
    if (clicked === index) {
      setSelectedAnswerType("student");
      setSelectedQuestionAnswer("");
      return setClicked(null);
    }
    setClicked(index);
    setSelectedAnswerType("student");
    let answerCodeSnippet = "";
    if (get(props, "fromStudentReport")) {
      const findInUserAssignment = get(props, "userAssignmentsData", []).find(
        (assignment) => get(assignment, "assignmentQuestion.id") === get(item, "id")
      );
      if (get(findInUserAssignment, "userAnswerCodeSnippet") && get(findInUserAssignment, "userAnswerCodeSnippet") !== "null") {
        answerCodeSnippet = get(findInUserAssignment, "userAnswerCodeSnippet");
      }
    } else {
      answerCodeSnippet = get(item, "answerCodeSnippet", "");
    }
    setSelectedQuestionAnswer(answerCodeSnippet);
  }

  const newCodingArray = get(newHomeworkData, "coding.questions", []);
  const getCorrectPercentage = (quesId, reportQuestions) => {
    if (reportQuestions && reportQuestions.length) {
      const quesReport = reportQuestions.find((ques) => get(ques, "questionId") === quesId);
      if (quesReport) return get(quesReport, "percentageCorrect");
      return "Unattempted";
    }
    return 0;
  };
  const percentageFinder = (item) => {
    const checkerArray = newCodingArray.find((question) => question.questionId === get(item, "id", ""));

    if (get(props, "fromStudentReport")) {
      return "";
    }
    if (get(props, "fromQuestionLevelReport")) {
      if (newCodingArray.length > 0 && checkerArray) {
        return 100 - checkerArray.percentageCorrect;
      }
      return "Unattempted";
    }

    if (newCodingArray.length > 0 && checkerArray) {
      return checkerArray.percentageCorrect;
    } else {
      return 0;
    }
  };
  const colorFinder = (item) => {
    const arrayItem = newCodingArray.find((question) => question.questionId === get(item, "id", ""));
    if (get(props, "fromStudentReport")) {
      const findInUserAssignment = get(props, "userAssignmentsData", []).find(
        (assignment) => get(assignment, "assignmentQuestion.id") === get(item, "id")
      );
      if (get(findInUserAssignment, "userAnswerCodeSnippet") && get(findInUserAssignment, "userAnswerCodeSnippet") !== "null") {
        return { background: GREEN };
      } else {
        return { background: RED };
      }
    }
    if (!arrayItem) {
      return { background: RED };
    }
    if (newCodingArray.length >= 0 && arrayItem) {
      if (arrayItem.percentageCorrect >= 0 && arrayItem.percentageCorrect < 50) {
        return { background: RED };
      }
      if (arrayItem.percentageCorrect >= 50 && arrayItem.percentageCorrect <= 70) {
        return { background: YELLOW };
      }
      if (arrayItem.percentageCorrect >= 70 && arrayItem.percentageCorrect <= 100) {
        return { background: GREEN };
      }
    }

    if (get(props, "fromQuestionLevelReport")) return { background: YELLOW };
    return { display: "none" };
  };
  const shouldShowStatistics = (index) => {
    return clicked === index ? true : false;
  };
  const onAnswerSwitch = (e, tabName, index, item) => {
    let answerCodeSnippet = "";
    if (get(props, "fromStudentReport") && tabName === "student") {
      const findInUserAssignment = get(props, "userAssignmentsData", []).find(
        (assignment) => get(assignment, "assignmentQuestion.id") === get(item, "id")
      );
      if (get(findInUserAssignment, "userAnswerCodeSnippet") && get(findInUserAssignment, "userAnswerCodeSnippet") !== "null") {
        answerCodeSnippet = get(findInUserAssignment, "userAnswerCodeSnippet");
      }
    } else {
      answerCodeSnippet = get(item, "answerCodeSnippet", "");
    }
    setSelectedAnswerType(tabName);
    setSelectedQuestionAnswer(answerCodeSnippet);
    e.stopPropagation();
  };
  const renderQuestions = (index, item) => {
    let answerCodeSnippet = get(item, "answerCodeSnippet", "");
    let submitted = false;
    if (get(props, "fromStudentReport")) {
      const findInUserAssignment = get(props, "userAssignmentsData", []).find(
        (assignment) => get(assignment, "assignmentQuestion.id") === get(item, "id")
      );
      if (get(findInUserAssignment, "userAnswerCodeSnippet") && get(findInUserAssignment, "userAnswerCodeSnippet") !== "null") {
        answerCodeSnippet = get(findInUserAssignment, "userAnswerCodeSnippet");
        submitted = true;
      }
    }

    const getBadgeText = (numOrStr) => {
      if (numOrStr === "Unattempted" || numOrStr === 0) return "Unattempted";
      return `Attempted: ${Math.round(numOrStr)}%`;
      // return `Incorrect: ${100-numOrStr}%`
    };

    const renderEvaluationBox = (quesId) => {
      const userAssignmentsData = get(props, "userAssignmentsData");
      const filteredAssignmentData =
        userAssignmentsData &&
        userAssignmentsData.length &&
        userAssignmentsData.filter((item) => get(item, "assignmentQuestion.id") === quesId);
      const evaluationData = get(filteredAssignmentData, "[0].evaluation");
      return (
        <YourEvaluation
          star={get(evaluationData, "star")}
          tags={get(evaluationData, "tags")}
          comment={get(evaluationData, "comment")}
          topicId={get(props, 'topicId')}
          topicTitle={get(props, 'topicTitle')}
          topicComponentRule={get(props, 'topicComponentRule')}
          courseId={get(props, 'courseId')}
          attendence={get(props, 'attendence')}
          evaluationData={get(props, 'evaluationData')}
          evaluationDataFetchStatus={get(props, 'evaluationDataFetchStatus')}
          selectedStudent={get(props, 'selectedStudent')}
          evaluationType={get(props, 'evaluationType')}
        />
      )
    };

    const renderEditor = () => (
      <Editor
        editorMode={get(item, "editorMode", "")}
        hideEditorHeader
        type="assignment"
        outputTitleBg="skyBlue"
        codeString={decodeURIComponent(selectedQuestionAnswer)}
        workspaceConfiguration={blocklyWorkspaceConfiguration}
        initialBlocks={isBase64(selectedQuestionAnswer) ? decodeBase64(selectedQuestionAnswer) : selectedQuestionAnswer}
        onOutputClick={() => {}}
        key={get(item, "id", "")}
        editorKey={get(item, "id", "")}
        lineHeight={`30`}
        fromReportPage
        index={index}
        arrowStyle={{
          top: 15,
          marginRight: 10,
        }}
        interpretorStyle={{
          marginLeft: 16,
        }}
        answerCodeSnippet={selectedQuestionAnswer}
        onChange={() => {}}
        newFlow={true}
        hideEditorHeaderActions
        showOutputByDefault
        readOnly
      />
    )

    return (
      <>
        <div
          style={{ width: fromPqReport && "98%", ...styles }}
          className={`senior__container homeworkReportCodingQuestionContainer ${(get(props, "fromStudentReport") ||
            get(props, "fromQuestionLevelReport")) &&
            "codingAssignmentReportContainer"}`}
        >
          <div
            onClick={() => toggle(index, item, answerCodeSnippet)}
            style={{ cursor: "pointer" }}
            // className={`quiz__all__questions__section__coding ${(get(props, 'fromStudentReport') || get(props, 'fromQuestionLevelReport')) && "studentReportCodingQuestion"}`}
            className="quiz__all__questions__section"
          >
            <div className="quiz__one__container1">
              <div style={{ color: "#000", marginRight: '10px' }}>
                <span>{index + 1}: </span>
                <div className="quiz__all__questions__text">
                  <TekieCEParser
                    value={item.statement}
                    useNativeHtmlParser
                    truncateText={
                      get(props, "fromStudentReport") || get(props, "fromQuestionLevelReport") ? !(clicked === index) : 125
                    }
                    init={{ selector: `PQ-Arrange_${item.id}` }}
                    legacyParser={(statement) =>
                      clicked === index
                        ? parseMetaTags({ statement, removeCodeTag: true })
                        : parseMetaTags({
                            statement: truncate(statement, {
                              length: 125,
                              omission: "...",
                              separator: "",
                            }),
                            removeCodeTag: true,
                          })
                    }
                  />
                </div>
              </div>
              <div>
                <div className="quiz__all__questions__tag__container">
                  {get(props, "fromQuestionLevelReport") ? (
                    <div
                      style={{
                        backgroundColor:
                          getBadgeText(getCorrectPercentage(get(item, "id"), get(newHomeworkData, "coding.questions"))) ===
                          "Unattempted"
                            ? YELLOW
                            : GREEN,
                      }}
                      className={
                        get(props, "fromStudentReport") ? "quiz__all__questions__tag_report" : "quiz__all__questions__tag_b"
                      }
                    >
                      {get(props, "fromStudentReport")
                        ? `${submitted ? "Attempted" : "Not Attempted"}`
                        : `${getBadgeText(getCorrectPercentage(get(item, "id"), get(newHomeworkData, "coding.questions")))}`}
                    </div>
                  ) : (
                    <div
                      style={colorFinder(item)}
                      className={
                        get(props, "fromStudentReport") ? "quiz__all__questions__tag_report" : "quiz__all__questions__tag_b"
                      }
                    >
                      {get(props, "fromStudentReport")
                        ? `${submitted ? "Attempted" : "Not Attempted"}`
                        : `${getBadgeText(percentageFinder(item))}`}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    transform: clicked === index ? "rotate(-180deg)" : "",
                    transition: "all 0.25s ease-in-out",
                  }}
                  className="quiz__all__icon"
                >
                  <DropdownIcon />
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              width: "100%",
              justifyContent: "start",
              alignItems: "flex-start",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              background: "#FFFFFF",
              gap: "24px",
              boxSizing: "border-box",
              fontFamily: "Inter",
              overflow: "auto",
            }}
            className={`codeEditor__homework__review__collapsed ${clicked === index && "codeEditor__homework__review__opened"}`}
          >
            {get(props, "fromStudentReport") && (
              <AnswerTabs onTabClick={(e, tabName) => onAnswerSwitch(e, tabName, index, item)} activeTab={selectedAnswerType} />
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                padding: !get(props, "fromStudentReport") ? "16px 0" : null,
              }}
            >
              <div
                className={`questionComponentcontainer ${(get(props, "fromQuestionLevelReport") || selectedAnswerType === "correct") ? "questionComponentcontainerCorrect" : "questionComponentcontainerStudent"}`}
              >
                <div className="questionComponentcontainerBox" style={{ padding: "0" }}>
                  <div
                    className={`codeEditor__homework__review limit__width`}
                    style={get(props, "fromQuestionLevelReport") ? { width: hs(1300), margin: "0" } : { margin: "0" }}
                  >
                    {
                      <div className="studentReportCodingQuestionWrapper">
                        {item.questionCodeSnippet && (
                          <div>
                            <SyntaxHighlighter
                              language={item.editorMode === null ? "text" : "python"}
                              codeTagProps={{
                                style: {
                                  fontFamily: `${withUpdatedDesign && "Monaco"}`,
                                },
                              }}
                              customStyle={
                                withUpdatedDesign
                                  ? {
                                      ...terminalStyles,
                                      backgroundColor: "#005773",
                                      borderRadius: hs("5"),
                                      padding: 12,
                                    }
                                  : terminalStyles
                              }
                              style={darcula}
                            >
                              {decodeURIComponent(item.questionCodeSnippet)}
                            </SyntaxHighlighter>
                          </div>
                        )}
                        <>
                          {selectedAnswerType === "student" ? (
                            (submitted || get(props, "fromQuestionLevelReport")) ? (
                              <div style={get(item, "editorMode", "") === 'markup' || 'java' ? { height: "400px", border: '5px solid #000', borderRadius: '5px' } : {}}>
                              <>{renderEditor()}</>
                              </div>
                            ) : (
                              <div className="notSubmittedStateContainer" style={{ height: '400px' }}>
                                <img src={studentSubmissionCross} alt="star" />
                                <div className="submissionNotFound">
                                  No Student Submission Found
                                </div>
                              </div>
                            )
                          ) : (
                            <div style={get(item, "editorMode", "") === 'markup' || 'java' ? { height: "400px", border: '5px solid #000', borderRadius: '5px' } : {}}>
                              <>{renderEditor()}</>
                            </div>
                          )}
                        </>
                      </div>
                    }
                  </div>
                </div>
              </div>
              {get(props, "fromStudentReport") && submitted ? renderEvaluationBox(get(item, "id")) : null}
            </div>
          </div>
        </div>
      </>
    );
  };

  if (get(props, "fromStudentReport") || get(props, "fromQuestionLevelReport")) {
    return newCodingQuestionsData.map((item, index) => {
      return renderQuestions(index, item);
    });
  }

  return (
    <>
      <div className="homework__review__quiz__section">
        <div className="homework__review__quiz__title">
          <span className={myStyles.review__icon}>
            <CodingIcon />
          </span>
          <span className="homework__review__title__text">Assignment ({`${newCodingQuestionsData.length}`})</span>
        </div>
        <div className={myStyles.detailed__report__container__number}>
          <div className={myStyles.detailed__report__number}>{get(newHomeworkData, "coding.averageScore")}%</div>
          <div className={myStyles.detailed__report__text}>Avg. Score</div>
        </div>
        <div className="quiz__all__questions__main__container">
          {newCodingQuestionsData.map((item, index) => {
            return renderQuestions(index, item);
          })}
        </div>
      </div>
    </>
  );
}

export default HomeworkReviewCodingQuestion;
