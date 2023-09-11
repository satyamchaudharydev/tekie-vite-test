import get from 'lodash/get';
import React from 'react'
import cx from 'classnames'
import Button from '../../components/Button/Button';
import ReportGradeCourseHeader from '../../components/ReportGradeCourseHeader';
import ReportPageHeader from '../../components/ReportPageHeader';
import PresentAbsentTabs from '../../components/ReportQuestionStudentTabs/PresentAbsentTabs';
import ReportQuestionStudentTabs from "../../components/ReportQuestionStudentTabs/ReportQuestionStudentTabs"
import { EmptyResponseIcon, SearchSvg, TooltipWarning, WarningSvg } from '../../components/svg';
import fetchBatchSessionDetails from '../../../../queries/classroomReportsQuery/fetchBatchSessionDetails'
import styles from './studentLevelReport.module.scss'
import getClassworkSummary from '../../../../queries/teacherApp/getClassworkSummary'
import getHomeworkSummary from '../../../../queries/teacherApp/getHomeworkSummary';
import sortBy from 'lodash/sortBy';
import { hs } from '../../../../utils/size';
import LoadingSpinner from '../../components/Loader/LoadingSpinner';
import ContentLoader from 'react-content-loader';
import PreserveState from '../../../../components/PreserveState';
import { EvaluationContextProvider } from '../Classroom/components/EvaluationModal/contexts/EvaluationContext';
import EvaluationModal from '../Classroom/components/EvaluationModal/EvaluationModal';
import fetchEvaluationData from '../../../../queries/teacherApp/fetchEvaluationData';
import ReactTooltip from 'react-tooltip';
import { getsortedEvaluationData } from '../Classroom/ClassroomDetails/ClassroomDetails.helpers';
import { sessionStartedOrCompleted } from '../TimeTable/constants';
import UpdatedToolTip from "../../../../components/UpdatedToolTip/UpdatedToolTip";
import getColorBasedOnPercentage from "../../../../utils/teacherApp/getColorBasedOnPercentage";
import { evaluationTypes } from '../../utils';

const tabs = [
  {
    label: "Present Students",
    value: "presentStudents",
  },
  {
    label: "Absent Students",
    value: "absentStudents",
  },
];

class StudentLevelReport extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      batchDetail: null,
      topicDetail: null,
      students: {
        presentStudents: [],
        absentStudents: [],
      },
      activeTab: "presentStudents",
      searchStudentText: "",
      studentsDetailsData: null,
      topicComponentRule: [],
      studentDetailsLoading: false,
      sessionStatus: "",
      evaluationModalDetails: { isOpen: false, evaluationType: evaluationTypes.CODING_ASSIGNMENT },
      currentStudent: null,
      assignmentData: {},
      isFetchingEvaluationData: false,
      updatingEvaluationData: false,
      getClassSummaryReport: {},
      getWithHomeworkReport: {},
      getWithoutHomeworkReport: {},
      isFetchingReportsData: false,
    };
  }
  componentDidMount = async () => {
    const {
      match: { params },
    } = this.props;
    const sessionId = get(params, "sessionId");
    let { batchSessionsData } = this.props;
    batchSessionsData = (batchSessionsData && batchSessionsData.toJS()) || {};
    if (get(batchSessionsData, "id")) {
      this.setReportData();
    } else if (sessionId) {
      await fetchBatchSessionDetails(sessionId);
    }
  };
  componentDidUpdate = async (prevProps) => {
    const { topicComponentRule } = this.state;
    const { batchSessionsFetchStatus, evaluationDataFetchStatus, evaluationData } = this.props;
    if (
      batchSessionsFetchStatus &&
      !get(batchSessionsFetchStatus.toJS(), "loading") &&
      get(batchSessionsFetchStatus.toJS(), "success") &&
      prevProps.batchSessionsFetchStatus !== batchSessionsFetchStatus
    ) {
      this.setReportData();
    }
    if (evaluationDataFetchStatus !== prevProps.evaluationDataFetchStatus) {
      if (evaluationDataFetchStatus && get(evaluationDataFetchStatus.toJS(), "loading")) {
        this.setState({ isFetchingEvaluationData: true });
      } else {
        this.setState({ isFetchingEvaluationData: false });
      }
    }
    if (evaluationData !== prevProps.evaluationData) {
      const evaluationDataFromProps = evaluationData && evaluationData.toJS();
      const evaluationDataFromPropsTemp = { ...evaluationDataFromProps };
      const blockBasedPracticeComponent =
        topicComponentRule &&
        topicComponentRule.filter(
          (rule) => get(rule, "componentName") === "blockBasedPractice" || get(rule, "componentName") === "homeworkPractice"
        );
      const getsortedEvaluationDataTemp = getsortedEvaluationData(evaluationDataFromProps, blockBasedPracticeComponent);
      evaluationDataFromPropsTemp.blockBasedPracitce = getsortedEvaluationDataTemp;
      this.setState({ assignmentData: evaluationDataFromPropsTemp }, () => this.fetchReportDataForStudents(true));
    }
  };
  setReportData = async () => {
    let { batchSessionsData } = this.props;
    batchSessionsData = (batchSessionsData && batchSessionsData.toJS()) || {};
    if (batchSessionsData) {
      const userIds = get(batchSessionsData, "attendance", []).map((item) => get(item, "student.studentData.id"));
      const topicId = get(batchSessionsData, "topicData.id");
      const courseId = get(batchSessionsData, "courseData.id");
      fetchEvaluationData(userIds, topicId, courseId);
      const presentStudents = get(batchSessionsData, "attendance", []).filter((student) => get(student, "isPresent"));
      const absentStudents = get(batchSessionsData, "attendance", []).filter((student) => !get(student, "isPresent"));
      this.setState(
        {
          batchDetail: get(batchSessionsData, "batchData"),
          topicDetail: get(batchSessionsData, "topicData"),
          students: {
            presentStudents,
            absentStudents,
          },
          topicComponentRule: sortBy(get(batchSessionsData, "topicData.topicComponentRule"), "order"),
          sessionStatus: get(batchSessionsData, "sessionStatus"),
        },
        this.fetchReportDataForStudents
      );
    }
  };
  getTableData = () => {
    const { activeTab, students, searchStudentText, studentsDetailsData, studentDetailsLoading, sessionStatus } = this.state;
    const { isAssignment, isLoWithPQ, isHWAssignment, isHWPractice, isPractice, isProject, isQuiz } = this.checkForComponents();
    const studentsList = students[activeTab];
    const {
      match: { params }, getPracticeQuestionReportFetchStatus
    } = this.props;
    const isFetchPracticeQuestionReport = getPracticeQuestionReportFetchStatus && get(getPracticeQuestionReportFetchStatus.toJS(), 'loading')
    const sessionId = get(params, "sessionId");
    const loComponents = [...isLoWithPQ];
    const practiceComponent = [...isPractice];
    const homeworkPractice = [...isHWPractice];
    const isHomeworkExist = isHWAssignment || isQuiz || homeworkPractice.length;
    const isClassWorkExist = isLoWithPQ.length || isAssignment || isPractice.length || isProject;
    const totalClassComponent = [];
    if (loComponents.length) totalClassComponent.push(...loComponents);
    if (isAssignment) totalClassComponent.push(isAssignment);
    if (isPractice.length) totalClassComponent.push(...isPractice);
    if (isProject) totalClassComponent.push(isProject);
    const totalHomeWorkComponent = [];
    if (homeworkPractice.length) totalHomeWorkComponent.push(...homeworkPractice);
    if (isHWAssignment) totalHomeWorkComponent.push(isHWAssignment);
    if (isQuiz) totalHomeWorkComponent.push(isQuiz);
    let classStrLen = 0;
    let classStr = "";
    let hwStrLen = 0;
    let hwStr = "";
    for (const classStrVal of loComponents) {
      if (classStrLen < get(classStrVal, "learningObjective.title", "").length) {
        classStrLen = get(classStrVal, "learningObjective.title", "").length;
        classStr = get(classStrVal, "learningObjective.title", "");
      }
    }
    for (const classStrVal of isPractice) {
      if (classStrLen < get(classStrVal, "blockBasedProject.title", "").length) {
        classStrLen = get(classStrVal, "blockBasedProject.title", "").length;
        classStr = get(classStrVal, "blockBasedProject.title", "");
      }
    }
    for (const hwStrVal of homeworkPractice) {
      if (hwStrLen < get(hwStrVal, "blockBasedProject.title", "").length) {
        hwStrLen = get(hwStrVal, "blockBasedProject.title", "").length;
        hwStr = get(hwStrVal, "blockBasedProject.title", "");
      }
    }
    let tableData = studentsList
      .filter((student) =>
        get(student, "student.studentData.name", "")
          .toLowerCase()
          .includes(searchStudentText)
      )
      .map((student) => {
        const studentReportData = get(studentsDetailsData, get(student, "student.studentData.id"));
        const classWorkAssignment = get(studentReportData, "classWorkAssignment", false);
        const classWorkLo = get(studentReportData, "classWorkLo", []);
        const classWorkProject = get(studentReportData, "classWorkProject", false);
        const classWorkPractice = get(studentReportData, "classWorkPractice", []);
        const homeworkAssignment = get(studentReportData, "homeworkAssignment", false);
        const homeworkPracticeComponent = get(studentReportData, "homeworkPracticeComponent", []);
        const homeworkQuiz = get(studentReportData, "homeworkQuiz", false);
        const classWorkSubmission = get(studentReportData, "classWorkSubmission", []);
        const homeworkQuizAvgScore = get(studentReportData, "homeworkQuizAvgScore")


        if (this.isDataFetching() || isFetchPracticeQuestionReport || this.state.isFetchingReportsData) {
          return (
          <tr key={get(student, 'student.studentData.id')}>
            <td className={styles.studentRollNo}><span>{get(student, 'student.rollNo', '1234') || '-'}</span></td>
            <td className={styles.studentName}>{get(student, 'student.studentData.name')}</td>
            {isClassWorkExist ? (
              <>
                {loComponents.length ? (
                  <>
                    {classWorkSubmission.map((sub) => (
                      <>
                        <td className={styles.submissionCount}>{this.renderSkeleton()}</td>
                      </>
                    ))}
                    {classWorkLo.map((pqTries) => (
                      <>
                        <td>{this.renderSkeleton()}</td>
                      </>
                    ))}
                  </>
                ) : null}
                {isAssignment && classWorkAssignment ? <td>{this.renderSkeleton()}</td> : null}
                {isProject && classWorkProject ? <td>{this.renderSkeleton()}</td> : null}
                {practiceComponent.length && classWorkPractice.length ? (
                  <>
                    {classWorkPractice.map((classPractice) => (
                      <td className={styles.assignmentChildrenData}>{this.renderSkeleton()}</td>
                    ))}
                  </>
                ) : null}
              </>
            ) : null}
            {isHomeworkExist ? (
              <>
                {isQuiz && homeworkQuiz ? (
                  <>
                    <td className={styles.submissionCount}>{this.renderSkeleton()}</td>
                    <td className={styles.submissionCount} style={{ color: getColorBasedOnPercentage(Number(get(homeworkQuizAvgScore, 'props.children'))) }}>{this.renderSkeleton()}</td>
                  </>
                ) : null}
                {isHWAssignment && homeworkAssignment ? <td>{this.renderSkeleton()}</td> : null}
                {homeworkPractice.length && homeworkPracticeComponent.length ? (
                  <>
                    {homeworkPracticeComponent.map((hwPractice) => (
                      <td className={styles.assignmentChildrenData}>{this.renderSkeleton()}</td>
                    ))}
                  </>
                ) : null}
              </>
            ) : null}
              <td className={styles.viewDetailsButtonContainer}>
                <Button
                    key={get(student, 'student.studentData.id')}
                    text='View Details' type='secondary'
                    isDisabled={get(studentReportData, 'isClassCompleted', 0) === 0 && get(studentReportData, 'isHomeworkCompleted', 0) === 0}
                    onBtnClick={() => this.props.history.push(`/teacher/reports/classroom/${sessionId}/student-level/${get(student, 'student.studentData.id')}`)}
                  />
              </td>
          </tr>
        )
        }


        return (
          <tr className={styles.tableDataBoxes}>
            <td className={styles.studentRollNo}>
              <span>{get(student, "student.rollNo") || "-"}</span>
            </td>
            <td className={styles.studentName}>{get(student, "student.studentData.name")}</td>
            {isClassWorkExist ? (
              <>
                {loComponents.length ? (
                  <>
                    {classWorkSubmission.map((sub) => (
                      <>
                        <td className={styles.submissionCount}>{sub}</td>
                      </>
                    ))}
                    {classWorkLo.map((pqTries) => (
                      <>
                        <td>{pqTries}</td>
                      </>
                    ))}
                  </>
                ) : null}
                {isAssignment && classWorkAssignment ? <td>{classWorkAssignment}</td> : null}
                {isProject && classWorkProject ? <td>{classWorkProject}</td> : null}
                {practiceComponent.length && classWorkPractice.length ? (
                  <>
                    {classWorkPractice.map((classPractice) => (
                      <td className={styles.assignmentChildrenData}>{classPractice}</td>
                    ))}
                  </>
                ) : null}
              </>
            ) : null}
            {isHomeworkExist ? (
              <>
                {isQuiz && homeworkQuiz ? (
                  <>
                    <td className={styles.submissionCount}>{homeworkQuiz}</td>
                    <td className={styles.submissionCount} style={{ color: getColorBasedOnPercentage(Number(get(homeworkQuizAvgScore, 'props.children'))) }}>{homeworkQuizAvgScore}%</td>
                  </>
                ) : null}
                {isHWAssignment && homeworkAssignment ? <td>{homeworkAssignment}</td> : null}
                {homeworkPractice.length && homeworkPracticeComponent.length ? (
                  <>
                    {homeworkPracticeComponent.map((hwPractice) => (
                      <td className={styles.assignmentChildrenData}>{hwPractice}</td>
                    ))}
                  </>
                ) : null}
              </>
            ) : null}
            <td className={styles.viewDetailsButtonContainer}>
              <Button
                key={get(student, "student.studentData.id")}
                text="View Details"
                type="secondary"
                isDisabled={
                  get(studentReportData, "isClassCompleted", 0) === 0 && get(studentReportData, "isHomeworkCompleted", 0) === 0
                }
                onBtnClick={() =>
                  this.props.history.push(
                    `/teacher/reports/classroom/${sessionId}/student-level/${get(student, "student.studentData.id")}`
                  )
                }
              />
            </td>
          </tr>
        );
      });
    if (!sessionStartedOrCompleted.includes(sessionStatus)) {
      tableData = [];
    }
    const tableHeaderFirst = (
      <tr>
        <th rowSpan={3}>Roll No.</th>
        <th rowSpan={3}>Student Name</th>
        {isClassWorkExist ? (
          <th
            colSpan={
              (loComponents.length ? 2 : 0) +
              (practiceComponent.length ? practiceComponent.length : 0) +
              (isAssignment || isProject ? 1 : 0)
            }
            className={cx(styles.firstHeadColStyle, styles.firstHeadColPadding)}
          >
            Classwork
          </th>
        ) : null}
        {isHomeworkExist ? (
          <th
            colSpan={(isQuiz ? 2 : 0) + (homeworkPractice.length ? homeworkPractice.length : 0) + (isHWAssignment ? 1 : 0)}
            className={cx(styles.firstHeadColStyle, styles.firstHeadColPadding)}
          >
            Homework
          </th>
        ) : null}
        <th rowSpan={3}>Actions</th>
      </tr>
    );
    const tableHeaderSecond = (
      <tr>
        {isClassWorkExist ? (
          <>
            {loComponents.length ? (
              <th colSpan={2} className={cx(styles.secondHeadColWidth, styles.firstHeadColStyle, styles.secondHeadColPadding)}>
                Quiz
              </th>
            ) : null}
            {isAssignment ? (
              <th rowSpan={2}>
                <div className={cx(styles.secondHeadAssignmentStyle, styles.secondHeadColWidth)}>
                  <p>Coding Assignment</p>
                  <span>(Avg. Score)</span>
                </div>
              </th>
            ) : null}
            {isProject ? <th colSpan={2}>Project</th> : null}
            {practiceComponent.length ? (
              <th colSpan={practiceComponent.length} className={styles.practiceContainerHeading}>
                <div className={cx(styles.secondHeadAssignmentStyle, styles.secondHeadColWidth)}>
                  <p>Practice Assignment</p>
                  <span>(Avg. Score)</span>
                </div>
              </th>
            ) : null}
          </>
        ) : null}
        {isHomeworkExist ? (
          <>
            {isQuiz ? (
              <th colSpan={2} className={cx(styles.secondHeadColWidth, styles.firstHeadColStyle, styles.secondHeadColPadding)}>
                Quiz
              </th>
            ) : null}
            {isHWAssignment ? (
              <th rowSpan={2}>
                <div className={cx(styles.secondHeadAssignmentStyle, styles.secondHeadColWidth)}>
                  <p>Coding Assignment</p>
                  <span>(Avg. Score)</span>
                </div>
              </th>
            ) : null}
            {homeworkPractice.length ? (
              <th colSpan={homeworkPractice.length}>
                <div className={cx(styles.secondHeadAssignmentStyle, styles.secondHeadColWidth)}>
                  <p>Homework Assignment</p>
                  <span>(Avg. Score)</span>
                </div>
              </th>
            ) : null}
          </>
        ) : null}
      </tr>
    );
    const tableHeaderThird = (
      <tr>
        {isClassWorkExist ? (
          <>
            {loComponents.length ? (
              <>
                <th>Submitted</th>
                <th>Avg. Tries</th>
              </>
            ) : null}
            {practiceComponent.length ? (
              <>
                {practiceComponent.map((lo) => (
                  <th className={cx(styles.contentBox, styles.headerSubText)}>{`${get(lo, "blockBasedProject.title")}`}</th>
                ))}
              </>
            ) : null}
          </>
        ) : null}
        {isHomeworkExist ? (
          <>
            {isQuiz ? (
              <>
                <th>Submitted</th>
                <th>Avg. Score</th>
              </>
            ) : null}
            {homeworkPractice.length ? (
              <>
                {homeworkPractice.map((lo) => (
                  <th className={styles.contentBox}>{`${get(lo, "blockBasedProject.title")}`}</th>
                ))}
              </>
            ) : null}
          </>
        ) : null}
      </tr>
    );
    return {
      tableData,
      tableHeaderFirst,
      tableHeaderSecond,
      tableHeaderThird,
    };
  };
  onTabSwitch = (tabKey) => {
    this.setState({ activeTab: tabKey });
  };
  checkForComponents = () => {
    const { topicComponentRule } = this.state;
    const isLoWithPQ = topicComponentRule.filter(
      (component) =>
        get(component, "componentName") === "learningObjective" && get(component, "learningObjective.questionBankMeta.count")
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
    return {
      isLoWithPQ,
      isAssignment,
      isProject,
      isPractice,
      isHWAssignment,
      isQuiz,
      isHWPractice,
    };
  };

  redirectToEvaluation = (student, evaluationType, currentPracticeQuestion = null) => {
    this.setState({
      evaluationModalDetails: { ...this.state.evaluationModalDetails, isOpen: true, evaluationType, currentPracticeQuestion },
      currentStudent: student,
    });
  };

  renderPartialEvaluationTooltip = (student, evaluationType) => (
    <div className={styles.partialEvaluationTooltipContainer}>
      <div className={styles.partialEvaluationTooltipHead}>
        <TooltipWarning />
        <h3>Partially Evaluated</h3>
      </div>
      <p>
        Complete this evaluation to<br></br>calculate the average score.
      </p>
      <Button widthFull={true} text="Evaluate Answer" type="secondary" onBtnClick={() => this.redirectToEvaluation(student, evaluationType)} />
    </div>
  );

  getEvaluationTagOrScore = (evaluationType, student, studentId, questionId) => {
    const { assignmentData } = this.state;
    let evaluationData = null;
    if (evaluationTypes.CODING_ASSIGNMENT === evaluationType) {
      evaluationData = get(assignmentData, "userAssignment.classWorkQuestions", []);
    } else if (evaluationTypes.HW_ASSIGNMENT === evaluationType) {
      evaluationData = get(assignmentData, "userAssignment.homeWorkQuestions", []);
    } else if (evaluationTypes.PRACTICE === evaluationType) {
      evaluationData = get(assignmentData, "blockBasedPracitce.classWorkPractices", []);
    } else if (evaluationTypes.HW_PRACTICE === evaluationType) {
      evaluationData = get(assignmentData, "blockBasedPracitce.homeWorkPractices", []);
    }
    evaluationData = evaluationData.filter((item) => get(item, "user.id") === studentId);
    if (evaluationTypes.CODING_ASSIGNMENT === evaluationType || evaluationTypes.HW_ASSIGNMENT === evaluationType) {
      const assignments = get(evaluationData, "[0].assignment", []);
      const unEvaluatedAssignments = assignments.filter((item) => get(item, "evaluation") === null);
      const evaluatedAssignments = assignments.filter((item) => get(item, "evaluation") !== null);

      let gainedStar = 0;
      let totalStar = 0;
      assignments.forEach((item) => {
        if (get(item, "evaluation")) {
          gainedStar += get(item, "evaluation.star", 0);
          totalStar += 5;
        }
      });
      const result = Math.trunc((gainedStar / totalStar) * 100);
      const percentage = result ? result : 0;

      if (assignments.length > 0) {
        if (assignments.length === evaluatedAssignments.length) {
          return (
            <div
              onClick={() => this.redirectToEvaluation(student, evaluationType)}
              className={cx(styles.submittedStatus, styles.evaluateText)}
              style={{ color: "#01AA93", border: "none", fontWeight: "600" }}
            >
              {percentage}%
            </div>
          );
        }
        if (assignments.length === unEvaluatedAssignments.length) {
          return (
            <div
              onClick={() => this.redirectToEvaluation(student, evaluationType)}
              className={cx(styles.submittedStatus, styles.evaluateText)}
            >
              Evaluate
            </div>
          );
        } else {
          return (
            <div className={styles.partialText}>
              <UpdatedToolTip
                tipColor={"#FFC700"}
                delay={"200"}
                hideDelay={"800"}
                direction="bottomLeft"
                content={this.renderPartialEvaluationTooltip(student, evaluationType)}
              >
                <div style={{ display: "flex" }}>
                  <WarningSvg />
                  <span style={{ fontWeight: "600" }}>{percentage}%</span>
                </div>
              </UpdatedToolTip>
            </div>
          );
        }
      } else {
        return <div className={styles.notSubmittedStatus}>--</div>;
      }
    } else {
      evaluationData = evaluationData.filter((item) => get(item, "blockBasedPractice.id") === questionId);
      const evaluation = get(evaluationData, "[0].evaluation");
      if (evaluation) {
        const gainedScore = get(evaluation, "star");
        const percentage = Math.trunc((gainedScore / 5) * 100);
        return (
          <div
            onClick={() => this.redirectToEvaluation(student, evaluationType, questionId)}
            className={cx(styles.submittedStatus, styles.evaluateText)}
            style={{ color: "#01AA93", borderBottom: "1.5px dashed #01AA93" }}
          >
            {percentage}%
          </div>
        );
      } else {
        return (
          <div
            onClick={() => this.redirectToEvaluation(student, evaluationType, questionId)}
            className={cx(styles.submittedStatus, styles.evaluateText)}
          >
            Evaluate
          </div>
        );
      }
    }
  };

  fetchReportDataForStudents = async (refetch = false) => {
    const {
      students,
      batchDetail,
      topicDetail,
      getClassSummaryReport,
      getWithHomeworkReport,
      getWithoutHomeworkReport,
    } = this.state;
    const { isLoWithPQ, isAssignment, isProject, isPractice, isHWAssignment, isQuiz, isHWPractice } = this.checkForComponents();
    const studentsArray = [...students.presentStudents, ...students.absentStudents];
    const batchId = get(batchDetail, "id");
    const topicId = get(topicDetail, "id");
    this.setState({ studentDetailsLoading: !Boolean(this.state.studentsDetailsData) });
    let classSummaryReport = { ...getClassSummaryReport };
    let withHomeworkReport = { ...getWithHomeworkReport };
    let withoutHomeworkReport = { ...getWithoutHomeworkReport };
    if (!refetch) {
      this.setState({ isFetchingReportsData: true })
      classSummaryReport = await getClassworkSummary(batchId, topicId);
      withHomeworkReport = await getHomeworkSummary({
        topicId,
        batchId,
        isHomework: true,
      });
      withoutHomeworkReport = await getHomeworkSummary({
        topicId,
        batchId,
        isHomework: false,
      });
      this.setState({
        getClassSummaryReport: classSummaryReport,
        getWithHomeworkReport: withHomeworkReport,
        getWithoutHomeworkReport: withoutHomeworkReport,
        isFetchingReportsData: false
      });
    }
    classSummaryReport = get(classSummaryReport, "getPracticeQuestionReport.practiceQuestionOverallReport", []);
    withHomeworkReport = get(withHomeworkReport, "getClassroomReport");
    withoutHomeworkReport = get(withoutHomeworkReport, "getClassroomReportForBlockBasedPractice");
    const studentsDetailsData = {};
    const classReport = classSummaryReport.filter((summary) =>
      isLoWithPQ.map((lo) => get(lo, "learningObjective.id")).includes(get(summary, "loId"))
    );
    studentsArray.forEach((student) => {
      const studentUserId = get(student, "student.studentData.id");
      const homeworkQuiz = isQuiz
        ? get(withHomeworkReport, "quiz.submissions", []).find((submit) => get(submit, "userId") === studentUserId)
        : false;
      const classworkAssignment = isAssignment
        ? get(withoutHomeworkReport, "coding.submissions", []).find((submit) => get(submit, "userId") === studentUserId)
        : false;
      const userProject = get(withoutHomeworkReport, "blockBasedPractice", []).find((submit) =>
        get(submit, "submissions", [])
          .map((s) => get(s, "userId"))
          .includes(studentUserId)
      );
      const classworkProject = isProject
        ? get(userProject, "submissions", []).find((submit) => get(submit, "userId") === studentUserId)
        : false;
      const homeworkAssignment = isHWAssignment
        ? get(withHomeworkReport, "coding.submissions", []).find((submit) => get(submit, "userId") === studentUserId)
        : false;
      let isClassCompleted = 0;
      let isHomeworkCompleted = 0;
      if (classworkAssignment) isClassCompleted += 1;
      if (classworkProject) isClassCompleted += 1;
      if (homeworkAssignment) isHomeworkCompleted += 1;
      if (get(homeworkQuiz, "quizScore")) isHomeworkCompleted += 1;
      const classworkPracticeData = get(withoutHomeworkReport, "blockBasedPractice", []).filter(
        (classPractice) => get(classPractice, "questions", []).length
      );
      const homeworkPracticeData = get(withHomeworkReport, "blockBasedPractice", []).filter(
        (classPractice) => get(classPractice, "questions", []).length
      );
      const sessionReportData = {
        classWorkLo:
          isLoWithPQ.length && classReport.length
            ? classReport.map((report) => {
                const loPqArray = get(report, "pqIndividualQuestionReport", []);
                const totalUsersPqSubmissions = [];
                loPqArray.forEach((pq) => {
                  const userSubmissions = get(pq, "submissions", []).filter((submit) => get(submit, "userId") === studentUserId);
                  totalUsersPqSubmissions.push(...userSubmissions);
                });
                //todo userSubmissions.length / loPqArray.length
                let avgTries = 0;
                totalUsersPqSubmissions.forEach((submission) => {
                  avgTries += get(submission, "averageTries");
                });
                let finalAvgTries = 0;
                if (avgTries && avgTries >= loPqArray.length) finalAvgTries = avgTries / loPqArray.length;
                else finalAvgTries = 0;
                let timeClass = styles.thirdTry;
                if (finalAvgTries === 1) timeClass = styles.firstTry;
                else if (finalAvgTries === 2) timeClass = styles.thirdTry;
                else if (finalAvgTries >= 3 || finalAvgTries === 0) timeClass = styles.secondTry;
                finalAvgTries = Math.round(finalAvgTries);
                if (totalUsersPqSubmissions.length) {
                  isClassCompleted += 1;
                  const numberOfTries = Math.round(finalAvgTries);
                  let addSup = null;
                  if (numberOfTries === 1) {
                    addSup = "st";
                  } else if (numberOfTries === 2) {
                    addSup = "nd";
                  } else if (numberOfTries === 3) {
                    addSup = "rd";
                  } else {
                    addSup = "th";
                  }
                  return (
                    <>
                      <span className={timeClass}>
                        {numberOfTries}
                        <sup>{addSup}</sup> Try
                      </span>
                    </>
                  );
                }
                return <div>--</div>;
              })
            : isLoWithPQ.map((lo) => <div className={styles.emptyData}>--</div>),

        classWorkSubmission:
          isLoWithPQ.length && classReport.length
            ? classReport.map((report) => {
                const loPqArray = get(report, "pqIndividualQuestionReport", []);
                const totalUsersPqSubmissions = [];
                let userSubmissions = null;
                loPqArray.forEach((pq) => {
                  userSubmissions = get(pq, "submissions", []).filter((submit) => get(submit, "userId") === studentUserId);
                  totalUsersPqSubmissions.push(...userSubmissions);
                });
                if (totalUsersPqSubmissions.length) {
                  isClassCompleted += 1;
                  return (
                    <span>
                      {totalUsersPqSubmissions.length}/{loPqArray.length}
                    </span>
                  );
                }
                return <div>--</div>;
              })
            : isLoWithPQ.map((lo) => <div className={styles.emptyData}>--</div>),

        classWorkAssignment: classworkAssignment ? (
          this.getEvaluationTagOrScore(evaluationTypes.CODING_ASSIGNMENT, student, studentUserId)
        ) : (
          <div>--</div>
        ),

        classWorkProject: classworkProject ? (
          <div className={cx(styles.submittedStatus, styles.submittedText)}>Submitted</div>
        ) : (
          <div className={styles.emptyData}>--</div>
        ),
        classWorkPractice: isPractice.map((practice) => {
          const userSubmissions = classworkPracticeData.filter(
            (classworkPractice) =>
              get(classworkPractice, "questions", [])
                .map((question) => get(question, "questionId"))
                .includes(get(practice, "blockBasedProject.id")) &&
              get(classworkPractice, "submissions", [])
                .map((submission) => get(submission, "userId"))
                .includes(studentUserId)
          );
          if (userSubmissions && userSubmissions.length) {
            isClassCompleted += 1;
            return this.getEvaluationTagOrScore(
              evaluationTypes.PRACTICE,
              student,
              studentUserId,
              get(practice, "blockBasedProject.id")
            );
          }
          return <div>--</div>;
        }),
        homeworkAssignment: homeworkAssignment ? (
          this.getEvaluationTagOrScore(evaluationTypes.HW_ASSIGNMENT, student, studentUserId)
        ) : (
          <div>--</div>
        ),
        homeworkQuiz: (
          <>
            <span className={styles.gainedScore}>{homeworkQuiz ? (get(withHomeworkReport, "quiz.totalQuestions", 0) - get(homeworkQuiz, "unansweredQuestionCount", 0)) : 0}</span>
            <span>/</span>
            <span>{get(withHomeworkReport, "quiz.totalQuestions") || 0}</span>
          </>
        ),
        homeworkQuizAvgScore: (
          <span>{(homeworkQuiz && get(homeworkQuiz, "quizScore", 0) && get(withHomeworkReport, "quiz.totalQuestions", 0)) ? Math.round((get(homeworkQuiz, "quizScore", 0)/get(withHomeworkReport, "quiz.totalQuestions"))*100) : 0}</span>
        ),
        homeworkPracticeComponent: isHWPractice.map((practice) => {
          const userSubmissions = homeworkPracticeData.filter(
            (classworkPractice) =>
              get(classworkPractice, "questions", [])
                .map((question) => get(question, "questionId"))
                .includes(get(practice, "blockBasedProject.id")) &&
              get(classworkPractice, "submissions", [])
                .map((submission) => get(submission, "userId"))
                .includes(studentUserId)
          );
          // const userSubmissions = get(practice, 'submissions', []).find(submit => get(submit, 'userId') === studentUserId)
          if (userSubmissions && userSubmissions.length) {
            isHomeworkCompleted += 1;
            return this.getEvaluationTagOrScore(
              evaluationTypes.HW_PRACTICE,
              student,
              studentUserId,
              get(practice, "blockBasedProject.id")
            );
          }
          return <div>--</div>;
        }),
      };
      studentsDetailsData[studentUserId] = {
        ...sessionReportData,
        isClassCompleted,
        isHomeworkCompleted,
      };
    });
    this.setState({ studentsDetailsData, studentDetailsLoading: false });
  };
  isDataFetching = () => {
    const { batchSessionsFetchStatus } = this.props;
    return (
      this.state.isFetchingEvaluationData ||
      (batchSessionsFetchStatus && batchSessionsFetchStatus.toJS() && get(batchSessionsFetchStatus.toJS(), "loading"))
    );
  };
  getAllStudents = () => {
    const { students } = this.state;
    const studentsToSend = [...students.presentStudents, ...students.absentStudents];
    let studentToSendRenamed = [];
    studentsToSend.forEach((student) => {
      let obj = {};
      obj.isPresent = get(student, "isPresent");
      obj.status = get(student, "status");
      obj.student = {
        id: get(student, "student.id"),
        profileAvatarCode: get(student, "student.profileAvatarCode"),
        rollNo: get(student, "student.rollNo"),
        user: {
          id: get(student, "student.studentData.id"),
          name: get(student, "student.studentData.name"),
          profilePic: get(student, "student.studentData.profilePic"),
        },
      };
      studentToSendRenamed.push(obj);
    });
    return studentToSendRenamed;
  };
  closeEvaluationModal = () => {
    this.setState({
      evaluationModalDetails: { ...this.state.evaluationModalDetails, isOpen: false },
    });
  };
  renderSkeleton = () => (
    <ContentLoader
      className={styles.progressSkeleton}
      speed={1}
      backgroundColor={"#f5f5f5"}
      foregroundColor={"#dbdbdb"}
      viewBox="0 0 100 4"
    >
      <rect x="0" y="0" />
    </ContentLoader>
  );
  render() {
    const {
      activeTab,
      topicDetail,
      batchDetail,
      searchStudentText,
      sessionStatus,
      evaluationModalDetails,
      currentStudent,
      studentDetailsLoading,
    } = this.state;
    return (
      <>
        <div id={`studentLevelReportForBatch`}>
          {this.isDataFetching() ? (
            <div className={styles.timetableCalendarLoaderBackdrop}>
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
          ) : (
            <div className={styles.studentLevelContainer}>
              <PreserveState
                state={this.state}
                setState={(state, callback = () => {}) => {
                  this.setState(
                    {
                      studentsDetailsData: get(state, "studentsDetailsData"),
                      activeTab: get(state, "activeTab"),
                    },
                    callback
                  );
                }}
                persistIf={(id) => {
                  return id === `studentLevelReportForBatch${get(this.props, "match.params.sessionId")}`;
                }}
                saveIf={this.state.studentsDetailsData}
                id={`studentLevelReportForBatch${get(this.props, "match.params.sessionId")}`}
                preserveScroll={["studentLevelReportForBatch"]}
              />
              <span className="student-level-page-mixpanel-identifier" />
              <ReportPageHeader topicDetail={topicDetail} batchDetail={batchDetail} />
              <ReportGradeCourseHeader 
                topicDetail={topicDetail}
                batchDetail={batchDetail}
                fromStudentLevelReport
                evaluationData={this.state.assignmentData}
                students={this.getAllStudents()}
                sessionStartDate={get(this.props.batchSessionsData.toJS(), "sessionStartDate")}
                sessionEndDate={get(this.props.batchSessionsData.toJS(), "sessionEndDate")}
                sessionStatus={get(this.props.batchSessionsData.toJS(), "sessionStatus")}
              />
              <ReportQuestionStudentTabs />
              <div className={styles.studentFilterContainer}>
                <PresentAbsentTabs tabsData={tabs} onTabSwitch={this.onTabSwitch} activeTabKey={activeTab} fromDetailedReport />
                <div className={styles.studentLevelSearchText}>
                  <input
                    className={styles.studentLevelSearchInput}
                    placeholder="Search Students"
                    value={searchStudentText}
                    onChange={(e) => this.setState({ searchStudentText: e.target.value })}
                  ></input>
                  <SearchSvg />
                </div>
              </div>
              <div className={styles.studentLevelReportTableContainer}>
                <div className={cx(styles.studentsTableWrapper)}>
                  <>
                    {/* {this.getTableData().tableData.length && studentDetailsLoading && sessionStatus === 'completed' ? (
                      <div className={cx(styles.studentDetailsLoader, this.getTableData().tableData.length && styles.studentDetailsLoaderBG)}>
                        <LoadingSpinner
                            height='40vh'
                            position='absolute'
                            left='50%'
                            top={!this.getTableData().tableData.length ? '40%' : '50%'}
                            borderWidth='6px'
                            transform='translate(-50%, -50%)'
                            flexDirection='column'
                            showLottie
                        >
                            <span className='timetable-loading-text'>Loading Details</span>
                        </LoadingSpinner>
                      </div>
                    ) : null} */}
                    {sessionStartedOrCompleted.includes(sessionStatus) ? (
                      <>
                        <div className={styles.studentTableContainer}>
                          <table>
                            <tbody>
                              {this.getTableData().tableHeaderFirst}
                              {this.getTableData().tableHeaderSecond}
                              {this.getTableData().tableHeaderThird}
                              {this.getTableData().tableData}
                            </tbody>
                          </table>
                          {!this.getTableData().tableData.length ? (
                            <div className={styles.emptyDataDiv}>
                              <EmptyResponseIcon />
                              No students were {activeTab === "presentStudents" ? "present" : "absent"} during the class
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      </>
                    ) : (
                      <div className={styles.studentTableContainer}>
                        <table>
                          <tbody>
                            {this.getTableData().tableHeaderFirst}
                            {this.getTableData().tableHeaderSecond}
                            {this.getTableData().tableHeaderThird}
                            {this.getTableData().tableData}
                          </tbody>
                        </table>
                        <div className={styles.emptyDataDiv}>
                          <EmptyResponseIcon />
                          Complete your session to generate the report
                        </div>
                      </div>
                    )}
                  </>
                </div>
              </div>
            </div>
          )}
        </div>
        {evaluationModalDetails && get(evaluationModalDetails, "isOpen") && (
          <EvaluationContextProvider>
            <EvaluationModal
              evaluationModalDetails={evaluationModalDetails}
              assignmentData={this.state.assignmentData}
              topicDetails={{ title: get(topicDetail, "title"), topicId: get(topicDetail, "id") }}
              courseId={get(topicDetail, "courses[0].id")}
              students={this.getAllStudents()}
              currentStudent={currentStudent}
              openedFromStudentPerformance={true}
              closeEvaluationModal={this.closeEvaluationModal}
            />
          </EvaluationContextProvider>
        )}
      </>
    );
  }
}

export default StudentLevelReport;
