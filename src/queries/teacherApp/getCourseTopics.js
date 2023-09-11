
import gql from 'graphql-tag'
import duck from '../../duck';


const getCourseTopics = async (courseId,order, adhocType = false) => {
  return duck.query({
    query: gql`
     {
         topics(filter:{
        and: [
          {
            courses_some:{
              id:"${courseId}"
            }
          }
          {
            status: published
          }
          {
            order_${adhocType ? 'lte' : 'gte'}:${order}
          }
        ]
      }) {
        id
        title
      }}
    `,
    type: 'courseTopics/fetch',
    key: 'courseTopics'
  })
}

export default getCourseTopics


