import duck from "../../duck";
import header from "../../utils/header";

const addBatchSession = async ({ batchConnectId, topicConnectId, courseConnectId, input = {}, loggedInUser }) => {
  const key = 'batchSession'
  const headers = header(loggedInUser)
  return duck.query({
    query: `/batchSession/add`,
    options: {
      tokenType: "appTokenOnly",
      rest: true,
      method: "post",
      headers: headers,
      data: {
        "batchConnectId": batchConnectId,
        "topicConnectId": topicConnectId,
        "courseConnectId": courseConnectId,
        input,
      },
      apiType: key,
    },
    type: `${key}/add`,
    key: key,
  });
};

export default addBatchSession;
