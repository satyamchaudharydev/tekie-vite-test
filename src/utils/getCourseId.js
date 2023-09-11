import { List, Map } from 'immutable'
import { get } from 'lodash'
import { COURSES } from '../config'
import store from '../store'
import { filterKey } from "./data-utils"
import { checkIfEmbedEnabled, getEmbedData } from './teacherApp/checkForEmbed'
import getMe from './getMe'

const getCourseFromConfig = currentCourse => {
  const course = COURSES.find(course => (course.course.id === get(currentCourse, 'courseId')));
  if (course) {
    return course.course
  }
  return {
    id: get(currentCourse, 'courseId'),
    title: get(currentCourse, 'title'),
    secondaryCategory: 'BLOCK-BASED PROGRAMMING',
    color: { primary: '#E45C33', secondary: '#F9DBD2', backdrop: '#65DA7A' }
  }
}

const getCourse = () => {
  const user = filterKey(store.getState().data.getIn(['user', 'data']), 'loggedinUser') || List([])  
  const userCourse = filterKey(store.getState().data.getIn(['userCourse', 'data']), 'userCourse') || List([])
  const currentCourse = store.getState().data.getIn(['currentCourse', 'data']) || List([])
  if (!user || !user.getIn([0, 'parent', 'parentProfile', 'children'])) {
    return COURSES.find(course => course.grade.includes(8)).course
  }

  const selectedCourse = localStorage.getItem('selectedCourse')
  if (
    userCourse &&
    userCourse.toJS &&
    userCourse.toJS().length > 0
  ) {
    if (selectedCourse) {
      const selectedCourseObject = userCourse.toJS().find(course => get(course, 'courseId') === selectedCourse)
      if (selectedCourseObject) {
        return getCourseFromConfig(selectedCourseObject)
      }
    }
    const courseDetail = userCourse.toJS()[0]
    localStorage.setItem('selectedCourse', get(courseDetail, 'courseId'))
    return getCourseFromConfig(courseDetail)
  }
  const selectedChild = user
    .getIn([0, 'parent', 'parentProfile', 'children'])
    .find(child => child.getIn(['user', 'id']) === user.getIn([0, 'id']))
  
  // if (import.meta.env.REACT_APP_NODE_ENV !== 'production') {
  //   /** Temp Code: Need to be removed before making it live */
  //   if (user.getIn([0, 'id']) === 'ckqrpxo7u0002a0fi6p5lgclv') {
  //     return {
  //       id: 'ckpvcx5e200040ttp6ml3d4tb',
  //       title: 'kp course',
  //       secondaryCategory: 'BLOCK-BASED PROGRAMMING',
  //       color: { primary: '#966CAB', secondary: '#E8DFEC', backdrop: '#D34B57' }
  //     }
  //   }
  // }
  console.log(COURSES)
  if (!selectedChild) {
    return COURSES.find(course => course.grade.includes(8)).course
  }
  
  if (currentCourse && currentCourse.getIn([0, 'id'])) {
    const course = COURSES.find(course => course.course.id === currentCourse.getIn([0, 'id']));
    if (course) {
      return course.course
    }
    return {
      id: currentCourse.getIn([0, 'id']),
      title: currentCourse.getIn([0, 'title']),
      secondaryCategory: 'BLOCK-BASED PROGRAMMING',
      color: { primary: '#E45C33', secondary: '#F9DBD2', backdrop: '#65DA7A' }
    }
  }

  const grade = Number(selectedChild.get('grade', '').replace('Grade', ''))
  const course = COURSES.find(course => course.grade.includes(grade))
  if (course) {
    return course.course
  }
  return COURSES.find(course => course.grade.includes(8)).course
}

export const getCoursePackageId = () => getMe().coursePackageId

export const getCourseFromCoursePackage = (topicId, coursePackageId) => {
  const menteeCourseSyllabus = store.getState().data.getIn(['menteeCourseSyllabus', 'data'])
  const menteeCourseSyllabusData = (menteeCourseSyllabus && menteeCourseSyllabus.toJS()[0]) || null
  if (menteeCourseSyllabusData) {
    const allSessions = [...(menteeCourseSyllabusData.upComingSession || []), ...(menteeCourseSyllabusData.bookedSession || []), ...(menteeCourseSyllabusData.completedSession || [])]
    const session = allSessions.find(session => session.topicId === topicId)
    if (session) {
      return get(session,'course.id')
    }
  }
  return ''
}

const getCourseId = (topicId) => {
  let courseId = getCourse().id
  if (topicId) {
    const coursePackageId = getCoursePackageId()
    if (coursePackageId) {
      const courseFromPackage = getCourseFromCoursePackage(topicId, coursePackageId)
      if (courseFromPackage) {
        courseId = courseFromPackage
      }
    }
  }
  if (checkIfEmbedEnabled()) {
    const courseIdFromEmbed = getEmbedData("courseId");
    if (courseIdFromEmbed) courseId = courseIdFromEmbed;
  }
  return courseId
}

export const getCourseName = () => {
  const title = getCourse().title
  if (title && title.length > 40) {
    return title.substring(0, 40) + '...';
  }
  return title;
}

export const checkIfDefaultCourse = () => {
  // return get(getCourse(), 'isDefaultCourse', false)
  return false // only for b2b
}

export const getCourseDetails = () => {
  const courseDetail = (store.getState().data.getIn(['course', 'data'] || Map({}))).toJS()
  return courseDetail
}
export const getCodingLanguages = () => {
  const courseDetail = (store.getState().data.getIn(['course', 'data'] || Map({}))).toJS()
  const coursePackages = (store.getState().data.getIn(['coursePackages', 'data'] || Map([]))).toJS()
  let codingLanguages = [];
  if (coursePackages && coursePackages.length) {
    coursePackages.forEach(packageDetails => {
      get(packageDetails, 'courses', []).forEach(course => {
        if (course && get(course, 'codingLanguages', []).length) {
          codingLanguages.push(...get(course, 'codingLanguages', []));
        }
      })
    })
    return codingLanguages;
  }
  return get(courseDetail, 'codingLanguages')
}
export const getCodePlayground = (defaultEditor = 'python') => {
  if (checkIfDefaultCourse()) {
    return 'python';
  }
  const codingLanguages = getCodingLanguages()
  if (!codingLanguages || (codingLanguages && codingLanguages.length === 0)) {
    return defaultEditor;
  }
  if (codingLanguages && codingLanguages.length && codingLanguages.length > 0) {
    const codingLanguagesValue = codingLanguages
      .map(language => get(language, 'value', '').toLowerCase())
    return get(codingLanguagesValue, 0).toLowerCase()
  }
  return defaultEditor;
}

export const shouldCodePlagroundAllowed = () => {
  if (checkIfDefaultCourse()) {
    return true;
  }
  const codingLanguages = getCodingLanguages()
  if (codingLanguages && codingLanguages.length && codingLanguages.length > 0) {
    const codingLanguagesValue = codingLanguages
      .map(language => get(language, 'value', '').toLowerCase())
    return codingLanguagesValue.includes('python') || codingLanguagesValue.includes('javascript')
  }
  return false
}

export const isCheatSheetAllowed = () => {
  if (checkIfDefaultCourse()) {
    return true;
  }
  const codingLanguages = getCodingLanguages()
  if (codingLanguages && codingLanguages.length && codingLanguages.length > 0) {
    const codingLanguagesValue = codingLanguages
      .map(language => get(language, 'value', '').toLowerCase())
    return codingLanguagesValue.includes('python')
  }
  return false
}

export const getCourseString = () => {
  return `courseId: "${getCourseId()}"`
}
export const getCourseConnectString = (topicId) => {
  return `courseConnectId: "${getCourseId(topicId)}"`
}



export default getCourseId
