import React from "react";
import { get, sortBy } from "lodash";
import Grid from "./components/GridSystem/Grids";
import SlideHeader from "./components/SlideHeader/SlideHeader";
import { getFilteredLoComponentRule, getInSessionRoute, getLoComponentMapping, getLORedirectKey, getNextLoComponentRoute, } from "../utils";
import { thisComponentRule } from "../../../components/UpdatedSideNavBar/utils";
import mentorMenteeSessionAddOrDelete from "../../../utils/mmSessionAddOrDelete";
import fetchMentorMenteeSession from "../../../queries/sessions/fetchMentorMenteeSession";
import updateMentorMenteeSession from "../../../queries/sessions/updateMentorMenteeSession";
import WrongAnswer from "../PracticeQuiz/components/WrongAnswerOverlay/WrongAnswerOverlay";
import requestToGraphql from "../../../utils/requestToGraphql";
import {
  visibleHintOverlay,
  visibleCorrectAnswerOverlay,
  ARRANGE,
  FIBBLOCK,
  FIBINPUT,
  MCQ,
} from "../PracticeQuiz/constants";
import CorrectAnswerOverlay from "../PracticeQuiz/components/CorrectAnswerOverlay";
import HelpOverlay from "../PracticeQuiz/components/HelpOverlay";
import Footer from "../PracticeQuiz/components/Footer";
import "./LearningSlides.scss";
import { fromJS, Map } from "immutable";
import addLearningSlideDump from "../../../queries/learningSlides/addUserActivityLearningSlideDump";
import { Helmet } from "react-helmet";
import { hs } from "../../../utils/size";
import { learningSlideType } from "../../../utils/constants/learningSlideConstants";
import duck from "../../../duck";
import gql from "graphql-tag";
import store from "../../../store";
import fetchMentorFeedback from "../../../queries/fetchMentorFeedback";
import MentorFeedback from "../../../components/MentorFeedback";
import fetchMenteeCourseSyllabus from "../../../queries/sessions/fetchMenteeCourseSyllabus";
import { checkIfEmbedEnabled, getEmbedData, isAccessingTrainingResources, isPqReportNotAllowed } from "../../../utils/teacherApp/checkForEmbed";
import isMobile from "../../../utils/isMobile";
import { AnimatePresence, motion } from "framer-motion";
import UpdatedButton from "../../../components/Buttons/UpdatedButton/UpdatedButton";
import getCourseId from '../../../utils/getCourseId'
import ShowSolutionToggle from '../../../components/ShowSolutionToggle'
import { Power } from "../../../constants/icons";
import Skeleton from "./components/Skeleton";
import fetchComponents from "../../../queries/fetchComponents";
import { learningObjectiveComponents } from "../../../config";
import goBackToTeacherApp from "../../../utils/teacherApp/goBackToTeacherApp";
import NextFooter from "../../../components/NextFooter";
import { backToPageConst } from '../../TeacherApp/constants/index'
import GoogleSlide from "./components/GoogleSlide";
import extractSubdomain from "../../../utils/extractSubdomain";
import { getDataFromLocalStorage } from "../../../utils/data-utils";
import getClassworkSummary from "../../../queries/teacherApp/getClassworkSummary";

const MAX_TABS_PER_FRAME = 10;

const initialLSState = {
  loading: true,
  initialLoading: true,
  learningSlides: [],
  learningSlideInfo: [],
  currentLearningSlide: null,
  currentLearningSlideData: {},
  visiblePqStoryOverlay: false,
  visibleHintOverlay: false,
  visibleCorrectAnswerOverlay: false,
  visibleWrongAnswerMessage: false,
  learningSlideDumpIds: {},
  hints: [],
  answers: [[]],
  learningSlidesArray: [],
  practiceQuestionsArray: [],
  nextButtonLoading: false,
  direction: 1,
  skipSlideRange: 0,
  answerVerified: false,
  prevAnswer: null,
  incrementFrame: false,
  nextSlides: {},
  learningSlideUnmodifiedData: [],
  practiceQuestionsDataArray: {},
  isSeeAnswers: false
}
class LearningSlides extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...initialLSState
    };
  }
  async componentDidMount() {
    const { topicId, courseId } = this.props.match.params;
    let doesPracticeExist = get(
      thisComponentRule('learningObjective', topicId, this.props.loId),
      'learningObjective.practiceQuestionLearningSlidesMeta.count',
      0
    ) > 0
    if (checkIfEmbedEnabled() && !doesPracticeExist) doesPracticeExist = true
    await fetchComponents(
      topicId,
      courseId,
    ).components([
      {
        type: learningObjectiveComponents.learningSlide, arg: {
          loId: this.props.loId,
          doesPracticeExist
        }
      }
    ])

    if (checkIfEmbedEnabled()) {
      const classroomSessionsData = getDataFromLocalStorage('classroomSessionsData')
      const batchId = get(classroomSessionsData, 'batchId')
      const topicId = get(classroomSessionsData, 'topicId')
      if (checkIfEmbedEnabled()) {
        await getClassworkSummary(batchId, topicId)
      }
    }

    const menteeId = this.props.userId;
    mentorMenteeSessionAddOrDelete(
      menteeId,
      topicId,
      "",
      "started",
      "other",
      () =>
        fetchMentorMenteeSession(
          null,
          null,
          menteeId,
          "menteeTopicFilter",
          null,
          true,
          topicId,
          null
        ).call()
    );
    this.setInitialLearningSlide()
  }
  setInitialLearningSlide = async () => {
    let data = [];
    const { userLearningObjective } = this.props;
    let dataDumpCall = {};
    // let additionalInfo = [];
    let practiceQuestionsArray = [];
    if (get(userLearningObjective.toJS(), "learningSlides", []).length) {
      get(userLearningObjective.toJS(), "learningSlides").forEach((elem, idx) => {
        if (get(elem, "learningSlide.id")) {
          dataDumpCall[get(elem, "learningSlide.id")] =
            elem.status === "complete" ? true : false;
          // additionalInfo.push({
          //   isHintUsed: false,
          //   attemptNumber: elem.status === "complete" ? 1 : 0,
          // });
          data.push({
            ...elem,
            status: elem.status === "complete" ? "complete" : "default",
            order: get(elem, "learningSlide.order"),
          });
        }
      });
    }
    data = sortBy(data, 'order')
    if (userLearningObjective.toJS() && get(userLearningObjective.toJS(), 'practiceQuestions', []).length) {
      const practiceQuestionsData = get(userLearningObjective.toJS(), 'practiceQuestions', [])
      data = data.map((ls) => {
        if (get(ls, 'learningSlide.type') === "practiceQuestion") {
          const findPq = practiceQuestionsData.find(pq => get(pq, 'question.id') === (get(ls, 'learningSlide.pqQuestion[0].id') || get(ls, 'learningSlide.practiceQuestions[0].id')))
          return { ...ls, attemptNumber: get(findPq, 'attemptNumber') || 0, isHintUsed: get(findPq, 'isHintUsed') ? get(findPq, 'isHintUsed') : false, isAnswerUsed: get(findPq, 'isAnswerUsed') ? get(findPq, 'isAnswerUsed') : false, totalAttemptCount: get(findPq, 'totalAttemptCount') || 0, }
        }
        return { ...ls }
      })
    }
    let currentLearningSlide = 0;
    let defaultData = [];
    const isRevisit = this.props.match.path.includes("/revisit");
    if (data.length) {
      practiceQuestionsArray = data.filter(
        (ls) =>
          get(ls, "learningSlide.type") === learningSlideType.practiceQuestion
      );
    }
    if (checkIfEmbedEnabled() && !isAccessingTrainingResources()) {
      data = data.map((elem) => {
        if (!dataDumpCall[get(elem, "learningSlide.id")])
          dataDumpCall[get(elem, "learningSlide.id")] = true;
        if (elem.status !== "complete") return { ...elem, status: "complete" };
        return { ...elem };
      });
    }
    defaultData = [...data];
    let remainingInLastFrame = 0;
    if (data.length > MAX_TABS_PER_FRAME) {
      remainingInLastFrame = MAX_TABS_PER_FRAME - (data.length % 10);
      let startingIndex = data.length - (data.length % 10);
      for (let i = 0; i < remainingInLastFrame; i++) {
        data.splice(
          startingIndex,
          0,
          data[startingIndex - remainingInLastFrame]
        );
        startingIndex++;
      }
    }
    if (data.length) {
      const completedLS = data.filter(
        (slide) => get(slide, "status") === "complete"
      );
      if (completedLS.length) {
        const lastCompletedSlide = completedLS[completedLS.length - 1];
        if (lastCompletedSlide) {
          currentLearningSlide = data.findIndex(
            (slide) =>
              get(slide, "learningSlide.id") ===
              get(lastCompletedSlide, "learningSlide.id")
          );
        }
      }
    }
    if (isRevisit || checkIfEmbedEnabled()) currentLearningSlide = 0;
    let queryArr = [];
    let nextSlidesQuery = [];
    if (isRevisit || checkIfEmbedEnabled()) {
      for (let i = 0; i < MAX_TABS_PER_FRAME; i++) {
        if (get(defaultData[i], "learningSlide.id")) queryArr.push(get(defaultData[i], "learningSlide.id"));
      }
    } else {
      if (currentLearningSlide) {
        for (let i = 0; i < currentLearningSlide; i++) {
          if (get(defaultData[i], "learningSlide.id")) queryArr.push(get(defaultData[i], "learningSlide.id"));
        }
      }
      let dataRange = Math.min(defaultData.length - currentLearningSlide, 3);
      for (let i = 0; i < dataRange; i++) {
        if (get(defaultData[currentLearningSlide + i], "learningSlide.id")) {
          nextSlidesQuery.push(
            get(defaultData[currentLearningSlide + i], "learningSlide.id")
          );
        }
      }
    }
    queryArr = queryArr.concat(nextSlidesQuery);
    let nextSlidesData = data.map((item) => get(item, 'learningSlide'))
    let nextSlidesDataObj = this.createNextSlidesObj(nextSlidesData);
    let currentIdKey = get(
      data,
      `[${currentLearningSlide}].learningSlide.id`
    );
    this.setState({
      learningSlides: data,
      nextSlides: nextSlidesDataObj,
      loading: false,
      initialLoading: false,
      learningSlideDumpIds: dataDumpCall,
      learningSlideUnmodifiedData: defaultData,
      currentLearningSlide: this.findCurrentSlide(
        currentLearningSlide,
        data,
        remainingInLastFrame
      ),
      currentLearningSlideData: get(nextSlidesDataObj, currentIdKey, {}),
      // additionalInfo: additionalInfo,
      practiceQuestionsArray,
      skipSlideRange: remainingInLastFrame,
    });
  }
  setFrame = (value) => {
    if (this.state.currentLearningSlide === this.state.learningSlides.length - 1) return
    this.setState({ incrementFrame: value });
  };

  appendPracticeQuestionId = (questionId) => {
    this.setState({
      practiceQuestionsDataArray: { ...this.state.practiceQuestionsDataArray, [questionId]: true }
    })
  }

  getCurrentIdKey = (idx, id) => {
    return idx + "-" + id;
  };

  createNextSlidesObj = (data) => {
    let finalObj = {};
    data.forEach((singleDataObj) => {
      let currentLearningSlideId = get(singleDataObj, "id");
      finalObj[currentLearningSlideId] = singleDataObj;
    });
    return finalObj;
  };

  findLastQueryIndex(lastId, data) {
    let foundIdx = data.findIndex((singleElem) => {
      return get(singleElem, "learningSlide.id") === lastId;
    });
    return foundIdx + 1;
  }

  async componentDidUpdate(prevProps, prevState) {
    const { learningSlideData, learningSlideFetchStatus } = this.props;
    const { loId } = this.props.match.params
    const isRevisit = this.props.match.path.includes("/revisit");
    let currentLearningSlide = this.state.currentLearningSlide;
    if (
      learningSlideFetchStatus &&
      !get(learningSlideFetchStatus.toJS(), "loading") &&
      get(learningSlideFetchStatus.toJS(), "success") &&
      prevProps.learningSlideFetchStatus !== learningSlideFetchStatus
    ) {
      const learningSlideArray = learningSlideData && learningSlideData.toJS();
      if (learningSlideArray && learningSlideArray.length) {
        let hints = [];
        if (
          get(learningSlideArray[0], "practiceQuestions[0].hints", []).length
        ) {
          hints = [...get(learningSlideArray[0], "practiceQuestions[0].hints")];
        }
        let currentDataObj;
        if (
          this.state.currentLearningSlideData &&
          this.state.currentLearningSlideData.fromCache
        ) {
          currentDataObj = {
            ...this.state.currentLearningSlideData,
            startTime: new Date().toISOString(),
          };
        } else
          currentDataObj = {
            ...get(learningSlideArray, "[0]"),
            startTime: new Date().toISOString(),
          };
        this.setState({
          loading: false,
          initialLoading: false,
          answers: [[]],
          hints,
          currentLearningSlideData: currentDataObj,
        });
      } else {
        this.setState({
          loading: false,
          initialLoading: false,
          answers: [[]],
        });
      }
    }
    if (this.state.isSeeAnswers !== prevState.isSeeAnswers) {
      if (!this.state.isSeeAnswers) {
        this.setState({
          visibleCorrectAnswerOverlay: false,
        })
      }
    }
    if (prevState.currentLearningSlide !== this.state.currentLearningSlide) {
      if (
        prevState.currentLearningSlide === null ||
        prevState.currentLearningSlide === undefined
      )
        return;
      this.setState({ isSeeAnswers: false })
      if (!this.state.direction) return;
      if (
        this.state.nextSlides.length ===
        this.state.learningSlideUnmodifiedData.length
      )
        return;
      let queryArr = [];
      let skippedQueryArr = [];
      if (isRevisit) {
        let firstId = get(this.state.learningSlides, `[${currentLearningSlide}].learningSlide.id`, '');
        if (firstId && this.state.nextSlides[firstId]) return;
        let start = Math.floor(currentLearningSlide / MAX_TABS_PER_FRAME) * MAX_TABS_PER_FRAME
        for (
          let i = start;
          i <
          Math.min(
            currentLearningSlide + MAX_TABS_PER_FRAME,
            this.state.learningSlideUnmodifiedData.length
          );
          i++
        ) {
          queryArr.push(
            get(this.state.learningSlideUnmodifiedData[i], "learningSlide.id")
          );
        }
        this.setState({
          currentLearningSlideData: this.state.learningSlideUnmodifiedData[
            get(this.state.learningSlideUnmodifiedData[currentLearningSlide])
          ],
        });
      } else {
        let keys = Object.keys(this.state.nextSlides);
        let lastId = keys[keys.length - 1];
        let lastQueryIndex = this.findLastQueryIndex(
          lastId,
          this.state.learningSlideUnmodifiedData
        );
        if (lastQueryIndex >= this.state.learningSlideUnmodifiedData.length)
          return;
        let isSkipped = currentLearningSlide > lastQueryIndex;
        if (isSkipped) {
          for (let i = lastQueryIndex; i < currentLearningSlide; i++) {
            skippedQueryArr.push(
              get(this.state.learningSlideUnmodifiedData[i], "learningSlide.id")
            );
          }
        }
        for (
          let pointer = skippedQueryArr.length
            ? currentLearningSlide + 1
            : lastQueryIndex;
          pointer <
          Math.min(
            this.state.learningSlideUnmodifiedData.length,
            skippedQueryArr.length
              ? currentLearningSlide + 3
              : lastQueryIndex + 3
          );
          pointer++
        ) {
          queryArr.push(
            get(
              this.state.learningSlideUnmodifiedData[pointer],
              "learningSlide.id"
            )
          );
        }
      }
      queryArr = skippedQueryArr.concat(queryArr);
      if (queryArr.length) {
        // let nextSlidesData = await fetchLearningSlide(
        //   getIdArrForQuery(queryArr)
        // );
        // let nextSlidesObj = this.createNextSlidesObj(nextSlidesData);
        // this.setState({
        //   nextSlides: {
        //     ...this.state.nextSlides,
        //     ...nextSlidesObj,
        //   },
        // });
      }
    }
    if (get(prevProps, 'match.params.loId') !== loId) {
      const { topicId, courseId } = this.props.match.params;
      this.setState({ ...initialLSState })
      let doesPracticeExist = get(
        thisComponentRule('learningObjective', topicId, this.props.loId),
        'learningObjective.practiceQuestionLearningSlidesMeta.count',
        0
      ) > 0
      if (checkIfEmbedEnabled() && !doesPracticeExist) doesPracticeExist = true
      await fetchComponents(
        topicId,
        courseId,
      ).components([
        {
          type: learningObjectiveComponents.learningSlide, arg: {
            loId: this.props.loId,
            doesPracticeExist
          }
        }
      ])

      this.setInitialLearningSlide()
    }
  }

  checkIfAnotherAnsSelected = () => {
    const { prevAnswer, answers } = this.state;
    if (prevAnswer && answers[0] && prevAnswer === answers[0]) return true;
    return false;
  };
  goToNextComponentCheck = async () => {
    const { topicId, loId, courseId } = this.props.match.params;
    const isRevisit = this.props.match.path.includes("/revisit");
    const { nextComponent, currentComponent } = this.getNextComponent();
    const { course } = this.props;
    const sortedLoComponentRule =
      course &&
      sortBy(course.getIn(["defaultLoComponentRule"], Map([])).toJS(), [
        "order",
      ]);
    const redirectUrl = getNextLoComponentRoute({
      course,
      learningObjective: this.props.learningObjective,
      learningObjectiveId: loId,
      topicComponentRule: currentComponent,
      courseId,
      topicId,
      childComponentsName: ['learningSlide']
    })
    if (redirectUrl) {
      this.props.history.push(redirectUrl)
      return
    }
    if (nextComponent) {
      const { redirectUrl } = getInSessionRoute({
        topicComponentRule: nextComponent,
        course: {
          id: courseId,
          defaultLoComponentRule: sortedLoComponentRule
        },
        topicId,
        learningObjectives: this.props.learningObjective,
        goToNextComponent: true,
      })
      if (redirectUrl) {
        return this.props.history.push(redirectUrl)
      }
    }
    if (isRevisit) {
      if (checkIfEmbedEnabled()) {
        return goBackToTeacherApp("backToSession")
      }
      return this.props.history.push("/sessions");
    }
    if (checkIfEmbedEnabled()) {
      goBackToTeacherApp("endSession")
    }
    this.endSession();
  };

  getNextLoComponent = (nextComponent) => {
    const { course } = this.props;
    const sortedLoComponentRule =
      course &&
      sortBy(course.getIn(["defaultLoComponentRule"], Map([])).toJS(), [
        "order",
      ]);
    const sortedLo = this.props.learningObjective && this.props.learningObjective.toJS && this.props.learningObjective.toJS()
    const filteredLo =
      sortedLo &&
      sortedLo
        .filter((lo) => lo.id === nextComponent.learningObjective.id);
    let LoRedirectKey = "comic-strip";
    if (
      filteredLo &&
      filteredLo.length &&
      sortedLoComponentRule &&
      sortedLoComponentRule.length
    ) {
      const filteredLoComponentRule = getFilteredLoComponentRule(
        filteredLo[0],
        sortedLoComponentRule,
        (get(nextComponent, 'learningObjectiveComponentsRule', []) || [])
      );
      if (filteredLoComponentRule && filteredLoComponentRule.length) {
        LoRedirectKey = getLORedirectKey(filteredLoComponentRule[0]);
      }
    }
    return LoRedirectKey;
  };


  getNextComponentDetails = () => {
    const { course } = this.props;
    const { nextComponent, currentComponent } = this.getNextComponent();
    let componentDetail = {};
    const sortedLoComponentRule =
      course &&
      sortBy(course.getIn(["defaultLoComponentRule"], Map([])).toJS(), [
        "order",
      ]);
    const nextLoComponentLoKey = this.getNextLoOfCurrentComponent(currentComponent, sortedLoComponentRule)
    if (nextLoComponentLoKey) {
      const LoTitle = get(currentComponent, "learningObjective.title")
        ? `( ${get(currentComponent, "learningObjective.title")} )`
        : "";
      const LoId = get(currentComponent, "learningObjective.id");
      return getLoComponentMapping(nextLoComponentLoKey, LoId, LoTitle)
    }
    if (nextComponent && nextComponent.componentName === "video") {
      const videoId = get(nextComponent, "video.id");
      componentDetail = {
        id: videoId,
        title: "Video",
      };
    } else if (
      nextComponent &&
      nextComponent.componentName === "learningObjective"
    ) {
      const LoRedirectKey = this.getNextLoComponent(nextComponent);
      const LoTitle = get(nextComponent, "learningObjective.title")
        ? `( ${get(nextComponent, "learningObjective.title")} )`
        : "";
      const LoId = get(nextComponent, "learningObjective.id");
      componentDetail = getLoComponentMapping(
        LoRedirectKey,
        LoId,
        LoTitle
      );
    } else if (
      nextComponent &&
      nextComponent.componentName === "blockBasedProject"
    ) {
      const projectTitle = get(nextComponent, "blockBasedProject.title")
        ? `( ${get(nextComponent, "blockBasedProject.title")} )`
        : "";
      componentDetail = {
        id: get(nextComponent, "blockBasedProject.id"),
        title: "Project",
      };
    } else if (
      nextComponent &&
      nextComponent.componentName === "blockBasedPractice"
    ) {
      const projectTitle = get(nextComponent, "blockBasedProject.title")
        ? `( ${get(nextComponent, "blockBasedProject.title")} )`
        : "";
      componentDetail = {
        id: get(nextComponent, "blockBasedProject.id"),
        title: "Practice",
      };
    } else if (nextComponent && nextComponent.componentName === "assignment") {
      componentDetail = {
        id: null,
        title: "Coding Assignment",
      };
    }
    return componentDetail;
  };

  getNextComponent = () => {
    const { topicId, loId } = this.props.match.params;
    const topicJS = this.props.topics
      .toJS()
      .filter((topic) => topic.id === topicId);
    const topicComponentRule = get(topicJS, '[0].topicComponentRule', [])
    let sortedTopicComponentRule = topicComponentRule.sort(
      (a, b) => (a.order > b.order && 1) || -1
    );
    sortedTopicComponentRule = (sortedTopicComponentRule || []).filter(
      (el) =>
        !["homeworkAssignment", "quiz", "homeworkPractice"].includes(
          get(el, "componentName")
        )
    );
    const currentTopicComponentIndex = sortedTopicComponentRule.findIndex(
      (el) => el.learningObjective && el.learningObjective.id === loId
    );
    let nextComponent = null;
    if (sortedTopicComponentRule[currentTopicComponentIndex + 1]) {
      nextComponent = sortedTopicComponentRule[currentTopicComponentIndex + 1];
    }
    return {
      nextComponent,
      currentComponent: sortedTopicComponentRule[currentTopicComponentIndex] || null
    };
  };
  getNextLoOfCurrentComponent = (currentComponent, sortedLoComponentRule) => {
    let filteredLo = this.props.learningObjective && this.props.learningObjective.toJS().filter(lo => get(lo, 'id') === currentComponent.learningObjective.id)
    let LoRedirectKey = ''
    if (filteredLo && filteredLo.length && sortedLoComponentRule && sortedLoComponentRule.length) {
      const filteredLoComponentRule = getFilteredLoComponentRule(filteredLo[0], sortedLoComponentRule, (get(currentComponent, 'learningObjectiveComponentsRule', []) || []))
      const currentLoComponentIndex = filteredLoComponentRule.findIndex(componentRule => get(componentRule, 'componentName') === 'learningSlide')
      const nextLoComponent = filteredLoComponentRule[currentLoComponentIndex + 1]
      if (nextLoComponent && Object.keys(nextLoComponent).length) {
        LoRedirectKey = getLORedirectKey(nextLoComponent)
      }
    }
    return LoRedirectKey
  }
  getButtonTitle = (revisitRoute, byPassReports = false) => {
    const { nextComponent, currentComponent } = this.getNextComponent();
    const { course } = this.props;
    if (this.state.practiceQuestionsArray.length && !byPassReports) {
      return "Next Up: Report";
    }
    const sortedLoComponentRule =
      course &&
      sortBy(course.getIn(["defaultLoComponentRule"], Map([])).toJS(), [
        "order",
      ]);
    const nextLoComponentLoKey = this.getNextLoOfCurrentComponent(currentComponent, sortedLoComponentRule)
    if (nextLoComponentLoKey) {
      const LoTitle = get(currentComponent, "learningObjective.title")
        ? `( ${get(currentComponent, "learningObjective.title")} )`
        : "";
      const LoId = get(currentComponent, "learningObjective.id");
      return `Next Up: ${getLoComponentMapping(nextLoComponentLoKey, LoId, LoTitle).title}`
    }
    if (nextComponent) {
      return `Next Up: ${this.getNextComponentDetails().title}`;
    }
    if (revisitRoute) {
      if (checkIfEmbedEnabled()) {
        return `Back to ${getEmbedData("backToPage")}`;
      }
      return "Back to Sessions";
    }
    return "END SESSION";
  };

  updateAnswers = (_activeQuestionIndex, toggleOptions) => {
    this.setState({ answers: [[...toggleOptions]] });
  };

  checkIfFibOrMcqAttempted = () => {
    const { answers } = this.state;
    for (let i = 0; i < answers[0].length; i = i + 1) {
      if (answers[0][i] && answers[0][i] !== "") {
        return true;
      }
    }
    return false;
  };

  checkIfAttempted = () => {
    const { answers, currentLearningSlideData } = this.state;
    let isCheckButtonActive = false;
    if (get(currentLearningSlideData, "type") === "practiceQuestion") {
      const questionData = get(
        currentLearningSlideData,
        "practiceQuestions[0]"
      );
      const questionType = get(questionData, "questionType");
      const arrangeOptions = get(questionData, "arrangeOptions", []);
      if (
        questionType === ARRANGE &&
        answers[0] &&
        answers[0].length !== 0 &&
        JSON.stringify(answers[0]) !==
        JSON.stringify([...Array(arrangeOptions.length).keys()])
      ) {
        isCheckButtonActive = true;
      } else if (
        (questionType === FIBINPUT ||
          questionType === FIBBLOCK ||
          questionType === MCQ) &&
        answers[0] &&
        answers[0].length !== 0
      ) {
        if (this.checkIfFibOrMcqAttempted()) {
          isCheckButtonActive = true;
        }
      }
    }
    return isCheckButtonActive;
  };
  fetchFeedbackForm = () => {
    fetchMentorFeedback(
      this.props.mentorMenteeSessionEndSession.getIn([0, "id"])
    ).call();
  };
  endSession = async () => {
    const { topicId, courseId } = this.props.match.params;
    const menteeId = this.props.userId;
    this.fetchFeedbackForm();
    const fetchMentorMenteeSessionToEnd = await requestToGraphql(
      gql`
                query {
                    mentorMenteeSessions(filter:{
                        and:[
                            {menteeSession_some: {user_some: {id: "${menteeId}"}}}
                            {topic_some: {id: "${topicId}"}}
                        ]
                    }) {
                        id
                        sessionStatus
                    }
                }   
            `
    );
    if (fetchMentorMenteeSessionToEnd) {
      if (
        get(fetchMentorMenteeSessionToEnd, "data.mentorMenteeSessions") &&
        get(fetchMentorMenteeSessionToEnd, "data.mentorMenteeSessions").length
      ) {
        const res = await updateMentorMenteeSession(
          get(fetchMentorMenteeSessionToEnd, "data.mentorMenteeSessions.0.id"),
          { sessionStatus: "completed", endSessionByMentee: new Date() },
          topicId,
          true,
          courseId
        ).call();
        if (res) {
          if (this.props.mentor && this.props.mentor.getIn(["id"])) {
            store.dispatch({
              type: "user/delete/success",
              payload: fromJS({
                extractedData: {
                  user: {
                    id: this.props.mentor && this.props.mentor.getIn(["id"]),
                  },
                },
              }),
              autoReducer: true,
            });
          }
        }
      }
    }
  };

  resetAnswers = () => {
    this.setState({
      answers: [[]]
    })
  }

  updateAnswersAdditionalInfo = (attemptNumberAddition = false, answerUsed = false) => {
    const isRevisit = this.props.match.path.includes("/revisit");

    const newLearningSlides = this.state.learningSlides.map((ls, index) => {
      if (get(ls, 'learningSlide.id') === get(this.state.currentLearningSlideData, 'id')) {
        let status = ls.status
        let isAnswerUsed = ls.isAnswerUsed || false
        if (answerUsed && status !== 'complete') isAnswerUsed = true
        let attemptNumber = attemptNumberAddition ? ls.attemptNumber + 1 : ls.attemptNumber
        if (isRevisit && status === 'complete') {
          attemptNumber = ls.attemptNumber
        }
        let totalAttemptCount = ls.totalAttemptCount + 1
        if (checkIfEmbedEnabled() && this.state.isSeeAnswers) {
          attemptNumber = 1
          if (status !== 'complete') {
            status = 'complete'
          }
        }
        return {
          ...ls,
          attemptNumber,
          status,
          isAnswerUsed,
          totalAttemptCount
        }
      }
      return { ...ls }
    })
    this.setState({
      // additionalInfo: newInfo,
      learningSlides: newLearningSlides
    });
  };

  handleAnswerCheck = async () => {
    const { answers, currentLearningSlideData, learningSlides } = this.state;
    const findAlreadyCompletedSlide = learningSlides.find(
      (slide) =>
        get(slide, "learningSlide.id") === get(currentLearningSlideData, "id")
    );
    const questionData = get(currentLearningSlideData, "practiceQuestions[0]");
    let isMarkedCorrect = false;
    if (get(questionData, "questionType") === ARRANGE) {
      const options = get(questionData, "arrangeOptions");
      let isCorrect = true;
      for (let i = 0; i < options.length; i++) {
        /* pick the element in at each index and get its correct position from props data
          then compare the position with current position which is index + 1
        */
        const searchInd = answers[0][i]
        const correctPosition = get(
          options,
          `[${searchInd}].correctPosition`
        );
        const correctPositions = get(
          options,
          `[${searchInd}].correctPositions`
        );
        // one is added because the order returned in answers is 0 indexed
        const currentPosition = i + 1;
        if (correctPositions && correctPositions.length) {
          if (
            currentPosition !== null &&
            correctPositions.indexOf(currentPosition) === -1
          ) {
            this.displayWrongAnswerMessage();
            isCorrect = false;
            break;
          }
        } else {
          if (currentPosition !== null && currentPosition !== correctPosition) {
            this.displayWrongAnswerMessage();
            isCorrect = false;
            break;
          }
        }
      }
      if (isCorrect) {
        isMarkedCorrect = true;
        this.displayCorrectAnswerMessage();
      }
    } else if (get(questionData, "questionType") === FIBINPUT) {
      const options = get(questionData, "fibInputOptions");
      let allBlanksCorrect = true;
      for (let i = 0; i < options.length; i++) {
        const correctPosition = get(options[i], "correctPosition");
        const correctAnswers = get(options[i], "answers");
        const attemptedAnswer = answers[0][correctPosition - 1];
        let isAnswerCorrect = false;
        for (
          let answerindex = 0;
          answerindex < correctAnswers.length;
          answerindex++
        ) {
          if (attemptedAnswer === correctAnswers[answerindex]) {
            isAnswerCorrect = true;
            break;
          }
        }
        if (!isAnswerCorrect) {
          allBlanksCorrect = false;
          break;
        }
      }
      if (allBlanksCorrect) {
        isMarkedCorrect = true;
        this.displayCorrectAnswerMessage();
      } else {
        this.displayWrongAnswerMessage();
      }
    } else if (get(questionData, "questionType") === FIBBLOCK) {
      const options = get(questionData, "fibBlocksOptions", []);
      let allBlanksCorrect = true;
      for (let i = 0; i < options.length; i++) {
        const correctPositions = get(options[i], "correctPositions");
        const statement = get(options[i], "statement");
        let isAnswerCorrect = false;
        for (
          let positionIndex = 0;
          positionIndex < correctPositions.length;
          positionIndex++
        ) {
          const position = correctPositions[positionIndex];
          const attemptedAnswer = answers[0][position - 1];
          if (attemptedAnswer === statement) {
            isAnswerCorrect = true;
            break;
          }
        }
        if (!isAnswerCorrect && correctPositions.length > 0) {
          allBlanksCorrect = false;
        }
      }
      if (allBlanksCorrect) {
        isMarkedCorrect = true;
        this.displayCorrectAnswerMessage();
      } else {
        this.displayWrongAnswerMessage();
      }
    } else if (get(questionData, "questionType") === MCQ) {
      const options = get(questionData, "mcqOptions");
      let correctAnswer = true;
      for (let i = 0; i < options.length; i++) {
        const isCorrect = get(options[i], "isCorrect");
        const isSelected = answers[0][i];
        /*  1. option is true and its not selected
            2.option is false and it selected
            both are wrong answer cases */
        if ((isCorrect && !isSelected) || (!isCorrect && isSelected)) {
          correctAnswer = false;
        }
      }
      if (correctAnswer) {
        isMarkedCorrect = true;
        this.displayCorrectAnswerMessage();
      } else {
        this.displayWrongAnswerMessage();
      }
    }
    if (isMarkedCorrect) {
      if (get(currentLearningSlideData, "startTime")) {
        const newCurrentLearningSlideData = {
          ...currentLearningSlideData,
          endTime: new Date().toISOString(),
        };
        this.setState({
          currentLearningSlideData: newCurrentLearningSlideData,
          prevAnswer: null
        });
      }
      if (get(findAlreadyCompletedSlide, "status") !== "complete") {
        await this.updateAnswersAdditionalInfo(true);
      } else {
        await this.updateAnswersAdditionalInfo(false);
      }
      if (this.state.currentLearningSlide <
        this.state.learningSlides.length - 1) {
        await this.handleLearningSlideDump();
      }
    } else {
      this.setState({ prevAnswer: answers[0] })
      if (get(findAlreadyCompletedSlide, "status") !== "complete") {
        this.updateAnswersAdditionalInfo(true);
      } else {
        await this.updateAnswersAdditionalInfo(false);
      }
    }
  };

  openOverlay = (overlayName, isHintTextExist = true) => {
    this.setState({ [overlayName]: true }, () => {
      if (overlayName === visibleHintOverlay) {
        const newLearningSlides = [...this.state.learningSlides].map((ls) => {
          let status = ls.status
          if (get(ls, 'learningSlide.id') === get(this.state.currentLearningSlideData, 'id')) {
            if (isHintTextExist && status !== 'complete') {
              return { ...ls, isHintUsed: true }
            }
            else if (status !== 'complete')
              return { ...ls, isAnswerUsed: true }
          }
          return { ...ls }
        });
        this.setState({
          learningSlides: newLearningSlides,
        });
      }
    });
  };

  closeOverlay = (overlayName) => {
    this.setState({ [overlayName]: false });
  };

  displayCorrectAnswerMessage = () => {
    this.openOverlay(visibleCorrectAnswerOverlay);
    this.setState({
      visibleWrongAnswerMessage: false,
      visibleHintOverlay: false,
    });
  };

  displayWrongAnswerMessage = () => {
    this.setState(
      {
        visibleWrongAnswerMessage: true,
      },
      () => {
        if (this.state.visibleHintOverlay) {
          this.setState({ visibleHintOverlay: false });
        }
        setTimeout(
          () => {
            this.setState({ visibleWrongAnswerMessage: false });
          },
          isMobile() ? 2000 : 6000
        );
      }
    );
  };

  getTotalAttemptCount = () => {
    const {
      currentLearningSlide,
      learningSlides,
    } = this.state;
    if (get(learningSlides[currentLearningSlide], "totalAttemptCount") <= get(learningSlides[currentLearningSlide], "attemptNumber")) {
      return get(learningSlides[currentLearningSlide], "attemptNumber")
    } else if (get(learningSlides[currentLearningSlide], "totalAttemptCount")) {
      return get(learningSlides[currentLearningSlide], "totalAttemptCount")
    } else {
      return 1
    }
  }

  handleLearningSlideDump = async () => {
    const {
      currentLearningSlideData,
      currentLearningSlide,
      learningSlides,
      practiceQuestionsArray,
    } = this.state;
    const { loId, courseId, topicId } = this.props.match.params;
    const isRevisit = this.props.match.path.includes('/revisit')
    let input = {};
    const findAlreadyCompletedSlide = learningSlides.find(
      (slide) =>
        get(slide, "learningSlide.id") === get(currentLearningSlideData, "id")
    );
    const findlsIndex = learningSlides.findIndex(
      (slide) =>
        get(slide, "learningSlide.id") === get(currentLearningSlideData, "id")
    );
    this.setState({ nextButtonLoading: true });

    if (currentLearningSlideData.type !== "practiceQuestion") {
      input = {
        pqAction: "next",
        type: get(currentLearningSlideData, 'type'),
      };
      if (get(currentLearningSlideData, "startTime")) {
        input.startTime = get(currentLearningSlideData, "startTime");
      }
      if (get(currentLearningSlideData, "endTime")) {
        input.endTime = get(currentLearningSlideData, "endTime");
      }
    } else {
      duck.stale({
        root: 'chatPractice',
        key: loId
      })
      input = {
        pqAction: "next",
        type: "practiceQuestion",
        practiceQuestions: [
          {
            attemptNumber: get(
              learningSlides[currentLearningSlide],
              "attemptNumber"
            )
              ? get(learningSlides[currentLearningSlide], "attemptNumber")
              : 1,
            totalAttemptCount: this.getTotalAttemptCount(),
            questionConnectId: get(
              currentLearningSlideData,
              "practiceQuestions[0].id"
            ),
            isHintUsed: get(
              learningSlides[currentLearningSlide],
              "isHintUsed"
            )
              ? get(learningSlides[currentLearningSlide], "isHintUsed")
              : false, // Hints add state //
            isAnswerUsed: get(learningSlides[currentLearningSlide], "isAnswerUsed") || false,
            isCorrect: true,
            questionAction: "next",
          },
        ],
      };
      if (get(currentLearningSlideData, "startTime")) {
        const startTime = get(currentLearningSlideData, "startTime");
        input.startTime = startTime;
        input.practiceQuestions[0].startTime = startTime;
      }
      if (get(currentLearningSlideData, "endTime")) {
        const endTime = get(currentLearningSlideData, "endTime");
        input.endTime = endTime;
        input.practiceQuestions[0].endTime = endTime;
      }
    }
    const connectCourseId = topicId ? getCourseId(topicId) : courseId
    const ids = {
      loId,
      courseId: connectCourseId,
      topicId,
      userId: this.props.userId,
      learningSlideId: this.state.currentLearningSlideData.id,
    };
    if (currentLearningSlideData.type !== "practiceQuestion" && get(findAlreadyCompletedSlide, "status") !== "complete") {
      if (currentLearningSlide === learningSlides.length - 1) {
        await this.learningSlideDumpOperation(input, ids, true)
      } else {
        this.learningSlideDumpOperation(input, ids)
      }
    } else {
      if (currentLearningSlide === learningSlides.length - 1) {
        if (isRevisit) {
          if (get(findAlreadyCompletedSlide, "status") !== "complete") {
            await this.learningSlideDumpOperation(input, ids, true)
          }
        } else {
          await this.learningSlideDumpOperation(input, ids, true)
        }
      } else {
        if (isRevisit) {
          if (get(findAlreadyCompletedSlide, "status") !== "complete") {
            this.learningSlideDumpOperation(input, ids)
          }
        } else {
          this.learningSlideDumpOperation(input, ids)
        }
      }
    }

    if (currentLearningSlide === learningSlides.length - 1) {
      duck.merge(() => ({
        learningObjective: {
          id: loId,
          learningSlideStatus: "complete",
        },
      }));
      if (practiceQuestionsArray.length) {
        this.closeOverlay(visibleCorrectAnswerOverlay);
        if (
          this.props.match.path ===
          "/sessions/learning-slides/:courseId/:topicId/:loId"
        ) {
          if (checkIfEmbedEnabled()) {
            const backToPage = getEmbedData('backToPage')
            if (backToPage !== backToPageConst.trainingResourcesClasswork) {
              this.props.history.push(
                `/sessions/pq-report/${courseId}/${topicId}/${loId}`
              );
            } else {
              this.props.history.push(
                `/sessions/practice-report/${courseId}/${topicId}/${loId}`
              );
            }
          } else {
            this.props.history.push(
              `/sessions/practice-report/${courseId}/${topicId}/${loId}`
            );
          }
        } else if (
          this.props.match.path ===
          "/revisit/sessions/learning-slides/:courseId/:topicId/:loId"
        ) {
          if (checkIfEmbedEnabled()) {
            if (isPqReportNotAllowed()) {
              return this.goToNextComponentCheck();
            }
            const backToPage = getEmbedData('backToPage')
            if (backToPage !== backToPageConst.trainingResourcesClasswork) {
              this.props.history.push(
                `/revisit/sessions/pq-report/${courseId}/${topicId}/${loId}`
              );
            } else {
              this.props.history.push(
                `/revisit/sessions/practice-report/${courseId}/${topicId}/${loId}`
              );
            }
          } else {
            this.props.history.push(
              `/revisit/sessions/practice-report/${courseId}/${topicId}/${loId}`
            );
          }
        }
      } else {
        this.goToNextComponentCheck();
      }
    }
    this.setState({ nextButtonLoading: false });
  };

  learningSlideDumpOperation = async (input = {}, ids = {}, isLast = false) => {
    if (checkIfEmbedEnabled()) {
      const backToPage = getEmbedData('backToPage')
      if (backToPage !== backToPageConst.trainingResourcesClasswork) return true
    }
    const { currentLearningSlideData, learningSlides } = this.state
    const findAlreadyCompletedSlide = learningSlides.find(
      (slide) =>
        get(slide, "learningSlide.id") === get(currentLearningSlideData, "id")
    );
    if (isLast) {
      const newLearningSlides = [...this.state.learningSlides].map((ls) => {
        if (get(ls, 'learningSlide.id') === get(currentLearningSlideData, 'id')) {
          return { ...ls, status: 'complete' }
        }
        return { ...ls }
      });
      this.setState({
        learningSlides: newLearningSlides,
      });
      await addLearningSlideDump(ids, input)
    } else {
      await addLearningSlideDump(ids, input)
      const newLearningSlides = [...this.state.learningSlides].map((ls) => {
        if (get(ls, 'learningSlide.id') === get(currentLearningSlideData, 'id')) {
          return { ...ls, status: 'complete' }
        }
        return { ...ls }
      });
      this.setState({
        learningSlides: newLearningSlides,
      });
    }
  }
  updateLearningSlideList = (type, desiredIndex, fromNextButton = false) => {
    if (fromNextButton) {
      this.handleLearningSlideChange(
        this.state.currentLearningSlide + 1,
        "next"
      )
      return;
    }
    if (type === "next") {
      if (
        this.state.currentLearningSlide <=
        this.state.learningSlides.length - 1
      ) {
        const { currentLearningSlideData } = this.state;
        if (get(currentLearningSlideData, "startTime")) {
          const newCurrentLearningSlideData = {
            ...currentLearningSlideData,
            endTime: new Date().toISOString(),
          };
          this.setState(
            {
              currentLearningSlideData: newCurrentLearningSlideData,
            },
            () =>
              this.handleLearningSlideChange(
                desiredIndex === undefined
                  ? this.state.currentLearningSlide + 1
                  : desiredIndex,
                "next"
              )
          );
        } else {
          this.handleLearningSlideChange(
            desiredIndex === undefined
              ? this.state.currentLearningSlide + 1
              : desiredIndex,
            "next"
          );
        }
      }
      this.setState({
        direction: 1,
      });
    } else {
      if (
        this.state.currentLearningSlide <=
        this.state.learningSlides.length - 1
      ) {
        const { currentLearningSlideData } = this.state;
        if (get(currentLearningSlideData, "startTime")) {
          const newCurrentLearningSlideData = {
            ...currentLearningSlideData,
            endTime: new Date().toISOString(),
          };
          this.setState(
            {
              currentLearningSlideData: newCurrentLearningSlideData,
            },
            () =>
              this.handleLearningSlideChange(
                desiredIndex === undefined
                  ? this.state.currentLearningSlide - 1
                  : desiredIndex,
                "back"
              )
          );
        } else {
          this.handleLearningSlideChange(
            desiredIndex === undefined
              ? this.state.currentLearningSlide - 1
              : desiredIndex,
            "back"
          );
        }
      }
      this.setState({
        direction: 0,
      });
    }
  };

  checkIfInSkippedSlides(slideIndex) {
    let lastFrame = this.state.learningSlides.length - MAX_TABS_PER_FRAME;
    if (slideIndex > lastFrame + this.state.skipSlideRange) {
      return {
        status: true,
        modifiedIdx: slideIndex - this.state.skipSlideRange,
      };
    }
    if (
      slideIndex >= lastFrame &&
      slideIndex <= lastFrame + this.state.skipSlideRange
    ) {
      return {
        status: true,
        modifiedIdx: slideIndex - this.state.skipSlideRange,
      };
    }
  }

  handleLearningSlideChange = async (slideNumber, slideCondition) => {
    let learningSlideId = "";
    const newLearningSlides = this.state.learningSlides.map((elem, idx) => {
      if (idx === slideNumber && !slideCondition) {
        learningSlideId = get(elem, "learningSlide.id");
        return { ...elem };
      } else if (idx === slideNumber && slideCondition) {
        learningSlideId = get(elem, "learningSlide.id");
        return { ...elem };
      } else {
        return { ...elem };
      }
    });
    let newDumpIds = { ...this.state.learningSlideDumpIds };
    if (
      slideCondition === "next" &&
      (this.state.currentLearningSlide === this.state.learningSlides.length - 1 ||
        !this.state.learningSlideDumpIds[this.state.currentLearningSlideData.id])
    ) {
      newDumpIds = {
        ...this.state.learningSlideDumpIds,
        [this.state.currentLearningSlideData.id]: true,
      };
      if (this.state.currentLearningSlideData.type !== 'practiceQuestion') {
        await this.handleLearningSlideDump();
      } else if (slideNumber >= this.state.learningSlides.length) {
        await this.handleLearningSlideDump();
      }
    }
    let direction = this.state.direction
    if (slideCondition === 'next') direction = 1
    else direction = 0
    this.closeOverlay(visibleCorrectAnswerOverlay);
    if (this.state.answers && this.state.answers[0].length) {
      this.resetAnswers()
    }
    if (this.state.visibleHintOverlay) this.closeOverlay(visibleHintOverlay);
    if (learningSlideId) {
      this.setState({
        currentLearningSlide: slideNumber,
        learningSlideDumpIds: newDumpIds,
        direction
      });
      let currentIdKey = get(
        this.state,
        `learningSlides[${slideNumber}].learningSlide.id`
      );
      if (this.state.nextSlides[currentIdKey])
        this.setState({
          currentLearningSlideData: {
            ...this.state.nextSlides[currentIdKey],
            fromCache: true,
          },
        });
    }
  };

  checkIfCourseCompleted = async () => {
    let menteeCourseSyllabus =
      this.props.menteeCourseSyllabus && this.props.menteeCourseSyllabus.toJS();
    if (menteeCourseSyllabus && !menteeCourseSyllabus.length) {
      await fetchMenteeCourseSyllabus();
    }
    if (
      this.props.menteeCourseSyllabus &&
      this.props.menteeCourseSyllabus.toJS()
    ) {
      const upcomingSessions = this.props.menteeCourseSyllabus
        .getIn([0, "upComingSession"])
        .toJS();
      if (upcomingSessions && upcomingSessions.length < 1) {
        return true;
      }
    }
    return false;
  };

  findCurrentSlide = (currentLearningSlide, tabArr, skipSlideRange) => {
    let skippedSlidesLower =
      MAX_TABS_PER_FRAME * (tabArr.length / MAX_TABS_PER_FRAME - 1);
    let skippedSlidesHigher =
      skippedSlidesLower + (MAX_TABS_PER_FRAME - skipSlideRange);
    if (
      currentLearningSlide >= skippedSlidesLower &&
      currentLearningSlide < skippedSlidesHigher
    ) {
      return currentLearningSlide + skipSlideRange;
    }
    return currentLearningSlide;
  };

  getVariants = () => {
    return {
      initial: {
        opacity: 0,
        x: this.state.direction ? "10%" : "-10%",
        pointerEvents: 'none',
      },
      animate: {
        x: 0,
        opacity: 1,
        pointerEvents: 'auto',
        transition: {
          duration: 0.3,
          ease: [0.65, 0.25, 0.35, 0.17],
        },
      },
    };
  };
  getVideoPath = (topicId, learningObjective, courseId) => {
    if (this.props.match.path === '/sessions/practice-quiz/:courseId/:topicId/:loId') {
      return `/sessions/video/${courseId}/${topicId}`
    } else if (this.props.match.path === '/revisit/sessions/practice-quiz/:courseId/:topicId/:loId') {
      return `/revisit/sessions/video/${courseId}/${topicId}`
    }

    return `/sessions/video/${courseId}/${topicId}`
  }

  getNextButtonText = () => {
    const revisitRoute = this.props.match.path.includes("/revisit");
    const buttonText = this.getButtonTitle(revisitRoute)
    if (buttonText === "Next Up: Report" && isPqReportNotAllowed()) {
      return this.getButtonTitle(revisitRoute, true)
    }
    return buttonText
  }
  onToggleButtonClick = () => {
    this.setState({ isSeeAnswers: !this.state.isSeeAnswers })
  }
  render() {
    const isMobile = window.innerWidth <= 900 ? true : false;
    const {
      initialLoading,
      learningSlides,
      currentLearningSlideData,
      currentLearningSlide,
      visibleWrongAnswerMessage,
      isSeeAnswers
    } = this.state;
    const isCheckButtonActive = this.checkIfAttempted();
    const revisitRoute = this.props.match.path.includes("/revisit");
    const { topicId, courseId } = this.props.match.params;
    const { learningObjectiveData } = this.props
    const learningObjective = learningObjectiveData && learningObjectiveData.toJS()
    const hints = get(currentLearningSlideData, 'practiceQuestions[0].hints', [])
    const answers = get(currentLearningSlideData, 'practiceQuestions[0].explanation', '')
    const hintTextArray = hints.filter(hint => (get(hint, 'hint', '') || '').trim())
    const questionData = get(currentLearningSlideData, "practiceQuestions[0]")
    const questionType = get(questionData, 'questionType')
    const isGoogleSlide = get(this, "state.currentLearningSlideData.type", '') === 'googleSlides'
    const slideLink = get(this, "state.currentLearningSlideData.googleSlideLink", '')
    return (
      <>
        {!revisitRoute && (
          <MentorFeedback
            sessionId={this.props.mentorMenteeSessionEndSession.getIn([
              0,
              "id",
            ])}
            postSubmit={async () => {
              const isCompleted = await this.checkIfCourseCompleted();
              let loginWithCode =
                this.props.loggedInUser &&
                this.props.loggedInUser.toJS() &&
                get(this.props.loggedInUser.toJS(), "fromOtpScreen");
              if (loginWithCode && !isCompleted) {
                localStorage.setItem("showCredentialsModal", true);
                this.setState({
                  showCredentialModal: true,
                });
                return;
              }
              if (isCompleted) {
                localStorage.setItem(
                  "showCourseCompletionCertificateModal",
                  "show"
                );
              }
              this.props.history.push("/sessions");
            }}
          />
        )}
        {/* <UpdatedSideNavBar
          parent="sessions"
          revisitRoute={this.props.match.path.includes("/revisit")}
          mobileNav
          computedMatch={this.props.computedMatch || this.props.match}
          pageTitle="Learning Slides"
          additionalRenderer={() => (
            <div
              className={
                isMobile && this.state.visibleHintOverlay
                  ? styles.infoAndCheck
                  : ""
              }
              style={{ display: "flex", justifyContent: "space-around" }}
            >
              {hintTextArray.length && (
                <HintIcon
                  style={{
                    marginRight: "16px",
                  }}
                  className={styles.hintIcon}
                  onClick={() => {
                    if (!this.state.visibleCorrectAnswerOverlay) {
                      this.setState((prevState) => ({
                        ...prevState,
                        visibleHintOverlay: !prevState.visibleHintOverlay,
                      }));
                    }
                  }}
                />
              )}
              <button
                className={
                  !isCheckButtonActive || this.state.visibleCorrectAnswerOverlay
                    ? styles.mbUnactiveCheckButton
                    : styles.mbaActiveCheckButton
                }
                onClick={() => {
                  if (
                    isCheckButtonActive &&
                    !this.state.visibleCorrectAnswerOverlay
                  ) {
                    this.onCheckButtonClick();
                  }
                }}
              >
                Check
              </button>
            </div>
          )}
        /> */}
        <Helmet>
          <script src={import.meta.env.REACT_APP_JW_PLAYER_URL}></script>
        </Helmet>
        {/* <UpdatedSideNavBar
          parent="sessions"
          revisitRoute={this.props.match.path.includes("/revisit")}
          mobileNav
          computedMatch={this.props.computedMatch || this.props.match}
          pageTitle="Learning Slides"
        /> */}
        <div className={`ls-main-container ${isGoogleSlide ? 'ls-google-slide' : ''}`}>
          <div className="ls-tab-container learning-slides-page-mixpanel-identifier">
            {!initialLoading ? (
              <SlideHeader
                tabArr={this.state.learningSlides}
                practiceQuestionsDataArray={this.state.practiceQuestionsDataArray}
                maxTabsPerFrame={MAX_TABS_PER_FRAME}
                currentLearningSlide={this.state.currentLearningSlide}
                updateLearningSlideList={this.updateLearningSlideList}
                revisitRoute={this.props.match.path.includes("/revisit")}
                skipSlideRange={this.state.skipSlideRange}
                incrementFrame={this.state.incrementFrame}
                setFrame={this.setFrame}
                practiceQuestions={this.props.userLearningObjective.toJS().practiceQuestions}
              />
            ) : null}
          </div>
          <AnimatePresence key={this.state.currentLearningSlide}>
            {!this.state.loading ? (
              <motion.div
                className={"titleAndContentWrapper"}
                initial={"initial"}
                animate={"animate"}
                variants={this.getVariants()}
                style={{ padding: isGoogleSlide ? '0px' : 'initial', paddingBottom: checkIfEmbedEnabled() ? `${hs(100)}px` : 'initial' }}
              >
                {!isGoogleSlide ? <div className="slideTitleWrapper">
                  <h1 initial={"initial"}>
                    {get(this, "state.currentLearningSlideData.name")}
                  </h1>
                </div> : null}

                {
                  !isGoogleSlide ? (
                    <>
                      <Grid
                        type={
                          get(currentLearningSlideData, "id") &&
                          get(currentLearningSlideData, "type")
                        }
                        // nextTwoSlides={this.state.nextTwoSlides}
                        direction={this.state.direction}
                        answers={this.state.answers}
                        updateAnswers={this.updateAnswers}
                        codeId={get(currentLearningSlideData, "slideContents[0].id")}
                        gridType={
                          get(currentLearningSlideData, "id") &&
                          get(currentLearningSlideData, "layoutType")
                        } // Change grid look here
                        gridContentType={
                          get(currentLearningSlideData, "id") &&
                          get(currentLearningSlideData, "slideContents")
                        } // Change array here
                        gridQuestions={
                          get(currentLearningSlideData, "id") &&
                          get(currentLearningSlideData, "practiceQuestions")
                        }
                        isSeeAnswers={isSeeAnswers}
                        onCheckButtonClick={this.handleAnswerCheck}
                        answerType={isSeeAnswers ? "RS" : undefined}
                        solutionToggle={() => {
                          if ([MCQ, FIBINPUT, FIBBLOCK, ARRANGE].includes(questionType) && checkIfEmbedEnabled()) {
                            const backToPage = getEmbedData('backToPage')
                            if (backToPage !== backToPageConst.trainingResourcesClasswork) {
                              return <div className='solutionToggleContainer'>
                                <ShowSolutionToggle isSeeAnswers={isSeeAnswers} handleToggleClick={this.onToggleButtonClick} />
                              </div>
                            }
                          } return null
                        }}
                      />

                    </>
                  ) : <GoogleSlide slideLink={slideLink}></GoogleSlide>
                }


              </motion.div>
            ) : <Skeleton isMobile={isMobile} />}
          </AnimatePresence>
          {get(currentLearningSlideData, "type") === "practiceQuestion" &&
            !isMobile && (
              <Footer
                closeOverlay={this.closeOverlay}
                openOverlay={this.openOverlay}
                isCheckButtonActive={isCheckButtonActive}
                onCheckButtonClick={this.handleAnswerCheck}
                showHelp={hintTextArray.length || answers}
                isMobile={isMobile}
                isHintTextExist={hintTextArray.length}
              />
            )}
          {!this.state.visibleCorrectAnswerOverlay && (hintTextArray.length || answers) ? (
            <HelpOverlay
              visible={this.state.visibleHintOverlay}
              closeOverlay={this.closeOverlay}
              hints={hints}
              answer={answers}
              isHintTextExist={hintTextArray.length}
              history={this.props.history}
              isLearningSlide={true}
              videoStartTime={get(learningObjective, 'videoStartTime')}
              videoEndTime={get(learningObjective, 'videoEndTime')}
              videoPath={this.getVideoPath(topicId, learningObjective, courseId)}
              isCheckButtonActive={isCheckButtonActive}
              updateAnswersAdditionalInfo={this.updateAnswersAdditionalInfo}
              onCheckButtonClick={this.handleAnswerCheck}
              isMobile={isMobile}
            />
          ) : null}
          <CorrectAnswerOverlay
            visible={this.state.visibleCorrectAnswerOverlay}
            resetAnswers={this.resetAnswers}
            appendPracticeQuestionId={this.appendPracticeQuestionId}
            answer={answers}
            changeQuestion={this.handleLearningSlideChange}
            pqDumpLoading={this.state.nextButtonLoading}
            // onReportButtonClick={this.onReportButtonClick}
            // dumpPracticeQuestions={this.dumpPracticeQuestions}
            activeQuestionIndex={currentLearningSlide}
            questionId={get(this.state.learningSlides[currentLearningSlide], 'learningSlide.id')}
            isLearningSlide={true}
            isMobile={isMobile}
            revisitRoute={this.props.match.path.includes("/revisit")}
            setFrame={this.setFrame}
            reportButtonText={this.getNextComponentDetails().title}
            updateLearningSlideList={this.updateLearningSlideList}
            isLastSlideAndPQType={
              currentLearningSlide === learningSlides.length - 1 &&
              get(currentLearningSlideData, "type") !== learningSlideType.grid
            }
            skipSlideRange={this.state.skipSlideRange}
            nextButtonDetails={
              {
                topicId,
                url: this.props.match.url,
                lastItem: learningSlides.length === currentLearningSlide + 1,
                dumpSession: this.handleLearningSlideDump,
              }
            }
          />
          <WrongAnswer
            visible={visibleWrongAnswerMessage}
            isMobile={isMobile}
            isUpdatedDesign
            openHintOverLay={() => {
              this.closeOverlay("visibleWrongAnswerMessage");
              this.openOverlay("visibleHintOverlay", hintTextArray.length);
            }}
            closeWrongOverlay={() =>
              this.closeOverlay("visibleWrongAnswerMessage")
            }
            showHelp={hintTextArray.length || answers}
            onCheckButtonClick={this.handleAnswerCheck}
            checkIfAnotherAnsSelected={this.checkIfAnotherAnsSelected() || !isCheckButtonActive}
            isHintTextExist={hintTextArray.length}
          />
          {/* {currentLearningSlide === learningSlides.length - 1 &&
            get(currentLearningSlideData, "type") ===
            learningSlideType.grid && (
              <div
                className={`footerContainer ${checkIfEmbedEnabled() && 'foorterContainerForTeacherApp'}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  marginTop: hs(20),
                  paddingBottom: hs(16),
                }}
              >
                <UpdatedButton
                  type={this.getNextButtonText().toLowerCase().includes('end')?'danger':'primary'}
                  text={this.getNextButtonText()}
                  onBtnClick={() => this.updateLearningSlideList("", "", true)}
                  isLoading={this.state.nextButtonLoading}
                  leftIcon
                >
                {this.getNextButtonText().toLowerCase().includes('end') &&<Power color='white' />}
                </UpdatedButton>
              </div>
            )} */}
        </div>
        {get(currentLearningSlideData, 'practiceQuestions', []).length === 0 ? (
          <NextFooter
            match={this.props.match}
            footerFrom={'LearningSlides'}
            nextItem={() => this.updateLearningSlideList("next")}
            lastItem={currentLearningSlide === learningSlides.length - 1}
          >
          </NextFooter>
        ) : null}
      </>
    );
  }
}

export default LearningSlides;
