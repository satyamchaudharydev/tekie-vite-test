import React, { useState } from "react";
import "./HomeworkReviewCodingQuestion.scss";
import "./HomeworkReviewQuizSection.scss";
import "./HomeworkReviewBlocklyQuestion.scss";
import { get, truncate } from "lodash";
import { QuizQuestionIcon, DropdownIcon } from "../../HomeworkReviewImages/HomeworkReviewConstants";
import TekieCEParser from "../../../../../../../components/Preview/Preview";
import parseMetaTags from "../../../../../../../utils/parseMetaTags";
import IframeContent from "../../../../../../../components/IframeContent/IframeContent";
import AnswerTabs from "../../../../../components/ReportQuestionStudentTabs/AnswerTabs";
import YourEvaluation from "./YourEvaluation";
import PracticeSubmission from "../../../../../../UpdatedSessions/Practice/component/PracticeSubmission";
import studentSubmissionCross from '../../HomeworkReviewImages/studentSubmissionCross.svg'
import "./questionContainer.scss";

function HomeworkReviewBlocklyQuestion({
  newBlocklyBasedQuestion,
  newHomeworkData,
  fromStudentReport = false,
  styles = {},
  userBlockBasedData = [],
  fromQuestionLevelReport,
  ...props
}) {
  const [clicked, setClicked] = useState();
  const withHttps = (url) =>
    url
      ? url.replace(/^(?:(.*:)?\/\/)?(.*)/i, (match, schemma, nonSchemmaUrl) => (schemma ? match : `https://${nonSchemmaUrl}`))
      : "";

  const newBlocklyArray = get(newHomeworkData, "blockBasedPractice.questions", []);

  const [selectedQuestionAnswer, setSelectedQuestionAnswer] = useState({});
  const [selectedAnswerType, setSelectedAnswerType] = useState("student");

  function toggle(index, item) {
    if (clicked === index) {
      setSelectedAnswerType("student");
      setSelectedQuestionAnswer({});
      return setClicked(null);
    }
    setClicked(index);
    setSelectedAnswerType("student");
    let blocklyItem = { ...item };
    if (fromStudentReport) {
      blocklyItem = {
        ...item,
        externalPlatformLink: "",
      };
      const findUserResponse = userBlockBasedData.find((blockData) => get(blockData, "blockBasedProject.id") === get(item, "id"));
      if (
        get(findUserResponse, "answerLink") ||
        get(findUserResponse, "savedBlocks") ||
        get(findUserResponse, "attachments", []).length
      ) {
        blocklyItem = {
          ...item,
          externalPlatformLink: get(findUserResponse, "answerLink"),
        };
      }
    }
    setSelectedQuestionAnswer(blocklyItem);
  }

  const percentageFinder = (item) => {
    const checkerArray = newBlocklyArray.find((question) => question.questionId === get(item, "id", ""));

    if (fromStudentReport) {
      return "";
    }

    if (newBlocklyArray.length > 0 && checkerArray) {
      return checkerArray.percentageCorrect;
    } else {
      return 0;
    }
  };

  const colorFinder = (item) => {
    const arrayItem = newBlocklyArray.find((question) => question.questionId === get(item, "id", ""));
    if (fromStudentReport) {
      const findUserResponse = userBlockBasedData.find((blockData) => get(blockData, "blockBasedProject.id") === get(item, "id"));
      if (
        get(findUserResponse, "answerLink") ||
        get(findUserResponse, "savedBlocks") ||
        get(findUserResponse, "attachments", []).length
      ) {
        return { background: "#01aa93" };
      } else {
        return { background: "#ff5744" };
      }
    }
    if (newBlocklyArray.length > 0 && arrayItem) {
      if (arrayItem.percentageCorrect >= 0 && arrayItem.percentageCorrect < 50) {
        return { background: "#ff5744" };
      }
      if (arrayItem.percentageCorrect >= 50 && arrayItem.percentageCorrect <= 70) {
        return { background: "#faad14" };
      }
      if (arrayItem.percentageCorrect >= 70 && arrayItem.percentageCorrect <= 100) {
        return { background: "#01aa93" };
      }
    }

    return { display: "none" };
  };

  const onAnswerSwitch = (e, tabName, index, item) => {
    let blocklyItem = {
      ...item,
      externalPlatformLink: "",
    };
    if (tabName === "student") {
      const findUserResponse = userBlockBasedData.find((blockData) => get(blockData, "blockBasedProject.id") === get(item, "id"));
      if (
        get(findUserResponse, "answerLink") ||
        get(findUserResponse, "savedBlocks") ||
        get(findUserResponse, "attachments", []).length
      ) {
        blocklyItem = {
          ...item,
          externalPlatformLink: get(findUserResponse, "answerLink"),
        };
      }
    } else {
      blocklyItem = {
        ...item,
        externalPlatformLink: get(item, "externalPlatformLink"),
      };
    }
    setSelectedAnswerType(tabName);
    setSelectedQuestionAnswer(blocklyItem);
    e.stopPropagation();
  };

  const renderBlocklyData = (item, index) => {
    let submitted = false;
    if (fromStudentReport) {
      const findUserResponse = userBlockBasedData.find((blockData) => get(blockData, "blockBasedProject.id") === get(item, "id"));
      if (
        get(findUserResponse, "answerLink") ||
        get(findUserResponse, "savedBlocks") ||
        get(findUserResponse, "attachments", []).length
      ) {
        submitted = true;
      }
    }
    const answerFormat = get(item, "answerFormat");
    const answerFormatDescription = get(item, "answerFormatDescription");
    const projectCreationDescription = get(item, "projectCreationDescription");
    const externalDescriptionEnabled = get(item, "externalDescriptionEnabled");
    const blockBasedPracticeId = get(item, "id");
    const renderPracticeComponent = () => {
      if (answerFormat === "answerContent" && answerFormatDescription) {
        return (
          <TekieCEParser
            value={answerFormatDescription}
            init={{ selector: `DRV-Question_${answerFormatDescription}` }}
            legacyParser={(statement) => {
              return parseMetaTags({ statement, removeCodeTag: true });
            }}
          />
        );
      } else if (answerFormat === "answerGoogleEmbedLink" && answerFormatDescription) {
        return <IframeContent projectDescription={answerFormatDescription} forAnswerLink />;
      } else {
        if (externalDescriptionEnabled) {
          return <IframeContent projectDescription={projectCreationDescription} forAnswerLink />;
        } else {
          return (
            <TekieCEParser
              value={projectCreationDescription}
              init={{ selector: `DRV-Question_${blockBasedPracticeId}` }}
              legacyParser={(statement) => {
                return parseMetaTags({ statement, removeCodeTag: true });
              }}
            />
          );
        }
      }
    };

    let currentPracticeObj = null;
    if (userBlockBasedData && userBlockBasedData.length) {
      userBlockBasedData.forEach((practiceObj) => {
        if (get(practiceObj, "blockBasedProject.id") === blockBasedPracticeId) {
          currentPracticeObj = practiceObj;
        }
      });
    }

    const renderEvaluationBox = () => {
      const filteredAssignmentData = userBlockBasedData.filter(
        (item) => get(item, "blockBasedProject.id") === blockBasedPracticeId
      );
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
          currentPracticeQuestion={item.id}
        />
      )
    };

    return (
      <>
        <div
          style={{ ...styles }}
          className={`senior__container homeworkReviewBlocklyQuestionContainer ${(fromStudentReport || fromQuestionLevelReport) &&
            "homeworkReviewBlocklyContainer"}`}
        >
          <div
            onClick={() => toggle(index, item)}
            style={{ cursor: "pointer" }}
            className={`quiz__all__questions__section ${(fromStudentReport || fromQuestionLevelReport) &&
              "studentReportCodingQuestion"} `}
          >
            <div className="quiz__one__container1">
              <div style={{ marginRight: '10px' }}>
                <span className="blockly__span__tag">{index + 1}: </span>
                <div className="quiz__all__questions__text">
                  <TekieCEParser
                    value={item.title}
                    useNativeHtmlParser
                    truncateText={125}
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
                  <div
                    style={colorFinder(item)}
                    className={fromStudentReport ? "quiz__all__questions__tag_report" : "quiz__all__questions__tag_b"}
                  >
                    {fromStudentReport ? `${submitted ? "Attempted" : "Not Attempted"}` : `${percentageFinder(item)}% Submitted`}
                  </div>
                </div>
                <div className="quiz__all__icon">
                  <span
                    style={{
                      transform: clicked === index ? "rotate(-180deg)" : "",
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <DropdownIcon />
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              width: "100%",
              display: "flex",
              background: "#FFFFFF",
              flexDirection: fromStudentReport ? "column" : "row",
              overflow: "hidden",
            }}
            className={`HomeworkReviewBlocklyQuestion ${clicked === index && "HomeworkReviewBlocklyQuestion__opened"}`}
          >
            {fromQuestionLevelReport ? (
              <div className="questionComponentcontainer questionComponentcontainerCorrect" style={{ margin: "16px 0" }}>
                <div className="questionComponentcontainerBox" style={{ width: "90%", height: "300px", overflow: "auto" }}>
                  {renderPracticeComponent()}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", height: "400px", width: '100%' }}>
                {fromStudentReport && (
                  <AnswerTabs
                    onTabClick={(e, tabName) => onAnswerSwitch(e, tabName, index, item)}
                    activeTab={selectedAnswerType}
                  />
                )}
                <div className="homework-practice-details-container">
                  <div
                    className={`questionComponentcontainer ${selectedAnswerType === "student" ? "questionComponentcontainerStudent" : "questionComponentcontainerCorrect"}`}
                    style={{ borderColor: selectedAnswerType === "student" ? "#8C61CB" : null }}
                  >
                    <div
                      className="questionComponentcontainerBox"
                      style={{ height: "100%", width: "85%", padding: "0", overflow: "auto" }}
                    >
                      {currentPracticeObj ? (
                        <div className="practice-details-embed-container" style={{ height: '100%' }}>
                          {selectedAnswerType === "student" ? (
                            submitted ? (
                              <PracticeSubmission
                                withHttps={withHttps}
                                layout={get(currentPracticeObj, "blockBasedProject.layout")}
                                projectLink={get(currentPracticeObj, "answerLink")}
                                userBlockBasedPractices={[currentPracticeObj]}
                                id={get(currentPracticeObj, "id")}
                                isGsuiteFileVisited={get(currentPracticeObj, "isGsuiteFileVisited", false)}
                                fromEvaluation
                                fromStudentReport
                              ></PracticeSubmission>
                            ) : (
                              <div className="notSubmittedStateContainer">
                                <img src={studentSubmissionCross} alt="star" />
                                <div className="submissionNotFound">
                                  No Student Submission Found
                                </div>
                              </div>
                            )
                          ) : (
                            <div style={{ height: "100%", width: "100%" }}>{renderPracticeComponent()}</div>
                          )}
                        </div>
                      ) : (
                        renderPracticeComponent()
                      )}
                    </div>
                  </div>
                  {submitted ? renderEvaluationBox() : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };
  if (fromStudentReport || fromQuestionLevelReport) {
    return newBlocklyBasedQuestion.map((item, index) => renderBlocklyData(item, index));
  }

  return (
    <>
      <div className="homework__review__quiz__section">
        <div className="homework__review__quiz__title">
          <span className="review__icon">
            <QuizQuestionIcon />
          </span>
          <span className="homework__review__title__text">Assignment</span>
        </div>
        <div className="quiz__all__questions__main__container">
          {newBlocklyBasedQuestion.map((item, index) => renderBlocklyData(item, index))}
        </div>
      </div>
    </>
  );
}

export default HomeworkReviewBlocklyQuestion;
