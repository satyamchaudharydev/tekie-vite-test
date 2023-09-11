import { getToasterBasedOnType } from "../../../../components/Toaster"

export const basicFieldValidation = (fieldData) => {
    return fieldData.trim().length === 0
}

export const loginWithEmailValidation = (email, password) => {

    let errors = {}
    if (!email || basicFieldValidation(email)) {
        errors.email = true
        getToasterBasedOnType({
            type: 'error',
            message: "Email Field Can't be empty"
        })
        return errors
    }

    if (!password || basicFieldValidation(password)) {
        errors.password = true
        getToasterBasedOnType({
            type: 'error',
            message: "Password Field can't be empty"
        })
        return errors
    }
    return {}
}

