import axios from "axios";

const login = axios.create({
	baseURL: "https://api-stage.uolo.co/core/v1/",
});

export default login;
