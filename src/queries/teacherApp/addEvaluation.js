import { get } from "lodash"
import getIdArrForQuery from "../../utils/getIdArrForQuery"
import requestToGraphql from "../../utils/requestToGraphql"


const addEvaluation=async ({star, tags=[], comment, userConnectId})=>{

    const res = await requestToGraphql(`
    mutation {
        addEvaluation(
            input: { star:${star}, comment: "${comment}" }
            ${tags && tags.length ? `tagsConnectIds: [${getIdArrForQuery(tags)}]`:''},
            ${userConnectId ? `userConnectId: "${userConnectId}"` : ''}
        ) {
            id
        }
    }`)
    if(res) return get(res,'data.addEvaluation.id')
}

export default addEvaluation