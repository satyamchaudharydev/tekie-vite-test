import gql from 'graphql-tag'
import duck from '../../duck/duckIfCacheExists'

const getFilters = (menteeId, bookingDate, slotLabel, topicId) => {
    if(menteeId && topicId) {
        return `
                and: [
                    {user_some:{id: "${menteeId}"}},
                    {topic_some: {id: "${topicId}"}}
                ]
        `
    } else if (menteeId && bookingDate && slotLabel) {
        return `
            and: [
                    {user_some:{id: "${menteeId}"}},
                    {bookingDate: "${bookingDate}"},
                    {${slotLabel}: true}
                ]
        `
    }
}

const getQuery = (menteeId, bookingDate, slotLabel, topicId, shouldFetchMentorMenteeSession) => {
    if (shouldFetchMentorMenteeSession) {
        return gql`
            query {
                menteeSessions(filter: {
                    ${getFilters(menteeId, bookingDate, slotLabel, topicId)}
                }) {
                    id
                    bookingDate
                }
                mentorMenteeSessions(filter:{
                    menteeSession_some: {
                      ${getFilters(menteeId, bookingDate, slotLabel, topicId)}
                    }
                }) {
                   id
                   menteeSession {
                    id
                   }
                }
            }
        `
    }

    if (slotLabel) {
        return gql`
            query {
                menteeSessions(filter: {
                    ${getFilters(menteeId, bookingDate, slotLabel, topicId)}
                }) {
                    id
                    bookingDate
                    ${slotLabel}
                }
            }
        `
    }

    return gql`
        query {
            menteeSessions(filter: {
                ${getFilters(menteeId, bookingDate, slotLabel, topicId)}
            }) {
                id
                bookingDate
            }
        }
    `
}

const fetchMenteeSession = (menteeId, bookingDate, slotLabel, topicId, force = false, shouldFetchMentorMenteeSession) => duck.createQuery({
    query: getQuery(menteeId, bookingDate, slotLabel, topicId, shouldFetchMentorMenteeSession),
    variables: {
        tokenType: 'withMenteeToken'
    },
    type: 'menteeSession/fetch',
    key: 'menteeSession',
    tokenType: 'withMenteeToken',
    force
})

export default fetchMenteeSession
