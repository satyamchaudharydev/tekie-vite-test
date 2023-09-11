import duck from "../../duck";
import header from "../../utils/header";

const fetchLiveAttendance = async (batchSession, user) => {
  const key = 'fetchLiveAttendance'
	const headers = header(user)
	return duck.query({
		query: `/attendance/${batchSession}`,
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
		key: key,
	});
};
export default fetchLiveAttendance;
