import gql from 'graphql-tag'
import duck from '../duck'

const fetchChatRewatch = async userId =>
  duck.query({
    query: gql`
    query {
        userLearningObjectives(filter: {
          and:[
            {
                    user_some: {id: "${userId}"}
            }
            {or: [{chatStatus: complete}, {chatStatus: skip}]}
          ]}) {
          id
          chatStatus
          learningObjective {
            id
            order
            title
            topic{
              id
              title
              order
            }
          }
        }
      }
    `,
    type: 'chatRewatch/fetch',
    key: 'chatRewatch'
  })

export default fetchChatRewatch
