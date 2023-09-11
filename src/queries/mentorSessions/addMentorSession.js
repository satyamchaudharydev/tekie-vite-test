import gql from "graphql-tag";
import duck from "../../duck";


const addMentorSession = async (userId, courseId, input = {}) => {
  return duck.query({
    query: gql`mutation ($input: MentorSessionInput!) {
    addMentorSession(input: $input,
        userConnectId: "${userId}",
        ${courseId ? `courseConnectId: "${courseId}"` : ''}
    ) {
        id
    }
    }
    `,
    variables: {
      input
    },
    type: "mentorSessions/add",
    key: "mentorSessions",
  });
};

export default addMentorSession;
