import gql from 'graphql-tag'
import duck from '../../duck'

const updateEventAttendance = (id, input) => duck.query ({
    query : gql`
    mutation($input: EventSessionUpdate) {
      updateEventSession(id:"${id}", input:$input)
       {
          id
        }
      }
    `,
    variables: {
      input, 
    },
    type: 'eventSessions/fetch',
    key: 'eventSessions',
})


export default updateEventAttendance