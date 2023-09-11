
import React from 'react'
import Sessions from './Sessions'
import { connect } from 'react-redux'
import { get } from 'lodash'
import {Map} from 'immutable'
import fetchMenteeCourseSyllabus from '../../queries/sessions/fetchMenteeCourseSyllabus'
import addMenteeSession from '../../queries/sessions/addMenteeSession'
import { filterKey } from '../../utils/data-utils'
import addMentorMenteeSession from '../../queries/sessions/addMentorMenteeSession'
import config from "../../config";
import fetchSessionHomepage from '../../queries/sessions/fetchSessionHomepage'
import fetchBatchDetails from '../../queries/fetchBatchDetails'
import getCourseId from '../../utils/getCourseId'

const getLoggedInUserId = (state) => {
    const loggedInUser = filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0) || Map({})
    return (loggedInUser && loggedInUser.toJS) ? loggedInUser.toJS().id : ''
}

const getAssignedMentorId = (state, data) => {
    const salesOperation = state.data.getIn([
        'salesOperation',
        'data'
    ])
    if (data && data.menteeCourseSyllabus && data.menteeCourseSyllabus.toJS) {
        const mentorId = get(data.menteeCourseSyllabus.toJS(), '[0].mentor.id')
        if (mentorId) {
            return mentorId
        }
    }

    return ((salesOperation && salesOperation.toJS) && get(salesOperation.toJS(), '0.mentorId')) || ''
}

const mapStateToProps = (state, { match }) => {
    const users = state.data.getIn(['user','data'])
    const menteeCourseSyllabus = state.data.getIn(['menteeCourseSyllabus','data'])
    console.log({menteeCourseSyllabus})
    const menteeRole = users.find((userObj)=>userObj.get('role') === config.MENTEE)
    const selfLearnerRole = users.find((userObj) => userObj.get('role') === config.SELF_LEARNER)
    const menteeRoleOrLearnerProfileId = (menteeRole || selfLearnerRole) ? (menteeRole || selfLearnerRole).getIn(['studentProfile','id']) : '';
    const studentProfile = state.data.getIn(['studentProfile','data']).find((studentData)=>{
        return studentData.get("id") === menteeRoleOrLearnerProfileId
    })
    const invitedUsers = state.data.getIn(['userInvite','data'])
    return {
    menteeCourseSyllabus,
    ...addMentorMenteeSession().mapStateToProps(),
    ...fetchSessionHomepage().mapStateToProps(state),
    ...fetchBatchDetails().mapStateToProps(state),
    hasMultipleChildren: state.data.getIn(['userChildren', 'data']).size > 1,
    availableSlot: filterKey(state.data.getIn(['availableSlot', 'data']), 'sessionHomepage'),
    loggedInUserChat: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser'),
    loggedInUser: filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0) || Map({}),
    loggedInUserSchoolInfo: filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'sessionHomepage') || Map({}),
    loggedInMentor: filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedInMentor').get(0) || Map({}),
    ...addMenteeSession().mapStateToProps(),
    externalAddMenteeSessionStatus: state.data.getIn([
        'addMenteeSession',
        'addStatus'
    ]),
    externalUpdateMenteeSessionStatus: state.data.getIn([
        'addMenteeSession',
        'updateStatus'
    ]),
    userProfile: state.data.getIn([
        'userProfile',
        'data'
    ]),
    mentorLoginStatus: state.data.getIn([
        'user',
        'fetchStatus',
        'loggedInMentor'
    ]),
    mentorLoginErrorReason: state.data.getIn([
        'errors',
        'user/fetch'
    ]),
    mentorSession: state.data.getIn([
        'mentorSession',
        'data'
    ]),
    menteeSession: state.data.getIn([
        'menteeSession',
        'data'
    ]),
    menteeSessionFetchStatus: state.data.getIn([
        'menteeSession',
        'fetchStatus',
        'menteeSession'
    ]),
    menteeSessionDeleteStatus: state.data.getIn([
        'menteeSession',
        'deleteStatus',
        'deleteMenteeSession'
    ]),
    userCourseCompletions: state.data.getIn([
        'userCourseCompletions',
        'data',
    ]),
    mentorSessionFetchStatus: state.data.getIn([
        'mentorSession',
        'fetchStatus',
        'mentorSession'
    ]),
    mentorMenteeSessionAddStatus: state.data.getIn([
        'mentorMenteeSession',
        'addStatus'
    ]),
    mentorMenteeAddSessionErrors: state.data.getIn([
        'errors',
        'mentorMenteeSession/add'
    ]),
    mentorMenteeSessionFetchStatus: state.data.getIn([
        'mentorMenteeSession',
        'fetchStatus'
    ]),
    mentorFeedbackFetchStatus: state.data.getIn([
        'fetchMentorFeedback',
        'fetchStatus'
    ]),
    mentorMenteeSession: state.data.getIn([
        'mentorMenteeSession',
        'data'
    ]),
    NPSMentorMenteeSession: filterKey(state.data.getIn(['mentorMenteeSession', 'data']), 'NpsMentorMenteeSession'),
    netPromoterScore: state.data.getIn(['netPromoterScore', 'data']),
    homedata: filterKey(state.data.getIn(['netPromoterScore', 'data']), 'sessionHomepage'),
    hasNPSFetched: state.data.getIn(['sessionHomepage', 'fetchStatus', 'sessionHomepage', 'success']),
    hasNPSAdded: state.data.getIn(['nps', 'addStatus', 'addNps', 'success']),


    /** This added to avoid getting topics from different courses and sending correct prevTopic Id for quiz-report screen.  */
    courseTopic: filterKey(state.data.getIn([
        'topic',
        'data'
    ]), `course/${getCourseId()}`),
    topic: state.data.getIn([
        'topic',
        'data'
    ]),
    course: state.data.getIn([
        'course',
        'data'
    ]),
    profile: menteeRole || selfLearnerRole,
    userBillingDetails : menteeRole || selfLearnerRole || Map(),
    accountProfileSuccess: state.data.getIn(['user','fetchStatus','accountProfile','success']),
    parentDetails: (studentProfile || Map()).getIn(['parents',0,'user']),
    studentProfileSuccess: state.data.getIn(['studentProfile','fetchStatus','accountProfile','success']),
    product: state.data.getIn([
        'product',
        'data'
    ]),
    productSuccess: state.data.getIn(['product','fetchStatus','product','success']),
    discount: state.data.getIn([
        'discount',
        'data'
    ]),
    discountSuccess: state.data.getIn(['discount','fetchStatus','discount','success']),
    paymentRequest: state.data.getIn(['paymentRequest', 'data']) || Map({}),
    paymentResponse: state.data.getIn(['paymentResponse', 'data']) || Map({}),
    paymentResponseStatus: state.data.getIn(['paymentResponse', 'fetchStatus']) || Map({}),
    invitedUsers,
    userCredit: state.data.getIn(['userCredit','data']),
    invitedUsersStatus: state.data.getIn([
        'userInvite',
        'fetchStatus'
    ]),
    userSignUpBonusStatus: state.data.getIn([
        'user',
        'fetchStatus',
        'userSignUpBonus'
    ]),
    bookSessionInfoFetchStatus: state.data.getIn([
        'bookSessionInfo',
        'fetchStatus',
        `bookSessionInfo/${getLoggedInUserId(state)}`
    ]),
    salesOperation: state.data.getIn([
        'salesOperation',
        'data'
    ]),
    slotsOfAssignedMentorFetchStatus: state.data.getIn([
        'mentorSession',
        'fetchStatus',
        `mentorSession/${getAssignedMentorId(state, menteeCourseSyllabus)}`
    ]),
    assignedMentorId: getAssignedMentorId(state, menteeCourseSyllabus),
    slotsOfAssignedMentor: filterKey(state.data.getIn([
        'mentorSession',
        'data'
    ]), `mentorSession/${getAssignedMentorId(state, menteeCourseSyllabus)}`),
    studentProfile: filterKey(
        state.data.getIn([
            'studentProfile',
            'data'
        ]), 'sessionHomepage'
    ),
    batchSession: state.data.getIn([
        'batchSession',
        'data'
    ]),
    batchSessionStatus: state.data.getIn([
        'batchSession',
        'fetchStatus'
    ]),
    // updateTimezoneStatus: state.data.getIn([
    //     'user',
    //     'fetchStatus',
    //     'updateTimezone'
    // ]),
    bookedMenteeSessions: state.data.getIn([
        'addMenteeSession',
        'data'
    ]),
    userId: (filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0) || Map()).getIn(['id']),
    coursePackages:state.data.getIn(['coursePackages','data']),
    studentCurrentStatus: state.data.getIn(['getStudentCurrentStatus', 'data', 'status']),
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
        state.data.getIn(['userChildren', 'data']).size,
}}

export default connect(mapStateToProps)(Sessions)
