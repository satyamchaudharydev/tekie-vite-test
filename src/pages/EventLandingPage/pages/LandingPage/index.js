import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import LandingPage from './LandingPage'
import { filterKey } from '../../../../utils/data-utils'


const mapStateToProps = (state) => ({
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
        state.data.getIn(['userChildren', 'data']).size,
    hasMultipleChildren: state.data.getIn(['userChildren', 'data']).size > 1,
    userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
    userRole: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'role'], false),
    studentCurrentStatus: state.data.getIn(['getStudentCurrentStatus', 'data', 'status']),
    loggedInUser: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser'),
    eventsCategories: state.data.getIn(['eventCategories', 'data',]),
    eventsCategoriesFetchStatus: state.data.getIn(['eventCategories', 'fetchStatus']),
    eventsContentTags: state.data.getIn(['contentTags', 'data']),
    eventsContentTagsFetchStatus: state.data.getIn(['contentTags', 'fetchStatus']),
    eventsDetails: filterKey(state.data.getIn(['eventsDetails', 'data']) ,"eventsDetails" ),
    completedEvents: filterKey(state.data.getIn(['eventsDetails', 'data']) , "completed"),
    upcomingEvents: filterKey(state.data.getIn(['eventsDetails', 'data']),"upcoming"),
    eventsDetailsFetchStatus: state.data.getIn(['eventsDetails', 'fetchStatus']),
    userStudentProfileId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'studentProfile', 'id'], false),
    studentProfileIdConnect: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0], false) || filterKey(state.data.getIn(['user', 'data']), 'validateOTP').getIn([0], false),
    isUpdatingEvent: state.data.getIn(['events', 'updateStatus', 'events', 'loading']),
    hasUpdateEventFailed: state.data.getIn(['events', 'updateStatus', 'events', 'failure']),
    hasUpdatedEvent: state.data.getIn(['events', 'updateStatus', 'events', 'success']),
    updateEventFailedMessage: state.data.getIn(['errors', 'events/update', 0]),
})

export default connect(mapStateToProps)(withRouter(LandingPage))