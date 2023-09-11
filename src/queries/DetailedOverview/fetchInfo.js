import gql from 'graphql-tag'
import duck from '../../duck'
import getIdArrForQuery from '../../utils/getIdArrForQuery'

// userVideosMeta(filter:{
                //   and: [
                //    {
                //     user_some:{
                //       and: [
                //         {
                //           id_in:["ckypuxocf0003m8incsc8a2s1", "ckypuyk2c0008m8inajq9d68w", "ckypuzi4i000dm8inbtiwadok"]
                //         }
                //         {
                //           studentProfile_some: {
                //             batch_some: {
                //               code_contains: "TS0-BBS1"
                //             }
                //           }
                //         }
                //       ]
                //     }
                //   },{
                //     topic_some: {
                //       id:"cjx2czgja00001h2xt7fjlh04"
                //     }
                //   }
                //   ]
                // }) {
                //  count
                // }
                // userAssignmentsMeta(filter:{
                //   and: [
                //    {
                //     user_some:{
                //       and: [
                //         {
                //           id_in: ["ckypuxocf0003m8incsc8a2s1", "ckypuyk2c0008m8inajq9d68w", "ckypuzi4i000dm8inbtiwadok"]
                //         }
                //         {
                //           studentProfile_some: {
                //             batch_some: {
                //               code_contains: "TS0-BBS1"
                //             }
                //           }
                //         }
                //       ]
                //     }
                //   },{
                //     topic_some: {
                //       id:"cjx2czgja00001h2xt7fjlh04"
                //     }
                //   }
                //   ]
                // }) {
                //   count
                // }
const fetchInfo = (topicId,batchCode,userIds,loggedInId) => { 
    
    return duck.query ({
    query : gql`
             query {
                studentRatings:mentorMenteeSessions(filter:{
                  and: [
                    {
                      menteeSession_some: {
                        user_some: {
                          id_in: [ ${ getIdArrForQuery(userIds) }]
                        }
                      }
                    },{
                      topic_some: {
                        id: "${topicId}"
                      }
                    }, {
                      mentorSession_some: {
                         user_some: {
                           id: "${loggedInId}"
                         }
                      }
                    }
                  ]
                 }) {
                   rating
                   id
                 }
                userVideosMeta(filter:{
                  and: [
                   {
                    user_some:{
                      and: [
                        {
                          id_in:[ ${ getIdArrForQuery(userIds) }]
                        }
                        {
                          studentProfile_some: {
                            batch_some: {
                              code_contains: "${batchCode}"
                            }
                          }
                        }
                      ]
                    }
                  },{
                    topic_some: {
                      id:"${topicId}"
                    }
                  }
                  ]
                }) {
                 count
                }
                userQuizReportsMeta(filter:{
                  and: [
                   {
                    user_some:{
                      and: [
                        {
                          id_in:[${ getIdArrForQuery(userIds) }]
                        }
                        {
                          studentProfile_some: {
                            batch_some: {
                              code_contains: "${batchCode}"
                            }
                          }
                        }
                      ]
                    }
                  },{
                    topic_some: {
                      id:"${topicId}"
                    }
                  }
                  ]
                }) {
                  count
                }
                userAssignmentsMeta(filter:{
                  and: [
                   {
                    user_some:{
                      and: [
                        {
                          id_in: [${ getIdArrForQuery(userIds)}]
                        }
                        {
                          studentProfile_some: {
                            batch_some: {
                              code_contains: "${batchCode}"
                            }
                          }
                        }
                      ]
                    }
                  },{
                    topic_some: {
                      id:"${topicId}"
                    }
                  }
                  ]
                }) {
                  count
                }
                topic(id:"${topicId}",) {
                  topicComponentRule {
                    componentName
                  }
                  videoThumbnail {
                    uri
                  }
                  videoContent {
                    thumbnail {
                      uri
                    }
                  }
                }
              }
        `,
    type: 'batchReports/fetch',
    key: `batchReports`,
    changeExtractedData: (extractedData, originalData) => {
      extractedData.batchReports = originalData
      return extractedData
    },
}) }
 // userVideos(filter:{
                //   and: [
                //    {
                //     user_some:{
                //       and: [
                //         {
                //           id_in:[ ${ getIdArrForQuery(userIds) }]
                //         }
                //         {
                //           studentProfile_some: {
                //             batch_some: {
                //               code_contains: "${batchCode}"
                //             }
                //           }
                //         }
                //       ]
                //     }
                //   },{
                //     topic_some: {
                //       id:"${topicId}"
                //     }
                //   }
                //   ]
                // }){
                //   video {
                //     videoStartTime
                //     videoEndTime
                //   }
                // }
              

export default fetchInfo
