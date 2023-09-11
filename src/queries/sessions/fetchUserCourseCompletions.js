import gql from 'graphql-tag'
import duck from '../../duck'
import getCourseId from '../../utils/getCourseId'

const fetchUserCourseCompletions = (id) => duck.createQuery ({
    query : gql`
            query {
              userCourseCompletions(filter: {
                and:[{course_some:{id:"${getCourseId()}"}},{user_some:{id:"${id}"}}]
              }) {
                id
                rating
                comment
                certificate {
                  uri
                  signedUri
                }
              }
              userProfiles(filter:{user_some:{id:"${id}"}}){
                id
                topicsCompleted
                proficientTopicCount
                masteredTopicCount
                familiarTopicCount
              }
            }
        `,
    type: 'userCourseCompletions/fetch',
    key: 'userCourseCompletions',
})


export default fetchUserCourseCompletions
