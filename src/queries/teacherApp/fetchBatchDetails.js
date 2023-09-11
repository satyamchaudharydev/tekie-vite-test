import gql from 'graphql-tag'
import duck from '../../duck/duckIfCacheExists'


const fetchBatchDetails = (batchId) => {
    // query : gql`
    //         query {
    //           batchDetails: batchSessions(filter:{
    //                 and:[
    //               {
    //                 batch_some:{
    //                   id:"${batchId}"
    //                 }
    //               }
    //             {
    //               sessionStatus_in:[completed, started]
    //             }
                  
    //             ]
    //           }, orderBy:sessionEndDate_DESC) {
    //               id
    //               bookingDate
    //               sessionStatus
    //               isRetakeSession
    //               sessionStartDate
    //               sessionEndDate
    //             attendance {
    //               status
    //               isPresent
    //               student{
    //                 rollNo
    //                 user{
    //                   id
    //                   name
    //                 }
    //               }
    //             }
    //             topicData:topic {
    //               id
    //               title
    //               classType
    //               order
    //               thumbnailSmall{
    //                 uri
    //               }
    //               topicComponentRule {
    //                 order
    //                 componentName
    //                 video{
    //                   id
    //                 }
    //                 blockBasedProject {
    //                   id
    //                   title
    //                   externalPlatformLogo {
    //                     uri
    //                   }
    //                 }
    //                 learningObjective {
    //                   title
    //                   id
    //                 }
    //               }
    //               coursesData: courses {
    //                 id
    //               }
    //             }
    //           }
    //         }
    //     `,
  return duck.query({
    query: `/batchSessions/${batchId}`,
    options: {
      tokenType: "appTokenOnly",
      input: {},
      rest: true,
      method: "get",
      apiType: "batchDetails",
    },
    changeExtractedData: async (extracted, original) => {
      return { ...extracted };
    },
    type: 'batchDetails/fetch',
    key: `batchDetails/${batchId}`,
  });
}


export default fetchBatchDetails
