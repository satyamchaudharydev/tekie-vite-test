import gql from 'graphql-tag'
import duck from '../../duck'
import get from 'lodash/get'


const fetchAssignmentQuestions = async (filter) => {
  return duck.query({
    query: gql`{
           assignmentQuestions(filter: {and: 
              [${filter || ''}{status:published}]}){
              id
              statement
              questionCodeSnippet
              answerCodeSnippet
              editorMode
              isHomework
            }
            }`,
    type: 'assignmentQuestions/fetch',
    key: 'assignmentQuestions',
    changeExtractedData: (extractedData, originalData) => {
      extractedData.assignmentQuestions = get(originalData, 'assignmentQuestions', [])
    return {
      ...extractedData
    }
  }
  })
}

export default fetchAssignmentQuestions