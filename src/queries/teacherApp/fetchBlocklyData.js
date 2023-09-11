import gql from "graphql-tag";
import duck from "../../duck";

const fetchBlocklyData = async (batch, course, topic) => {
  return duck.query({
    query: gql`
      {
        fetchBlocklyQuestion: blockBasedProjects(
          filter: {
            and: [
              { topics_some: { id: "${topic}" } }
              { courses_some: { id: "${course}" } }
              { isHomework: true }
              { type: practice }
            ]
          }
        ) {
          id
          title
          order
          projectDescription
          externalPlatformLink
          externalPlatformLogo {
            id
            name
            uri
          }
        }
      }
    `,
    type: "fetchBlocklyQuestion/fetch",
    key: "fetchBlocklyQuestion",
  });
};
export default fetchBlocklyData;
