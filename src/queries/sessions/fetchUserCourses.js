import gql from 'graphql-tag'
import duck from '../../duck'

const fetchUserCourses = (userId, force = false, meta = false) => {
    return duck.createQuery({
      query: gql`
        query {
          getUserCourses(input: { userId: "${userId}", courseProgress: ${meta} }) {
            id
            courseId
            classroom{
              id
              code
              title
            }
            activeClassroom
              ${meta ? `
                title
                secondaryCategory
                thumbnail {
                  uri
                }
                allottedMentor{
                  name
                  displayName
                }
                currentTopic {
                  title
                }
                isCourseCompleted
              ` : ''}
          }
      }
      `,
      type: 'userCourse/fetch',
      key: 'userCourse',
      force
    })
}

export default fetchUserCourses
