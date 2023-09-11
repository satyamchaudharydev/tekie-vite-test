import gql from 'graphql-tag'
import duck from '../../duck'
import get from 'lodash/get'


const fetchQuestionBanks = async (filter) => {
  return duck.query({
    query: gql`{
  questionBanks(
    filter: { and: [${filter || ''}{status:published}] }
  ) {
    id
    questionType
    difficulty
    assessmentType
    order
    questionLayoutType
    blockLayoutType
    statement
    hint
    learningObjectives {
      id
    }
    mcqOptions {
      isCorrect
      statement
      blocksJSON
      initialXML
      questionBankImage {
        id
        image {
          id
          uri
        }
      }
    }
    fibInputOptions {
      answers
      correctPosition
    }
    fibBlocksOptions {
      statement
      displayOrder
      correctPositions
    }
    explanation
    answerCodeSnippet
    questionCodeSnippet
    arrangeOptions {
      statement
      displayOrder
      correctPosition
      correctPositions
    }
  }
}
`,
    type: 'questionBanks/fetch',
    key: 'questionBanks',
    changeExtractedData: (extractedData, originalData) => {
      extractedData.learningObjective = []
      extractedData.questionBanks = get(originalData, 'questionBanks')
    return {
      ...extractedData
    }
  }
  })
}

export default fetchQuestionBanks