import axios from "axios";
import { get } from "lodash";

// Predefined baseURL and headers
const DEFAULT_BASE_URL = "https://your-api-url.com";
const DEFAULT_HEADERS = {
	"Content-Type": "application/json",
	// Add other headers as needed
};

const responseHandler = (apiType, response) => {
	return response.data
};

const fetchAPI = async ({
	method,
	endpoint,
	headers = DEFAULT_HEADERS,
	data,
	baseURL,
	apiType,
}) => {
	const api = axios.create({
    baseURL,
    headers,
  });
  console.log({endpoint},data)
	try {
		let response;
		method = (method && method.toLowerCase()) || "";
		if (method) {
			if (method === "get") {
				response = await api.get(endpoint);
			} else
				response = await api.post(endpoint, data);
		}
		console.log({response},data,endpoint)
		return responseHandler(apiType, response);
	} catch (error) {
		// Handle the error
		console.error("Error in API call", error);
		throw error;
	}
};

export default fetchAPI;