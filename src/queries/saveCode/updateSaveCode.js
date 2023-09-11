import gql from "graphql-tag";
import duck from "../../duck";
import getIdArrForQuery from "../../utils/getIdArrForQuery";

const updateSaveCode = (savedCodeId, input, tags) => {
	return duck.createQuery({
		query: gql`
        mutation updateUserSavedCode($input: UserSavedCodeUpdate!){
            savedCode: updateUserSavedCode(
                id: "${savedCodeId}"
                input: $input
                codeTagsConnectIds: [${getIdArrForQuery(tags)}]
            ) {
                id
                user{
                id
                name
                }
                code
                fileName
                description
                createdAt
                updatedAt
                hasRequestedByMentee
                isApprovedForDisplay
                userApprovedCode {
                    id
                    status
                }
            }
        }
        `,
		variables: {
			input,
		},
		key: "updateSavedCode",
		type: "savedCode/update",
	});
};

export default updateSaveCode;
