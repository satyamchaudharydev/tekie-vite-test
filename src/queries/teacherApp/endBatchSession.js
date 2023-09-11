import duck from "../../duck"
import header from "../../utils/header"

const endBatchSession = async (sessionId, retakeSessionId, user, isEndingClassroomSession = false, attendance) => {
    const headers = header(user)
    const inputObj = {
        logoutAllStudents: 'true',
        sessionStatus: 'completed',
        sessionEndDate: new Date().toISOString(),
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
                endSession: true,
                attendance,
            },
            apiType: key,
        },
        type: `${key}/update`,
        key: key,
    });
}

export default endBatchSession