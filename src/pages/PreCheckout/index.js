import { connect } from 'react-redux'
import PreCheckout from './PreCheckout'
import {Map} from 'immutable'
import fetchMenteeCourseSyllabus from '../../queries/sessions/fetchMenteeCourseSyllabus'
import addMenteeSession from '../../queries/sessions/addMenteeSession'
import { filterKey } from '../../utils/data-utils'
import addMentorMenteeSession from '../../queries/sessions/addMentorMenteeSession'
import config from "../../config";
import fetchSessionHomepage from '../../queries/sessions/fetchSessionHomepage'

const mapStateToProps = (state, { match }) => {
    const users = state.data.getIn(['user','data'])
    const menteeRole = users.find((userObj)=>userObj.get('role') === config.MENTEE)
    const selfLearnerRole = users.find((userObj)=>userObj.get('role') === config.SELF_LEARNER)
    const studentProfile = state.data.getIn(['studentProfile','data']).find((studentData)=>{
        if (!menteeRole && !selfLearnerRole) return Map({})
        return studentData.get('id') === (menteeRole || selfLearnerRole).getIn(['studentProfile','id'])
    })
    const invitedUsers = state.data.getIn(['userInvite','data'])
    return {
    menteeCourseSyllabus: state.data.getIn(['menteeCourseSyllabus','data']),
    ...addMentorMenteeSession().mapStateToProps(),
    ...fetchSessionHomepage().mapStateToProps(state),

    loggedInUser: filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0) || Map({}),
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
    topic: state.data.getIn([
        'topic',
        'data'
    ]),
    profile: menteeRole || selfLearnerRole,
    userBillingDetails : menteeRole || selfLearnerRole || Map(),
    accountProfileSuccess: state.data.getIn(['user','fetchStatus','accountProfile','success']),
    studentProfile: studentProfile||Map(),
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
}}

export default connect(mapStateToProps)(PreCheckout)
