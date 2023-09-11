import React, { useState } from "react";
import { get } from "lodash";
import moment from "moment";
import UpdatedToolTip from "../../../../components/UpdatedToolTip/UpdatedToolTip";
import { DummySessionDetailsThumbnail, InformationCircle } from "../../../../constants/icons";
import getPath from "../../../../utils/getFullPath";
import { evaluationTypes } from "../../utils";
import ProgressBar from "../../pages/Classroom/components/BatchCarousel/ProgressBar";
import { EvaluationContextProvider } from "../../pages/Classroom/components/EvaluationModal/contexts/EvaluationContext";
import EvaluationModal from "../../pages/Classroom/components/EvaluationModal/EvaluationModal";
import Button from "../Button/Button";
import StudentListTooltip from "../StudentListTooltip";
import styles from "./reportGradeCourseHeader.module.scss";
import { StatusTag } from "../../pages/Classroom/ClassroomDetails/StatusTag";

const ReportGradeCourseHeader = ({ topicDetail = {}, batchDetail = {}, fromStudentLevelReport, evaluationData, students, studentsFromDetailedReport, sessionStartDate, sessionEndDate, sessionStatus }) => {
  const [evaluationModalDetails, setEvaluationModalDetails] = useState({ isOpen: false, evaluationType: evaluationTypes.PRACTICE, currentPracticeQuestion: '' })

  let evaluationProgressDone = 0
  let doneEvaluation = 0
  let evaluationToBeDone = 0
  if (fromStudentLevelReport) {
    const { blockBasedPracitce, userAssignment } = evaluationData
    const classWorkPractices = get(blockBasedPracitce, 'classWorkPractices', []) || []
    const homeWorkPractices = get(blockBasedPracitce, 'homeWorkPractices', []) || []
    const classWorkQuestions = get(userAssignment, 'classWorkQuestions', []) || []
    const homeWorkQuestions = get(userAssignment, 'homeWorkQuestions', []) || []
    classWorkPractices.forEach(item => {
      if (get(item, 'evaluation')) {
        doneEvaluation += 1
      }
      evaluationToBeDone += 1
    })
    homeWorkPractices.forEach(item => {
      if (get(item, 'evaluation')) {
        doneEvaluation += 1
      }
      evaluationToBeDone += 1
    })
    classWorkQuestions.forEach(item => {
      const assignments = get(item, 'assignment', [])
      evaluationToBeDone += assignments.length
      assignments.forEach(assignment => {
        if (get(assignment, 'evaluation')) {
          doneEvaluation += 1
        }
      })
    })
    homeWorkQuestions.forEach(item => {
      const assignments = get(item, 'assignment', [])
      evaluationToBeDone += assignments.length
      assignments.forEach(assignment => {
        if (get(assignment, 'evaluation')) {
          doneEvaluation += 1
        }
      })
    })
    if (evaluationToBeDone) {
      evaluationProgressDone = (doneEvaluation / evaluationToBeDone) * 100
    }
  }

  const handleStartEvaluationButtonClicked = () => {
    const { blockBasedPracitce, userAssignment } = evaluationData
    let currentPracticeQuestion = ''
    let evaluationType = ''
    const classWorkPractices = get(blockBasedPracitce, 'classWorkPractices', [])
    const homeWorkPractices = get(blockBasedPracitce, 'homeWorkPractices', [])
    const classWorkQuestions = get(userAssignment, 'classWorkQuestions', [])
    const homeWorkQuestions = get(userAssignment, 'homeWorkQuestions', [])

    if (classWorkPractices && classWorkPractices.length) {
      classWorkPractices.forEach(item => {
        if (get(item, 'evaluation')) {
          currentPracticeQuestion = get(item, 'blockBasedPractice.id')
          evaluationType = evaluationTypes.PRACTICE
        }
      })
    }
    if (!currentPracticeQuestion && homeWorkPractices && homeWorkPractices.length) {
      homeWorkPractices.forEach(item => {
        if (get(item, 'evaluation')) {
          currentPracticeQuestion = get(item, 'blockBasedPractice.id')
          evaluationType = evaluationTypes.HW_PRACTICE
        }
      })
    }
    if (classWorkQuestions && classWorkQuestions.length) {
      classWorkQuestions.forEach(item => {
        if (get(item, 'assignment[0].evaluation')) {
          evaluationType = evaluationTypes.CODING_ASSIGNMENT
        }
      })
    }
    if (homeWorkQuestions && homeWorkQuestions.length) {
      homeWorkQuestions.forEach(item => {
        if (get(item, 'assignment[0].evaluation')) {
          evaluationType = evaluationTypes.HW_ASSIGNMENT
        }
      })
    }
    if (!currentPracticeQuestion && classWorkPractices && classWorkPractices.length) {
      currentPracticeQuestion = get(classWorkPractices[0], 'blockBasedPractice.id')
      evaluationType = evaluationTypes.PRACTICE
    }
    if (!currentPracticeQuestion && homeWorkPractices && homeWorkPractices.length) {
      currentPracticeQuestion = get(homeWorkPractices[0], 'blockBasedPractice.id')
      evaluationType = evaluationTypes.HW_PRACTICE
    }
    if (classWorkQuestions && classWorkQuestions.length) {
      currentPracticeQuestion = get(classWorkQuestions[0], 'assignment[0].evaluation')
      evaluationType = evaluationTypes.CODING_ASSIGNMENT
    }
    if (homeWorkQuestions && homeWorkQuestions.length) {
      currentPracticeQuestion = get(homeWorkQuestions[0], 'assignment[0].evaluation')
      evaluationType = evaluationTypes.HW_ASSIGNMENT
    }
    if (currentPracticeQuestion) {
      setEvaluationModalDetails({ ...evaluationModalDetails, isOpen: true, evaluationType, currentPracticeQuestion })
    } else {
        setEvaluationModalDetails({ ...evaluationModalDetails, isOpen: true, evaluationType })
    }
  }

  const handleStartEvaluationButtonDisabled = () => {
    const { blockBasedPracitce, userAssignment } = evaluationData
    const classWorkPractices = get(blockBasedPracitce, 'classWorkPractices', [])
    const homeWorkPractices = get(blockBasedPracitce, 'homeWorkPractices', [])
    const classWorkQuestions = get(userAssignment, 'classWorkQuestions', [])
    const homeWorkQuestions = get(userAssignment, 'homeWorkQuestions', [])
    return !classWorkPractices.length && !homeWorkPractices.length && !classWorkQuestions.length && !homeWorkQuestions.length
  }

  const presentStudent = () => students.filter(item => get(item, 'isPresent') === true)
  const absentStudent = () => students.filter(item => get(item, 'isPresent') === false)

  const attendanceTooltip = () => {
    const studentList = absentStudent()
    const updatedStudentList = []
    studentList.forEach(item => {
      const obj = {
        student: {
          rollNo: get(item, 'student.rollNo'),
          user: {
            name: studentsFromDetailedReport ? get(item, 'student.studentData.name') : get(item, 'student.user.name'),
          }
        }
      }
      updatedStudentList.push(obj)
    })
    return (
      <StudentListTooltip
        heading='Absent Students'
        list={updatedStudentList}
      />
    )
  }

  const getTime = (dateObj) => {
    return moment(dateObj).format('LT')
  }

  const getDate = (dateObj) => {
    return moment(dateObj).format('llll').split(',').slice(0, 2).join(',')
  }

  const getSessionDate = (dateObj) => {
    const dateObjArr = moment(dateObj).format('llll').split(',')
    return dateObjArr && dateObjArr.length > 1 ? dateObjArr[1] : null
  }

  const getTimeAtHeading = () => {
    const sessionStartDay = getDate(sessionStartDate)
    const sessionEndDay = getDate(sessionEndDate)
    const sessionStartTime= getTime(sessionStartDate, '', '')
    const sessionEndTime = getTime(sessionEndDate, '', '')
    const sessionStartDayDate = getSessionDate(sessionStartDate)
    const sessionEndDayDate = getSessionDate(sessionEndDate)
    if (sessionStatus === 'started') {
      return <span>{sessionStartDay}<span className={styles.timeDaySeparator}></span>{sessionStartTime}</span>
    }
    return sessionStartDay === sessionEndDay ? <span>{sessionStartDay}<span className={styles.timeDaySeparator}></span>{sessionStartTime} - {sessionEndTime}</span> : <span>{sessionStartDayDate} - {sessionEndDayDate}</span>
  }
  return (
    <div className={styles.detailed__report__topic__details__container}>
      <div className={styles.detailed__report__topic__details__container__contain}>
        <div className={styles.detailed__report__topic__details__container__left}>
          <div>
            <div
              className={styles.detailed__report__topic__details__thumbnailWrapper}
              style={{
                display: "flex",
                backgroundImage: `url(${get(topicDetail, "thumbnailSmall.uri") ? getPath(get(topicDetail, "thumbnailSmall.uri")) : ""})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                backgroundPosition: "center",
              }}
            >
              {!get(topicDetail, "thumbnailSmall.uri") && <DummySessionDetailsThumbnail />}
            </div>
          </div>
          <div className={styles.detailed__report__topic__details__description__container}>
            <div className={styles.detailed__report__topic__details__head}>
              <p>{get(topicDetail, 'classType')} {get(topicDetail, 'order')}.</p>
              <h2>{get(topicDetail, "title")}</h2>
              {sessionStatus === 'started' ? (
                <StatusTag
                  type={sessionStatus}
                />
              ) : null}
            </div>
            <div className={styles.detailed__report__topic__details__description__contain}>
              <div className={styles.detailed__report__topic__details__description__completed}>
                <span className={styles.attendenceText}>{sessionStatus === 'started' ? 'STARTED ' : 'COMPLETED '}ON</span>
                {(sessionStartDate) ? <p>{getTimeAtHeading()}</p> : null}
              </div>
              {students && students.length && (
                <div className={styles.detailed__report__topic__details__description__completed} style={{ margin: "0" }}>
                  <span className={styles.attendenceText}>attendance</span>
                  <div className={styles.detailed__report__topic__details__description__attendence}>
                    <p className={styles.absentStudentCount}><p style={{ color: '#282828'}}>{presentStudent().length}</p>/{students.length}</p>
                    <div>
                      {absentStudent().length ? (
                        <UpdatedToolTip
                            tipColor={"#4A336C"}
                            delay={'200'}
                            hideDelay={'800'}
                            direction="bottomLeft"
                            content={attendanceTooltip()}
                        >
                          <InformationCircle />
                        </UpdatedToolTip>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {(fromStudentLevelReport && doneEvaluation) ? (
          <div className={styles.detailed__report__evaluation__container}>
            <div className={styles.detailed__report__evaluation__container__progress__container}>
              <p>{doneEvaluation}/{evaluationToBeDone} Questions Evaluated</p>
              <ProgressBar customStyle={{ width: '100%' }} done={evaluationProgressDone} />
            </div>
            <div className={styles.detailed__report__evaluation__button}>
              <Button
                text="Start Evaluation"
                onBtnClick={handleStartEvaluationButtonClicked}
                isDisabled={handleStartEvaluationButtonDisabled()}
              />
            </div>
          </div>
        ) : null}
      </div>
      {get(evaluationModalDetails, 'isOpen') && <EvaluationContextProvider>
        <EvaluationModal evaluationModalDetails={evaluationModalDetails} setEvaluationModalDetails={setEvaluationModalDetails} topicDetails={{ title: get(topicDetail, 'title'), topicId: get(topicDetail, 'id') }} students={students} courseId={get(topicDetail, 'courses[0].id')} assignmentData={evaluationData} />
      </EvaluationContextProvider>}
    </div>
  );
};

export default ReportGradeCourseHeader;
