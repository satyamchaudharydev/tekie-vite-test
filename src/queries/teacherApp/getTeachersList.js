
import gql from 'graphql-tag'
import { get } from 'lodash';
import duck from '../../duck';
import getIdArrForQuery from '../../utils/getIdArrForQuery';


const getTeachersList = async (loggedInUser) => {
const schoolId = get(loggedInUser,'schools[0].id')

  return duck.query({
    query: gql`
     {
         mentorProfiles(filter:{
        and: [
          {
            user_some:{
             secondaryRole:schoolTeacher
            }
          }
          {
            schools_some:{
              id_in:[${getIdArrForQuery([schoolId])}]
            }
          }
        ]
      }) {
        id
        user{
            id
            name
        }
      }}
    `,
    type: 'schoolMentorProfiles/fetch',
    key: 'schoolMentorProfiles',
    changeExtractedData:(extractedData,originalData)=>{
        extractedData.user=[]
        extractedData.schoolMentorProfiles = get(originalData,'mentorProfiles')
        return {...extractedData}
    }
  })
}

export default getTeachersList


