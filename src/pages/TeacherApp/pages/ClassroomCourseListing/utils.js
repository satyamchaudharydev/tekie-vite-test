import { get } from "lodash"
import getStudentAppRoute from "../../../../utils/teacherApp/getRoute"
import { backToPageConst } from "../../constants"

export const filterSessionType = (sessionType, sessions) => {
    return sessions.filter((session) => get(session,'topic.classType', '') === sessionType)

}
export const mappedTooltipTypeWithCount = {
    'teacherManual': 'teacherManualTooltipCount',
    'theory': 'theoryClassroomTooltipCount',
    'sessionTab': 'sessionTabTooltipCount',
}
export const sessionType = [
    {
        label: 'Lab Session',
        value: 'lab'
    },
    {
        label: 'Theory Session',
        value: 'theory'
    }
]
export const getTooltipCount = (mentor,type) => {
    console.log({mentor})
    if(mentor){
        return mentor[mappedTooltipTypeWithCount[type]]
    }
}

export const redirectInClassroomPage = ({courseId,topicId,batchId,sessionId,componentId,backToPage}) => {
   const redirectURL = getStudentAppRoute({
        // route: 'session-embed',
        courseId,
        topicId,
        batchId,
        sessionId,
        componentName: 'video',
        backToPage,
        // title: "df",
        // classroomTitle: "D",
        componentId: componentId,
    })
    window.open(redirectURL, "_self");

}