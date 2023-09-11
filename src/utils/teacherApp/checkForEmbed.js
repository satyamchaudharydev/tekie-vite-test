import { Map } from 'immutable'
import { get } from 'lodash'
import { backToPageConst } from '../../pages/TeacherApp/constants'
import { filterKey, getDataFromLocalStorage } from '../data-utils'

const checkForEmbed = () => {
  if (typeof window !== 'undefined') {
    return get(window, 'fromTeachersApp', false)
  }
  return false;
}

export const getEmbedData = (name) => {
  if (typeof window !== "undefined") {
    const sessionDetails = getDataFromLocalStorage("classroomSessionsData")
    if (sessionDetails) return get(sessionDetails, name) || ''
  }
  return '';
}

export const checkIfEmbedEnabled = () => {
  if (typeof window !== "undefined") {
    const user = filterKey(window && window.store.getState().data.getIn(['user', 'data']), 'loggedinUser').get(0) || Map({})
    return (user && get(user.toJS(), 'fromTeachersAppEmbed', false)) || false
  }
  return false;
}

export const isPqReportNotAllowed = () =>
  checkIfEmbedEnabled() && getEmbedData('backToPage') !== backToPageConst.trainingResourcesClasswork
  && ['true', 'True', true].includes(getEmbedData("isRevisit"))
  && getEmbedData("sessionStatus") && getEmbedData("sessionStatus") !== 'completed'


export const isAccessingTeacherTraining = () => {
  if (checkIfEmbedEnabled()) {
    const backToPage = getEmbedData('backToPage')
    return backToPage === backToPageConst.trainingClassrooms || backToPage === backToPageConst.trainingResourcesClasswork || backToPage === backToPageConst.trainingResourcesAssessment
  }
  return false
}

export const isAccessingTrainingResources = () => {
  if (checkIfEmbedEnabled()) {
    const backToPage = getEmbedData('backToPage')
    return backToPage === backToPageConst.trainingResourcesClasswork || backToPage === backToPageConst.trainingResourcesAssessment
  }
  return false
}

export default checkForEmbed;