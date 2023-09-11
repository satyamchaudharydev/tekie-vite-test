import { setDataInLocalStorage } from "../data-utils";
import getIframeUrl from "./getIframeUrl";
import switchToStudentApp from "./switchToStudentApp";

const getStudentAppRoute=({route,courseId,topicId,batchId,prevTopicId,componentId,componentName,isLoComponent,sessionId,documentType,isRevisit,fromHomeWorkPage, backToPage = 'Timetable',sessionStatus, codingLanguage, prevTopicOrder,title, classroomTitle,grade,section, sessionUrl = '', referenceContent })=>{
  const allParamsValues = {courseId,topicId,batchId,prevTopicId,componentId,componentName,isLoComponent,sessionId,documentType,isRevisit,fromHomeWorkPage, backToPage,sessionStatus, codingLanguage, prevTopicOrder,title,classroomTitle,grade,section, sessionUrl};
  const paramsKeys = Object.keys(allParamsValues);

    if (paramsKeys.length === 0) {
        return ''
    }
    let newSessionUrl = sessionUrl
    const classroomSessionsData = {
        prevTopicOrder,
        title,
        sessionStatus,
        backToPage,
        isRevisit,
        documentType,
        sessionId,
        batchId,
        prevTopicId,
        courseId,
        codingLanguage,
        topicId,
        componentId,
        componentName,
        classroomTitle,
        grade,
        section,
        referenceContent
    }
    if (!newSessionUrl) {
        newSessionUrl = getIframeUrl({
            isRevisit, isLoComponent, componentName, componentId,
            courseId, topicId
        })
    }
    if (batchId) {
        setDataInLocalStorage('activeClassroom', batchId)
    }
    if (topicId && sessionId && topicId !== sessionId) {
        setDataInLocalStorage('currentSessionId', sessionId)
    }
    if (newSessionUrl) {
        setDataInLocalStorage('classroomSessionsData', classroomSessionsData)
        switchToStudentApp(false)
        return newSessionUrl
    }
    return ''
}

export default getStudentAppRoute