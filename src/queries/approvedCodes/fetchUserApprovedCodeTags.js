import gql from "graphql-tag";

import duck from "../../duck";

const fetchUserApprovedCodeTags = () => {
	return duck.createQuery({
		query: gql`
			{
				userApprovedCodeTags(filter: { status: published }) {
					id
					title
				}
			}
		`,

		key: "userApprovedCodeTags",
		type: "userApprovedCodeTags/fetch",
	});
};

export default fetchUserApprovedCodeTags;