import gql from 'graphql-tag'
import duck from '../duck'

const fetchEventCertificate = (
  code,
) => {
  return duck.createQuery({
    query: gql`
    {
      eventCertificate: getEventCertificate(input: { code:"${code}" }){
        userId
        name
        assetUrl
        eventType
        eventName
      }
    }
    `,
    // variables: {
    //   tokenType: 'appTokenOnly'
    // },
    key: "eventCertificate",
    type: "eventCertificate/fetch",
  });
}

export default fetchEventCertificate
