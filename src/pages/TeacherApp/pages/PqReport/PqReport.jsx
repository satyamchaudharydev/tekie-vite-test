import React, { useState, useEffect } from "react";
import "./PqReport.scss";
import { get } from "lodash";
import PqReportHeader from "./components/pqReportHeader";
import Tabswitch from "./components/Tabswitch";
import PqReportQuestionSection from "./components/PqReportQuestion";
import fetchPqReportDetail from "../../../../queries/teacherApp/fetchPqReport";
import fetchQuizQuestionsPq from "../../../../queries/teacherApp/fetchQuizQuestionPq";
import PqReportQuestionSectionStudent from "./components/PqReportQuestionStudent";
import fetchTopicDetailPq from "../../../../queries/teacherApp/fetchTopicDetailPq";
import LoadingSpinner from "../../components/Loader/LoadingSpinner";
import fetchPqStudentReport from "../../../../queries/teacherApp/fetchPqIndividualStudentReport";
import {
  getFilteredLoComponentRule,
  getLORedirectKey,
} from "../../../UpdatedSessions/utils";
import { checkIfEmbedEnabled, getEmbedData } from '../../../../utils/teacherApp/checkForEmbed'
import getIframeUrl from "../../../../utils/teacherApp/getIframeUrl";
import UpdatedButton from "../../../../components/Buttons/UpdatedButton/UpdatedButton";
import getCourseId, { getCoursePackageId } from "../../../../utils/getCourseId";
import { RightArrow } from "../../components/svg";
import { Power } from "../../../../constants/icons";
import { hsFor1280 } from "../../../../utils/scale";
import goBackToTeacherApp from "../../../../utils/teacherApp/goBackToTeacherApp";
import NextFooter from "../../../../components/NextFooter";
import { API_CALL_TIME } from "../../../Signup/schoolLiveClassLogin/constants/constants";
import getClassworkSummary from "../../../../queries/teacherApp/getClassworkSummary";

function PqReport(props) {
  const [route, setRoute] = useState("questions");
  const [currentStudentId, setCurrentStudentId] = useState("");
  const [topicComponentRuleData, setTopicComponentRuleData] = useState([])
  const [courseLoComponentRuleData, setCourseLoComponentRuleData] = useState([])
  const [isTopicPQFetched, setIsTopicPQFetched] = useState(false)
  const [isPQReportFetched, setIsPQReportFetched] = useState(false)
  // const prevTopicId = getEmbedData('prevTopicId');
  // const currentSessionId = getEmbedData("sessionId");
  const currentTopicId = getEmbedData("topicId");
  const currentBatchId = getEmbedData("batchId");
  const currentCourseId = getEmbedData("courseId");
  const learningObjectiveId = get(props, 'match.params.loId') || getEmbedData("componentId");
  const isRevisit = getEmbedData("isRevisit") || false;

  const { history } = props;
  const newTopicDetailDataPq =
    props.fetchTopicPq && props.fetchTopicPq.toJS()[0];

  const newIndividualStudentReport =
    props.fetchIndividualStudentReport &&
    props.fetchIndividualStudentReport.toJS();

  const newTopicDetailDataPqStatus =
    props.fetchTopicPqStatus && props.fetchTopicPqStatus.toJS().topicDetailPq;
  const newStatus =
    props.fetchPqReportDetailStatus &&
    props.fetchPqReportDetailStatus.toJS().fetchPqReportDetail;


  const newPqReportData =
    props.fetchPqReportDetail && props.fetchPqReportDetail.toJS();
  const pqQuestions =
    props.fetchQuizQuestionsPq &&
    props.fetchQuizQuestionsPq.toJS()[0].questionBank;

  function routeToNextComponent() {
    const sortedTopicComponentRule = [...topicComponentRuleData].sort(
      (a, b) => get(a, "order") - get(b, "order")
    );

    // loId is url id
    // el.learningObjective.id is the sorted topic component rule learning objective id
    const currentTopicComponentIndex = sortedTopicComponentRule.findIndex(
      (el) =>
        el.learningObjective && el.learningObjective.id === learningObjectiveId
    );

    let nextComponent = null;
    if (sortedTopicComponentRule[currentTopicComponentIndex + 1]) {
      nextComponent = sortedTopicComponentRule[currentTopicComponentIndex + 1];
    }
    const currentComponentRule = sortedTopicComponentRule[currentTopicComponentIndex]
    let LoRedirectKey = "comic-strip";
    if ((courseLoComponentRuleData && courseLoComponentRuleData.length) || ((get(currentComponentRule, 'learningObjectiveComponentsRule', []) || []).length)) {
      const sortedDefaultTopicComponentRule = [
        ...courseLoComponentRuleData,
      ].sort((a, b) => get(a, "order") - get(b, "order"));

      const filteredLoComponentRule = getFilteredLoComponentRule(
        get(currentComponentRule, "learningObjective", {}),
        sortedDefaultTopicComponentRule,
        (get(currentComponentRule, 'learningObjectiveComponentsRule', []) || [])
      );
      const currentLoComponentIndex = filteredLoComponentRule.findIndex(componentRule =>
        ['practiceQuestion', 'chatbot', 'learningSlide'].includes(get(componentRule, 'componentName')))
      const nextLoComponent = filteredLoComponentRule[currentLoComponentIndex + 1]
      if (nextLoComponent && Object.keys(nextLoComponent).length) {
        LoRedirectKey = getLORedirectKey(nextLoComponent);
        const redirectUrl = getIframeUrl({
          courseId: (currentTopicId && getCoursePackageId()) ? getCourseId(currentTopicId) : currentCourseId,
          topicId: currentTopicId && currentTopicId,
          componentName: LoRedirectKey,
          componentId: get(currentComponentRule,'learningObjective.id'),
          isRevisit,
          isLoComponent:true
        })

        if (redirectUrl) {
          return history.push(redirectUrl)
        }
      }
    }

    if (nextComponent && nextComponent.componentName === "blockBasedProject") {
      history.push(getIframeUrl({
        courseId: (currentTopicId && getCoursePackageId()) ? getCourseId(currentTopicId) : currentCourseId,
        topicId: currentTopicId && currentTopicId,
        componentId: get(nextComponent, "blockBasedProject.id"),
        componentName: get(nextComponent, "componentName"),
        isRevisit,
      }))
    } else if (nextComponent && nextComponent.componentName === "video") {
      history.push(getIframeUrl({
        courseId: (currentTopicId && getCoursePackageId()) ? getCourseId(currentTopicId) : currentCourseId,
        topicId: currentTopicId && currentTopicId,
        componentId: get(nextComponent, "video.id"),
        componentName: get(nextComponent, "componentName"),
        isRevisit,
      }))
    } else if (
      nextComponent &&
      nextComponent.componentName === "blockBasedPractice"
    ) {
      history.push(getIframeUrl({
        courseId: (currentTopicId && getCoursePackageId()) ? getCourseId(currentTopicId) : currentCourseId,
        topicId: currentTopicId && currentTopicId,
        componentId: get(nextComponent, "blockBasedProject.id"),
        componentName: get(nextComponent, "componentName"),
        isRevisit,
      }))
    } else if (nextComponent && nextComponent.componentName === "assignment") {
      history.push(getIframeUrl({
        courseId: (currentTopicId && getCoursePackageId()) ? getCourseId(currentTopicId) : currentCourseId,
        topicId: currentTopicId && currentTopicId,
        componentName: get(nextComponent, "componentName"),
        isRevisit,
      }))
    } else {
      if (
        nextComponent &&
        nextComponent.componentName === "learningObjective"
      ) {
        if (get(nextComponent, "learningObjective", {})) {
          let LoRedirectKey = "comic-strip";
          if (courseLoComponentRuleData && courseLoComponentRuleData.length) {
            const sortedDefaultTopicComponentRule = [
              ...courseLoComponentRuleData,
            ].sort((a, b) => get(a, "order") - get(b, "order"));

            const filteredLoComponentRule = getFilteredLoComponentRule(
              get(nextComponent, "learningObjective", {}),
              sortedDefaultTopicComponentRule,
              (get(nextComponent, 'learningObjectiveComponentsRule', []) || [])
            );
            if (filteredLoComponentRule && filteredLoComponentRule.length) {
              LoRedirectKey = getLORedirectKey(filteredLoComponentRule[0]);
            }
          }
          history.push(getIframeUrl({
            courseId: (currentTopicId && getCoursePackageId()) ? getCourseId(currentTopicId) : currentCourseId,
            topicId: currentTopicId && currentTopicId,
            componentName: LoRedirectKey,
            componentId: get(nextComponent,'learningObjective.id'),
            isRevisit,
            isLoComponent:true
          }))
        }
      }
    }
  }

  const getNextAndCurrentComponent = () => {
    const sortedTopicComponentRule = [...topicComponentRuleData].sort(
      (a, b) => get(a, "order") - get(b, "order")
    );
    const sortedDefaultTopicComponentRule = [
        ...courseLoComponentRuleData,
    ].sort((a, b) => get(a, "order") - get(b, "order"));
    const currentTopicComponentIndex = sortedTopicComponentRule.findIndex(
      (el) =>
        el.learningObjective && el.learningObjective.id === learningObjectiveId
    );
    const currentComponent = sortedTopicComponentRule[currentTopicComponentIndex]
    const nextComponent = sortedTopicComponentRule[currentTopicComponentIndex + 1]
    let isNextComponentExist = false
    if ((sortedDefaultTopicComponentRule && sortedDefaultTopicComponentRule.length) || ((get(currentComponent, 'learningObjectiveComponentsRule', []) || []).length)) {

      const filteredLoComponentRule = getFilteredLoComponentRule(
        get(currentComponent, "learningObjective", {}),
        sortedDefaultTopicComponentRule,
        (get(currentComponent, 'learningObjectiveComponentsRule', []) || [])
      );
      const currentLoComponentIndex = filteredLoComponentRule.findIndex(componentRule =>
        ['practiceQuestion', 'chatbot', 'learningSlide'].includes(get(componentRule, 'componentName')))
      const nextLoComponent = filteredLoComponentRule[currentLoComponentIndex + 1]
      if (nextLoComponent && Object.keys(nextLoComponent).length) {
        isNextComponentExist = true
      }
    }
    if (nextComponent) {
      isNextComponentExist = true
    }
    return {
      currentComponent, nextComponent, isNextComponentExist
    }
  }

  useEffect(() => {
    (async function () {
      const newCourseId = (currentTopicId && getCoursePackageId()) ? getCourseId(currentTopicId) : currentCourseId
      await fetchTopicDetailPq(currentTopicId, currentBatchId, newCourseId).then((res) => {
        if (res && get(res, 'topicDetailPq', []).length && get(res, 'topicDetailPq[0].homeworkReviewTopic.topicComponentRule', []).length) {
          setCourseLoComponentRuleData(get(res, 'topicDetailPq[0].homeworkReviewCourse.defaultLoComponentRule'))
          setTopicComponentRuleData(get(res, 'topicDetailPq[0].homeworkReviewTopic.topicComponentRule'))
          setIsTopicPQFetched(true)
        }
      });
    })();
  }, []);

  useEffect(() => {
    if (isTopicPQFetched) {
      const newTopicDetailDataPq1 =
        props.fetchTopicPq && props.fetchTopicPq.toJS();

      const batchId = get(newTopicDetailDataPq1[0], "batch.id", "");
      // const courseId = get(
      //   newTopicDetailDataPq1[0],
      //   "homeworkReviewCourse.id",
      //   ""
      // );
      const topicId = get(
        newTopicDetailDataPq1[0],
        "homeworkReviewTopic.id",
        ""
      );

      const firstStudentId = get(
        newTopicDetailDataPq1[0],
        "batch.students[0].user.id",
        []
      );
      if (currentStudentId === "") {
        setCurrentStudentId(firstStudentId);
      }
      fetchQuizQuestionsPq(learningObjectiveId);
      fetchPqReportDetail(batchId, topicId, learningObjectiveId).then(res => {
        setIsPQReportFetched(true)
      });
    }
  }, [isTopicPQFetched]);

  useEffect(() => {
    if (isTopicPQFetched) {
      const newTopicDetailDataPq1 =
        props.fetchTopicPq && props.fetchTopicPq.toJS();

      const batchId = get(newTopicDetailDataPq1[0], "batch.id", "");
      const topicId = get(
        newTopicDetailDataPq1[0],
        "homeworkReviewTopic.id",
        ""
      );
      let timer
      timer = setInterval(async() => checkIfEmbedEnabled() && await getClassworkSummary(batchId,topicId),API_CALL_TIME)
      return () => clearTimeout(timer)
    }
  }, [isTopicPQFetched]);

  useEffect(() => {
    if (isTopicPQFetched) {
      const newTopicDetailDataPq1 =
        props.fetchTopicPq && props.fetchTopicPq.toJS();

      const courseId = get(
        newTopicDetailDataPq1[0],
        "homeworkReviewCourse.id",
        ""
      );

      fetchPqStudentReport(currentStudentId, courseId, learningObjectiveId);
    }
  }, [currentStudentId]);
  const getButtonTitle = () => {
    const { isNextComponentExist } = getNextAndCurrentComponent()
    const isRevisitRoute = props.match.path.includes("/revisit")
    if (isNextComponentExist) {
      return "Next"
    } else {
      if (isRevisitRoute) {
        return `Back to ${getEmbedData("backToPage")}`
      }
      return 'END SESSION'
    }
  }
  const buttonTitle = getButtonTitle()
  const isNotEndSessionButton = buttonTitle !== 'END SESSION'
  const isNextButtonText = buttonTitle === 'Next'
  const onNextButtonClick = () => {
    const { isNextComponentExist } = getNextAndCurrentComponent()
    const isRevisitRoute = props.match.path.includes("/revisit")
    if (isNextComponentExist) {
      return routeToNextComponent()
    }
    if (isRevisitRoute) {
      return goBackToTeacherApp("backToSession")
    }
    goBackToTeacherApp("endSession")
  }
  return (
    <>
      {!isPQReportFetched ? (
        <div
          style={{
            width: "100%",
            height: "800px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LoadingSpinner />
        </div>
      ) : (
        <div
          style={{ marginLeft: "20px", paddingBottom: hsFor1280(80) }}
          className="pq_reports_page_embed_container"
        >
          <span className="pq-report-page-mixpanel-identifier" />
          {/* <UpdatedSideNavBar
            mobileNav
            parent="sessions"
            revisitRoute={props.match.path.includes("/revisit")}
            computedMatch={props.computedMatch || props.match}
            pageTitle="Report"
          /> */}
          <div className="pq__report__header__main__container">
            <PqReportHeader
              newPqReportData={newPqReportData}
              pqQuestions={pqQuestions}
            />
          </div>
          <Tabswitch
            setRoute={setRoute}
            route={route}
            newTopicDetailDataPq={newTopicDetailDataPq}
            setCurrentStudentId={setCurrentStudentId}
          />

          {route === "questions" && (
            <div className="pq__report__coding__question">
              <PqReportQuestionSection
                pqQuestions={pqQuestions}
                newPqReportData={newPqReportData}
              />
            </div>
          )}
          {route === "students" && (
            <div className="pq__report__coding__question">
              <PqReportQuestionSectionStudent
                pqQuestions={{
                  questionBank: pqQuestions
                }}
                newIndividualStudentReport={newIndividualStudentReport}
              />
            </div>
          )}
          <NextFooter
            match={props.match}
            lastItem={true}
            />
          </div>
      )}
    </>
  );
}

export default PqReport;
