import gql from "graphql-tag";
import duck from "../../../duck";

const removeFromUserBlockBasedPracticeAttachment = async ({fileId, userBlockBasedPracticeId}) => {
    return duck.query({
        query: gql`
        mutation{
    removeFromUserBlockBasedPracticeAttachment(userBlockBasedPracticeId:"${userBlockBasedPracticeId}", fileId:"${fileId}") {
		typeName
	}
    }
    `,
        type: 'removeFromUserBlockBasedPracticeAttachment/delete',
        key: 'removeFromUserBlockBasedPracticeAttachment',
    })
    }
export default removeFromUserBlockBasedPracticeAttachment

