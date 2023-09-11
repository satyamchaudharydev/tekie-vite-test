import React, { useEffect, useRef, useState } from "react";
import styles from "./DetailedReport.module.scss";
import { get } from "lodash";
import LoadingSpinner from "../../components/Loader/LoadingSpinner";
import { useParams } from "react-router";
import ReportQuestionStudentTabs from "../../components/ReportQuestionStudentTabs/ReportQuestionStudentTabs";
import fetchBatchSessionDetails from "../../../../queries/classroomReportsQuery/fetchBatchSessionDetails";
import ReportPageHeader from "../../components/ReportPageHeader";
import {
  checkIfShowPercentage,
  getActiveLoPqReport,
  getClassworkCount,
  getFilteredAssignmentQuestions,
  getFilteredBlocklyQuestions,
  getFilteredByLoQuizQuestions,
  getFilteredQuestionsByType,
  getLoComponentList,
  getQuestionsByAssessmentType,
  getQuestionsList,
  getTotalAssignmentPercentage,
  getTotalHomeworkAssignmentPercentage,
  getTotalPracticeQuestions,
  isAssignmentOrBlocklyPresent,
  isAssignmentPresent,
  isBlockBasedDataPresent,
  isHomeworkAssignmentOrBlocklyPresent,
  isHomeworkAssignmentPresent,
  isHomeworkPresent,
  isQuizPresent,
  useQuery,
} from "./DetailedReport.helpers";
import HomeworkReviewQuizSection from "../HomeworkReview/components/HomeworkReviewHeader/components/HomeworkReviewQuizSection";
import getHomeworkSummary from "../../../../queries/teacherApp/getHomeworkSummary";
import getClassworkSummary from "../../../../queries/teacherApp/getClassworkSummary";
import HomeworkReviewCodingQuestion from "../HomeworkReview/components/HomeworkReviewHeader/components/HomeworkReviewCodingQuestion";
import { calculateClassworkTotalSubmission, calculateHomeworkTotalSubmission, fetchTopicLevelAssignmentQuiz } from "../../utils";
import fetchBlocklyReports from "../../../../queries/teacherApp/classDetailPage/fetchBlocklyReports";
import HomeworkReviewBlocklyQuestion from "../HomeworkReview/components/HomeworkReviewHeader/components/HomeworkReviewBlocklyQuestion";
import PresentAbsentTabs from "../../components/ReportQuestionStudentTabs/PresentAbsentTabs";
import Button from "../../components/Button/Button";
import { ChevronLeft } from "../../../../constants/icons";
import cx from "classnames";
import DetailedReportEmptyState from "./DetailedReportEmptyState";
import ReportGradeCourseHeader from "../../components/ReportGradeCourseHeader";
import ReportStatsComponent from "../../components/ReportStatsComponent";
import DetailedReportTitleStatsContainer from "./Components/DetailedReportTitleStatsContainer/DetailedReportTitleStatsContainer";
import { sessionStartedOrCompleted } from "../TimeTable/constants";

const DetailedReport = (props) => {
  const [batchAndTopicDetails, setBatchAndTopicDetails] = useState(
    getInitialBatchAndTopicDetails(props.batchSessionsData && props.batchSessionsData.toJS())
  );
  const [localTopicId, setLocalTopicId] = useState(
    props.batchSessionsData && props.batchSessionsData.toJS() && get(props.batchSessionsData.toJS(), "topicData.id")
  );
  const [activeLo, setActiveLo] = useState("");
  const [isBackToTopVisible, setIsBackToTopVisible] = useState(false);
  const [dropDownSelectedLo, setDropdownSelectedLo] = useState("all");
  const [assignmentAndQuizQuestions, setAssignmentAndQuizQuestions] = useState({
    assignmentQues: [],
    hwAssignmentQues: [],
    quizQues: [],
    hwPracticeQues: [],
  });
  const { sessionId } = useParams();
  const queryString = useQuery();
  const classworkTitleRef = useRef(null);
  const ROUTE = `/teacher/reports/classroom/${sessionId}/student-level`;

  const fetchHomeworkReviewStatusLoading =
    props.fetchHomeworkReviewStatus && get(props, "fetchHomeworkReviewStatus").toJS().loading;
  const fetchClassworkReviewStatusLoading =
    props.fetchClassworkReviewStatus && get(props, "fetchClassworkReviewStatus").toJS().loading;
  const classworkSummaryReportFetchStatusLoading =
    props.classworkSummaryReportFetchStatus && get(props, "classworkSummaryReportFetchStatus").toJS().loading;
  const batchSessionsFetchStatusLoading = props.batchSessionsFetchStatus && get(props, "batchSessionsFetchStatus").toJS().loading;

  const blocklyReportsData = props.fetchBlocklyReports && props.fetchBlocklyReports.toJS();
  const classworkSummaryReportData = props.classworkSummaryReport && props.classworkSummaryReport.toJS();
  const practiceQuestionOverallReport = get(classworkSummaryReportData, "practiceQuestionOverallReport", []) || [];

  const newHomeworkData = props.fetchHomeworkReview && props.fetchHomeworkReview.toJS();
  const newClassworkData = props.fetchClassworkReview && props.fetchClassworkReview.toJS();
  const correctPercent = get(newHomeworkData, "quiz", {});
  const batchSessionsData = props.batchSessionsData && props.batchSessionsData.toJS();
  const topicId = get(batchAndTopicDetails, "topicDetails.id");
  const batchId = get(batchAndTopicDetails, "batchDetails.id");
  const courseId = get(batchAndTopicDetails, "courseId");
  const classworkCount = getClassworkCount(
    get(batchAndTopicDetails, "topicDetails.topicComponentRule"),
    assignmentAndQuizQuestions.assignmentQues
  );
  const hwPracticeQuestions = getFilteredBlocklyQuestions(get(blocklyReportsData, "topicComponentRule"), "homeworkPractice");

  function getInitialBatchAndTopicDetails(batchSessionData) {
    //using this syntax so that it hoists
    return {
      batchDetails: get(batchSessionData, "batchData"),
      topicDetails: get(batchSessionData, "topicData"),
      courseId: get(batchSessionData, "courseData.id"),
      sessionStatus: get(batchSessionData, "sessionStatus"),
      attendance: get(batchSessionData, "attendance"),
    };
  }
  const onBackToTopClick = () => {
    const screenWrapper = document.querySelector(".splitScreen-main-component");
    screenWrapper.scrollTo({ top: 0, behavior: "smooth" });
  };
  useEffect(() => {
    (async function() {
      try {
        if (sessionId && (!topicId || !courseId || !batchId || queryString.get("fromClassroomDetails"))) {
          const res = await fetchBatchSessionDetails(sessionId, true);
          setLocalTopicId(get(res, "batchSessionData.topicData.id"));
          setBatchAndTopicDetails((prev) => ({
            ...prev,
            batchDetails: get(res, "batchSessionData.batchData"),
            topicDetails: get(res, "batchSessionData.topicData"),
            courseId: get(res, "batchSessionData.courseData.id"),
            sessionStatus: get(res, "batchSessionData.sessionStatus"),
            bookingDate: get(res, "batchSessionData.bookingDate"),
            startMinutes: get(res, "batchSessionData.startMinutes"),
            endMinutes: get(res, "batchSessionData.endMinutes"),
          }));
        }
      } catch (err) {
        console.log(err);
      }
    })();
  }, [sessionId]);

  useEffect(() => {
    (async function() {
      try {
        if (
          (topicId && batchId && courseId && localTopicId === get(batchAndTopicDetails, "topicDetails.id")) ||
          queryString.get("fromStudentLevelReport")
        ) {
          await Promise.allSettled([
            getHomeworkSummary({ batchId, topicId, isHomework: true }),
            getHomeworkSummary({ batchId, topicId, isHomework: false }),
            getClassworkSummary(batchId, topicId),
            fetchBlocklyReports(topicId),
          ]);
        }
      } catch (err) {
        console.log(err);
      }
    })();
  }, [topicId]);

  useEffect(() => {
    const loList = getLoComponentList(get(batchAndTopicDetails, "topicDetails.topicComponentRule", [])).map((loComp) => ({
      label: get(loComp, "learningObjective.title"),
      value: get(loComp, "learningObjective.id"),
    }));
    if (loList && loList.length) {
      setActiveLo(loList[0].value);
    }
  }, [get(batchAndTopicDetails, "topicDetails.topicComponentRule", [])]);

  const loList = getLoComponentList(get(batchAndTopicDetails, "topicDetails.topicComponentRule", [])).map((loComp) => ({
    label: get(loComp, "learningObjective.title"),
    value: get(loComp, "learningObjective.id"),
  }));

  const onTabSwitch = (loId) => {
    setActiveLo(loId);
  };

  const isPageLoading = () => {
    return batchSessionsFetchStatusLoading;
  };

  useEffect(() => {
    if (topicId) {
      (async function() {
        try {
          const res = await fetchTopicLevelAssignmentQuiz(
            topicId,
            isAssignmentPresent(get(batchAndTopicDetails, "topicDetails.topicComponentRule")),
            isHomeworkAssignmentPresent(get(batchAndTopicDetails, "topicDetails.topicComponentRule")),
            isQuizPresent(get(batchAndTopicDetails, "topicDetails.topicComponentRule"))
          );

          setAssignmentAndQuizQuestions({
            assignmentQues: getFilteredAssignmentQuestions(false, get(res, "topicAssignmentQuestions", [])),
            hwAssignmentQues: getFilteredAssignmentQuestions(true, get(res, "topicHomeworkAssignmentQuestion", [])),
            hwPracticeQues: getFilteredBlocklyQuestions(get(blocklyReportsData, "topicComponentRule"), "homeworkPractice"),
            quizQues: getQuestionsByAssessmentType("quiz", get(res, "topicQuestions", [])),
          });
        } catch (err) {
          console.log(err);
        }
      })();
    }
  }, [topicId]);

  useEffect(() => {
    if (props.batchSessionsData && props.batchSessionsData.toJS())
      setLocalTopicId(get(props.batchSessionsData.toJS(), "topicData.id"));
  }, [props.batchSessionsData && props.batchSessionsData.toJS()]);

  useEffect(() => {
    setAssignmentAndQuizQuestions((prev) => ({
      ...prev,
      hwPracticeQues: getFilteredBlocklyQuestions(get(blocklyReportsData, "topicComponentRule"), "homeworkPractice"),
    }));
  }, [get(blocklyReportsData, "topicComponentRule", []).length]);
  //WHOMSOEVER IS READING THIS CODE, PLEASE FORGIVE ME! (🙏)
  const isLoading =
    (!fetchHomeworkReviewStatusLoading ||
      !isPageLoading() ||
      !classworkSummaryReportFetchStatusLoading ||
      !fetchClassworkReviewStatusLoading) &&
    Boolean(localTopicId);
  return (
    <>
      {isPageLoading() ? (
        <div className={styles.loaderBackdrop}>
          <LoadingSpinner
            height="40vh"
            position="absolute"
            left="50%"
            top="50%"
            transform="translate(-50%,-50%)"
            borderWidth="6px"
            showLottie
            flexDirection={"column"}
          >
            <span className={styles.timetableLoadingText}>Loading Report</span>
          </LoadingSpinner>
        </div>
      ) : (
        <div className={styles.detailedReportContainer}>
          {isLoading ? <span className="question-level-page-mixpanel-identifier" /> : ""}
          <div className={styles.breadCrumbContainer}>
            <ReportPageHeader
              topicDetail={batchAndTopicDetails.topicDetails}
              batchDetail={batchAndTopicDetails.batchDetails}
              tabName={"Class Performance"}
              activeTabName={"Class Performance"}
            />
          </div>
          <ReportGradeCourseHeader
            topicDetail={batchAndTopicDetails.topicDetails}
            batchDetail={batchAndTopicDetails.batchDetails}
            students={get(batchSessionsData, "attendance")}
            sessionStartDate={get(batchSessionsData, "sessionStartDate")}
            sessionEndDate={get(batchSessionsData, "sessionEndDate")}
            sessionStatus={get(batchSessionsData, 'sessionStatus')}
            studentsFromDetailedReport
          />
          <ReportQuestionStudentTabs />
          <div className={styles.detailed__report__main__container}>
            <ReportStatsComponent
              title="Classwork Report"
              percentage={calculateClassworkTotalSubmission(classworkSummaryReportData, newClassworkData)}
            />
            {!classworkSummaryReportFetchStatusLoading && !fetchClassworkReviewStatusLoading ? (
              <div>
                {sessionStartedOrCompleted.includes(get(batchSessionsData, 'sessionStatus')) ? (
                  <>
                    {getTotalPracticeQuestions(activeLo, get(batchAndTopicDetails, "topicDetails.topicComponentRule")) !== 0 && (
                      <div className={styles.Pratice__question__detailed__report}>
                        <DetailedReportTitleStatsContainer
                          headingTitle="Quiz Questions"
                          questionCount={
                            getTotalPracticeQuestions(activeLo, get(batchAndTopicDetails, "topicDetails.topicComponentRule")) > 1
                              ? getTotalPracticeQuestions(activeLo, get(batchAndTopicDetails, "topicDetails.topicComponentRule"))
                              : getTotalPracticeQuestions(activeLo, get(batchAndTopicDetails, "topicDetails.topicComponentRule"))
                          }
                          submittedPercentage={getActiveLoPqReport(activeLo, practiceQuestionOverallReport).submittedPercentage}
                          avgTries={Math.round(getActiveLoPqReport(activeLo, practiceQuestionOverallReport).avgTriesPerQuestion)}
                        />
                        {loList && loList.length > 1 && (
                          <div className={styles.pqTopicLabelsContainer}>
                            <PresentAbsentTabs
                              tabsData={loList}
                              onTabSwitch={onTabSwitch}
                              activeTabKey={activeLo}
                              fromStudentReport
                              fromDetailedReport
                            />
                          </div>
                        )}
                        {classworkSummaryReportFetchStatusLoading && (
                          <div style={{ position: "relative", height: "150px" }}>
                            <LoadingSpinner
                              height="40vh"
                              position="absolute"
                              left="50%"
                              top="57%"
                              transform="translate(-50%,-50%)"
                              borderWidth="6px"
                              showLottie
                              flexDirection={"column"}
                            >
                              <span className="timetable-loading-text"></span>
                            </LoadingSpinner>
                          </div>
                        )}
                        <div>
                          {!classworkSummaryReportFetchStatusLoading && (
                            <div className={styles.quiz__all__questions__main__container}>
                              <HomeworkReviewQuizSection
                                fromQuestionLevelReport
                                isPracticeQuestion
                                individualQuestionDetails={getActiveLoPqReport(activeLo, practiceQuestionOverallReport)}
                                newQuestionsData={getFilteredQuestionsByType(
                                  getQuestionsList(activeLo, get(batchAndTopicDetails, "topicDetails.topicComponentRule"))
                                )}
                                newPercentage={correctPercent}
                                route={ROUTE}
                                tcRule={get(batchAndTopicDetails, "topicDetails.topicComponentRule")}
                                styles={{ width: "100%" }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <>
                      {!fetchClassworkReviewStatusLoading &&
                        isAssignmentOrBlocklyPresent(get(batchAndTopicDetails, "topicDetails.topicComponentRule")).length !==
                          0 && (
                          <DetailedReportTitleStatsContainer
                            headingTitle="Assignment Questions"
                            questionCount={classworkCount}
                            submittedPercentage={getTotalAssignmentPercentage(
                              get(batchAndTopicDetails, "topicDetails.topicComponentRule"),
                              newClassworkData,
                              get(assignmentAndQuizQuestions, "assignmentQues")
                            )}
                            showPercentage={checkIfShowPercentage(
                              get(batchAndTopicDetails, "topicDetails.topicComponentRule"),
                              newClassworkData,
                              get(assignmentAndQuizQuestions, "assignmentQues")
                            )}
                          />
                        )}
                      {isAssignmentPresent(get(batchAndTopicDetails, "topicDetails.topicComponentRule")) && (
                        <>
                          <div className="homework__review__coding__question">
                            <HomeworkReviewCodingQuestion
                              newCodingQuestionsData={assignmentAndQuizQuestions.assignmentQues}
                              newHomeworkData={newClassworkData}
                              route={ROUTE}
                              fromQuestionLevelReport
                              styles={{ width: "100%" }}
                            />
                          </div>
                        </>
                      )}
                      {isBlockBasedDataPresent(get(batchAndTopicDetails, "topicDetails.topicComponentRule")) && (
                        <>
                          {" "}
                          {getFilteredBlocklyQuestions(get(blocklyReportsData, "topicComponentRule"), "blockBasedProject")
                            .length !== 0 && (
                            <div>
                              <HomeworkReviewBlocklyQuestion
                                newBlocklyBasedQuestion={getFilteredBlocklyQuestions(
                                  get(blocklyReportsData, "topicComponentRule"),
                                  "blockBasedProject"
                                )}
                                newHomeworkData={newClassworkData}
                                route={ROUTE}
                                fromQuestionLevelReport
                                styles={{ width: "100%" }}
                              />
                            </div>
                          )}
                          {getFilteredBlocklyQuestions(get(blocklyReportsData, "topicComponentRule"), "blockBasedPractice")
                            .length !== 0 && (
                            <div>
                              <HomeworkReviewBlocklyQuestion
                                newBlocklyBasedQuestion={getFilteredBlocklyQuestions(
                                  get(blocklyReportsData, "topicComponentRule"),
                                  "blockBasedPractice"
                                )}
                                newHomeworkData={newHomeworkData}
                                route={ROUTE}
                                fromQuestionLevelReport
                                styles={{ width: "100%" }}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </>
                  </>
                ) : (
                  <DetailedReportEmptyState text={"Finish Classwork to generate the report"} />
                )}
              </div>
            ) : (
              <div style={{ position: "relative", height: "150px" }}>
                <LoadingSpinner
                  height="40vh"
                  position="absolute"
                  left="50%"
                  top="57%"
                  transform="translate(-50%,-50%)"
                  borderWidth="6px"
                  showLottie
                  flexDirection={"column"}
                >
                  <span className="timetable-loading-text"></span>
                </LoadingSpinner>
              </div>
            )}

            {isHomeworkPresent(get(batchAndTopicDetails, "topicDetails.topicComponentRule")) && (
              <>
                <ReportStatsComponent
                  title="Homework Report"
                  percentage={calculateHomeworkTotalSubmission(newHomeworkData)}
                />
                {!classworkSummaryReportFetchStatusLoading && !fetchHomeworkReviewStatusLoading ? (
                  <div>
                    {sessionStartedOrCompleted.includes(get(batchSessionsData, 'sessionStatus')) ? (
                      <>
                        {getFilteredByLoQuizQuestions(dropDownSelectedLo, assignmentAndQuizQuestions.quizQues).length !== 0 && (
                          <DetailedReportTitleStatsContainer
                            headingTitle="Quiz Questions"
                            questionCount={
                              getFilteredByLoQuizQuestions(dropDownSelectedLo, assignmentAndQuizQuestions.quizQues).length
                            }
                            submittedPercentage={get(newHomeworkData, "quiz.submittedPercentage", 0)}
                          />
                        )}
                        {isHomeworkPresent(get(batchAndTopicDetails, "topicDetails.topicComponentRule")) &&
                          assignmentAndQuizQuestions.quizQues.length !== 0 && (
                            <div className={styles.quiz__all__questions__main__container}>
                              <HomeworkReviewQuizSection
                                fromQuestionLevelReport
                                isQuizQuestion
                                individualQuestionDetails={newHomeworkData}
                                newQuestionsData={getFilteredByLoQuizQuestions(
                                  dropDownSelectedLo,
                                  assignmentAndQuizQuestions.quizQues
                                )}
                                newPercentage={correctPercent}
                                route={ROUTE}
                                tcRule={get(batchAndTopicDetails, "topicDetails.topicComponentRule")}
                                styles={{ width: "100%" }}
                                dropDownSelectedLo={dropDownSelectedLo}
                                setDropdownSelectedLo={setDropdownSelectedLo}
                              />
                            </div>
                          )}
                        <>
                          {isHomeworkPresent(get(batchAndTopicDetails, "topicDetails.topicComponentRule")) &&
                            isHomeworkAssignmentOrBlocklyPresent(get(batchAndTopicDetails, "topicDetails.topicComponentRule"))
                              .length !== 0 && (
                              <DetailedReportTitleStatsContainer
                                headingTitle="Assignment Questions"
                                questionCount={hwPracticeQuestions.length + assignmentAndQuizQuestions.hwAssignmentQues.length}
                                submittedPercentage={getTotalHomeworkAssignmentPercentage(
                                  get(batchAndTopicDetails, "topicDetails.topicComponentRule"),
                                  get(assignmentAndQuizQuestions, "hwAssignmentQues"),
                                  newHomeworkData,
                                  get(assignmentAndQuizQuestions, "hwPracticeQues")
                                )}
                                showPercentage={checkIfShowPercentage(
                                  get(batchAndTopicDetails, "topicDetails.topicComponentRule"),
                                  get(assignmentAndQuizQuestions, "hwAssignmentQues"),
                                  newHomeworkData,
                                  get(assignmentAndQuizQuestions, "hwPracticeQues")
                                )}
                              />
                            )}
                          {isHomeworkPresent(get(batchAndTopicDetails, "topicDetails.topicComponentRule")) &&
                            isHomeworkAssignmentPresent(get(batchAndTopicDetails, "topicDetails.topicComponentRule")) && (
                              <div className="homework__review__coding__question">
                                <HomeworkReviewCodingQuestion
                                  newCodingQuestionsData={assignmentAndQuizQuestions.hwAssignmentQues}
                                  newHomeworkData={newHomeworkData}
                                  route={ROUTE}
                                  fromQuestionLevelReport
                                  styles={{ width: "100%" }}
                                  // fromStudentReport
                                />
                              </div>
                            )}
                          {isHomeworkPresent(get(batchAndTopicDetails, "topicDetails.topicComponentRule")) &&
                            getFilteredBlocklyQuestions(get(blocklyReportsData, "topicComponentRule"), "homeworkPractice")
                              .length !== 0 && (
                              <div>
                                <HomeworkReviewBlocklyQuestion
                                  newBlocklyBasedQuestion={getFilteredBlocklyQuestions(
                                    get(blocklyReportsData, "topicComponentRule"),
                                    "homeworkPractice"
                                  )}
                                  newHomeworkData={newHomeworkData}
                                  route={ROUTE}
                                  fromQuestionLevelReport
                                  styles={{ width: "100%" }}
                                />
                              </div>
                            )}
                        </>
                      </>
                    ) : (
                      <DetailedReportEmptyState text={"Finish Homework to generate the report"} />
                    )}
                  </div>
                ) : (
                  <div style={{ position: "relative", height: "150px" }}>
                    <LoadingSpinner
                      height="40vh"
                      position="absolute"
                      left="50%"
                      top="57%"
                      transform="translate(-50%,-50%)"
                      borderWidth="6px"
                      showLottie
                      flexDirection={"column"}
                    >
                      <span className="timetable-loading-text"></span>
                    </LoadingSpinner>
                  </div>
                )}
              </>
            )}
            <div className={cx(styles.backToTop, isBackToTopVisible && styles.visibleButton)}>
              <Button text={<ChevronLeft />} type="secondary" textClass="addIcon" onBtnClick={onBackToTopClick} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DetailedReport;