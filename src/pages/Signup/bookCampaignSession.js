import gql from 'graphql-tag'

const BOOK_CAMPAIGN_SESSION = (campaignId, userId, slotFieldName, bookingDate, courseString) => gql`
  mutation {
    bookB2B2CSlots(input: {
      campaignId: "${campaignId}"
      userId: "${userId}"
      ${slotFieldName}: true
      bookingDate: "${bookingDate}"
      ${courseString}
    }) {
      result
    }
  }
`

export default BOOK_CAMPAIGN_SESSION 