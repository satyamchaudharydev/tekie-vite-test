import { List } from 'immutable'
import { filterKey } from "./data-utils"
import { get } from 'lodash'
import { checkIfEmbedEnabled, getEmbedData } from './teacherApp/checkForEmbed'

export const getActiveBatch = () => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null
    let userCourseWithBatches = (window && window.store && filterKey(window.store.getState().data.getIn(['userCourse', 'data']), 'userCourse')) || List([])
    userCourseWithBatches = (userCourseWithBatches && userCourseWithBatches.toJS()) || []
    const activeBatchId = localStorage.getItem('activeClassroom')
    if (activeBatchId) {
        const activeBatchDetail = userCourseWithBatches.find(userBatch => get(userBatch, 'classroom.id') === activeBatchId)
        if (activeBatchDetail) {
            return get(activeBatchDetail, 'classroom')
        }
    }
    const activeBatchDetail = userCourseWithBatches.find(userBatch => get(userBatch, 'activeClassroom'))
    if (activeBatchDetail) {
        localStorage.setItem('activeClassroom', get(activeBatchDetail, 'classroom.id'))
        return get(activeBatchDetail, 'classroom')
    }
    return null
}

export const getActiveBatchForHeaders = (tokenType) => {
    const headerObj = {}
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return {}
    if (tokenType === 'appTokenOnly') return headerObj;
    if (checkIfEmbedEnabled()) {
        const batchId = getEmbedData('batchId');
        if (batchId) headerObj['x-classroom-uid'] = batchId;
        return headerObj
    }
    const activeBatchDetail = getActiveBatch()
    if (activeBatchDetail) {
        headerObj['x-classroom-uid'] = get(activeBatchDetail, 'id')
        return headerObj
    }
    const activeBatchId = localStorage.getItem('activeClassroom')
    if (activeBatchId) headerObj['x-classroom-uid'] = activeBatchId
    return headerObj
}

export const getActiveBatchDetail = (studentBatch, batchId) => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return studentBatch || null
    let studentProfile = (window && window.store && window.store.getState().data.getIn(['studentProfile', 'data', '0']))
    studentProfile = (studentProfile && studentProfile.toJS())
    if (studentProfile) {
        let activeBatchId = ''
        const activeBatchIdFromLocalStorage = localStorage.getItem("activeClassroom")
        if (!batchId) {
            const activeBatch = getActiveBatch()
            if (activeBatch) activeBatchId = get(activeBatch, 'id')
            else if (activeBatchIdFromLocalStorage) activeBatchId = activeBatchIdFromLocalStorage
        } else {
            if (!activeBatchIdFromLocalStorage) localStorage.setItem("activeClassroom", batchId)
            activeBatchId = batchId
        }
        if (activeBatchId) {
            const activeBatchFromStudentProfile = (get(studentProfile, 'studentBatches', []) || []).find(batch => get(batch, 'id') === activeBatchId)
            if (activeBatchFromStudentProfile) {
                // Return Classroom If Found
                return activeBatchFromStudentProfile
            }
        }
        // Return Default Batch
        return studentBatch || get(studentProfile, 'batch')
    }
    return null
}