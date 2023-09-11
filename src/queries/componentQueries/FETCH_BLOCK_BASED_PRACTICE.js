const FETCH_BLOCK_BASED_PRACTICE = (
  userId,
  topicId,
  courseId,
  blockBasedPracticeIds,
  componentType,
) => {
  return `
userBlockBasedPractices(
  filter: {
    and: [
      { user_some: { id: "${userId}" } }
      { topic_some: { id: "${topicId}" } }
      ${blockBasedPracticeIds ? `{ blockBasedPractice_some: { id_in: ${JSON.stringify(blockBasedPracticeIds)} } }` : ''}
      { course_some: { id: "${courseId}" } }
    ]
  }
) @duck (
  type: "userBlockBasedPractices/fetch"
  key: "${topicId + '/' + componentType + '/' + userId}"
) {
  id
  answerLink
  savedBlocks
  status
  updatedAt
  startTime
  endTime
  courseData: course{  
     codingLanguages{
      value
     }
  }
  attachments {
    id
    uri
    name
    type
    createdAt
  }
  gsuiteFile {
    fileId
    name
    url
    thumbnailUrl
    mimeType
    iconLink
    createdTime
    parentFolderIDs
  }
  gsuiteLastRevision{
    fileId
    name
    url
    thumbnailUrl
    mimeType
    iconLink
    createdTime
    parentFolderIDs
  }
  isGsuiteFileVisited
  authors {
    id
    name
    username
    studentProfile {
      branch
      section
      grade
      schoolName
    }
  }
  blockBasedPractice {
    
    id
    title
    order
    difficulty
    status
    projectCreationDescription
    externalPlatformLink
    initialBlocks
    layout
    type
    isSubmitAnswer
    isHomework
    externalPlatformLogo {
      id
      uri
    }
    projectThumbnail {
      id
      uri
    }

    projectDescription
    answerDescription
    embedViewHeight
    externalDescriptionEnabled
    answerFormat
    answerFormatDescription
    answerFormatViewHeight
    gsuiteFileType
    gsuiteTempleteURL
    platFormLinkLabel
  }
}
`
}



export default FETCH_BLOCK_BASED_PRACTICE