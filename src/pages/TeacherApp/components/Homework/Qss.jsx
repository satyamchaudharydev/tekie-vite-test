import React, { useState, useEffect } from "react";
import "./HomeworkPage.scss";
import HomeworkGraph from "./components/HomeworkGraph";
import HomeworkSelectStudent from "./components/HomeworkSelectStudent";
import HomeworkTable from "./components/HomeworkSelectTable";
import QuizComponent from "./components/HomeworkCollapsible";
import Course from "../Classroom/ClasroomDetail/components/CourseDetail/Course";
import TabSwitch from "./components/TabSwitch.js";
import CoursesPage from "../Courses/courses";
import RecordingPage from "../Recordings";
import getHomework from "../../../../queries/teacherApp/fetchHomeworkData";
import { get } from "lodash";
import { useLocation } from "react-router-dom";
import "./components/HomeworkSelectStudent.scss";
import fetchAllStudentQuizAnswer from "../../../../queries/teacherApp/fetchAllQuizAnswer";

function Homes({
  props,
  route,
  sessions,
  loggedInUser,
  reviewStatus,
  classroomTitle,
  mentorName,
  clicker,
}) {
  const { selectHomeworkTitle } = props;
  const { allStudentsQuizAnswers } = props;
  const newDataArray = selectHomeworkTitle && selectHomeworkTitle.toJS();
  const newArray = get(newDataArray[0], "sessions", []);
  const finalData = newArray.filter(
    (item) => item.documentType === "batchSession"
  );
  const newStudentUserArray1 = [];
  const newStudentUserArray = get(
    newDataArray[0],
    "classroomHomework.students",
    []
  );
  const startTopicSelected = get(finalData[0], "topic.id", "3");
  const courseIdDetail = get(newDataArray[0], "classroomCourse.id", "1");
  const [clicked, setClicked] = useState(true);
  // const [route, setRoute] = useState("Courses")
  const [idTopic, setIdTopic] = useState(startTopicSelected);
  const [userArray, setUserArray] = useState(newStudentUserArray1);
  const [topicComponentRule, setTopicComponentRule] = useState([]);
  const [selectStudent, setSelectStudent] = useState({});
  const { search } = useLocation();
  const batchIdFromQuery = new URLSearchParams(search).get("id");
  const [sessionStatusHandle, setSessionStatusHandle] = useState("");
  const [firstStudent, setFirstStudent] = useState(false);
  const [currentStudentObject, setCurrentStudentObject] = useState({});
  const dataSelectStudentsNameDetail = props.selectHomeworkTitle.toJS();
  const newDataSelectStudentsNameDetail = get(
    dataSelectStudentsNameDetail[0],
    "classroomHomework.students",
    []
  );
  const firstNewStudent = get(newDataSelectStudentsNameDetail[0], "user", {});

  for (let index = 0; index < newStudentUserArray.length; index++) {
    const element = newStudentUserArray[index];
    newStudentUserArray1.push(element.user.id);
  }

  function EmptySessionHomeworkHandle() {
    return (
      <>
        <div className="empty_session_handle">
          <span>Student has not attempted the homework yet </span>
        </div>
      </>
    );
  }

  useEffect(() => {
    getHomework(idTopic, userArray);
  }, [
    idTopic,
    selectStudent,
    startTopicSelected,
    finalData.length,
    selectHomeworkTitle,
  ]);

  const studentsId =
    props.homeworkStudentsData && props.homeworkStudentsData.toJS();

  useEffect(() => {
    setIdTopic(startTopicSelected);
  }, [startTopicSelected, finalData.length, selectHomeworkTitle]);

  useEffect(() => {
    fetchAllStudentQuizAnswer(idTopic, studentsId);
  }, [idTopic, studentsId.length]);

  return (
    <>
      <HomeworkGraph
        propsRedux={props}
        idTopic={idTopic}
        setIdTopic={setIdTopic}
        setTopicComponentRule={setTopicComponentRule}
        setUserArray={setUserArray}
        userArray={userArray}
        batchId={batchIdFromQuery}
        setSessionStatusHandle={setSessionStatusHandle}
      />
      <HomeworkSelectStudent
        propsRedux={props}
        clicked={clicked}
        setClicked={setClicked}
        setSelectStudent={setSelectStudent}
        setUserArray={setUserArray}
        setFirstStudent={setFirstStudent}
        firstStudent={firstStudent}
        selectStudent={selectStudent}
        setCurrentStudentObject={setCurrentStudentObject}
      />
      <div style={clicked ? { opacity: "1" } : { display: "none" }}>
        <HomeworkTable
          reviewStatus={reviewStatus}
          mentorName={mentorName}
          classroomTitle={classroomTitle}
          loggedInUser={loggedInUser}
          sessions={sessions}
          propsRedux={props}
          value={props}
          topicComponentRule={topicComponentRule}
          setSelectStudent={setSelectStudent}
          selectStudent={selectStudent}
          idTopic={idTopic}
          startingValue={startTopicSelected}
          setClicked={setClicked}
          sessionStatusHandle={sessionStatusHandle}
          setFirstStudent={setFirstStudent}
          setCurrentStudentObject={setCurrentStudentObject}
        />
      </div>
      <div style={!clicked ? { opacity: "1" } : { display: "none" }}>
        {get(currentStudentObject, "isSubmittedForReview", "") ? (
          <QuizComponent
            topicId={idTopic}
            courseId={courseIdDetail}
            userId={selectStudent.id ? selectStudent.id : firstNewStudent.id}
          />
        ) : (
          <EmptySessionHomeworkHandle />
        )}
      </div>
    </>
  );
}

export default Homes;
