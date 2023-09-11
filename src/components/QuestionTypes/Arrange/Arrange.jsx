import React, { useEffect } from "react";
import arrayMove from "array-move";
import cx from "classnames";
import { sortBy, get } from "lodash";
import Sortable from "../Sortable";
import styles from "./Arrange.module.scss";
import SyntaxHighlighter from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import hs from "../../../utils/scale";
import parseMetaTags from "../../../utils/parseMetaTags";
import TekieCEParser from "../../Preview";
import usePrevious from "../usePrevious";

const terminalStyles = {
  minHeight: hs("59"),
  objectFit: "contain",
  borderRadius: hs("3"),
  backgroundColor: "#013d4e",
};

const Arrange = ({
  showOnlyAnswer,
  question,
  answers,
  activeQuestionIndex,
  updateAnswers,
  isSeeAnswers,
  isSubmittedForReview,
  answerType,
  withUpdatedDesign,
  questionStatus,
  actualQuestionAnswer,
  isMobile,
  fromChatbot = false,
  fromHomework,
  isLearningSlide,
  fromReportsPage = false,
  onCheckButtonClick,
  isHomeWork
}) => {
  const prevValue = usePrevious(activeQuestionIndex)
  useEffect(() => {
    if (prevValue === activeQuestionIndex) {
      const correctAnswer = getAnswersOrder(question.arrangeOptions, answerType)
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

  const getAnswersOrder = (arrangeOptions, answerType) => {
    const correctOrders = []
    if (arrangeOptions && arrangeOptions.length > 0 && answerType === "RS") {
      arrangeOptions.forEach((option, idx) => {
        if (get(option, "correctPositions", []).length > 0) {
          const sortedPositions = get(option, "correctPositions", []).sort((a, b) => a - b)
          const order = get(sortedPositions, '0') - 1
          correctOrders[order] = idx
        }
      })
    }
    return correctOrders
  }

  const onSortEnd = ({ oldIndex, newIndex }) => {
    const newOrder = arrayMove(order, oldIndex, newIndex);
    updateAnswers(activeQuestionIndex, newOrder);
  };

  const getAnswersInCorrectOrder = (arrangeOptions, answerType) => {
    if (arrangeOptions && answerType === "RS") {
      if (
        get(arrangeOptions[0], "correctPositions") &&
        get(arrangeOptions[0], "correctPositions").length > 0
      ) {
        return sortBy(
          arrangeOptions.map((option) => ({
            ...option,
            correctPosition: get(option, "correctPositions.0"),
          })),
          "correctPosition"
        );
      }
      return sortBy(arrangeOptions, "correctPosition");
    } else if (answerType === "YS") {
      return arrangeOptions;
    }

    return [];
  };

  let order = [];
  let data = [];
  if (
    !answers[activeQuestionIndex] ||
    answers[activeQuestionIndex].length === 0
  ) {
    question.arrangeOptions.map((options, index) => order.push(index));
    data = question.arrangeOptions;
  } else {
    order = answers[activeQuestionIndex];
    if (actualQuestionAnswer && isSubmittedForReview) {
      data = order.map((idx) => actualQuestionAnswer.arrangeOptions[idx]);
    } else {
      data = order.map((idx) => question.arrangeOptions[idx]);
    }
  }

  if (showOnlyAnswer) {
    return (
      <div
        className={
          cx(isMobile ? styles.mbArrangeContainer : styles.arrangeContainer, fromReportsPage && styles.noMargin)
        }
        style={{
          padding: `${isMobile ? "0px" : ""}`,
        }}
      >
        <div
          className={
            isMobile
              ? cx(
                  styles.mbQuestionStatement,
                  withUpdatedDesign && styles.questionStatementUpdated,
                  withUpdatedDesign && styles.reArrangeWrapper
                )
              : cx(
                  styles.questionStatement,
                  withUpdatedDesign && styles.questionStatementUpdated
                )
          }
          style={{
            borderRadius: `${isMobile && withUpdatedDesign ? "10px" : ""}`,
          }}
        >
          <Sortable
            withUpdatedDesign={withUpdatedDesign}
            lockAxis={"y"}
            items={getAnswersInCorrectOrder(
              question.arrangeOptions,
              answerType
            )}
            onSortEnd={onSortEnd}
            isSeeAnswers={isSeeAnswers}
            isSubmittedForReview={isSubmittedForReview}
            isLearningSlide={isLearningSlide}
            // isMobile={isMobile}
          />
        </div>
      </div>
    );
  }
  return (
    <div
      className={cx(isMobile ? styles.mbArrangeContainer : styles.arrangeContainer, fromReportsPage && styles.noMargin)}
    >
      <div
        className={
          isMobile
            ? cx(
                styles.mbQuestionStatement,
                withUpdatedDesign && styles.questionStatementUpdated
              )
            : cx(
                styles.questionStatement,
                withUpdatedDesign && styles.questionStatementUpdated
              )
        }
      >
        {fromHomework ? (
          ""
        ) : (
          <TekieCEParser
            value={question.statement}
            init={{ selector: `PQ-Arrange_${question.Id}` }}
            legacyParser={(statement) => {
              return parseMetaTags({ statement, removeCodeTag: true });
            }}
          />
        )}
      </div>
      {withUpdatedDesign &&
        isSubmittedForReview &&
        questionStatus &&
        questionStatus.renderSection}
      {question.questionCodeSnippet && (
        <SyntaxHighlighter
          language={
            question.questionLayoutType === "editor" ? "python" : "text"
          }
          codeTagProps={{
            style: { fontFamily: `${withUpdatedDesign ? "Nunito" : "Monaco"}` },
          }}
          customStyle={terminalStyles}
          style={darcula}
        >
          {decodeURIComponent(question.questionCodeSnippet)}
        </SyntaxHighlighter>
      )}
      <div
        className={cx({
          [styles.reArrangeWrapper]: withUpdatedDesign,
          [styles.minPadding]: fromChatbot,
          [styles.noBg]: isMobile,
          [styles.noMargin]: fromReportsPage
        })}
      >
        {/* For New Review Flow */}
        {isSubmittedForReview && withUpdatedDesign && actualQuestionAnswer ? (
          <>
            {questionStatus && questionStatus.status !== "unAttempted" && (
              <div className={styles.yourAnswerContainer}>
                Your Answer
                <Sortable
                  withUpdatedDesign={withUpdatedDesign}
                  lockAxis={"y"}
                  items={
                    !isSeeAnswers
                      ? data
                      : getAnswersInCorrectOrder(
                          question.arrangeOptions,
                          answerType
                        )
                  }
                  correctOptions={getAnswersInCorrectOrder(
                    actualQuestionAnswer.arrangeOptions,
                    "RS"
                  )}
                  onSortEnd={onSortEnd}
                  isSeeAnswers={isSeeAnswers}
                  isSubmittedForReview={isSubmittedForReview}
                  isMobile={isMobile}
                  isLearningSlide={isLearningSlide}
                />
              </div>
            )}
            {questionStatus && questionStatus.status !== "correct" && (
              <div className={styles.yourAnswerContainer}>
                Correct Answer
                <Sortable
                  withUpdatedDesign={withUpdatedDesign}
                  lockAxis={"y"}
                  items={getAnswersInCorrectOrder(
                    actualQuestionAnswer.arrangeOptions,
                    "RS"
                  )}
                  onSortEnd={onSortEnd}
                  isSeeAnswers={isSeeAnswers}
                  isSubmittedForReview={isSubmittedForReview}
                  isMobile={isMobile}
                />
              </div>
            )}
          </>
        ) : (
          <Sortable
            withUpdatedDesign={withUpdatedDesign}
            lockAxis={"y"}
            items={
              !isSeeAnswers
                ? data
                : getAnswersInCorrectOrder(question.arrangeOptions, answerType)
            }
            onSortEnd={onSortEnd}
            isSeeAnswers={isSeeAnswers}
            isSubmittedForReview={isSubmittedForReview}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
};

export default Arrange;
