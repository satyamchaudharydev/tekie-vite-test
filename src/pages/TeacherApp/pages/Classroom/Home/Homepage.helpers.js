import { get } from "lodash"
import moment from "moment"
import getPath from "../../../../../utils/getFullPath"
import { getTimeRangeFromSession } from "../../../../../utils/teacherApp/mapQueryResponseToFullCalendarEvents"

const getTime = (dateObj) => {
    return moment(dateObj).format('LT').toLowerCase()
}

const getDay = (dateObj) => {
    return `${moment(dateObj).format('llll').split(',').slice(0, 2).join(',')}`
}

const getBatchNextSessions = (batchId, classNextSessions=[]) => {
    const nextSessions = classNextSessions.find(classObj => get(classObj,'id') === batchId)
    return get(nextSessions,'sessions',[])
}
const getBatchAttendanceAndProgress = (batchId, classroomDetails = []) => {
    const data = classroomDetails.find(batchObj => get(batchObj, 'id') === batchId)
    if(data){
        return {
            averageAttendance: get(data, 'averageAttendance'), sessionProgress: get(data, 'sessionProgress'), totalStudents: get(data, 'totalStudents')
        }
    }
    return { averageAttendance:0, sessionProgress:0, totalStudents: 0 }
}
const getBatchNextTopic = (batchNextSessions = []) => {
    if (batchNextSessions.length) return batchNextSessions[0].topicTitle
    return null
}
const getBatchNextTopicTiming = (batchNextSessions = []) => {

    if (batchNextSessions.length) {
        const session = batchNextSessions[0]
        const { startTime, endTime } = getTimeRangeFromSession(session.bookingDate, session)
        const sessionDay = getDay(startTime)
        return { startTime, endTime, sessionDay }
    }
    return null
}


const getUniqueGrades = (teachersBatchesData) => {
     const grades = new Set();
    teachersBatchesData.forEach((batch) => {
            grades.add(get(batch,'grade'))   
    });
   // const sortedGrades=Array.from(grades).sort((a,b)=>{
    //     const gradeNumber1=Number(a.substring(5))
    //     const gradeNumber2=Number(b.substring(5))
    //     return gradeNumber1-gradeNumber2
    // })
    return grades;
};

const getEmptyGradesCollection=(uniqueGrades,finalObj)=>{
    const finalObjCopy={...finalObj}
    uniqueGrades.forEach((grade) => {
        finalObjCopy[grade] = [];
    });
    return finalObjCopy
}


const fillUniqueGrades = ({finalObj,teacherBatches, classNextSessions, classroomDetails}) => {
    if(classroomDetails.length===0){
        const finalObjCopy = {...finalObj}
        teacherBatches.forEach(batch=>{
             
                if (batch.grade in finalObjCopy){
                    finalObjCopy[batch.grade].push({
                        uniqueGrade:get(batch,'grade'),
                        batchId: get(batch,'groupId'),
                        batchCount: get(batch,'members.count'),
                        classroomTitle: get(batch,'groupName'),
                        batchThumbnail: getPath(batch.thumbnailSmall),
                        batchNextTopic: null,
                        batchNextTopicTimeAndDay: null,
                        batchAttendance: 0,
                        sessionProgress:0
                    });
                }
          
        })

        return finalObjCopy
    }
    const finalObjCopy = {...finalObj}
    teacherBatches.forEach((batch) => {
        // return batch.classes.forEach((gradeSection) => {
            if (batch.grade in finalObjCopy) {
                // const batchNextSessions = getBatchNextSessions(batch.id, classNextSessions)
                const { averageAttendance, sessionProgress, totalStudents } = getBatchAttendanceAndProgress(batch.groupId, classroomDetails)
                finalObjCopy[batch.grade].push({
                    uniqueGrade:batch.grade,
                    batchId: batch.groupId,
                    batchCount: totalStudents || get(batch,'studentsMeta.count'),
                    classroomTitle: batch.groupName,
                    batchThumbnail: getPath(batch.thumbnailSmall),
                    // batchNextTopic: getBatchNextTopic(batchNextSessions),
                    // batchNextTopicTimeAndDay: getBatchNextTopicTiming(batchNextSessions),
                    batchAttendance: averageAttendance,
                    sessionProgress
                });
            }
        //});
    });
    // return finalObj
    return finalObjCopy
};

const getUniqueBatches = (teacherBatches, classNextSessions, classroomDetails) => {
   let finalObj = {}
    const uniqueGrades = getUniqueGrades(teacherBatches);
    const emptyUniqueGradesCollection=getEmptyGradesCollection(uniqueGrades,finalObj)
    if(classroomDetails.length===0){
        const objData= fillUniqueGrades({finalObj:emptyUniqueGradesCollection,teacherBatches, classNextSessions:[],classroomDetails:[]})
        let emptyCarousel=[]
        for(let key in objData){
          emptyCarousel.push(objData[key])
        }     
        return emptyCarousel;
    }
    const objData= fillUniqueGrades({finalObj:emptyUniqueGradesCollection,teacherBatches, classNextSessions,classroomDetails})
    let emptyCarousel=[]
    for(let key in objData){
      emptyCarousel.push(objData[key])
    }
   
    return emptyCarousel;
};

const getClassroomBatches=(teacherBatches)=>{
    if(teacherBatches && teacherBatches.length){
        return teacherBatches.map(batch=>({id:get(batch,'groupId'),classroomTitle:get(batch,'groupName'),classes:[batch]}))
    }
return []
}

export { getUniqueBatches,getTime,getClassroomBatches,getUniqueGrades }

