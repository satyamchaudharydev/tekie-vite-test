import gql from "graphql-tag"
import get from 'lodash/get'
import moment from "moment"
import requestToGraphql from "../../../../utils/requestToGraphql"

export const getColorThemeForCard = (type) => {
    // if (type === 'allotted') return 'teacherAppCalendarCardYetToBegin'
    if (type === 'allotted') return ''
    if (type === 'completed') return 'teacherAppCalendarCardCompleted'
    if (type === 'started') return 'teacherAppCalendarCardInProgress'
    if (type === 'unattended') return 'teacherAppCalendarCardUnAttended'
}

export const getColorThemeForGradeBadge = (type) => {
    if (type === 'completed') return 'teacherAppCalendarCardBadgeCompleted'
    if (type === 'allotted') return 'teacherAppCalendarCardBadgeYetToBegin'
    if (type === 'started') return 'teacherAppCalendarCardBadgeInProgress'
    if (type === 'unattended') return 'teacherAppCalendarCardBadgeUnAttended'
}

export const getGrade = (grade) => {
    if (grade) {
        const [_, gradeNumber] = grade.split('Grade')
        return gradeNumber
    }
}

export const getTimeFormat = (time,startTime,minutes,id) => {
//     if(time){
//         const hours = time.getHours()
//         const minutes = time.getMinutes()
//         if(minutes){
//             if(hours<12){
//                 return `${hours}:${minutes}am`
//             }
//             if(hours>=12){
//                 return `${hours}:${minutes}pm`
//             }
           
//         }else{
//             if(hours<12){
//                 return `${24-hours}:00 am`
//             }
//             if(hours>=12){
//                 return `${24-hours}:00 pm`
//             }
//         }
       
//     }
//    return ''
    // if(id==='cl1moqcxa002x0xvrcn6e4xg2'){
    //     console.log({time,startTime,minutes})
    // }
    let newTime = time
    if(newTime===null){
        newTime= moment(startTime).add(1,'hours')
    }

   if(minutes){
    //    if(id==='cl1moqcxa002x0xvrcn6e4xg2'){
    //     console.log(moment(newTime).add(minutes, 'm').format('h:mma'))
    //    }
       
       return moment(newTime).add(minutes, 'm').format('h:mma');
   }
    return moment(newTime).minutes() === 0 ? moment(newTime).format('ha') : moment(newTime).format('h:mma')
}

export const generateOtpForUnAttendedSession = async (batchSessionId) => {
  const res = await requestToGraphql(gql`mutation {
    generateBatchSessionOtp(
      batchSessionIds: ["${batchSessionId}"]
    ) {
      id
      isRetakeSession
      schoolSessionsOtp {
        otp
      }
    }
  }`)
  return {
    otp: get(res, 'data.generateBatchSessionOtp[0].schoolSessionsOtp[0].otp', null),
  }
}

export const generateRetakeClass = async (batchSessionId) => {
  const res = await requestToGraphql(gql`mutation {
  addRetakeSession(
    input: { sessionStatus: allotted }
    batchSessionConnectId: "${batchSessionId}"
  ) {
    id
    sessionStatus
    sessionStartDate
    sessionEndDate
  }
  }`)
  return {
    retakeSessionDetail: get(res, 'data.addRetakeSession'),
  }
}

export const isSomeSessionInProgress=(allSessions=[])=>{
  const someSessionIsInProgress = allSessions.find(session=>get(session,'sessionStatus')==='started')
  return someSessionIsInProgress?true:false
}