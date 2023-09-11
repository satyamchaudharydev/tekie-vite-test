import { get } from "lodash";

const header = (loggedInUser) => {
    const obj = {
        "x-login": get(loggedInUser, 'logindetails.loginid'),
        "x-permission": "NONE",
        "x-token": get(loggedInUser, 'logindetails.token'),
        "x-user-id": get(loggedInUser, 'id'),
    }
    return obj;
}

export default header;