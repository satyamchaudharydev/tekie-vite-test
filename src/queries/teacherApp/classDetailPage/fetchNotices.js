import gql from 'graphql-tag'
import duck from '../../../duck'

const fetchNotices = (batchId) => {
    return duck.query({
      query: gql`
        query {
            notices(filter:{
                and:[
                    {
                        batch_some:{id: "${batchId}"}
                    }
                ]
            }, orderBy: createdAt_DESC){
                id
                type
                sentBy{
                id
                name
                profilePic{
                        id
                        uri
                    }
                }
                messageText: message
                attachedFiles{
                    id
                    attachedFile{
                      uri
                    }
                  }
            }
        }
      `,
      type: 'notice/fetch',
      key: `classroomDetail`
    })
}

export default fetchNotices

