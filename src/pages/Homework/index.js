import Homework from './Homework'
import { connect } from 'react-redux'
import { filterKey } from '../../utils/data-utils'
import fetchMenteeCourseSyllabus from '../../queries/sessions/fetchMenteeCourseSyllabus'

const mapStateToProps = (state) => ({
    menteeCourseSyllabus: state.data.getIn(['menteeCourseSyllabus','data']),
    hasMultipleChildren: state.data.getIn(['userChildren', 'data']).size > 1,
    mentorMenteeSession: filterKey(state.data.getIn([
        'menteeCourseHomework',
        'data'
    ]), 'mentorMenteeSession/completed'),
    allMentorMenteeSession: state.data.getIn([
        'mentorMenteeSession',
        'data'
    ]),
    batchSession: state.data.getIn([
        'batchSession',
        'data'
    ]),
    course: state.data.getIn([
        'course',
        'data'
    ]),
    userHomeworkStreaks: state.data.getIn([
        'userHomeworkStreaks',
        'data'
    ]),
    mentorMenteeSessionFetchStatus: state.data.getIn([
        'mentorMenteeSession',
        'fetchStatus',
        'mentorMenteeSession/completed'
    ]),
    userQuizDetailsFetchStatus: state.data.getIn([
        'userQuizDetails',
        'fetchStatus',
        'userQuizDetails'
    ]),
    userId: filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0).getIn(['id']),
    topics: state.data.getIn([
        'topic',
        'data'
    ]),
    userQuizDetails: state.data.getIn([
        'userQuizDetails',
        'data'
    ]),
    userProfile: state.data.getIn([
        'userProfile',
        'data'
    ]),
    loggedInUser: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').get(0) || Map({}),
    loggedInUserChat: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser'),
    studentCurrentStatus: state.data.getIn(['getStudentCurrentStatus', 'data', 'status']),
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
        state.data.getIn(['userChildren', 'data']).size,
})

export default connect(mapStateToProps)(Homework)
