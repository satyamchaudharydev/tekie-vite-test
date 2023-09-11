import gql from 'graphql-tag'
import duck from '../duck'


const getEventCertificateForUser = async (eventId, userId) => {
    return duck.query({
        query: gql`
        {
    eventCertificates(
        filter: {
        and: [
            { user_some: { id: "${userId}" } }
            { event_some: { id: "${eventId}" } }
        ]
        }
    ) {
        id
        assetUrl
        numberOfDownloads
    }
    }
    `,
        type: 'eventCertificates/fetch',
        key: 'eventCertificates'
    })
}

export const updateCertificate = (certificateId) => {
    return duck.query({
        query: gql`
        mutation {
          updateEventCertificate(id: "${certificateId}", input: { numberOfDownloads: 1 }) {
            id
          }
        }
    `,
        type: 'eventCertificates/update',
        key: 'eventCertificates'
    })
}

export default getEventCertificateForUser
