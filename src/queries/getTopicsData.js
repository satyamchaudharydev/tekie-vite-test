const getTopicsComponentQuery = (topicId, courseId) => (

  `mutation{
        userTopicJourney(topicId:"${topicId}",courseId:"${courseId}"){
          topicStatus
        }
      }
         `
)


export default getTopicsComponentQuery
