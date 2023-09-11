import get from "lodash/get";
import sortBy from "lodash/sortBy";
import React from "react";
import cx from "classnames";
import fetchBatchSessionDetails from "../../../../queries/classroomReportsQuery/fetchBatchSessionDetails";
import fetchQuestionBanks from "../../../../queries/classroomReportsQuery/fetchQuestionBanks";
import { avatarsRelativePath } from "../../../../utils/constants/studentProfileAvatars";
import getPath from "../../../../utils/getPath";
import Dropdown from "../../components/Dropdowns/Dropdown";
import ReportGradeCourseHeader from "../../components/ReportGradeCourseHeader";
import ReportPageHeader from "../../components/ReportPageHeader";
import ReportQuestionStudentTabs from "../../components/ReportQuestionStudentTabs/ReportQuestionStudentTabs";
import {
  NextArrowIcon,
  PracticeQuestionUpdatedIcon,
  CodingAssignmentIcon,
  QuizUpdatedIcon,
  EmptyResponseIcon,
} from "../../components/svg";
import styles from "./individualStudentReport.module.scss";
import PresentAbsentTabs from "../../components/ReportQuestionStudentTabs/PresentAbsentTabs";
import {
  evaluationTypes,
  fetchTopicLevelAssignmentQuiz,
  fetchUserAssignment,
  fetchUserBlockBasedPracticeData,
  fetchUserBlockBasedProjectData,
  fetchUserQuizReports,
  getPercentage,
  getTopicComponentData,
  loFilterDropdownStyles,
  studentDropdownStyles,
} from "../../utils";
import fetchPqStudentReport from "../../../../queries/teacherApp/fetchPqIndividualStudentReport";
import PqReportQuestionSectionStudent from "../PqReport/components/PqReportQuestionStudent";
import HomeworkReviewCodingQuestion from "../HomeworkReview/components/HomeworkReviewHeader/components/HomeworkReviewCodingQuestion";
import HomeworkReviewBlocklyQuestion from "../HomeworkReview/components/HomeworkReviewHeader/components/HomeworkReviewBlocklyQuestion";
import getIdArrForQuery from "../../../../utils/getIdArrForQuery";
import LoadingSpinner from "../../components/Loader/LoadingSpinner";
import { ChevronLeft } from "../../../../constants/icons";
import Button from "../../components/Button/Button";
import { hsFor1280 } from "../../../../utils/scale";
import ReportStatsComponent from "../../components/ReportStatsComponent";
import ProgressCircle from "../../../../components/ProgressCircle";
import DetailedReportTitleStatsContainer from "../DetailedReport/Components/DetailedReportTitleStatsContainer/DetailedReportTitleStatsContainer";
import { sessionStartedOrCompleted } from "../TimeTable/constants";

class IndividualStudentReport extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      topicDetail: null,
      batchDetail: null,
      studentsArray: [],
      activeStudent: "",
      selectedStudent: null,
      topicComponentRule: [],
      activeLo: "",
      courseDetail: null,
      dropDownSelectedLo: "all",
      userPracticeQuestions: [],
      codingAssignmentData: {
        classWorkAssignment: [],
        homeWorkAssignment: [],
        quizQuestionsData: [],
      },
      userAssignmentsData: [],
      questionBanksData: {
        practiceQuestionsData: [],
      },
      blockBasedQuestionData: {
        projectData: [],
        practiceData: [],
        homeworkPracticeData: [],
      },
      userBlockBasedProjectData: [],
      userBlockBasedPracticeData: [],
      userQuizData: [],
      isClassworkStudentActive: false,
      isHomeworkStudentActive: false,
      isBackToTopVisible: false,
      sessionStatus: "",
      isClassworkLoading: false,
      isHomeworkLoading: false,
      routeToRedirect: "",
    };
    this.observer = new IntersectionObserver(([e]) => this.observerCallBack(e), {
      threshold: [1],
    });
  }
  observerCallBack = (e) => {
    let isActive = e.intersectionRatio < 1;
    if (e.target.innerHTML.includes("Classwork")) {
      this.setState({ isClassworkStudentActive: isActive });
    } else {
      this.setState({ isHomeworkStudentActive: isActive });
    }
  };
  componentDidMount = async () => {
    const {
      match: { params },
    } = this.props;
    const sessionId = get(params, "sessionId");
    const ROUTE = `/teacher/reports/classroom/${sessionId}/student-level`;
    this.setState({ activeStudent: get(params, "userId"), routeToRedirect: ROUTE });
    let { batchSessionsData } = this.props;
    batchSessionsData = (batchSessionsData && batchSessionsData.toJS()) || {};
    if (get(batchSessionsData, "id")) {
      this.setReportData();
    } else if (sessionId) {
      await fetchBatchSessionDetails(sessionId);
    }
    const splitScreenContainer = document.querySelector(".splitScreen-main-component");
    if (splitScreenContainer) {
      splitScreenContainer.addEventListener("scroll", this.stickyOnScroll);
    }
    // const classRoomHeader = document.querySelector("#classwork-header")
    // const homeRoomHeader = document.querySelector("#homework-header")
    // this.observer.observe(classRoomHeader)
    // this.observer.observe(homeRoomHeader)
    // const screenWrapper = document.querySelector(".splitScreen-main-component")
    // screenWrapper.addEventListener("scroll", this.positionHandler)
  };
  componentWillUnmount = () => {
    // const classRoomHeader = document.querySelector("#classwork-header")
    // const homeRoomHeader = document.querySelector("#homework-header")
    // this.observer.unobserve(classRoomHeader)
    // this.observer.unobserve(homeRoomHeader)
  };
  positionHandler = () => {
    // const classRoomHeader = document.querySelector("#classwork-header")
    // const homeRoomHeader = document.querySelector("#homework-header")
    // const screenWrapper = document.querySelector(".splitScreen-main-component")
    // if (screenWrapper.scrollTop > 100) this.setState({ isBackToTopVisible: true })
    // else this.setState({ isBackToTopVisible: false })
    // if (homeRoomHeader.getBoundingClientRect().top <= classRoomHeader.clientHeight) {
    //   classRoomHeader.style.position = 'static'
    // } else {
    //   classRoomHeader.style.position = 'sticky'
    // }
  };
  onBackToTopClick = () => {
    const screenWrapper = document.querySelector(".splitScreen-main-component");
    screenWrapper.scrollTo({ top: 0, behavior: "smooth" });
  };
  componentWillUnmount = () => {
    const screenWrapper = document.querySelector(".splitScreen-main-component");
    screenWrapper.removeEventListener("scroll", this.positionHandler);
  };
  componentDidUpdate = async (prevProps) => {
    const { batchSessionsFetchStatus } = this.props;
    if (
      batchSessionsFetchStatus &&
      !get(batchSessionsFetchStatus.toJS(), "loading") &&
      get(batchSessionsFetchStatus.toJS(), "success") &&
      prevProps.batchSessionsFetchStatus !== batchSessionsFetchStatus
    ) {
      this.setReportData();
    }
    if (get(prevProps, "match.params.userId") !== get(this.props, "match.params.userId")) {
      const { isLoWithPQ } = this.checkForComponents();
      this.setState(
        {
          activeLo: get(isLoWithPQ, "[0].learningObjective.id"),
          dropDownSelectedLo: "all",
        },
        () => {
          this.fetchStudentClassworkResponse();
          this.fetchStudentHomeworkResponse();
        }
      );
    }
  };
  setReportData = () => {
    let { batchSessionsData } = this.props;
    batchSessionsData = (batchSessionsData && batchSessionsData.toJS()) || [];
    if (batchSessionsData) {
      const studentsArray = get(batchSessionsData, "attendance", []);
      this.setState(
        {
          batchDetail: get(batchSessionsData, "batchData"),
          topicDetail: get(batchSessionsData, "topicData"),
          studentsArray: studentsArray,
          topicComponentRule: sortBy(get(batchSessionsData, "topicData.topicComponentRule"), "order"),
          courseDetail: get(batchSessionsData, "courseData"),
          sessionStatus: get(batchSessionsData, "sessionStatus"),
        },
        () => {
          const { activeStudent, studentsArray } = this.state;
          const findStudent = studentsArray.find((student) => get(student, "student.studentData.id") === activeStudent);
          const { isLoWithPQ } = this.checkForComponents();
          if (findStudent) {
            this.setState(
              {
                selectedStudent: findStudent,
                activeLo: get(isLoWithPQ, "[0].learningObjective.id"),
              },
              () => {
                this.fetchInitialComponentData();
                this.fetchStudentClassworkResponse();
                this.fetchStudentHomeworkResponse();
              }
            );
          }
        }
      );
    }
  };
  goBackToStudents = () => {
    const {
      match: { params },
      history,
    } = this.props;
    const sessionId = get(params, "sessionId");
    history.push(`/teacher/reports/classroom/${sessionId}/student-level`);
  };
  getStudentsForDropDown = () => {
    const { studentsArray } = this.state;
    const students = studentsArray.map((student) => ({
      value: get(student, "student.studentData.id"),
      label: get(student, "student.studentData.name"),
    }));
    return students;
  };
  onNextPrevClick = (type) => {
    let indexNum = 0;
    const { activeStudent, studentsArray } = this.state;
    const findIndexValue = studentsArray.findIndex((student) => get(student, "student.studentData.id") === activeStudent);
    if (type === "prev") {
      if (findIndexValue > 0) indexNum = findIndexValue - 1;
      else indexNum = 0;
    } else if (type === "next") {
      if (findIndexValue < studentsArray.length - 1) indexNum = findIndexValue + 1;
      else indexNum = studentsArray.length - 1;
    }
    const student = studentsArray[indexNum];
    if (student)
      this.onStudentChange({
        value: get(student, "student.studentData.id"),
        label: get(student, "student.studentData.name"),
      });
  };
  onStudentChange = (student) => {
    const { activeStudent, studentsArray } = this.state;
    const {
      match: { params },
      history,
    } = this.props;
    const sessionId = get(params, "sessionId");
    if (get(student, "value") !== activeStudent) {
      const findStudentValue = studentsArray.find((stu) => get(stu, "student.studentData.id") === get(student, "value"));
      if (findStudentValue) {
        this.setState({ activeStudent: get(student, "value"), selectedStudent: findStudentValue }, () => {
          history.push(`/teacher/reports/classroom/${sessionId}/student-level/${get(student, "value")}`);
        });
      }
    }
  };
  getStudentProfilePic = () => {
    const { selectedStudent } = this.state;
    let profilePicUrl = get(selectedStudent, "student.studentData.profilePic.uri");
    if (!profilePicUrl) {
      const profilePic = avatarsRelativePath[get(selectedStudent, "student.profileAvatarCode")];
      return get(profilePic, "src");
    }
    return getPath(profilePicUrl);
  };
  getNextPrevStatus = () => {
    const { selectedStudent, studentsArray } = this.state;
    const findStudentIndex = studentsArray.findIndex(
      (student) => get(student, "student.studentData.id") === get(selectedStudent, "student.studentData.id")
    );
    if (findStudentIndex === 0) return "prev";
    else if (findStudentIndex === studentsArray.length - 1) return "next";
  };
  checkForComponents = () => {
    const { topicComponentRule } = this.state;
    const isLoWithPQ = topicComponentRule.filter(
      (component) => get(component, "componentName") === "learningObjective"
      // && get(component, 'learningObjective.questionBankMeta.count')
    );
    const isAssignment = topicComponentRule.find((component) => get(component, "componentName") === "assignment");
    const isProject = topicComponentRule.find(
      (component) =>
        get(component, "componentName") === "blockBasedProject" && get(component, "blockBasedProject.type") === "project"
    );
    const isPractice = topicComponentRule.filter(
      (component) =>
        get(component, "componentName") === "blockBasedPractice" && get(component, "blockBasedProject.type") !== "project"
    );
    const isHWAssignment = topicComponentRule.find((component) => get(component, "componentName") === "homeworkAssignment");
    const isQuiz = topicComponentRule.find((component) => get(component, "componentName") === "quiz");
    const isHWPractice = topicComponentRule.filter((component) => get(component, "componentName") === "homeworkPractice");
    const isPQExist = topicComponentRule.filter((component) => get(component, "learningObjective.questionBankMeta.count"));
    const isClassWorkExist = (isLoWithPQ.length && isPQExist.length) || isAssignment || isPractice || isProject;
    const isHomeworkExist = isHWAssignment || isQuiz || isHWPractice.length;
    return {
      isLoWithPQ,
      isAssignment,
      isProject,
      isPractice,
      isHWAssignment,
      isQuiz,
      isHWPractice,
      isClassWorkExist,
      isHomeworkExist,
      isPQExist,
    };
  };
  fetchInitialComponentData = async () => {
    const {
      isLoWithPQ,
      isAssignment,
      isPractice,
      isProject,
      isHWAssignment,
      isQuiz,
      isHWPractice,
      isPQExist,
    } = this.checkForComponents();
    const { topicDetail, sessionStatus } = this.state;
    if (!sessionStartedOrCompleted.includes(sessionStatus)) return;
    if (isLoWithPQ.length && isPQExist.length) {
      const loIds = isLoWithPQ.map((lo) => get(lo, "learningObjective.id"));
      const questionBankFilter = `{learningObjectives_some:{id_in:[${getIdArrForQuery(
        loIds
      )}]}},{assessmentType: practiceQuestion}`;
      fetchQuestionBanks(questionBankFilter).then((res) => {
        if (get(res, "questionBanks", []).length) {
          const practiceQuestionsData = get(res, "questionBanks", []).filter(
            (question) => get(question, "assessmentType") === "practiceQuestion"
          );
          this.setState({
            questionBanksData: {
              practiceQuestionsData,
            },
          });
        }
      });
    }
    fetchTopicLevelAssignmentQuiz(get(topicDetail, "id"), isAssignment, isHWAssignment, isQuiz).then((res) => {
      if (get(res, "id")) {
        const classworkAssignment = get(res, "topicAssignmentQuestions", []).filter(
          (assignment) =>
            get(assignment, "assignmentQuestion.status") === "published" && !get(assignment, "assignmentQuestion.isHomework")
        );
        const homeworkAssignment = get(res, "topicHomeworkAssignmentQuestion", []).filter(
          (assignment) =>
            get(assignment, "assignmentQuestion.status") === "published" && get(assignment, "assignmentQuestion.isHomework")
        );
        const quizQuestionsData = get(res, "topicQuestions", []).filter(
          (question) => get(question, "question.status") === "published" && get(question, "question.assessmentType") === "quiz"
        );
        this.setState({
          codingAssignmentData: {
            classWorkAssignment: classworkAssignment.map((assignment) => ({ ...get(assignment, "assignmentQuestion") })),
            homeWorkAssignment: homeworkAssignment.map((assignment) => ({ ...get(assignment, "assignmentQuestion") })),
            quizQuestionsData: quizQuestionsData.map((question) => ({ ...get(question, "question") })),
          },
        });
      }
    });
    if ((isPractice.length || isProject || isHWPractice.length) && get(topicDetail, "id")) {
      getTopicComponentData(get(topicDetail, "id")).then((res) => {
        if (res && res.length) {
          const projectData = res.filter((project) => get(project, "componentName") === "blockBasedProject");
          const practiceData = res.filter((practice) => get(practice, "componentName") === "blockBasedPractice");
          const homeworkPracticeData = res.filter((practice) => get(practice, "componentName") === "homeworkPractice");
          this.setState({
            blockBasedQuestionData: {
              projectData: projectData.map((project) => ({ ...get(project, "blockBasedProject") })),
              practiceData: practiceData.map((project) => ({ ...get(project, "blockBasedProject") })),
              homeworkPracticeData: homeworkPracticeData.map((project) => ({ ...get(project, "blockBasedProject") })),
            },
          });
        }
      });
    }
  };
  fetchStudentClassworkResponse = async () => {
    const { isLoWithPQ, isAssignment, isHWAssignment, isPQExist, isHWPractice, isPractice } = this.checkForComponents();
    const { activeLo, topicDetail, courseDetail, selectedStudent, sessionStatus } = this.state;
    if (!sessionStartedOrCompleted.includes(sessionStatus)) return;
    this.setState({ isClassworkLoading: true });
    if (isLoWithPQ.length && activeLo && isPQExist.length) {
      await this.fetchPqReportOnLoChange().catch((e) => {
        this.setState({ userPracticeQuestions: [] });
      });
    }
    if (isHWPractice.length || isPractice.length) {
      await fetchUserBlockBasedPracticeData(
        get(selectedStudent, "student.studentData.id"),
        get(topicDetail, "id"),
        get(courseDetail, "id")
      )
        .then((res) => {
          if (res && Array.isArray(res)) {
            this.setState({ userBlockBasedPracticeData: res });
          } else {
            this.setState({
              userBlockBasedPracticeData: [],
            });
          }
        })
        .catch((e) => {
          this.setState({
            userBlockBasedPracticeData: [],
          });
        });
    }
    if (isAssignment || isHWAssignment) {
      await fetchUserAssignment(get(selectedStudent, 'student.studentData.id'), get(topicDetail, 'id'), get(courseDetail, 'id')).then(res => {
        if (res && Array.isArray(res)) {
          this.setState({
            userAssignmentsData: get(res, '[0].assignment', [])
          })
        } else {
          this.setState({
            userAssignmentsData: []
          })
        }
      }).catch(e => {
        this.setState({
          userAssignmentsData: []
        })
      });
    }
    this.setState({ isClassworkLoading: false });
  };
  fetchStudentHomeworkResponse = async () => {
    const { isQuiz, isProject } = this.checkForComponents();
    const { topicDetail, selectedStudent, courseDetail, sessionStatus } = this.state;
    if (!sessionStartedOrCompleted.includes(sessionStatus)) return;
    this.setState({ isHomeworkLoading: true });
    if (isProject) {
      await fetchUserBlockBasedProjectData(
        get(selectedStudent, "student.studentData.id"),
        get(topicDetail, "id"),
        get(courseDetail, "id")
      )
        .then((res) => {
          if (res && Array.isArray(res)) {
            this.setState({ userBlockBasedProjectData: res });
          } else {
            this.setState({
              userBlockBasedProjectData: [],
            });
          }
        })
        .catch((e) => {
          this.setState({
            userBlockBasedProjectData: [],
          });
        });
    }
    if (isQuiz) {
      await fetchUserQuizReports(get(selectedStudent, "student.studentData.id"), get(topicDetail, "id"))
        .then((res) => {
          if (res && Array.isArray(res)) {
            this.setState({ userQuizData: res });
          } else {
            this.setState({
              userQuizData: [],
            });
          }
        })
        .catch((e) => {
          this.setState({
            userQuizData: [],
          });
        });
    }
    this.setState({ isHomeworkLoading: false });
  };
  fetchPqReportOnLoChange = async () => {
    const { activeLo, selectedStudent } = this.state;
    await fetchPqStudentReport(get(selectedStudent, "student.studentData.id"), "", activeLo).then((res) => {
      if (res && Array.isArray(get(res, "fetchPqStudentReport", []))) {
        this.setState({ userPracticeQuestions: get(res, "fetchPqStudentReport", []) });
      }
    });
  };
  onTabSwitch = (value) => {
    this.setState({ activeLo: value }, this.fetchPqReportOnLoChange);
  };
  checkForUpdatedComponent = () => {
    const { isClassWorkExist, isHomeworkExist } = this.checkForComponents();
    const { questionBanksData, codingAssignmentData, blockBasedQuestionData } = this.state;
    const isUpdatedClassWorkExist =
      isClassWorkExist &&
      (questionBanksData.practiceQuestionsData.length ||
        codingAssignmentData.classWorkAssignment.length ||
        blockBasedQuestionData.practiceData.length ||
        blockBasedQuestionData.projectData.length);
    const isUpdatedHwExist =
      isHomeworkExist &&
      (codingAssignmentData.quizQuestionsData.length ||
        codingAssignmentData.homeWorkAssignment.length ||
        blockBasedQuestionData.homeworkPracticeData.length);
    return { isUpdatedClassWorkExist, isUpdatedHwExist };
  };
  renderClassWorkTab = () => {
    const {
      isLoWithPQ,
      isAssignment,
      isPractice,
      isProject,
      isClassWorkExist,
      isHomeworkExist,
      isQuiz,
      isHWAssignment,
      isHWPractice,
      isPQExist,
    } = this.checkForComponents();
    const {
      activeLo,
      userPracticeQuestions,
      codingAssignmentData,
      questionBanksData,
      blockBasedQuestionData,
      userBlockBasedProjectData,
      userAssignmentsData,
      userBlockBasedPracticeData,
      dropDownSelectedLo,
      userQuizData,
      sessionStatus,
      isClassworkLoading,
      isHomeworkLoading,
      studentsArray,
      selectedStudent
    } = this.state;
    const { batchSessionsData } = this.props
    const loList = isLoWithPQ.map((lo) => ({
      label: `${get(lo, "learningObjective.title")}`,
      value: get(lo, "learningObjective.id"),
    }));
    const dropdownLoList = [{ label: "All", value: "all" }, ...loList];
    const selectedLo = dropdownLoList.find((lo) => get(lo, "value") === dropDownSelectedLo);
    let classWorkTabDiv = <></>;
    let homeworkTabDiv = <></>;
    let pqQuestions = questionBanksData.practiceQuestionsData;
    if (activeLo) {
      pqQuestions = questionBanksData.practiceQuestionsData.filter((question) =>
        get(question, "learningObjectives", [])
          .map((lo) => get(lo, "id"))
          .includes(activeLo)
      );
    }
    let quizQuestions = codingAssignmentData.quizQuestionsData;
    if (dropDownSelectedLo && dropDownSelectedLo !== "all") {
      quizQuestions = codingAssignmentData.quizQuestionsData.filter((question) =>
        get(question, "learningObjectives", [])
          .map((lo) => get(lo, "id"))
          .includes(dropDownSelectedLo)
      );
    }
    const scoresArray = [];
    if (isLoWithPQ.length) {
      isLoWithPQ.forEach((loObj) => {
        const loQuiz = codingAssignmentData.quizQuestionsData.filter((question) =>
          get(question, "learningObjectives", [])
            .map((lo) => get(lo, "id"))
            .includes(get(loObj, "learningObjective.id"))
        );
        const quizQuestionIds = loQuiz.map((quiz) => get(quiz, "id"));
        const quizAnswers = get(userQuizData, "[0].quizAnswers", []).filter(
          (quiz) => quizQuestionIds.includes(get(quiz, "question.id")) && get(quiz, "isCorrect")
        );
        let totalQuestionCount = quizQuestionIds.length;
        let correctQuestionCount = quizAnswers.length;
        let percentage = getPercentage(correctQuestionCount, totalQuestionCount);
        scoresArray.push({
          loName: get(loObj, "learningObjective.title"),
          score: percentage > 0 ? Number(percentage).toFixed(0) : 0,
          actualScore: percentage,
          correctQuestionCount,
        });
      });
    }
    let avgScore = 0;
    let totalScore = 0;
    scoresArray.forEach((score) => {
      totalScore += score.correctQuestionCount;
    });
    avgScore = getPercentage(totalScore, codingAssignmentData.quizQuestionsData.length);
    avgScore = Number(avgScore).toFixed(0);
    const assignmentCount =
      codingAssignmentData.classWorkAssignment.length +
      blockBasedQuestionData.practiceData.length +
      blockBasedQuestionData.projectData.length;
    const quizQuestionAttempted = this.getQuizQuestions(get(userPracticeQuestions, '[0].detailedReport', []), get(questionBanksData, 'practiceQuestionsData', []))
    const totalClassWorkQuizQuestions = get(questionBanksData, 'practiceQuestionsData', []).length
    const avgClassQuizSubmission = Math.round((quizQuestionAttempted/totalClassWorkQuizQuestions)*100)
    const avgTriesClasswork = this.getQuizQuestions(get(userPracticeQuestions, '[0].detailedReport', []), get(questionBanksData, 'practiceQuestionsData', []), true)
    const totalClassWorkCodingQuestions = get(codingAssignmentData, 'classWorkAssignment', []).length
    const attemptedClassWorkCodingQuestions = this.getCodingQuestionArr(get(codingAssignmentData, 'classWorkAssignment', []), userAssignmentsData)
    const codingAvgPercentage = Math.round((attemptedClassWorkCodingQuestions/totalClassWorkCodingQuestions)*100)
    const totalHomeWorkCodingQuestions = get(codingAssignmentData, 'homeWorkAssignment', []).length
    const attemptedHomeWorkCodingQuestions = this.getCodingQuestionArr(get(codingAssignmentData, 'homeWorkAssignment', []), userAssignmentsData)
    const codingAvgPercentageHomework = Math.round((attemptedHomeWorkCodingQuestions/totalHomeWorkCodingQuestions)*100)
    const totalClassWorkPracticeQuestions = get(blockBasedQuestionData, 'practiceData', []).length
    const attemptedClassWorkPracticeQuestions = this.getPracticeQuestionArr(get(blockBasedQuestionData, 'practiceData', []), userBlockBasedPracticeData)
    const avgPracticeSubmission = Math.round((attemptedClassWorkPracticeQuestions/totalClassWorkPracticeQuestions)*100)
    const totalHomeWorkPracticeQuestions = get(blockBasedQuestionData, 'homeworkPracticeData', []).length
    const attemptedHomeWorkPracticeQuestions = this.getPracticeQuestionArr(get(blockBasedQuestionData, 'homeworkPracticeData', []), userBlockBasedPracticeData)
    const avgPracticeSubmissionHomework = Math.round((attemptedHomeWorkPracticeQuestions/totalHomeWorkPracticeQuestions)*100)

    if (sessionStartedOrCompleted.includes(sessionStatus)) {
      if (isClassWorkExist) {
        classWorkTabDiv = (
          <>
            {isLoWithPQ.length && isPQExist.length ? (
              <>
                <DetailedReportTitleStatsContainer
                  headingTitle="Quiz Questions"
                  questionCount={pqQuestions.length}
                  avgTries={avgTriesClasswork}
                  submittedPercentage={avgClassQuizSubmission}
                />
                <PqReportQuestionSectionStudent
                  pqQuestions={{
                    questionBank: pqQuestions,
                  }}
                  newIndividualStudentReport={userPracticeQuestions}
                  showOnlyQuestions={true}
                  forQuizSection={true}
                  styles={{ width: "100%" }}
                  key={"PracticeQuestionsContainer"}
                />
              </>
            ) : null}
            {isAssignment || isPractice.length || isProject ? (
              <>
                <DetailedReportTitleStatsContainer
                  headingTitle="Assignment Questions"
                  questionCount={assignmentCount}
                  submittedPercentage={(isPractice || isProject) ? avgPracticeSubmission : codingAvgPercentage}
                />
                <div className={styles.questionsLabel} />
                <HomeworkReviewCodingQuestion
                  newCodingQuestionsData={codingAssignmentData.classWorkAssignment}
                  isHomework={false}
                  userAssignmentsData={userAssignmentsData}
                  fromStudentReport
                  styles={{ width: "100%" }}
                  key={"ClassworkAssignmentContainer"}
                  topicId={get(batchSessionsData && batchSessionsData.toJS(), "topicData.id")}
                  topicTitle={get(batchSessionsData && batchSessionsData.toJS(), "topicData.title")}
                  topicComponentRule={get(batchSessionsData && batchSessionsData.toJS(), "topicData.topicComponentRule")}
                  courseId={get(batchSessionsData && batchSessionsData.toJS(), "courseData.id")}
                  attendence={studentsArray}
                  selectedStudent={selectedStudent}
                  evaluationData={this.props.evaluationData && this.props.evaluationData.toJS()}
                  evaluationDataFetchStatus={this.props.evaluationDataFetchStatus && this.props.evaluationDataFetchStatus.toJS()}
                  evaluationType={evaluationTypes.CODING_ASSIGNMENT}
                />
                {isPractice.length ? (
                  <HomeworkReviewBlocklyQuestion
                    newBlocklyBasedQuestion={blockBasedQuestionData.practiceData}
                    fromStudentReport={true}
                    userBlockBasedData={userBlockBasedPracticeData}
                    styles={{ width: "100%" }}
                    key={"ClassworkBlocklyPracticeContainer"}
                    topicId={get(batchSessionsData && batchSessionsData.toJS(), "topicData.id")}
                    topicTitle={get(batchSessionsData && batchSessionsData.toJS(), "topicData.title")}
                    topicComponentRule={get(batchSessionsData && batchSessionsData.toJS(), "topicData.topicComponentRule")}
                    courseId={get(batchSessionsData && batchSessionsData.toJS(), "courseData.id")}
                    attendence={studentsArray}
                    selectedStudent={selectedStudent}
                    evaluationData={this.props.evaluationData && this.props.evaluationData.toJS()}
                    evaluationDataFetchStatus={this.props.evaluationDataFetchStatus && this.props.evaluationDataFetchStatus.toJS()}
                    evaluationType={evaluationTypes.PRACTICE}
                  />
                ) : null}
                {isProject ? (
                  <HomeworkReviewBlocklyQuestion
                    newBlocklyBasedQuestion={blockBasedQuestionData.projectData}
                    fromStudentReport={true}
                    userBlockBasedData={userBlockBasedProjectData}
                    styles={{ width: "100%" }}
                    key={"ClassworkBlocklyProjectContainer"}
                    topicId={get(batchSessionsData && batchSessionsData.toJS(), "topicData.id")}
                    topicTitle={get(batchSessionsData && batchSessionsData.toJS(), "topicData.title")}
                    topicComponentRule={get(batchSessionsData && batchSessionsData.toJS(), "topicData.topicComponentRule")}
                    courseId={get(batchSessionsData && batchSessionsData.toJS(), "courseData.id")}
                    attendence={studentsArray}
                    selectedStudent={selectedStudent}
                    evaluationData={this.props.evaluationData && this.props.evaluationData.toJS()}
                    evaluationDataFetchStatus={this.props.evaluationDataFetchStatus && this.props.evaluationDataFetchStatus.toJS()}
                    evaluationType={evaluationTypes.PRACTICE}
                  />
                ) : null}
              </>
            ) : null}
          </>
        );
      }
      if (isHomeworkExist) {
        const assignmentHwCount =
          codingAssignmentData.homeWorkAssignment.length + blockBasedQuestionData.homeworkPracticeData.length;
        homeworkTabDiv = (
          <>
            {isQuiz && quizQuestions.length ? (
              <>
                <DetailedReportTitleStatsContainer
                  headingTitle="Quiz Questions"
                  questionCount={quizQuestions.length}
                  submittedPercentage={avgScore}
                />
                <PqReportQuestionSectionStudent
                  pqQuestions={{
                    questionBank: quizQuestions,
                  }}
                  newIndividualStudentReport={userQuizData}
                  showOnlyQuestions={true}
                  forQuizSection={true}
                  styles={{ width: "100%" }}
                  key={"HomeworkQuizContainer"}
                />
              </>
            ) : null}
            {isHWAssignment || isHWPractice.length ? (
              <>
                <DetailedReportTitleStatsContainer
                  headingTitle="Assignment Questions"
                  questionCount={assignmentHwCount}
                  submittedPercentage={isHWPractice.length ? avgPracticeSubmissionHomework : codingAvgPercentageHomework}
                />
                <div className={styles.questionsLabel} />
                <HomeworkReviewCodingQuestion
                  newCodingQuestionsData={codingAssignmentData.homeWorkAssignment}
                  isHomework={false}
                  userAssignmentsData={userAssignmentsData}
                  fromStudentReport
                  styles={{ width: "100%" }}
                  key={"HomeworkCodingContainer"}
                  topicId={get(batchSessionsData && batchSessionsData.toJS(), "topicData.id")}
                  topicTitle={get(batchSessionsData && batchSessionsData.toJS(), "topicData.title")}
                  topicComponentRule={get(batchSessionsData && batchSessionsData.toJS(), "topicData.topicComponentRule")}
                  courseId={get(batchSessionsData && batchSessionsData.toJS(), "courseData.id")}
                  attendence={studentsArray}
                  selectedStudent={selectedStudent}
                  evaluationData={this.props.evaluationData && this.props.evaluationData.toJS()}
                  evaluationDataFetchStatus={this.props.evaluationDataFetchStatus && this.props.evaluationDataFetchStatus.toJS()}
                  evaluationType={evaluationTypes.HW_ASSIGNMENT}
                />
                {isHWPractice.length ? (
                  <HomeworkReviewBlocklyQuestion
                    newBlocklyBasedQuestion={blockBasedQuestionData.homeworkPracticeData}
                    fromStudentReport={true}
                    userBlockBasedData={userBlockBasedPracticeData}
                    styles={{ width: "100%" }}
                    key={"HomeworkBlocklyPracticeContainer"}
                    topicId={get(batchSessionsData && batchSessionsData.toJS(), "topicData.id")}
                    topicTitle={get(batchSessionsData && batchSessionsData.toJS(), "topicData.title")}
                    topicComponentRule={get(batchSessionsData && batchSessionsData.toJS(), "topicData.topicComponentRule")}
                    courseId={get(batchSessionsData && batchSessionsData.toJS(), "courseData.id")}
                    attendence={studentsArray}
                    selectedStudent={selectedStudent}
                    evaluationData={this.props.evaluationData && this.props.evaluationData.toJS()}
                    evaluationDataFetchStatus={this.props.evaluationDataFetchStatus && this.props.evaluationDataFetchStatus.toJS()}
                    evaluationType={evaluationTypes.HW_PRACTICE}
                  />
                ) : null}
              </>
            ) : null}
          </>
        );
      }
    } else {
      classWorkTabDiv = (
        <div className={styles.emptyDataDiv}>
          <EmptyResponseIcon />
          Finish Classwork to generate the report
        </div>
      );
      homeworkTabDiv = (
        <div className={cx(styles.emptyDataDiv, styles.emptyDivForHw)}>
          <EmptyResponseIcon />
          Finish Classwork to generate the report
        </div>
      );
    }
    if (isClassWorkExist && sessionStartedOrCompleted.includes(sessionStatus) && isClassworkLoading) {
      classWorkTabDiv = (
        <>
          <DetailedReportTitleStatsContainer headingTitle="Quiz Questions" questionCount={pqQuestions.length} />
          {isLoWithPQ.length ? (
            isLoWithPQ.length > 1 ? (
              <PresentAbsentTabs tabsData={loList} onTabSwitch={this.onTabSwitch} activeTabKey={activeLo} fromStudentReport />
            ) : null
          ) : null}
          <div style={{ height: `${hsFor1280(150)}`, position: "relative" }}>
            <LoadingSpinner
              height="40vh"
              position="absolute"
              left="50%"
              top="50%"
              borderWidth="6px"
              transform="translate(-50%, -50%)"
              flexDirection="column"
              showLottie
            />
          </div>
        </>
      );
    }
    if (isHomeworkExist && sessionStartedOrCompleted.includes(sessionStatus) && isHomeworkLoading) {
      homeworkTabDiv = (
        <>
          {isQuiz && quizQuestions.length ? (
            <>
              <DetailedReportTitleStatsContainer
                headingTitle="Quiz Questions"
                questionCount={quizQuestions.length}
                submittedPercentage={avgScore}
              />
            </>
          ) : null}
          <div style={{ height: `${hsFor1280(150)}`, position: "relative" }}>
            <LoadingSpinner
              height="40vh"
              position="absolute"
              left="50%"
              top="50%"
              borderWidth="6px"
              transform="translate(-50%, -50%)"
              flexDirection="column"
              showLottie
            />
          </div>
        </>
      );
    }
    return {
      classWorkTabDiv,
      homeworkTabDiv,
    };
  };
  renderStudentDropDown = () => {
    const { selectedStudent } = this.state;
    const nextPrevStatus = this.getNextPrevStatus();
    return (
      <div className={styles.studentSelection}>
        <div className={styles.studentSelector}>
          {/* <div className={styles.studentProfilePic} style={{ backgroundImage: `url(${this.getStudentProfilePic()})` }}></div> */}
          <Dropdown
            components={{ IndicatorSeparator: () => null }}
            placeholder="Select Student"
            isMulti={false}
            styles={studentDropdownStyles}
            value={{
              value: get(selectedStudent, "student.studentData.id"),
              label: get(selectedStudent, "student.studentData.name"),
            }}
            className={styles.dropdownSelect}
            onChange={this.onStudentChange}
            options={this.getStudentsForDropDown()}
          ></Dropdown>
        </div>
        {this.getStudentsForDropDown().length > 1 ? (
          <div className={styles.nextPrevArrowAction}>
            <div
              onClick={() => nextPrevStatus !== "prev" && this.onNextPrevClick("prev")}
              className={nextPrevStatus === "prev" && styles.disableButton}
            >
              <NextArrowIcon className={styles.prevStudentArrow} /> Prev
            </div>
            <div
              onClick={() => nextPrevStatus !== "next" && this.onNextPrevClick("next")}
              className={nextPrevStatus === "next" && styles.disableButton}
            >
              Next <NextArrowIcon className={styles.nextStudentArrow} />
            </div>
          </div>
        ) : null}
      </div>
    );
  };
  isDataFetching = () => {
    const { batchSessionsFetchStatus } = this.props;
    return batchSessionsFetchStatus && batchSessionsFetchStatus.toJS() && get(batchSessionsFetchStatus.toJS(), "loading");
  };

  getQuizQuestions = (userPracticeQuestions, questionBanksData, getTries=false) => {
    const quizQuestionsArr = []
    let attemptedQuiz = 0
    let attemptedTries = 0
    let totalTries = 0
    questionBanksData.length && questionBanksData.forEach(item => {
      userPracticeQuestions.length && userPracticeQuestions.forEach(ques => {
        if (get(item , 'id') === get(ques, 'question.id')) {
          quizQuestionsArr.push(ques)
        }
      })
    })
    if (getTries) {
      quizQuestionsArr.length && quizQuestionsArr.forEach(item => {
        if (get(item, 'firstTry')) {
          attemptedTries += 1
        }
        if (get(item, 'secondTry')) {
          attemptedTries += 2
        }
        if (get(item, 'thirdOrMoreTry')) {
          attemptedTries += 3
        }
      })
    } else {
      quizQuestionsArr.length && quizQuestionsArr.forEach(item => {
        if (get(item, 'firstTry') || get(item, 'secondTry') || get(item, 'thirdOrMoreTry')) {
          attemptedQuiz += 1
        }
      })
    }
    if (getTries) {
      const totalTries = quizQuestionsArr.length
      return Math.round(attemptedTries/totalTries)
    } else {
      return attemptedQuiz
    }
  }

  getPracticeQuestionArr = (practiceData, userBlockBasedPractice) => {
    let attemptedPractices = 0
    practiceData.length && practiceData.forEach(item => {
      userBlockBasedPractice.length && userBlockBasedPractice.forEach(practice => {
        if (get(item, 'id') === get(practice, 'blockBasedProject.id')) {
          if (get(practice, 'answerLink') || get(practice, 'attachments').length) {
            attemptedPractices += 1
          }
        }
      })
    })
    return attemptedPractices
  }

  getCodingQuestionArr = (practiceQuestion, userAssignment) => {
    let attemptedPractices = 0
    practiceQuestion.length && practiceQuestion.forEach(item => {
      userAssignment.length && userAssignment.forEach(practice => {
        if (get(item, 'id') === get(practice, 'assignmentQuestion.id')) {
          if (get(practice, 'userAnswerCodeSnippet')) {
            attemptedPractices += 1
          }
        }
      })
    })
    return attemptedPractices
  }

  calculateClassworkTotalSubmission = () => {
    const {
      userPracticeQuestions,
      codingAssignmentData,
      questionBanksData,
      blockBasedQuestionData,
      userAssignmentsData,
      userBlockBasedPracticeData,
    } = this.state;
    let attemptedClassWorkQuizQuestions = 0
    let totalClassWorkQuizQuestions = 0
    let attemptedClassWorkPracticeQuestions = 0
    let totalClassWorkPracticeQuestions = 0
    let attemptedClassWorkCodingQuestions = 0
    let totalClassWorkCodingQuestions = 0
    const quizQuestionAttempted = this.getQuizQuestions(get(userPracticeQuestions, '[0].detailedReport', []), get(questionBanksData, 'practiceQuestionsData', []))
    attemptedClassWorkQuizQuestions = quizQuestionAttempted
    totalClassWorkQuizQuestions = get(questionBanksData, 'practiceQuestionsData', []).length
    totalClassWorkPracticeQuestions = get(blockBasedQuestionData, 'practiceData', []).length
    attemptedClassWorkPracticeQuestions = this.getPracticeQuestionArr(get(blockBasedQuestionData, 'practiceData', []), userBlockBasedPracticeData)
    totalClassWorkCodingQuestions = get(codingAssignmentData, 'classWorkAssignment', []).length
    attemptedClassWorkCodingQuestions = this.getCodingQuestionArr(get(codingAssignmentData, 'classWorkAssignment', []), userAssignmentsData)
    const attemptedSum = attemptedClassWorkQuizQuestions + attemptedClassWorkPracticeQuestions + attemptedClassWorkCodingQuestions
    const totalSum = totalClassWorkQuizQuestions + totalClassWorkPracticeQuestions + totalClassWorkCodingQuestions
    return Math.round((attemptedSum/totalSum) * 100)
  }

  calculateHomeworkTotalSubmission = () => {
    const {
      codingAssignmentData,
      blockBasedQuestionData,
      userAssignmentsData,
      userBlockBasedPracticeData,
      userQuizData,
    } = this.state;
    let attemptedClassWorkQuizQuestions = 0
    let totalClassWorkQuizQuestions = 0
    let attemptedClassWorkPracticeQuestions = 0
    let totalClassWorkPracticeQuestions = 0
    let attemptedClassWorkCodingQuestions = 0
    let totalClassWorkCodingQuestions = 0
    const quizReport = get(userQuizData, '[0].quizReport')
    attemptedClassWorkQuizQuestions = get(quizReport, 'totalQuestionCount') - get(quizReport, 'unansweredQuestionCount')
    totalClassWorkQuizQuestions = get(quizReport, 'totalQuestionCount')
    totalClassWorkPracticeQuestions = get(blockBasedQuestionData, 'homeworkPracticeData', []).length
    attemptedClassWorkPracticeQuestions = this.getPracticeQuestionArr(get(blockBasedQuestionData, 'homeworkPracticeData', []), userBlockBasedPracticeData)
    totalClassWorkCodingQuestions = get(codingAssignmentData, 'homeWorkAssignment', []).length
    attemptedClassWorkCodingQuestions = this.getCodingQuestionArr(get(codingAssignmentData, 'homeWorkAssignment', []), userAssignmentsData)
    const attemptedSum = attemptedClassWorkQuizQuestions + attemptedClassWorkPracticeQuestions + attemptedClassWorkCodingQuestions
    const totalSum = totalClassWorkQuizQuestions + totalClassWorkPracticeQuestions + totalClassWorkCodingQuestions
    return Math.round((attemptedSum/totalSum) * 100)
  }

  render() {
    const {
      topicDetail,
      batchDetail,
      isBackToTopVisible,
      isClassworkLoading,
      isHomeworkLoading,
    } = this.state;
    const { isClassWorkExist, isHomeworkExist } = this.checkForComponents();
    if (this.isDataFetching()) {
      return (
        <div className={styles.studentLevelLoaderBackdrop}>
          <LoadingSpinner
            height="40vh"
            position="absolute"
            left="50%"
            top="50%"
            borderWidth="6px"
            transform="translate(-50%, -50%)"
            flexDirection="column"
            showLottie
          >
            <span className="timetable-loading-text">Loading Details</span>
          </LoadingSpinner>
        </div>
      );
    }
    return (
      <div className={styles.individualStudentReport}>
        {!isClassworkLoading && !isHomeworkLoading ? (
          <span className="individual-student-level-page-mixpanel-identifier" />
        ) : null}
        <ReportPageHeader topicDetail={topicDetail} batchDetail={batchDetail} />
        <ReportGradeCourseHeader
          topicDetail={topicDetail}
          batchDetail={batchDetail}
          students={get(this.props.batchSessionsData.toJS(), "attendance")}
          sessionStartDate={get(this.props.batchSessionsData.toJS(), "sessionStartDate")}
          sessionEndDate={get(this.props.batchSessionsData.toJS(), "sessionEndDate")}
          sessionStatus={get(this.props.batchSessionsData.toJS(), "sessionStatus")}
          studentsFromDetailedReport
        />
        <ReportQuestionStudentTabs />
        <div className={styles.studentDetailsSection}>
          <div className={styles.backActionContainer} onClick={this.goBackToStudents}>
            <NextArrowIcon className={styles.nextArrowIcon} /> Back to Student List
          </div>
          <div className={styles.studentDetailsFlex}>{this.renderStudentDropDown()}</div>
        </div>
        <div className={styles.studentSubmissionSection}>
          {isClassWorkExist ? (
            <>
              <ReportStatsComponent
                title="Classwork Report"
                percentage={this.calculateClassworkTotalSubmission()}
              />
              {this.renderClassWorkTab().classWorkTabDiv}
            </>
          ) : null}
          {isHomeworkExist ? (
            <>
              <ReportStatsComponent
                title="Homework Report"
                percentage={this.calculateHomeworkTotalSubmission()}
              />
              {this.renderClassWorkTab().homeworkTabDiv}
            </>
          ) : null}
        </div>
        <div className={cx(styles.backToTop, isBackToTopVisible && styles.visibleButton)}>
          <Button text={<ChevronLeft />} type="secondary" textClass="addIcon" onBtnClick={this.onBackToTopClick} />
        </div>
      </div>
    );
  }
}

export default IndividualStudentReport;
