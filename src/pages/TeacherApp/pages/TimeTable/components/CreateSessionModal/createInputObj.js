import { get } from "lodash"
import moment from "moment"

const makeInputObj = (values, scheduleSessionObj = {},sessionStartDate,sessionEndDate) => {
    const sessionTypeMap = {
        'learning': 'batch',
        'assessment': 'adhoc',
        'revision': 'adhoc',
        'project': 'adhoc',
    }

    let { dayTimeGrid } = scheduleSessionObj
    let scheduleSessionsRules = [];

    //storing  is Recurring boolean value
    let isRecurringFlag = get(values, 'isRecurring')

    //converting start date to readable form
    const getStartDate = (date) => {
        let convertedDate = new Date(new Date(date).setHours(0, 0, 0, 0)).toISOString()
        return convertedDate
    }

    //extracting hour
    const extractHour = (date) => {
        let sliceRange = 2
        let convertedDate = moment(date).format('LT')
        let singleDigitFlag = !!convertedDate[1] === ':'
        if (singleDigitFlag) sliceRange--

        //checking if date AM or PM
        if (convertedDate.trim()[convertedDate.length - 2] === 'P') {
            let finalDate = ((parseInt(convertedDate.slice(0, sliceRange))) + 12).toString()
            return finalDate === '24' ? '12' : finalDate
        }
        return convertedDate.slice(0, sliceRange) === '12' ? 0 : removeColon(convertedDate.slice(0, sliceRange))
    }
      //extracting minute
      const extractMinute = (date,sessionStartDate) => {
          if(!sessionStartDate){
            const slotNumber = extractHour(date)
            const minutes =parseInt(moment(date).format('LT').split(':')[1].slice(0, 2))
            
            return ((slotNumber * 60) + minutes) % 60
          }else{
            if(new Date(date).getHours()-new Date(sessionStartDate).getHours()===1){
                return 60+(new Date(date).getMinutes())
            }
            if(new Date(date).getHours()-new Date(sessionStartDate).getHours()===2){
                return 120
            }
           const difference= new Date(date).getTime()-new Date(sessionStartDate).getTime()
           if((Math.round((difference/1000)/60))===90){
            return 90
           }
            return new Date(date).getMinutes()
          }
    }

    const removeColon = (str) => {
        if (str.includes(':')) return str[0]
        return str
    }

    //creating the base sessionInput Object
    let sessionObj;
    if (values.doReschedule === true) {
        if(isRecurringFlag){
            sessionObj = {
                isRecurring: isRecurringFlag,
                scheduleSessionType: get(values, 'scheduleSessionType'),
                // startDate: isRecurringFlag ? '' : getStartDate(get(values, 'sessionDate')),
                batchSessionId: get(values, 'batchSessionId'),
                adhocSessionId: get(values, 'adhocSessionId'),
                doReschedule: get(values, 'doReschedule'),
            }
        }else{
            sessionObj = {
                isRecurring: isRecurringFlag,
                scheduleSessionType: get(values, 'scheduleSessionType'),
                // startDate: isRecurringFlag ? '' : getStartDate(get(values, 'sessionDate')),
                startDate: (sessionStartDate &&getStartDate(sessionStartDate)) ||getStartDate(get(values, 'sessionDate')),
                endDate: !isRecurringFlag ? '' : getStartDate(sessionEndDate),
                batchSessionId: get(values, 'batchSessionId'),
                adhocSessionId: get(values, 'adhocSessionId'),
                doReschedule: get(values, 'doReschedule'),
            }
        }
        
    }
    else {
        if(isRecurringFlag){
            sessionObj = {
                scheduleSessionType: isRecurringFlag ? 'batch' : sessionTypeMap[get(values, 'type.label')],
                adhocSessionType: sessionTypeMap[get(values, 'type.label')] === 'batch' ? '' : get(values, 'type.label'),
                topicId: isRecurringFlag ? '' : get(values, 'topic.label'),
                batchId: get(values, 'classroom.label'),
                courseId: get(values, 'course.label'),
                isRecurring: isRecurringFlag,
                // startDate: isRecurringFlag ? '' : getStartDate(get(values, 'sessionDate')),
                // endDate: '',
                startDate: (sessionStartDate &&getStartDate(sessionStartDate))||getStartDate(get(values, 'sessionDate')),
                endDate:!isRecurringFlag ? '' : getStartDate(sessionEndDate),
        }
        }else{
            sessionObj = {
                scheduleSessionType: isRecurringFlag ? 'batch' : sessionTypeMap[get(values, 'type.label')],
                adhocSessionType: sessionTypeMap[get(values, 'type.label')] === 'batch' ? '' : get(values, 'type.label'),
                sessionMode: isRecurringFlag ? null : get(values, 'mode.label'),
                topicId: isRecurringFlag ? '' : get(values, 'topic.label'),
                batchId: get(values, 'classroom.label'),
                courseId: get(values, 'course.label'),
                isRecurring: isRecurringFlag,
                // startDate: isRecurringFlag ? '' : getStartDate(get(values, 'sessionDate')),
                // endDate: '',
                startDate: (sessionStartDate &&getStartDate(sessionStartDate))||getStartDate(get(values, 'sessionDate')),
                endDate:!isRecurringFlag ? '' : getStartDate(sessionEndDate),
        }
        }
    

}


    //checking if isRecurring status and manipulating sessionScheduleRules Object
    if (!isRecurringFlag) {
        scheduleSessionsRules.push(
            {
                [`slot${extractHour(get(values, 'startTime'))}`]: true,
                startTime: extractMinute(get(values, 'startTime')),
                endTime: extractMinute(get(values, 'endTime'),get(values, 'startTime'))
            }
        )

    }
    else {
        sessionObj.forceScheduleSessions = false
        dayTimeGrid.slice(1).map((singleDayData) => {
            if (singleDayData.isChecked) {
                scheduleSessionsRules.push({
                    [`slot${extractHour(get(singleDayData, 'startTime'))}`]: true,
                    [singleDayData.day.toLowerCase()]: true,
                    [singleDayData.day.toLowerCase() + 'ClassMode']: singleDayData.mode,
                    startTime: extractMinute(get(singleDayData, 'startTime')),
                    endTime: extractMinute(get(singleDayData, 'endTime'),get(singleDayData, 'startTime'))
                })
            }
            return null
        })
    }
    Object.keys(sessionObj).forEach(key => {
        if (sessionObj[key] === '') {
            delete sessionObj[key];
        }
    });
    return { ...sessionObj, scheduleSessionsRules };
}


export default makeInputObj
