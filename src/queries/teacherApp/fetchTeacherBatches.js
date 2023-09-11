import gql from 'graphql-tag'
import { List } from 'immutable'
import { get, first } from 'lodash'
import duck from '../../duck'
import { filterKey } from '../../utils/data-utils'
import getEnumArrForQuery from '../../utils/getEnumArrForQuery'
import getIdArrForQuery from '../../utils/getIdArrForQuery'
import { checkForSchoolTeacher, checkForSchoolTeacherInRawData } from '../../utils/teacherApp/checkForSchoolTeacher'

export const fetchClassroomSession = (input) => {
  return duck.query({
    query: gql`
    query ($input: [NextOrPrevClassroomSessionInput]!){
      classroomNextSessions : getNextOrPrevClassroomSessions(input: $input) {
        id: classroomId
        limit
        queryType
        sessions {
          id
          topicTitle
          topicOrder
          bookingDate
          totalStudents
          startMinutes
          endMinutes
          slot0
          slot1
          slot2
          slot3
          slot4
          slot5
          slot6
          slot7
          slot8
          slot9
          slot10
          slot11
          slot12
          slot13
          slot14
          slot15
          slot16
          slot17
          slot18
          slot19
          slot20
          slot21
          slot22
          slot23
          completedHomeworkMeta
          thumbnailSmall{
            uri
          }
          recordType
          sessionMode
          sessionStartDate
          sessionEndDate
          sessionStatus
          sessionRecordingLink
        }
      }
    }
    `,
    variables: {
      input
    },
    type: 'classroomNextSessions/fetch',
    key: 'classroomNextSessions',
    changeExtractedData: (extracted, original) => {
      if (get(original, 'classroomNextSessions', []).length) {
        let updatedTeacherSessions = []
        const teacherSessions = get(original, 'classroomNextSessions')
        updatedTeacherSessions = teacherSessions.map((teacher) => {
          let startTime
          let endTime
          let sessions = get(teacher, 'sessions')
          if (sessions && sessions.length) {
            let session = first(sessions)
            if (get(session, 'id')) {
              let slots = {}
              for (const key in session) {
                if (key.includes('slot')) slots[key] = session[key]
              }
              const slotsLength = Object.keys(slots).length
              const sessionDate = get(session, 'bookingDate')
              for (let i = 0; i < slotsLength; i++) {
                if (slots[`slot${i}`]) {
                  startTime = new Date(new Date(sessionDate).setHours(i, get(session, 'startMinutes'), 0, 0))
                  endTime = new Date(new Date(sessionDate).setHours(i + 1, get(session, 'endMinutes'), 0, 0))
                  break
                }
              }
            }
            return {
              ...teacher,
              topicTitle: get(session, 'topicTitle'),
              bookingDate: get(session, 'bookingDate'),
              startTime,
              endTime
            }
          } else {
            // const currentDate = new Date()
            // const startDate = moment(currentDate)
            // const endDate = moment(currentDate).add(1, 'hours')
            // return {
            //   ...teacher,
            //   topicTitle: '',
            //   bookingDate: startDate,
            //   startTime: startDate,
            //   endTime: endDate,
            // }
            return {
              ...teacher,
              topicTitle: '',
              // bookingDate: '',
              // startTime: '',
              // endTime: '',
            }
          }
        })
        extracted.classroomNextSessions = [...updatedTeacherSessions]
        return { ...extracted }
      }
    }
  })
}

export const fetchClassroomDetails=(batchIds)=>{
  // return duck.query({
  //   query:gql`
    
  //     {
  //       classroomDetails:getClassroomDetails(batchIds:[${getIdArrForQuery(batchIds)}]) {
  //       id
  //       averageAttendance
  //       code
  //       classroomTitle
  //       totalStudents
  //       averageAttendance
  //       sessionProgress
  //     }
  //   }
  //   `,
  //   type:'classroomDetails/fetch',
  //   key:'classroomDetails',
  //   // changeExtractedData:(extractedData,originalData)=>{
  //     //This methid also works
  //   //   extractedData.classroomDetails=originalData.getClassroomDetails
  //   //   return {
  //   //     ...extractedData
  //   //   }
  //   // }
  // })

  return duck.query({
    query: `/classroomDetails`,
    options: {
			tokenType: "appTokenOnly",
			input: {},
			rest: true,
			method: "post",
			data: { batchIds },
			apiType: "classroomDetails",
    },
    changeExtractedData: async (extracted, original) => {
      return { ...extracted };
		},
		type: 'classroomDetails/fetch',
		key: 'classroomDetails',
  })
}


const  fetchTeacherBatches = ({ mentorId, classroomIn, gradeIn, sectionIn, first, skip, filterByBatches, fetchTrainingBatches },loggedInUser) => {
//   const academicYearId = localStorage.getItem('academicYear') || ''
//   let academicYearFilter = ''
//   if (academicYearId && ![null, undefined, 'null', 'undefined'].includes(academicYearId)) {
//     academicYearFilter = `{ academicYear_some: { id: "${academicYearId}" } }`
//   }
//   const getQuery=()=>{
//     let user = filterKey(window && window.store.getState().data.getIn(['user', 'data']), 'loggedinUser') || List([])
//     user=user.toJS()[0]
//     let schoolId = get(user, 'schools[0].id')
//     if (fetchTrainingBatches) {
//       if (checkForSchoolTeacher(user)) {
//         if (checkForSchoolTeacherInRawData(user)) {
//           mentorId = get(user, 'rawData.id')
//         }
//       }
//       return `{
//             teacherBatches: batches(filter:{
//               and: [
//                 ${mentorId ? `{ allottedMentor_some: { id: "${mentorId}" } }` : ''}
//                 { documentType: classroom }
//                 { isTeacherTraining: true }
//               ]
//             }){
//               school{
//                 id
//                 name
//               }
//               id
//               createdAt
//               allottedMentor{
//                 id
//                 name
//               }
//               thumbnailSmall
//               studentsMeta {
//                 count
//               }
//               classes {
//                 grade
//                 section
//               }
//               classroomTitle
//               course {
//                 tools { value }
//                 theory { value }
//                 programming { value }
//               }
//             }
//           }`
//     }
//     if (checkForSchoolTeacher(user)) {
//       if (checkForSchoolTeacherInRawData(user)) {
//         mentorId = get(user, 'rawData.id')
//       }
//       return  `{
//         teacherBatches: batches( filter: {
//           and: 
//           [
//             ${mentorId ? `{ allottedMentor_some: { id: "${mentorId}" } }` : ''}
//             ${classroomIn && classroomIn.length > 0 ? `{ classroomTitle_in: [${getIdArrForQuery(classroomIn)}] }` : ''}
//             ${gradeIn && gradeIn.length > 0 ? `{ classes_some: { grade_in: [${getEnumArrForQuery(gradeIn)}]} }` : ''}
//             ${sectionIn && sectionIn.length > 0 ? `{ classes_some: { section_in: [${getEnumArrForQuery(sectionIn)}] } }` : ''}
//             { documentType: classroom }
//             { isTeacherTraining_not: true }
//             ${filterByBatches.length?`{
//               id_in:[${getIdArrForQuery(filterByBatches)}]
//             }`:''}
//             ${academicYearFilter}
//           ]  
//         },
//         orderBy: createdAt_DESC ) 
//         {
//           id
//           createdAt
//           thumbnailSmall
//           studentsMeta {
//             count
//           }
//           classes {
//             grade
//             section
//           }
//           classroomTitle
//         }
//       }
// `
//     }
    
//     return `{
//       teacherBatches: batches( filter: {
//         and: 
//         [
//           ${schoolId ? `{school_some: { id: "${schoolId}" } }` : ''}
//           ${classroomIn && classroomIn.length > 0 ? `{ classroomTitle_in: [${getIdArrForQuery(classroomIn)}] }` : ''}
//           ${gradeIn && gradeIn.length > 0 ? `{ classes_some: { grade_in: [${getEnumArrForQuery(gradeIn)}]} }` : ''}
//           ${sectionIn && sectionIn.length > 0 ? `{ classes_some: { section_in: [${getEnumArrForQuery(sectionIn)}] } }` : ''}
//           { documentType: classroom }
//           { isTeacherTraining_not: true }
//         ]  
//       }, 
//       first: ${first}, 
//       skip: ${skip * first}, 
//       orderBy: createdAt_DESC ) 
//       {
//         id
//         createdAt
//         allottedMentor{
//           id
//           name
//         }
//         thumbnailSmall
//         studentsMeta {
//           count
//         }
//         classes {
//           grade
//           section
//         }
//         classroomTitle
//         course {
//           tools { value }
//           theory { value }
//           programming { value }
//         }
//       }
//     }`
//   }

//   return duck.query({
//     query: gql` 
//     ${getQuery()}
//     `
//     ,
//     type: 'teacherBatches/fetch',
//     key: 'teacherBatches',
//     changeExtractedData: async (extracted, original) => {
//       extracted.course = []
//       return { ...extracted }
//     }
//   })
	const divId = get(loggedInUser, 'divid')
	const academicYearId = get(loggedInUser, 'academicyear.id')
	return duck.query({
		query: `https://api-stage.uolo.co/core/v1/div/groups/user-class-groups/${divId}/${academicYearId}`,
		options: {
			rest: true,
			method: "get",
			headers: {
				"x-login": get(loggedInUser, 'logindetails.loginid'),
				"x-permission": "NONE",
				"x-token": get(loggedInUser, 'logindetails.token'),
				"x-user-id": get(loggedInUser, 'id'),
			},
			apiType: "teacherBatches",
    },
		changeExtractedData: async (extracted, original) => {
      extracted.course = [];
      extracted.teacherBatches.groups = get(extracted, 'teacherBatches.groups').filter(element => element.grade <= 12 && element.isAdminGroup)
     if (filterByBatches && filterByBatches.length) {
      extracted.teacherBatches.groups = get(extracted, 'teacherBatches.groups').filter(element => filterByBatches.includes(element.groupId)) 
      }
      return { ...extracted };
		},
		type: "teacherBatches/fetch",
		key: "teacherBatches",
	});
}

export default fetchTeacherBatches