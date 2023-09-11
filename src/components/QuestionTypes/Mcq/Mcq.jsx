import React, { useEffect, useState } from "react";
import styles from "./Mcq.module.scss";
import cx from "classnames";
import './editoroverride.scss'
import { get } from "lodash";
import { ImageBackground } from "../../../image";
import { BlocklyWorkspace } from "tekie-blockly";
import SyntaxHighlighter from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import hs from "../../../utils/scale";
import getPath from "../../../utils/getPath";
import parseMetaTags from "../../../utils/parseMetaTags";
import { decodeBase64 } from "../../../utils/base64Utility";
import TekieCEParser from "../../Preview";

import "./blockly.scss";
import usePrevious from "../usePrevious";

const terminalStyles = {
  minHeight: hs("59"),
  objectFit: "contain",
  borderRadius: hs("3"),
  backgroundColor: "#013d4e",
};

export const blocklyWorkspaceConfig = {
  readOnly: true,
  grid: false,
  trashcan: false,
  move: {
    scrollbars: {
      horizontal: true,
      vertical: true,
    },
    drag: false,
    wheel: true,
  },
  zoom: false,
};

const buildCustomToolJSON = (blocksJSONString) => {
  try {
    if (typeof blocksJSONString === "string") {
      const blocksJSON = JSON.parse(blocksJSONString);
      const toolboxJSON = [];
      blocksJSON.forEach((block) => {
        toolboxJSON.push({
          name: block.type,
          category: "Block",
          block: {
            init: function() {
              this.jsonInit(block);
            },
          },
        });
      });
      return toolboxJSON;
    }
    return null;
  } catch (e) {
    console.warn("INVALID JSON");
  }
};

const getOptionClassName = (
  isSeeAnswers,
  isCorrect,
  isSelected,
  status,
  answerType,
  updatedCssString = "",
  isSubmittedForReview = false,
  fromChatbot
) => {
  if (
    (isSeeAnswers || (isSubmittedForReview && updatedCssString !== "")) &&
    !fromChatbot
  ) {
    if (
      isSelected &&
      (answerType === "YS" || (isSubmittedForReview && updatedCssString !== ""))
    ) {
      if (status === "correct") {
        return cx(
          cx(
            styles[`${updatedCssString}option`],
            styles[`${updatedCssString}defaultCursor`]
          ),
          styles[`${updatedCssString}correctAnswers`]
        );
      } else if (status === "wrong") {
        return cx(
          cx(
            styles[`${updatedCssString}option`],
            styles[`${updatedCssString}defaultCursor`]
          ),
          styles[`${updatedCssString}wrongAnswers`]
        );
      } else {
        return cx(
          styles[`${updatedCssString}option`],
          styles[`${updatedCssString}defaultCursor`]
        );
      }
    } else if (answerType === "RS" && !isSeeAnswers) {
      if (isCorrect) {
        return cx(
          cx(
            styles[`${updatedCssString}option`],
            styles[`${updatedCssString}defaultCursor`]
          ),
          styles[`${updatedCssString}correctAnswers`]
        );
      } else {
        return cx(
          styles[`${updatedCssString}option`],
          styles[`${updatedCssString}defaultCursor`]
        );
      }
    }
  }
  return styles[`${updatedCssString}option`];
};

const Mcq = ({
  showOnlyAnswer,
  question,
  activeQuestionIndex,
  updateAnswers,
  answers,
  isSeeAnswers,
  isSubmittedForReview,
  answerType,
  withUpdatedDesign = false,
  questionStatus,
  actualQuestionAnswer,
  fromChatbot = false,
  fromReview = false,
  isMobile,
  fromHomework,
  mcqOptionsOg = [],
  fromReportsPage = false,
  onCheckButtonClick,
  isHomeWork,
  mcqType = get(question, 'mcqType', null)
}) => {
  const [isMcqSingleChoice, setIsMcqSingleChoice] = useState(null)
  const prevValue = usePrevious(activeQuestionIndex)
  useEffect(() => {
    const mcqOptions = get(question, 'mcqOptions', [])
    if (mcqOptions.length > 0) {
      const correctQuestionLength = mcqOptions.filter(item => item.isCorrect)
      setIsMcqSingleChoice(correctQuestionLength.length > 1 ? false : true)
    } else if (mcqType === 'singleChoice') {
      setIsMcqSingleChoice(true)
    }
  })
  useEffect(() => {
    if (prevValue === activeQuestionIndex) {
      if (isSeeAnswers) {
        const toggleOptions = answers[activeQuestionIndex]
          ? [...answers[activeQuestionIndex]]
          : [];
        question.mcqOptions.forEach((mcqOption, idx) => {
          if (mcqOption.isCorrect) {
            toggleOptions[idx] = true
          }
        })
        updateAnswers(activeQuestionIndex, toggleOptions);
        if (!isHomeWork) {
          setTimeout(() => {
            onCheckButtonClick()
          }, 0)
        }
      }
      else {
        updateAnswers(activeQuestionIndex, []);
      }
    }
  }, [isSeeAnswers])

  function onOptionClick(index) {
    const toggleOptions = answers[activeQuestionIndex]
      ? [...answers[activeQuestionIndex]]
      : [];
    if (isMcqSingleChoice) {
      for (let i=0; i<toggleOptions.length; i++) {
        toggleOptions[i] = false
      }
    }
    toggleOptions[index] = !toggleOptions[index];
    updateAnswers(activeQuestionIndex, toggleOptions);
  }
  const updatedCssString = withUpdatedDesign ? "updated" : "";
  const getAnswerTagColor = (status, selectedStatement, isSelected) => {
    if (status === "incorrect" && isSelected) {
      if (actualQuestionAnswer) {
        const correctQuestions =
          actualQuestionAnswer.mcqOptions
            .filter((el) => get(el, "isCorrect", false))
            .map((el) => el.statement) || [];
        if (correctQuestions.includes(selectedStatement)) {
          return "";
        }
      }
      return cx(styles.incorrectTagColor);
    }
    return "";
  };
  const getImageStringURI = (mcqOptionsDoc) => {
    let imageURI = null;
    if (get(mcqOptionsDoc, "questionBankImage.image.uri", null)) {
      imageURI = get(mcqOptionsDoc, "questionBankImage.image.uri", "");
    } else if (isSubmittedForReview && mcqOptionsOg && mcqOptionsOg.length) {
      mcqOptionsOg.forEach((option) => {
        if (get(option, "statement") === get(mcqOptionsDoc, "statement")) {
          imageURI = get(option, "questionBankImage.image.uri", "");
        }
      });
    }
    return imageURI;
  };

  const isBlocklyLayout = get(question, "questionLayoutType", "editor") === "blockly";

  const isImageLayout =
    get(question, "questionLayoutType", "editor") === "image";
  const renderNewLayout = isBlocklyLayout || isImageLayout;
  let blockLayoutType = get(question, "blockLayoutType", "gridSm");
  if (!renderNewLayout) {
    blockLayoutType = "gridSm";
  }
  if (isMobile) {
    blockLayoutType = "column";
  }
  

  if (showOnlyAnswer && !isBlocklyLayout && !isImageLayout) {
    return (
      <div
        className={cx({
          [styles[`${updatedCssString}optionsContainer`]]: true,
          [styles.mbFullMcqContainer]: isMobile,
        })}
      >
        {question.mcqOptions.map((mcqOption, idx) => {
          let selected = mcqOption.isCorrect;
          return (
            <div
              className={cx(
                getOptionClassName(
                  isSeeAnswers,
                  mcqOption.isCorrect,
                  mcqOption.isSelected,
                  mcqOption.status,
                  answerType,
                  updatedCssString,
                  isSubmittedForReview,
                  fromChatbot
                ),
                cx({
                  [styles.selectedAnswer]: selected,
                  [styles.updatedselectedAnswer]: selected,
                }),
                cx({
                  [styles.mbMcqOption]: isMobile,
                }),
                cx({ [styles.fromReportsPageStyles]: idx === 0 && fromReportsPage })
              )}
              key={mcqOption.id}
              onClick={
                !isSeeAnswers && !isSubmittedForReview
                  ? () => onOptionClick(idx)
                  : ""
              }
            >
              {mcqOption.statement}
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div
      className={cx({
        [styles[`${updatedCssString}mcqContainer`]]: ["gridSm", "row"].includes(
          blockLayoutType
        ),
        [styles.fullMcqContainer]:
          ["gridLg", "column"].includes(blockLayoutType) && !isMobile,
        [styles.mbFullMcqContainer]: isMobile,
        [styles.fromReportsPageStyles]: fromReportsPage
      })}
    >
      {(!showOnlyAnswer && !fromHomework) && (
        <div
          className={
            isMobile
              ? styles.mbQuestionStatement
              : cx({
                  [styles[`${updatedCssString}questionStatement`]]: true,
                })
          }
        >
          {fromHomework ? (
            " "
          ) : (
            <TekieCEParser
              value={question.statement}
              init={{ selector: `PQ-Mcq_${question.Id}` }}
              legacyParser={(statement) =>
                parseMetaTags({ statement, removeCodeTag: true })
              }
            />
          )}
        </div>
      )}
      {withUpdatedDesign && isSubmittedForReview && questionStatus
        ? questionStatus.renderSection
        : null}
      {question.questionCodeSnippet && (
        <SyntaxHighlighter
          language={
            question.questionLayoutType === "editor" ? "python" : "text"
          }
          codeTagProps={{
            style: { fontFamily: `${withUpdatedDesign ? "Nunito" : "Monaco"}` },
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
          {decodeURIComponent(question.questionCodeSnippet)}
        </SyntaxHighlighter>
      )}
      {renderNewLayout ? (
        <div
          className={cx({
            [styles.blocklyOptionsContainer]: true,
            [styles.blocklyOption]: true,
          })}
        >
          {question.mcqOptions.map((mcqOption, idx) => {
            let toggleOptions = [];
            if (answers[activeQuestionIndex]) {
              toggleOptions = [...answers[activeQuestionIndex]];
            }
            let selected = false;
            let selectedCheckStyles = {
              border: "3px solid #CCC",
              backgroundColor: "rgba(230,230,230,53%)",
              padding: 3,
            };
            let checkIconStyles = {};
            if (showOnlyAnswer) {
              selected = mcqOption.isCorrect
            }
            if (toggleOptions[idx] || selected) {
              selectedCheckStyles = {
                backgroundColor: "#00ADE6",
                padding: 6,
              };
              checkIconStyles = {
                opacity: 1,
              };
              selected = true;
            }
            return (
              <div
                className={cx(
                  getOptionClassName(
                    isSeeAnswers,
                    mcqOption.isCorrect,
                    mcqOption.isSelected,
                    mcqOption.status,
                    answerType,
                    updatedCssString,
                    isSubmittedForReview,
                    fromChatbot
                  ),
                  cx({
                    [styles.selectedAnswer]: selected,
                    [styles.updatedselectedAnswer]: selected,
                    [styles[`blocklyItem${blockLayoutType}`]]: true,
                  }),
                  [styles.blocklyoption],
                  cx({ [styles.fromReportsPageStyles]: fromReportsPage })
                )}
                key={mcqOption.id}
                onClick={
                  !isSeeAnswers && !isSubmittedForReview
                    ? () => onOptionClick(idx)
                    : ""
                }
              >
                <div
                  className={styles.selectedCheck}
                  style={selectedCheckStyles}
                >
                  <span style={checkIconStyles} />
                </div>
                <div
                  className={cx({
                    [styles.blocklyItem]: true,
                    // [styles[`blocklyItem${blockLayoutType}`]]: true,
                    [styles.imageLayoutBgImage]: isImageLayout,
                  })}
                >
                  {isBlocklyLayout ? (
                    buildCustomToolJSON(
                      decodeBase64(get(mcqOption, "blocksJSON"))
                    ) && (
                      <BlocklyWorkspace
                        useDefaultToolbox
                        customTools={buildCustomToolJSON(
                          decodeBase64(get(mcqOption, "blocksJSON"))
                        )}
                        workspaceConfiguration={blocklyWorkspaceConfig}
                        initialXml={
                          decodeBase64(get(mcqOption, "initialXML")) || ""
                        }
                        onWorkspaceChange={(workspaceEl) => {
                          if (workspaceEl && workspaceEl.scrollCenter) {
                            workspaceEl.scrollCenter();
                          }
                        }}
                      />
                    )
                  ) : getImageStringURI(mcqOption) ? (
                    <ImageBackground
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }}
                      src={getPath(getImageStringURI(mcqOption))}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className={
            isMobile
              ? styles.mbOptionsContainer
              : styles[`${updatedCssString}optionsContainer`]
          }
        >
          {question.mcqOptions.map((mcqOption, idx) => {
            let toggleOptions = [];
            if (answers[activeQuestionIndex]) {
              toggleOptions = [...answers[activeQuestionIndex]];
            }
            let selected = false;
            if (toggleOptions[idx]) {
              selected = true;
            }
            return (
              <div
                className={cx(
                  getOptionClassName(
                    isSeeAnswers,
                    mcqOption.isCorrect,
                    mcqOption.isSelected,
                    mcqOption.status,
                    answerType,
                    updatedCssString,
                    isSubmittedForReview,
                    fromChatbot
                  ),
                  cx({
                    [styles.selectedAnswer]: selected,
                    [styles.updatedselectedAnswer]: selected,
                  }),
                  cx({
                    [styles.mbMcqOption]: isMobile,
                  }),
                  cx({ [styles.fromReportsPageStyles]: idx === 0 && fromReportsPage })
                )}
                key={mcqOption.id}
                onClick={
                  !isSeeAnswers && !isSubmittedForReview
                    ? () => onOptionClick(idx)
                    : ""
                }
              >
                {mcqOption.statement}
              </div>
            );
          })}
        </div>
      )}
      {withUpdatedDesign &&
      isSubmittedForReview &&
      questionStatus &&
      !renderNewLayout ? (
        <div className={styles.updatedAnswersContainer}>
          {questionStatus.status !== "unAttempted" && (
            <div className={styles.yourAnswerContainer}>
              Your Answer
              <div className={styles.tagsContainer}>
                {question.mcqOptions &&
                  question.mcqOptions
                    .filter((el) => get(el, "isSelected", false))
                    .map((el) => (
                      <span
                        className={cx(
                          styles.answerTags,
                          getAnswerTagColor(
                            questionStatus.status,
                            el.statement,
                            true
                          )
                        )}
                      >
                        {el.statement}
                      </span>
                    ))}
              </div>
            </div>
          )}
          {questionStatus.status !== "correct" && (
            <div className={styles.actualAnswerContainer}>
              Correct Answer
              <div className={styles.tagsContainer}>
                {actualQuestionAnswer.mcqOptions
                  .filter((el) => get(el, "isCorrect", false))
                  .map((el) => (
                    <span className={styles.answerTags}>{el.statement}</span>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default Mcq;
