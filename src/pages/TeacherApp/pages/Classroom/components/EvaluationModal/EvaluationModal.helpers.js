import {get} from "lodash"
import duck from "../../../../../../duck"
import addEvaluation from "../../../../../../queries/teacherApp/addEvaluation"
import updateUserAssignment from "../../../../../../queries/teacherApp/updateUserAssignment"
import updateUserBlockBasedPractice from "../../../../../../queries/teacherApp/updateUserBlockBasedPractice"
import { filterNullValues } from "../../../../utils"

const checkForFirstStudent=(idx,students=[])=>{
  if(students && students.length){
    return idx===0?true:false
  }
}

const checkForLastStudent=(idx,students=[])=>{
  if(students && students.length){
    return idx===students.length-1?true:false
  }
}

const checkForFirstQuestion=(quesId,questions)=>{
  const formatedQuestions = Object.keys(questions)
  if(formatedQuestions && formatedQuestions.length){
    const idx= getQuestionIndexFromArrayId(quesId, formatedQuestions)
    return idx===0?true:false
  }
}

const checkForLastQuestion=(quesId,questions)=>{
  const formatedQuestions = Object.keys(questions)
  if(formatedQuestions && formatedQuestions.length){
    const idx= getQuestionIndexFromArrayId(quesId, formatedQuestions)
    return idx===formatedQuestions.length-1?true:false
  }
}

const checkForFirstQuestionStudentLevel = (quesId,questions)=>{
  if (questions && questions.length) {
    const idx = questions.findIndex(question => get(question, 'assignmentQuestion.id') === quesId)
    return idx===0?true:false
  }
}

const checkForLastQuestionStudentLevel = (quesId,questions)=>{
  if (questions && questions.length) {
    const idx = questions.findIndex(question => get(question, 'assignmentQuestion.id') === quesId)
    return idx===questions.length-1?true:false
  }
}

const checkForFirstPracticeStudentLevel = (quesId,questions)=>{
  if (questions && questions.length) {
    const idx = questions.findIndex(question => get(question, 'blockBasedPractice.id') === quesId)
    return idx===0?true:false
  }
}

const checkForLastPracticeStudentLevel = (quesId,questions)=>{
  if (questions && questions.length) {
    const idx = questions.findIndex(question => get(question, 'blockBasedPractice.id') === quesId)
    return idx===questions.length-1?true:false
  }
}

const checkForFirstPractice=(pracId,practices)=>{
  const formatedPractices = Object.keys(practices)
  if(formatedPractices && formatedPractices.length){
    const idx= getQuestionIndexFromArrayId(pracId, formatedPractices)
    return idx===0?true:false
  }
}

const checkForLastPractice=(pracId,practices)=>{
  const formatedPractices = Object.keys(practices)
  if(formatedPractices && formatedPractices.length){
    const idx= getQuestionIndexFromArrayId(pracId, formatedPractices)
    return idx===formatedPractices.length-1?true:false
  }
}

const getInputToAddUserAssignment=({questions})=>{
    const inputList=[]
    if(questions && questions.length){
      questions.forEach(ques=>{
        inputList.push({
					assignmentQuestionConnectId: get(ques,'assignmentQuestion.id'),
					assignmentQuestionDisplayOrder: get(ques,'order')
				},)
      })
    }
    return inputList
}

const submitEvaluationCoding=async({ questions,currentQuesNos,rating,tags=[],comment,userAssignmentsInContext,selectedStudent,assignmentData,evaluationType,evaluationTypes,presentStudents,currentStudentNos,openedFromStudentPerformance })=>{
  try{
    let userConnectId = null
    let currentQuesId = null
    let assignmentId = null
    let assignmentQuestions = []
    const codingQuestions = get(assignmentData, 'codingQuestions', [])
    if (openedFromStudentPerformance) {
      assignmentId = get(userAssignmentsInContext[selectedStudent.value], 'id')
      currentQuesId = get(questions[currentQuesNos], 'assignmentQuestion.id')
      userConnectId = get(selectedStudent, 'value')
      assignmentQuestions = questions
    } else {
      const currentQuestion = presentStudents[currentStudentNos]
      userConnectId = get(currentQuestion, 'user.id')
      currentQuesId = get(currentQuestion, 'question.assignmentQuestion.id')
      assignmentId = get(currentQuestion, 'id')
      for(const id in userAssignmentsInContext) {
        const assignments = userAssignmentsInContext[id]
        assignments.forEach(item => {
          if (get(item, 'id') === assignmentId) {
            assignmentQuestions.push(get(item, 'question'))
          }
        })
      }
    }
    let tagIds
    if(tags.length){
      tagIds=tags.map(tag=>get(tag,'id'))
    }
    const evalId = await addEvaluation({ star: rating, tags: tagIds, comment: encodeURIComponent(comment), userConnectId})
    let input=[];
    if(codingQuestions.length){
      codingQuestions.forEach(ques=>{
        const quesCopy={...ques}
        delete quesCopy.assignmentQuestion
        delete quesCopy.evaluation
        const quesObj=filterNullValues(quesCopy)
        if(get(ques,'assignmentQuestion.id')===currentQuesId){
          input.push({...quesObj,evaluationConnectId:evalId,assignmentQuestionConnectId:ques.assignmentQuestion.id})
        }else{
          const evaluationConnectId = get(ques,'evaluation.id',null)
          if(evaluationConnectId){
            input.push({...quesObj,assignmentQuestionConnectId:ques.assignmentQuestion.id,evaluationConnectId})
          }else{
            input.push({...quesObj,assignmentQuestionConnectId:ques.assignmentQuestion.id})
          }
        }
      })
      const res = await updateUserAssignment({assignmentId,input}).call()
      if (get(res, 'updateUserAssignment.id')) {
        let questionsToUpdate = []
        if (evaluationType === evaluationTypes.CODING_ASSIGNMENT) {
          questionsToUpdate = get(assignmentData, 'userAssignment.classWorkQuestions', [])
        } else if (evaluationType === evaluationTypes.HW_ASSIGNMENT) {
          questionsToUpdate = get(assignmentData, 'userAssignment.homeWorkQuestions', [])
        }
        let updatedClassworkQuestions = []
        questionsToUpdate && questionsToUpdate.forEach(item => {
          if (get(item, 'id') === get(res, 'updateUserAssignment.id')) {
            updatedClassworkQuestions.push(get(res, 'updateUserAssignment'))
          } else {
            updatedClassworkQuestions.push(item)
          }
        })
        const updatedEvaluationData = {
          blockBasedPracitce: assignmentData.blockBasedPracitce,
        }
        if (evaluationType === evaluationTypes.CODING_ASSIGNMENT) {
          updatedEvaluationData.userAssignment = { ...assignmentData.userAssignment, classWorkQuestions: updatedClassworkQuestions }
        } else if (evaluationType === evaluationTypes.HW_ASSIGNMENT) {
          updatedEvaluationData.userAssignment = { ...assignmentData.userAssignment, homeWorkQuestions: updatedClassworkQuestions }
        }
        duck.merge(() => ({
          evaluationData: updatedEvaluationData
        }))
      }
    }
  }catch(err){
    console.log(err)
  }
}


const submitEvaluationPractice=async({ practices,currentPracticeNos,rating,tags=[],comment,selectedStudent,assignmentData,evaluationType,evaluationTypes,presentStudents,currentStudentNos,openedFromStudentPerformance })=>{
  try{
    let tagIds
    if(tags.length){
      tagIds=tags.map(tag=>get(tag,'id'))
    }
    let currentPracticeObj = null
    if (openedFromStudentPerformance) {
      currentPracticeObj = practices[currentPracticeNos]
    } else {
      currentPracticeObj = presentStudents[currentStudentNos]
    }
    const practiceId = get(currentPracticeObj, 'id')
    const userConnectId = get(currentPracticeObj, 'user.id')
    const blockBasedPracticeConnectId = get(currentPracticeObj, 'blockBasedPractice.id')
    const attachmentsConnectIds = get(currentPracticeObj, 'attachments', []).length && get(currentPracticeObj, 'attachments', []).map(item => get(item, 'id'))
    const topicConnectId = get(currentPracticeObj, 'topic.id')
    const courseConnectId = get(currentPracticeObj, 'course.id')
    const evaluationConnectId = await addEvaluation({ star: rating, tags: tagIds, comment:encodeURIComponent(comment), userConnectId})
    let input = {}
    if (get(currentPracticeObj, 'status')) {
      input.status = get(currentPracticeObj, 'status')
    }
    if (get(currentPracticeObj, 'answerLink')) {
      input.answerLink = get(currentPracticeObj, 'answerLink')
    }
    if (get(currentPracticeObj, 'savedBlocks')) {
      input.savedBlocks = get(currentPracticeObj, 'savedBlocks')
    }
    if (get(currentPracticeObj, 'startTime')) {
      input.startTime = get(currentPracticeObj, 'startTime')
    }
    if (get(currentPracticeObj, 'endTime')) {
      input.endTime = get(currentPracticeObj, 'endTime')
    }
    if (get(currentPracticeObj, 'evaluationStatus')) {
      input.evaluationStatus = get(currentPracticeObj, 'evaluationStatus')
    }
    const res = await updateUserBlockBasedPractice({practiceId, input, userConnectId, blockBasedPracticeConnectId, attachmentsConnectIds, topicConnectId, courseConnectId, evaluationConnectId})
    if (res && get(res, 'updateUserBlockBasedPractice.id')) {
      let practicessToUpdate = []
      if (evaluationType === evaluationTypes.PRACTICE) {
        practicessToUpdate = get(assignmentData, 'blockBasedPracitce.classWorkPractices', [])
      } else if (evaluationType === evaluationTypes.HW_PRACTICE) {
        practicessToUpdate = get(assignmentData, 'blockBasedPracitce.homeWorkPractices', [])
      }
      let updatedClassworkQuestions = []
      practicessToUpdate && practicessToUpdate.forEach(item => {
        if (get(item, 'id') === get(res, 'updateUserBlockBasedPractice.id')) {
          updatedClassworkQuestions.push(get(res, 'updateUserBlockBasedPractice'))
        } else {
          updatedClassworkQuestions.push(item)
        }
      })
      const updatedEvaluationData = {
        userAssignment: assignmentData.userAssignment,
      }
      if (evaluationType === evaluationTypes.PRACTICE) {
        updatedEvaluationData.blockBasedPracitce = { ...assignmentData.blockBasedPracitce, classWorkPractices: updatedClassworkQuestions }
      } else if (evaluationType === evaluationTypes.HW_PRACTICE) {
        updatedEvaluationData.blockBasedPracitce = { ...assignmentData.blockBasedPracitce, homeWorkPractices: updatedClassworkQuestions }
      }
      duck.merge(() => ({
        evaluationData: updatedEvaluationData
      }))
    }
  }catch(err){
    console.log(err)
  }
  
}

const getSelectedStudentIndex=(currentStudId,students=[])=>{
    if(currentStudId && students && students.length){
        const idx=students.findIndex(stud=>get(stud,'value')===currentStudId)
        return idx
    }
    return -1
}

const getNextStudentsDetails=(selectedStudentIdx,students=[])=>{
    if( students && students.length){
        return  students[selectedStudentIdx+1]?students[selectedStudentIdx+1]:null
    }
    return null
}

const doesQuestionExistInUserAssignments = (quesId, userAssignments=[],selectedStudent) => {
  if(userAssignments.length){
      const ques = userAssignments.find(assignmentObj => {
          const assignments = get(assignmentObj, 'assignment')
          if (assignments) {
              const ques = assignments.find(assignment => get(assignment, 'assignmentQuestion.id') === quesId && get(assignmentObj, 'user.id') === get(selectedStudent, 'value'))
              return ques
          }
          return false
      })
      if (ques) {
          const answer = ques.assignment.find(assignment => get(assignment, 'assignmentQuestion.id') === quesId)
          if (answer) return get(answer, 'userAnswerCodeSnippet')
          return ''
      }
      return ''
  }else{
      return ''
  }
}

const getUserAnswer=(quesId,assignmentObj={})=>{
  if (assignmentObj.assignment) {
      const answer = assignmentObj.assignment.find(assignment => get(assignment, 'assignmentQuestion.id') === quesId)
      if (answer) return get(answer, 'userAnswerCodeSnippet')
      return ''
  }
  return ''
}

const studentMapNonEvaluatedQuestion = (arr) => {
  for (let idx=0; idx<arr.length; idx++) {
    if (get(arr[idx], 'evaluation') === null) {
      return idx
    }
  }
  return 0
}

const getFirstNonEvaluatedQuestion = (obj) => {
  for (const id in obj) {
    const assignments = obj[id]
    for (let idx=0; idx<assignments.length; idx++) {
      if (get(assignments[idx], 'question.evaluation') === null) {
        return {
          id,
          idx
        }
      }
    }
  }
  return {
    id: get(Object.keys(obj), '[0]'),
    idx: 0
  }
}

const getFirstNonEvaluatedPractice = (obj, blockBasedPracticeConnectId, checkForId=false) => {
  if (!checkForId) {
    const practices = obj[blockBasedPracticeConnectId]
    for (let idx=0; idx<practices.length; idx++) {
      if (get(practices[idx], 'evaluation') === null) {
        return {
          practice: practices[idx],
          idx
        }
      }
    }
    return {
      practice: practices[0],
      idx: 0,
    }
  } else {
    for (const id in obj) {
      const practices = obj[id]
      for (let idx=0; idx<practices.length; idx++) {
        if (get(practices[idx], 'evaluation') === null) {
          return {
            practice: practices[idx],
            idx
          }
        }
      }
    }
  }
}

const getQuestionIndexFromId = (id, questions) => Object.keys(questions).indexOf(id)

const getQuestionIndexFromArrayId = (id, questions) => questions.indexOf(id)

const getSortedStudents = (arr) => arr && arr.sort((a, b) => get(a, 'user.studentProfile.rollNo') - get(b, 'user.studentProfile.rollNo'))

export {checkForFirstStudent,checkForLastStudent,checkForFirstQuestion,checkForLastQuestion,getInputToAddUserAssignment,submitEvaluationCoding,getSelectedStudentIndex,getNextStudentsDetails,doesQuestionExistInUserAssignments,getUserAnswer,submitEvaluationPractice,checkForFirstPractice,checkForLastPractice,getFirstNonEvaluatedQuestion,getFirstNonEvaluatedPractice,getQuestionIndexFromId,studentMapNonEvaluatedQuestion,checkForLastQuestionStudentLevel,checkForFirstQuestionStudentLevel,checkForFirstPracticeStudentLevel,checkForLastPracticeStudentLevel,getSortedStudents}