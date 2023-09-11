import gql from 'graphql-tag'
import duck from '../duck'
import buddyQueriesCaller from './utils/buddyQueriesCaller'

const fetchVideoPage = (userId, topicId, PUBLISHED, tokenType, force = false, courseId = null, videoId = null, customKey) => {
  buddyQueriesCaller('userVideos',{topicId,courseId,videoId,tokenType:''})
  return duck.createQuery({
    query: gql`
      query {
        userVideos(
          filter: {
            and: [
              { user_some: { id: "${userId}" } }
              { topic_some: { id: "${topicId}" } }
              ${courseId ? `{course_some:{id:"${courseId}"}}` : ''}
              ${videoId ? `{video_some:{id:"${videoId}"}}` : ''}
            ]
          }
        ) {
          id
          topic {
            id
            title
            description
            videoTitle
            order
            videoContent {
               id
               title
                description
                subtitle {
                  name
                  uri
                }
                thumbnail {
                  uri
                }
                videoFile {
                  name
                  uri
                }
            }
            videoStartTime
            videoEndTime
            videoDescription
            thumbnail {
              id
              name
              uri
            }
            video {
              id
              name
              uri
              signedUri  
            }
            videoSubtitle{
              id
              uri
              name
            }
            videoThumbnail{
              id
              uri
              name
            }
            storyThumbnail{
                id
                uri
                name
            }
            description
            learningObjectives(
              filter: {
                status: ${PUBLISHED}
              }
            ){
              id
              title
              videoStartTime
              videoEndTime
              order  
              thumbnail{
                id
                uri
                name
              }
             videoThumbnail{
               id
               uri
               name       
             }   
            }
          }
          videoCurrentTime
          isBookmarked
          isLiked
          status
          nextComponent{
            learningObjective{
              id
              thumbnail {
                id
                name
                uri
              }
            }
            nextComponentType
          }
        }
      }
    `,
    type: 'videopage/fetch',
    key: customKey ? `${customKey}/${topicId}` : topicId,
    variables: {
      tokenType: 'withMenteeMentorToken'
    },
    force
  })
}
export default fetchVideoPage
