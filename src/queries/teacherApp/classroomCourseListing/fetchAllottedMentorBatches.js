import gql from "graphql-tag";
import get from "lodash/get";
import duck from "../../../duck";
import { checkForSchoolTeacherInRawData } from "../../../utils/teacherApp/checkForSchoolTeacher";


const fetchAllottedMentorBatches = async (allottedMentorId, user, fromTeacherTrainingBatch) => {
//   if (checkForSchoolTeacherInRawData(user)) {
//     allottedMentorId = get(user, 'rawData.id')
//   }
//   const academicYearId = localStorage.getItem('academicYear') || ''
//   let academicYearFilter = ''
//   if (academicYearId && ![null, undefined, 'null', 'undefined'].includes(academicYearId)) {
//     academicYearFilter = `{ academicYear_some: { id: "${academicYearId}" } }`
//   }
//   return duck.query({
//     query: gql`{
//   batches(filter:{
//     and:[
//       { documentType: classroom }
//       { allottedMentor_some:{id:"${allottedMentorId}"} }
//       ${fromTeacherTrainingBatch ? '{ isTeacherTraining: true }' : '{ isTeacherTraining_not: true }'}
//       ${(academicYearId && !fromTeacherTrainingBatch && academicYearFilter) ? academicYearFilter : ''}
//     ]
//   }){
//     id
//     code
//     classroomTitle
//     classes{
//       grade
//       section
//     }
//   }
// }`,
//     type: "batches/fetch",
//     key: "batches",
//   });
};

export default fetchAllottedMentorBatches;
