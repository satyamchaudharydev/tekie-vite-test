import get from "lodash/get";

const checkForSchoolTeacher = (user = {}) => {
    if ((get(user, 'role') === 'mentor' && get(user, 'secondaryRole') === 'schoolTeacher') || (get(user, 'rawData.role') === 'mentor' && get(user, 'rawData.secondaryRole') === 'schoolTeacher')) {
        return true
    }
    return false
}

const checkForSchoolTeacherInRawData = (user = {}) => {
    if ((get(user, 'rawData.role') === 'mentor' && get(user, 'rawData.secondaryRole') === 'schoolTeacher') && !(get(user, 'role') === 'mentor' && get(user, 'secondaryRole') === 'schoolTeacher')) {
        return true
    }
    return false
}

export {
    checkForSchoolTeacher, checkForSchoolTeacherInRawData
}