import gql from 'graphql-tag'
import duck from '../../duck'


const fetchCodingQuestion = async (batch,course,topic) => {
    return duck.query({
        query: gql`
        {
          codingQuestionData:  assignmentQuestions(filter: {and: 
              [{topics_some: {id: "${topic}"}},
                {courses_some: {id: "${course}"}},
              ]}){
              id
              statement
              questionCodeSnippet
              answerCodeSnippet
              editorMode
              isHomework
            }
            }
    `,
        type: 'codingQuestionData/fetch',
        key: 'codingQuestionData'
    })
}
export default fetchCodingQuestion