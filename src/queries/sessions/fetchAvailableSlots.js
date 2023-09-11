// import gql from 'graphql-tag'
import moment from 'moment'
import duck from '../../duck'
// import offsetDate from '../../utils/date-utils/date-offset'
import { getSlotsObject } from '../../utils/getAvailableSlots'

const fetchAvailableSlots = async (id, force) => {
    return duck.merge(() => ({
      availableSlot: new Array(7).fill('')
        .map((v, i) => ({
          id: moment().startOf('day').toISOString(),
          date: moment().startOf('day').toISOString(),
          ...getSlotsObject(`slot${i}`, 1, true),
      })),
    }), { key: 'sessionHomepage' })
}

// const fetchAvailableSlots = (id, force = false) => {
//     const startDate = moment(new Date().setHours(0, 0, 0, 0)).format('YYYY/MM/DD')
//         const endDate = moment(offsetDate(new Date(), 6, 'ADD').setHours(0, 0, 0, 0)).format('YYYY/MM/DD')
//     return duck.createQuery ({
//         query : gql`
//             query {
//                 mentorAvailabilitySlots(filter: {
//                     and: [
//                     {date_gte: "${startDate}"}
//                     {date_lte: "${endDate}"}
//                     ]
//                 }) {
//                     id
//                     date
//                     slotName
//                     count
//                     menteeSessionsMeta {
//                         count
//                     }
//                     batchSessions {
//                         id
//                         batch {
//                             type
//                         }
//                     }
//                 }
//                 user(id:"${id}") {
//                     id
//                     signUpBonusCredited
//                     signUpBonusNotified
//                 }
//             }
//         `,
//         type: 'availabilitySlot/fetch',
//         key: 'availabilitySlot',
//         force,
//         changeExtractedData: (extractedData, originalData) => {
//             if (extractedData && extractedData.availableSlot) {
//                 extractedData = {
//                     ...extractedData,
//                     availableSlot: new Array(7).fill('')
//                         .map((v, i) => (
//                             config.slotsWindow.map({
//                                 id:  Math.random().toString(36).substr(2, 9),
//                                 date: moment().startOf('day').toISOString(),
//                                 a: getSlotsObject(`slot`)
//                             })
//                         )),
//                 }
//             }
//             return extractedData
//         }
//     })
// }


export default fetchAvailableSlots
