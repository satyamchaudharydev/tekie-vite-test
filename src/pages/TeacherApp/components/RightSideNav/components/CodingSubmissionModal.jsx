import React, { useState, useEffect } from "react";
import "./CodingSubmissionModal.scss";
import SyntaxHighlighter from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { get } from "lodash";
import TekieCEParser from "../../../../../components/Preview/Preview";
import { isEmpty, get as getFromLoadash, sortBy, truncate } from "lodash";
import hs from "../../../../../utils/scale";
import Editor from "../../../../Editor/EditorPage";

function CodingSubmissionModal({ values, setModalOpen }) {
  const [clicked, setClicked] = useState();
  const withUpdatedDesign = false;

  const newSideNavStudentDatas = get(
    values,
    "fetchSideNavIndividualDetail",
    []
  );
  //   console.log(newSideNavStudentDatas.toJS(), "newSideNavStudentDatas");

  const newSideNavCodingQuestion = get(
    values,
    "fetchSideNavCodingQuestion",
    []
  );
  const newCodingQuestionsData = newSideNavCodingQuestion.toJS();
  const newCodingQuestionsData1 = newSideNavCodingQuestion.toJS();
  const [count, setCount] = useState(newCodingQuestionsData1.length);
  const [questionCount, setQuestionCount] = useState(1);

  //  console.log(count, "count");
  //  console.log(newCodingQuestionsData1, "newCodingQuestionsData1");

  useEffect(() => {
    setCount(newCodingQuestionsData1.length);
  }, [newCodingQuestionsData1.length]);

  useEffect(() => {
    if (count > newCodingQuestionsData1.length) {
      setCount(newCodingQuestionsData1.length);
    }
    if (count === 0) {
      setCount(1);
    }
  }, [count]);

  const terminalStyles = {
    minHeight: hs("59"),
    objectFit: "contain",
    borderRadius: hs("3"),
    backgroundColor: "#013d4e",
  };

  const getString = (string) => {
    try {
      if (!string) return "";
      return decodeURIComponent(string);
    } catch (e) {
      try {
        return decodeURIComponent(
          string.replace("%", "~~~~percent~~~~")
        ).replace("~~~~percent~~~~", "%");
      } catch (e) {
        return string;
      }
    }
  };

  const newCodingArray = [];
  const percentageFinder = (item) => {
    const checkerArray = newCodingArray.find(
      (question) => question.questionId === get(item, "id", "")
    );

    if (newCodingArray.length > 0 && checkerArray) {
      return checkerArray.percentageCorrect;
    } else {
      return 0;
    }
  };
  const colorFinder = (item) => {
    const arrayItem = newCodingArray.find(
      (question) => question.questionId === get(item, "id", "")
    );

    if (newCodingArray.length > 0 && arrayItem) {
      if (
        arrayItem.percentageCorrect >= 0 &&
        arrayItem.percentageCorrect < 50
      ) {
        return { background: "#ff5744" };
      }
      if (
        arrayItem.percentageCorrect >= 50 &&
        arrayItem.percentageCorrect <= 70
      ) {
        return { background: "#faad14" };
      }
      if (
        arrayItem.percentageCorrect >= 70 &&
        arrayItem.percentageCorrect <= 100
      ) {
        return { background: "#01aa93" };
      }
    }

    return { display: "none" };
  };

  function toggle(index) {
    if (clicked === index) {
      return setClicked(null);
    }
    setClicked(index);
  }

  function questionCountFinder(value10) {
    const value11 = newCodingQuestionsData1.findIndex(
      (item) => item.id === value10.id
    );
    return value11 + 1;
  }

  return (
    <>
      <div className="coding__submission__modal__container">
        <div
          style={{ cursor: "pointer" }}
          className="coding__submission__modal__cross"
          onClick={() => setModalOpen(false)}
        >
          <CloseIcon />
        </div>

        <div className="coding__submission__modal__main__container">
          <div className="modal__student__name__section">
            <div>
              <span className="student__number">415</span>
              <span className="student__name">Naruto</span>
              <span className="student__submission__time">2 mins ago</span>
            </div>
            <div>
              <span
                onClick={() => setCount((value) => value + 1)}
                style={{
                  cursor:
                    count === newCodingQuestionsData1.length
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <ArrowForward />
              </span>
              <span
                style={{
                  cursor: count === 1 ? "not-allowed" : "pointer",
                  marginLeft: "30px",
                }}
                onClick={() => setCount((value) => value - 1)}
              >
                <ArrowBackward />
              </span>
            </div>
          </div>
          <div className="modal__question__section">
            <div className="quiz__all__questions__main__container">
              {newCodingQuestionsData
                .filter(
                  (item, index) =>
                    index === newCodingQuestionsData1.length - count
                )
                .map((item, index) => (
                  <div
                    onClick={() => toggle(index, item)}
                    style={{
                      background: clicked === index ? "#f3effa" : "#fffffd",
                    }}
                    className="senior__container"
                  >
                    <div className="quiz__all__questions__section__coding">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "98%",
                          paddingLeft: "20px",
                        }}
                      >
                        <span style={{ width: "110px" }}>
                          Question {questionCountFinder(item)}:{" "}
                        </span>
                        <div className="quiz__all__questions__text">
                          <TekieCEParser
                            value={item.statement}
                            useNativeHtmlParser
                            truncateText={125}
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
                            className="quiz__all__questions__tag_b"
                          >
                            {`${percentageFinder(item)}%`} Submitted
                          </div>
                        </div>
                        <div
                          style={{
                            transform:
                              clicked === index ? "rotate(180deg)" : "",
                          }}
                          className="quiz__all__icon"
                        >
                          <DropdownIcon />
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        justifyContent: "start",
                        alignItems: "flex-start",
                        display: "flex",
                        position: "relative",
                        background: "#FFFFFF",
                      }}
                    >
                      <div className="codeEditor__homework__review">
                        {clicked === index && item.questionCodeSnippet && (
                          <div>
                            <div style={{ padding: "30px 0px" }}>
                              <SyntaxHighlighter
                                language={
                                  item.editorMode === null ? "text" : "python"
                                }
                                codeTagProps={{
                                  style: {
                                    fontFamily: `${withUpdatedDesign &&
                                      "Monaco"}`,
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
                            <div style={{ height: "400px" }}>
                              <Editor
                                editorMode={get(item, "editorMode", "")}
                                type="assignment"
                                outputTitleBg="skyBlue"
                                codeString={item.answerCodeSnippet}
                                onOutputClick={() => {}}
                                key={get(item, "id", "")}
                                editorKey={get(item, "id", "")}
                                lineHeight={`30`}
                                index={index}
                                arrowStyle={{
                                  top: 15,
                                  marginRight: 10,
                                }}
                                interpretorStyle={{
                                  marginLeft: 16,
                                }}
                                answerCodeSnippet={
                                  item.answerCodeSnippet &&
                                  item.answerCodeSnippet !== "null"
                                    ? getString(item.answerCodeSnippet)
                                    : ""
                                }
                                onChange={() => {}}
                                newFlow={true}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CodingSubmissionModal;

const ArrowForward = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M16.1705 4.4545C15.7312 4.01517 15.0188 4.01517 14.5795 4.4545L7.8295 11.2045C7.39017 11.6438 7.39017 12.3562 7.8295 12.7955L14.5795 19.5455C15.0188 19.9848 15.7312 19.9848 16.1705 19.5455C16.6098 19.1062 16.6098 18.3938 16.1705 17.9545L10.216 12L16.1705 6.0455C16.6098 5.60616 16.6098 4.89384 16.1705 4.4545Z"
      fill="#504F4F"
    />
  </svg>
);
const ArrowBackward = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M7.8295 4.4545C8.26884 4.01517 8.98116 4.01517 9.4205 4.4545L16.1705 11.2045C16.6098 11.6438 16.6098 12.3562 16.1705 12.7955L9.4205 19.5455C8.98116 19.9848 8.26884 19.9848 7.8295 19.5455C7.39017 19.1062 7.39017 18.3938 7.8295 17.9545L13.784 12L7.8295 6.0455C7.39017 5.60616 7.39017 4.89384 7.8295 4.4545Z"
      fill="#504F4F"
    />
  </svg>
);

const DropdownIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M4.45463 7.8295C4.89397 7.39017 5.60628 7.39017 6.04562 7.8295L12.0001 13.784L17.9546 7.8295C18.394 7.39017 19.1063 7.39017 19.5456 7.8295C19.985 8.26884 19.985 8.98116 19.5456 9.4205L12.7956 16.1705C12.3563 16.6098 11.644 16.6098 11.2046 16.1705L4.45463 9.4205C4.01529 8.98116 4.01529 8.26884 4.45463 7.8295Z"
      fill="#333333"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.2187 9.99885L14.6304 6.58718C14.7923 6.42555 14.8834 6.20622 14.8836 5.97743C14.8838 5.74865 14.7931 5.52916 14.6314 5.36724C14.4698 5.20532 14.2505 5.11425 14.0217 5.11404C13.7929 5.11384 13.5734 5.20453 13.4115 5.36616L9.99983 8.77783L6.58816 5.36616C6.42624 5.20425 6.20663 5.11328 5.97765 5.11328C5.74866 5.11328 5.52906 5.20425 5.36714 5.36616C5.20522 5.52808 5.11426 5.74769 5.11426 5.97667C5.11426 6.20566 5.20522 6.42526 5.36714 6.58718L8.77881 9.99885L5.36714 13.4105C5.20522 13.5724 5.11426 13.792 5.11426 14.021C5.11426 14.25 5.20522 14.4696 5.36714 14.6315C5.52906 14.7935 5.74866 14.8844 5.97765 14.8844C6.20663 14.8844 6.42624 14.7935 6.58816 14.6315L9.99983 11.2199L13.4115 14.6315C13.5734 14.7935 13.793 14.8844 14.022 14.8844C14.251 14.8844 14.4706 14.7935 14.6325 14.6315C14.7944 14.4696 14.8854 14.25 14.8854 14.021C14.8854 13.792 14.7944 13.5724 14.6325 13.4105L11.2187 9.99885Z"
      fill="#333333"
    />
  </svg>
);
