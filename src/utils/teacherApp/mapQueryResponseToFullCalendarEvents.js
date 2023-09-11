import { get, sortBy } from "lodash"
import moment from "moment"

export const getGradesOrSections = (session, type) => {
    if (session.classroom.classes) {
        const { classes } = session.classroom
        if (type === 'grades') {
            const grades = classes.map(classObj => classObj.grade)
            return grades
        }
        if (type === 'sections') {
            const sections = classes.map(classObj => classObj.section)
            return sections
        }
    }
    return []
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
    return slotTimeStringArray    //['slot4']
}

const getSlotLabel = (slotNumberString, startMinutes = 0, endMinutes = 0, isCapital = true) => {
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
            startTime = startMinutes ? `12:${startMinutes} ${AM}` : `12:00 ${AM}`
        } else {
            startTime = startMinutes ? `${slotNumber}:${startMinutes} ${AM}` : `${slotNumber}:00 ${AM}`
        }
        if (slotNumber === 11) {
            if (startMinutes) {
                endTime = endMinutes ? `12:${endMinutes} ${PM}` : `12:${startMinutes} ${PM}`
            } else {
                endTime = endMinutes ? `12:${endMinutes} ${PM}` : `12:00 ${PM}`
            }
        } else {
            if (endMinutes && !startMinutes) {
                endTime = `${slotNumber}:${endMinutes} ${AM}`
            } else if (startMinutes && endMinutes) {
                endTime = `${slotNumber}:${endMinutes} ${AM}`
            } else if (startMinutes && !endMinutes) {
                endTime = endMinutes ? `${slotNumber + 1}:${endMinutes} ${AM}` : `${slotNumber + 1}:${startMinutes} ${AM}`
                endTime = `${slotNumber + 1}:${startMinutes} ${AM}`
            } else {
                endTime = `${slotNumber + 1}:00 ${AM}`
            }
        }
    } else if (slotNumber > 12) {
        startTime = startMinutes ? `${slotNumber - 12}:${startMinutes} ${PM}` : `${slotNumber - 12}:00 ${PM}`
        if (slotNumber === 23) {
            if (startMinutes) {
                endTime = endMinutes ? `12:${endMinutes} ${AM}` : `12:${startMinutes} ${AM}`
            } else {
                endTime = endMinutes ? `12:${endMinutes} ${AM}` : `12:00 ${AM}`
            }
        } else {
            if (endMinutes && !startMinutes) {
                endTime = `${slotNumber}:${endMinutes} ${PM}`
            } else if (startMinutes && endMinutes) {
                endTime = `${slotNumber}:${endMinutes} ${PM}`
            } else if (startMinutes && !endMinutes) {
                endTime = endMinutes ? `${slotNumber + 1}:${endMinutes} ${PM}` : `${slotNumber + 1}:${startMinutes} ${PM}`
                endTime = `${slotNumber + 1}:${startMinutes} ${PM}`
            } else {
                endTime = `${slotNumber - 12 + 1}:00 ${PM}`
            }
        }
    } else {
        startTime = startMinutes ? `12:${startMinutes} ${PM}` : `12:00 ${PM}`;
        endTime = endMinutes ? `12:${endMinutes} ${PM}` : `1:00 ${PM}`;
    }
    return {
        startTime,
        endTime
    }
}
export const getSlotTime = (batchSession, newLogic = false) => {
    const slotTimeStringArray = getSelectedSlotsStringArray(batchSession)
    if (newLogic) {
        const slotArr = sortBy(slotTimeStringArray.map(el => Number(el.split('slot')[1]))).map((slots) => {
            const label = getSlotLabel(`slot${slots}`.split("slot")[1]);
            return label;
        });
        return {
            startTime: get(slotArr[0], 'startTime'),
            endTime: get(slotArr[slotArr.length - 1], 'endTime'),
        }
    }
    if (slotTimeStringArray && slotTimeStringArray.length) {
        const slotNumber = slotTimeStringArray[0].split('slot')[1]  //4
        const label = getSlotLabel(slotNumber, batchSession.startMinutes, batchSession.endMinutes, false)
        return label
    }
    return null
}
const getTimeFromSlot = (session = {}) => {
    let trueSlot
    for (let key in session) {
        if (key.includes('slot')) {
            if (session[key]) {
                trueSlot = key
            }
        }
    }
    if (!trueSlot) {
        trueSlot = 'slot0'
    }

    const trueSlotNumber = Number(trueSlot.substring(4))  // using 4 coz, 'slot' has 4 letters
    // return new Date(new Date().setHours(trueSlotNumber, 0, 0, 0))
    return trueSlotNumber
}

export const getSlotDifference = ({date, timeDiff, compareType = 'less', format = 'hours'}) => {
  const currentTime = moment();
  let hoursValue = 0;
    if (compareType === 'greater') hoursValue = moment(currentTime).diff(moment(date), format);
  else hoursValue = moment(date).diff(moment(currentTime), format);
  return hoursValue < timeDiff;
};

export const getTimeRangeFromSession = (bookingDate, session, documentType) => {
    let startTime, endTime
    startTime = new Date(bookingDate)
    endTime = new Date(bookingDate);
    const startMinutes = get(session, 'startMinutes', 0)
    const endMinutes = get(session, 'endMinutes', 0)
    const startTimeHour = getTimeFromSlot(session)
    startTime.setHours(startTimeHour, 0, 0, 0)

    endTime = startTime.getTime() + endMinutes * 60 * 1000
   
    startTime.setHours(startTimeHour, startMinutes, 0, 0)
    endTime = new Date(endTime)
    if (startTime.getTime() >= endTime.getTime()) {
        let endTimeNumber = startTimeHour + 1
        endTime.setHours(endTimeNumber)
    }

    //TEMP LOGIC FOR END TIME
    // if (startMinutes === endMinutes) {
    //     let endTimeNumber = startTimeHour + 1
    //     endTime.setHours(endTimeNumber, endMinutes)
    // }
    // else if (!startMinutes && endMinutes) {
    //     if(endMinutes<30){
    //     endTime.setHours(startTimeHour+1, endMinutes)
    //     }else{
    //         endTime.setHours(startTimeHour, endMinutes)
    //     }
    // }
    // else if (startMinutes && !endMinutes) {
    //     if (startMinutes <= 30) {
    //         endTime.setHours(startTimeHour + 1)
    //     } else {
    //         endTime.setHours(startTimeHour + 2)
    //     }
    // }
    // else if (startMinutes && endMinutes) {
    //     if(startMinutes>=30){
    //         endTime.setHours(startTimeHour+1, endMinutes)
    //     }else{
    //         endTime.setHours(startTimeHour, endMinutes)
    //     }
    // }
    return { startTime, endTime }
}
const getTitle = (session) => {
    if (get(session, 'documentType') === 'event') {
        return get(session, 'eventType')
    }
    if (get(session, 'documentType') === 'adhocSession') {
        return get(session, 'previousTopic.title')
    }
    return get(session, 'topicData.title')
}
const mapQueryResponseToFullCalendarEvents = (sessions) => {

    const modifiedArr = sessions.map(session => {
        const { startTime, endTime } = getTimeRangeFromSession(session.bookingDate, session, get(session, 'documentType'))
        return {
            title: getTitle(session),
            start: new Date(startTime),
            end: new Date(endTime),
            id: get(session, 'id'),
            allDay: get(session, 'documentType') === 'event' ? true : false,
            display: get(session, 'documentType') === 'event' ? 'background' : null,
            extendedProps: {
                title: getTitle(session),
                topic: get(session, 'documentType')==='batchSession'?get(session, 'topicData'):get(session, 'previousTopic'),
                course: get(session, 'courseData'),
                sessionStartedByMentorAt:get(session,'sessionStartedByMentorAt'),
                grades: getGradesOrSections(session, 'grades'),
                sections: getGradesOrSections(session, 'sections'),
                sessionStatus: get(session, 'sessionStatus'),
                sessionRecordingLink: get(session, 'sessionRecordingLink'),
                sessionMode: get(session, 'sessionMode'),
                thumbnail: get(session, 'topicData.thumbnailSmall.uri'),
                previousTopic: get(session, 'previousTopic'),
                topicComponentRule: get(session, 'documentType')==='batchSession'?get(session, 'topicData.topicComponentRule'):get(session,'previousTopic.topicComponentRule'),
                documentType: get(session, 'documentType'),
                sessionType: get(session, 'sessionType'),
                order: get(session, 'documentType') === 'batchSession' ? get(session, 'topicData.order') : get(session, 'previousTopic.order'),
                bookingDate: get(session, 'bookingDate'),
                startMinutes: get(session, 'startMinutes'),
                endMinutes: get(session, 'endMinutes'),
                sessionStartTime: get(session, 'sessionStartDate'),
                sessionEndTime: get(session, 'sessionEndDate'),
                totalStudents: (get(session, 'classroom.students', []) || []).length,
                attendance: get(session, 'attendance'),
                classroom: get(session, 'classroom', {}),
                sessionOtp: get(session, 'sessionOtp[0].otp'),
                classType:get(session, 'documentType')==='batchSession'? get(session, 'topicData.classType'):get(session, 'previousTopic.classType')
            }

        }
    })

    return modifiedArr
}

export default mapQueryResponseToFullCalendarEvents
