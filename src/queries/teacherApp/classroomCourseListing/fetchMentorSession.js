import gql from "graphql-tag";
import duck from "../../../duck";
import { getSlotNames } from "../../../utils/slots/slot-names";


const fetchMentorSession = async (availabilityDate, mentorId, fetchCount) => {
  return duck.query({
    query: gql`{
        mentorSessions(
            filter: { and: [${availabilityDate ? `{ availabilityDate: "${availabilityDate}" }` : ''}, { user_some: { id: "${mentorId}" } }] },
            ${fetchCount ? `first: ${fetchCount}` : ''}
        ) {
            id
            ${getSlotNames()}
        }
        }
    `,
    type: "mentorSession/fetch",
    key: "mentorSession",
  });
};

export default fetchMentorSession;
