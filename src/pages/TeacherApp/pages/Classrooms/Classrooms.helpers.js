import get from "lodash/get";

const getBatchAttendanceAndProgress = (batchId, classroomDetails=[]) => {
    const data = classroomDetails.find(batchObj => get(batchObj,'id') === batchId)
    if(data){
    return { averageAttendance:get(data,'averageAttendance'), sessionProgress:get(data,'sessionProgress') }

    }
    return { averageAttendance:0, sessionProgress:0 }
}

const fillUniqueGrades = ({ finalObj, teacherBatches, classroomDetails, isAccessingTraingClasses = false }) => {
    const finalObjCopy = { ...finalObj }
    teacherBatches.forEach((batch) => {
        if (isAccessingTraingClasses) {
            const schoolName = get(batch, 'school.name');
            if (schoolName in finalObjCopy) {
                const { sessionProgress } = getBatchAttendanceAndProgress(get(batch, 'groupId'), classroomDetails)
                const batchAlreadyExistsForSameGrade = (finalObjCopy[schoolName] || []).find(el => get(el, 'batchId') === get(batch, 'groupId'))
                if (!batchAlreadyExistsForSameGrade) {
                    finalObjCopy[schoolName].push({
                        uniqueGrade: schoolName,
                        batchId: get(batch,'groupId'),
                        classroomTitle: (get(batch,'classroomTitle','') || '').replace(/^Grade/g, '').trim(),
                        sessionProgress
                    });
                }
            }
        } else {
            
                if (batch.grade in finalObjCopy) {
                    const { sessionProgress } = getBatchAttendanceAndProgress(get(batch, 'groupId'), classroomDetails)
                    const batchAlreadyExistsForSameGrade = (finalObjCopy[batch.grade] || []).find(el => get(el, 'batchId') === get(batch, 'groupId'))
                    if (!batchAlreadyExistsForSameGrade) {
                        finalObjCopy[batch.grade].push({
                            uniqueGrade:get(batch, 'grade'),
                            batchId: get(batch,'groupId'),
                            classroomTitle: (get(batch,'groupName','') || '').replace(/^Grade/g, '').trim(),
                            sessionProgress
                        });
                    }
                }
           
        }
    });
    // return finalObj
    return finalObjCopy
};

const getUniqueGrades = (teachersBatchesData, isAccessingTraingClasses = false) => {
    const grades = new Set();
    teachersBatchesData.forEach((batch) => {
        isAccessingTraingClasses ? grades.add(get(batch, 'school.name')) : 
            grades.add(get(batch,'grade'))
        
    });
    // const sortedGrades = Array.from(grades).sort((a, b) => {
    //     if (isAccessingTraingClasses) {
    //         return a-b
    //     }
    //     const gradeNumber1=Number(a.substring(5))
    //     const gradeNumber2=Number(b.substring(5))
    //     return gradeNumber1-gradeNumber2
    // })
    return grades;
};

const getEmptyGradesCollection=(uniqueGrades,finalObj)=>{
    const finalObjCopy={...finalObj}
    uniqueGrades.forEach((grade) => {
       finalObjCopy[grade.toString()] = [];
    });
    return finalObjCopy
}

const getClassroomBatches = (teacherBatches) => {
    if(teacherBatches && teacherBatches.length){
        return teacherBatches.map(batch=>({id:get(batch,'groupId'),classroomTitle:get(batch,'groupName'),classes:[batch]}))
    }
return []
}

const getUniqueBatches = (teacherBatches = [], classroomDetails = [], isAccessingTraingClasses = false) => {
    let finalObj={}
    const uniqueGrades = getUniqueGrades(teacherBatches, isAccessingTraingClasses);
    const emptyUniqueGradesCollection=getEmptyGradesCollection(uniqueGrades,finalObj)
    if(classroomDetails.length===0){
        const objData= fillUniqueGrades({finalObj:emptyUniqueGradesCollection,teacherBatches,classroomDetails:[], isAccessingTraingClasses})
        let emptyCarousel = []
        for(let key in objData){
          emptyCarousel.push(objData[key])
        }
        return emptyCarousel;
    }
    const objData= fillUniqueGrades({finalObj:emptyUniqueGradesCollection,teacherBatches,classroomDetails, isAccessingTraingClasses})
    let emptyCarousel = []
    for(let key in objData){
      emptyCarousel.push(objData[key])
    }
    return emptyCarousel;

}

export { getUniqueBatches,getClassroomBatches,getUniqueGrades }