import gql from 'graphql-tag'
import duck from '../../duck'

const fetchApprovedCodeReactionLogs = (
    reactedBy,
    userApprovedCodeId = null) => {
  let filterQuery = `{ reactedBy_some: { id: "${reactedBy}" } }`
  if (userApprovedCodeId) {
    filterQuery += `{ userApprovedCode_some: { id_in: ["${userApprovedCodeId}"] } }`
  }
  return duck.createQuery({
    query: gql`
      {
        userApprovedCodeReactionLogs(
          filter: {
            and: [
              ${filterQuery}
            ]
          }
        ) {
          id
          hot
          heart
          celebrate
          userApprovedCode {
              id
          }
        }
      }
    `,
    key: "fetchApprovedCodeReactionLogs",
    type: "approvedCodeReactionLogs/fetch",
  });
}

export default fetchApprovedCodeReactionLogs
