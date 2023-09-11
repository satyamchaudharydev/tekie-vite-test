import requestToGraphql from "../../utils/requestToGraphql"

const fetchEvaluationTags=()=>{
    return requestToGraphql(`
    {
        evaluationTags(filter:{
            category_contains: "assignment"
        }) {
            name
            minStar
            maxStar
            id
        }
    }
    `)
}

export default fetchEvaluationTags