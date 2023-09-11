import gql from 'graphql-tag'
import duck from '../duck'

const fetchUserCourse = (
  id,
) => {
  return duck.createQuery({
    query: gql` 
{
  userCourse(id: "${id}"){
    user{
      id
      name
      studentProfile{
        parents{
          user{
            name
          }
        }
      }
    }
    demoCompletion{
      id
      assetUrl
    }
    iqaReport{
      id
      iqaRank
      iqaScore
      globalRank
      maximumScore
      assetUrl
    }
  }
}
    `,
    changeExtractedData: (extractedData, originalData) => {
      extractedData.userCourse = originalData.userCourse
      return {...extractedData}
    },
    key: "userCourse",
    type: "userCourse/fetch",
  });
}

export default fetchUserCourse
