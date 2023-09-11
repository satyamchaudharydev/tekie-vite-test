import gql from 'graphql-tag'
import duck from '../../../duck'
import getIdArrForQuery from '../../../utils/getIdArrForQuery'

const addNotice = ( input, senderId, receiverIds, attachedfilesIds, batchId) =>
   duck.query({
    query: gql`
    mutation($input: NoticeInput!) {
        addNotice(
        input: $input,
        sentByConnectId:"${senderId}",
        sentToConnectIds:[${getIdArrForQuery(receiverIds)}],
        attachedFilesConnectIds: [${getIdArrForQuery(attachedfilesIds)}],
        batchConnectId: "${batchId}"
      ) {
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
    variables: {
      input
    },
    key: 'classroomDetail',
    type: 'notice/add',
})


export default addNotice
