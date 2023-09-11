import duck from "../../../../../../../duck"; 
import header from "../../../../../../../utils/header";

const addSessionComponentTracker = async (input, user) => {
  const key = 'sessionComponentTracker'
  const headers = header(user)
  return duck.query({
    query: `/sessionComponentTracker/add`,
    options: {
      tokenType: "appTokenOnly",
      rest: true,
      method: "post",
      headers: headers,
      data: {
        input,
      },
      apiType: key,
    },
    type: `${key}/add`,
    key: `${key}/${input.batchSessionId}`,
  });
};

export default addSessionComponentTracker;
