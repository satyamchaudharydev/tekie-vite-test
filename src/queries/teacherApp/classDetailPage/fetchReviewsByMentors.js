import gql from 'graphql-tag'
import duck from '../../../duck'

const studentReviewByMentors = (studentId) => {
    return duck.query({
      query: gql`
        query {
          studentReviewByMentors(filter:{
                and:[
                    { user_some: { id: "${studentId}" } }
                    { reviewedBy_exists: true }
                ]
            }){
                id
                reviewType
                createdAt
                reviewText
                topic {
                  id
                  title
                }
                reviewedBy {
                  id
                  name
                  profilePic {
                    uri
                  }
                }
            }
        }
      `,
      type: 'studentReview/fetch',
      key: `classroomDetail`
    })
}

export default studentReviewByMentors

