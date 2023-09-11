import React, { useEffect, useRef, useState } from "react";
import { get } from "lodash";
import DropdownIcon from "../../../../../assets/teacherApp/classroom/down-arrow22.svg";
import IconCheck from "../../../../../assets/teacherApp/classroom/Vector.svg";

import "./HomeworkSelectStudent.scss";
function HomeworkSelectStudent({
  setClicked,
  propsRedux,
  setSelectStudent,
  clicked,
  setFirstStudent,
  firstStudent,
  selectStudent,
  setCurrentStudentObject,
}) {
  const selected1 = document.querySelector(".selected1");
  const optionsContainer1 = document.querySelector(".options-container1");
  const dataSelectStudentsNameDetail = propsRedux.selectHomeworkTitle.toJS();
  const newDataSelectStudentsNameDetail = get(
    dataSelectStudentsNameDetail[0],
    "classroomHomework.students",
    []
  );
  const firstNewStudent = get(newDataSelectStudentsNameDetail[0], "user", {});
  const qwerty =
    propsRedux.homeworkStudentsData && propsRedux.homeworkStudentsData.toJS();
  // console.log(qwerty,"qpqskndwndnwnxkscln[q]")
  const [dropArrow, setDropArrow] = useState(false);
  function EmptyStudentState() {
    return (
      <>
        <div className="empty_state">No students available</div>
      </>
    );
  }

  function filterChecker(total) {
    const newQueryData = qwerty.filter(
      (item) =>
        get(item, "homeworkStudentsName.user.id") === get(total, "user.id")
    );
    setCurrentStudentObject(newQueryData[0]);
  }
  function filterChecker1(total) {
      
    const newQueryData = qwerty.filter(
      (item) =>
        get(item, "homeworkStudentsName.user.id") === get(total, "id")
    );
    
    setCurrentStudentObject(newQueryData[0]);
  }

  function clicker(e, item) {
    selected1.innerText = e.target.innerText;
    optionsContainer1.classList.remove("active3");
    setSelectStudent(get(item, "user", ""));
    setClicked(false);
    setFirstStudent(false);
    filterChecker(item);
  }

  function EmptyCheckbox() {
    return (
      <>
        <div class="checkbox_color"></div>
      </>
    );
  }

useEffect(()=>{
    if(firstStudent && clicked === false){
        filterChecker1(firstNewStudent)
   
    }
},[firstStudent , clicked])
 


  

  return (
    <>
      <section class="select_student_container">
        <div class="select_student_left_container">
          <div class="select_student_heading">
            Select Student
            <span style={{ color: "red", marginLeft: "5px" }}>*</span>
          </div>
          {newDataSelectStudentsNameDetail.length == 0 ? (
            <EmptyStudentState />
          ) : (
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <div class="container1">
                <div class="select-box1">
                  <div class="options-container1">
                    {newDataSelectStudentsNameDetail.map((item) => (
                      <>
                        <div onClick={(e) => clicker(e, item)} class="option1">
                          <input
                            type="radio"
                            class="radio"
                            id="film"
                            name="category"
                          />
                          {get(item, "user.name", "")}
                        </div>
                      </>
                    ))}
                  </div>
                  <div
                    onClick={() => {
                      optionsContainer1.classList.toggle("active3");
                    }}
                    class="selected1"
                  >
                    {firstStudent && clicked === false
                      ? firstNewStudent.name
                      : firstStudent && clicked
                      ? "All students"
                      : firstStudent === false && clicked === true
                      ? "All students"
                      : get(selectStudent, "name", "")}
                  </div>
                </div>
              </div>
              <div class="checkbox_container">
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    width: "fit-content",
                  }}
                  onClick={() => {
                    setClicked((value) => !value);
                    setFirstStudent((value) => !value);
                  }}
                >
                  {clicked ? (
                    <img class="image_checkbox" src={IconCheck} />
                  ) : (
                    <EmptyCheckbox />
                  )}
                </div>
                <span> Show All Students </span>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default HomeworkSelectStudent;
