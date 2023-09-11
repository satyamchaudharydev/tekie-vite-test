import gql from 'graphql-tag'
import duck from '../duck'

const fetchStudentProfile = async (id, key) =>
{
  if (id) {
    const batchQuery = `id
                code
                type
                classroomTitle
                documentType
                coursePackage {
                  id
                  title
                }
                allottedMentor {
                  id
                  name
                  profilePic {
                    uri
                  }
                  phone {
                    countryCode
                    number
                  }
                }`
      return duck.query({
        query: gql`
        query getUser($id:ID){
          user(id:$id){
            id
            name
            email
            isSetPassword
            gender
            dateOfBirth
            role
  
            inviteCode
            fromReferral
            giftVoucherApplied
            phone{
              countryCode
              number
            }
            studentProfile{
              id
              grade
              section
              schoolName
              rollNo
              school{
                id
                name
              }
              profileAvatarCode
              batch {
                ${batchQuery}
              }
              studentBatches: batches{
                ${batchQuery}
              }
              parents{
                id
                user{
                  id
                  name
                  email
                  source
                  phone{
                    countryCode
                    number
                  }
                  parentProfile {
                    children {
                      user {
                        id
                      }
                      school {
                        id
                        whiteLabel
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
        `,
        variables: {
          id
        },
        type: 'user/fetch',
        key:'accountProfile'
      })
  }
  return null;
}

export default fetchStudentProfile
