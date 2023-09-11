import gql from 'graphql-tag'
import duck from '../../duck'
import { getSlotNames } from '../../utils/slots/slot-names'

const fetchBatchSessions = (
    filter,
    first = 40,
    skip = 0,
    key,
    orderBy = 'bookingDate_DESC'
) => {
    const filterQuery = `
        ${filter}
        {
            batch_some: {
                type: b2b
            }
        }
    `
    return duck.createQuery({
        query: gql`
    {
        schoolSessions: batchSessions(
            filter: {
                and: [
                    ${filterQuery}
                ]
            },
            orderBy: ${orderBy},
            first: ${first},
            skip: ${skip * first}
        ){
            id
            sessionStartDate
            sessionEndDate
            isRetakeSession
            mentorSession{
                user{
                    id
                    name
                }
            }
            batch{
                school {
                    name
                    id
                    classes {
                        grade
                        section
                    }
                }
                code
                course{
                    id
                    title
                    chapters{
                        order
                        topics (filter: { status: published }){
                            id
                            status
                            order
                            title
                        }
                        topicsMeta(filter:{status:published}){
                            count
                        }
                    }
                }
                studentsMeta{
                    count
                }
                allottedMentor{
                    name
                    profilePic{
                        id
                        uri
                        name
                    }
                }
                course{
                    title
                }
                classes{
                    grade
                    section
                }
                timeTableRule{
                    startDate
                    endDate
                    sunday
                    monday
                    tuesday
                    wednesday
                    thursday
                    friday
                    saturday
                    ${getSlotNames()}
                }
                currentComponent{
                    currentCourse {
                        order
                    }
                    currentTopic{
                        id
                        order
                    }
                    latestSessionStatus
                }
            }
            topic{
                title
                order
                thumbnailSmall{
                    id
                    uri
                    name
                }
            }
            bookingDate
            ${getSlotNames()}
        }
        adhocSessions(
            filter: {
                and: [
                    ${filterQuery}
                ]
            },
            orderBy: ${orderBy},
            first: ${first},
            skip: ${skip * first}
        ){
            id
            sessionStartDate
            sessionEndDate
            sessionStatus
            mentorSession{
                user{
                    id
                    name
                }
            }
            batch{
                school {
                    name
                    id
                    classes {
                        grade
                        section
                    }
                }
                code
                course{
                    id
                    title
                    chapters{
                        order
                        topics (filter: { status: published }){
                            id
                            status
                            order
                            title
                        }
                        topicsMeta(filter:{status:published}){
                            count
                        }
                    }
                }
                studentsMeta{
                    count
                }
                allottedMentor{
                    name
                    profilePic{
                        id
                        uri
                        name
                    }
                }
                course{
                    title
                }
                classes{
                    grade
                    section
                }
                timeTableRule{
                    startDate
                    endDate
                    sunday
                    monday
                    tuesday
                    wednesday
                    thursday
                    friday
                    saturday
                    ${getSlotNames()}
                }
                currentComponent{
                    currentCourse {
                        order
                    }
                    currentTopic{
                        id
                        order
                    }
                    latestSessionStatus
                }
            }
            previousTopic{
                title
                order
                thumbnailSmall{
                    id
                    uri
                    name
                }
            }
            type
            bookingDate
            ${getSlotNames()}
        }
    }
    `,
        key: key || 'fetchSchoolSessions',
        type: 'schoolSessions/fetch',
        changeExtractedData: (extractedData, originalData) => {
            if (originalData && originalData.schoolSessions.length
                && originalData.adhocSessions.length) {
                return {
                    ...extractedData,
                    schoolSessions: originalData.schoolSessions,
                    adhocSessions: originalData.adhocSessions
                }
            } else if (originalData && originalData.schoolSessions.length) {
                return {
                    ...extractedData,
                    schoolSessions: originalData.schoolSessions
                }
            } else if (originalData && originalData.adhocSessions.length) {
                return {
                    ...extractedData,
                    adhocSessions: originalData.adhocSessions
                }
            } else {
                return {
                    ...extractedData,
                    schoolSessions: []
                }
            }
        },
    });
}

export default fetchBatchSessions
