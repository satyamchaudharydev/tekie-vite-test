import gql from 'graphql-tag'
import duck from '../../duck';


const getRecording = async (id) => {

    return duck.query({
        query: gql`
        {
           recordingBatches: batchSessions (filter:{
              and: [
                {
                  batch_some: {
                    id:"${id}"
                  }
                }
                {
                  sessionStatus:completed
                }
                {
                  sessionRecordingLink_exists: true
                }
              ]
            }) {
              batch {
                id
              }
              id
             topicData: topic {
                id
                title
              }
              bookingDate
              sessionStartDate
              sessionEndDate
              sessionRecordingLink
            }
          }
    `,
        type: 'recordingBatches/fetch',
        key: 'recordingBatches'
    })
}
export default getRecording