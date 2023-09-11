import React, { useEffect } from "react";
import { sortBy } from "lodash";
import cx from "classnames";
import SyntaxHighlighter from "../../../utils/react-syntax-highlighter/dist/esm";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import styles from "./FibInput.module.scss";
import hs from "../../../utils/scale";
import parseMetaTags from "../../../utils/parseMetaTags";
// import { isBase64, decodeBase64 } from "../../../utils/base64Utility";
import TekieCEParser from "../../Preview";
import usePrevious from "../usePrevious";

const terminalStyles = {
  width: "100%",
  height: "100%",
  padding: '8.3px',
  // paddingLeft: "8.3px",
  // paddingTop: "8.3px",
  // paddingRight: 0,
  // paddingBottom: 0,
  marginTop: 0,
  marginBottom: 0,
  border: "#aaacae",
  backgroundColor: "#002f3e",
  fontFamily: "Monaco",
  fontSize: hs(24),
  fontWeight: "normal",
  fontStretch: "normal",
  fontStyle: "normal",
  lineHeight: "2.29",
  letterSpacing: "normal",
};

const updatedTerminalStyles = {
  width: "100%",
  height: "100%",
  marginTop: 0,
  marginBottom: 0,
  padding: "15px",
  // paddingTop: "20px",
  // paddingRight: 0,
  // paddingBottom: 0,
  fontFamily: "Nunito",
  fontWeight: "normal",
  fontStretch: "normal",
  fontStyle: "normal",
  lineHeight: "2",
  letterSpacing: "normal",
  backgroundColor: "#012A38",
  borderRadius: "5px",
  border: "2px solid #005773",
  boxSizing: "border-box",
  backdropFilter: "blur(150px)",
  whiteSpace: "pre-wrap",
};

const showAnswersTerminalStyles = {
  width: "100%",
  height: "100%",
  marginTop: 0,
  marginBottom: 0,
  paddingLeft: "2px",
  paddingTop: "2px",
  paddingRight: "2px",
  paddingBottom: "2px",
  fontFamily: "Nunito",
  fontWeight: "normal",
  fontStretch: "normal",
  fontStyle: "normal",
  lineHeight: "2",
  whiteSpace: "pre-wrap",
  letterSpacing: "normal",
  backgroundColor: "transparent",
  fontSize: hs(18),
  border: "none",
  boxSizing: "border-box",
};

const questionCodeSnippetStyles = {
  minHeight: hs("89"),
  objectFit: "contain",
  borderRadius: hs("3"),
  backgroundColor: "#013d4e",
};

const FibInput = ({
  question,
  updateAnswers,
  answers,
  activeQuestionIndex,
  isSeeAnswers,
  answerType,
  isSubmittedForReview,
  withUpdatedDesign = false,
  terminalAuto,
  questionStatus,
  actualQuestionAnswer,
  isMobile,
  showOnlyAnswer = false,
  fromHomework,
  fromReportsPage = false,
  onCheckButtonClick,
  isHomeWork
}) => {
  const prevValue = usePrevious(activeQuestionIndex)
  useEffect(() => {
    if (prevValue === activeQuestionIndex) {
      const correctAnswer = getCorrectAnswer(question.fibInputOptions, answerType)
      if (isSeeAnswers) {
        updateAnswers(activeQuestionIndex, correctAnswer);
        if (!isHomeWork) {
          setTimeout(() => {
            onCheckButtonClick()
          }, 0)
        }
      } else {
        updateAnswers(activeQuestionIndex, []);
      }
    }
  }, [isSeeAnswers])

  const updatedCssString = withUpdatedDesign ? "updated" : "";
  const onTextInputChange = (key, textValue) => {
    const newTextValues = answers[activeQuestionIndex]
      ? [...answers[activeQuestionIndex]]
      : [];
    newTextValues[key] = textValue;
    if (!isSeeAnswers && !isSubmittedForReview) {
      updateAnswers(activeQuestionIndex, newTextValues);
    }
  };

  const getCorrectAnswer = (fibInputOptions, answerType) => {
    const answers = [];
    if (answerType === "RS") {
      if (fibInputOptions && fibInputOptions.length > 0) {
        sortBy(fibInputOptions, "correctPosition").forEach((option) => {
          if (Array.isArray(option.answers) && option.answers.length) {
            answers.push(option.answers[0]);
          } else {
            answers.push(option.answers);
          }
        });
      }
    } else if (answerType === "YS") {
      if (fibInputOptions && fibInputOptions.length > 0) {
        sortBy(fibInputOptions, "position").forEach((option) => {
          answers.push(option.answer);
        });
      }
    }
    return answers;
  };

  if (showOnlyAnswer) {
    return (
      <div className={styles.fibInputContainer}>
        <SyntaxHighlighter
          language={
            question.questionLayoutType === "editor" ? "python" : "text"
          }
          codeTagProps={{
            style: {
              fontFamily: `${withUpdatedDesign ? "Nunito" : "Monaco"}`,
            },
          }}
          style={darcula}
          fibInputTextValues={
            !isSeeAnswers
              ? answers[activeQuestionIndex]
              : getCorrectAnswer(question.fibInputOptions, answerType)
          }
          onTextInputChange={onTextInputChange}
          customStyle={{
            ...(withUpdatedDesign ? updatedTerminalStyles : terminalStyles),
            ...(terminalAuto ? { paddingBottom: hs(30) } : {}),
          }}
          section="fibInput"
          isSeeAnswers={isSeeAnswers}
        >
          {decodeURIComponent(question.answerCodeSnippet)}
        </SyntaxHighlighter>
      </div>
    );
  }
  return (
    <div
      className={
        isMobile ? styles.mbFibInputContainer : styles.fibInputContainer
      }
    >
      {fromHomework ? (
        ""
      ) : (
        <div
          className={
            isMobile ? styles.mbQuestionStatement : styles.questionStatement
          }
        >
          <TekieCEParser
            value={question.statement}
            init={{ selector: `PQ-FibInput_${question.Id}` }}
            legacyParser={(statement) => {
              return parseMetaTags({ statement, removeCodeTag: true });
            }}
          />
        </div>
      )}

      {withUpdatedDesign &&
        isSubmittedForReview &&
        questionStatus &&
        questionStatus.renderSection}
      {question.questionCodeSnippet && (
        <SyntaxHighlighter
          language={
            question.questionLayoutType === "editor" ? "python" : "text"
          }
          codeTagProps={{ style: { fontFamily: "Monaco" } }}
          customStyle={questionCodeSnippetStyles}
          style={darcula}
        >
          {decodeURIComponent(question.questionCodeSnippet)}
        </SyntaxHighlighter>
      )}
      {isSubmittedForReview && withUpdatedDesign && actualQuestionAnswer ? (
        <>
          {withUpdatedDesign && isSubmittedForReview && questionStatus ? (
            <div className={styles.updatedAnswersContainer}>
              <div className={styles.yourAnswerContainer}>
                <span style={{ marginBottom: "6px" }}>Your Answer</span>
                <SyntaxHighlighter
                  language={
                    question.questionLayoutType === "editor" ? "python" : "text"
                  }
                  codeTagProps={{ style: { fontFamily: "Nunito" } }}
                  style={darcula}
                  fibInputTextValues={answers[activeQuestionIndex]}
                  fibCorrectOptions={getCorrectAnswer(
                    actualQuestionAnswer.fibInputOptions,
                    "RS"
                  )}
                  onTextInputChange={() => {}}
                  customStyle={showAnswersTerminalStyles}
                  section="fibInput"
                  reviewMode
                >
                  {decodeURIComponent(question.answerCodeSnippet)}
                </SyntaxHighlighter>
              </div>
              {questionStatus.status !== "correct" && (
                <div className={styles.actualAnswerContainer}>
                  <span style={{ marginBottom: "6px" }}>Correct Answer</span>
                  <SyntaxHighlighter
                    language={
                      question.questionLayoutType === "editor"
                        ? "python"
                        : "text"
                    }
                    codeTagProps={{ style: { fontFamily: "Nunito" } }}
                    style={darcula}
                    fibInputTextValues={getCorrectAnswer(
                      actualQuestionAnswer.fibInputOptions,
                      "RS"
                    )}
                    onTextInputChange={() => {}}
                    customStyle={{
                      ...showAnswersTerminalStyles,
                      backgroundColor: "transparent",
                    }}
                    section="fibInput"
                    reviewMode
                  >
                    {decodeURIComponent(question.answerCodeSnippet)}
                  </SyntaxHighlighter>
                </div>
              )}
            </div>
          ) : (
            <div />
          )}
        </>
      ) : (
        <div
          className={
            isMobile
              ? cx(
                  styles.mbTerminalContainer,
                  terminalAuto && styles.terminalAuto
                )
              : cx(
                  styles.terminalContainer,
                terminalAuto && styles.terminalAuto,
                  fromReportsPage && styles.fromReportsPageStyle
                )
          }
        >
          <SyntaxHighlighter
            language={
              question.questionLayoutType === "editor" ? "python" : "text"
            }
            codeTagProps={{
              style: {
                fontFamily: `${withUpdatedDesign ? "Nunito" : "Monaco"}`,
              },
            }}
            style={darcula}
            fibInputTextValues={
              !isSeeAnswers
                ? answers[activeQuestionIndex]
                : getCorrectAnswer(question.fibInputOptions, answerType)
            }
            onTextInputChange={onTextInputChange}
            customStyle={{
              ...(withUpdatedDesign ? updatedTerminalStyles : terminalStyles),
              ...(terminalAuto ? { paddingBottom: hs(30) } : {}),
            }}
            section="fibInput"
            isSeeAnswers={isSeeAnswers}
          >
            {decodeURIComponent(question.answerCodeSnippet)}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
};

export default FibInput;
