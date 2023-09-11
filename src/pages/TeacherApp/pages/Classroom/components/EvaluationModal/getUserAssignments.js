import gql from 'graphql-tag'
import duck from '../../../../../../duck/duckIfCacheExists'
import getIdArrForQuery from '../../../../../../utils/getIdArrForQuery'


const getUserAssignments = (userIds, topicId,tokenType) =>
    {
        return duck.createQuery({
        query: gql`
          query {
            userAssignments(filter:{
            and: [
              {user_some: {id_in:[${getIdArrForQuery(userIds)}]}}
              {topic_some:{id: "${topicId}"}}
            ]
            }) {
                id
                assignment{
                  assignmentQuestion{
                    id
                  }
                  userAnswerCodeSnippet
                }
            }
          }
        `,
            type: 'userAssignment/fetch',
            key: topicId,
            // variables: {
            //     tokenType
            // }
    })}

export default getUserAssignments
