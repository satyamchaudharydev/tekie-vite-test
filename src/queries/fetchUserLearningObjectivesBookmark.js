import gql from 'graphql-tag'
import duck from '../duck'

const fetchBookmark = async userId =>
  duck.query({
    query: gql`
      {
        userLearningObjectives(
          filter: {
            and: [
              { user_some: { id: "${userId}" } }
              {
                or: [
                  { isChatBookmarked: true }
                  { isPracticeQuestionBookmarked: true }
                ]
              }
            ]
          }
        ) {
          id
          isChatBookmarked
          isPracticeQuestionBookmarked
          learningObjective {
            id
            order
            title
            topic {
              id
              order
              title
            }
            thumbnail {
              id
              uri
            }
          }
        }
      }
    `,
    type: 'userLearningObjectivesBookmark/fetch',
    key: 'userLearningObjectivesBookmark'
  })

export default fetchBookmark
