import ClassroomDetail from './ClassroomDetail'
import { connect } from 'react-redux'
import { filterKey } from '../../../../../utils/data-utils'

const mapStateToProps = (state) => ({
    classroomDetail: state.data.getIn([
        'classroomDetail',
        'data'
    ] ),
    upcomingSessions: filterKey(state.data.getIn([
        'classroomSession',
        'data'
    ]), 'classDetail'),
    upcomingSessionsStatus: state.data.getIn([
        'classroomSession',
        'fetchStatus',
        'classDetail'
    ]),
    notices: filterKey(state.data.getIn([
        'notice',
        'data'
    ]), 'classroomDetail'),
    noticeStatus: state.data.getIn([
        'notice',
        'fetchStatus',
        'classroomDetail'
    ]),
    reviewStatus: state.data.getIn([
        'studentReview',
        'fetchStatus',
        'classroomDetail'
    ]),
    studentReviews: filterKey(state.data.getIn([
        'studentReview',
        'data'
    ]), 'classroomDetail'),
    loggedInUser: filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser') || new Map({}),
})

export default connect(mapStateToProps)(ClassroomDetail)
