import gql from "graphql-tag"
import { get } from 'lodash'
import addMentorMenteeSession from "../queries/sessions/addMentorMenteeSession"
import requestToGraphql from "./requestToGraphql"
import fetchMentorMenteeSession from "../queries/sessions/fetchMentorMenteeSession"
import { getCourseConnectString } from "./getCourseId"
import { getSlotNames } from "./slots/slot-names"
import { checkIfEmbedEnabled, getEmbedData, isAccessingTrainingResources } from '../utils/teacherApp/checkForEmbed'
import moment from "moment"
import { backToPageConst } from "../pages/TeacherApp/constants"
import getMe from "./getMe"

const deleteExtraMMSession = async (id) => {
  await requestToGraphql(gql`mutation {
  deleteMentorMenteeSession(id: "${id}") {
    id
  }
}
`)
}

const addMenteeSession = async (userId, topicId, input) => {
  const menteeSession = await requestToGraphql(gql`mutation($input:MenteeSessionInput!) {
                addMenteeSession(input:$input,userConnectId:"${userId}",
                topicConnectId:"${topicId}"
                ${getCourseConnectString(topicId)}) {
                    id
                    topic {
                        id
                    }
                }
            }`, { input })
  return get(menteeSession, 'data.addMenteeSession.id')
}

export const markAttendance = async (sessionId, studentProfileId) => {
    await requestToGraphql(gql`{
    getBuddyStatus(sessionId:"${sessionId}", studentIds:["${studentProfileId}"], action:"markAttendance"){
        error
        result
    }
    }`)
    return true;
}

const fetchBatchSession = async (batchId, topicId) => {
  const batchSession = await requestToGraphql(gql`
            query {
                batchSessions(filter: {
                and:[
                    {batch_some:{id: "${batchId}"}}
                    {topic_some:{id: "${topicId}"}}
                ]
                }) {
                    id
                    bookingDate
                    batch {
                      id
                      coursePackage {
                        id
                      }
                    }
                    ${getSlotNames()}
                    startMinutes
                    endMinutes
                    mentorSession{
                        id
                    }
                }
            }
        `)
  return get(batchSession, 'data.batchSessions[0]')
}

const fetchStudentProfileBatch = async (userId) => {
  const studentProfile = await requestToGraphql(gql`{
  studentProfiles(filter: { user_some: { id: "${userId}" } }) {
    id
    batch {
      id
      allottedMentor{
        id
      }
    }
  }
}`)
  
  return get(studentProfile, 'data.studentProfiles[0].batch')
}

const updateMentorMenteeSession = async (mmSessionId, input) => {
  await requestToGraphql(gql`mutation($input: MentorMenteeSessionUpdate) {
  updateMentorMenteeSession(id: "${mmSessionId}", input: $input) {
    id
  }
}`, { input })
}

const getUpdateMMsInput = (dataObj = {}) => {
  const dataKey = [
        'isQuizSubmitted',
        'quizSubmitDate',
        'isAssignmentSubmitted',
        'assignmentSubmitDate',
        'isPracticeSubmitted',
        'practiceSubmitDate',
    'isSubmittedForReview']
  const input = {}
  Object.keys(dataObj).forEach(key => {
    if (dataKey.includes(key) && dataObj[key]) {
      input[key] = dataObj[key]
    }
  })
  return input;
}

const getSelectedSlotsStringArray = (slots = {}) => {
    const slotTimeStringArray = []
    Object.keys(slots).forEach(slot => {
        if (slot.includes('slot')) {
            if (slots[slot]) {
                slotTimeStringArray.push(slot)
            }
        }
    })
    return slotTimeStringArray
}

const isWindowDefined = window !== 'undefined'

const mentorMenteeSessionAddOrDelete = async (userId, topicId, mentorSessionId, action, fromPage = 'BookSession', callBack = () => {}, isCallBackPresent = true, setLoading = () => {}) => {
  let mentorMenteeSessions = []
  if (checkIfEmbedEnabled()) {
    if (isAccessingTrainingResources()) {
      topicId = getEmbedData('topicId')
      userId = getMe().id
    } else return true;
  }
  if(isCallBackPresent) {
    mentorMenteeSessions = await callBack().then(res => {
      if (fromPage === 'BookSession' && get(res, 'mentorMenteeSessions', []).length) setLoading()
      return res.mentorMenteeSessions
    })
  }else{
    if(fromPage === 'other') {
      const mentorMenteeSession = await requestToGraphql(gql`{
            mentorMenteeSessions(
              filter: {
                  and: [
                      { menteeSession_some: { user_some: { id: "${userId}" } } }
                      { topic_some: { id: "${topicId}" } }
                  ]
              }
            ) {
              id
              sessionStatus
              isQuizSubmitted
              quizSubmitDate
              isAssignmentSubmitted
              assignmentSubmitDate
              isPracticeSubmitted
              practiceSubmitDate
              isSubmittedForReview
            }
          }
        `)
        mentorMenteeSessions = get(mentorMenteeSession, 'data.mentorMenteeSessions', [])
    } else{
      mentorMenteeSessions = await fetchMentorMenteeSession(
        null, null, userId,
        'menteeTopicFilter', 'withMenteeToken',
        true, topicId
    ).call().then(res => {
      if (fromPage === 'BookSession' && get(res, 'mentorMenteeSessions', []).length) setLoading()
      return res.mentorMenteeSessions
    })
    }
  }
    let mentorMenteeSessionData = null;
    // if mmSession exist will return them
  if (get(mentorMenteeSessions, 'length', 0) === 1) {
    if (fromPage === 'BookSession') {
      fetchMentorMenteeSession(
          null, null, userId,
          'menteeTopicFilter', 'withMenteeToken',
          true, topicId
      ).call()
      setLoading()
      return true;
    } else if (fromPage !== 'BookSession') return true
  }
    if (get(mentorMenteeSessions, 'length', 0) > 0) {
      let mentorMenteeSessionInput = {}
      const mmSessions = mentorMenteeSessions
      for (const mmSession of mmSessions) {
        mentorMenteeSessionInput = { ...getUpdateMMsInput(mmSession) }
        if (get(mmSession, 'sessionStatus') === 'allotted') {
          console.log(`Deleting extra MMSession with Id: ${get(mmSession, 'id')}`)
          await deleteExtraMMSession(get(mmSession, 'id'))
        } else if (get(mmSession, 'sessionStatus') === 'started') {
          mentorMenteeSessionData = mmSession
        } else if (get(mmSession, 'sessionStatus') === 'completed') {
          mentorMenteeSessionData = mmSession
        }
      }
      if (mentorMenteeSessionData && get(mentorMenteeSessionData, 'sessionStatus') === 'completed') {
        updateMentorMenteeSession(get(mentorMenteeSessionData, 'id'), mentorMenteeSessionInput)
      }
      if (fromPage === 'BookSession' && mentorMenteeSessionData) {
        fetchMentorMenteeSession(
            null, null, userId,
            'menteeTopicFilter', 'withMenteeToken',
            true, topicId
        ).call()
        setLoading()
        return true;
      } else if (fromPage !== 'BookSession' && mentorMenteeSessionData) return true
    }
  // if mmSession doesn`t exist and event mentorSessionId is not passed so will fetch mentorSessionId to perform add mentee or mmSession
  let batchSession = null
  let coursePackageId = null;
  // let studentBatch = null
  let batchId = ''
    if (userId && topicId) {
      // studentBatch = localStorage.getItem('activeClassroom')
      batchId = localStorage.getItem('activeClassroom')
      if (batchId) {
        batchSession = await fetchBatchSession(batchId, topicId);
        coursePackageId = get(batchSession, 'batch.coursePackage.id');
      }
  }
  if (!mentorSessionId) {
    mentorSessionId = get(batchSession, 'mentorSession.id')
  }
    const menteeSession = await requestToGraphql(gql`{
        menteeSessions(
            filter: { and: [{ user_some: { id: "${userId}" } }, { topic_some: { id: "${topicId}" } }] }
        ) {
            id
        }
        }
    `)
      if (get(menteeSession, 'data.menteeSessions', []).length > 0) {
        const isCreatingMMSession = isWindowDefined && localStorage.getItem("isCreatingMMSession")
        if ([true, 'true'].includes(isCreatingMMSession) && fromPage !== 'BookSession') {
          console.log('creating session', isCreatingMMSession)
          return true
        }
        isWindowDefined && localStorage.setItem('isCreatingMMSession', true)
        const mmsSession = await addMentorMenteeSession(mentorSessionId, get(menteeSession, 'data.menteeSessions[0].id'), topicId, {
          sessionStatus: action,
          startSessionByMentee: new Date()
        }, true, null, coursePackageId).call()
        isWindowDefined && localStorage.setItem('isCreatingMMSession', false)
        if (fromPage === 'BookSession' && get(mmsSession, 'addMentorMenteeSession.id')) {
          setLoading();
          return true;
        }
        else if (fromPage !== 'BookSession' && get(mmsSession, 'addMentorMenteeSession.id')) return true
      }
      if (!get(menteeSession, 'data.menteeSessions', []).length) {
        let menteeSessionId
        if (batchSession) {
          const bookingDate = get(batchSession, 'bookingDate')
          const slotsArray = getSelectedSlotsStringArray(batchSession || {})
          const startMinutes = get(batchSession, 'startMinutes') || 0
          const endMinutes = get(batchSession, 'endMinutes')
          const currentSlot = slotsArray.length ? slotsArray[0].split('slot')[1] : false
          if (currentSlot !== false) {
            const menteeInput = {
              bookingDate,
              [`slot${currentSlot}`]: true,
            }
            if (startMinutes) menteeInput.startMinutes = startMinutes
            if (endMinutes) menteeInput.endMinutes = endMinutes
            menteeSessionId = await addMenteeSession(userId, topicId, menteeInput)
          }
        } else {
          const _momentObj = moment()
          const startMinutes = _momentObj.get('minutes')
          const currentHour = _momentObj.get('hours')
          const bookingDate = _momentObj.startOf('day').toISOString()
          const menteeInput = {
            bookingDate,
            [`slot${currentHour}`]: true,
            startMinutes
          }
          menteeSessionId = await addMenteeSession(userId, topicId, menteeInput)
        }
        if (menteeSessionId) {
          const isCreatingMMSession = isWindowDefined && localStorage.getItem("isCreatingMMSession")
          if ([true, 'true'].includes(isCreatingMMSession) && fromPage !== 'BookSession') {
             console.log('creating session', isCreatingMMSession)
            return true
          }
          isWindowDefined && localStorage.setItem('isCreatingMMSession', true)
          const mmsSession = await addMentorMenteeSession(mentorSessionId, menteeSessionId, topicId, {
            sessionStatus: action,
            startSessionByMentee: new Date()
          }, true, null, coursePackageId).call()
          isWindowDefined && localStorage.setItem('isCreatingMMSession', false)
          if (fromPage === 'BookSession' && get(mmsSession, 'addMentorMenteeSession.id')) {
            setLoading()
            return true;
          }
           else if (fromPage !== 'BookSession' && get(mmsSession, 'addMentorMenteeSession.id')) return true
        }
      }
  return mentorMenteeSessionData;
}

export default mentorMenteeSessionAddOrDelete;