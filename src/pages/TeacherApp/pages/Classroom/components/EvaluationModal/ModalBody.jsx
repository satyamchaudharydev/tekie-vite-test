import { get } from 'lodash';
import React from 'react'
import { evaluationTypes } from '../../../../utils';
import { useEvaluationContext } from './contexts/EvaluationContext';
import CorrectAnswer from './CorrectAnswer';
import Evaluation from './Evaluation';
import styles from './EvaluationModal.module.scss'
import Question from './Question';
import StudentAnswer from './StudentAnswer';

const ModalBody = ({ fromRight,setEvaluationModalDetails,setIsOutputModalOpen, setOpenedFromRun, viewFile, assignmentData, openedFromStudentPerformance, closeEvaluationModal, setBlocklyPythonCorrectCode, setBlocklyPythonStudentCode }) => {
  const { state: { practices, currentPracticeNos, presentStudents, currentStudentNos, evaluationType } } = useEvaluationContext()

  const renderCorrectAnswerBox = () => {
    let currentPractice = null
    if (openedFromStudentPerformance) {
      currentPractice = practices[currentPracticeNos]
    } else {
      currentPractice = presentStudents[currentStudentNos]
    }
    if ((evaluationType === evaluationTypes.PRACTICE || evaluationType === evaluationTypes.HW_PRACTICE) && get(currentPractice,'blockBasedPractice.answerFormatDescription','')) {
      return (
        <CorrectAnswer setIsOutputModalOpen={setIsOutputModalOpen} setOpenedFromRun={setOpenedFromRun} openedFromStudentPerformance={openedFromStudentPerformance} setBlocklyPythonCorrectCode={setBlocklyPythonCorrectCode} />
      )
    } else {
      if (evaluationType === evaluationTypes.CODING_ASSIGNMENT || evaluationType === evaluationTypes.HW_ASSIGNMENT) {
        return (
          <CorrectAnswer setIsOutputModalOpen={setIsOutputModalOpen} setOpenedFromRun={setOpenedFromRun} openedFromStudentPerformance={openedFromStudentPerformance} setBlocklyPythonCorrectCode={setBlocklyPythonCorrectCode} />
        )
      }
      return null
    }
  }

  return (
    <div className={styles.bodyWrapper}>
      <div style={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
        <Question openedFromStudentPerformance={openedFromStudentPerformance} />
        {renderCorrectAnswerBox()}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', width: '50%', marginLeft: '20px', height: '100%' }}>
        <StudentAnswer setIsOutputModalOpen={setIsOutputModalOpen} setOpenedFromRun={setOpenedFromRun} fromRight={fromRight} viewFile={viewFile} openedFromStudentPerformance={openedFromStudentPerformance} setBlocklyPythonStudentCode={setBlocklyPythonStudentCode} />
        <Evaluation setEvaluationModalDetails={setEvaluationModalDetails} fromRight={fromRight} assignmentData={assignmentData} openedFromStudentPerformance={openedFromStudentPerformance} closeEvaluationModal={closeEvaluationModal} />
      </div>
    </div>
  );
};

export default ModalBody
