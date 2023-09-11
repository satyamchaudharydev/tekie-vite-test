import { getDataFromLocalStorage } from "../../utils/data-utils";

const fetchBatchSessionSubscription = () => {
    const activeClassroomId = getDataFromLocalStorage("activeClassroom")
    let batchSessionSubscriptionConfig = {};
    if (activeClassroomId) {
        batchSessionSubscriptionConfig = {
            query: `subscription {
                batchSession(
                    filter: {
                    and: [
                        { batch_some: { id: "${activeClassroomId}" } }
                        { logoutAllStudents: true }
                    ]
                    }
                ) {
                    mutation
                    data {
                        id
                        sessionStatus
                        logoutAllStudents
                        retakeSessions(
                            filter: { sessionStatus: completed }
                            first: 1
                            orderBy: createdAt_DESC
                        ) {
                            id
                        }
                    }
                }
                }
                `,
            key: 'batchSessions/subscription',
            schemaName: 'batchSession',
        }
    }
    return batchSessionSubscriptionConfig
}

export default fetchBatchSessionSubscription;
