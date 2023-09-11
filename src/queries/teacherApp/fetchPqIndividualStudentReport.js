import gql from "graphql-tag";
import duck from "../../duck";

const fetchPqStudentReport = async (user , course, learning) => {
    
  return duck.query({
    query: gql`
    {
       fetchPqStudentReport: userPracticeQuestionReports(filter: {and: [{user_some: {id: "${user}"}}, {learningObjective_some: {id: "${learning}"}} ]}, orderBy: createdAt_DESC, first: 1) {
          id
          firstTryCount
          secondTryCount
          threeOrMoreTryCount
          answerUsedCount
          helpUsedCount
          detailedReport {
            question {
              id
              order
              statement
            }
            isCorrect
            firstTry
            secondTry
            thirdOrMoreTry
            isAnswerUsed
            isHintUsed
          }
        }
      }
      
    `,
    type: "fetchPqStudentReport/fetch",
    key: "fetchPqStudentReport",
  });
};
export default fetchPqStudentReport;
