const FETCH_VIDEO_PAGE = (
  userId,
  topicId,
  courseId,
  videoId,
  customKey
) => `
  userVideos(
    filter: {
      and: [
        { user_some: { id: "${userId}" } }
        { topic_some: { id: "${topicId}" } }
        ${courseId ? `{course_some:{id:"${courseId}"}}` : ''}
        ${videoId ? `{video_some:{id:"${videoId}"}}` : ''}
      ]
    }
  ) @duck(
    type: "videoPage/fetch"
    key: "${customKey ? `${customKey}/${topicId}` : topicId}"
  ) {
    id
    topic {
      id
      title
      classType
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
          status: published
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
`

export default FETCH_VIDEO_PAGE
