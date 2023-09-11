import duck from "../../../duck";
import header from "../../../utils/header";

const fetchBatchSessions = async (batchId, user) => {
	const key = 'batchSession'
	const headers = header(user)
	return duck.query({
		query: `/batchSessions/${batchId}`,
		options: {
			tokenType: "appTokenOnly",
			rest: true,
			method: "get",
			headers: headers,
			apiType: key,
		},
		changeExtractedData: (extractedData, originalData) => {
			return extractedData
		},
		type: `${key}/fetch`,
		key: `${key}/${batchId}`,
	});
};

export default fetchBatchSessions;
