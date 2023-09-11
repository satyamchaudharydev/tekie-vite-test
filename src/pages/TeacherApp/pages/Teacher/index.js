import Teacher from './Teacher';
import { withRouter } from 'react-router';
import { filterKey } from '../../../../utils/data-utils';
import { connect } from 'react-redux'

const mapStateToProps = (state) => ({
    loggedInUserArray: filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser'),
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) || state.data.getIn(['userChildren', 'data']).size,
    loggedInUser: filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0) || Map({}),
    classroomStudentsData: state.data.getIn(['classroomStudentsData', 'data']),
    classroomGrades: state.data.getIn(['classroomGrades', 'data']),
})

export default connect(mapStateToProps)(withRouter(Teacher));