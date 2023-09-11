import React, { useEffect,useState} from 'react'
import ModalBody from './ModalBody';
import ModalHeader from './ModalHeader';
import { get } from 'lodash';
import { actionTypes } from './reducers/evaluationReducer';
import { useEvaluationContext } from './contexts/EvaluationContext';
import LoadingSpinner from '../../../../components/Loader/LoadingSpinner';
import styles from './EvaluationModal.module.scss'
import fetchEvaluationTags from '../../../../../../queries/teacherApp/fetchEvaluationTags';
import OutputModal from './OutputModal';
import { CloseCircle } from '../../../../../../constants/icons';
import { motion } from "framer-motion";
import getPath from '../../../../../../utils/getFullPath';
import { getFirstNonEvaluatedPractice, getFirstNonEvaluatedQuestion } from './EvaluationModal.helpers';
import cx from 'classnames'
import { getQuestionIndexFromId } from './EvaluationModal.helpers';
import { studentMapNonEvaluatedQuestion } from './EvaluationModal.helpers';
import { getSortedStudents } from './EvaluationModal.helpers';
import { evaluationTypes } from '../../../../utils';

const EvaluationModal = ({ setEvaluationModalDetails = () => {}, topicDetails, evaluationModalDetails, students = [], courseId, openedFromStudentPerformance, closeEvaluationModal, assignmentData, ...props}) => {
  const [isOutputModalOpen,setIsOutputModalOpen]=useState(false)
  const [openedFromRun, setOpenedFromRun]=useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFilePreview, setIsFilePreview] = useState(false)
  const [blocklyPythonCorrectCode, setBlocklyPythonCorrectCode] = useState(null)
  const [blocklyPythonStudentCode, setBlocklyPythonStudentCode] = useState(null)

  const { state: { fromRight, isFetching, practices, currentPracticeNos, selectedStudent, presentStudents, currentQuesNos, currentStudentNos }, dispatch } = useEvaluationContext()

  const isCodingAssignment = get(evaluationModalDetails, 'evaluationType') === evaluationTypes.CODING_ASSIGNMENT ? true : false

  const isHwAssignment = get(evaluationModalDetails, 'evaluationType') === evaluationTypes.HW_ASSIGNMENT ? true : false

  const evaluationType = get(evaluationModalDetails, 'evaluationType')

  const isPracticeAssignment = get(evaluationModalDetails, 'evaluationType') === evaluationTypes.PRACTICE ? true : false

  const topicType = (isCodingAssignment || isPracticeAssignment) ? 'Classwork' : 'Homework'

  const type = (isCodingAssignment || isHwAssignment) ? 'question' : 'practice'

  const withHttps = (url) => url ? url.replace(/^(?:(.*:)?\/\/)?(.*)/i, (match, schemma, nonSchemmaUrl) => schemma ? match : `https://${nonSchemmaUrl}`) : '';

  let currentPracticeObj = null
  if (openedFromStudentPerformance) {
    currentPracticeObj = practices[currentPracticeNos]
  } else {
    currentPracticeObj = presentStudents[currentStudentNos]
  }
  const fileType = get(currentPracticeObj, 'attachments[0].type')
  const fileLink = getPath(get(currentPracticeObj, 'attachments[0].uri'))

  //get evaluation tags
  useEffect(()=>{
    dispatch({ type: actionTypes.SET_FROM_RIGHT, payload: { value: '0%' } });
    dispatch({ type: actionTypes.SET_EVALUATION_TYPE, payload: { value: evaluationType } });
    if (evaluationType === evaluationTypes.CODING_ASSIGNMENT || evaluationType === evaluationTypes.HW_ASSIGNMENT) {
      (async function(){
        try{
          setIsLoading(true)
          const res = await fetchEvaluationTags()
          setIsLoading(false)
          dispatch({type:actionTypes.SET_EVALUATION_TAGS,payload:{value:get(res,'data.evaluationTags')}})
        }catch(err){
          console.log(err)
        }
      })()
    }
  },[])

  const getEvaluationModalData = () => {
    const evaluationType = get(evaluationModalDetails, 'evaluationType')
    if (evaluationType === evaluationTypes.CODING_ASSIGNMENT) {
      return get(assignmentData, 'userAssignment.classWorkQuestions')
    } else if (evaluationType === evaluationTypes.HW_ASSIGNMENT) {
      return get(assignmentData, 'userAssignment.homeWorkQuestions')
    } else if (evaluationType === evaluationTypes.PRACTICE) {
      return get(assignmentData, 'blockBasedPracitce.classWorkPractices')
    } else if (evaluationType === evaluationTypes.HW_PRACTICE) {
      return get(assignmentData, 'blockBasedPracitce.homeWorkPractices')
    }   
  }

  const setEvaluationDataOnOpen = () => {
    (async function () {
      try {
        const evaluationModalData = getEvaluationModalData()
        const getSortedEvaluationData = getSortedStudents(evaluationModalData)
        if (type === 'question') {
          let questionsObj = {}
          getSortedEvaluationData && getSortedEvaluationData.forEach(question => {
            if (openedFromStudentPerformance) {
              const idToMatch = get(props, 'currentStudent.student.studentData.id')
              if (get(question, 'user.id') === idToMatch)
              questionsObj[idToMatch] = question
            } else {
              const assignments = get(question, 'assignment', [])
              assignments.forEach(assignment => {
                const obj = {
                  id: get(question, 'id'),
                  user: get(question, 'user'),
                  question: assignment
                }
                if (questionsObj[get(assignment, 'assignmentQuestion.id')]) {
                  questionsObj[get(assignment, 'assignmentQuestion.id')] = [...questionsObj[get(assignment, 'assignmentQuestion.id')], obj]
                } else {
                  questionsObj[get(assignment, 'assignmentQuestion.id')] = [obj]
                }
              })
            }
          })
          dispatch({ type: actionTypes.SET_USER_ASSIGNMENTS, payload: { value: questionsObj } })
          if (openedFromStudentPerformance) {
            const questionObjKey = Object.keys(questionsObj)[0]
            const selectedObj = questionsObj[questionObjKey]
            const assignmentQuestion = get(selectedObj, 'assignment', [])
            const nonEvaluationIndex = studentMapNonEvaluatedQuestion(assignmentQuestion)
            dispatch({ type:actionTypes.SET_SELECTED_STUDENT, payload:{ value: { value: get(selectedObj, 'user.id'), name: get(selectedObj, 'user.name') } } })
            dispatch({ type:actionTypes.SET_QUESTIONS, payload:{ value: assignmentQuestion } })
            dispatch({ type:actionTypes.SET_CURRENT_QUES_NOS, payload:{ value: nonEvaluationIndex } })
          } else {
            const obj = getFirstNonEvaluatedQuestion(questionsObj)
            const questionKey = get(obj, 'id')
            const currentStudentIndex = get(obj, 'idx')
            const getQuestionIndex = getQuestionIndexFromId(questionKey, questionsObj)
            dispatch({ type:actionTypes.SET_CURRENT_QUES_NOS, payload:{ value: getQuestionIndex } })
            dispatch({ type: actionTypes.SET_STUDENTS, payload: { value: questionsObj[questionKey] } })
            dispatch({ type: actionTypes.SET_CURRENT_STUDENT_NOS, payload: { value: currentStudentIndex } })
          }
        } else {
          let practicesObj = {}
          getSortedEvaluationData && getSortedEvaluationData.forEach(practice => {
            if (openedFromStudentPerformance) {
              const idToMatch = get(props, 'currentStudent.student.studentData.id')
              if (get(practice, 'user.id') === idToMatch) {
                if (practicesObj[get(practice, 'user.id')]) {
                  practicesObj[get(practice, 'user.id')] = [...practicesObj[get(practice, 'user.id')], practice]
                } else {
                  practicesObj[get(practice, 'user.id')] = [practice]
                }
              }
            } else {
              if (practicesObj[get(practice, 'blockBasedPractice.id')]) {
                practicesObj[get(practice, 'blockBasedPractice.id')] = [...practicesObj[get(practice, 'blockBasedPractice.id')], practice]
              } else {
                practicesObj[get(practice, 'blockBasedPractice.id')] = [practice]
              }
            }
          })
          dispatch({ type: actionTypes.SET_BLOCK_BASED_PRACTICE, payload: { value: practicesObj } })
          if (openedFromStudentPerformance) {
            const questionObjKey = Object.keys(practicesObj)[0]
            const selectedObj = practicesObj[questionObjKey]
            let nonEvaluationIndex = -1
            for (let idx=0; idx<selectedObj.length; idx++) {
              if (get(selectedObj[idx], 'blockBasedPractice.id') === get(evaluationModalDetails, 'currentPracticeQuestion') && get(selectedObj[idx], 'evaluation') === null) {
                nonEvaluationIndex = idx
                break
              }
            }
            if (nonEvaluationIndex === -1) {
              for (let idx=0; idx<selectedObj.length; idx++) {
                if (get(selectedObj[idx], 'blockBasedPractice.id') === get(evaluationModalDetails, 'currentPracticeQuestion')) {
                  nonEvaluationIndex = idx
                  break
                }
              }
            }
            dispatch({ type:actionTypes.SET_SELECTED_STUDENT, payload:{ value: { value: get(selectedObj[0], 'user.id'), name: get(selectedObj[0], 'user.name') } } })
            dispatch({ type:actionTypes.SET_PRACTICES, payload:{ value: selectedObj } })
            dispatch({ type:actionTypes.SET_CURRENT_PRAC_NOS, payload:{ value: nonEvaluationIndex } })
          } else {
            const obj = getFirstNonEvaluatedPractice(practicesObj, get(evaluationModalDetails, 'currentPracticeQuestion'))
            const idx = get(obj, 'idx')
            const selectedPracticeId = get(obj, 'practice.blockBasedPractice.id')
            const getQuestionIndex = getQuestionIndexFromId(selectedPracticeId, practicesObj)
            dispatch({ type: actionTypes.SET_CURRENT_PRAC_NOS, payload: { value: getQuestionIndex } });
            dispatch({ type: actionTypes.SET_STUDENTS, payload: { value: practicesObj[selectedPracticeId] } })
            dispatch({ type: actionTypes.SET_CURRENT_STUDENT_NOS, payload: { value: idx } })
          }
        }
      } catch(e) {
        console.log('e ', e)
      }
    })()
  }

  const checkIfAssignmentUpdate = () => {
    if (openedFromStudentPerformance) {
      return get(selectedStudent, 'value') === '1'
    } else {
      return presentStudents.length === 0
    }
  }

  useEffect(() => {
    if (checkIfAssignmentUpdate()) {
      setEvaluationDataOnOpen()
    } else {
      const evaluationModalData = getEvaluationModalData()
      const getSortedEvaluationData = getSortedStudents(evaluationModalData)
      if (type === 'question') {
        let questionsObj = {}
        getSortedEvaluationData && getSortedEvaluationData.forEach(question => {
          if (openedFromStudentPerformance) {
            const idToMatch = get(props, 'currentStudent.student.studentData.id')
            if (get(question, 'user.id') === idToMatch)
            questionsObj[idToMatch] = question
          } else {
            const assignments = get(question, 'assignment', [])
            assignments.forEach(assignment => {
              const obj = {
                id: get(question, 'id'),
                user: get(question, 'user'),
                question: assignment
              }
              if (questionsObj[get(assignment, 'assignmentQuestion.id')]) {
                questionsObj[get(assignment, 'assignmentQuestion.id')] = [...questionsObj[get(assignment, 'assignmentQuestion.id')], obj]
              } else {
                questionsObj[get(assignment, 'assignmentQuestion.id')] = [obj]
              }
            })
          }
        })
        dispatch({ type: actionTypes.SET_USER_ASSIGNMENTS, payload: { value: questionsObj } })
        if (openedFromStudentPerformance) {
          const questionObjKey = Object.keys(questionsObj)[0]
          const selectedObj = questionsObj[questionObjKey]
          const assignmentQuestion = get(selectedObj, 'assignment', [])
          dispatch({ type:actionTypes.SET_QUESTIONS, payload:{ value: assignmentQuestion } })
        } else {
          const currentQuestionKey = Object.keys(questionsObj)[currentQuesNos]
          dispatch({ type: actionTypes.SET_STUDENTS, payload: { value: questionsObj[currentQuestionKey] } })
        }
      } else {
        let practicesObj = {}
        getSortedEvaluationData && getSortedEvaluationData.forEach(practice => {
          if (openedFromStudentPerformance) {
            const idToMatch = get(props, 'currentStudent.student.studentData.id')
            if (get(practice, 'user.id') === idToMatch) {
              if (practicesObj[get(practice, 'user.id')]) {
                practicesObj[get(practice, 'user.id')] = [...practicesObj[get(practice, 'user.id')], practice]
              } else {
                practicesObj[get(practice, 'user.id')] = [practice]
              }
            }
          } else {
            if (practicesObj[get(practice, 'blockBasedPractice.id')]) {
              practicesObj[get(practice, 'blockBasedPractice.id')] = [...practicesObj[get(practice, 'blockBasedPractice.id')], practice]
            } else {
              practicesObj[get(practice, 'blockBasedPractice.id')] = [practice]
            }
          }
        })
        dispatch({ type: actionTypes.SET_BLOCK_BASED_PRACTICE, payload: { value: practicesObj } })
        if (openedFromStudentPerformance) {
          const questionObjKey = Object.keys(practicesObj)[0]
          const selectedObj = practicesObj[questionObjKey]
          dispatch({ type:actionTypes.SET_PRACTICES, payload:{ value: selectedObj } })
        } else {
          const currentQuestionKey = Object.keys(practicesObj)[currentPracticeNos]
          dispatch({ type: actionTypes.SET_STUDENTS, payload: { value: practicesObj[currentQuestionKey] } })
        }
      }
    }
  }, [assignmentData])

  const handleCloseEvaluationModal = () => {
    if (openedFromStudentPerformance) {
      closeEvaluationModal()
    } else {
      setEvaluationModalDetails(prev=>({...prev,isOpen:false}))
    }
    if (props.fromSessionModal) {
      props.setIsStartEvaluationButtonClicked(false)
    }
  }

  const viewFile = () => {
    if (get(currentPracticeObj, 'answerLink')) {
      window.open(withHttps(get(currentPracticeObj, 'answerLink')), "_blank");
    } else if (get(currentPracticeObj, 'attachments[0].id')) {
      if(fileType !== "image" && fileType !== "video"){
        window.open(withHttps(fileLink), "_blank");
      }
      else{
        setIsFilePreview(true);
      }
    }
  }

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalWrapper}>
        <div className={cx(styles.closeModalIcon, styles.closeModalIconMarginMain)} onClick={() => handleCloseEvaluationModal()}>
          <CloseCircle height='24' width='24' color='#a27fd5' />
        </div>
        {(isFetching || isLoading) ?
          <div style={{ position: 'relative', height: '100%' }}>
            <LoadingSpinner
              height='40vh'
              position='absolute'
              left='50%'
              top='50%'
              transform='translate(-50%,-77%)'
              borderWidth='6px'
              showLottie
              flexDirection={'column'}
            >
              <span className={styles.loadingText}>Loading Answers</span>
            </LoadingSpinner>
          </div> :
          <>
            <ModalHeader topicDetails={topicDetails} topicType={topicType} setEvaluationModalDetails={setEvaluationModalDetails} fromRight={fromRight} closeEvaluationModal={closeEvaluationModal} openedFromStudentPerformance={openedFromStudentPerformance} />
            <ModalBody fromRight={fromRight} students={students} setEvaluationModalDetails={setEvaluationModalDetails} setIsOutputModalOpen={setIsOutputModalOpen} setOpenedFromRun={setOpenedFromRun} viewFile={viewFile} assignmentData={assignmentData} openedFromStudentPerformance={openedFromStudentPerformance} closeEvaluationModal={closeEvaluationModal} setBlocklyPythonCorrectCode={setBlocklyPythonCorrectCode} setBlocklyPythonStudentCode={setBlocklyPythonStudentCode} />
          </>
        }
      </div>
      {isFilePreview && fileType === "image" && fileLink && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} 
          className={styles.filePreviewContainer}
          onClick={() => setIsFilePreview(false)}
        >
          <img onClick={(e) => e.stopPropagation()} src={fileLink} alt=""/>
        </motion.div>
      )}
      {isFilePreview && fileType === "video" && fileLink && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={styles.filePreviewContainer}
          onClick={() => setIsFilePreview(false)}
        >
          <video src={fileLink} controls></video>
        </motion.div>
      )}
      {isOutputModalOpen && <OutputModal setIsOutputModalOpen={setIsOutputModalOpen} openedFromRun={openedFromRun} openedFromStudentPerformance={openedFromStudentPerformance} blocklyPythonCorrectCode={blocklyPythonCorrectCode} blocklyPythonStudentCode={blocklyPythonStudentCode} />}
    </div>
  );
}

export default EvaluationModal