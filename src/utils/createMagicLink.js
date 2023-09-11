import { get } from "lodash";
import gql from "graphql-tag";

import requestToGraphql from "./requestToGraphql";
import { getToasterBasedOnType } from "../components/Toaster";

// this function takes a userId and create a magic link for that user
export const createMagicLink = async userConnectId => {
	try {
		const magicLinkTokenRes = await requestToGraphql(gql`{
        getMagicLink(input: { userId: "${userConnectId}" }) {
                linkToken
            }
        }`);

		const magicLinkToken = get(
			magicLinkTokenRes,
			"data.getMagicLink[0].linkToken"
		);

		return magicLinkToken;
	} catch (_) {
		getToasterBasedOnType({
			type: "error",
			message: "Could not login, something went wrong"
		});

		throw new Error("something went wrong");
	}
};

// create magic link for buddies
export const createMagicLinkForBuddies = async buddyIds => {
	// change buddyIds to send to graphql
	const buddyIdsChanged = buddyIds.map(buddyId => `"${buddyId}"`).join(", ");

	try {
		const magicLinkTokenRes = await requestToGraphql(gql`{
        getMagicLink(input: { studentIds: [${buddyIdsChanged}], forBuddies: true }) {
                linkToken
            }
        }`);

		const magicLinkToken = get(
			magicLinkTokenRes,
			"data.getMagicLink[0].linkToken"
		);

		return magicLinkToken;
	} catch (err) {
		console.log(err);
		getToasterBasedOnType({
			type: "error",
			message: "Could not login, something went wrong"
		});
	}
};
