import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import ReactDOM from "react-dom"; 
import { get, sortBy } from 'lodash'
import styles from './SubmitOverlayMenu.module.scss'
import Modal from 'react-modal'
import Preview from '../../../../../components/Preview'
import fetchQuizReport from '../../../../../queries/fetchQuizReport'
import ContentLoader from 'react-content-loader'
import {isBase64 } from '../../../../../utils/base64Utility'
import isMobile from '../../../../../utils/isMobile'
import ModalCloseButton from '../../../../../components/Buttons/ModalCloseButton'
import UpdatedButton from '../../../../../components/Buttons/UpdatedButton/UpdatedButton'
import { ArrowBackward } from '../../../../../constants/icons'
import HomeworkProgress from '../../../../../components/UpdatedSideNavBar/HomeworkProgress'
import { homeworkComponents } from '../../../../../constants/homework'
import updateMentorMenteeSession from '../../../../../queries/sessions/updateMentorMenteeSession'
import {ReactComponent as CheckIcon} from './checkIcon.svg'
import { HOMEWORK_COMPONENTS_CONFIG } from '../../../../../constants/topicComponentConstants';
import { CodingIcon, QuizIcon,AssginmentIcon,pqIcon } from '../../../../../components/UpdatedSideNavBar/mainSideBarIcons';
import { checkIfQuizExits } from '../../../../../components/NextFooter/utils';
import { isAccessingTrainingResources } from '../../../../../utils/teacherApp/checkForEmbed';
import goBackToTeacherApp from '../../../../../utils/teacherApp/goBackToTeacherApp';


const SubmitOverlay = ({
    visible,
    onQuizSubmit,
    message,
    closeOverlay,
    title,
    isLoading,
    closeImmediately,
    onSubmitForReview,
    submitForReviewOverlay,
    path,
    disabled,
    description,
    isHomeworkComplete = false,
    userFirstAndLatestQuizReport,
    userId,
    topicId,
    topic,
    history,
    courseId,
    isSuccess,
    mentorMenteeSession,
    topicComponentRule,
    userQuizAnswers,
    setSubmitForReviewClicked,
    mentorMenteeSessionUpdateStatus,
     ...props
}) => {
    const [assignmentQuestions, setAssignmentQuestions] = useState(null)
    const [practiceQuestions, setPracticeQuestions] = useState(null)
    const [components, setComponents] = useState([])
    const [isFetching, setIsFetching] = useState(false)
    const [isSubmitting,setIsSubmitting] = useState(false)
    const [submitDisabled,setSubmitDisabled] = useState(false)

    const {userFirstAndLatestQuizReports,userBlockBasedPractices,userAssignment,homeWorkMeta,userQuizs} = props
    const quizAnswers = get(userQuizs.toJS(), '[0].quiz', null)  || get(userQuizAnswers.toJS(), '[0].quizAnswers', null)

    useEffect(() => {
        checkIfHomeworkCompleted()
    }, [homeWorkMeta])
    const checkIfHomeworkCompleted = () => {
        let totalAttempted = 0
        Object.keys(homeWorkMeta.toJS()).forEach(key => {
            const meta = homeWorkMeta.toJS()[key]
            totalAttempted += meta.attempted
        })
        const isAttempted = totalAttempted > 0
        setSubmitDisabled(isAttempted)
        
    }
    const solveQuestion = (type,index,blockbasedId) => {
        if(type === 'quiz') {
            history.push(`/homework/${courseId}/${topicId}/quiz?question=${index}`)
        }
        else if(type === 'assignment') {
            history.push(`/homework/${courseId}/${topicId}/codingAssignment?question=${index}`)
        }
        else if(type === 'practice') {
            history.push(`/homework/${courseId}/${topicId}/${blockbasedId}/practice?question=${index}`)
        }
        // close modal
        closeOverlay()
    }
    const checkIfQuestionIsAttempted = (type,id) => {
        return get(homeWorkMeta.toJS(), `${type}.attemptedIds`, []).includes(id)
    }
    const submitForReview = async () => {
        setIsSubmitting(true)
        const input = {
            isSubmittedForReview: true,
        }
        let sessionId = null        
        if (mentorMenteeSession && mentorMenteeSession.toJS().length > 0) {
            mentorMenteeSession.toJS().forEach((session) => {
                if (session.topicId === topicId) {
                    sessionId = session.id
                }
            })
        }
        if(get(homeWorkMeta.toJS(), `${HOMEWORK_COMPONENTS_CONFIG.homeworkPractice}.attempted`, 0) > 0 ){
            input['isPracticeSubmitted'] = true
            input['practiceSubmitDate'] = new Date().toISOString()
        }
        if(get(homeWorkMeta.toJS(), `${HOMEWORK_COMPONENTS_CONFIG.quiz}.attempted`, 0) > 0 ){
            input['isQuizSubmitted'] = true
            input['quizSubmitDate'] = new Date().toISOString()
        }
        if(get(homeWorkMeta.toJS(), `${HOMEWORK_COMPONENTS_CONFIG.homeworkAssignment}.attempted`, 0) > 0 ){
            input['isAssignmentAttempted'] = true
            input['isAssignmentSubmitted'] = true
            input['assignmentSubmitDate'] = new Date().toISOString()
        }
       
        
        await updateMentorMenteeSession(sessionId, input, topicId, true).call()
        if (isAccessingTrainingResources()) {
            return goBackToTeacherApp('backToTraining')
        }
        closeOverlay()
        checkIfQuizExits({topicId,isRevisit: false}) ?
             history.push(`/quiz-report-latest/${courseId}/${topicId}`)
             : history.push(`/homework`)


        setIsSubmitting(false)
        // redirect to report page
        

  }
    const fetchHomeworkDetails = async (bypassCheck = false) => {
        if (isHomeworkComplete && (!isLoading || bypassCheck )) {

          const filteredRule = topicComponentRule && 
                               topicComponentRule.filter((rule) => 
                                  ["quiz", "homeworkAssignment", "homeworkPractice"].includes(
                                    get(rule, "componentName")
                                       ))
          if(filteredRule && filteredRule.length > 0) {
          if (
            filteredRule.some((el) =>
              ["homeworkPractice"].includes(get(el, "componentName"))
            )
          ) {
            setComponents(
              filteredRule.slice(
                0,
                filteredRule.findIndex(
                  (el) => get(el, "componentName") === "homeworkPractice"
                ) + 1
              )
            );
          } else {
            setComponents(filteredRule);
          }
          if(!userFirstAndLatestQuizReport){
              await fetchQuizReport(topicId, courseId).call();
          }
         
          if (userFirstAndLatestQuizReports) {
            
            const quizReportId = userFirstAndLatestQuizReports.getIn([
              0,
              "latestQuizReport",
              "quizReportId",
            ]);
            
          }
          const newUserAssignment = userAssignment.toJS()
              if (newUserAssignment && newUserAssignment.length) {
                let assignments = get(newUserAssignment[0], "assignment", []);
                assignments = assignments.filter(
                  (el) =>
                    el.assignmentQuestion &&
                    el.assignmentQuestion.isHomework === true
                );
                setAssignmentQuestions(assignments || []);
      
           
                
        
        }
        if(userBlockBasedPractices){
                    if (
                      
                      userBlockBasedPractices.toJS() &&
                      userBlockBasedPractices.toJS().length
                    ) {
                      let practiceQuestions = userBlockBasedPractices.toJS().filter((el) =>
                          get(el, "blockBasedPractice.isHomework") && get(el, "blockBasedPractice.isSubmitAnswer",false)
                        )
                        practiceQuestions = sortBy(practiceQuestions, [
                        (el) => get(el, "blockBasedPractice.order"),
                        ]);
                      setPracticeQuestions(practiceQuestions);
                    }
                }
    }
    }
}
    useEffect(() => {
        if(visible){
            fetchHomeworkDetails()
        }
    }, [isHomeworkComplete,topicComponentRule,userFirstAndLatestQuizReports,visible])
    
    // useEffect(() => {
    //     if (visible && isMobile()) {
    //         // fetchHomeworkDetails(true)
    //     }
    // }, [visible])
    // useEffect(() => {
    //     if (!isMobile()) {
    //         fetchHomeworkDetails()
    //     }
    // }, [isSuccess])

    const checkIfPracticeUnAnswered = (el) => {
        if (get(el, 'blockBasedPractice.isSubmitAnswer')) {
            if ((get(el, 'blockBasedPractice.layout') === 'playground') && !get(el, 'savedBlocks')) {
                return true
            } else if ((get(el, 'blockBasedPractice.layout') === 'fileUpload') && !get(el, 'attachments', []).length) {
                return true
            } else if ((get(el, 'blockBasedPractice.layout') === 'externalPlatform') && !get(el, 'answerLink')) {
                return true
            }
        }
        return false;
    }

    return (
        ReactDOM.createPortal(
        <>
        
        <Modal
            isOpen={visible}
            className={cx({
                [styles.modalContainer]: true,
                [styles.containerPadding]: !isHomeworkComplete,
                [styles.modalContainerBgImage]: !isHomeworkComplete,
                [styles.modalContainerWidth]: isHomeworkComplete
            })}
            overlayClassName={styles.container}
            closeTimeoutMS={closeImmediately ? 0 : 500}
        >
            <ModalCloseButton
                handleClick={closeOverlay}
            />
            <div
                className={styles.header}

            >   
                <div className={styles.headerTitle}>Confirm Submission</div>
                <div className={styles.subText}>Make sure to attempt all the questions before submitting your homework!</div>
                <HomeworkProgress
                    homeWorkMeta={props.homeWorkMeta}
                    showSubmit={false}
                    fromSubmitModal={true}
                    topicId={topicId}
                    courseId={courseId}
                >

                </HomeworkProgress>

            </div>
    
            {isHomeworkComplete ? (
                <>
                
                    {!isFetching ? (
                        <div className={styles.summaryContainer}>
                            {components.map((component, index) => {
                                if (get(component, 'componentName') === 'quiz') {
                                    const quizLength = get(homeWorkMeta.toJS(), `${HOMEWORK_COMPONENTS_CONFIG.quiz}.total`, 0)
                                    const quizAttempted = get(homeWorkMeta.toJS(), `${HOMEWORK_COMPONENTS_CONFIG.quiz}.attempted`, 0)
                                    
                                    return (
                                        <>
                                            {(quizAnswers && quizAnswers.length) ? (
                                                <>
                                                    <div className={styles.componentHeader}>
                                                        <div className={styles.componentName}>
                                                            <div className={styles.componentIcon}>
                                                               {pqIcon()}
                                                            </div>
                                                            Quiz
                                                        </div>
                                                        <div className={styles.componentStatus}>
                                                            <span>{quizAttempted}/{quizLength}</span> Attempted
                                                        </div>
                                                    </div>
                                            
                                                    {quizAnswers.map((el,index) => {
                                                       
                                                        return <>
                                                        <div className={cx(styles.questionContainer, index === quizAnswers.length - 1 && styles.noBottom)}
                                                        >
                                                        {
                                                            isBase64(el.question.statement) ? 
                                                            (
                                                                <span className={styles.questionText}>
                                                                   <pre>{`Q${index+1}` }</pre>
                                                                   <div className={styles.previewQuestion}>
                                                                        <Preview 
                                                                            value={ 
                                                                                el.question.statement
                                                                            } 
                                                                            useNativeHtmlParser={true}
                                                                        />
                                                                    
                                                                   </div>
                                                                </span>
                                                            )
                                                            :
                                                            (<span className={styles.questionText}><pre>{`Q${index+1}` }</pre><p className={styles.previewQuestion}>{el.question.statement}
                                                                </p></span>)
                                                        }
                                                            <span className={styles.tagContainer} onClick={() => {
                                                                solveQuestion('quiz',index + 1)
                                                                localStorage.setItem('solveQuiz', index + 1)
                                                            }}>
                                                                <span className={cx({
                                                                    [styles.answeredTag]: true,
                                                                    [styles.unAnsweredTag]: !checkIfQuestionIsAttempted(HOMEWORK_COMPONENTS_CONFIG.quiz,el.question.id),
                                                                })}>
                                                                    {checkIfQuestionIsAttempted(HOMEWORK_COMPONENTS_CONFIG.quiz,el.question.id) ? <CheckIcon></CheckIcon>: 'Solve'}
                                                                </span>
                                                                {/* {(!isMobile() && !el.isAttempted) && (
                                                                    <span
                                                                        onClick={() => {
                                                                            closeOverlay();
                                                                            history.push({
                                                                                pathname: `/homework/${courseId}/${topicId}/quiz`,
                                                                                state: {
                                                                                    activeQuestionIndex: index,
                                                                                }
                                                                            })
                                                                        }}
                                                                        className={styles.editIcon}
                                                                    />
                                                                )} */}
                                                            </span>
                                                        </div>
                                                        </>
                                                    })}
                                                </>
                                            ) : null}
                                        </>
                                    )
                                }
                                if (get(component, 'componentName') === 'homeworkAssignment') {
                                    const attempted = get(homeWorkMeta.toJS(), `${HOMEWORK_COMPONENTS_CONFIG.homeworkAssignment}.attempted`, 0)
                                    const total = get(homeWorkMeta.toJS(), `${HOMEWORK_COMPONENTS_CONFIG.homeworkAssignment}.total`, 0)
                                    
                                    return (
                                        <>
                                            {(assignmentQuestions && assignmentQuestions.length) ? (
                                            <>
                                                <div className={styles.componentHeader}>
                                                        <div className={styles.componentName}>
                                                            <div className={styles.componentIcon}>
                                                               <CodingIcon /> 
                                                            </div>
                                                            Coding Assignment
                                                        </div>
                                                        <div className={styles.componentStatus}>
                                                            <span>{attempted}/{total}</span> Attempted
                                                        </div>
                                                        
                                                </div>
                                            
                                                {assignmentQuestions.map((el,index) => (
                                                    
                                                    <div className={styles.questionContainer}>
                                                        {
                                                            isBase64(el.assignmentQuestion.statement) ? 
                                                            (
                                                                <span className={styles.questionText}>
                                                                   <pre>{`Q${index+1}` }</pre>
                                                                    <div className={styles.previewQuestion}>
                                                                        <Preview value={el.assignmentQuestion.statement} useNativeHtmlParser={true}/>
                                                                   </div>
                                                                </span>
                                                            )
                                                            :
                                                            (<span className={styles.questionText}><pre>{`Q${index+1}` }</pre><p className={styles.previewQuestion}>{el.assignmentQuestion.statement}
                                                                </p></span>)
                                                        }
                                                        {/* <span className={styles.questionText}>{index+1}. {el.assignmentQuestion.statement}</span> */}
                                                        <span className={styles.tagContainer}
                                                            onClick={() => {
                                                                solveQuestion('assignment',index + 1)
                                                            }}
                                                        >
                                                            <span className={cx({
                                                                [styles.answeredTag]: true,
                                                                [styles.unAnsweredTag]: !checkIfQuestionIsAttempted(HOMEWORK_COMPONENTS_CONFIG.homeworkAssignment,el.assignmentQuestion.id),
                                                            })}>
                                                                {checkIfQuestionIsAttempted(HOMEWORK_COMPONENTS_CONFIG.homeworkAssignment,el.assignmentQuestion.id) ? <CheckIcon></CheckIcon> : 'Solve'}
                                                            </span>
                                                            {/* {(!isMobile() && !el.isAttempted) && (
                                                                <span
                                                                    onClick={() => {
                                                                        closeOverlay()
                                                                        history.push({
                                                                            pathname: `/homework/${courseId}/${topicId}/codingAssignment`,
                                                                            state: {
                                                                                activeQuestionIndex: index,
                                                                            }
                                                                        })
                                                                    }}
                                                                    className={styles.editIcon}
                                                                />
                                                            )} */}
                                                        </span>
                                                    </div>
                                                ))}
                                            </>
                                        ) : null}
                                        </>
                                    )
                                }
                                if (get(component, 'componentName') === 'homeworkPractice') {
                                    const attempted = get(homeWorkMeta.toJS(), `${HOMEWORK_COMPONENTS_CONFIG.homeworkPractice}.attempted`, 0)
                                    const total = get(homeWorkMeta.toJS(), `${HOMEWORK_COMPONENTS_CONFIG.homeworkPractice}.total`, 0)
                                    
                                    return (
                                        <>
                                            {(practiceQuestions && practiceQuestions.length) ? (
                                                <>
                                                <div className={styles.componentHeader}>
                                                        <div className={styles.componentName}>
                                                            <div className={styles.componentIcon}>
                                                               <AssginmentIcon /> 
                                                            </div>
                                                            Practice
                                                        </div>
                                                        <div className={styles.componentStatus}>
                                                            <span>{attempted}/{total}</span> Attempted
                                                        </div>
                                                        
                                                    </div>
                                                    
                                            
                                                    {practiceQuestions.map((el,index) => (
                                                        
                                                        <div className={styles.questionContainer}>
                                                            <span className={styles.questionText}><pre>Q{index+1}.</pre> <p className={styles.previewQuestion}>{get(el, 'blockBasedPractice.title', '')}</p> </span>
                                                            <span className={styles.tagContainer}
                                                                onClick={() => {
                                                                    solveQuestion('practice',index + 1, el.blockBasedPractice.id)
                                                                 }}
                                                                
                                                            >
                                                                <span className={cx({
                                                                    [styles.answeredTag]: true,
                                                                    [styles.unAnsweredTag]: !checkIfQuestionIsAttempted(HOMEWORK_COMPONENTS_CONFIG.homeworkPractice,el.blockBasedPractice.id),
                                                                })}>
                                                                    { checkIfQuestionIsAttempted(HOMEWORK_COMPONENTS_CONFIG.homeworkPractice,el.blockBasedPractice.id)? <CheckIcon></CheckIcon> : 'Solve'}
                                                                </span>
                                                               
                                                            </span>
                                                        </div>
                                                    ))
                                                    }
                                                </>
                                            ) : null}
                                        </>
                                    )
                                }
                                return <></>
                            })}
                        </div>
                    ) : (
                        <ContentLoader
                            className={styles.qrLoaderCard}
                            speed={5}
                            interval={0.1}
                            backgroundColor={'#f5f5f5'}
                            foregroundColor={'#dbdbdb'}
                        >
                            {isMobile() ? (
                                <>
                                    <rect className={styles.qrLoader1Mobile} />
                                </>
                            ) : (
                                <>
                                    <rect className={styles.qrLoader1} />
                                    <rect className={styles.qrLoader2} />
                                    <rect className={styles.qrLoader3} />
                                </>
                            )}
                        </ContentLoader>
                    )}
                </>
            ) : (
                <>
                    <div className={styles.modalTitle}>{title}</div>
                    <div className={styles.modalIconContainer}> <span className={styles.saveIcon} /> </div>
                    <div className={styles.confirmText}>
                        {message || ''}
                        <span> {description || ''} </span>
                    </div>
                </>
            )}
            <div className={styles.footer}>
                <UpdatedButton
                    type='secondary'
                    onBtnClick={() => {
                        setIsSubmitting(false)
                        closeOverlay()
                    }}
                    text="Go back to solving"
                    leftIcon
                >
                <ArrowBackward color='#00ADE6' />


                </UpdatedButton>
                 <UpdatedButton
                    isDisabled={!submitDisabled}
                    onBtnClick={() => submitForReview()}
                    isLoading={isSubmitting}
                    text="Submit Homework"
                    
                >

                </UpdatedButton>
              
                
            </div>
        </Modal>
        </>,
        document.getElementsByTagName('body')[0]

        )
    )
}

export default SubmitOverlay
