import Mentors from './Mentors'
import { withRouter } from 'react-router';
import withNav from '../components/Nav/withNav'
import { connect } from 'react-redux'
import { filterKey } from '../../../utils/data-utils'

const mapStateToProps = (state) => ({
    schoolMentorProfiles: filterKey(state.data.getIn([
        'schoolMentorProfiles',
        'data'
    ]), 'schoolMentorProfiles'),
    totalMentorProfiles: state.data.getIn([
        'totalMentorProfiles',
        'data'
    ]),
    loggedInUser: filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser').get(0) || new Map({}),
    loggedInUserArray: filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser'),
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) || state.data.getIn(['userChildren', 'data']).size,
})


export default connect(mapStateToProps)(withRouter(withNav(Mentors)({ title: 'Mentors' })));