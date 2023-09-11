import gql from "graphql-tag"
import duck from "../../duck"


const addUserAssignment=({input,userId,topicId,courseId})=>{
    return duck.createQuery({
        query: gql`
        mutation ($input: UserAssignmentInput!){
          addUserAssignment(
            input: $input,
            userConnectId: "${userId}",
           topicConnectId:"${topicId}",
           courseConnectId:"${courseId}",
            ) {
            id
            user{
              id
              name
            }
            assignmentStatus
            assignment{
              assignmentQuestion{
                id
              }
              assignmentQuestionDisplayOrder
              isAttempted
              userAnswerCodeSnippet
            }
          }
        }
      `,
      variables : {
        input:{
          assignment:input
        }
      },
      type: 'addUserAssignment/add',
      key: 'addUserAssignment',
    })
}

export default addUserAssignment