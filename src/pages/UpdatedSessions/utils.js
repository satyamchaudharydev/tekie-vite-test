import { get } from "lodash"
import { Map } from 'immutable'
import { loComponentNameToRouteAlias, learningObjectiveComponents } from "../../config"
import { HOMEWORK_COMPONENTS, TOPIC_COMPONENTS } from "../../constants/topicComponentConstants"
import { sort } from "../../utils/immutable"
import store from "../../store"
import { STUDENT_BASE_URL } from "../../constants/routes/routesPaths"

const { message, comicStrip, practiceQuestion, chatbot, learningSlide } = learningObjectiveComponents
const { blockBasedPractice, blockBasedProject, learningObjective, assignment, homeworkAssignment, quiz, video, homeworkPractice } = TOPIC_COMPONENTS

export const getFilteredLoWithOnlyOnePQ = ({ loComponentRule = [], learningObjective }) => {
    let newLoComponentRule = [...loComponentRule]
    const loComponents = newLoComponentRule.map(component => get(component, 'componentName'))
    let isChatbotExist = false
    let isLearningSlideWithPqExist = false
    let isPqExist = false
    if (loComponents.includes(chatbot) &&
        (get(learningObjective, 'practiceQuestionChatbotMeta.count', 0) > 0)) {
        isChatbotExist = true
    }
    if (loComponents.includes(learningSlide) &&
        (get(learningObjective, 'practiceQuestionLearningSlidesMeta.count', 0) > 0)) {
        isLearningSlideWithPqExist = true
    }
    if (loComponents.includes(practiceQuestion)) {
        isPqExist = true
    }
    if (isLearningSlideWithPqExist && (isChatbotExist || isPqExist)) {
        // Get lo component having learningSlide with pq
        newLoComponentRule = newLoComponentRule.filter(component => ![chatbot, practiceQuestion].includes(get(component, 'componentName')))
    } else if (isChatbotExist && isPqExist) {
        // Get lo component having only chatbot
        newLoComponentRule = newLoComponentRule.filter(component => ![practiceQuestion].includes(get(component, 'componentName')))
    }
    return newLoComponentRule
}

export const checkForComponentsInLo = (componentRule, learningObjective) => {
    let componentExists = false
    switch (get(componentRule, 'componentName')) {
        case learningSlide:
            if ((get(learningObjective, 'learningSlidesMeta.count', 0) > 0)) {
                componentExists = true
            }
            break;
        case comicStrip:
            if (get(learningObjective, 'comicStripsMeta.count', 0) > 0) {
                componentExists = true
            }
            break;
        case practiceQuestion:
            if (get(learningObjective, 'questionBankMeta.count', 0) > 0) {
                componentExists = true
            }
            break;
        case message:
            if (get(learningObjective, 'messagesMeta.count', 0) > 0) {
                componentExists = true
            }
            break;
        case chatbot:
            if ((get(learningObjective, 'messagesMeta.count', 0) > 0)) {
                componentExists = true
            }
            break;
        default:
            componentExists = false
    }
    return componentExists
  }

export const getFilteredLoComponentRule = (learningObjective, courseLoComponentRule, topicLoComponentRule) => {
    if (topicLoComponentRule && topicLoComponentRule.length && learningObjective) {
        let newLoComponentRule = topicLoComponentRule.sort((a, b) => {
            return get(a, 'order') - get(b, 'order')
        }).filter((componentRule) => checkForComponentsInLo(componentRule, learningObjective))
        newLoComponentRule = getFilteredLoWithOnlyOnePQ({ loComponentRule: newLoComponentRule, learningObjective })
        return newLoComponentRule
    }
    if (courseLoComponentRule && courseLoComponentRule.length && learningObjective) {
        let newLoComponentRule = courseLoComponentRule.sort((a, b) => {
            return get(a, 'order') - get(b, 'order')
        }).filter((componentRule) => checkForComponentsInLo(componentRule, learningObjective))
        newLoComponentRule = getFilteredLoWithOnlyOnePQ({ loComponentRule: newLoComponentRule, learningObjective })
        return newLoComponentRule
    }
    return []
}

export const getLORedirectKey = (loComponentRule) => {
    const componentName = get(loComponentRule, 'componentName', null) || 'comicStrip'
    return loComponentNameToRouteAlias[componentName]
}

export const filterTopicComponentRule = (topicComponentRule = [], filterType = '') => {
    topicComponentRule = topicComponentRule.sort((firstComponent, secondComponent) => get(firstComponent, 'order') - get(secondComponent, 'order'))
    if (filterType === 'homework') {
        return topicComponentRule.filter(component => HOMEWORK_COMPONENTS.includes(get(component, 'componentName')))
    }
    return topicComponentRule.filter(component => !HOMEWORK_COMPONENTS.includes(get(component, 'componentName')))
}

export const getNextLoComponentRoute = ({
    forceRevisitRoute = false,
    course,
    learningObjective,
    learningObjectiveId,
    topicComponentRule,
    courseId,
    topicId,
    childComponentsName = [] }) => {
    let revisitRoute = ''
    if (forceRevisitRoute) {
        revisitRoute = '/revisit'
    } else if (!forceRevisitRoute && window && get(window, "location.pathname", "").includes('/revisit')) {
        revisitRoute = '/revisit'
    }
    const sortedLoComponentRule = course && sort.ascend(course.getIn(['defaultLoComponentRule'], Map([])), ['order']).toJS()
    let filteredLo = learningObjective && learningObjective.toJS().filter(lo => lo.id === learningObjectiveId)
    let filteredLoComponentRule = getFilteredLoComponentRule(filteredLo[0], sortedLoComponentRule, (get(topicComponentRule, 'learningObjectiveComponentsRule', []) || []))
    let redirectUrl = ''
    if (filteredLoComponentRule && filteredLoComponentRule.length) {
        const currentLoComponentIndex = filteredLoComponentRule.findIndex(componentRule => childComponentsName.includes(get(componentRule, 'componentName')))
        const nextLoComponent = filteredLoComponentRule[currentLoComponentIndex + 1]
        if (nextLoComponent && Object.keys(nextLoComponent).length) {
            redirectUrl = `${revisitRoute}/sessions/${getLORedirectKey(nextLoComponent)}/${courseId}/${topicId}/${learningObjectiveId}`
        }
    }
    return redirectUrl
}

export const getInSessionRoute = ({
    topicComponentRule = [],
    course,
    topicId,
    goToNextComponent = false,
    learningObjectives,
    forceRevisitRoute = false }) => {
    let revisitRoute = ''
    if (forceRevisitRoute) {
        revisitRoute = '/revisit'
    } else if (!forceRevisitRoute && window && get(window, "location.pathname", "").includes('/revisit')) {
        revisitRoute = '/revisit'
    }
    let componentRule = null
    if (topicComponentRule && Array.isArray(topicComponentRule) && !goToNextComponent) {
        const filteredTopicComponentRule = filterTopicComponentRule(topicComponentRule)
        componentRule = get(filteredTopicComponentRule, '[0]', null)
    } else if (topicComponentRule && goToNextComponent) {
        componentRule = topicComponentRule
    }
    const componentName = get(componentRule, 'componentName');
    const courseId = get(course, 'id')
    let childComponentName = comicStrip
    let componentId = get(componentRule, 'learningObjective.id')
    let redirectUrl = ''
    if (!componentRule) return {
        firstComponentName: componentName,
        childComponentName,
        componentId,
        redirectUrl
    }
    switch (componentName) {
        case blockBasedProject:
            componentId = get(componentRule, 'blockBasedProject.id')
            redirectUrl = `${STUDENT_BASE_URL}${revisitRoute}/sessions/project/${courseId}/${topicId}/${componentId}`
            break;
         case blockBasedPractice:
            componentId = get(componentRule, 'blockBasedProject.id')
            redirectUrl = `${STUDENT_BASE_URL}${revisitRoute}/sessions/practice/${courseId}/${topicId}/${componentId}`
            break;
         case learningObjective:
            if (get(course, 'defaultLoComponentRule') && get(course, 'defaultLoComponentRule').length) {
                const sortedDefaultLoCompRule = get(course, 'defaultLoComponentRule').sort((a, b) => get(a, 'order') - get(b, 'order'))
                let learningObjectiveObj = {}
                if (goToNextComponent) {
                    const sortedLo = learningObjectives && sort.ascend(learningObjectives, ['order'])
                    const filteredLo = sortedLo && sortedLo.toJS().filter(lo => lo.id === get(componentRule, 'learningObjective.id'))
                    learningObjectiveObj = (filteredLo && filteredLo.length) ? filteredLo[0] : get(componentRule, 'learningObjective', null)
                } else {
                    learningObjectiveObj = get(componentRule, 'learningObjective', null)
                }
                const filteredLoComponentRule = getFilteredLoComponentRule(learningObjectiveObj, sortedDefaultLoCompRule, (get(componentRule, 'learningObjectiveComponentsRule', []) || []))

                if (filteredLoComponentRule && filteredLoComponentRule.length) {
                    childComponentName = get(filteredLoComponentRule[0], 'componentName', null)
                    componentId = get(componentRule, 'learningObjective.id')
                    redirectUrl = `${STUDENT_BASE_URL}${revisitRoute}/sessions/${getLORedirectKey(filteredLoComponentRule[0])}/${courseId}/${topicId}/${componentId}`
                }
            }
            break;
         case video:
            if (get(componentRule, 'video.id')) {
                componentId = get(componentRule, 'video.id')
                redirectUrl = `${STUDENT_BASE_URL}${revisitRoute}/sessions/video/${courseId}/${topicId}/${componentId}`
            } else {
                redirectUrl = `${STUDENT_BASE_URL}${revisitRoute}/sessions/video/${courseId}/${topicId}`
            }
            break;
         case assignment:
            redirectUrl = `${STUDENT_BASE_URL}${revisitRoute}/sessions/coding/${courseId}/${topicId}`
            break;
        default:
            redirectUrl = `${STUDENT_BASE_URL}${revisitRoute}/sessions/video/${courseId}/${topicId}`
            break;
    }
    return {
        firstComponentName: componentName,
        childComponentName,
        componentId,
        redirectUrl
    }
}

export const getHomeworkRoute = ({ topicComponentRule = [], course, topicId, showReportIfExist = false }) => {
    const filteredTopicComponentRule = filterTopicComponentRule(topicComponentRule, 'homework')
    const courseId = get(course, 'id')
    const firstComponentName = get(filteredTopicComponentRule, '[0].componentName', null)
    let redirectUrl = ''
    if (!firstComponentName) redirectUrl = ''
    // if (showReportIfExist) {
    //     redirectUrl = `/sessions/quiz-report-latest/${courseId}/${topicId}`
    //     return redirectUrl
    // }
    switch (firstComponentName) {
        case quiz:
            redirectUrl = `/sessions/${courseId}/${topicId}/quiz`
            break;
        case homeworkAssignment:
            redirectUrl = `/sessions/${courseId}/${topicId}/codingAssignment`
            break;
        case homeworkPractice:
            // Verify if here we require blockBasedProjectId of prevSessionComponentRule
            redirectUrl = `/sessions/${courseId}/${topicId}/${get(filteredTopicComponentRule, '[0].blockBasedProject.id')}/practice`
            break;
        default:
            break;
    }
    return redirectUrl
}

export const getLoComponentMapping = (LoRedirectKey, LoId, LoTitle) => {
    let componentDetail = {}
    switch (LoRedirectKey) {
        case 'comic-strip':
            componentDetail = {
                title: 'Comic Strips',
                id: LoId
            }
            break
        case 'learning-slides':
            componentDetail = {
                title: 'Learning Slides',
                id: LoId
            }
            break
        case 'practice-quiz':
            componentDetail = {
                title: 'Practice Quiz',
                id: LoId
            }
            break
        case 'chat':
            componentDetail = {
                title: 'Chat',
                id: LoId
            }
            break
        default:
            componentDetail = { title: `${LoTitle}`, id: LoId }
            break
    }
    return componentDetail
}

export const getFirstComponentFromLocalStorage = () => {
    if (window && window.location.pathname.includes('/sessions')) {
        const firstComponent = localStorage.getItem('firstComponent')
        if (firstComponent && firstComponent !== 'undefined') {
            return JSON.parse(firstComponent)
        }
    }
    return null
}

export const getPreviousTopicIdFromLocalStorage = () => {
    if (window && window.location.pathname.includes('/sessions')) {
        return localStorage.getItem('previousTopicId')
    }
    return null
}

export const getAllSessions = () => {
    const menteeCourseSyllabus = store.getState().data.getIn(['menteeCourseSyllabus', 'data'])
    const menteeCourseSyllabusData = (menteeCourseSyllabus && menteeCourseSyllabus.toJS()[0]) || null
    
    if (menteeCourseSyllabusData) {
        const allSessions = [...(menteeCourseSyllabusData.upComingSession || []), ...(menteeCourseSyllabusData.bookedSession || []), ...(menteeCourseSyllabusData.completedSession || [])]
        return allSessions
    }
    return []
}

export const getThisSession = (topicId) => getAllSessions().find(session => session.topicId === topicId)

export default { getFilteredLoComponentRule, getLORedirectKey }