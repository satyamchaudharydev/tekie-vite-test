import Student from './Student';
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
    classroomGradesFetchStatus:state.data.getIn(['classroomGrades','fetchStatus','classroomGrades']),
    addStudentError:state.data.getIn(['errors' , 'addStudentsData/add' ]),
    updateStudentError:state.data.getIn(['errors' , 'updateStudentsData/update' ]),
    addStudentStatus:state.data.getIn(['addStudentsData','addStatus','addStudentsData']),
    updateStudentStatus:state.data.getIn(['updateStudentsData','updateStatus','updateStudentsData'])
})

export default connect(mapStateToProps)(withRouter(Student));