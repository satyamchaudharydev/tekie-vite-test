import React, { useState } from "react";
import { get } from "lodash";
import { DropdownIcon, QuizQuestionIcon } from "../components/pqReportConstants";
import "./PqReportQuestionStudent.scss";
import "../../HomeworkReview/components/HomeworkReviewHeader/components/HomeworkReviewQuizSection.scss";
import TekieCEParser from "../../../../../components/Preview/Preview";
// import McqAnswerDesign from "./McqAnswerDesign";
// import FillInTheBlanksDesign from "./FillInTheBlanks";
import Arrange from "../../../../../components/QuestionTypes/Arrange";
import Mcq from "../../../../../components/QuestionTypes/Mcq";
import FibBlock from "../../../../../components/QuestionTypes/FibBlock";
import FibInput from "../../../../../components/QuestionTypes/FibInput";
import { get as getFromLoadash, sortBy, truncate } from "lodash";
import AnswerTabs from "../../../components/ReportQuestionStudentTabs/AnswerTabs";
import parseMetaTags from "../../../../../utils/parseMetaTags";
import "../../HomeworkReview/components/HomeworkReviewHeader/components/questionContainer.scss"

function PqReportQuestionSectionStudent({
  pqQuestions,
  newIndividualStudentReport,
  showOnlyQuestions = false,
  forQuizSection = false,
  styles = {},
}) {
  const [clicked, setClicked] = useState(false);
  const [answers, setAnswers] = useState();

  const [selectedAnswerType, setSelectedAnswerType] = useState("student");
  const questions = (pqQuestions && pqQuestions.questionBank) || [];

  const array1 = get(newIndividualStudentReport[0], "detailedReport", []);

  const onAnswerSwitch = (e, tabName, index, item) => {
    let newItems = { ...item };
    if (forQuizSection && tabName === "student") {
      const quizResponse = get(newIndividualStudentReport, "[0].quizAnswers", []).find(
        (question) => get(question, "question.id") === get(item, "id")
      );
      newItems = {
        ...newItems,
        mcqOptions: get(quizResponse, "userMcqAnswer", []).map((option) => ({ ...option, isCorrect: get(option, "isSelected") })),
        fibInputOptions: get(quizResponse, "userFibInputAnswer", []).map((option) => ({
          ...option,
          answers: [get(option, "answer")],
          correctPosition: get(option, "position"),
        })),
        arrangeOptions: get(quizResponse, "userArrangeAnswer", []).map((option) => ({
          ...option,
          correctPosition: get(option, "position"),
          correctPositions: [get(option, "position")],
        })),
        fibBlocksOptions: get(quizResponse, "userFibBlockAnswer", []).map((block) => {
          const findOrder = get(item, "fibBlocksOptions", []).find((blk) => get(blk, "statement") === get(block, "statement"));
          return { ...block, displayOrder: get(findOrder, "displayOrder") || 0, correctPositions: [get(block, "position")] };
        }),
      };
      setQuestionAnswer(newItems, index);
    } else {
      const findQuestion = pqQuestions.questionBank.find((question) => get(question, "id") === get(item, "id"));
      setQuestionAnswer(findQuestion, index);
    }
    setSelectedAnswerType(tabName);
    e.stopPropagation();
  };

  const percentageFinder = (item) => {
    const element = array1.find((value) => value.question.id === item.id);

    if (element) {
      if (element.firstTry === true) {
        if (showOnlyQuestions) return "1 Try";
        return `1st try`;
      }
      if (element.secondTry === true) {
        if (showOnlyQuestions) return "2 Tries";
        return `2nd try`;
      }
      if (element.thirdOrMoreTry === true) {
        if (showOnlyQuestions) return "3 Tries";
        return `3rd try`;
      }
    }
    if (newIndividualStudentReport.length === 0) {
      return "Not Attempted";
    }

    return "Not Attempted";
  };

  const colorFinder = (item) => {
    const arrayItem = array1.find((value) => value.question.id === item.id);
    if (forQuizSection) {
      const quizResponse = get(newIndividualStudentReport, "[0].quizAnswers", []).find(
        (question) => get(question, "question.id") === get(item, "id")
      );
      if (quizResponse && get(quizResponse, "isAttempted") && get(quizResponse, "isCorrect")) {
        return { background: "#01aa93", color: "#fff" };
      }
    }
    if (arrayItem) {
      if (arrayItem.firstTry === true) {
        return { background: "#01aa93", color: "#fff" };
      }
      if (arrayItem.secondTry === true) {
        return { background: "#faad14", color: "#fff" };
      }
      if (arrayItem.thirdOrMoreTry === true) {
        return { background: "#ff5744", color: "#fff" };
      }
    }
    if (newIndividualStudentReport.length === 0) {
      return {
        background: "#ff5744",
        color: "#fff",
      };
    }
    if (showOnlyQuestions) {
      return {
        background: "#ff5744",
        color: "#fff",
      };
    }
    return {
      background: "#ff5744",
      fontSize: "9px",
      color: "#fff",
    };
  };

  const ARRANGE = "arrange";
  const FIBBLOCK = "fibBlock";
  const FIBINPUT = "fibInput";
  const MCQ = "mcq";
  const toggle = (index, item) => {
    if (clicked === index) {
      return setClicked(null);
    }
    setClicked(index);
    let quizAnswer = { ...item };
    if (forQuizSection) {
      setSelectedAnswerType("student");
      quizAnswer = {
        ...quizAnswer,
      };
      const quizResponse = get(newIndividualStudentReport, "[0].quizAnswers", []).find(
        (question) => get(question, "question.id") === get(item, "id")
      );
      quizAnswer = {
        ...quizAnswer,
        mcqOptions: get(quizResponse, "userMcqAnswer", []).map((option) => ({ ...option, isCorrect: get(option, "isSelected") })),
        fibInputOptions: get(quizResponse, "userFibInputAnswer", []).map((option) => ({
          ...option,
          answers: [get(option, "answer")],
          correctPosition: get(option, "position"),
        })),
        arrangeOptions: get(quizResponse, "userArrangeAnswer", []).map((option) => ({
          ...option,
          correctPosition: get(option, "position"),
          correctPositions: [get(option, "position")],
        })),
        fibBlocksOptions: get(quizResponse, "userFibBlockAnswer", []).map((block) => {
          const findOrder = get(item, "fibBlocksOptions", []).find((blk) => get(blk, "statement") === get(block, "statement"));
          return { ...block, displayOrder: get(findOrder, "displayOrder") || 0, correctPositions: [get(block, "position")] };
        }),
      };
    }
    setQuestionAnswer(quizAnswer, index);
  };

  const setQuestionAnswer = (item, index) => {
    const questionType = get(item, "questionType", "");
    const answer = [];

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

  const getQuestions = (item, index) => {
    let questionTag = `${percentageFinder(item)}`;
    if (forQuizSection) {
      const quizResponse = get(newIndividualStudentReport, "[0].quizAnswers", []).find(
        (question) => get(question, "question.id") === get(item, "id")
      );
      if (quizResponse && get(quizResponse, "isCorrect")) {
        questionTag = "Correct";
      } else if (quizResponse && !get(quizResponse, "isCorrect")) {
        questionTag = "Incorrect";
      }
    }
    return (
      <div
        style={{ ...styles }}
        className={`senior__container pqReportQuestionStudentQuestion ${showOnlyQuestions &&
          "pqStudentLevelReportQuestionContainer"}`}
      >
        <div
          onClick={() => toggle(index, item)}
          style={{
            paddingRight: newIndividualStudentReport.length === 0 ? "20px" : "20px",
            cursor: "pointer",
          }}
          className="quiz__all__questions__section__c"
        >
          <div className="quiz__one__container1">
            <div style={{ marginRight: '10px' }}>
              <span className="qs__no">{index + 1}: </span>
              <div className={"quiz__all__questions__text"}>
                <TekieCEParser
                  value={item.statement}
                  useNativeHtmlParser
                  truncateText={showOnlyQuestions ? !(clicked === index) : true}
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
            <div className="quiz__all__questions__tag__container">
              <div
                style={colorFinder(item)}
                className={newIndividualStudentReport.length === 0 && !showOnlyQuestions ? "gg" : "quiz__all__questions__tag"}
              >
                {questionTag}
              </div>
              <div className="quiz__all__icon">
                <span
                  style={{
                    transform: clicked === index ? "rotate(-180deg)" : "",
                    transition: "all 0.25s ease-in-out",
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
            alignItems: "flex-start",
            display: "flex",
            justifyContent: "start",
            position: "relative",
            background: "#FFFFFF",
            flexDirection: forQuizSection ? "column" : "row",
          }}
          className={`pqReportQuestionStudent__collapsed ${clicked === index && "pqReportQuestionStudent__opened"}`}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              width: "100%",
              alignItems: "flex-start",
              flexDirection: showOnlyQuestions && !forQuizSection ? "row" : "column",
            }}
            className={`pqReportAnswerWrapper ${showOnlyQuestions && !forQuizSection && "pqReportAnswerWrapperUpdated"}`}
          >
            {forQuizSection && (
              <AnswerTabs onTabClick={(e, tabName) => onAnswerSwitch(e, tabName, index, item)} activeTab={selectedAnswerType} />
            )}

            <div
              className={`questionComponentcontainer ${selectedAnswerType === "correct" ? "questionComponentcontainerCorrect" : "questionComponentcontainerStudent"}`}
              style={{ width: "100%" }}
            >
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
          </div>
        </div>
      </div>
    );
  };
  const renderQuestions = () => (
    <div className="quiz__all__questions__main__container" style={{ ...styles }}>
      {pqQuestions.questionBank.map((item, index) => getQuestions(item, index))}
    </div>
  );
  if (showOnlyQuestions) return renderQuestions();
  return (
    <>
      <div className="homework__review__quiz__section">
        <div className="homework__review__quiz__title">
          <span className="review__icon">
            <QuizQuestionIcon />
          </span>
          <span className="homework__review__title__text">Practice Questions ({`${questions && questions.length}`})</span>
        </div>
        {renderQuestions()}
      </div>
    </>
  );
}

export default PqReportQuestionSectionStudent;
