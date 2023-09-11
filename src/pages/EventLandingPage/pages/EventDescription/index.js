import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import EventDescription from './EventDescription'
import { filterKey } from '../../../../utils/data-utils'


const mapStateToProps = (state) => ({
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
        state.data.getIn(['userChildren', 'data']).size,
    hasMultipleChildren: state.data.getIn(['userChildren', 'data']).size > 1,
    userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
    userStudentProfileId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'studentProfile', 'id'], false),
    userRole: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'role'], false),
    studentCurrentStatus: state.data.getIn(['getStudentCurrentStatus', 'data', 'status']),
    loggedInUser: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser'),
    eventData: state.data.getIn(['events', 'data']),
    eventDataFetchStatus: state.data.getIn(['events', 'fetchStatus', 'events']),
    isFetchingEvent: state.data.getIn(['events', 'fetchStatus', 'events', 'loading']),
    updateEventStatus: state.data.getIn(['events', 'updateStatus', 'events']),
    studentProfileId: state.data.getIn(['studentProfile', 'data', 0]),
    isUpdatingEvent: state.data.getIn(['events', 'updateStatus', 'events', 'loading']),
    hasUpdateEventFailed: state.data.getIn(['events', 'updateStatus', 'events', 'failure']),
    updateEventFailedMessage: state.data.getIn(['errors', 'events/update']),
    studentProfileIdConnect: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0], false) || filterKey(state.data.getIn(['user', 'data']), 'validateOTP').getIn([0], false),
})

export default connect(mapStateToProps)(withRouter(EventDescription))