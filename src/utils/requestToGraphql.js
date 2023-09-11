import GqlClient from './GqlClient'
import errors from './errors'
import config from '../config'
import getAuthToken from './getAuthToken'
import { getHeadersForBuddy } from './buddyUtils'
import { getActiveBatchForHeaders } from './multipleBatch-utils'
import SubscriptionClient from './SubscriptionClient';
import { get } from 'lodash'
import fetchAPI from './fetchApi'

const DEBUG_API_ERROR = false

const handleGraphqlResponseErrors = errordata => {
  let errorMessage
  if (DEBUG_API_ERROR) {
    console.error('apiError', errordata)
  }
  if (errordata.errors && errordata.errors.length && errordata.errors[0].name) {
    errorMessage = errordata.errors[0].name
  }
  if (errordata.message) {
    errorMessage = errordata.message
  }
  return errorMessage || errors.UnexpectedError
}

const getBaseURL = (uolo) => {
  return uolo ? import.meta.env.REACT_APP_UOLO_APP_BASE_URL : import.meta.env.REACT_APP_REST_API_BASE_URL
}
const client = new GqlClient({
  url: (import.meta.env.REACT_APP_FORCE_CDN_CLIENT && config.cdnApiBaseURL) ? config.cdnApiBaseURL : config.apiBaseURL,
	config: {
		cdnUrl: config.cdnApiBaseURL,
		apiUrl: config.apiBaseURL
	},
	errorHandler: handleGraphqlResponseErrors
});

const requestToGraphql = async (query, variables, token,  tokenType) => {
  let graphqlClient = client;
  if (variables && variables.CDNCaching) {
    delete variables['CDNCaching']
  }
  const isRest = get(variables, 'rest', false);
  const isUoloApi = get(variables, 'uoloApi', false);
  const baseURL = getBaseURL(isUoloApi); 
  console.log(variables)
  if (isRest) {
		const options = {
			endpoint: query,
			method: variables.method,
			data: variables.data,
			baseURL: baseURL || "",
			headers: variables.headers || "",
			apiType: get(variables, "apiType", ""),
		};
		const response = await fetchAPI(options);
		return response;
	}
  const additionalHeaderVariables = { ...getHeadersForBuddy(tokenType), ...getActiveBatchForHeaders(tokenType) }
  if (tokenType) {
    return graphqlClient.query(query, variables, {
      headers: {
        authorization: getAuthToken(tokenType),
        ...additionalHeaderVariables,
      },
    });
  }
  if (!token) {
    token = getAuthToken()
  }
  return graphqlClient.query(query, variables, {
    headers: {
      authorization: token,
      ...additionalHeaderVariables,
    },
  });
}

export const subscribeToGraphql = async ({
  query, token, tokenType, schemaName, key, onDataReceived = () => { } }) => {
  if (config.subscriptionBaseURL) {
    const additionalHeaderVariables = { ...getHeadersForBuddy(tokenType), ...getActiveBatchForHeaders(tokenType) }
    const subscriptionClient = new SubscriptionClient({
      url: config.subscriptionBaseURL,
      errorHandler: handleGraphqlResponseErrors,
      schemaName, key,
      onDataReceived
    })
    if (!token) {
      token = getAuthToken(tokenType)
    }
    subscriptionClient.subscribe(query, {
      Authorization: token,
      ...additionalHeaderVariables,
    })
    return subscriptionClient
  }
}

export default requestToGraphql
