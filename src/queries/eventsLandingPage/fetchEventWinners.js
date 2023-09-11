import gql from 'graphql-tag'
import { get } from 'lodash'
import duck from '../../duck'


const fetchEventWinners = async (id) => {
    return duck.query({
        query: gql`
        {
            getEventWinner(eventId: "${id}") {
              prizeTitle
              userName
              profilePicUrl
              prizeCount
            }
          }
        `,
        type: 'eventWinners/fetch',
        key: 'eventWinners',
        changeExtractedData: (extracted, original) => {
            if (get(original, 'getEventWinner')) {
                return { 
                    eventSpeakers: [...get(original, 'getEventWinner')],
                }
            }
        }
    })
}

export default fetchEventWinners