import { get } from "lodash"
import { HOMEWORK_COMPONENTS } from "../../constants/topicComponentConstants"
import { getDataFromLocalStorage, removeDataFromLocalStorage } from "../data-utils"

export const getBaseRedirectRoute = ({ batchId, backToPage }) => {
    let baseRoute = `/teacher/classrooms`
    if (batchId) {
        baseRoute = `/${backToPage}/${batchId}`;
    }
    return baseRoute
}

const goBackToTeacherApp = (event) => {
    const sessionDetails = getDataFromLocalStorage("classroomSessionsData")
    const activeClassroom = getDataFromLocalStorage('activeClassroom')
    const currentSessionId = getDataFromLocalStorage('currentSessionId')
    if (activeClassroom) {
        removeDataFromLocalStorage('activeClassroom')
    }
    if (currentSessionId) {
        removeDataFromLocalStorage('currentSessionId')
    }
    const batchId = get(sessionDetails, 'batchId')
    const componentName = get(sessionDetails, 'componentName')
    const isRevisit = get(sessionDetails, 'isRevisit', false)
    const backToPage = get(sessionDetails, 'backToPage')
    const isRevisitingSession = ['true', 'True', true].includes(isRevisit)
    if (!event) {
        event = isRevisitingSession ? 'backToSession' : 'endSession'
    }
    const baseRedirectRoute = getBaseRedirectRoute({ batchId, backToPage })
    const isViewingHomework = componentName && [...HOMEWORK_COMPONENTS].includes(componentName)
    if(event === 'backToSession'){
        window.location.replace(baseRedirectRoute)
    } else if (event === 'endSession') {
        if (!isRevisitingSession && !isViewingHomework) {
            localStorage.setItem('shouldEndClass', true)
        } else {
            localStorage.setItem('shouldEndClass', true)
        }
    } else if (event === 'backToTraining') {
        window.location.replace(baseRedirectRoute)
    }
}

export default goBackToTeacherApp