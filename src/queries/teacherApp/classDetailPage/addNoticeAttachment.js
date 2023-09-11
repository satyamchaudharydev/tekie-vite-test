import gql from 'graphql-tag'
import duck from '../../../duck'

const addNoticeAttachment = ( input ) =>
  duck.createQuery({
    query: gql`
    mutation($input: NoticeAttachmentInput!) {
        addNoticeAttachment(
        input: $input
      ) {
        id
      }
    }
    `,
    variables: {
      input
    },
    key: 'addNoticeAttachment',
    type: 'noticeAttachment/add',
})

export default addNoticeAttachment
