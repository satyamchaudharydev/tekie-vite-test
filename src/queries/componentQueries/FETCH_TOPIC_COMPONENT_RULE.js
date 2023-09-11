const FETCH_TOPIC_COMPONENT_RULE = (
  topicId
) => `
topics(filter:{id: "${topicId}"}) @duck(
  type: "topic/fetch",
  key: "topic/${topicId}",
) {
  id
  title

  videoTitle
  order

  thumbnail {
    uri
  }
  thumbnailSmall {
    uri
  }

  topicComponentRule {
    componentName
    order
    childComponentName
    learningObjectiveComponentsRule {
      componentName
      order
    }
    learningObjective { 
      id
      title
      order
      messagesMeta {
        count
      }
      questionBankMeta(filter:{and:[{assessmentType:practiceQuestion}{status:published}]}) {
        count
      }
      comicStripsMeta(filter:{status:published}) {
        count
      }
      learningSlidesMeta {
        count
      }
      practiceQuestionLearningSlidesMeta: learningSlidesMeta(filter:{type:practiceQuestion}) {
        count
      }
      practiceQuestionChatbotMeta: messagesMeta(filter: { type: question } ) {
        count
      }
    }
    blockBasedProject {
      id
      order
      title
      isSubmitAnswer
      isHomework
    }
    video {
      id
      title
    }
  }
}
`

export default FETCH_TOPIC_COMPONENT_RULE
