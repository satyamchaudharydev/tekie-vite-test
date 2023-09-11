import React, { useState,useEffect } from "react";
import { motion } from "framer-motion"
import get from "lodash/get";
import Badge from "../../../../../../components/Badges";
import StarRating from "../../../../../../components/StarRating";
import { InformationCircle, LeftArrow, RightArrow, WhiteInfoIcon } from "../../../../../../constants/icons";
import hs, { hsFor1280 } from "../../../../../../utils/scale";
import Button from "../../../../components/Button/Button";
import { useEvaluationContext } from "./contexts/EvaluationContext";
import { checkForFirstPractice, checkForFirstPracticeStudentLevel, checkForFirstQuestion, checkForFirstQuestionStudentLevel, checkForFirstStudent, checkForLastPractice, checkForLastPracticeStudentLevel, checkForLastQuestion, checkForLastQuestionStudentLevel, checkForLastStudent, getFirstNonEvaluatedPractice, getFirstNonEvaluatedQuestion, studentMapNonEvaluatedQuestion, submitEvaluationCoding, submitEvaluationPractice } from "./EvaluationModal.helpers";
import styles from './EvaluationModal.module.scss'
import { actionTypes } from "./reducers/evaluationReducer";
import AttendanceTooltip from "../../ClassroomDetails/AttendanceTooltip";
import { getQuestionIndexFromId } from "./EvaluationModal.helpers";
import { ToolTipStar } from "../../../../components/svg";
import { evaluationTypes } from "../../../../utils";

const percentMap={
    0:0,
    1:20,
    2:40,
    3:60,
    4:80,
    5:100
}

const ratingLabelMap={
    0:'Unevaluated',
    1:'Incorrect',
    2:'Partially Correct',
    3:'Partially Correct',
    4:'Correct',
    5:'Correct',
}

const ratingLabelColorMap={
    0:'red',
    1:'red',
    2:'yellow',
    3:'yellow',
    4:'greenSec',
    5:'greenSec',
}

const tooltipStyles = {
    backgroundColor: "#4A336C",
    minWidth: hs(125),
    maxWidth: hs(220),
    height: 'max-content',
    padding:'10px 13px',
    borderRadius:'8px',
    zIndex: '9999',
};

const Evaluation = ({ fromRight,setEvaluationModalDetails, assignmentData, openedFromStudentPerformance, closeEvaluationModal }) => {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [selectedTags, setSelectedTags] = useState([])
    const [isEvaluating,setIsEvaluating]=useState(false)

    const percentageRating = percentMap[rating]

    const { state: { selectedStudent, questions, currentQuesNos, evaluationTags,userAssignmentsInContext, practices, evaluationType, currentPracticeNos, blockBasedPracticeInContext, presentStudents, currentStudentNos } ,dispatch} = useEvaluationContext()
    let currentQuesId = get(presentStudents[currentStudentNos], 'question.assignmentQuestion.id')
    let currentPracId = get(presentStudents[currentStudentNos], 'blockBasedPractice.id')

    if (openedFromStudentPerformance) {
        currentQuesId = get(questions[currentQuesNos], 'assignmentQuestion.id')
        currentPracId = get(practices[currentPracticeNos], 'blockBasedPractice.id')
    }

    const styleObj = {
        transform: `translateX(${fromRight})`,
        marginTop: '16px'
    };

    const isSelected=(tag)=>selectedTags.find(tagObj => get(tagObj, 'id') === get(tag, 'id'))

    const onBadgeSelection = (tag) => {
        const isAlreadySelected = isSelected(tag)
        if (isAlreadySelected) {
            setSelectedTags(prev => prev.filter(tagObj => get(tagObj, 'id') !== get(tag, 'id')))
        } else {
            setSelectedTags(prev => prev.concat(tag))
        }
    }
    
    const getTextColor=(styles)=>{
        return `${styles[ratingLabelColorMap[rating]]}`
    }

    const handleSubmitEvaluationCoding=async()=>{
        try{
            setIsEvaluating(true)
            await submitEvaluationCoding({ questions,currentQuesNos,rating,tags:selectedTags,comment,userAssignmentsInContext,selectedStudent,assignmentData,evaluationType,evaluationTypes,presentStudents,currentStudentNos,openedFromStudentPerformance })
            setIsEvaluating(false)
            if (openedFromStudentPerformance) {
                if (checkForLastQuestionStudentLevel(currentQuesId, questions)) {
                    const selectedQuestionIndex = studentMapNonEvaluatedQuestion(questions)
                    if (get(questions[selectedQuestionIndex], 'evaluation') === null && (selectedQuestionIndex !== currentQuesNos)) {
                        dispatch({ type:actionTypes.SET_CURRENT_QUES_NOS, payload:{ value: selectedQuestionIndex } })
                    } else {
                        closeEvaluationModal()
                    }
                } else {
                    dispatch({type:actionTypes.INC_CURRENT_QUES_NOS_STUDENT_LEVEL,payload:{}})
                }
            } else {
                if (checkForLastStudent(currentStudentNos, presentStudents)) {
                    if (checkForLastQuestion(currentQuesId, userAssignmentsInContext)) {
                        const obj = getFirstNonEvaluatedQuestion(userAssignmentsInContext)
                        const questionKey = get(obj, 'id')
                        const questionIndex = get(obj, 'idx')
                        const getQuestionIndex = getQuestionIndexFromId(questionKey, userAssignmentsInContext)
                        const selectedQuestionObj = userAssignmentsInContext[questionKey]
                        const selectedQuestion = selectedQuestionObj[questionIndex]
                        const currentQuestion = get(presentStudents[currentStudentNos], 'question')
                        if (get(selectedQuestion, 'question.evaluation') === null && get(currentQuestion, 'assignmentQuestion.id') !== get(selectedQuestion, 'question.assignmentQuestion.id')) {
                            dispatch({ type:actionTypes.SET_CURRENT_QUES_NOS, payload:{ value: getQuestionIndex } })
                            dispatch({ type: actionTypes.SET_STUDENTS, payload: { value: userAssignmentsInContext[questionKey] } })
                            dispatch({ type: actionTypes.SET_CURRENT_STUDENT_NOS, payload: { value: questionIndex } })
                        } else {
                            setEvaluationModalDetails(prev=>({ ...prev, isOpen: false }))
                        }
                        return
                    }
                    const allQuestions = Object.keys(userAssignmentsInContext)
                    const questionId = allQuestions[currentQuesNos+1]
                    dispatch({type:actionTypes.INC_CURRENT_QUES_NOS,payload:{}})
                    dispatch({ type:actionTypes.SET_STUDENTS, payload: { value: userAssignmentsInContext[questionId] } })
                    dispatch({type:actionTypes.SET_CURRENT_STUDENT_NOS_TO_0,payload:{}})
                }else{
                    dispatch({type:actionTypes.INC_CURRENT_STUDENT_NOS,payload:{}})
                }
            }
        }catch(err){
            console.log(err)
            setIsEvaluating(false)
        }
    }

    const handlePreviousBtnClickCoding=()=>{
        if (openedFromStudentPerformance) {
            if (!checkForFirstQuestionStudentLevel(currentQuesId, questions)) {
                dispatch({type:actionTypes.DEC_CURRENT_QUES_NOS,payload:{}})
            }
        } else {
            if(checkForFirstStudent(currentStudentNos, presentStudents)){
                if(checkForFirstQuestion(currentQuesId,userAssignmentsInContext)){
                    return 
                }
                dispatch({type:actionTypes.DEC_CURRENT_QUES_NOS,payload:{}})
                const questionArray = Object.keys(userAssignmentsInContext)
                const questionId = questionArray[currentQuesNos-1]
                dispatch({ type: actionTypes.SET_STUDENTS, payload: { value: userAssignmentsInContext[questionId] } })
            }else{
                dispatch({type:actionTypes.DEC_CURRENT_STUDENT_NOS,payload:{}})
            }
        }
    }

    const handleSubmitEvaluationPractice = async() => {
        try{
            setIsEvaluating(true)
            await submitEvaluationPractice({ practices,currentPracticeNos,rating,tags:selectedTags,comment,selectedStudent,assignmentData,evaluationType,evaluationTypes,presentStudents,currentStudentNos,openedFromStudentPerformance })
            setIsEvaluating(false)
            if (openedFromStudentPerformance) {
                if (checkForLastPracticeStudentLevel(currentPracId, practices)) {
                    const selectedQuestionIndex = studentMapNonEvaluatedQuestion(practices)
                    if (get(practices[selectedQuestionIndex], 'evaluation') === null && (selectedQuestionIndex !== currentPracticeNos)) {
                        dispatch({ type:actionTypes.SET_CURRENT_PRAC_NOS, payload:{ value: selectedQuestionIndex } })
                    } else {
                        closeEvaluationModal()
                    }
                } else {
                    dispatch({type:actionTypes.INC_CURRENT_PRAC_NOS_STUDENT_LEVEL,payload:{}})
                }
            } else {
                if (checkForLastStudent(currentStudentNos, presentStudents)) {
                    if (checkForLastPractice(currentPracId, blockBasedPracticeInContext)) {
                        const obj = getFirstNonEvaluatedPractice(blockBasedPracticeInContext, null, true)
                        const idx = get(obj, 'idx')
                        const selectedPractice = get(obj, 'practice')
                        const currentPractice = presentStudents[currentStudentNos]
                        const selectedPracticeId = get(obj, 'practice.blockBasedPractice.id')
                        const getQuestionIndex = getQuestionIndexFromId(selectedPracticeId, blockBasedPracticeInContext)
                        if (get(selectedPractice, 'evaluation') === null && get(currentPractice, 'id') !== get(selectedPractice, 'id')) {
                            dispatch({ type: actionTypes.SET_CURRENT_PRAC_NOS, payload: { value: getQuestionIndex } });
                            dispatch({ type: actionTypes.SET_STUDENTS, payload: { value: blockBasedPracticeInContext[selectedPracticeId] } })
                            dispatch({ type: actionTypes.SET_CURRENT_STUDENT_NOS, payload: { value: idx } })
                        } else {
                            if (openedFromStudentPerformance) {
                                closeEvaluationModal()
                            } else {
                                setEvaluationModalDetails(prev=>({ ...prev, isOpen: false }))
                            }
                        }
                        return
                    }
                    const allQuestions = Object.keys(blockBasedPracticeInContext)
                    const practiceId = allQuestions[currentPracticeNos+1]
                    dispatch({type:actionTypes.INC_CURRENT_PRAC_NOS,payload:{}})
                    dispatch({ type:actionTypes.SET_STUDENTS, payload: { value: blockBasedPracticeInContext[practiceId] } })
                    dispatch({type:actionTypes.SET_CURRENT_STUDENT_NOS_TO_0,payload:{}})
                }else{
                    dispatch({type:actionTypes.INC_CURRENT_STUDENT_NOS,payload:{}})
                }
            }
        }catch(err){
            console.log(err)
            setIsEvaluating(false)
        }
    }

    const handlePreviousBtnClickPractice=()=>{
        if (openedFromStudentPerformance) {
            if (!checkForFirstPracticeStudentLevel(currentPracId, practices)) {
                dispatch({type:actionTypes.DEC_CURRENT_PRAC_NOS,payload:{}})
            }
        } else {
            if(checkForFirstStudent(currentStudentNos, presentStudents)){
                if(checkForFirstPractice(currentPracId, blockBasedPracticeInContext)){
                    return 
                }
                dispatch({type:actionTypes.DEC_CURRENT_PRAC_NOS,payload:{}})
                const practiceArray = Object.keys(blockBasedPracticeInContext)
                const questionId = practiceArray[currentPracticeNos-1]
                dispatch({ type: actionTypes.SET_STUDENTS, payload: { value: blockBasedPracticeInContext[questionId] } })
            }else{
                dispatch({type:actionTypes.DEC_CURRENT_STUDENT_NOS,payload:{}})
            }
        }
    }
    
    useEffect(()=>{
        setEvaluationDetails()
    },[])

    useEffect(()=>{
        setEvaluationDetails()
    },[questions, practices, currentQuesNos, currentPracticeNos, currentStudentNos, presentStudents])

    const setEvaluationDetails = () => {
        let evaluationDetails = null
        if (evaluationType === evaluationTypes.PRACTICE || evaluationType === evaluationTypes.HW_PRACTICE) {
            if (openedFromStudentPerformance) {
                evaluationDetails = get(practices[currentPracticeNos], 'evaluation', '')
            } else {
                evaluationDetails = get(presentStudents[currentStudentNos], 'evaluation', '')
            }
        } else {
            if (openedFromStudentPerformance) {
                evaluationDetails = get(questions[currentQuesNos], 'evaluation', '')
            } else {
                evaluationDetails = get(presentStudents[currentStudentNos], 'question.evaluation', '')
            }
        }
        if(evaluationDetails){
            setRating(get(evaluationDetails,'star'))
            if (get(evaluationDetails,'comment', null)) {
                setComment(decodeURIComponent(get(evaluationDetails,'comment')))
            } else {
                setComment('')
            }
            setSelectedTags(get(evaluationDetails,'tags'))
        }else{
            setRating(0)
            setComment('')
            setSelectedTags([])
        }
    }

    const showSubmitButtonText = () => {
        let text = 'Submit and Next'
        if (evaluationType === evaluationTypes.PRACTICE || evaluationType === evaluationTypes.HW_PRACTICE) {
            if (openedFromStudentPerformance) {
                if (checkForLastPracticeStudentLevel(currentPracId, practices)) {
                    const selectedQuestionIndex = studentMapNonEvaluatedQuestion(practices)
                    if (get(practices[selectedQuestionIndex], 'evaluation') === null && (selectedQuestionIndex !== currentPracticeNos)) {
                        text += ' Practice'
                    } else {
                        return 'Submit and Close'
                    }
                } else {
                    text += ' Practice'
                }
            } else {
                if (checkForLastStudent(currentStudentNos, presentStudents)) {
                    if (checkForLastPractice(currentPracId, blockBasedPracticeInContext)) {
                        const obj = getFirstNonEvaluatedPractice(blockBasedPracticeInContext, null, true)
                        const selectedPractice = get(obj, 'practice')
                        const currentPractice = presentStudents[currentStudentNos]
                        if (get(selectedPractice, 'evaluation') === null && get(currentPractice, 'id') !== get(selectedPractice, 'id')) {
                            text += ' Student'
                        } else {
                            return 'Submit and Close'
                        }
                    } else {
                        text += ' Practice'
                    }
                } else {
                    text += ' Student'
                }
            }
        } else {
            if (openedFromStudentPerformance) {
                currentQuesId = get(questions[currentQuesNos], 'assignmentQuestion.id')
                if (checkForLastQuestionStudentLevel(currentQuesId, questions)) {
                    const selectedQuestionIndex = studentMapNonEvaluatedQuestion(questions)
                    if (get(questions[selectedQuestionIndex], 'evaluation') === null && (selectedQuestionIndex !== currentQuesNos)) {
                        text += ' Question'
                    } else {
                        return 'Submit and Close'
                    }
                } else {
                    text += ' Question'
                }
            } else {
                if (checkForLastStudent(currentStudentNos, presentStudents)) {
                    if (checkForLastQuestion(currentQuesId,userAssignmentsInContext)) {
                        const obj = getFirstNonEvaluatedQuestion(userAssignmentsInContext)
                        const questionKey = get(obj, 'id')
                        const questionIndex = get(obj, 'idx')
                        const selectedQuestionObj = userAssignmentsInContext[questionKey]
                        const selectedQuestion = selectedQuestionObj[questionIndex]
                        const currentQuestion = get(presentStudents[currentStudentNos], 'question')
                        if (get(selectedQuestion, 'question.evaluation') === null && get(currentQuestion, 'assignmentQuestion.id') !== get(selectedQuestion, 'question.assignmentQuestion.id')) {
                            text += ' Student'
                        } else {
                            return 'Submit and Close'
                        }
                    } else {
                        text += ' Question'
                    }
                } else {
                    text += ' Student'
                }
            }
        }
        return text
    }

    const showPreviousButtonText = () => {
        let text = 'Previous '
        if (evaluationType === evaluationTypes.PRACTICE || evaluationType === evaluationTypes.HW_PRACTICE) {
            if (openedFromStudentPerformance) {
                if (!checkForFirstPracticeStudentLevel(currentPracId, practices)) {
                    text += ' Practice'
                }
            } else {
                if (checkForFirstStudent(currentStudentNos, presentStudents)) {
                    text += ' Practice'
                } else {
                    text += ' Student'
                }
            }
        } else {
            if (openedFromStudentPerformance) {
                if (!checkForFirstQuestionStudentLevel(currentQuesId, questions)) {
                    text += ' Question'
                }
            } else {
                if (checkForFirstStudent(currentStudentNos, presentStudents)) {
                    text += ' Question'
                } else {
                    text += ' Student'
                }
            }
        }
        return text
    }

    const checkForPrevDisableBtn = () => {
        if (evaluationType === evaluationTypes.PRACTICE || evaluationType === evaluationTypes.HW_PRACTICE) {
            return checkForFirstStudent(currentStudentNos, presentStudents) && checkForFirstPractice(currentPracId, blockBasedPracticeInContext)
        } else {
            return checkForFirstStudent(currentStudentNos, presentStudents) && checkForFirstQuestion(currentQuesId,userAssignmentsInContext)
        }
    }

    const filteredEvaluationTags = evaluationTags.filter(tag => get(tag, 'minStar') <= rating && rating <= get(tag, 'maxStar'))

    const renderPrevBtnContent = () => (
        <Button
            onBtnClick={()=> (evaluationType === evaluationTypes.PRACTICE || evaluationType === evaluationTypes.HW_PRACTICE) ? handlePreviousBtnClickPractice() : handlePreviousBtnClickCoding()}
            isDisabled={checkForPrevDisableBtn()}
            type="ghost"
            text={showPreviousButtonText()}
            leftIcon
            style={{ alignSelf: 'flex-start' }}
        >
            <LeftArrow color={checkForPrevDisableBtn() ? "#9E9E9E" : "#333333"} height={hsFor1280(18)} width={hsFor1280(18)} />
        </Button>
    )

    const renderPreviousBtn = () => {
        if (evaluationType === evaluationTypes.PRACTICE || evaluationType === evaluationTypes.HW_PRACTICE) {
            if (openedFromStudentPerformance) {
                if (!checkForFirstPracticeStudentLevel(currentPracId, practices)) {
                    return renderPrevBtnContent()
                }
            } else {
                return renderPrevBtnContent()
            }
        } else {
            if (openedFromStudentPerformance) {
                if (!checkForFirstQuestionStudentLevel(currentQuesId, questions)) {
                    return renderPrevBtnContent()
                }
            } else {
                if (!checkForFirstQuestion(currentQuesId, userAssignmentsInContext) && !checkForFirstStudent(currentStudentNos, presentStudents)) {
                    return renderPrevBtnContent()
                }
            }
        }

        if (openedFromStudentPerformance) {
            if (evaluationType === evaluationTypes.PRACTICE || evaluationType === evaluationTypes.HW_PRACTICE) {
                if (!checkForFirstPracticeStudentLevel(currentPracId, practices)) {
                    return renderPrevBtnContent()
                }
            } else {
                if (!checkForFirstQuestionStudentLevel(currentQuesId, questions)) {
                    return renderPrevBtnContent()
                }
            }
        } else {
            return renderPrevBtnContent()
        }
    }

    const renderFooter = () => {
        return (
            <>
                {renderPreviousBtn()}
                <Button
                    isLoading={isEvaluating}
                    onBtnClick={()=> (evaluationType === evaluationTypes.PRACTICE || evaluationType === evaluationTypes.HW_PRACTICE) ? handleSubmitEvaluationPractice() : handleSubmitEvaluationCoding()}
                    text={showSubmitButtonText()}
                    rightIcon
                    isDisabled={!percentMap[rating]}
                    style={{ alignSelf: 'flex-end' }}
                >
                    {showSubmitButtonText() !== 'Submit' ? <RightArrow color="white" height={hsFor1280(18)} width={hsFor1280(18)} /> : null}
                </Button>
            </>
        )
    }

    return <div style={styleObj} className={`${styles.box} ${styles.evalBox}`}>
        <div className={styles.evalBoxBodyContainer}>
            <div className={styles.evalBoxHeaderContainer}>
                <h5 className={styles.evalBoxHeading}>Evaluate Answer</h5>
                <div className={styles.scoreDetailsContainer}>
                    {percentMap[rating] ? (
                        <div className={styles.scoreAndBadgeContainer}>
                            <span className={styles.scoreTextAtPresent}>Score: <span className={`${styles.scoreValue} ${getTextColor(styles)}`}>{percentageRating}%</span></span>
                            <span>
                                <Badge type={ratingLabelColorMap[rating]} text={ratingLabelMap[rating]} />
                            </span>
                        </div>
                    ) : null}
                    <span className={styles.infoIconContainer}>
                    <AttendanceTooltip tipColor={"#4A336C"} delay={'200'} hideDelay={'800'}  direction="bottom" customStyles={tooltipStyles} content={<div className={styles.tooltipContentContainer}>
                        <div className={styles.tooltipHeadingContainer}>
                            <span className={styles.tooltipTitle}> Evaluation Criteria</span>
                        </div>
                        <div className={styles.scoreToolTipContainer}>
                            {[5, 4, 3, 2, 1].map(star => (
                                <div className={styles.scoreLineContainer}>
                                    <span className={styles.scoreContainer}>{star}</span>
                                    <span className={styles.starContainer}>
                                        <ToolTipStar />
                                    </span>
                                    <span className={styles.scoreText}>= {star * 20}% Score</span>
                                </div>
                            ))}
                        </div>
                    </div>}><InformationCircle /></AttendanceTooltip>
                    </span>
                </div>
            </div>
            <div className={styles.evalBoxBody}>
                <div className={styles.starsContainer}>
                    <StarRating rating={rating} setRating={setRating} />
                </div>
                {(evaluationType === evaluationTypes.CODING_ASSIGNMENT || evaluationType === evaluationTypes.HW_ASSIGNMENT) && filteredEvaluationTags && filteredEvaluationTags.length && percentMap[rating] ? <div className={styles.pillsContainer}>
                    {filteredEvaluationTags.map(tag => <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1}}
                        transition={{ duration: 0.5 }}
                        key={get(tag, 'id')}
                    > <Badge key={get(tag, 'id')} rounded isSelectable text={get(tag, 'name')} tag={tag} isSelected={isSelected(tag)} onSelection={onBadgeSelection} /></motion.div>)}
                </div> : null
                }
                {percentMap[rating] ? (
                    <textarea className={styles.evaluationComment} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add comments (optional)" name="comments" rows="3"></textarea>
                ) : null}
            </div>
        </div>
        <div className={styles.footer} style={{ justifyContent: (openedFromStudentPerformance && (checkForFirstQuestionStudentLevel(currentQuesId, questions) || checkForFirstPracticeStudentLevel(currentPracId, practices))) ? 'flex-end' : 'space-between' }}>
            {renderFooter()}
        </div>
    </div>;
};

export default Evaluation