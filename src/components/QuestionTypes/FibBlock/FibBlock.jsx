import React, { useState, useEffect } from "react";
import { sortBy } from "lodash";
import cx from "classnames";
import styles from "./FibBlock.module.scss";
import SyntaxHighlighter from "../../../utils/react-syntax-highlighter/dist/esm";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import hs from "../../../utils/scale";
import Draggable from "./Draggable";
// import { is } from "immutable";
import parseMetaTags from "../../../utils/parseMetaTags";
import TekieCEParser from "../../Preview";

import { polyfill } from "mobile-drag-drop";

import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";
import usePrevious from "../usePrevious";

polyfill({
  // use this to make use of the scroll behaviour
  dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
});
const terminalStyles = {
  width: "100%",
  height: "100%",
  padding: "8.3px",
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
  letterSpacing: "normal",
  backgroundColor: "transparent",
  whiteSpace: "pre-wrap",
  fontSize: hs(18),
  border: "none",
  boxSizing: "border-box",
};

const terminalStyleBottomPadding = {
  paddingBottom: hs(10),
};

const questionCodeSnippetStyles = {
  minHeight: hs("89"),
  objectFit: "contain",
  borderRadius: hs("3"),
  backgroundColor: "#013d4e",
};

const isOverlaping = (
  topLeft,
  bottomRight,
  topLeftEmptyBlock,
  bottomRightEmptyBlock
) => {
  // checks if one rectangle is left of another which means they don't overlap
  if (
    topLeft.x > bottomRightEmptyBlock.x ||
    topLeftEmptyBlock.x > bottomRight.x
  ) {
    return false;
  }

  // checks if one rectange is on top of another which means they don't overlap
  if (
    bottomRight.y < topLeftEmptyBlock.y ||
    bottomRightEmptyBlock.y < topLeft.y
  ) {
    return false;
  }

  return true;
};

const getCorrectBlocks = (fibBlockOptions, answerType) => {
  const answers = [];
  const alreadyIncludedPositions = [];
  fibBlockOptions.forEach((option) => {
    if (
      answerType === "RS" &&
      option.correctPositions &&
      option.correctPositions.length > 0
    ) {
      option.correctPositions.forEach((order) => {
        if (!alreadyIncludedPositions.includes(order)) {
          option.order = order;
          answers.push(option);
          alreadyIncludedPositions.push(order);
        }
      });
    } else if (answerType === "YS" && option.position) {
      option.order = option.position;
      answers.push(option);
    }
  });

  return sortBy(answers, "order");
};

const FibBlock = ({
  question,
  activeQuestionIndex,
  answers,
  updateAnswers,
  isSeeAnswers,
  answerType,
  isSubmittedForReview,
  withUpdatedDesign = false,
  questionStatus,
  actualQuestionAnswer,
  isMobile,
  fromChatbot,
  fromHomework,
  fromReportsPage,
  onCheckButtonClick,
  isHomeWork,
  ...props
}) => {
  const [expandEmptyBlockIndex, setExpandEmptyBlockIndex] = useState(-1);
  const [draggableCoordinates, setDraggableCoordinates] = useState([]);
  // const [blockTexts, setBlockTexts] = useState([])
  const [dropAreaCoordinates, setDropAreaCoordinates] = useState([]);
  const [activeDraggableElement, setActiveDraggableElement] = useState({});
  const [fibAndEmptyBlockMap, setFibAndEmptyBlockMap] = useState([]);
  const correctBlocks = getCorrectBlocks(question.fibBlocksOptions, answerType);
  const updatedCssString = withUpdatedDesign ? "updated" : "";

  const prevValue = usePrevious(activeQuestionIndex)
  useEffect(() => {
    if (prevValue === activeQuestionIndex) {
      const correctAnswer = getAnswers(correctBlocks)
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

  useEffect(() => {
    const fibAndEmptyBlockMap = [];
    const fibBlocks = question.fibBlocksOptions;
    for (let i = 0; i < fibBlocks.length; i++) {
      fibAndEmptyBlockMap.push(null);
    }
    const isPropAvailable = answers[activeQuestionIndex];
    if (isPropAvailable) {
      const answerTexts = answers[activeQuestionIndex];
      const alreadyIncludedIndexes = [];
      for (let i = 0; i < answerTexts.length; i++) {
        for (let j = 0; j < fibBlocks.length; j = j + 1) {
          if (
            fibBlocks[j].statement === answerTexts[i] &&
            !alreadyIncludedIndexes.includes(j)
          ) {
            fibAndEmptyBlockMap[i] = j;
            alreadyIncludedIndexes.push(j);
            break;
          }
        }
      }
    }
    setFibAndEmptyBlockMap(fibAndEmptyBlockMap);
  }, [answers]);


  const isNear = (DraggableTopLeft, DraggableBottomRight) => {
    let flag = 0;
    // two points of draggable block
    for (let i = 0; i < dropAreaCoordinates.length; i++) {
      const topLeftEmptyBlock = {
        x: dropAreaCoordinates[i].x,
        y: dropAreaCoordinates[i].y,
      };
      const bottomRightEmptyBlock = {
        x: dropAreaCoordinates[i].x + dropAreaCoordinates[i].width,
        y: dropAreaCoordinates[i].y + dropAreaCoordinates[i].height,
      };
      if (
        isOverlaping(
          DraggableTopLeft,
          DraggableBottomRight,
          topLeftEmptyBlock,
          bottomRightEmptyBlock
        ) &&
        (fibAndEmptyBlockMap[i] === null ||
          fibAndEmptyBlockMap[i] === undefined)
      ) {
        return i;
      }
    }
    if (!flag) {
      return -1;
    }
  };

  const expandEmptyBlock = (index) => {
    setExpandEmptyBlockIndex(index);
  };

  const updateDraggableCoordinates = (coordinates, index) => {
    const newdraggableCoordinates = [...draggableCoordinates];
    newdraggableCoordinates[index] = coordinates;
    setDraggableCoordinates(newdraggableCoordinates);
  };
  const updateDropAreaCoordinates = (coordinates, index) => {
    const newDropAreaCoordinates = [...dropAreaCoordinates];
    newDropAreaCoordinates[index] = coordinates;
    setDropAreaCoordinates(newDropAreaCoordinates);
  };

  const onDragEnd = (e) => {
    const draggableTopLeft = {
      x: e.clientX - activeDraggableElement.diffX,
      y: e.clientY - activeDraggableElement.diffY,
    };
    const { activeElementIndex } = activeDraggableElement;
    const draggablebottomRight = {
      x: draggableTopLeft.x + draggableCoordinates[activeElementIndex].width,
      y: draggableTopLeft.y + draggableCoordinates[activeElementIndex].height,
    };
    const emptyBlockindex = isNear(draggableTopLeft, draggablebottomRight);
    if (emptyBlockindex !== -1) {
      const newFibAndEmptyBlockMap = [...fibAndEmptyBlockMap];
      newFibAndEmptyBlockMap[emptyBlockindex] = activeElementIndex;
      const newBlockTexts = [...answers[activeQuestionIndex]];
      newBlockTexts[emptyBlockindex] =
        question.fibBlocksOptions[activeElementIndex].statement;
      setFibAndEmptyBlockMap(newFibAndEmptyBlockMap);
      updateAnswers(activeQuestionIndex, newBlockTexts);
      // setBlockTexts(newBlockTexts)
    }
    setActiveDraggableElement({});
    expandEmptyBlock(-1);
  };

  const onDragCapture = (e) => {
    const draggableTopLeft = {
      x: e.clientX - activeDraggableElement.diffX,
      y: e.clientY - activeDraggableElement.diffY,
    };
    const { activeElementIndex } = activeDraggableElement;
    const draggablebottomRight = {
      x: draggableTopLeft.x + draggableCoordinates[activeElementIndex].width,
      y: draggableTopLeft.y + draggableCoordinates[activeElementIndex].height,
    };
    const index = isNear(draggableTopLeft, draggablebottomRight);
    if (index !== -1) {
      expandEmptyBlock(index);
    } else {
      expandEmptyBlock(-1);
    }
  };

  const onDragStart = (e, index) => {
    const draggableElement = {
      diffX: e.clientX - draggableCoordinates[index].x,
      diffY: e.clientY - draggableCoordinates[index].y,
      activeElementIndex: index,
    };
    setActiveDraggableElement(draggableElement);
  };

  // const onDragOver=(e,index)=>{
  //     e.preventDefault()
  //     if(index!==onDragOverIndex){
  //         setOnDragOverIndex(index)
  //     }
  // }

  const removeTextFromDroppable = (droppableKey) => {
    if (!isSeeAnswers && !isSubmittedForReview) {
      const newFibAndEmptyBlockMap = [...fibAndEmptyBlockMap];
      newFibAndEmptyBlockMap[droppableKey] = undefined;
      const newBlockTexts = [...answers[activeQuestionIndex]];
      newBlockTexts[droppableKey] = "";
      setFibAndEmptyBlockMap(newFibAndEmptyBlockMap);
      updateAnswers(activeQuestionIndex, newBlockTexts);
      // setBlockTexts(newBlockTexts)
    }
  };

  const onDrop = (e, emptyBlockindex) => {
    const { activeElementIndex } = activeDraggableElement;
    const newFibAndEmptyBlockMap = [...fibAndEmptyBlockMap];
    newFibAndEmptyBlockMap[emptyBlockindex] = activeElementIndex;
    const newBlockTexts = [...answers[activeQuestionIndex]];
    newBlockTexts[emptyBlockindex] =
      question.fibBlocksOptions[activeElementIndex].statement;
    updateAnswers(activeQuestionIndex, newBlockTexts);
    setFibAndEmptyBlockMap(newFibAndEmptyBlockMap);
    // setBlockTexts(newBlockTexts)
    setActiveDraggableElement({});
  };

  const isEmptyBlock = (currBlock, correctBlocks, answerType) => {
    let isEmpty = false;
    if (answerType === "RS") {
      correctBlocks.forEach((block) => {
        if (
          block.statement === currBlock.statement &&
          currBlock.correctPositions.includes(block.order)
        ) {
          isEmpty = true;
        }
      });
    } else if (answerType === "YS") {
      if (currBlock.position) {
        isEmpty = true;
      }
    }

    return isEmpty;
  };

  const getAnswers = (correctBlocks) => {
    const answers = [];
    correctBlocks.forEach((block) => {
      answers.push(block.statement);
    });

    return answers;
  };
  if (props.showOnlyAnswer) {
    return (
      <>
        <div
          className={cx(
            styles.terminalContainer,
            props.terminalAuto && styles.terminalContainerAuto,
            fromReportsPage && styles.fromReportsPageStyle
          )}
        >
          <SyntaxHighlighter
            language={
              question.questionLayoutType === "editor"
                ? props.language
                  ? props.language
                  : "python"
                : "text"
            }
            codeTagProps={{
              style: {
                fontFamily: `${withUpdatedDesign ? "Nunito" : "Monaco"}`,
              },
            }}
            style={darcula}
            customStyle={{
              ...(withUpdatedDesign ? updatedTerminalStyles : terminalStyles),
              ...(props.terminalAuto ? terminalStyleBottomPadding : {}),
            }}
            section="fibBlock"
            onDrop={onDrop}
            blockTexts={getAnswers(correctBlocks)}
            expandEmptyBlockIndex={expandEmptyBlockIndex}
            removeTextFromDroppable={removeTextFromDroppable}
            updateDropAreaCoordinates={updateDropAreaCoordinates}
            fibAndEmptyBlockMap={fibAndEmptyBlockMap}
          >
            {decodeURIComponent(question.answerCodeSnippet)}
          </SyntaxHighlighter>
        </div>
        <div
          className={
            isMobile ? styles.mbBlocksContainer : styles.blocksContainer
          }
        >
          {question.fibBlocksOptions.map((block, index) => {
            return (
              <Draggable
                id={block.id}
                index={index}
                fibAndEmptyBlockMap={fibAndEmptyBlockMap}
                onDragEnd={onDragEnd}
                updateDraggableCoordinates={updateDraggableCoordinates}
                statement={
                  !isEmptyBlock(block, correctBlocks, answerType) ||
                  block.order === undefined
                    ? block.statement
                    : ""
                }
                onDragCapture={onDragCapture}
                onDragStart={onDragStart}
                isSeeAnswers={isSeeAnswers}
                isSubmittedForReview={isSubmittedForReview}
                isEmptyBlock={
                  isEmptyBlock(block, correctBlocks, answerType) && block.order
                }
                withUpdatedDesign={withUpdatedDesign}
                isMobile={isMobile}
                fromChatbot={fromChatbot}
              />
            );
          })}
        </div>
      </>
    );
  }
  return (
    <div
      className={
        cx(isMobile ? styles.mbFibBlockContainer : styles.fibBlockContainer, fromReportsPage && styles.fromReportsPageStyle)
      }
    >
      {fromHomework ? (
        ""
      ) : (
        <span
          className={
            isMobile ? styles.mbQuestionStatement : styles.questionStatement
          }
        >
          <TekieCEParser
            value={question.statement}
            init={{ selector: `PQ-FibBlock_${question.Id}` }}
            legacyParser={(statement) => {
              return parseMetaTags({ statement, removeCodeTag: true });
            }}
          />
        </span>
      )}

      {withUpdatedDesign &&
        isSubmittedForReview &&
        questionStatus &&
        questionStatus.renderSection}
      {question.questionCodeSnippet && (
        <SyntaxHighlighter
          language={
            question.questionLayoutType === "editor"
              ? props.language
                ? props.language
                : "python"
              : "text"
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
                    (question.questionLayoutType && !fromChatbot) === "editor"
                      ? props.language
                        ? props.language
                        : "python"
                      : "text"
                  }
                  codeTagProps={{ style: { fontFamily: "Nunito" } }}
                  style={darcula}
                  section="fibBlock"
                  onDrop={() => {}}
                  customStyle={showAnswersTerminalStyles}
                  blockTexts={answers[activeQuestionIndex]}
                  fibCorrectOptions={getAnswers(
                    getCorrectBlocks(
                      actualQuestionAnswer.fibBlocksOptions,
                      "RS"
                    )
                  )}
                  expandEmptyBlockIndex={expandEmptyBlockIndex}
                  removeTextFromDroppable={() => {}}
                  updateDropAreaCoordinates={() => {}}
                  fibAndEmptyBlockMap={fibAndEmptyBlockMap}
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
                        ? props.language
                          ? props.language
                          : "python"
                        : "text"
                    }
                    codeTagProps={{ style: { fontFamily: "Nunito" } }}
                    style={darcula}
                    section="fibBlock"
                    onDrop={() => {}}
                    blockTexts={getAnswers(
                      getCorrectBlocks(
                        actualQuestionAnswer.fibBlocksOptions,
                        "RS"
                      )
                    )}
                    expandEmptyBlockIndex={expandEmptyBlockIndex}
                    removeTextFromDroppable={() => {}}
                    updateDropAreaCoordinates={() => {}}
                    fibAndEmptyBlockMap={fibAndEmptyBlockMap}
                    customStyle={{
                      ...showAnswersTerminalStyles,
                      backgroundColor: "transparent",
                    }}
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
        <>
          <div
            className={
              isMobile
                ? cx(
                    styles.mbTerminalContainer,
                    props.terminalAuto && styles.terminalContainerAuto
                  )
                : cx(
                    styles.terminalContainer,
                  props.terminalAuto && styles.terminalContainerAuto,
                    fromReportsPage && styles.fromReportsPageStyle
                  )
            }
          >
            <SyntaxHighlighter
              language={
                question.questionLayoutType === "editor" && !fromChatbot
                  ? props.language
                    ? props.language
                    : "python"
                  : "text"
              }
              codeTagProps={{
                style: {
                  fontFamily: `${withUpdatedDesign ? "Nunito" : "Monaco"}`,
                  fontSize: `${isMobile ? "16px" : ""}`,
                },
              }}
              style={darcula}
              customStyle={{
                ...(withUpdatedDesign ? updatedTerminalStyles : terminalStyles),
                ...(props.terminalAuto ? terminalStyleBottomPadding : {}),
              }}
              section="fibBlock"
              onDrop={onDrop}
              blockTexts={
                !isSeeAnswers
                  ? answers[activeQuestionIndex]
                  : getAnswers(correctBlocks)
              }
              expandEmptyBlockIndex={expandEmptyBlockIndex}
              removeTextFromDroppable={removeTextFromDroppable}
              updateDropAreaCoordinates={updateDropAreaCoordinates}
              fibAndEmptyBlockMap={fibAndEmptyBlockMap}
            >
              {decodeURIComponent(question.answerCodeSnippet)}
            </SyntaxHighlighter>
          </div>
          <div
            className={
              isMobile ? styles.mbBlocksContainer : styles.blocksContainer
            }
          >
            {question.fibBlocksOptions.map((block, index) => {
              return (
                <Draggable
                  id={block.id}
                  index={index}
                  fibAndEmptyBlockMap={fibAndEmptyBlockMap}
                  onDragEnd={onDragEnd}
                  updateDraggableCoordinates={updateDraggableCoordinates}
                  statement={
                    !isEmptyBlock(block, correctBlocks, answerType) ||
                    block.order === undefined
                      ? block.statement
                      : ""
                  }
                  onDragCapture={onDragCapture}
                  onDragStart={onDragStart}
                  isSeeAnswers={isSeeAnswers}
                  isSubmittedForReview={isSubmittedForReview}
                  isEmptyBlock={
                    isEmptyBlock(block, correctBlocks, answerType) &&
                    block.order
                  }
                  withUpdatedDesign={withUpdatedDesign}
                  isMobile={isMobile}
                  fromChatbot={fromChatbot}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default FibBlock;

//   <div>
//     <div key={'aa'}
//           onDragStart={(e) => onDragStart(e, 'drag')}
//           draggable
//           className="draggable"
//           style={{ width: '40px',height:'20px',backgroundColor: 'red' }}>
//           drag
//     </div>
//     <div className="droppable"
//         style={{padding:'30px',width:'50px',height:'40px',backgroundColor:'yellow'}}
//         onDragOver={(e) => onDragOver(e)}
//         onDrop={(e) => onDrop(e, "complete")}>
//         <span className="task-header">COMPLETED</span>
//     </div>
//   </div>
