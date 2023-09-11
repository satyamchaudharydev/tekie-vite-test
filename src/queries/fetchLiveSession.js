import { get } from "lodash";
import moment from "moment";
import duck from "../duck";
import store from "../store";
import requestToGraphql from "../utils/requestToGraphql";
import { getSlotNames } from "../utils/slots/slot-names";
import topicComponentRuleQuery from "./topicComponentRuleQuery";

const fetchQuery = ({ batchId, code, sessionId }) => {
  const batchSessionQuery = `sessionStatus
        id
        bookingDate
        startMinutes
        endMinutes
        sessionStartedByMentorAt
        isRetakeSession
        ${getSlotNames()}
        topic{
          id
          ${topicComponentRuleQuery}
        }
        schoolSessionsOtp {
          otp
        }
        retakeSessions {
          id
          sessionStatus
          sessionStartDate
          sessionEndDate
        }
        course{
          id
          title
          defaultLoComponentRule {
            componentName
            order
          }
        }`
  if (sessionId) {
    return `{
      batchSession(id:"${sessionId}"){
        ${batchSessionQuery}
      }
    }`
  }
  if (batchId && code) {
    return `{
      batchSessions(filter:{and:[{batch_some:{id:"${batchId}"}}{schoolSessionsOtp_some:{otp:${code}}}]}orderBy:bookingDate_ASC, first: 1){
      ${batchSessionQuery}
    }
  }`
  } else if (batchId) {
    return `{
      batchSessions(filter:{and:[{batch_some:{id:"${batchId}"}}{bookingDate_gte:"${moment().startOf('day').toISOString()}"}]}
      orderBy:bookingDate_ASC, first: 1){
        ${batchSessionQuery}
      }
    }`
  }
}

const fetchLiveSession = async ({ batchId, code, sessionId }) => {
  try {
    let batchSessionData = get(get(store.getState(), 'data').toJS(), 'batchSessionData.data', null)
    if (get(batchSessionData, 'id')) return batchSessionData
    const result = await requestToGraphql(fetchQuery({ batchId, code, sessionId }))
    if (sessionId) {
      batchSessionData = get(result, 'data.batchSession')
    } else batchSessionData = get(result, 'data.batchSessions[0]')
    if (get(batchSessionData, 'id')) {
      duck.merge(() => ({ batchSessionData }), {
        key: 'batchSessionData'
      })
    }
    return batchSessionData || null;
  }
  catch (error) {
    console.log(error)
  }
}

export const fetchPrevSession = async ({ batchId, bookingDate }) => {
  const batchSessions = await requestToGraphql(`{
  batchSessions(
    filter: { and: [{ batch_some: { id: "${batchId}" } }, { bookingDate_lte: "${bookingDate}" }{ topic_some:{ classType_not: theory } }] }
    orderBy: bookingDate_DESC
    last: 2
  ) {
    id
    course {
      id
    }
    topic {
      id
      title
      topicComponentRule {
        componentName
        childComponentName
        order
        blockBasedProject {
          id
        }
      }
    }
  }
}
`)
  return get(batchSessions, 'data.batchSessions', [])
}

export default fetchLiveSession