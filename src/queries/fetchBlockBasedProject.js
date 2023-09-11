import gql from 'graphql-tag'
import duck from '../duck/duckIfCacheExists'
import buddyQueriesCaller from './utils/buddyQueriesCaller'


const fetchBlockBasedProject = (userId, blockBasedProjectId, courseId, tokenType, force = false, topicId) => {
  buddyQueriesCaller('userBlockBasedProjects',{topicId,courseId,blockBasedProjectId,tokenType})
    return duck.createQuery({
      query: gql`
        query {
          userBlockBasedProjects(
            filter: {
              and: [
                { user_some: { id: "${userId}" } }
                { topic_some: { id: "${topicId}" } }
                { blockBasedProject_some: { id: "${blockBasedProjectId}" } }
                { course_some: { id: "${courseId}" } }
              ]
            }
        ){
            id
            answerLink
            attachments {
              id
              uri
            }
            savedBlocks
            status
            startTime
            endTime
            course {
              defaultLoComponentRule {
                componentName
                order
              }
            }
            topic {
              id
              title
              description
              videoTitle
              order
              topicComponentRule {
                componentName
                order
                childComponentName
                learningObjectiveComponentsRule{
                  componentName
                  order
                }
                learningObjective{
                  id
                  order
                  title
                  messagesMeta{
                    count
                  }
                  questionBankMeta(filter:{and:[{assessmentType:practiceQuestion}{status:published}]}){
                    count
                  }
                  comicStripsMeta(filter:{status:published}){
                    count
                  }
                  learningSlidesMeta {
                    count
                  }
                  practiceQuestionLearningSlidesMeta: learningSlidesMeta(
                    filter: { type: practiceQuestion }
                  ) {
                    count
                  }
                }
                blockBasedProject{
                  id
                  order
                  isHomework
                  title
                }
                video{
                  id
                }
              }
            }
            blockBasedProject {
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
            }
        }
      }
      `,
      variables: {
          tokenType
      },
      type: 'userBlockBasedProjects/fetch',
      key: 'userBlockBasedProjects',
      force
    })
}

export default fetchBlockBasedProject
