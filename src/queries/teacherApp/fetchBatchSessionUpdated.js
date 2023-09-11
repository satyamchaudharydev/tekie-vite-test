import gql from 'graphql-tag'
import requestToGraphql from '../../utils/requestToGraphql'

const updatedBatchSession = async(batchSessionId) => {
  return await requestToGraphql(gql`
  { 
    batchSessionData:batchSession(id:"${batchSessionId}"){
      id
      sessionComponentTracker{
        id
      }
    }
  }
  `)
}

export default updatedBatchSession
