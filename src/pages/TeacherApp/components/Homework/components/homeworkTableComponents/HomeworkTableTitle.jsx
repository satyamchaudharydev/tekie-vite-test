import React, { useEffect, useState } from "react";
import "./HomeworkTableTitle.scss";
// import DataTable from "../../../../SchoolDashboard/components/DataTable/DataTable"
import StudentReviewModal from "../../../Classroom/ClasroomDetail/components/ClassModal/StudentReviewModal";
import DataTable from "../../../../../SchoolDashboard/components/DataTable/DataTable";
import ArrowImage from "../../../../../../assets/teacherApp/classroom/arrow-forward-outline.svg";
import Arrow from "../../../../../../assets/teacherApp/classroom/Group 16452.svg";
import Code from "../../../../../../assets/teacherApp/classroom/Group 16678.svg";
import grayCode from "../../../../../../assets/teacherApp/classroom/Group 16775.svg";
import QuizImage from "../../../../../../assets/teacherApp/classroom/Qyuz Status.svg";
import ShareIcon from "../../../../../../assets/teacherApp/classroom/Component 29.svg";
import AttemptedIcon from "../../../../../../assets/teacherApp/classroom/Doublw Check.svg";
import AttemptingIcon from "../../../../../../assets/teacherApp/classroom/Timer (1).svg";
import unAttemptedIcon from "../../../../../../assets/teacherApp/classroom/Warning.svg";
import grayArrow from "../../../../../../assets/teacherApp/classroom/grayArrow.svg";
import messageIcon from "../../../../../../assets/teacherApp/classroom/message-square (1).svg";
import commentIcon from "../../../../../../assets/teacherApp/classroom/Vector (1).svg";
import { get } from "lodash";
import { isThisMinute } from "date-fns";
import { MessageIcon } from "../../../../../../constants/icons"

function HomeworkTableTitleComponent({
  value,
  topicComponentRule,
  searchTerm,
  sortName,
  filterName,
  idTopic,
  setSelectStudent,
  setClicked,
  setOpenModal,
  startingValue,
  setSelectedStudent,
  setFirstStudent,
  setCurrentStudentObject,
}) {
  const allQuizAnswer =
    value.allStudentsQuizAnswers && value.allStudentsQuizAnswers.toJS();
const allQuizStatus = value.allStudentsQuizAnswersFetchStatus && value.allStudentsQuizAnswersFetchStatus.toJS()
const newData = value.homeworkStudentsData.toJS() 
  function quizAnswerChecker(studentAnswer) {

    const allQuizAnswer1 =
    value.allStudentsQuizAnswers && value.allStudentsQuizAnswers.toJS();

    const singleStudentQuizAnswer = allQuizAnswer1.find(
      (item) =>
        get(item, "user.id", "") ===
        get(studentAnswer, "homeworkStudentsName.user.id")
    );
        
    const totalQuestions = get(singleStudentQuizAnswer, "quizAnswers", []);
    const correctQuestionArray = [];
    
    function quizTotalQuestionCorrectChecker() {
      for (let index = 0; index < totalQuestions.length; index++) {
        const element = totalQuestions[index];
        if (element.isCorrect) {
          correctQuestionArray.push(element);
        }
      }
    }
    quizTotalQuestionCorrectChecker();

    return `${correctQuestionArray.length} / ${totalQuestions.length}`;
  }

  const allStudentSelectColumns1 = [
    {
      title: "Roll no.",
      key: "id",
    },
    {
      title: "Student Name",
      key: "studentname",
      render: (value) => {
        return (
          <>
            <div class="session_name_HomeworkTable">{value}</div>
          </>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      render: (value) => {
        return (
          <>
            <div
              class={
                value === "completed"
                  ? "attempted"
                  : value === "attempting"
                  ? "attempting"
                  : value === "UN-ATTEMPTED"
                  ? "unattempted"
                  : ""
              }
            >
              <img
                class="homework_image_icon"
                src={
                  value === "completed"
                    ? AttemptedIcon
                    : value === "attempting"
                    ? AttemptingIcon
                    : value === "UN-ATTEMPTED"
                    ? unAttemptedIcon
                    : ""
                }
              />
              {value !== "UN-ATTEMPTED" ? value.toUpperCase() : value}
            </div>
          </>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (action) => {
        const value = get(action, "homeworkStudentsName", "");
        return (
          <>
            <div
              onClick={() => {
                setClicked(false);
                setSelectStudent(get(value, "user", {}));
                setFirstStudent(false);
                setCurrentStudentObject(action);
              }}
              class="action"
            >
              View Details
              <hr className="hr_style" />
            </div>
          </>
        );
      },
    },
    idTopic !== "" && {
      title: <img src={commentIcon} />,
      key: "comment",
      render: (prop) => {
        return (
          <>
            <div style={{cursor:"pointer"}} onClick={() => giveFeedback(prop)}>
              
              <img src={ShareIcon} />
            </div>
          </>
        );
      },
    },
  ];

  const giveFeedback = (prop) => {
    setSelectedStudent(prop);
    setOpenModal(true);
  };

  const [allStudentSelectColumns, setAllStudentSelectColumns] = useState([]);
  const tableData = newData
    .filter((val) => {
      if (searchTerm == "") {
        return val;
      } else if (
        get(val, "homeworkStudentsName.user.name", "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ) {
        return val;
      }
    })
    .sort(function(a, b) {
      const newName1 = get(a, "homeworkStudentsName.user.name", "");
      const newName2 = get(b, "homeworkStudentsName.user.name", "");

      if (sortName === "ascending") {
        if (newName1 < newName2) {
          return -1;
        }
        if (newName1 > newName2) {
          return 1;
        }
      }
      if (sortName === "descending") {
        if (newName1 > newName2) {
          return -1;
        }
        if (newName1 < newName2) {
          return 1;
        }
      }
      return 0;
    })
    .filter((val) => {
      if (filterName == "") {
        return val;
      }
      if (filterName == "Attempted") {
        if (get(val, "isSubmittedForReview", "") == true) return val;
      }
      if (filterName == "Unattempted") {
        if (
          get(val, "isQuizSubmitted", "") == false &&
          get(val, "isPracticeSubmitted", "") == false &&
          get(val, "isAssignmentSubmitted") == false
        )
          return val;
      }
      if (filterName == "Attempting") {
        if (
          get(val, "isQuizSubmitted", "") == true ||
          get(val, "isPracticeSubmitted", "") == true ||
          get(val, "isAssignmentSubmitted") == true
        )
          return val;
      }
    })
    .map((item, index) => ({
      id: index + 1,
      studentname: get(item, "homeworkStudentsName.user.name", ""),
      status: status(item),
      quiz: item,
      arrow1: get(item, "isQuizSubmitted", ""),
      code: get(item, "isAssignmentSubmitted", ""),
      arrow2: get(item, "isAssignmentSubmitted", ""),
      practice: get(item, "isPracticeSubmitted", ""),
      action: item,
      comment: (get(item, 'homeworkStudentsName', "")),
    }));

  function status(item) {
    let status;
    if (get(item, "isSubmittedForReview", "") === true) {
      status = "completed";
    } else if (
      get(item, "isQuizSubmitted", "") == true ||
      get(item, "isPracticeSubmitted", "") == true ||
      get(item, "isAssignmentSubmitted") == true
    ) {
      status = "attempting";
    } else {
      status = "UN-ATTEMPTED";
    }
    return status;
  }

  function callQuiz() {
    const quizColumnObject = {
      title: "Quiz",
      key: "quiz",
      render: (quizBoolean) => (
        <>
          <div>
            
            {get(quizBoolean, "isQuizSubmitted", "") === true ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <img src={Code} />
                <div
                  style={{
                    height: "20px",
                    position: "relative",
                    left: "-26.5px",
                    top: "5px",
                    fontSize: "10px",
                    color: "white",
                  }}
                >
                  {quizAnswerChecker(quizBoolean)}
                </div>
              </div>
            ) : (
              <img src={QuizImage} />
            )}
          </div>
        </>
      ),
    };

    const arrowQuizObject = {
      title: " ",
      key: "arrow1",
      render: (quizBoolean) => {
        return (
          <>
            <div class="arrow_quiz">
              {quizBoolean ? <img src={ArrowImage} /> : <img src={grayArrow} />}
            </div>
          </>
        );
      },
    };
    const codeColumnObject = {
      title: "Code",
      key: "code",
      render: (codeBoolean) => {
        return (
          <>{codeBoolean ? <img src={Arrow} /> : <img src={grayCode} />}</>
        );
      },
    };

    const arrowCodeObject = {
      title: " ",
      key: "arrow2",
      render: (codeBoolean) => {
        return (
          <>
            <div>
              {codeBoolean ? <img src={ArrowImage} /> : <img src={grayArrow} />}
            </div>
          </>
        );
      },
    };
    const practiceColumnObject = {
      title: "Practice",
      key: "practice",
      render: (codeBoolean) => {
        return (
          <>{codeBoolean ? <img src={Arrow} /> : <img src={grayCode} />}</>
        );
      },
    };

    let newDynamicTable = allStudentSelectColumns1;

    if (
      topicComponentRule.filter((e) => e.componentName === "quiz").length > 0 &&
      newDynamicTable.filter((item) => item.title == "Quiz").length == 0
    ) {
      if (
        topicComponentRule.filter(
          (e) => e.componentName == "homeworkAssignment"
        ).length == 0 &&
        topicComponentRule.filter((e) => e.componentName === "homeworkPractice")
          .length == 0
      ) {
        const value = newDynamicTable;
        value.splice(3, 0, quizColumnObject);
        newDynamicTable = value;
      }
      if (
        topicComponentRule.filter(
          (e) => e.componentName === "homeworkAssignment"
        ).length > 0 ||
        topicComponentRule.filter((e) => e.componentName === "homeworkPractice")
          .length > 0
      ) {
        const value = newDynamicTable;
        value.splice(3, 0, quizColumnObject, arrowQuizObject);
        newDynamicTable = value;
      }
    }

    if (
      topicComponentRule.filter((e) => e.componentName === "homeworkAssignment")
        .length > 0 &&
      newDynamicTable.filter((item) => item.title == "Code").length == 0
    ) {
      if (
        newDynamicTable.filter((item) => item.title == "Quiz").length == 0 &&
        topicComponentRule.filter((e) => e.componentName == "homeworkPractice")
          .length == 0
      ) {
        const value = newDynamicTable;
        value.splice(3, 0, codeColumnObject);
        newDynamicTable = value;
      }
      if (
        newDynamicTable.filter((item) => item.title == "Quiz").length > 0 &&
        topicComponentRule.filter((e) => e.componentName == "homeworkPractice")
          .length == 0
      ) {
        const value = newDynamicTable;
        value.splice(5, 0, codeColumnObject);
        newDynamicTable = value;
      }
      if (
        newDynamicTable.filter((item) => item.title == "Quiz").length == 0 &&
        topicComponentRule.filter((e) => e.componentName === "homeworkPractice")
          .length > 0
      ) {
        const value = newDynamicTable;
        value.splice(3, 0, codeColumnObject, arrowCodeObject);
        newDynamicTable = value;
      }
      if (
        newDynamicTable.filter((item) => item.title == "Quiz").length > 0 &&
        topicComponentRule.filter((e) => e.componentName === "homeworkPractice")
          .length > 0
      ) {
        const value = newDynamicTable;
        value.splice(5, 0, codeColumnObject, arrowCodeObject);
        newDynamicTable = value;
      }
    }
    if (
      topicComponentRule.filter((e) => e.componentName === "homeworkPractice")
        .length > 0 &&
      newDynamicTable.filter((item) => item.title == "Practice").length == 0
    ) {
      if (
        newDynamicTable.filter((item) => item.title == "Quiz").length == 0 &&
        topicComponentRule.filter(
          (e) => e.componentName == "homeworkAssignment"
        ).length == 0
      ) {
        const value = newDynamicTable;
        value.splice(3, 0, practiceColumnObject);
        newDynamicTable = value;
      }
      if (
        newDynamicTable.filter((item) => item.title == "Quiz").length > 0 &&
        topicComponentRule.filter(
          (e) => e.componentName == "homeworkAssignment"
        ).length == 0
      ) {
        const value = newDynamicTable;
        value.splice(5, 0, practiceColumnObject);
        newDynamicTable = value;
      }
      if (
        newDynamicTable.filter((item) => item.title == "Quiz").length == 0 &&
        topicComponentRule.filter(
          (e) => e.componentName === "homeworkAssignment"
        ).length > 0
      ) {
        const value = newDynamicTable;
        value.splice(5, 0, practiceColumnObject);
        newDynamicTable = value;
      }
      if (
        newDynamicTable.filter((item) => item.title == "Quiz").length > 0 &&
        topicComponentRule.filter(
          (e) => e.componentName === "homeworkAssignment"
        ).length > 0
      ) {
        const value = newDynamicTable;
        value.splice(7, 0, practiceColumnObject);
        newDynamicTable = value;
      }
    }
    setAllStudentSelectColumns(newDynamicTable);
  }

//   console.log(idTopic ,"idTopic hai ye")

  useEffect(() => {
    callQuiz();

    
  }, [
    topicComponentRule,
    allStudentSelectColumns.length,
    startingValue,
    idTopic,
    allQuizAnswer.length,
    get(allQuizStatus,"loading","")
  ]);

  return (
    <>
      <DataTable
        columns={allStudentSelectColumns}
        tableData={tableData}
        tableHeight="60vh"
        homework={true}
      />
    </>
  );
}

export default HomeworkTableTitleComponent;