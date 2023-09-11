import get from "lodash/get"
import store from "../store"
import { filterKey } from "./data-utils"
import { checkIfEmbedEnabled, getEmbedData } from "./teacherApp/checkForEmbed"
import getRole from "../constants/roleGroup"

const getMe = () => {
  const state = store.getState().data
  const user = get(filterKey(
    state.getIn(["user", "data"]),
    'loggedinUser'
  ).toJS(), '0')
  const name = get(user, 'fname') + get(user, 'lname')
  const grade = get(user, 'grade',"")
  const section = get(user, 'section',"")
  const thisChild =  user
  // const userChildren = get(user, 'parent.children', [])
  // const studentProfileChildren = get(user, 'parent.parentProfile.children', []) 
  // const buddyStudents = get(user, 'buddyDetails', [])
  // let mergedChildren = []
  // if (userChildren && userChildren.length > 0) {
  //   mergedChildren = userChildren.map(child => {
  //     const child2 = studentProfileChildren.find(child2 => get(child2, 'user.id') === child.id)
  //     if (child2) {
  //       return {
  //         ...child,
  //         studentProfile: child2
  //       }
  //     }
  //     return child
  //   })
  // }
  // if (!mergedChildren || !mergedChildren.length) {
  //   console.log(mergedChildren,user)
  //   mergedChildren = get(user, 'parent.parentProfile.children', []).map(child => ({
  //     ...child.user,
  //     studentProfile: child
  //   }))
  // }
  // let thisChild = mergedChildren.find(child => child.id === get(user, 'id'))
  // if (!thisChild) {
  //   thisChild = user
  // }
  // let grade = get(thisChild, 'studentProfile.grade')
  // let section = get(thisChild, 'studentProfile.section')
  // let schoolName = get(thisChild, 'studentProfile.school.name', '')
  // let isCanvaSsoEnabled = get(thisChild, 'studentProfile.school.isCanvaSsoEnabled', '') || false;
  // let classroomTitle = get(thisChild, 'studentProfile.batch.classroomTitle', '')
  // let isStudent = true
  // let role = getRole(get(user, 'roleid'))
  // if (checkIfEmbedEnabled()) {
  //   grade = getEmbedData("grade")
  //   section = getEmbedData("section")
  //   classroomTitle = getEmbedData("classroomTitle")
  //   schoolName = get(user, 'rawData.mentorProfile.schools[0].name')
  //   isCanvaSsoEnabled = get(user, 'rawData.mentorProfile.schools[0].isCanvaSsoEnabled') || false;
  //    isStudent=false
  // }
  // if (!schoolName) {
  //   schoolName = get(user, 'divinfo.name')
  // }
  return {
    id: get(user, 'id'),
    name: get(user, 'fname') + get(user, 'lname'),
    email: get(user, 'email'),
    parent: get(user, 'parent'),
    grade: grade,
    section: section,
    thisChild: thisChild,
    children: [],
    batchId: get(thisChild, 'studentProfile.batch.id'),
    coursePackageId: get(thisChild, 'studentProfile.batch.coursePackage.id'),
    schoolName: get(user, 'divinfo.name'),
    classroomTitle: get(user,'classname'),
    buddyStudents: [],
    isStudent: !checkIfEmbedEnabled(),
    isCanvaSsoEnabled: false,
    role: '',
  }
}

export default getMe