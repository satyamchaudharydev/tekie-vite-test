import { get } from "lodash"
import getMe from "./getMe"

export const getUserParams = () => {
    const me = getMe()
    const userParams =  {
    userName: get(me, 'name'),
    userId: get(me,'id'),
    role: get(me,'thisChild.role'),
    schoolName: get(me,'thisChild.schoolTeacher.mentorProfile.schools[0].name','')|| get(me,'schoolName'),
    schoolId: get(me,'thisChild.schoolTeacher.mentorProfile.schools[0].id')|| get(me,'parent.mentorProfile.schools[0].id'),
    }
    return userParams
}