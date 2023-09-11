import SchoolDashboard from './SchoolDashboard'
import { withRouter } from 'react-router';
import withNav from './components/Nav/withNav'
import { connect } from 'react-redux'
import { filterKey } from '../../utils/data-utils'

const mapStateToProps = (state) => ({
    schoolClasses: filterKey(state.data.getIn([
        'schoolClasses',
        'data'
    ]), 'fetchSchoolClasses'),
    schoolSessions: filterKey(state.data.getIn([
        'schoolSessions',
        'data'
    ]), 'fetchSchoolSessions'),
    adhocSessions: filterKey(state.data.getIn([
        'adhocSessions',
        'data'
    ]), 'fetchSchoolSessions'),
    loggedInUser: filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser').get(0) || new Map({}),
    loggedInUserArray: filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser'),
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) || state.data.getIn(['userChildren', 'data']).size,
})


export default connect(mapStateToProps)(withRouter(withNav(SchoolDashboard)({ title: 'Calendar' })));