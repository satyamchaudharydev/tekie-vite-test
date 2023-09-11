import { get } from "lodash"
import moment from "moment"
import duck from "../../duck"
import header from "../../utils/header"

const startBatchSession = (sessionId, fromClassroomCoursePage, retakeSessionId, user, attendanceArr) => {
    const headers = header(user)
    const inputObj = {
        sessionStartDate: new Date().toISOString(),
        sessionStatus: 'started',
    }
    if (retakeSessionId) {
        inputObj.isRetakeSession = true
        inputObj.logoutAllStudents = false
    } else {
        inputObj.startMinutes = moment().get('minutes')
    }
    const key = 'updateBatchSession'
    return duck.query({
        query: `/batchSession/update/${sessionId}`,
        options: {
            tokenType: "appTokenOnly",
            input: {},
            rest: true,
            method: "post",
            headers: headers,
            data: {
                input: inputObj,
                attendance: attendanceArr,
                mentorId: get(user, 'id')
            },
            apiType: key,
        },
        type: `${key}/update`,
        key: key,
    });
}

export default startBatchSession