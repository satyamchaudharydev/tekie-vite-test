import duck from "../../duck"
import header from "../../utils/header"

const addSubSession = ({ input, user }) => {
    const key = 'subSession'
    const headers = header(user)
    return duck.query({
        query: `/subSession/add`,
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
        key: key,
    });
}

export default addSubSession