/* eslint-disable no-loop-func */

import { get } from 'lodash';
import React from 'react'
import { ChevronLeft, ChevronRight } from '../../../../../../constants/icons';
import { hsFor1280 } from '../../../../../../utils/scale';
import Button from '../../../../components/Button/Button';
import Dropdown, { customStyles } from '../../../../components/Dropdowns/Dropdown';
import { evaluationTypes, padWithZero } from '../../../../utils';
import { useEvaluationContext } from './contexts/EvaluationContext';
import styles from './EvaluationModal.module.scss'
import { actionTypes } from './reducers/evaluationReducer';

export const studentDropdownStyles = {
    ...customStyles,
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      cursor: 'pointer',
      fontFamily: 'Inter',
      fontSize: hsFor1280(14),
      backgroundColor: isSelected ? '#F4F0FA' : '#fff',
      color: '#504F4F',
      '&:hover': {
        backgroundColor: '#F4F0FA',
        color: '#504F4F',
      }
    }),
    control: (styles) => ({
      ...styles,
      backgroundColor:'transparent',
      cursor: 'pointer',
      fontFamily: 'Inter',
      minHeight: hsFor1280(30),
      maxHeight: hsFor1280(30),
      border: '1px solid #F4F0FA',
      boxShadow: '0 0 0 0px black',
      borderRadius: hsFor1280(10),
      '&:hover': {
        boxShadow: '0 0 0 0px black',
      }
    }),
    placeholder: (styles) => ({
      ...styles,
      fontSize: hsFor1280(14),
      top: '50%',
      color: '#282828',
      fontWeight: '500'
    }),
    singleValue: (styles) => ({
      ...styles,
      fontSize: hsFor1280(14),
      fontWeight: '700',
      top: '50%',
      color: '#8C61CB'
    }),
    valueContainer: (styles) => ({
      ...styles,
      padding: `0 0 0 ${hsFor1280(10)}`
    }),
    input: (styles) => ({
      ...styles,
      color: 'transparent'
    }),
    // menu: (base) => ({
    //   ...base,
    //   zIndex: '100',
    // }),
    menuList: (base) => ({
      ...base,
      maxHeight: hsFor1280(140),
      "::-webkit-scrollbar": {
        width: "4px"
      },
      "::-webkit-scrollbar-thumb": {
        background: "#8C61CB"
      },
      "::-webkit-scrollbar-thumb:hover": {
        background: "#8C61CB"
      },
    }),
    container: (style) => ({
      ...style,
      right: '35px',
      width: hsFor1280(200)
    }),
    dropdownIndicator: (style) => ({
      ...style,
      padding: hsFor1280(4),
      color: '#8C61CB',
      paddingRight: hsFor1280(12)
    })
  }


const Left = ({topicDetails,topicType,openedFromStudentPerformance}) => {
  const {state:{currentQuesNos,practices,currentPracticeNos,evaluationType,userAssignmentsInContext,blockBasedPracticeInContext,questions},dispatch}=useEvaluationContext()
  let currentAssignment = null
  if (evaluationType === evaluationTypes.PRACTICE || evaluationType === evaluationTypes.HW_PRACTICE) {
    if (openedFromStudentPerformance) {
      currentAssignment = practices
    } else {
      currentAssignment = Object.keys(blockBasedPracticeInContext)
    }
  } else {
    if (openedFromStudentPerformance) {
      currentAssignment = questions
    } else {
      currentAssignment = Object.keys(userAssignmentsInContext)
    }
  }

  const incrementCurrentQuestion = () => {
    let questionId = null
    if (evaluationType === evaluationTypes.PRACTICE || evaluationType === evaluationTypes.HW_PRACTICE) {
      if (openedFromStudentPerformance) {
        dispatch({type:actionTypes.INC_CURRENT_PRAC_NOS_STUDENT_LEVEL,payload:{}})
      } else {
        dispatch({type:actionTypes.INC_CURRENT_PRAC_NOS,payload:{}})
        questionId = currentAssignment[currentPracticeNos+1]
        dispatch({ type: actionTypes.SET_STUDENTS, payload: { value: blockBasedPracticeInContext[questionId] } })
      }
    } else {
      if (openedFromStudentPerformance) {
        dispatch({type:actionTypes.INC_CURRENT_QUES_NOS_STUDENT_LEVEL,payload:{}})
      } else {
        dispatch({type:actionTypes.INC_CURRENT_QUES_NOS,payload:{}})
        questionId = currentAssignment[currentQuesNos+1]
        dispatch({ type: actionTypes.SET_STUDENTS, payload: { value: userAssignmentsInContext[questionId] } })
      }
    }
    dispatch({type:actionTypes.SET_CURRENT_STUDENT_NOS_TO_0,payload:{}})
  }

  const decrementCurrentQuestion = () => {
    let questionId = null
    if (evaluationType === evaluationTypes.PRACTICE || evaluationType === evaluationTypes.HW_PRACTICE) {
      dispatch({type:actionTypes.DEC_CURRENT_PRAC_NOS,payload:{}})
      if (!openedFromStudentPerformance) {
        questionId = currentAssignment[currentPracticeNos-1]
        dispatch({ type: actionTypes.SET_STUDENTS, payload: { value: blockBasedPracticeInContext[questionId] } })
      }
    } else {
      dispatch({type:actionTypes.DEC_CURRENT_QUES_NOS,payload:{}})
      if (!openedFromStudentPerformance) {
        questionId = currentAssignment[currentQuesNos-1]
        dispatch({ type: actionTypes.SET_STUDENTS, payload: { value: userAssignmentsInContext[questionId] } })
      }
    }
    dispatch({type:actionTypes.SET_CURRENT_STUDENT_NOS_TO_0,payload:{}})
  }

    return (
      <div className={styles.leftWrapper}>
        <h4 className={styles.topicTitle}>{get(topicDetails,'title')} / {topicType}</h4>
        <div className={styles.quesAndBtnContainer}>
          {(currentAssignment) && (
            (evaluationType === evaluationTypes.PRACTICE || evaluationType === evaluationTypes.HW_PRACTICE) ? (
              <>
                {currentAssignment.length !== 1 ? (
                  <Button isDisabled={currentPracticeNos===0} onBtnClick={()=>decrementCurrentQuestion()} type='ghost' leftIcon>
                      <ChevronLeft height={hsFor1280(16)} width={hsFor1280(16)} color={currentPracticeNos===0?'#E1D6F0':'#8C61CB'} className={currentPracticeNos ? styles.questionArrows : null} />
                  </Button>
                ) : null}
                <span className={styles.quesNos} style={{ marginRight: currentAssignment.length===1 ? '12px' : null }} >Practice {padWithZero(currentPracticeNos+1)}</span>
                {currentAssignment.length !== 1 ? (
                  <Button isDisabled={currentPracticeNos===currentAssignment.length-1} onBtnClick={()=>incrementCurrentQuestion()} type='ghost' leftIcon>
                      <ChevronRight height={hsFor1280(16)} width={hsFor1280(16)} color={currentPracticeNos===currentAssignment.length-1?'#E1D6F0':'#8C61CB'} />
                  </Button>
                ) : null}
              </>
            ) : (
              <>
                {currentAssignment.length !== 1 ? (
                  <Button isDisabled={currentQuesNos===0} onBtnClick={()=>decrementCurrentQuestion()} type='ghost' leftIcon>
                      <ChevronLeft height={hsFor1280(16)} width={hsFor1280(16)} color={currentQuesNos===0?'#E1D6F0':'#8C61CB'} className={currentQuesNos ? styles.questionArrows : null} />
                  </Button>
                ) : null} 
                <span className={styles.quesNos} style={{ marginRight: currentAssignment.length===1 ? '12px' : null }} >Coding / Question {padWithZero(currentQuesNos+1)}</span>
                {currentAssignment.length !== 1 ? (
                  <Button isDisabled={currentQuesNos===currentAssignment.length-1} onBtnClick={()=>incrementCurrentQuestion()} type='ghost' leftIcon>
                      <ChevronRight height={hsFor1280(16)} width={hsFor1280(16)} color={currentQuesNos===currentAssignment.length-1?'#E1D6F0':'#8C61CB'} />
                  </Button>
                ) : null}
              </>
            )
          )}
        </div>
      </div>
    )
};


const Right = ({ fromRight, openedFromStudentPerformance}) => {

  const { state: { selectedStudent, userAssignmentsInContext, blockBasedPracticeInContext, evaluationType, questions, practices, presentStudents, currentStudentNos }, dispatch } = useEvaluationContext()

    const currentStudent = get(presentStudents[currentStudentNos], 'user')
    const styleObj = {
        transform: `translateX(${fromRight})`
    };

    const dropDownLableName = (student) => <span style={{ fontWeight: '400', opacity: '0.8', fontSize: '14px' }}>{get(student, 'user.studentProfile.rollNo')} <span style={{ fontWeight: '500', opacity: '1', fontSize: '16px' }}>{get(student, 'user.name')}</span></span>

    const getStudentsForDropDown = () =>{
      let students = []
      presentStudents.forEach(student => {
        const obj = {
          value: get(student, 'user.id'),
          label: dropDownLableName(student)
        }
        students.push(obj)
      })
      return students
    }

    const countEvaluation = () => {
      let evaluated = 0
      let numberOfAssignments = 0
      if (openedFromStudentPerformance) {
        if (evaluationType === evaluationTypes.PRACTICE || evaluationType === evaluationTypes.HW_PRACTICE) {
          numberOfAssignments += practices && practices.length
          // eslint-disable-next-line no-loop-func
          practices.forEach(item => {
            if (get(item, 'evaluation', null)) {
              evaluated += 1
            }
          })
        } else {
          numberOfAssignments = questions && questions.length
          questions.forEach(question => {
            if (get(question, 'evaluation', null)) {
              evaluated += 1
            }
          })
        }
      } else {
        if (evaluationType === evaluationTypes.PRACTICE || evaluationType === evaluationTypes.HW_PRACTICE) {
          for (const practice in blockBasedPracticeInContext) {
            const practices = blockBasedPracticeInContext[practice]
            numberOfAssignments += practices.length
            // eslint-disable-next-line no-loop-func
            practices.forEach(item => {
              if (get(item, 'evaluation', null)) {
                evaluated += 1
              }
            })
          }
        } else {
          for (const id in userAssignmentsInContext) {
            const assignments = userAssignmentsInContext[id]
            // eslint-disable-next-line no-loop-func
            numberOfAssignments += assignments.length
            assignments.forEach(item => {
              if (get(item, 'question.evaluation', null)) {
                evaluated += 1
              }
            })
          }
        }
      }
      return `${evaluated}/${numberOfAssignments} evaluations complete`
    }
    
    const handleStudentChange = (student) => {
      const getQuestionIndex = presentStudents.findIndex(item=>get(item,'user.id')===get(student, 'value'))
      dispatch({ type: actionTypes.SET_CURRENT_STUDENT_NOS, payload: { value:getQuestionIndex } })
    }

    const labelName = () => <span style={{ fontWeight: '400', opacity: '0.8', fontSize: '14px' }}>{get(currentStudent, 'studentProfile.rollNo')} <span style={{ fontWeight: '500', opacity: '1', fontSize: '16px' }}>{get(currentStudent, 'name')}</span></span>
           
    return (
      <div style={styleObj} className={styles.rightWrapper}>
        <span className={styles.rightHeaderTitle}>Student Answer <span className={styles.evalCount}>({countEvaluation()})</span> </span>
        <div className={styles.studDropdownAndCloseIconContainer}>
          <div className={styles.studentSelector}>
            {openedFromStudentPerformance ? (
              <div className={styles.studentNameContainerHeader}>
                <p>{get(selectedStudent, 'name')}</p>
              </div>
            ) : (
              <Dropdown
              components={{ IndicatorSeparator: () => null }}
              placeholder='Select Student'
              isMulti={false}
              defaultMenuIsOpen={true}
              menuIsOpen={true}
              openMenuOnFocus={true}
              styles={studentDropdownStyles}
              value={{
                value: get(currentStudent, 'id'),
                // label: get(currentStudent, 'name')
                label: labelName()
                // label: `${get(currentStudent, 'studentProfile.rollNo')} ${get(currentStudent, 'name')}`
              }}
              className={styles.dropdownSelect}
              onChange={(student)=>handleStudentChange(student)}
              options={getStudentsForDropDown()}
              ></Dropdown>
            )}
          </div>
        </div>
      </div>
    );
};


const ModalHeader = ({topicDetails,topicType, fromRight, setEvaluationModalDetails, closeEvaluationModal, openedFromStudentPerformance}) => {
    return (
        <div className={styles.headerWrapper}>
            <Left topicDetails={topicDetails} topicType={topicType} openedFromStudentPerformance={openedFromStudentPerformance} />
            <Right setEvaluationModalDetails={setEvaluationModalDetails} fromRight={fromRight} closeEvaluationModal={closeEvaluationModal} openedFromStudentPerformance={openedFromStudentPerformance} />
        </div>
    );
};

export default ModalHeader