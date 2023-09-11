import gql from 'graphql-tag'
import duck from '../../duck'
import { getSlotNames } from '../../utils/slots/slot-names'

const fetchBatches = (
    filter,
    first = 40,
    skip = 0,
    key
) => {
    const filterQuery = `
        ${filter}
        {type: b2b}
    `
  return duck.createQuery({
    query: gql`
    {
        totalBatches: batchesMeta(filter: {and: [
            ${filterQuery}
        ]}) {
            count
        }
        schoolBatches: batches(
            filter: {
                and: [
                    ${filterQuery}
                ]
            },
            orderBy: createdAt_ASC,
            first: ${first},
            skip: ${skip * first}
        ){
            id
            code
            students {
                section
                grade
                userData: user {
                    id
                    name
                    profilePic {
                    uri
                    }
                }
            }
            studentsMeta{
                count
            }
            classes {
                id
                grade
                section
                studentsMeta {
                    count
                }
            }
            allottedMentor{
                id
                name
                profilePic{
                    id
                    uri
                    name
                }
            }
            course{
                id
                title
                thumbnail {
                    uri
                    name
                }
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
            shouldShowEbook
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
    }
    `,
    type: "schoolBatches/fetch",
    key: key || "fetchSchoolBatches",
    changeExtractedData: (extractedData, originalData) => {
        if (originalData && originalData.schoolBatches.length) {
            return {
                ...extractedData,
                schoolBatches: originalData.schoolBatches
            }
        } else {
            return {
                ...extractedData,
                schoolBatches: []
            }
        }
    },
  });
}

export default fetchBatches
