
export const actionTypes={
    SET_FROM_RIGHT:'SET_FROM_RIGHT',
    SET_CURRENT_QUES_NOS:'SET_CURRENT_QUES_NOS',
    INC_CURRENT_QUES_NOS:'INC_CURRENT_QUES_NOS',
    DEC_CURRENT_QUES_NOS:'DEC_CURRENT_QUES_NOS',
    SET_CURRENT_QUES_NOS_TO_0:'SET_CURRENT_QUES_NOS_TO_0',
    SET_CURRENT_QUES_NOS_TO_LAST_QUESTION:'SET_CURRENT_QUES_NOS_TO_LAST_QUESTION',
    SET_QUESTIONS:'SET_QUESTIONS',
    SET_QUESTION_STATEMENT:'SET_QUESTION_STATEMENT',
    SET_QUESTION_CORRECT_ANSWER:'SET_QUESTION_CORRECT_ANSWER',
    SET_FETCHING_QUESTIONS:'SET_FETCHING_QUESTIONS',
    SET_SELECTED_STUDENT:'SET_SELECTED_STUDENT',
    SET_EVALUATION_TAGS:'SET_EVALUATION_TAGS',
    SET_USER_ASSIGNMENTS:'SET_USER_ASSIGNMENTS',
    SET_ASSIGNMENT_ID:'SET_ASSIGNMENT_ID',
    SET_PRACTICES:'SET_PRACTICES',
    SET_EVALUATION_TYPE:'SET_EVALUATION_TYPE',
    SET_BLOCK_BASED_PRACTICE:'SET_BLOCK_BASED_PRACTICE',
    INC_CURRENT_PRAC_NOS:'INC_CURRENT_PRAC_NOS',
    DEC_CURRENT_PRAC_NOS:'DEC_CURRENT_PRAC_NOS',
    SET_CURRENT_PRAC_NOS:'SET_CURRENT_PRAC_NOS',
    SET_CURRENT_PRAC_NOS_TO_0:'SET_CURRENT_PRAC_NOS_TO_0',
    SET_CURRENT_PRAC_NOS_TO_LAST_PRACTICE:'SET_CURRENT_PRAC_NOS_TO_LAST_PRACTICE',
    SET_STUDENTS:'SET_STUDENTS',
    SET_CURRENT_STUDENT_NOS:'SET_CURRENT_STUDENT_NOS',
    SET_CURRENT_STUDENT_NOS_TO_0:'SET_CURRENT_STUDENT_NOS_TO_0',
    INC_CURRENT_STUDENT_NOS:'INC_CURRENT_STUDENT_NOS',
    DEC_CURRENT_STUDENT_NOS:'DEC_CURRENT_STUDENT_NOS',
    INC_CURRENT_QUES_NOS_STUDENT_LEVEL:'INC_CURRENT_QUES_NOS_STUDENT_LEVEL',
    INC_CURRENT_PRAC_NOS_STUDENT_LEVEL:'INC_CURRENT_PRAC_NOS_STUDENT_LEVEL',
}

export const evaluationReducer=(state,{type,payload:{value}})=>{
    switch(type){
            case actionTypes.SET_FROM_RIGHT:{
                return {...state,fromRight:value}
            }
            case actionTypes.INC_CURRENT_QUES_NOS:{
                const questions = Object.keys(state.userAssignmentsInContext)
                if(state.currentQuesNos+1<questions.length){
                     return {...state,currentQuesNos:state.currentQuesNos+1}
                    }
                return {...state}
            }
            case actionTypes.DEC_CURRENT_QUES_NOS:{
                if(state.currentQuesNos>0){
                    return {...state,currentQuesNos:state.currentQuesNos-1}
                }return {...state}
            }
            case actionTypes.SET_CURRENT_QUES_NOS_TO_0:{
                return {...state,currentQuesNos:0}
            }
            case actionTypes.SET_CURRENT_QUES_NOS_TO_LAST_QUESTION:{
                return {...state,currentQuesNos:state.questions.length-1}
            }
            case actionTypes.SET_QUESTIONS:{
                return {...state,questions:value}
            }
            case actionTypes.SET_FETCHING_QUESTIONS:{
                return {...state,fetchingQuestions:value}
            }
            case actionTypes.SET_SELECTED_STUDENT:{
                return {...state,selectedStudent:value}
            }
            case actionTypes.SET_EVALUATION_TAGS:{
                    return {...state,evaluationTags:value}
            }
            case actionTypes.SET_USER_ASSIGNMENTS:{
                return {...state,userAssignmentsInContext:value, isFetching:false}
            }
            case actionTypes.SET_ASSIGNMENT_ID:{
                return {...state,assignmentId:value}
            }
            case actionTypes.SET_CURRENT_QUES_NOS:{
                return {...state,currentQuesNos:value}
            }
            case actionTypes.SET_PRACTICES:{
                return {...state,practices:value, isFetching:false}
            }
            case actionTypes.SET_EVALUATION_TYPE:{
                return {...state,evaluationType:value}
            }
            case actionTypes.SET_BLOCK_BASED_PRACTICE:{
                return {...state,blockBasedPracticeInContext:value, isFetching:false}
            }
            case actionTypes.INC_CURRENT_PRAC_NOS:{
                const practices = Object.keys(state.blockBasedPracticeInContext)
                if(state.currentPracticeNos+1<practices.length){
                     return {...state,currentPracticeNos:state.currentPracticeNos+1}
                    }
                return {...state}
            }
            case actionTypes.DEC_CURRENT_PRAC_NOS:{
                if(state.currentPracticeNos>0){
                    return {...state,currentPracticeNos:state.currentPracticeNos-1}
                }return {...state}
            }
            case actionTypes.SET_CURRENT_PRAC_NOS:{
                return {...state,currentPracticeNos:value}
            }
            case actionTypes.SET_CURRENT_PRAC_NOS_TO_0:{
                return {...state,currentPracticeNos:0}
            }
            case actionTypes.SET_CURRENT_PRAC_NOS_TO_LAST_PRACTICE:{
                return {...state,currentPracticeNos:state.practices.length-1}
            }
            case actionTypes.SET_STUDENTS:{
                return {...state,presentStudents:value}
            }
            case actionTypes.SET_CURRENT_STUDENT_NOS:{
                return {...state,currentStudentNos:value}
            }
            case actionTypes.SET_CURRENT_STUDENT_NOS_TO_0:{
                return {...state,currentStudentNos:0}
            }
            case actionTypes.INC_CURRENT_STUDENT_NOS:{
                const students =  Object.keys(state.presentStudents)
                if(state.currentStudentNos+1<students.length){
                     return {...state,currentStudentNos:state.currentStudentNos+1}
                    }
                return {...state}
            }
            case actionTypes.DEC_CURRENT_STUDENT_NOS:{
                if(state.currentStudentNos>0){
                    return {...state,currentStudentNos:state.currentStudentNos-1}
                }return {...state}
            }
            case actionTypes.INC_CURRENT_QUES_NOS_STUDENT_LEVEL:{
                if(state.currentQuesNos+1<state.questions.length){
                     return {...state,currentQuesNos:state.currentQuesNos+1}
                    }
                return {...state}
            }
            case actionTypes.INC_CURRENT_PRAC_NOS_STUDENT_LEVEL:{
                if(state.currentPracticeNos+1<state.practices.length){
                     return {...state,currentPracticeNos:state.currentPracticeNos+1}
                    }
                return {...state}
            }
            default:{
                throw new Error('Unhandled evaluation reducer type')
            }
    }
}