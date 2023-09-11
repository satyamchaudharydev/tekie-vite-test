import React, { useState } from "react";
import "./HomeworkReviewQuizSection.scss";
import { get } from "lodash";
import { DropdownIcon } from "../../HomeworkReviewImages/HomeworkReviewConstants";
import Arrange from "../../../../../../../components/QuestionTypes/Arrange";
import Mcq from "../../../../../../../components/QuestionTypes/Mcq";
import FibBlock from "../../../../../../../components/QuestionTypes/FibBlock";
import FibInput from "../../../../../../../components/QuestionTypes/FibInput";
import TekieCEParser from "../../../../../../../components/Preview/Preview";
import parseMetaTags from "../../../../../../../utils/parseMetaTags";
import { get as getFromLoadash, sortBy } from "lodash";
import { customStyles } from "../../../../../components/Dropdowns/Dropdown";
import { hsFor1280 } from "../../../../../../../utils/scale";
import getThemeColor from "../../../../../../../utils/teacherApp/getThemeColor";
import { QuizUpdatedIcon } from "../../../../../components/svg";
import "./questionContainer.scss";
import ProgressBarVertical from "../../../../Classroom/ClassroomDetails/ProgressBarVertical";
export const studentDropdownStyles = {
  ...customStyles,
  option: (styles, { isFocused, isSelected }) => ({
    ...styles,
    cursor: "pointer",
    fontFamily: "Inter",
    fontSize: hsFor1280(14),
    backgroundColor: isSelected ? getThemeColor() : null,
    "&:hover": {
      backgroundColor: "#F3EFFA",
      color: getThemeColor(),
    },
  }),
  control: (styles) => ({
    ...styles,
    cursor: "pointer",
    fontFamily: "Inter",
    minHeight: hsFor1280(30),
    maxHeight: hsFor1280(30),
    border: "1px solid #EEEEEE",
    boxShadow: "0 0 0 0px black",
    borderRadius: hsFor1280(10),
    "&:hover": {
      border: "1px solid #EEEEEE",
      boxShadow: "0 0 0 0px black",
    },
  }),
  placeholder: (styles) => ({
    ...styles,
    fontSize: hsFor1280(16),
    top: "50%",
    color: "#282828",
    fontWeight: "500",
  }),
  singleValue: (styles) => ({
    ...styles,
    fontSize: hsFor1280(14),
    fontWeight: "500",
    top: "50%",
  }),
  valueContainer: (styles) => ({
    ...styles,
    padding: `0 0 0 ${hsFor1280(10)}`,
  }),
  input: (styles) => ({
    ...styles,
    color: "transparent",
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: hsFor1280(140),
    "::-webkit-scrollbar": {
      width: "4px",
    },
    "::-webkit-scrollbar-thumb": {
      background: "#8C61CB",
    },
    "::-webkit-scrollbar-thumb:hover": {
      background: "#8C61CB",
    },
  }),
  container: (style) => ({
    ...style,
    width: hsFor1280(200),
  }),
  dropdownIndicator: (style) => ({
    ...style,
    padding: hsFor1280(4),
    color: "#757575",
    paddingRight: hsFor1280(12),
  }),
};
export const loFilterDropdownStyles = {
  ...studentDropdownStyles,
  control: (styles) => ({
    ...styles,
    cursor: "pointer",
    fontFamily: "Inter",
    minHeight: hsFor1280(36),
    maxHeight: hsFor1280(36),
    border: "1px solid #AAAAAA",
    boxShadow: "0 0 0 0px black",
    borderRadius: hsFor1280(8),
    "&:hover": {
      border: "1px solid #AAAAAA",
      boxShadow: "0 0 0 0px black",
    },
  }),
};
const GREEN = "#01AA93";
const YELLOW = "#FAAD14";
const RED = "#FF5744";

function HomeworkReviewQuizSection({
  individualQuestionDetails,
  newQuestionsData,
  newPercentage,
  isQuizQuestion,
  isPracticeQuestion,
  fromQuestionLevelReport,
  tcRule,
  route,
  styles = {},
  dropDownSelectedLo,
  setDropdownSelectedLo,
  fromPqReport,
}) {
  const [clicked, setClicked] = useState(false);
  const [answers, setAnswers] = useState([]);
  // const [dropDownSelectedLo,setDropdownSelectedLo]=useState('all')
  const [newQuestionsDataLocalCopy, setNewQuestionsDataLocalCopy] = useState([...newQuestionsData]);
  const newPercentageArray = get(newPercentage, "questions", []);
  const ARRANGE = "arrange";
  const FIBBLOCK = "fibBlock";
  const FIBINPUT = "fibInput";
  const MCQ = "mcq";


  const percentageFinder = (item) => {
    const checkerArray = newPercentageArray.find((question) => question.questionId === get(item, "id", ""));

    if (newPercentageArray.length > 0 && checkerArray) {
      return checkerArray.percentageCorrect;
    } else {
      return 0;
    }
  };

  const colorFinder = (item) => {
    const arrayItem = newPercentageArray.find((question) => question.questionId === get(item, "id", ""));

    if (newPercentageArray.length > 0 && arrayItem) {
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
        break;
      case ARRANGE:
        //  let modoptions = sortBy(options, 'correctPositions[0]')
        //  console.log(modoptions,"modjjan")
        //   modoptions.forEach((option, index) => (option.index = index));
        const sortedOptions = sortBy(options, "correctPositions[0]");
        sortedOptions.forEach((option, index) => {
          answer.push(getFromLoadash(option, "displayOrder") - 1);
        });
        break;
      default:
        break;
    }
    setAnswers(answer);
    return answer;
  };

  const shouldShowStatistics = (index) => {
    return answers.length && clicked === index ? true : false;
  };

  const getIncorrectPercentage = (questionId, questions = []) => {
    if (questionId && questions.length) {
      const data = questions.find((question) => get(question, "questionId") === questionId);
      if (data) return data.percentageIncorrect;
    }
  };
  const getUnattemptedPercentage = (questionId, questions = []) => {
    if (questionId && questions.length) {
      const data = questions.find((question) => get(question, "questionId") === questionId);
      if (data) return data.percentageUnattempted;
    }
  };
  const getCorrectPercentage = (questionId, questions = []) => {
    if (questionId && questions.length) {
      const data = questions.find((question) => get(question, "questionId") === questionId);
      if (data) return data.percentageCorrect;
    }
  };

  const getQuizBadgeColor = (homeworkReport, quesId) => {
    if (quesId) {
      const data = get(homeworkReport, "questions").find((question) => get(question, "questionId") === quesId);
    }
  };

  const getAvgTries = (practiceReport, quesId) => {
    if (quesId) {
      const data = get(practiceReport, "pqIndividualQuestionReport", []).find(
        (question) => get(question, "questionId") === quesId
      );
      if (data) return Math.round(get(data, "avgTries"));
    }
  };
  const getAvgTriesBadgeColor = (count) => {
    if (!count) return { backgroundColor: YELLOW, color: "#fff" };
    if (count >= 1 && count < 2) return { backgroundColor: GREEN, color: "#fff" };
    if (count >= 2 && count < 3) return { backgroundColor: YELLOW, color: "#fff" };
    return { backgroundColor: RED, color: "#fff" };
  };
  // const loList = get(individualQuestionDetails, 'quiz.learningObjectiveReport', []).map(lo => ({
  //   label: `${get(lo, 'learningObjective.title')}`,
  //   value: get(lo, 'learningObjective.id')
  // }))
  let loList = [];
  if (tcRule && tcRule.length) {
    loList = tcRule
      .filter((rule) => get(rule, "componentName") === "learningObjective")
      .map((rule) => ({ label: get(rule, "learningObjective.title"), value: get(rule, "learningObjective.id") }));
  }
  const dropdownLoList = [{ label: "All", value: "all" }, ...loList];
  const selectedLo = dropdownLoList.find((lo) => get(lo, "value") === dropDownSelectedLo);

  const getLoPercentage = (loId) => {
    if (loId) {
      const data = get(individualQuestionDetails, "quiz.learningObjectiveReport", []).find(
        (loReport) => get(loReport, "questionId") === loId
      );
      return data ? get(data, "percentageCorrect") : 0;
    }
  };

  const getFilteredByLoQuizQuestions = (tcRule = []) => {
    if (isPracticeQuestion) {
      return newQuestionsData;
      //writing using else block just for clarity
    } else {
      if (dropDownSelectedLo === "all") {
        return newQuestionsDataLocalCopy.filter((question) => get(question, "assessmentType") === "quiz");
      }
      if (tcRule && tcRule.length) {
        const data = tcRule.filter(
          (rule) => get(rule, "componentName") === "learningObjective" && get(rule, "learningObjective.id") === dropDownSelectedLo
        );
        if (data)
          return get(data[0], "learningObjective.questionBank").filter((question) => get(question, "assessmentType") === "quiz");
      }
      return [];
    }
  };

  const getTryPercentage = ({ tryNos = "firstTryPercentage", pqReport = [], quesId }) => {
    if (pqReport && pqReport.length) {
      const report = pqReport.find((quesReport) => get(quesReport, "questionId") === quesId);
      if (report) return get(report, tryNos);
    }
    return 0;
  };
  const isQuestionPresentInHwReport = (quesId, hwReportQuestions = []) => {
    if (hwReportQuestions && hwReportQuestions.length) {
      return hwReportQuestions.find((ques) => get(ques, "questionId") === quesId);
    }
    return false;
  };
  const isQuestionPresentInPqReport = (quesId, pqReportQuestions = []) => {
    if (pqReportQuestions && pqReportQuestions.length) {
      return pqReportQuestions.find((ques) => get(ques, "questionId") === quesId);
    }
    return false;
  };

  const getQuizQuestionIncorrectPercentage = (quesId, hwReportQuestions) => {
    if (hwReportQuestions && hwReportQuestions.length) {
      const quesReport = hwReportQuestions.find((ques) => get(ques, "questionId") === quesId);
      if (quesReport) return Math.round(Number(get(quesReport, "percentageIncorrect", 0).toFixed(2)));
    }
  };
  return (
    <>
      <div className={`homework__review__quiz__section ${(isQuizQuestion || isPracticeQuestion) && "questionLevelReport"}`}>
        {isQuizQuestion && (
          <>
            {fromPqReport && (
              <div className="homework__review__quiz__title">
                <span className="review__icon">
                  <QuizUpdatedIcon color="#504f4f" />
                </span>
                <span className="homework__review__title__text">
                  {newQuestionsData.length > 1
                    ? `Quiz Questions (${newQuestionsData.length})`
                    : `Quiz Question (${newQuestionsData.length})`}
                </span>
              </div>
            )}
          </>
        )}
        <div className="quiz__all__questions__main__container">
          {newQuestionsData.map((item, index) => (
            <div
              key={get(item, "id")}
              style={{
                ...styles,
                width: fromPqReport ? "98%" : "inherit",
              }}
              className={`senior__container homeworkReviewQuizSectionContainer ${(isQuizQuestion || isPracticeQuestion) &&
                "quizSectionReportPage"}`}
            >
              <div className="quiz__all__questions__section" onClick={() => toggle(index, item)} style={{ cursor: "pointer" }}>
                <div className="quiz__one__container">
                  <div className={`quiz__one__container1 studentReportCodingQuestion`}>
                    <div style={{ marginRight: '10px' }}>
                      <span>{index + 1}: </span>
                      <div className="quiz__all__questions__text">
                        <TekieCEParser
                          value={item.statement}
                          useNativeHtmlParser
                          // truncateText={(isQuizQuestion||isPracticeQuestion) ? !(clicked === index) : true}
                          init={{ selector: `PQ-Arrange_${item.id}` }}
                          legacyParser={(statement) => parseMetaTags({ statement, removeCodeTag: true })}
                        />
                      </div>
                    </div>
                    {(isPracticeQuestion || fromPqReport) && (
                      <div className="quiz__all__questions__tag__container">
                        <>
                          {isPracticeQuestion &&
                          isQuestionPresentInPqReport(
                            get(item, "id"),
                            get(individualQuestionDetails, "pqIndividualQuestionReport", [])
                          ) ? (
                            <div
                              style={getAvgTriesBadgeColor(getAvgTries(individualQuestionDetails, get(item, "id")))}
                              className="quiz__all__questions__tag"
                            >
                              Avg. Tries: {`${getAvgTries(individualQuestionDetails, get(item, "id"))}`}
                            </div>
                          ) : isQuizQuestion &&
                            fromPqReport &&
                            isQuestionPresentInHwReport(get(item, "id"), get(individualQuestionDetails, "quiz.questions")) ? (
                            <div
                              style={
                                fromQuestionLevelReport
                                  ? { backgroundColor: "#FF5744", width: hsFor1280(109), color: "white", }
                                  : { backgroundColor: "#FF5744", color: "white", }
                              }
                              // style={getQuizBadgeColor(item)}
                              className="quiz__all__questions__tag"
                            >
                              Incorrect:{" "}
                              {`${getQuizQuestionIncorrectPercentage(
                                get(item, "id"),
                                get(individualQuestionDetails, "quiz.questions")
                              )}%`}
                            </div>
                          ) : (
                            <div style={{ color: "white", backgroundColor: "#FAAD14" }} className="quiz__all__questions__tag">
                              Unattempted
                            </div>
                          )}
                        </>

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
                    )}
                    {isQuizQuestion && !fromPqReport && (
                      <div className="quiz__all__questions__tag__container">
                        <>
                          {isQuizQuestion &&
                          isQuestionPresentInHwReport(get(item, "id"), get(individualQuestionDetails, "quiz.questions")) ? (
                            <div
                              style={
                                fromQuestionLevelReport
                                  ? { backgroundColor: GREEN, width: hsFor1280(103), color: "#fff" }
                                  : { backgroundColor: GREEN, color: "#fff" }
                              }
                              className="quiz__all__questions__tag"
                            >
                              Correct: {`${getCorrectPercentage(item.id, get(individualQuestionDetails, "quiz.questions"))}%`}
                            </div>
                          ) : (
                            <div style={{ color: "white", backgroundColor: "#FAAD14" }} className="quiz__all__questions__tag">
                              Unattempted
                            </div>
                          )}
                        </>

                        <div
                          style={{
                            transform: clicked === index ? "rotate(180deg)" : "",
                          }}
                          className="quiz__all__icon"
                        >
                          <DropdownIcon />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  position: "relative",
                  padding: clicked === index ? "20px 0px" : "0px",
                  background: "#FFFFFF",
                }}
                className={`homeworkQuiz__review__collapsed ${clicked === index && "homeworkQuiz__review__opened"}`}
              >
                <div className="questionComponentcontainer questionComponentcontainerCorrect">
                  <div className="questionComponentcontainerBox">
                    {get(item, "questionType", "") === "arrange" && (
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
                        fromReportsPage
                      />
                    )}

                    {get(item, "questionType", "") === "mcq" && (
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
                        fromReportsPage
                      />
                    )}
                    {get(item, "questionType", "") === "fibInput" && (
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
                        fromReportsPage
                      />
                    )}
                    {get(item, "questionType", "") === "fibBlock" && (
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
                        fromReportsPage
                      />
                    )}
                  </div>
                </div>

                {!fromPqReport && (
                  <div className={"chart_and_cta_container"}>
                    {isPracticeQuestion &&
                    get(individualQuestionDetails, "pqIndividualQuestionReport", []).length !== 0 &&
                    shouldShowStatistics(index) ? (
                      <div className="chart__container">
                        <ProgressBarVertical
                          done={getTryPercentage({
                            tryNos: "firstTryPercentage",
                            pqReport: get(individualQuestionDetails, "pqIndividualQuestionReport"),
                            quesId: get(item, "id"),
                          })}
                          doneText={getTryPercentage({
                            tryNos: "firstTryPercentage",
                            pqReport: get(individualQuestionDetails, "pqIndividualQuestionReport"),
                            quesId: get(item, "id"),
                          })}
                          text="1st Try"
                          tryNos="one"
                        />
                        <ProgressBarVertical
                          done={getTryPercentage({
                            tryNos: "secondTryPercentage",
                            pqReport: get(individualQuestionDetails, "pqIndividualQuestionReport"),
                            quesId: get(item, "id"),
                          })}
                          doneText={getTryPercentage({
                            tryNos: "secondTryPercentage",
                            pqReport: get(individualQuestionDetails, "pqIndividualQuestionReport"),
                            quesId: get(item, "id"),
                          })}
                          text="2nd Try"
                          tryNos="two"
                        />
                        <ProgressBarVertical
                          done={getTryPercentage({
                            tryNos: "thirdTryPercentage",
                            pqReport: get(individualQuestionDetails, "pqIndividualQuestionReport"),
                            quesId: get(item, "id"),
                          })}
                          doneText={getTryPercentage({
                            tryNos: "thirdTryPercentage",
                            pqReport: get(individualQuestionDetails, "pqIndividualQuestionReport"),
                            quesId: get(item, "id"),
                          })}
                          text="3rd Try"
                          tryNos="three"
                        />
                      </div>
                    ) : (
                      shouldShowStatistics(index) &&
                      isPracticeQuestion && <div className="chart__container" role={"button"}></div>
                    )}

                    {isQuizQuestion &&
                      get(individualQuestionDetails, "quiz.submissionsCount") !== 0 &&
                      shouldShowStatistics(index) && (
                        <div className="chart__container">
                          <ProgressBarVertical
                            done={getCorrectPercentage(item.id, get(individualQuestionDetails, "quiz.questions"))}
                            doneText={getCorrectPercentage(item.id, get(individualQuestionDetails, "quiz.questions"))}
                            text="Correct"
                            tryNos="correct"
                          />
                          <ProgressBarVertical
                            done={getIncorrectPercentage(item.id, get(individualQuestionDetails, "quiz.questions"))}
                            doneText={getIncorrectPercentage(item.id, get(individualQuestionDetails, "quiz.questions"))}
                            text="Incorrect"
                            tryNos="incorrect"
                          />
                          <ProgressBarVertical
                            done={getUnattemptedPercentage(item.id, get(individualQuestionDetails, "quiz.questions"))}
                            doneText={getUnattemptedPercentage(item.id, get(individualQuestionDetails, "quiz.questions"))}
                            text="Un-attempted"
                            tryNos="unAttempted"
                          />
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default HomeworkReviewQuizSection;
