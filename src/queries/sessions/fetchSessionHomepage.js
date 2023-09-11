import gql from 'graphql-tag'
import moment from 'moment'
// import { get } from 'lodash'
import duck from '../../duck'
import config from '../../config'
import getCourseId from '../../utils/getCourseId'
import { getSlotsObject } from '../../utils/getAvailableSlots'

const fetchSessionHomepage = (userRole = config.MENTEE, id, startDate, endDate, force = false) => {
  const batchQuery = `id
                    code
                    classroomTitle
                    documentType
                    type
                    customSessionLink
                    coursePackage {
                      id
                      title
                    }
                    currentComponent {
                        currentCourse {
                            id
                            title
                            description
                        }
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
  return duck.createQuery ({
    query : gql`
            query {
              netPromoterScores(filter:{
                and: [{ user_some: { id: "${id}" } }, { course_some: { id: "${getCourseId()}" } }]
              }) {
                id
              }
              salesOperations(filter: {
                client_some: {
                  id: "${id}"
                }
                }) {
                    id
                    allottedMentor {
                      id
                      name
                      username
                      profilePic {
                        uri
                      }
                    }
                }
              user(id: "${id}") {
                id
                timezone
                signUpBonusCredited
                signUpBonusNotified
                verificationStatus
                studentProfile {
                  id
                  profileAvatarCode
                  grade
                  section
                  rollNo
                  school{
                    id
                    name
                  }
                  batch {
                    ${batchQuery}
                  }
                  studentBatches: batches{
                    ${batchQuery}
                  }
                  parents {
                    id
                    user {
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
    type: 'sessionHomepage/fetch',
    key: 'sessionHomepage',
    force,
    changeExtractedData: (extractedData, originalData) => {
      duck.merge(() => ({
        availableSlot: new Array(7).fill('')
          .map((v, i) => ({
            id: moment().add(i, 'days').startOf('day').toISOString(),
            date: moment().add(i, 'days').startOf('day').toISOString(),
            ...getSlotsObject(`slot${i}`, 1, true),
        })),
      }), { key: 'sessionHomepage' })
      if (extractedData && extractedData.availableSlot) {
        extractedData = {
          ...extractedData,
        }
      }
      return extractedData
    }
})
}

export default fetchSessionHomepage
