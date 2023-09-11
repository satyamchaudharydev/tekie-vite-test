import React, { useEffect, useState } from "react";
import "./HomeworkReviewTitle.scss";
import SessionImage from "../../HomeworkReviewImages/1Intro to programming-min.svg";
import { ClockIcon } from "../../HomeworkReviewImages/HomeworkReviewConstants";
import { MonitorIcon } from "../../HomeworkReviewImages/HomeworkReviewConstants";
import { InfoIcon } from "../../HomeworkReviewImages/HomeworkReviewConstants";
import { TheoryIcon } from "../../HomeworkReviewImages/HomeworkReviewConstants";
import { get } from "lodash";

function HomeworkReviewTitle({
  newTopicDetailData,
  currentStartTime,
  currentStartDate,
  totalStudent,
  presentStudent,
  currentTopicDetailData,
  prevTopicOrder
}) {
  const [clicker, setClicker] = useState("false");
  const [missingChecker, setMissingChecker] = useState(false);

  function absentStudentChecker() {
    const absentStudentArray = [];

    if (totalStudent.length > 0) {
      for (let i = 0; i < totalStudent.length; i++) {
        const element = totalStudent[i];
        if (element.isPresent === false) {
          absentStudentArray.push(element);
        }
      }

      return (
        <>
          {absentStudentArray.map((item) => {
            return (
              <div>
                <span className="missing__name__id">
                  {get(item, "student.rollNo", "")}
                </span>
                <span className="missing__name">
                  {get(item, "student.user.name", "")}
                </span>
              </div>
            );
          })}
        </>
      );
    }
  }

  useEffect(() => {
    if (totalStudent.length === presentStudent.length) {
      setMissingChecker(true);
    }
  }, [totalStudent, presentStudent]);

  const classes = get(newTopicDetailData, "batch.classes", []);

  function gradeMaker(item) {
    const currentGrade = item.grade;
    return `Grade - ${currentGrade.substr(5)}${item.section}`;
  }
  return (
    <>
      <section className="homework__review__header">
        <div className="homework__review__header__container">
          <div className="homework__title__image__section">
            <img src={SessionImage} alt="topic thumbnail" />
          </div>
          <div className="homework__review__description__section">
            <div className="homework__review__title">
              {prevTopicOrder || get(newTopicDetailData, "homeworkReviewTopic.order", "")}. {get(newTopicDetailData, "homeworkReviewTopic.title", "")}
            </div>
            <div className="homework__review__session__timing">
              <span style={{ marginRight: "4px" }}>
                <ClockIcon />
              </span>
              {` ${currentStartTime !== undefined &&
                currentStartTime.currentStartTime}`}
              -
              {` ${currentStartTime !== undefined &&
                currentStartTime.currentEndTime}`}
              <span style={{ fontSize: "7px", margin: "0px 6px" }}>&bull;</span>
              {`${currentStartDate}`}
            </div>
            <div className="homework__review__title__tags">
              {classes.map((item) => {
                return (
                  <div className="homework__review__classname__tag">
                    {gradeMaker(item)}
                  </div>
                );
              })}

              <div className="homework__review__classtype__tag">
                {get(
                  newTopicDetailData,
                  "homeworkReviewTopic.classType",
                  ""
                ) === "lab" && <MonitorIcon />}
                {get(
                  newTopicDetailData,
                  "homeworkReviewTopic.classType",
                  ""
                ) === "theory" && <TheoryIcon />}

                {get(
                  newTopicDetailData,
                  "homeworkReviewTopic.classType",
                  ""
                ) === "lab" && "Lab Class"}
                {get(
                  newTopicDetailData,
                  "homeworkReviewTopic.classType",
                  ""
                ) === "theory" && "Theory Class"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <div className="live__student__container__main">
        <div className="live__student__attendance__container">
          <div className="live__student__attendance__text">
            Live Student Attendance:
          </div>
          <div className="live__student__attendance__number">
            {presentStudent.length} / {totalStudent.length}
            <span
              style={{
                display: missingChecker === true ? "none" : "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              className="live__student__info__icon"
              onMouseEnter={() => setClicker("true")}
              onMouseLeave={() => setClicker("false")}
            >
              <InfoIcon />
            </span>
          </div>
        </div>
        <div
          class="arrow-up"
          style={{ opacity: clicker === "true" ? "1" : "0" }}
        ></div>
        <div
          class="arrow-down"
          style={{ opacity: clicker === "true" ? "1" : "0" }}
        ></div>
        <div
          class="arrow-left"
          style={{ opacity: clicker === "true" ? "1" : "0" }}
        ></div>
        <div
          class="arrow-right"
          style={{ opacity: clicker === "true" ? "1" : "0" }}
        ></div>
        <div
          className="live__student__missing__students"
          style={{ opacity: clicker === "true" ? "1" : "0" }}
        >
          <div className="live__student__missing__students__title">
            Missing:
          </div>
          <div className="live__student__missing__students__detail">
            {absentStudentChecker()}
          </div>
        </div>
      </div> */}
    </>
  );
}

export default HomeworkReviewTitle;
