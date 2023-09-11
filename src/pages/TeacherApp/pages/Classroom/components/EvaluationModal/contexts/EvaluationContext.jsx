import React, { createContext, useReducer } from "react";
import { useContext } from "react";
import { evaluationReducer} from "../reducers/evaluationReducer";

const EvaluationContext = createContext()
 const initialEvaluationState={
    fromRight:'100%',
    currentQuesNos:0,   //indexing becomes easier with 0-based indexing
    questions:[],
    selectedStudent:{value:'1',label:'John'},
    evaluationTags:[],
    userAssignmentsInContext:{},
    assignmentId:'',
    currentPracticeNos:0,   //indexing becomes easier with 0-based indexing
    practices: [],
    evaluationType: '',
    blockBasedPracticeInContext:{},
    isFetching: true,
    presentStudents:[],
    currentStudentNos:0,
}
export const EvaluationContextProvider=({children})=>{
    const [state,dispatch]=useReducer(evaluationReducer,initialEvaluationState)

    return <EvaluationContext.Provider value={{state,dispatch}}>
            {children}
    </EvaluationContext.Provider>
}

export const useEvaluationContext=()=>useContext(EvaluationContext)