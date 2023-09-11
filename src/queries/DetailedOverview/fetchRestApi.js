import duck from "../../duck"

const fetchRestApi = () => {
    const url = "https://jsonplaceholder.typicode.com/todos/1"
    const response = duck.query({
			query: url,

			type: "fetchRestApi/fetch",
			key: "fetchRestApi",
			options: {
				rest: true,
				method: "get",
				headers: {},
				data: {},
			},
		});
    return response
} 
export default fetchRestApi    