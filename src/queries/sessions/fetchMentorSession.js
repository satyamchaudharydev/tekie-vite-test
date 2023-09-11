import gql from 'graphql-tag'
import duck from '../../duck/duckIfCacheExists'
import { getSlotNames } from '../../utils/slots/slot-names'


const getFilter = (filterType, mentorId, availabilityDate, slotLabel) => {
    if (filterType === 'onlyId') {
        return `
            and: [
                {user_some:{id: "${mentorId}"}},
                {availabilityDate_gt: "${availabilityDate}"},
                {sessionType:paid}
            ]
        `
    }

    return `
        and: [
            {user_some:{id: "${mentorId}"}},
            {availabilityDate: "${availabilityDate}"},
            {${slotLabel}: true}
        ]
    `
}

const fetchMentorSession = (mentorId, availabilityDate, slotLabel, filterType, force = false) => duck.createQuery({
    query: gql`
        query {
            mentorSessions(filter: {
                ${getFilter(filterType, mentorId, availabilityDate, slotLabel)}
            }) {
                id
                availabilityDate
                ${filterType === 'onlyId' ? getSlotNames() : slotLabel}
            }
        }
    `,
    variables: {
        tokenType: 'withMenteeToken'
    },
    type: 'mentorSession/fetch',
    key: filterType === 'onlyId' ? `mentorSession/${mentorId}` : 'mentorSession',
    force
})

export default fetchMentorSession
