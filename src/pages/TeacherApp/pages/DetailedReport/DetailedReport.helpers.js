import { get } from "lodash"
import { useMemo } from "react"
import { useLocation } from "react-router"

const getBatchDetails = (batchId = '', batchSessions = []) => {
    if (batchId) {
        const batchObj = batchSessions.find(batch => get(batch, 'batchData.id') === batchId)
        return batchObj
    }
}
const getTopicDetails = (topicId = '', batchSessions = []) => {
    if (topicId) {
        const topicObj = batchSessions.find(batch => get(batch, 'topicData.id') === topicId)
        return topicObj
    }
}

const getLoComponentList = (tcRule=[]) => {
    if (tcRule && tcRule.length) {
        const data = tcRule.filter(rule => rule.componentName === 'learningObjective')
        return data
    }
    return []
}

const getTitle = (str = '') => {
    if (str.length > 12) return str.slice(0, 12) + '...'
    return str
}

const getQuestionsCount = (loId, tcRule = []) => {
    if (tcRule && tcRule.length && loId) {
        const LOComponent = tcRule.find(rule => get(rule, 'learningObjective.id') === loId)
        return get(LOComponent, 'learningObjective.questionBankMeta.count') || '0'
    } return 0
}

const getTotalPracticeQuestions = (loId,tcRule = []) => {
    const getQuestionCount = (count, loComp) => {
        const data = get(loComp, 'learningObjective.questionBank', []).filter(question=>get(question,'assessmentType')==='practiceQuestion').length
        return data + count
    }
    if (tcRule && tcRule.length && loId) {
        const totalNosOfQuestions = tcRule.filter(rule => rule.componentName === 'learningObjective' && get(rule,'learningObjective.id')===loId).reduce((finalCount, loComp) => getQuestionCount(finalCount, loComp), 0)
        return totalNosOfQuestions
    }
    return 0
}

const getQuestionsList = (loId, tcRule = []) => {
    if (loId) {
        const data = tcRule.find(rule => get(rule, 'learningObjective.id') === loId)
        if (data) {
            const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
            const modifiedData = get(data, 'learningObjective.questionBank').map(question => {
                if(base64regex.test(question.statement)){
                return { ...question }
                }else{
                return { ...question }
                }
            })
            return modifiedData
        }
    }
    return []
}

const getAllQuestionsByType=(tcRule=[],type)=>{
    let questions=[]
    if(tcRule && tcRule.length){
       tcRule.forEach(rule=>{
            if(get(rule,'componentName')==='learningObjective' && get(rule,'learningObjective.questionBank',[]).length!==0){
                questions = [...questions,...get(rule,'learningObjective.questionBank')]
            }
        })
        questions = questions.filter(question=>get(question,'assessmentType')===type)
        return questions
    }
    return []
}

const getFilteredQuestionsByType = (questions = [], filterBy = 'practiceQuestion') => {
    if (questions && questions.length) {
        const data = questions.filter(question => get(question, 'assessmentType') === filterBy)
        return data
    }
    return []
}

const isAssignmentPresent = (tcRule = []) => {
    if (tcRule && tcRule.length) {
        const data = tcRule.find(rule => get(rule, 'componentName') === 'assignment')
        return data
    }
    return false
}
const isQuizPresent = (tcRule = []) => {
    if (tcRule && tcRule.length) {
        const data = tcRule.find(rule => get(rule, 'componentName') === 'quiz')
        return data
    }
    return false
}

const isBlockBasedDataPresent=(tcRule = [])=>{
    if (tcRule && tcRule.length) {
        const data = tcRule.find(rule => get(rule, 'componentName') === 'blockBasedProject' || get(rule,'componentName')==='blockBasedPractice')
        return data
    }
    return false
}
const isHomeworkAssignmentPresent = (tcRule = []) => {
    if (tcRule && tcRule.length) {
        const data = tcRule.find(rule => get(rule, 'componentName') === 'homeworkAssignment')
        return data
    }
    return false
}

const getFilteredCodingQuestions = (isHomework = false, codingQuestions = []) => {
    if (codingQuestions && codingQuestions.length) {
        const filteredData = codingQuestions.filter(question => get(question, 'isHomework') === isHomework)
        return filteredData;
    }
    return []
}

const getFilteredBlocklyQuestions=(tcRule=[],filterBy)=>{
    if(tcRule && tcRule.length){
        const data =tcRule.filter(rule=>get(rule,'componentName')===filterBy)
        return data.map(project => ({ ...get(project, 'blockBasedProject') }))
    }
    return []
}

const isHomeworkPresent = (tcRule = []) => {
    if (tcRule && tcRule.length) {
        return !!tcRule.find(rule => get(rule, 'componentName') === 'quiz' || get(rule, 'componentName') === 'homeworkPractice' || get(rule, 'componentName') === 'homeworkAssignment')
    }
}

const getActiveLoPqReport=(loId,pqReports=[])=>{
    if(loId && pqReports.length){
        const data = pqReports.find(report=>get(report,'loId')===loId)
        if(data) return data?data:{}
    }
    return {}
}

const isAssignmentOrBlocklyPresent=(tcRule=[])=>{
    if(tcRule && tcRule.length){
      const data = tcRule.filter(rule=>get(rule,'componentName')==='assignment'||get(rule,'componentName')==='blockBasedPractice'||get(rule,'componentName')==='blockBasedProject')
      return data
    }
    return []
  }

const isHomeworkAssignmentOrBlocklyPresent=(tcRule=[])=>{
    if(tcRule && tcRule.length){
      const data = tcRule.filter(rule=>get(rule,'componentName')==='homeworkAssignment'||get(rule,'componentName')==='homeworkPractice')
      return data
    }
    return []
  }
const getHomeworkCount=(tcRule=[])=>{
    let count=0
    if (tcRule && tcRule.length) {
        const data = isHomeworkAssignmentOrBlocklyPresent(tcRule).forEach(rule=>{
            if(get(rule,'blockBasedProject.id')){
                count++
            }
        })
    }
    return count
}

const getClassworkCount=(tcRule=[],nonHomeworkCodingQuestions=[])=>{
    let count=0
    if (tcRule && tcRule.length) {
        const data = tcRule.forEach(rule=>{
            if((get(rule,'componentName')==='blockBasedPractice'||get(rule,'componentName')==='blockBasedProject') && get(rule,'blockBasedProject.id')){
                count++
            }
            if(get(rule,'componentName')==='assignment' && nonHomeworkCodingQuestions.length){
                count = count + nonHomeworkCodingQuestions.length
            }
        })
    }
    return count
}


const getTotalAssignmentPercentage=(tcRule=[],classworkReport={},codingQuestions=[])=>{
    if(tcRule && tcRule.length){
        const blockBasedPractice = getFilteredBlocklyQuestions(tcRule,'blockBasedPractice')
        const blockBasedProject = getFilteredBlocklyQuestions(tcRule,'blockBasedProject')
        const totalBlocklyIds = [...blockBasedPractice,...blockBasedProject].map(obj=>get(obj,'id'))
        const totalCodingIds=codingQuestions && codingQuestions.map(question=>get(question,'id'))
        let accumulatedBlocklyPercentage = 0;
        (get(classworkReport,'blockBasedPractice',[]) || []).forEach(report=>{
               get(report,'questions',[]).forEach(question=>{
                   if(totalBlocklyIds.includes(get(question,'questionId'))){
                       accumulatedBlocklyPercentage+=get(report,'submittedPercentage')
                   }
               })     
        })

        get(classworkReport,'coding.questions',[]).forEach(question=>{
            if(totalCodingIds.includes(get(question,'questionId'))){
                accumulatedBlocklyPercentage+=get(question,'percentageCorrect',0)
            }     
            })

        const totalNosOfQuestions= totalCodingIds.length + totalBlocklyIds.length
        if(totalNosOfQuestions){
            return Math.round(Number(accumulatedBlocklyPercentage.toFixed(2))/totalNosOfQuestions)
        }
        return 0
    }

    return 0
}
const checkIfShowPercentage=(tcRule=[],classworkReport={},codingQuestions=[])=>{
    let count = 0
    if(tcRule && tcRule.length){
        const blockBasedPractice = getFilteredBlocklyQuestions(tcRule,'blockBasedPractice')
        const blockBasedProject = getFilteredBlocklyQuestions(tcRule,'blockBasedProject')
        const totalPractices = [...blockBasedPractice,...blockBasedProject]
        totalPractices.length && totalPractices.forEach(item => {
            if (get(item, 'isSubmitAnswer')) {
                count += 1
            }
        })
        return totalPractices.length === count
    }
    return true
}
const getTotalHomeworkAssignmentPercentage=(tcRule=[],homeworkCodingQuestions=[],homeworkReport={},homeworkPracticeQuestions=[])=>{

    if(((tcRule && tcRule.length) && (homeworkCodingQuestions && homeworkCodingQuestions.length)) || (homeworkPracticeQuestions && homeworkPracticeQuestions.length)){
        const homeworkAssignmentIds = homeworkCodingQuestions.map(ques=>get(ques,'id')) 
        const homeworkPracticeIds = getFilteredBlocklyQuestions(tcRule,'homeworkPractice').map(comp=>get(comp,'id'))
        const totalHomeworkIds = [...homeworkAssignmentIds,...homeworkPracticeIds]
        let accumulatedPracticePercentage=0

        get(homeworkReport,'blockBasedPractice',[]).forEach(report=>{
               get(report,'questions',[]).forEach(question=>{
                   if(totalHomeworkIds.includes(get(question,'questionId'))){
                       accumulatedPracticePercentage+=get(report,'submittedPercentage',0)
                   }
               })     
        })
        get(homeworkReport,'coding.questions',[]).forEach(question=>{
                   if(totalHomeworkIds.includes(get(question,'questionId'))){
                       accumulatedPracticePercentage+=get(question,'percentageCorrect',0)
                   }     
        })

        return Math.round(Number(accumulatedPracticePercentage.toFixed(2))/totalHomeworkIds.length)
    }
     return 0
}

const getBatchStrength=(attendanceList=[])=>{
    const getCount=(bool)=> !bool?0:1
    if(attendanceList && attendanceList.length){
        return attendanceList.reduce((totalPresent,student)=>totalPresent+getCount(get(student,'isPresent')),0)
    }
    return 0
}

  const getFilteredByLoQuizQuestions=(dropDownSelectedLo,allQuizQuestionList)=>{

      if(dropDownSelectedLo==='all'){
        return allQuizQuestionList
      }
      if(allQuizQuestionList && allQuizQuestionList.length){
        const data = allQuizQuestionList.filter(ques=>{
           return get(ques,'learningObjectives',[]).find(objective=>get(objective,'id')===dropDownSelectedLo)
        })
        return data
      }
      return []   
  }

  const getFilteredAssignmentQuestions=(isHomework=false,assignmentQues=[])=>{
        if(assignmentQues && assignmentQues.length){
            const filteredAssignmentQuestions = assignmentQues.map(obj=>({...obj.assignmentQuestion})).filter(ques=>get(ques,'isHomework')===isHomework && get(ques, 'status') === 'published')
            return filteredAssignmentQuestions
        }
        return []
  }

  const getQuestionsByAssessmentType=(type='quiz',questions=[])=>{
    if(questions && questions.length){
        const filteredQuestions = questions.map(obj=>({...obj.question})).filter(ques=>get(ques,'assessmentType')===type && get(ques, 'status') === 'published')
        return filteredQuestions
    }
    return []
  }
  const getSectionHeading=(tcRule=[],classworkCount)=>{
    if(tcRule && tcRule.length){
       if(tcRule.find(rule=>get(rule,'componentName')==='blockBasedPractice' || get(rule,'componentName')==='blockBasedProject')){
           return 'Coding'
        }
        return classworkCount>1?'Assignments':'Assignment'
    }
    return 'Assignments'
  }

  const useQuery=()=> {
    const { search } = useLocation();
  
    return useMemo(() => new URLSearchParams(search), [search]);
  }

  

export { getBatchDetails, getTopicDetails, getLoComponentList, getTitle, getQuestionsCount,getQuestionsList, getTotalPracticeQuestions, isAssignmentPresent, getFilteredCodingQuestions, getFilteredQuestionsByType,isHomeworkPresent,isQuizPresent,isHomeworkAssignmentPresent,isBlockBasedDataPresent,getFilteredBlocklyQuestions,getAllQuestionsByType,getActiveLoPqReport,isHomeworkAssignmentOrBlocklyPresent,getHomeworkCount,getClassworkCount,isAssignmentOrBlocklyPresent,getTotalAssignmentPercentage,getTotalHomeworkAssignmentPercentage,getBatchStrength,getFilteredAssignmentQuestions,getQuestionsByAssessmentType,getFilteredByLoQuizQuestions,getSectionHeading,useQuery,checkIfShowPercentage }