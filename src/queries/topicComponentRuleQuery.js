const topicComponentRuleQuery = `
  topicComponentRule {
  componentName
  childComponentName
  order
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
    questionBankMeta(
      filter: {
        and: [{ assessmentType: practiceQuestion }, { status: published }]
      }
    ) {
      count
    }
    comicStripsMeta(filter: { status: published }) {
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
  video {
    id
  }
  blockBasedProject {
    id
  }
}`

export default topicComponentRuleQuery;