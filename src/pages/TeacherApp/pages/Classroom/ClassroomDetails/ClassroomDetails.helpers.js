import { get, sortBy } from "lodash"
import { getTimeRangeFromSession } from "../../../../../utils/teacherApp/mapQueryResponseToFullCalendarEvents"

const isNosOfCardsGreaterThan=(number=3,containerElement)=>{
  if(get(containerElement,'current.children')){
    return get(containerElement,'current.children').length>number
  }
}

const getClassroomTitle=(batchId,classrooms=[])=>{
    const classroom= classrooms.find(classroom=>get(classroom,'id')===batchId)
    if(classroom) return classroom.classroomTitle
    return ''
}
const getSessionAttendance = (batchDetail) => {
    const presentStudents = get(batchDetail, 'attendance', []).filter(student => student.status === 'present')
    return presentStudents.length
}

const modifiedBatchDetails = (batchDetails = [], batchDataCoursePackage = {}) => {
    let coursePackage = get(batchDataCoursePackage, 'courseTopicMappings.coursePackage.topics', []).length ? true : false
    let coursePackageTopics = get(batchDataCoursePackage, 'courseTopicMappings.coursePackage.topics', [])
    if (get(batchDataCoursePackage, 'courseTopicMappings.coursePackageTopicRule', []).length) {
        coursePackageTopics = get(batchDataCoursePackage, 'courseTopicMappings.coursePackageTopicRule', [])
    }
    coursePackageTopics = coursePackageTopics.filter(topicRule => !get(topicRule, 'isRevision') && get(topicRule, 'topic.classType') === 'lab')
    let sortedCoursePackage = sortBy(coursePackageTopics, 'order') || []
    const filterCompletedTopics=()=>{
        const batchDetailsIds = batchDetails.map(batchDetail=>get(batchDetail, 'topicData.id'))
        return sortedCoursePackage.filter(topicData=>batchDetailsIds.includes(get(topicData,'topic.id')))
    }
    const getTopicOrderFromCoursePackage=(topicId)=>{
        const topic = filterCompletedTopics().find(topicData=>get(topicData,'topic.id')===topicId)
        return get(topic, 'order'); 
    }
    const batchesWithoutTheory = batchDetails
        .filter(batchDetail => get(batchDetail, 'topicData.classType') !== 'theory')
    const modifiedData = batchesWithoutTheory
        .map((batchDetail, index) => {
            let topicOrder = sortedCoursePackage.findIndex(topicRule => get(topicRule, 'topic.id') === get(batchDetail, 'topicData.id'))
            if (topicOrder === -1) return [{label: ''}]
            if (topicOrder !== -1) topicOrder = topicOrder + 1
            return {
            label: `Lab ${topicOrder} - ${get(batchDetail, 'topicData.title')}`,
            value: get(batchDetail, 'topicData.id'),
            attendance: getSessionAttendance(batchDetail),
            totalStudents: get(batchDetail, 'attendance', []).length,
            topicOrder: topicOrder,
            courseId: get(batchDetail, 'topicData.coursesData[0].id'),
            sessionStartDate: get(batchDetail, 'sessionStartDate'),
            sessionEndDate: get(batchDetail, 'sessionEndDate'),
            sessionStatus: get(batchDetail, 'sessionStatus'),
    }
        }).sort((a,b) => get(b, 'topicOrder') - get(a, 'topicOrder'));
    return modifiedData
}
const modifiedNextSessionsDetails = (nextSessions = []) => {
    const modifiedData = nextSessions
        .filter(nextSession => get(nextSession, 'classType') !== 'theory')
        .map(nextSession => ({
        label: `${get(nextSession, 'topicTitle')}`,
        value: 'dwd',
        topicOrder: get(nextSession, 'topicOrder')
    }))
    return modifiedData
}

const getSubmissionCount = (arr) => {
    const totalCount = arr.length
    if (totalCount) {
        let gotCount = 0
        arr && arr.forEach(item => {
            gotCount += get(item, 'submissions').length
        })
        return gotCount / totalCount
    }
    return 0
}

const getClassworkReport = (LoComponent) => {
    const data = {
        topic: get(LoComponent, 'loTitle'),
        loId: get(LoComponent, 'loId'),
        submittedPercentage: get(LoComponent, 'submittedPercentage'),
        unAttempted: get(LoComponent, 'unattemptedPercentage'),
        correct: '',
        inCorrect: '',
        firstTryPercentage: get(LoComponent, 'firstTryPercentage'),
        secondTryPercentage: get(LoComponent, 'secondTryPercentage'),
        thirdTryPercentage: get(LoComponent, 'thirdTryPercentage'),
        avgTriesPerQuestion: get(LoComponent, 'avgTriesPerQuestion'),
        avgTimePerQuestion: get(LoComponent, 'avgTimePerQuestion'),
        averageScore: null,
        submissionCount: getSubmissionCount(get(LoComponent, 'pqIndividualQuestionReport')),
        questionCount: get(LoComponent, 'pqIndividualQuestionReport', []).length,
        pqIndividualQuestionReport: get(LoComponent, 'pqIndividualQuestionReport', [])
    }
    return data
}

const getDetailsOfSelectedTopic = (topicId, batchDetails) => {
    const data = batchDetails.find(session => get(session, 'topicData.id') === topicId)
    return data
}
const getBlockBasedPracticeComponents = (session) => {
    const data = get(session, 'topicData.topicComponentRule', []).filter((rule) => get(rule, 'componentName') === 'blockBasedPractice')
    return data
}

const getBlockBasedHomeworkPracticeComponents = (session) => {
    const data = get(session, 'topicData.topicComponentRule', []).filter((rule) => get(rule, 'componentName') === 'homeworkPractice')
    return data
}

const getProjectTitle = (blockBasedPracticeComponent) => {
    return get(blockBasedPracticeComponent, 'blockBasedProject.title', '')
}
const getProjectLogo = (blockBasedPracticeComponent) => {
    return get(blockBasedPracticeComponent, 'blockBasedProject.externalPlatformLogo.uri')
}

const getVideoTime = (video = {}) => {
    let diffInSeconds = get(video, 'videoEndTime', 0) - get(video, 'videoStartTime', 0)
    if(diffInSeconds===0) return `0s`
    let minutes=Math.floor(diffInSeconds/60)
    let seconds=Math.floor(diffInSeconds%60)
    return `${Number(minutes)}m ${Number(seconds)}s`
}
const getLoSlidesAndQuestionCount = (LOComponent = {}) => {
    if (get(LOComponent, 'learningSlidesMeta.count')) {
        return { slides: get(LOComponent, 'learningSlidesMeta.count'), questions: get(LOComponent, 'learningSlidesQuestionMeta.count') }
    } else {
        return { slides: get(LOComponent, 'messagesMeta.count'), questions: get(LOComponent, 'questionBankMeta.count') }
    }
}

const codingAssignments=(topicComponentRule=[])=>{
    const data = topicComponentRule.filter(rule=>get(rule,'componentName')==='assignment')
    return data
}

const isHomeworkQuizPresent=(session)=>{
    return get(session,'topicData.topicComponentRule',[]).find(rule=>get(rule,'componentName')==='quiz')
}
const isHomeworkAssignmentPresent=(session)=>{
    return get(session,'topicData.topicComponentRule',[]).find(rule=>get(rule,'componentName')==='homeworkAssignment')
}
const isHomeworkPracticePresent=(session)=>{
    return get(session,'topicData.topicComponentRule',[]).find(rule=>get(rule,'componentName')==='homeworkPractice')
}
const isHomeworkComponentPresent=(session)=>{
    return get(session,'topicData.topicComponentRule',[]).find(rule=>get(rule,'componentName')==='quiz'||get(rule,'componentName')==='homeworkPractice'||get(rule,'componentName')==='homeworkAssignment')
}
const isClassworkComponentPresent=(session)=>{
    return get(session,'topicData.topicComponentRule',[]).find(rule=>get(rule,'componentName')==='assignment'||get(rule,'componentName')==='learningObjective'||get(rule,'componentName')==='blockBasedPractice')
}

const getLOText=(slidesCount=0,questionsCount=0)=>{
    if(!slidesCount && !questionsCount) return ''
    if(!slidesCount && questionsCount) return `${questionsCount} Questions`
    if(slidesCount && !questionsCount) return `${slidesCount} Slides`
    if(slidesCount && questionsCount) return `${slidesCount} Slides | ${questionsCount} Questions`
}

const shouldHeaderBeVisible=(practiceQuestionReport=[],codingAssignments=[],blockBasedPractice=[])=>{
    if(practiceQuestionReport.length===0 && codingAssignments.length===0 && blockBasedPractice.length===0) return false
    return true
}

const getHomeworkPracticePercentage =(tcRule=[],homeworkReport={},componentId)=>{
    if(tcRule && (tcRule || []).length && (get(homeworkReport,'blockBasedPractice',[]) || []).length){
        let submittedPercentage=0;
        homeworkReport.blockBasedPractice.forEach(report=>{
            get(report,'questions',[]).forEach(question=>{
                if (get(question,'questionId')===componentId){
                    submittedPercentage = get(report,'submittedPercentage',0)
                }
            })
        })
        return submittedPercentage
    }
    return 0
}
const getBlockBasedPracticePercentage =(tcRule=[],classworkReport={},componentId)=>{
    if(tcRule && (tcRule || []).length && (get(classworkReport,'blockBasedPractice',[]) || []).length){
        let submittedPercentage=0;
        classworkReport.blockBasedPractice.forEach(report=>{
            get(report,'questions',[]).forEach(question=>{
                if (get(question,'questionId')===componentId){
                    submittedPercentage = get(report,'submittedPercentage',0)
                }
            })
        })
        return submittedPercentage
}
return 0
}

const getAbsentStudents=(attendance=[])=>{
    if(attendance && attendance.length){
        const data = attendance.filter(student=>!get(student,'isPresent'))
        return data
    }
    return []
}

const getEndDate=(dateString)=>{
    if(!dateString) return
    const months=['Jan','Feb','March','April','May','June','July','Aug','Sept','Oct','Nov','Dec']
    const date=new Date(dateString).getDate()
    const month = new Date(dateString).getMonth()
    return `${months[month]} ${date}`
}

const getHomeworkPracticeTitle=(hwComponent={})=>{
    if(hwComponent) return get(hwComponent,'blockBasedProject.title')
}

const filterSubmittedAssignmentData = (res) => {
    const practices = get(res, 'blockBasedPracitce', [])
    const questions = get(res, 'userAssignment', [])
    const getSubmittedAssignmentsStudents = {
        blockBasedPracitce: {},
        userAssignment: {},
        codingQuestions: get(res, 'codingQuestions', [])
    }
    if (practices.length) {
        let classWorkPractices = []
        let homeWorkPractices = []
        practices.forEach(practice => {
            if (get(practice, 'blockBasedPractice.isHomework')) {
                homeWorkPractices.push(practice)
            } else {
                classWorkPractices.push(practice)
            }
        })
        const blockBasedPracitce = {
            classWorkPractices,
            homeWorkPractices
        }
        getSubmittedAssignmentsStudents.blockBasedPracitce = blockBasedPracitce
    }
    if (questions.length) {
        let classWorkQuestions = []
        let homeWorkQuestions = []
        questions.forEach(question => {
            const assignmentsData = get(question, 'assignment', [])
            let classAssignment = []
            let homeAssignment = []
            assignmentsData.forEach(item => {
                if (get(item, 'assignmentQuestion.isHomework')) {
                    homeAssignment.push(item)
                } else {
                    classAssignment.push(item)
                }
            })
            if (classAssignment.length) {
                const obj = {
                    id: get(question, 'id'),
                    user: get(question, 'user'),
                    assignment: classAssignment
                }
                classWorkQuestions.push(obj)
            }
            if (homeAssignment.length) {
                const obj = {
                    id: get(question, 'id'),
                    user: get(question, 'user'),
                    assignment: homeAssignment
                }
                homeWorkQuestions.push(obj)
            }
        })
        const userAssignment = {
            classWorkQuestions,
            homeWorkQuestions
        }
        getSubmittedAssignmentsStudents.userAssignment = userAssignment
    }
    return getSubmittedAssignmentsStudents
}

const getsortedEvaluationData = (evaluationDataFromProps, blockBasedPracticeComponent) => {
    const blockBasedPracitce = get(evaluationDataFromProps, 'blockBasedPracitce')
    const classWorkPracticesTemp = get(blockBasedPracitce, 'classWorkPractices')
    const homeWorkPracticesTemp = get(blockBasedPracitce, 'homeWorkPractices')
    let classWorkPractices = []
    let homeWorkPractices = []
    blockBasedPracticeComponent && blockBasedPracticeComponent.forEach(item => {
        classWorkPracticesTemp && classWorkPracticesTemp.forEach(practice => {
            if (get(item, 'blockBasedProject.id') === get(practice, 'blockBasedPractice.id')) {
                classWorkPractices.push(practice)
            }
        })
        homeWorkPracticesTemp && homeWorkPracticesTemp.forEach(practice => {
            if (get(item, 'blockBasedProject.id') === get(practice, 'blockBasedPractice.id')) {
                homeWorkPractices.push(practice)
            }
        })
    })
    const obj = {
        classWorkPractices,
        homeWorkPractices
    }
    return obj
}

const getAllBlockBasedPracticeComponents = (session) => {
    const data = get(session, 'topicData.topicComponentRule', []).filter((rule) => get(rule, 'componentName') === 'blockBasedPractice' || get(rule, 'componentName') === 'homeworkPractice')
    return data
}

const getBlockBasedPracticeSubmissionCount =(tcRule=[],classworkReport={},componentId)=>{
    if(tcRule && (tcRule || []).length && (get(classworkReport,'blockBasedPractice',[]) || []).length){
        let submittedPercentage=0;
        classworkReport.blockBasedPractice.forEach(report=>{
            get(report,'questions',[]).forEach(question=>{
                if (get(question,'questionId')===componentId){
                    submittedPercentage = get(report,'submissions',[]).length
                }
            })
        })
        return submittedPercentage
}
return 0
}

export { modifiedBatchDetails, modifiedNextSessionsDetails, getClassworkReport, getDetailsOfSelectedTopic, getProjectTitle, getProjectLogo, getVideoTime, getLoSlidesAndQuestionCount, getBlockBasedPracticeComponents,codingAssignments,isHomeworkAssignmentPresent,isHomeworkPracticePresent,isHomeworkQuizPresent,isClassworkComponentPresent,isHomeworkComponentPresent,isNosOfCardsGreaterThan,getLOText,shouldHeaderBeVisible,getClassroomTitle,getHomeworkPracticePercentage,getBlockBasedPracticePercentage,getAbsentStudents,getEndDate,getHomeworkPracticeTitle,getBlockBasedHomeworkPracticeComponents,filterSubmittedAssignmentData,getsortedEvaluationData,getAllBlockBasedPracticeComponents,getBlockBasedPracticeSubmissionCount }