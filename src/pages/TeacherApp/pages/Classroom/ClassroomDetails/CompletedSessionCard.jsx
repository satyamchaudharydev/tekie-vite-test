import { get } from 'lodash'
import React, { useState } from 'react'
import { CheckmarkCircle, RightArrow } from '../../../../../constants/icons'
import getPath from '../../../../../utils/getFullPath'
import requestToGraphql from '../../../../../utils/requestToGraphql'
import { hsFor1280 } from '../../../../../utils/scale'
import getStudentAppRoute from '../../../../../utils/teacherApp/getRoute'
import { getFilteredLoComponentRule, getLORedirectKey } from '../../../../UpdatedSessions/utils'
import Button from '../../../components/Button/Button'
import { backToPageConst } from '../../../constants'
import { getCourseLanguage } from '../../../utils'
import { getEndDate } from './ClassroomDetails.helpers'
import styles from './classroomDetails.module.scss'
import { Heading } from './UpcomingTopicCard'

const CompletedSessionCard = (props) => {
    const [loadingClassContent, setLoadingClassContent] = useState(false)
    const [loadingHomeworkContent, setLoadingHomeworkContent] = useState(false)

    const { classType,session } = props
    const sessionStatus=get(session,'sessionStatus') //expected value='completed'

    const isHomeworkExists = get(session, 'topicData.topicComponentRule', []).find(rule => get(rule, 'componentName') === 'quiz' || get(rule, 'componentName') === 'homeworkAssignment' || get(rule, 'componentName') === 'homeworkPractice')

    const getRedirectionLink = ({ isRevisit = true, isViewingContent = true, openInNewTab = true, homework = false, batchId, courseId, topicId, sessionId, defaultLoComponentRule, codingLanguage }) => {
        let redirectURL
        let topicComponentRule = get(session, 'topicData.topicComponentRule', []);

        const sortedTopicComponentRule = [...(topicComponentRule || [])].sort((a, b) => get(a, 'order') - get(b, 'order'))

        const filteredSortedTopicComponentRule = sortedTopicComponentRule.filter(rule => rule.componentName === 'quiz' || rule.componentName === 'homeworkAssignment' || rule.componentName === 'homeworkPractice')

        const firstHomeworkComponent = filteredSortedTopicComponentRule[0]

        const firstComponent = sortedTopicComponentRule[0]
        const backToPage = backToPageConst.report
        if (homework && ((firstHomeworkComponent && firstHomeworkComponent.componentName === 'quiz') || (firstHomeworkComponent && firstHomeworkComponent.componentName === 'homeworkAssignment'))) {
            redirectURL = getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentName: get(firstHomeworkComponent, 'componentName'), sessionId, documentType:'batchSession', isRevisit, backToPage, codingLanguage })

        } else if (homework && firstHomeworkComponent && firstHomeworkComponent.componentName === 'homeworkPractice') {
            redirectURL = getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentId: get(firstHomeworkComponent, 'blockBasedProject.id'), componentName: get(firstHomeworkComponent, 'componentName'), sessionId, documentType:'batchSession', isRevisit, backToPage, codingLanguage })

        } else if (firstComponent && firstComponent.componentName === 'blockBasedProject') {
            if (isViewingContent) {
                window.open(getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentId: get(firstComponent, 'blockBasedProject.id'), componentName: get(firstComponent, 'componentName'), sessionId, documentType: 'batchSession', isRevisit,sessionStatus, backToPage, codingLanguage }), '_self')

                return
            }
            redirectURL = getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentId: get(firstComponent, 'blockBasedProject.id'), componentName: get(firstComponent, 'componentName'), sessionId, documentType: 'batchSession', isRevisit, backToPage, codingLanguage })
        } else if (firstComponent && firstComponent.componentName === 'video') {
            if (isViewingContent) {
                window.open(getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentId: get(firstComponent, 'video.id'), componentName: get(firstComponent, 'componentName'), sessionId, documentType: 'batchSession', isRevisit,sessionStatus, backToPage, codingLanguage }), '_self')
                return
            }
            redirectURL = getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentId: get(firstComponent, 'video.id'), componentName: get(firstComponent, 'componentName'), sessionId, documentType: 'batchSession', isRevisit, backToPage, codingLanguage })


        } else if (firstComponent && firstComponent.componentName === 'blockBasedPractice') {
            if (isViewingContent) {
                window.open(getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentId: get(firstComponent, 'blockBasedProject.id'), componentName: get(firstComponent, 'componentName'), sessionId, documentType: 'batchSession', isRevisit,sessionStatus, backToPage, codingLanguage }), '_self')
                return
            }
            redirectURL = getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentId: get(firstComponent, 'blockBasedProject.id'), componentName: get(firstComponent, 'componentName'), sessionId, documentType: 'batchSession', isRevisit, backToPage, codingLanguage })

        } else if (firstComponent && firstComponent.componentName === 'assignment') {
            if (isViewingContent) {
                window.open(getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentName: get(firstComponent, 'componentName'), sessionId, documentType: 'batchSession', isRevisit,sessionStatus, backToPage, codingLanguage }), '_self')
                return
            }
            redirectURL = getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentName: get(firstComponent, 'componentName'), sessionId, documentType: 'batchSession', isRevisit, backToPage, codingLanguage })

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
                            window.open(getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentId: get(firstComponent, 'learningObjective.id'), componentName: LoRedirectKey, isLoComponent: 'true', sessionId, documentType: 'batchSession', isRevisit,sessionStatus, backToPage, codingLanguage }), '_self')
                            return
                        }
                        redirectURL = getStudentAppRoute({ route: 'session-embed', courseId, topicId, batchId, componentId: get(firstComponent, 'learningObjective.id'), componentName: LoRedirectKey, isLoComponent: 'true', sessionId, documentType: 'batchSession', isRevisit, backToPage, codingLanguage })
                    }
                }
            }
        }
        if (openInNewTab) {
            window.open(redirectURL, "_self", "noreferrer");
        } else {
            window.location.replace(redirectURL);
        }
    }
    const reviewContent = async () => {
        try {
            setLoadingClassContent(true)
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
              setLoadingClassContent(false)
            if (get(res, 'data.batchSession')) {
                const idCollection = get(res, 'data.batchSession')
                const codingLanguage = getCourseLanguage(get(idCollection, 'courseData'))
                getRedirectionLink({ isRevisit: true, isViewingContent: true, openInNewTab: false, homework: false, batchId: get(idCollection, 'batchData.id'), courseId: get(idCollection, 'courseData.id'), topicId: get(idCollection, 'topicData.id'), sessionId: get(session, 'id'), defaultLoComponentRule: get(idCollection, 'courseData.defaultLoComponentRule'), codingLanguage })
            }
        } catch (err) {
            console.log(err)
            setLoadingClassContent(false)
        }
    }
    const viewHomework=async()=>{
        try{
            setLoadingHomeworkContent(true)
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
                setLoadingHomeworkContent(false)
            if (get(res, 'data.batchSession')) {
                const idCollection = get(res, 'data.batchSession')
                const codingLanguage = getCourseLanguage(get(idCollection, 'courseData'))
                getRedirectionLink({ isRevisit: false, isViewingContent: false, openInNewTab: true, homework: true, batchId: get(idCollection, 'batchData.id'), courseId: get(idCollection, 'courseData.id'), topicId: get(idCollection, 'topicData.id'), sessionId: get(session, 'id'), defaultLoComponentRule: get(idCollection, 'courseData.defaultLoComponentRule'), codingLanguage })
            }   
        }catch(error){
            setLoadingHomeworkContent(false)
            console.log(error)
        }
    }
    return <div style={{ minHeight: '300px' }} className={styles.completedTopicCardContainer}>
        <Heading title={get(session,'topicData.title')} order={props.order} thumbnail={getPath(get(session,'topicData.thumbnailSmall.uri'))} />
        <div className={styles.completedCardBody}>
            <div className={styles.completedCardBodyContent}>
                <CheckmarkCircle color='#01AA93' />
                <p>Class Completed on {getEndDate(get(session,'sessionEndDate'))}</p>
            </div>
        </div>
        <div className={styles.completedCardFooter}>
            {classType==='lab' && <div>
                <div className={isHomeworkExists && styles.completedCardFooterBtn}>
                    <Button isLoading={loadingClassContent} onBtnClick={reviewContent} type={'secondary'} text={'Revisit Class Content'} leftIcon widthFull btnPadding={hsFor1280(12)}>
                        <RightArrow color='#8C61CB' height='16' width='16' />
                    </Button>
                </div>
                {isHomeworkExists && <div>
                    <Button isLoading={loadingHomeworkContent} onBtnClick={viewHomework} type={'primary'} text={'View homework'} leftIcon widthFull btnPadding={hsFor1280(12)}>
                        <RightArrow color='white' height='16' width='16' />
                    </Button>
                </div>}
            </div>}
            {classType==='theory' && <div className={styles.completedCardTheoryFooter}>
                <p>Refer to the textbook for details.</p>
            </div>}
        </div>
    </div>
}

export default CompletedSessionCard