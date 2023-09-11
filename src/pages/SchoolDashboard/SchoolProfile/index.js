import SchoolProfile from './SchoolProfile'
import { withRouter } from 'react-router';
import withNav from '../components/Nav/withNav'
import { connect } from 'react-redux'
import { filterKey } from '../../../utils/data-utils'

const mapStateToProps = (state) => ({
    updateSchoolStatus: state.data.getIn([
        'updateSchool',
        'updateStatus',
        'updateSchool'
    ]),
    schoolProfile: state.data.getIn([
        'schoolProfile',
        'data'
    ]),
    loggedInUser: filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser').get(0) || new Map({}),
    loggedInUserArray: filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser'),
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) || state.data.getIn(['userChildren', 'data']).size,
})


export default connect(mapStateToProps)(withRouter(withNav(SchoolProfile)({ title: '' })));