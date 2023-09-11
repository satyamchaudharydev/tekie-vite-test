import StudentProfile from './StudentProfile'
import { withRouter } from 'react-router';
import withNav from '../components/Nav/withNav'
import { connect } from 'react-redux'
import { filterKey } from '../../../utils/data-utils'

const mapStateToProps = (state) => ({
    schoolStudentProfiles: filterKey(state.data.getIn([
        'schoolStudentProfiles',
        'data'
    ]), 'schoolStudentProfiles'),
    studentBatches: filterKey(state.data.getIn([
        'schoolBatches',
        'data'
    ]), 'studentBatches'),
    loggedInUser: filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser').get(0) || new Map({}),
    loggedInUserArray: filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser'),
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) || state.data.getIn(['userChildren', 'data']).size,
})


export default connect(mapStateToProps)(withRouter(withNav(StudentProfile)({ title: 'Students' })));