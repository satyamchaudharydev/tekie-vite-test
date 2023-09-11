import { get } from 'lodash';
import mixpanel from 'mixpanel-browser';
import { appNames, mixPanelEvents, mixPanelFields } from '../constants/mixpanel/mixPanelConst';
import { filterKey } from './data-utils';
import { getActiveBatchDetail } from './multipleBatch-utils';

const mixpanelTrack = (eventName, props, appName) => {
    const { PAGE_VIEWED, OTP_LOGIN, REVISIT_SESSION, START_SESSION } = mixPanelEvents;
    const { STUDENT_APP, TEACHER_APP } = appNames
    const isProduction = import.meta.env.REACT_APP_NODE_ENV === 'production'
    const projectToken = appName === TEACHER_APP ? 
    import.meta.env.REACT_APP_MIXPANEL_TEACHER_APP_PROJECT : import.meta.env.REACT_APP_MIXPANEL_PROJECT
    if (!appName || !projectToken) return;
    const mixPanelPropsObj = {}
    if (!get(props, 'loggedInUser') || !get(props, 'studentProfile')) {
        const store = typeof window !== 'undefined' && window.store.getState().data
        if (store) {
            if (!get(props, 'loggedInUser')) {
                let loggedInUser = filterKey(
                    store.getIn(["user", "data"]),
                    'loggedinUser'
                )
                loggedInUser = loggedInUser && loggedInUser.toJS()
                Object.assign(props, {
                    loggedInUser: loggedInUser && get(loggedInUser, '0')
                })
            }
            if (!get(props, 'studentProfile')) {
                let studentProfile = store.getIn(['studentProfile', 'data'])
                studentProfile = studentProfile && studentProfile.toJS()
                Object.assign(props, {
                    studentProfile: studentProfile && get(studentProfile, '0')
                })
            }
        }
    }
    if (get(props, 'startTime') && get(props, 'endTime')) {
        let timeTakenInSec = (new Date(get(props, 'endTime')).getTime() - new Date(get(props, 'startTime')).getTime()) / 1000
        timeTakenInSec = Number(timeTakenInSec).toFixed(2)
        mixPanelPropsObj[mixPanelFields.pageLoadTime] = Number(timeTakenInSec)
    }
    if (get(props, 'pageTitle')) mixPanelPropsObj[mixPanelFields.pageTitle] = get(props, 'pageTitle')
    if (!get(props, 'pageTitle')) {
        switch (eventName) {
            case OTP_LOGIN:
                mixPanelPropsObj[mixPanelFields.pageTitle] = 'Otp Login';
                break;
            case REVISIT_SESSION:
                mixPanelPropsObj[mixPanelFields.pageTitle] = 'Revisit Session';
                break;
            case START_SESSION:
                mixPanelPropsObj[mixPanelFields.pageTitle] = 'Start Session';
                break;
            default:
                break
        }
    }
    // const netSpeedInMbps = (window && localStorage.getItem("netSpeedInMbps")) || ''
    // if (netSpeedInMbps) mixPanelPropsObj[mixPanelFields.netSpeed] = netSpeedInMbps
    mixPanelPropsObj[mixPanelFields.appName] = appName;
    switch (appName) {
        case STUDENT_APP:
            if (get(props, 'loggedInUser')) {
                const loggedInUser = get(props, 'loggedInUser')
                mixPanelPropsObj[mixPanelFields.studentId] = get(loggedInUser, 'id', '')
                mixPanelPropsObj[mixPanelFields.studentName] = get(loggedInUser, 'name', '')
            }
            if (get(props, 'studentProfile')) {
                const studentProfile = get(props, 'studentProfile')
                const grade = get(studentProfile, 'grade', '') ? get(studentProfile, 'grade', '').replace('Grade', '') && Number(get(studentProfile, 'grade', '').replace('Grade', '')) : ''
                mixPanelPropsObj[mixPanelFields.grade] = grade
                mixPanelPropsObj[mixPanelFields.section] = get(studentProfile, 'section', '')
                mixPanelPropsObj[mixPanelFields.rollNo] = get(studentProfile, 'rollNo', '')
                mixPanelPropsObj[mixPanelFields.schoolName] = get(studentProfile, 'school.name', '')
                const studentActiveBatch = getActiveBatchDetail(get(studentProfile, 'batch'))
                mixPanelPropsObj[mixPanelFields.coursePackage] = get(studentActiveBatch, 'coursePackage.title')
                mixPanelPropsObj[mixPanelFields.businessType] = get(studentActiveBatch, 'type') ? get(studentActiveBatch, 'type') === 'normal' ? 'B2C' : get(studentActiveBatch, 'type', '').toUpperCase() : ''
            }
            break;
        case TEACHER_APP:
            if (get(props, 'loggedInUser')) {
                const loggedInUser = get(props, 'loggedInUser')
                const schoolName = get(loggedInUser, 'mentorProfile.schools[0].name') || get(loggedInUser, 'rawData.mentorProfile.schools[0].name')
                if (schoolName) mixPanelPropsObj['School Name'] = schoolName;
                mixPanelPropsObj[mixPanelFields.teacherId] = get(loggedInUser, 'rawData.id')
                mixPanelPropsObj[mixPanelFields.teacherName] = get(loggedInUser, 'name', '')
            }
            break;
        default:
            break;
    }
    Object.keys(mixPanelPropsObj).forEach(key => {
        if (!mixPanelPropsObj[key]) delete mixPanelPropsObj[key]
    })
    mixpanel.init(projectToken, {
        debug: !isProduction,
        ignore_dnt: true
    });
    
    switch (eventName) {
        case PAGE_VIEWED:
        case OTP_LOGIN:
        case REVISIT_SESSION:
            mixpanel.track(eventName, mixPanelPropsObj);
            break;
        default:
            break;
    }
}

export default mixpanelTrack;