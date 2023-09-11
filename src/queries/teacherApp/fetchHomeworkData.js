import gql from 'graphql-tag'
import duck from '../../duck'
import {get} from "lodash"


const getHomework = async (idTopic,array) => {

  let arr=[]

  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    arr.push(`"${get(element,"user.id","")}"`)
  }
    return duck.query({
        query: gql`
        {
          homeworkStudentsData: mentorMenteeSessions(filter:{
            and: [
              {
                topic_some: {
                  id:"${idTopic}"
                }
              },
              {
               menteeSession_some:{
                  user_some:{
                    id_in: [${arr}]
                  }
                }
              }
            ]
          }) {
            id
            isQuizSubmitted
            isAssignmentSubmitted
            isPracticeSubmitted
            isSubmittedForReview
          homeworkStudentsName:  menteeSession {
              user {
                id
                name
              }
            }
           homeworkStudentsTopic: topic {
              id
              title
              topicComponentRule{
                componentName
                }
            }
          }
        }
    `,
        type: 'homeworkStudentsData/fetch',
        key: 'homeworkStudentsData'
    })
}
export default getHomework