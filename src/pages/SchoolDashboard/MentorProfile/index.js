import MentorProfile from './MentorProfile'
import { withRouter } from 'react-router';
import withNav from '../components/Nav/withNav'
import { connect } from 'react-redux'
import { filterKey } from '../../../utils/data-utils'

const mapStateToProps = (state) => ({
    schoolClasses: filterKey(state.data.getIn([
        'schoolClasses',
        'data'
    ]), 'fetchSchoolClasses'),
    schoolMentorProfiles: filterKey(state.data.getIn([
        'schoolMentorProfiles',
        'data'
    ]), 'schoolMentorProfiles'),
    mentorBatches: filterKey(state.data.getIn([
        'schoolBatches',
        'data'
    ]), 'mentorBatches'),
    loggedInUser: filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser').get(0) || new Map({}),
    loggedInUserArray: filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser'),
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) || state.data.getIn(['userChildren', 'data']).size,
})


export default connect(mapStateToProps)(withRouter(withNav(MentorProfile)({ title: 'Mentors' })));