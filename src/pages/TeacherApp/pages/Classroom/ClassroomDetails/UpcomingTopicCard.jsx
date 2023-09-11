import React, { useState } from 'react'
import styles from './classroomDetails.module.scss'
import { LockIcon } from '../../../../../constants/icons'
import getPath from '../../../../../utils/getFullPath'
import { ArrowForward, CodeTerminal, DummySessionDetailsThumbnail, PenPaperIcon, Question, Report, Video } from '../../../../../constants/icons'
import Button from '../../../../TeacherApp/components/Button/Button'
import { get } from 'lodash'
import { getLoSlidesAndQuestionCount, getLOText, getVideoTime } from './ClassroomDetails.helpers'
import hs from '../../../../../utils/scale'
import getStudentAppRoute from '../../../../../utils/teacherApp/getRoute'
import requestToGraphql from '../../../../../utils/requestToGraphql'
import { getFilteredLoComponentRule, getLORedirectKey } from '../../../../UpdatedSessions/utils'
import { HomeworkSvg } from '../../../components/svg'
import { getCourseLanguage } from '../../../utils'
import { backToPageConst } from '../../../constants'



export const Heading = (props) => {
    const { title, thumbnail } = props
    return <div className={styles.topicThumbnail}>
        {/* <div
            className={styles.thumbnailWrapper}
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: `url(${thumbnail ? thumbnail : ''})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain',
                height: hs(30),
                width: hs(30)
            }}
        >
            {
                !props.thumbnail && <DummySessionDetailsThumbnail />

            }

        </div> */}
        <h4 className={styles.upcomingTopicTitle}>Lab {props.order} - {title}</h4>
    </div>
}

//BADGE will be used in P2
// const Badge=(props)=>{
//     const {type,text}=props
//         const getBadgeColor=(type)=>{
//         if(type==='reviewed') return 'greenBadge'
//         if(type==='notReviewed') return 'yellowBadge'
//   }

// return <div className={styles[getBadgeColor(type)]}>
//     <p>{text}</p>
// </div>
// }
const Pill = ({ text, icon }) => {
    return <div className={styles.pill}>
        <div className={styles.pillIcon}>
            {icon}
        </div>
        <span className={styles.pillText}>
            {text}
        </span>
    </div>
}

const UpcomingTopicCard = (props) => {
    // const [redirectionIds, setRedirectionIds] = useState(null)
    const [loading, setLoading] = useState(false)
    const { session } = props
    const sessionStatus = get(session, 'sessionStatus')//expected value='allotted'
    const tcRule = get(session, 'topicComponentRule', [])
    const topicClassType = get(session, 'classType', 'theory');
    const isHomeworkExists = get(session, 'topicComponentRule', []).find(rule => get(rule, 'componentName') === 'quiz' || get(rule, 'componentName') === 'homeworkAssignment' || get(rule, 'componentName') === 'homeworkPractice')
    const videoComponents = get(session, 'topicComponentRule', []).filter(rule => get(rule, 'componentName') === 'video')
    const blockBasedComponents = get(session, 'topicComponentRule', []).filter(rule => get(rule, 'componentName') === 'blockBasedPractice' || get(rule, 'componentName') === 'blockBasedProject')
    const classworkAssignmentMeta = get(session, 'classworkAssignmentMeta', 0)
    const homeworkAssignmentMeta = get(session, 'homeworkAssignmentMeta', 0)
    const homeworkQuizMeta = get(session, 'homeworkQuizMeta', 0)
    const thumbnail = getPath(get(session, 'thumbnailSmall.uri'))
    const LOComponents = get(session, 'topicComponentRule', []).filter(rule => get(rule, 'componentName') === 'learningObjective')

    const getRedirectionLink = ({ isRevisit = true, isViewingContent = true, openInNewTab = true, homework = false, batchId, courseId, topicId, sessionId, defaultLoComponentRule, codingLanguage }) => {
        let redirectURL
        let topicComponentRule = get(session, 'topicComponentRule', []);
        const sortedTopicComponentRule = [...(topicComponentRule || [])].sort((a, b) => get(a, 'order') - get(b, 'order'))

        const filteredSortedTopicComponentRule = sortedTopicComponentRule.filter(rule => rule.componentName === 'quiz' || rule.componentName === 'homeworkAssignment' || rule.componentName === 'homeworkPractice')

        const firstHomeworkComponent = filteredSortedTopicComponentRule[0]

        const firstComponent = sortedTopicComponentRule[0]
        const backToPage = backToPageConst.report
        if (homework && ((firstHomeworkComponent && firstHomeworkComponent.componentName === 'quiz') || (firstHomeworkComponent && firstHomeworkComponent.componentName === 'homeworkAssignment'))) {
            redirectURL = getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentName: get(firstHomeworkComponent, 'componentName'), sessionId, documentType: get(session, 'recordType'), isRevisit, backToPage, codingLanguage })

        } else if (homework && firstHomeworkComponent && firstHomeworkComponent.componentName === 'homeworkPractice') {
            redirectURL = getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentId: get(firstHomeworkComponent, 'blockBasedProject.id'), componentName: get(firstHomeworkComponent, 'componentName'), sessionId, documentType: get(session, 'recordType'), isRevisit, backToPage, codingLanguage })

        } else if (firstComponent && firstComponent.componentName === 'blockBasedProject') {
            if (isViewingContent) {
                window.open(getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentId: get(firstComponent, 'blockBasedProject.id'), componentName: get(firstComponent, 'componentName'), sessionId, documentType: get(session, 'recordType'), isRevisit, sessionStatus, backToPage, codingLanguage }), '_self')

                return
            }
            redirectURL = getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentId: get(firstComponent, 'blockBasedProject.id'), componentName: get(firstComponent, 'componentName'), sessionId, documentType: get(session, 'recordType'), isRevisit, backToPage, codingLanguage })
        } else if (firstComponent && firstComponent.componentName === 'video') {
            if (isViewingContent) {
                window.open(getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentId: get(firstComponent, 'video.id'), componentName: get(firstComponent, 'componentName'), sessionId, documentType: get(session, 'recordType'), isRevisit, sessionStatus, backToPage, codingLanguage }), '_self')
                return
            }
            redirectURL = getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentId: get(firstComponent, 'video.id'), componentName: get(firstComponent, 'componentName'), sessionId, documentType: get(session, 'recordType'), isRevisit, backToPage, codingLanguage })


        } else if (firstComponent && firstComponent.componentName === 'blockBasedPractice') {
            if (isViewingContent) {
                window.open(getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentId: get(firstComponent, 'blockBasedProject.id'), componentName: get(firstComponent, 'componentName'), sessionId, documentType: get(session, 'recordType'), isRevisit, sessionStatus, backToPage, codingLanguage }), '_self')
                return
            }
            redirectURL = getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentId: get(firstComponent, 'blockBasedProject.id'), componentName: get(firstComponent, 'componentName'), sessionId, documentType: get(session, 'recordType'), isRevisit, backToPage, codingLanguage })

        } else if (firstComponent && firstComponent.componentName === 'assignment') {
            if (isViewingContent) {
                window.open(getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentName: get(firstComponent, 'componentName'), sessionId, documentType: get(session, 'recordType'), isRevisit, sessionStatus, backToPage, codingLanguage }), '_self')
                return
            }
            redirectURL = getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentName: get(firstComponent, 'componentName'), sessionId, documentType: get(session, 'recordType'), isRevisit, backToPage, codingLanguage })

        }
        else {
            if (firstComponent && firstComponent.componentName === 'learningObjective') {
                let LoRedirectKey = 'comic-strip'
                if (defaultLoComponentRule && defaultLoComponentRule.length) {
                    const sortedDefaultLoCompRule = defaultLoComponentRule.sort((a, b) => get(a, 'order') - get(b, 'order'))
                    const filteredLoComponentRule = getFilteredLoComponentRule(get(firstComponent, 'learningObjective'), sortedDefaultLoCompRule, (get(firstComponent, 'learningObjectiveComponentsRule', []) || []))
                    if (filteredLoComponentRule && filteredLoComponentRule.length) {
                        LoRedirectKey = getLORedirectKey(filteredLoComponentRule[0])
                        if (isViewingContent) {
                            window.open(getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentId: get(firstComponent, 'learningObjective.id'), componentName: LoRedirectKey, isLoComponent: 'true', sessionId, documentType: get(session, 'recordType'), isRevisit, sessionStatus, backToPage, codingLanguage }), '_self')
                            return
                        }
                        redirectURL = getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentId: get(firstComponent, 'learningObjective.id'), componentName: LoRedirectKey, isLoComponent: 'true', sessionId, documentType: get(session, 'recordType'), isRevisit, backToPage, codingLanguage })
                    }
                }
            }
        }
        if (openInNewTab) {
            //not using _blank, coz its causing data issues
            window.open(redirectURL, "_self", "noreferrer");
        } else {
            window.location.replace(redirectURL);
        }
    }

    const reviewContent = async () => {
        try {
            setLoading(true)
            const res = await requestToGraphql(`{
                batchSession(id: "${get(session, 'id')}") {
                  id
                  courseData:course{
                    id
                    codingLanguages{
                      value
                    }
                    defaultLoComponentRule{
                      order
                      componentName
                    }
                  }
                  batchData:batch{
                    id
                  }
                  topicData:topic {
                    id
                  }
                }
              }`)
            setLoading(false)

            // setRedirectionIds({ ...get(res, 'data.batchSession') })
            if (get(res, 'data.batchSession')) {
                const idCollection = get(res, 'data.batchSession')
                const codingLanguage = getCourseLanguage(get(idCollection, 'courseData'))
                getRedirectionLink({ isRevisit: true, isViewingContent: true, openInNewTab: false, homework: false, batchId: get(idCollection, 'batchData.id'), courseId: get(idCollection, 'courseData.id'), topicId: get(idCollection, 'topicData.id'), sessionId: get(session, 'id'), defaultLoComponentRule: get(idCollection, 'courseData.defaultLoComponentRule'), codingLanguage })
            }
        } catch (err) {
            console.log(err)
            setLoading(false)
        }
    }

    return <div id={get(session, 'id')} className={styles.upcomingTopicCardContainer}>
        <Heading
            title={get(session, 'topicTitle')}
            thumbnail={thumbnail}
            order={props.order}
        />
        {((tcRule.length !== 0) && (topicClassType !== 'theory')) ? <div className={styles.topicDetails}>
            <div className={styles.nonLoDataContainer}>
                {videoComponents.length !== 0 && <div className={styles.dataPointsContainer}>
                    {videoComponents && videoComponents.map(videoComponent =>
                        <Pill
                            text={`${getVideoTime(get(videoComponent, 'video'))}`}
                            icon={<Video />}
                        />
                    )}
                </div>}
                {
                    blockBasedComponents && blockBasedComponents.length !== 0 && <Pill
                        text={`${blockBasedComponents.length} Practice`}
                        icon={<CodeTerminal />}
                    />
                }
                {classworkAssignmentMeta !== 0 && <div className={styles.dataPointsContainer}>
                    <Pill text={`${classworkAssignmentMeta} Assignment${classworkAssignmentMeta === 1 ? '' : 's'}`} icon={<Question />} />
                </div>}
            </div>
            {
                LOComponents.length !== 0 && LOComponents.map(LO => <div>
                    <h5 className={styles.upcomingSubTopic}>{get(LO, 'learningObjective.title')}</h5>
                    <div className={styles.dataPointsContainer}>
                        <Pill text={`${getLOText(getLoSlidesAndQuestionCount(get(LO, 'learningObjective')).slides, getLoSlidesAndQuestionCount(get(LO, 'learningObjective')).questions)}`} icon={<CodeTerminal />} />
                        {/* <Pill text={`${getLOText()} ${getLoSlidesAndQuestionCount(get(LO,'learningObjective')).slides} Slides | ${getLoSlidesAndQuestionCount(get(LO,'learningObjective')).questions} Question`} icon={<CodeTerminal />} />                       */}
                    </div>
                </div>)
            }
            {isHomeworkExists && <div>
                <h5 className={styles.upcomingSubTopic}>Homework</h5>
                <div className={styles.dataPointsContainer}>
                    {!!homeworkQuizMeta && <Pill text={`${homeworkQuizMeta} Question${homeworkQuizMeta === 1 ? '' : 's'}`} icon={<Report />} />}
                    {!!homeworkAssignmentMeta && <Pill text={`${homeworkAssignmentMeta}  Assignment${homeworkAssignmentMeta === 1 ? '' : 's'}`} icon={<Question />} />}
                </div>
            </div>}
        </div> : <div className={styles.upcomingCardEmptyState}>
            <div>
                <div className={styles.emptyStateIcon} >
                    <LockIcon color={'#A8A7A7'} height={hs(50)} width={hs(50)} />
                </div>
                <p className={styles.emptyStateText}>To view future content please contact us.</p>
            </div>
        </div>}
        {((tcRule.length !== 0) && (topicClassType !== 'theory')) && <footer className={styles.upcomingTopicFooter}>
            <Button isLoading={loading} onBtnClick={reviewContent} text={'Review Content'} btnPadding={`${hs(18)} ${hs(26)}`} leftIcon widthFull >
                <ArrowForward color='white' height='16' width='16' />
            </Button>
        </footer>}
    </div>
}

export default UpcomingTopicCard