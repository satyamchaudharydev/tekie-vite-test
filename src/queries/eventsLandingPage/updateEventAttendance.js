import gql from 'graphql-tag'
import duck from '../../duck'

const updateEventAttendance = (input) => duck.query ({
    query : gql`
    mutation($input: EventAttendanceInput) {
      updateEventSessionAttendance(input: $input) {
        error
        result
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