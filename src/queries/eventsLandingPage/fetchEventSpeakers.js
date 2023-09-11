import gql from 'graphql-tag'
import { get } from 'lodash'
import duck from '../../duck'


const fetchEventSpeakers = async (id) => {
    return duck.query({
        query: gql`
        {
            getEventSpeaker(eventId: "${id}") {
                linkedInLink
                about
                roleAtOrganization
                organization
                name
                profilePic
            }
             
        }
        `,
        type: 'eventSpeakers/fetch',
        key: 'eventSpeakers',
        changeExtractedData: (extracted, original) => {
            if (get(original, 'getEventSpeaker')) {
                return { 
                    eventSpeakers: [...get(original, 'getEventSpeaker')],
                }
            }
        }
    })
}

export default fetchEventSpeakers