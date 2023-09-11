import gql from 'graphql-tag'
import duck from '../../duck'

const fetchMentorMenteeSession = (menteeSessionId) => duck.createQuery ({
    query : gql`
    {
        mentorMenteeSessions(filter:{
          menteeSession_some:{
            id:"${menteeSessionId}"
          }
        }){
          id
        }
      }
    `,
    type: 'mentorMenteeSession/fetch',
    key: 'NpsMentorMenteeSession',
})


export default fetchMentorMenteeSession
