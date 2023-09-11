import gql from "graphql-tag"
import duck from "../../duck"


const updateUserAssignment=({assignmentId,input, fromStudentApp = false, updateOne = false})=>{
    return duck.createQuery({
        query:gql`
        mutation($input: UserAssignmentUpdate) {
            updateUserAssignment(
                id: "${assignmentId}"
                input:$input
            ) {
                id
                user{
                  id
                  name
                  ${fromStudentApp ? '' : `studentProfile {
                    rollNo
                  }`}
                }
                assignmentStatus
                assignment {
                    assignmentQuestion {
                        id
                        isHomework
                        hints {
                          hintPretext
                          hint
                        }
                        statement
                        answerCodeSnippet
                        editorMode
                      }
                      assignmentQuestionDisplayOrder
                      userAnswerCodeSnippet
                      isAttempted
                    evaluation {
                        id
                        star
                        comment
                        tags {
                            category
                            name
                            id
                            minStar
                            maxStar
                        }
                    }
                }
            }
        }
        `,
        variables : {
            input: updateOne ? input : { assignment: { replace: input } }
          },
          type: 'userAssignment/update',
          key: 'userAssignment',
    })
}

export default updateUserAssignment