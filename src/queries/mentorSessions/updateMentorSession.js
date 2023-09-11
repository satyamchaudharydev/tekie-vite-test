import gql from "graphql-tag";
import duck from "../../duck";


const updateMentorSession = async (mentorSessionId, courseId, input = {}) => {
  return duck.query({
    query: gql`mutation($input: MentorSessionUpdate){
  updateMentorSession(
    id:"${mentorSessionId}",
    ${courseId ? `courseConnectId: "${courseId}"` : ''}
    input:$input
  ){
    id
  }
}
    `,
    variables: {
      input
    },
    type: "mentorSessions/update",
    key: "mentorSessions",
  });
};

export default updateMentorSession;
