import gql from 'graphql-tag'
import duck from '../duck'


const registerUserForEvent = async (eventId, registeredUsersConnectId) => {
    return duck.query({
        query: gql`
        mutation updateEvent($input:EventUpdate){
   updateEvent(input:$input,id:"${eventId}",registeredUsersConnectIds:["${registeredUsersConnectId}"]){
    id
   }
 }
    `,
        variables: {
            input: {},
        },
        type: 'events/update',
        key: 'events'
    })
}

export default registerUserForEvent
