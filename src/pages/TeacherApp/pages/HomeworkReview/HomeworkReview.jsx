import React, { useEffect, useState } from "react";
import "./HomeworkReview.scss";
import { get } from "lodash";
import HomeworkReviewHeader from "./components/HomeworkReviewHeader/HomeworkReviewHeader";
import HomeworkReviewGraphSection from "./components/HomeworkReviewHeader/components/HomeworkReviewGraphSection";
import HomeworkReviewQuizSection from "./components/HomeworkReviewHeader/components/HomeworkReviewQuizSection";
import HomeworkReviewCodingQuestion from "./components/HomeworkReviewHeader/components/HomeworkReviewCodingQuestion";
import fetchHomeworkReviewTopicDetail from "../../../../queries/teacherApp/fetchHomeworkReviewTopicDetail";
import HomeworkReviewBlocklyQuestion from "./components/HomeworkReviewHeader/components/HomeworkReviewBlocklyQuestion";
import fetchHomeworkReview from "../../../../queries/teacherApp/fetchHomeworkReview";
// import fetchCodingQuestion from "../../../../queries/teacherApp/fetchCodingQuestions";
// import fetchBlocklyData from "../../../../queries/teacherApp/fetchBlocklyData";
import moment from "moment";
import LoadingSpinner from "../../components/Loader/LoadingSpinner";
import {
  getFilteredLoComponentRule,
  getLORedirectKey,
} from "../../../UpdatedSessions/utils";
import fetchLiveAttendance from "../../../../queries/teacherApp/fetchLiveAttendance";
import fetchHomeworkReviewCurrentTopicDetail from "../../../../queries/teacherApp/fetchHomeworkReviewCurrentTopicDetail";
import { getEmbedData } from "../../../../utils/teacherApp/checkForEmbed";
import getIframeUrl from "../../../../utils/teacherApp/getIframeUrl";
import UpdatedButton from "../../../../components/Buttons/UpdatedButton/UpdatedButton";
import { RightArrow } from "./components/HomeworkReviewImages/HomeworkReviewConstants";
import getCourseId, { getCoursePackageId } from "../../../../utils/getCourseId";

function HomeworkReview(props) {
  const [componentNameQuiz, setComponentNameQuiz] = useState({});
  const [componentNameCoding, setComponentNameCoding] = useState({});
  const [componentNamePractice, setComponentNamePractice] = useState({});
  const [currentStartTime, setCurrentStartTime] = useState();
  const [currentStartDate, setCurrentStartDate] = useState();
  const [presentStudent, setPresentStudent] = useState([]);
  const [totalStudent, setTotalStudent] = useState([]);
  const [assignmentsData, setAssignmentsData] = useState([])
  const [blocklyData, setBlocklyData] = useState([])
  // to revert just replace below with queryName.get(paramName)
  const prevTopicId = getEmbedData('prevTopicId');
  const currentTopicId = getEmbedData('topicId');
  const currentBatchId = getEmbedData("batchId");
  const currentCourseId = getEmbedData("courseId");
  const currentSessionId = getEmbedData("sessionId");
  const prevTopicOrder = getEmbedData("prevTopicOrder")

  const { history } = props;

  const newHomeworkData =
    props.fetchHomeworkReview && props.fetchHomeworkReview.toJS()[0];

  const correctPercent = get(newHomeworkData, "quiz", {});

  const newTopicDetailData =
    props.fetchHomeworkReviewTopicDetail &&
    props.fetchHomeworkReviewTopicDetail.toJS()[0];
  const newQuestionsData = get(
    newTopicDetailData,
    "homeworkReviewTopic.topicQuestions",
    []
  );

  const currentTopicDetailData =
    props.fetchHomeworkReviewCurrentTopicDetail &&
    props.fetchHomeworkReviewCurrentTopicDetail.toJS()[0];
  const currentTitleValue = get(
    currentTopicDetailData,
    "homeworkReviewTopic.title",
    ""
  );

  const newTopicDetailDataStatus =
    props.fetchHomeworkReviewTopicDetailStatus &&
    props.fetchHomeworkReviewTopicDetailStatus.toJS().homeworkReviewTopicDetail;
  const fetchHomeworkReviewStatus =
    props.fetchHomeworkReviewStatus &&
    props.fetchHomeworkReviewStatus.toJS().homeworkReview;

  // const newCodingQuestionsData =
  //   props.fetchCodingQuestion && props.fetchCodingQuestion.toJS();
  const liveAttendance =
    props.fetchLiveAttendance && props.fetchLiveAttendance.toJS();
  const liveAttendanceStatus =
    props.fetchLiveAttendanceStatus &&
    props.fetchLiveAttendanceStatus.toJS().fetchLiveAttendance;

  // const newBlocklyBasedQuestion =
  //   props.fetchBlocklyQuestion && props.fetchBlocklyQuestion.toJS();

  const value = get(
    newTopicDetailData,
    "homeworkReviewTopic.topicComponentRule",
    []
  );

  // const defaultTopicComponentRule = get(
  //   newTopicDetailData,
  //   "homeworkReviewCourse.defaultLoComponentRule",
  //   []
  // );

  // const courseName = get(newTopicDetailData, "homeworkReviewTopic.title");
  function getCurrentLiveStudent() {
    const newArray = [];
    const attendanceStudentArray = get(liveAttendance[0], "attendance", []);
    for (let index = 0; index < attendanceStudentArray.length; index++) {
      const element = attendanceStudentArray[index];
      if (get(element, "isPresent", "") === true) {
        newArray.push(element);
      }
    }

    setPresentStudent(newArray);
    setTotalStudent(attendanceStudentArray);
  }

  const getTimeFromSlot = (session) => {
    let trueSlot;
    for (let key in session) {
      if (key.includes("slot")) {
        if (session[key]) {
          trueSlot = key;
        }
      }
    }
    const trueSlotNumber = trueSlot && trueSlot.substring(4); // using 4 coz, 'slot' has 4 letters
    if (trueSlotNumber) {
      return new Date(
        new Date().setHours(trueSlotNumber, 0, 0, 0)
      ).toISOString();
    }
  };

  const getTime = (time, value1, startTime) => {
    let newTime = time;
    let endTime;

    if (time === null) {
      newTime = moment(startTime).add(1, "hours");
    }
    if (value1 === 0) {
      endTime = moment(newTime).add(1, "hours");
    }
    if (value1 !== 0) {
      endTime = moment(newTime).add(value1, "minutes");
    }
    return {
      currentStartTime: moment(newTime)
        .format("LT")
        .toLowerCase(),
      currentEndTime: moment(endTime)
        .format("LT")
        .toLowerCase(),
    };
  };

  function componentNameChecker() {
    for (let i = 0; i < value.length; i++) {
      const element = value[i];
      if (element.componentName === "quiz") {
        setComponentNameQuiz("quiz");
      }
      if (element.componentName === "homeworkAssignment") {
        setComponentNameCoding("homeworkAssignment");
      }
      if (element.componentName === "homeworkPractice") {
        setComponentNamePractice("homeworkPractice");
      }
    }
  }
  function componentRuleChecker() {
    // const newTopicComponentRule1 =
    //   props.fetchTopicComponentRule && props.fetchTopicComponentRule.toJS()[0];
    const newTopicComponentRule1 = get(currentTopicDetailData, 'homeworkReviewTopic')
    const arrayTopicComponent = get(
      newTopicComponentRule1,
      "topicComponentRule",
      []
    );

    const sortedTopicComponentRule = [...arrayTopicComponent].sort(
      (a, b) => get(a, "order") - get(b, "order")
    );

    const defaultTopicComponentRule = (get(
      newTopicDetailData,
      "homeworkReviewCourse.defaultLoComponentRule",
      []
    ) || []);

    const firstComponent = sortedTopicComponentRule[0];

    if (
      firstComponent &&
      firstComponent.componentName === "blockBasedProject"
    ) {
      history.push(
        getIframeUrl({
          componentName: get(firstComponent, "componentName"),
          componentId: get(firstComponent, "blockBasedProject.id"),
          courseId: (currentTopicId && getCoursePackageId()) ? getCourseId(currentTopicId) : currentCourseId,
          topicId: currentTopicId && currentTopicId,
        })
      );
    } else if (firstComponent && firstComponent.componentName === "video") {
      history.push(
        getIframeUrl({
          componentName: get(firstComponent, "componentName"),
          componentId: get(firstComponent, "video.id"),
          courseId: (currentTopicId && getCoursePackageId()) ? getCourseId(currentTopicId) : currentCourseId,
          topicId: currentTopicId && currentTopicId,
        })
      );
    } else if (
      firstComponent &&
      firstComponent.componentName === "blockBasedPractice"
    ) {
      history.push(
        getIframeUrl({
          componentName: get(firstComponent, "componentName"),
          componentId: get(firstComponent, "blockBasedProject.id"),
          courseId: (currentTopicId && getCoursePackageId()) ? getCourseId(currentTopicId) : currentCourseId,
          topicId: currentTopicId && currentTopicId,
        })
      );
    } else if (
      firstComponent &&
      firstComponent.componentName === "assignment"
    ) {
      history.push(
        getIframeUrl({
          componentName: get(firstComponent, "componentName"),
          courseId: (currentTopicId && getCoursePackageId()) ? getCourseId(currentTopicId) : currentCourseId,
          topicId: currentTopicId && currentTopicId,
        })
      );
    } else {
      if (
        firstComponent &&
        firstComponent.componentName === "learningObjective"
      ) {
        if (get(firstComponent, "learningObjective", {})) {
          let LoRedirectKey = "comic-strip";
          if ((defaultTopicComponentRule && defaultTopicComponentRule.length) || (get(firstComponent, 'learningObjectiveComponentsRule', []) || []).length) {
            const sortedDefaultTopicComponentRule = [
              ...defaultTopicComponentRule,
            ].sort((a, b) => get(a, "order") - get(b, "order"));

            const filteredLoComponentRule = getFilteredLoComponentRule(
              get(firstComponent, "learningObjective", {}),
              sortedDefaultTopicComponentRule,
              (get(firstComponent, 'learningObjectiveComponentsRule', []) || [])
            );
            if (filteredLoComponentRule && filteredLoComponentRule.length) {
              LoRedirectKey = getLORedirectKey(filteredLoComponentRule[0]);
            }
          }
          history.push(
            getIframeUrl({
              courseId: (currentTopicId && getCoursePackageId()) ? getCourseId(currentTopicId) : currentCourseId,
              topicId: currentTopicId && currentTopicId,
              componentId: get(firstComponent, "learningObjective.id"),
              componentName: LoRedirectKey,
              isLoComponent: true,
            })
          );
        }
      }
    }
  }

  useEffect(() => {
    (async function () {
      const newCourseIdForCurrent = (currentTopicId && getCoursePackageId()) ? getCourseId(currentTopicId) : currentCourseId
      const newCourseIdForPrev = prevTopicId ? getCourseId(prevTopicId) : currentCourseId
      await fetchHomeworkReviewCurrentTopicDetail(
        currentTopicId,
        currentBatchId,
        newCourseIdForCurrent
      );

      await fetchHomeworkReviewTopicDetail(
        prevTopicId,
        currentBatchId,
        newCourseIdForPrev
      ).then(res => {
        if (res && get(res, 'codingQuestionData', []).length) {
          setAssignmentsData(get(res, 'codingQuestionData', []))
        }
        if (res && get(res, 'fetchBlocklyQuestion', []).length) {
          setBlocklyData(get(res, 'fetchBlocklyQuestion', []))
        }
      });
    })();
  }, []);

  useEffect(() => {
    let attendanceInterval;
    if (get(newTopicDetailDataStatus, "success", "") === true) {
      const newTopicDetailData1 =
        props.fetchHomeworkReviewTopicDetail &&
        props.fetchHomeworkReviewTopicDetail.toJS()[0];
      const currentTopicDetailData1 =
        props.fetchHomeworkReviewCurrentTopicDetail &&
        props.fetchHomeworkReviewCurrentTopicDetail.toJS()[0];
      const batch = get(newTopicDetailData1, "batch.id", "") || currentBatchId;
      const course = get(newTopicDetailData1, "homeworkReviewCourse.id", "") || (prevTopicId ? getCourseId(prevTopicId) : currentCourseId);
      const topic = get(newTopicDetailData1, "homeworkReviewTopic.id", "") || prevTopicId;
      const batchSessionId = get(currentTopicDetailData1, "id", "") || currentSessionId;
      componentNameChecker();

      fetchHomeworkReview(batch, course, topic);
      // fetchCodingQuestion(batch, course, topic);
      // fetchBlocklyData(batch, course, topic);
      // fetchLiveAttendance(batchSessionId);
      // attendanceInterval = setInterval(
      //   () => fetchLiveAttendance(batchSessionId),
      //   15000
      // );

      const newValue = get(newTopicDetailData, "endMinutes", "");

      setCurrentStartTime(
        getTime(getTimeFromSlot(newTopicDetailData), newValue)
      );

      setCurrentStartDate(
        `${moment(get(newTopicDetailData, "bookingDate"))
          .format("llll")
          .split(",")
          .slice(0, 2)
          .join(",")}`
      );
    }
    // return () => clearInterval(attendanceInterval);
  }, [get(newTopicDetailDataStatus, "success", "") === true]);

  useEffect(() => {
    getCurrentLiveStudent();
  }, [get(liveAttendanceStatus, "success", "") === true]);

  const getQuestionsData = (pqQuestions = []) => {
    const newQuestionsData = pqQuestions.map(question => ({ ...get(question, 'question') }))
    return newQuestionsData
  }
  return (
    <>
      {get(fetchHomeworkReviewStatus, "success", "") !== true ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LoadingSpinner />
        </div>
      ) : (
        <div style={{ marginLeft: "20px", paddingBottom: "100px" }} className='homework_review_page_embed_container'>
          <span className="homework-review-page-mixpanel-identifier" />
          {/* <UpdatedSideNavBar
            mobileNav
            parent={"homework"}
            revisitRoute={props.match.path.includes("/revisit")}
            computedMatch={props.computedMatch || props.match}
            pageTitle="Report"
          /> */}
          <div className="homework__review__header__main__container">
            <HomeworkReviewHeader
              newTopicDetailData={newTopicDetailData}
              currentStartTime={currentStartTime}
              currentStartDate={currentStartDate}
              totalStudent={totalStudent}
              presentStudent={presentStudent}
              currentTopicDetailData={currentTopicDetailData}
              prevTopicOrder={prevTopicOrder}
            />
          </div>
          <div className="homework__review__graph__section__main__container">
            <HomeworkReviewGraphSection
              newHomeworkData={newHomeworkData}
              componentNameCoding={componentNameCoding}
              componentNamePractice={componentNamePractice}
            />
          </div>
          {/* Will use below component for quiz as well as Practice questions(learingObjective) */}
          {componentNameQuiz === "quiz" && (
            <HomeworkReviewQuizSection
              newQuestionsData={getQuestionsData(newQuestionsData)}
              newPercentage={correctPercent}
              fromPqReport
              isQuizQuestion
              individualQuestionDetails={newHomeworkData}
            />
          )}
          {/* homeworkAssignment or assignment */}
          {componentNameCoding === "homeworkAssignment" && (
            <div className="homework__review__coding__question">
              <HomeworkReviewCodingQuestion
                newCodingQuestionsData={assignmentsData}
                newHomeworkData={newHomeworkData}
                fromPqReport
              />
            </div>
          )}
          {/* Use below for blockbasedpractice also */}
          {componentNamePractice === "homeworkPractice" && (
            <HomeworkReviewBlocklyQuestion
              newBlocklyBasedQuestion={blocklyData}
              newHomeworkData={newHomeworkData}
            />
          )}

          <div className="floating__button__container">
            <div
              onClick={() => componentRuleChecker()}
              className="floating__button"
            >
              
              <UpdatedButton
                text={`Next Up: ${currentTitleValue}`}
                type={"primary"}
                rightIcon={true}
              >
                <RightArrow />
                </UpdatedButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HomeworkReview;
