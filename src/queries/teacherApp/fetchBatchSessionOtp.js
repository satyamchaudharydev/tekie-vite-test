import gql from "graphql-tag";
import duck from "../../duck";
import header from "../../utils/header";

const fetchBatchSessionOtp = async (batchSession, user) => {

  const key = 'fetchBatchSessionOtp'
	const headers = header(user)

	return duck.query({
		query: `/otp/${batchSession}`,
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

  // return duck.query({
  //   query: gql`
  //   {
  //     fetchBatchSessionOtp :  batchSession(id: "${batchSession}"){
  //       schoolSessionsOtp {
  //         id
  //         otp
  //         expiryDate
  //       }
  //     }
  //   }
  //   `,
  //   type: "fetchBatchSessionOtp/fetch",
  //   key: "fetchBatchSessionOtp",
  // });
};
export default fetchBatchSessionOtp;
