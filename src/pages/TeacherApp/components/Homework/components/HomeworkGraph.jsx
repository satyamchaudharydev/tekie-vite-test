import React, { useState, useEffect } from "react";
import "./HomeworkGraph.scss";
// import Chart from "react-apexcharts";
import LearningIcon from "../../../../../assets/teacherApp/classroom/learning.svg";
import FileIcon from "../../../../../assets/teacherApp/classroom/file-text (1).svg";
import getHomeworkTitle from "../../../../../queries/teacherApp/getTopicData";
import { get } from "lodash";
import { Doughnut } from "react-chartjs-2";
import {
  AttemptingIcon,
  CompletedIcon,
  UnattemptedIcon,
} from "../../../../../constants/icons";

function HomeworkGraph({
  propsRedux,
  setIdTopic,
  setTopicComponentRule,
  setUserArray,
  idTopic,
  batchId,
  setSessionStatusHandle,
}) {
  const { selectHomeworkTitle, homeworkStudentsData } = propsRedux;
  const [quizCount, setQuizCount] = useState("none");
  const [codeCount, setCodeCount] = useState("none");
  const newDataArray = selectHomeworkTitle && selectHomeworkTitle.toJS();
  const newUserArray = get(newDataArray[0], "classroomHomework.students", []);
  const newArray = get(newDataArray[0], "sessions", []);
  const finalData = newArray.filter(
    (item) => item.documentType === "batchSession"
  );
  const totalStudents = homeworkStudentsData.toJS();
  const totalAttemptedStudentsArray = totalStudents.filter(
    (item) => get(item, "isSubmittedForReview", []) == true
  ).length;
  const totalAttemptingStudentsArray = totalStudents.filter(
    (item) =>
      get(item, "isAssignmentSubmitted", []) == true ||
      get(item, "isQuizSubmitted", []) == true ||
      get(item, "isPracticeSubmitted", []) == true
  ).length;
  const totalUnAttemptedStudentsArray = totalStudents.filter(
    (item) =>
      get(item, "isAssignmentSubmitted", []) == false &&
      get(item, "isQuizSubmitted", []) == false &&
      get(item, "isPracticeSubmitted", []) == false
  ).length;
  const attemptedGraphValue =
    totalStudents.length - totalUnAttemptedStudentsArray;
  const attemptingGraphValue =
    totalStudents.length -
    totalAttemptedStudentsArray -
    totalUnAttemptedStudentsArray;
  const unAttemptedGraphValue =
    totalStudents.length - totalAttemptedStudentsArray;
  const sessionStatus = get(newArray[0], "sessionStatus", "");

  // const optionsObject = {

  //   colors: ['#01AA93', '#FF5744', '#EEEEEE'],
  //   labels: ["Completed", "Attempted", "Unattempted"],
  //   legend: {
  //     position: "right",

  //   },
  //   plotOptions: {
  //     pie: {
  //       expandOnClick: false,
  //       donut: {
  //         labels: {
  //           show: true,
  //           name: {
  //             show: true,
  //             fontSize: "12px"
  //           },
  //           value: {
  //             show: true,
  //             fontSize: "12px",
  //             formatter: function (value) {
  //               return value + "%"
  //             }
  //           }
  //         }
  //       }
  //     }
  //   },
  //   dataLabels: {
  //     enabled: false,

  //     style: {
  //       colors: ['#F44336', '#E91E63', '#9C27B0']
  //     }

  //   }
  // }

  const wow = {
    datasets: [
      {
        data: [
          attemptedGraphValue,
          attemptingGraphValue,
          unAttemptedGraphValue,
        ],
        backgroundColor: ["#01AA93", "#FF5744", "#EEEEEE"],
      },
    ],
    labels: ["Attempted", "Attempting", "Unattempted"],
  };
  const chartConfig = {
    plugins: { legend: { display: false } },
    elements: { arc: { borderWidth: 0 } },
    cutout: 60,
  };

  // const series = [attemptedGraphValue, attemptingGraphValue, unAttemptedGraphValue]
  // const [options, setOptions] = useState(optionsObject)
  // const value = useRef()
  const selected = document.querySelector(".selected");
  const optionsContainer = document.querySelector(".options-container");
  const [opacity, setOpacity] = useState(true);

  function clicker(e, item) {
    selected.innerText = e.target.innerText;
    optionsContainer.classList.remove("active5");
    setOpacity((val) => !val);
    setQuizCount(get(item, "topic.questionsQuizCount", ""));
    setCodeCount(get(item, "topic.topicAssignmentQuestionsCount", ""));
    setIdTopic(get(item, "topic.id"));
    setTopicComponentRule(get(item, "topic.topicComponentRule", []));
  }

  function EmptyStateTopic() {
    return (
      <>
        <div className="empty_state_1">No topics available</div>
      </>
    );
  }

  useEffect(() => {
    getHomeworkTitle(batchId);
  }, []);

  useEffect(() => {
    if (newUserArray.length > 0) {
      setUserArray(newUserArray);
    }
  }, [newUserArray.length]);

  useEffect(() => {
    setTopicComponentRule(get(finalData[0], "topic.topicComponentRule", []));
    setSessionStatusHandle(sessionStatus);
  }, [finalData.length]);

  return (
    <>
      <section class="homework_graph_container">
        <div class="homework_graph_text_section">
          <div class="homework_title">HOMEWORK</div>
          {finalData.length == 0 ? (
            <EmptyStateTopic />
          ) : (
            <>
              <div>
                <div class="container">
                  <div class="select-box">
                    <div class="options-container">
                      {finalData.map((item) => (
                        <>
                          <div onClick={(e) => clicker(e, item)} class="option">
                            <input
                              type="radio"
                              class="radio"
                              id="film"
                              name="category"
                            />
                            {get(item, "topic.title", "")}
                          </div>
                        </>
                      ))}
                    </div>

                    <div
                      onClick={() => {
                        optionsContainer.classList.toggle("active5");
                        setOpacity((val) => !val);
                      }}
                      style={{ border: "2px solid #aaaaaa" }}
                      class="selected"
                    >
                      {get(finalData[0], "topic.title", "")}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={opacity ? { opacity: "1" } : { opacity: "0" }}
                class="homework_quiz_code "
              >
                <div class="quiz_count_container">
                  <div class="quiz_count_image">
                    <img src={LearningIcon} />
                    Quiz
                  </div>
                  <div class="quiz_code_value">
                    {quizCount === "none"
                      ? get(finalData[0], "topic.questionsQuizCount", "")
                      : quizCount}
                  </div>
                </div>

                <div class="code_count_container">
                  <div class="code_count_image">
                    <img src={FileIcon} />
                    Code
                  </div>
                  <div class="quiz_code_value">
                    {codeCount === "none"
                      ? get(
                          finalData[0],
                          "topic.topicAssignmentQuestionsCount",
                          ""
                        )
                      : codeCount}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div class="homework_graph_image_section">
            <Doughnut data={wow} options={chartConfig} />
          </div>
          <div className="label_container_section">
            <div className="label_container_section_1">
              <span>
                <CompletedIcon />
              </span>{" "}
              Completed
            </div>
            <div className="label_container_section_1">
              <span>
                <UnattemptedIcon />
              </span>{" "}
              Attempted
            </div>
            <div className="label_container_section_1">
              <span>
                <AttemptingIcon />
              </span>{" "}
              Unattempted
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomeworkGraph;
