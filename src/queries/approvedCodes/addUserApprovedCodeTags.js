import gql from "graphql-tag";
import cuid from "cuid";

import duck from "../../duck";

// tags = [{value: string, label: string}]  // if tag is new
const addUserApprovedCodeTags = (tags) => {
	const tagsString = tags
		.map((tag) => {
			return `tag_${cuid()}: addUserApprovedCodeTag(input: {title: "${tag.value
				}" status: published}) {
                id
            }`;
		})
		.join("");

	return duck.createQuery({
		query: gql`
            mutation {
                ${tagsString}
            }
            `,
		key: "userApprovedCodeTags",
		type: "userApprovedCodeTags/add",
	});
};
export default addUserApprovedCodeTags;
