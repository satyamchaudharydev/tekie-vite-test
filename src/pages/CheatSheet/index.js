import CheatSheet from './CheatSheet'
import { connect } from 'react-redux'
import { filterKey } from '../../utils/data-utils'

const mapStateToProps = (state) => ({
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
        state.data.getIn(['userChildren', 'data']).size,
    userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
    userStudentProfileId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'studentProfile', 'id'], false),
    courses: state.data.getIn(['courses', 'data']),
    cheatSheets: state.data.getIn(['cheatSheetConcepts', 'data']),
    hasMultipleChildren: state.data.getIn(['userChildren', 'data']).size > 1,
    cheatSheetTopics: state.data.getIn([
        'cheatSheetTopics',
        'data'
    ]),
    ischeatSheetTopicsFetching: state.data.getIn([
        'getCheatSheet',
        'fetchStatus',
        'getCheatSheet/default',
        'loading'
    ]),
    ischeatSheetTopicsFetched: state.data.getIn([
        'getCheatSheet',
        'fetchStatus',
        'getCheatSheet/default',
        'success'
    ]),
    fetchgetCheatSheetFailure: state.data.getIn([
        'getCheatSheet',
        'fetchStatus',
        'getCheatSheet/default',
    ]),
    fetchFailureStatus: state.data.getIn([
        'errors',
        'getCheatSheet/fetch'
    ]),
    studentCurrentStatus: state.data.getIn(['getStudentCurrentStatus', 'data', 'status']),
    loggedInUser: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser'),
    eventData: state.data.getIn(['events', 'data']),
    eventDataFetchStatus: state.data.getIn(['event', 'fetchStatus', 'event']),
})

export default connect(mapStateToProps)(CheatSheet)
