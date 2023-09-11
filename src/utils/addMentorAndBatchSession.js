import get from 'lodash/get'
import moment from 'moment'
import { getSelectedSlotsStringArray } from '../pages/TeacherApp/constants/report/getSlotTime'
import addBatchSession from '../queries/batchSessions/addBatchSession'
import addMentorSession from '../queries/mentorSessions/addMentorSession'
import updateMentorSession from '../queries/mentorSessions/updateMentorSession'
import fetchMentorSession from '../queries/teacherApp/classroomCourseListing/fetchMentorSession'
import getCourseId, { getCoursePackageId } from './getCourseId'

const addMentorAndBatchSession = async ({ mentorId, topicId, batchId, userId }) => {
    let mentorSessionId = ''
    let addedBatchSession = ''
    const _momentObj = moment()
    let startMinutes = _momentObj.get('minutes')
    const currentHour = _momentObj.get('hours')
    const bookingDate = _momentObj.startOf('day').toISOString()
    console.log(`Fetching MentorSession for mentor ${mentorId}`)
    const mentorSessionRes = await fetchMentorSession(bookingDate, mentorId)
    const mentorSessionInput = {
      availabilityDate: bookingDate,
      sessionType: 'batch',
    };
    const batchSessionInput = {
      bookingDate,
      sessionMode: 'offline',
      startMinutes
    };
    const courseConnectId = getCourseId(topicId)
    const coursePackageConnectId = getCoursePackageId()
    batchSessionInput[`slot${currentHour}`] = true;
    if (mentorSessionRes && get(mentorSessionRes, 'mentorSessions', []).length) {
      const mentorSessionConnectId = get(mentorSessionRes, 'mentorSessions[0].id')
      const openedSlotsArray = getSelectedSlotsStringArray(get(mentorSessionRes, 'mentorSessions[0]'))
      if (openedSlotsArray.includes(`slot${currentHour}`)) {
        console.log(`Adding BatchSession for batch ${batchId}, with existing mentorSessionId ${mentorSessionConnectId}`)
        addedBatchSession = await addBatchSession({
          batchConnectId: batchId,
          topicConnectId: topicId,
          courseConnectId,
          mentorSessionConnectId,
          coursePackageConnectId,
          input: batchSessionInput,
          sessionCreatedByConnectId: userId
        })
      } else {
        mentorSessionInput[`slot${currentHour}`] = true;
        console.log(`Updating MentorSession for mentor ${mentorId}, of existing mentorSessionId ${mentorSessionConnectId}`)
        await updateMentorSession(mentorSessionConnectId, '', mentorSessionInput);
        console.log(`Adding BatchSession for batch ${batchId}, with existing mentorSessionId ${mentorSessionConnectId}, after update`)
        addedBatchSession = await addBatchSession({
          batchConnectId: batchId,
          topicConnectId: topicId,
          courseConnectId,
          mentorSessionConnectId,
          coursePackageConnectId,
          input: batchSessionInput,
          sessionCreatedByConnectId: userId
        })
      }
      mentorSessionId = mentorSessionConnectId
    } else {
      mentorSessionInput[`slot${currentHour}`] = true;
      console.log(`Adding MentorSession for batch ${mentorId}`)
      const addedMentorSession = await addMentorSession(mentorId, courseConnectId, mentorSessionInput)
      const mentorSessionConnectId = get(addedMentorSession, 'addMentorSession.id')
      console.log(`Adding BatchSession for batch ${batchId}, after creating new mentorSessionId ${mentorSessionConnectId}`)
      addedBatchSession = await addBatchSession({
        batchConnectId: batchId,
        topicConnectId: topicId,
        courseConnectId,
        mentorSessionConnectId,
        coursePackageConnectId,
        input: batchSessionInput,
        sessionCreatedByConnectId: userId
      })
      mentorSessionId = mentorSessionConnectId
    }
    return {
      mentorSessionId,
      addBatchSession: get(addedBatchSession, 'addBatchSession')
    }
}

export default addMentorAndBatchSession;
