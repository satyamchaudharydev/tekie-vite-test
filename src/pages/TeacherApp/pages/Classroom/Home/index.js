import Homepage from './Homepage';
import { withRouter } from 'react-router';
import { filterKey } from '../../../../../utils/data-utils';
import { connect } from 'react-redux'

const mapStateToProps = (state) => ({
    
    teacherBatchesData: state.data.getIn(['teacherBatches', 'data']),
    teacherBatchesFetchStatus: state.data.getIn(['teacherBatches', 'fetchStatus', 'teacherBatches']),
    teacherBatchesFetchFailure: state.data.getIn(['errors', 'teacherBatches/fetch']),
    
    addTeacherBatchStatus: state.data.getIn(['teacherBatches', 'addStatus', 'teacherBatches']),
    addTeacherBatchFailure: state.data.getIn(['errors', 'teacherBatches/add']),

    updateTeacherBatchStatus: state.data.getIn(['teacherBatches', 'updateStatus', 'teacherBatches']),
    updateTeacherBatchFailure: state.data.getIn(['errors', 'teacherBatches/update']),

    schoolClasses: state.data.getIn(['schoolClasses', 'data']),
    schoolClassesFetchStatus: state.data.getIn(['schoolClasses', 'fetchStatus', 'schoolClasses']),

    teacherClasses: state.data.getIn(['teacherClassrooms', 'data']),
    teacherClassesFetchStatus: state.data.getIn(['teacherClassrooms', 'fetchStatus', 'teacherClassrooms']),

    classNextSession: state.data.getIn(['classroomNextSessions', 'data']),
    classNextSessionFetchStatus: state.data.getIn(['classroomNextSessions', 'fetchStatus', 'classroomNextSessions']),
   
    classroomDetails: state.data.getIn(['classroomDetails', 'data']),
    classroomDetailsFetchStatus: state.data.getIn(['classroomDetails', 'fetchStatus', 'classroomDetails']),
    
    studentProfiles: state.data.getIn(['schoolStudentProfiles', 'data']),
    studentProfilesFetchStatus: state.data.getIn(['schoolStudentProfiles', 'fetchStatus', 'schoolStudentProfiles']),

    classroomCourses: state.data.getIn(['classroomCourses', 'data']),
    classroomCoursesFetchStatus: state.data.getIn(['classroomCourses', 'fetchStatus', 'classroomCourses']),

    teachersList : state.data.getIn(['schoolMentorProfiles','data']),
    teachersListFetchStatus: state.data.getIn(['schoolMentorProfiles', 'fetchStatus', 'schoolMentorProfiles']),

    schoolBatchCodes: state.data.getIn(['schoolBatchCodes', 'data']),

    fetchedClassrooms: state.data.getIn(['teacherAppClassrooms', 'data']),
    loggedInUserArray: filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser'),
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) || state.data.getIn(['userChildren', 'data']).size,
    loggedInUser: filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0) || Map({}),
})


export default connect(mapStateToProps)(withRouter(Homepage));