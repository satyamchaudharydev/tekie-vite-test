import gql from "graphql-tag"
import requestToGraphql from "../../utils/requestToGraphql"

const updateSubSession = (id, input) => {
    requestToGraphql(gql`mutation updateBatchSubSession($input: BatchSubSessionUpdate) {
        updateBatchSubSession(
            id: "${id}"
            input: $input
        ) {
            id
        }
    }`,
    {
        input
    }
    )
}

export default updateSubSession