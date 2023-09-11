import gql from "graphql-tag";
import duck from "../../duck";


const FETCH_SESSION_COMPONENT_TRACKER = async ({ batchConnectId }) => {
  return batchConnectId && duck.query({
    query: gql`{sessionComponentTrackers(filter: { batchSession_some: { id: "${batchConnectId}" } }) {
    id
    batchSession{
        id
    }
    video{
        componentId
        visited
        submitted
        user{
          id
          studentProfile{
            rollNo
          }
        }
    }
    learningObjective{
        componentId
        visited
        submitted
        user{
          id
          studentProfile{
            rollNo
          }
        }
    }
    practice{
        componentId
        visited
        submitted
        user{
          id
          studentProfile{
            rollNo
          }
        }
    }
    assignment: assignments{
        componentId
        visited
        submitted
        user{
          id
          studentProfile{
            rollNo
          }
        }
    }
    componentStatus{
        componentName
        componentStatus
    }
   }
 }
    `,
    type: "sessionComponentTrackers/fetch",
    key: `sessionComponentTrackers`,
  });
};

export default FETCH_SESSION_COMPONENT_TRACKER;
