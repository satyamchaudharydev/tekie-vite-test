import React from 'react'
import { COURSES } from '../../config'
import { get, sortBy } from 'lodash'
import { minCap } from '../../utils/data-utils';

export const courseColorMappings = {
    python: { primary: '#966CAB', secondary: '#E8DFEC' },
    default: { primary: '#5BB27E', secondary: '#DCEFE4' },
}

export const getCourseObject = (courseId) => {
    if (courseId) {
        return COURSES.filter(el => el.course.id === courseId)[0] || {
            course: { color: courseColorMappings['default'] }
        }
    }
    return { course: { color: courseColorMappings['default'] } }
}

export const courses = (COURSES && COURSES.length) ? COURSES.map(el => el.course.title) : [];

export const calculateMentorRating = (mentorInfo) => {
  let ratingNum = 0;
  let ratingDen = 0;
  let mentorRating = null
  if (mentorInfo) {
      Object.keys(mentorInfo).forEach((key) => {
        if (key.includes('pythonCourseRating') && mentorInfo[key] > 0) {
          const ratingValue = key.split('pythonCourseRating')[1];
          ratingNum += ratingValue * mentorInfo[key];
          ratingDen += mentorInfo[key];
        }
      });
      if (ratingNum > 0 && ratingDen > 0) {
        mentorRating = Number((ratingNum / ratingDen).toFixed(2));
      }
  }
  return mentorRating ? minCap(mentorRating, 4.7) : 5
};

const getSchoolId = (loggedInUser) => {
    if (loggedInUser) {
        return loggedInUser.getIn(['schools', 0, 'id'])
    }
    return null
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

const getSlotLabel = (slotNumberString, isCapital = true) => {
    const slotNumber = Number(slotNumberString)
    let AM = 'AM'
    let PM = 'PM'
    if (!isCapital) {
    AM = 'am'
    PM = 'pm'
    }
    let startTime = ''
    let endTime = ''
    if (slotNumber < 12) {
    if (slotNumber === 0) {
        startTime = `12:00 ${AM}`
    } else {
        startTime = `${slotNumber}:00 ${AM}`
    }
    if (slotNumber === 11) {
        endTime = `12:00 ${PM}`
    } else {
        endTime = `${slotNumber + 1}:00 ${AM}`
    }
    } else if (slotNumber > 12) {
    startTime = `${slotNumber - 12}:00 ${PM}`
    if (slotNumber === 23) {
        endTime = `12:00 ${AM}`
    } else {
        endTime = `${slotNumber - 11}:00 PM`
    }
    } else {
    startTime = `12:00 ${PM}`
    endTime = `1:00 ${PM}`
    }
    return {
    startTime,
    endTime
    }
}

const getSlotTime = (session, returnValue='object') => {
    const slotTimeStringArray = getSelectedSlotsStringArray(session)
    if (slotTimeStringArray && slotTimeStringArray.length) {
        const slotNumber = slotTimeStringArray[0].split('slot')[1]
        const label = getSlotLabel(slotNumber)
        if (returnValue === 'string') {
            return `${label.startTime} to ${label.endTime}`
        }
        return label
    }
    return null
}

const chaptersToTopicsArr = (courseChapters) => {
    const topics = []
    courseChapters && courseChapters.forEach(chapter => {
        if (chapter.topics && chapter.topics.length) {
            topics.push(...chapter.topics)
        }
    })
    return sortBy(topics, ['order'])
}

const currentBatchSesssionStatus = (record) => {
    const topicsArr = chaptersToTopicsArr(get(record, 'course.chapters', []))
    const currentTopicOrder = get(record, 'currentComponent.currentTopic.order')
    const latestSessionStatus = get(record, 'currentComponent.latestSessionStatus')

    if (topicsArr && (currentTopicOrder === get(topicsArr[0], 'order'))) {
        if (latestSessionStatus === 'allotted') {
            return (
                <div className='school-dashboard-batch-progress-status school-dashboard-batch-yetToStart'>
                    Yet to Start
                </div>
            )
        } else if (latestSessionStatus === 'started') {
            return (
                <div className='school-dashboard-batch-progress-status school-dashboard-batch-inProgress'>
                    In Progress
                </div>
            )
        }
    } else if (topicsArr && (currentTopicOrder > get(topicsArr[0], 'order'))) {
        return (
            <div className='school-dashboard-batch-progress-status school-dashboard-batch-inProgress'>
                In Progress
            </div>
        )
    } else if (topicsArr && (currentTopicOrder === get(topicsArr[topicsArr.length - 1], 'order'))) {
        if (latestSessionStatus === 'completed') {
            return (
                <div className='school-dashboard-batch-progress-status school-dashboard-batch-completed'>
                    Completed
                </div>
            )
        }
        return (
            <div className='school-dashboard-batch-progress-status school-dashboard-batch-inProgress'>
                In Progress
            </div>
        )
    }
    return '-'
}

export { getSlotLabel, getSlotTime, getSchoolId, chaptersToTopicsArr, currentBatchSesssionStatus}