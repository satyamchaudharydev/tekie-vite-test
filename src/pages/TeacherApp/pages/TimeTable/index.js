import { connect } from 'react-redux'
import { filterKey } from '../../../../utils/data-utils'
import TimeTable from './TimeTable'

const mapStateToProps = (state, props) => {

    return {
        loggedInUser: filterKey(state.data.getIn([
            'user',
            'data'
        ]), 'loggedinUser').get(0) || Map({}),
        // fetchedCourses: filterKey(state.data.getIn(['courses', 'data']), 'teacherAppCourses')
        fetchedCourses: state.data.getIn(['courses', 'data']),
        isFetchingCourses: state.data.getIn(['courses', 'fetchStatus', 'teacherAppCourses', 'loading']),
        fetchedCourseTopics: filterKey(state.data.getIn(['topic', 'data']), 'courseTopics'),
        fetchedClassrooms: state.data.getIn(['teacherAppClassrooms', 'data']),
        fetchedClassroomSessions: state.data.getIn(['classroomSessions', 'data']),
        isFetchingClassroomSessions: state.data.getIn(['classroomSessions', 'fetchStatus', 'classroomSessions', 'loading']),
        hasFetchedClassroomSessions: state.data.getIn(['classroomSessions', 'fetchStatus', 'classroomSessions', 'success']),
        isCreatingSession:state.data.getIn(['addClassroomSession','addStatus','addClassroomSession','loading']),
        hasCreatedSession:state.data.getIn(['addClassroomSession','addStatus','addClassroomSession','success']),
        hasCreateSessionFailed:state.data.getIn(['addClassroomSession','addStatus','addClassroomSession','failure']),
        fetchClassRoomSessionErrorMessage: state.data.getIn(['errors','addClassroomSession/fetch', '0', 'error','errors','0','message']),
        addClassRoomSessionErrorMessage: state.data.getIn(['errors','addClassroomSession/add']),
        addClassroomSessionErrorList:state.data.getIn(['errors','addClassroomSession/add']),
        isSessionDeleted:state.data.getIn(['deleteClassroomSession','deleteStatus','deleteClassroomSession','success']),
        isDeletingSession:state.data.getIn(['deleteClassroomSession','deleteStatus','deleteClassroomSession','loading']),
        hasDeleteSessionFailed:state.data.getIn(['deleteClassroomSession','deleteStatus','deleteClassroomSession','failure']),
        updateBatchSessionQueryStatus:state.data.getIn(['updateBatchSession','updateStatus','updateBatchSession']),
        updateAdhocSessionQueryStatus:state.data.getIn(['updateAdhocSession','updateStatus','updateAdhocSession']),
        fetchLiveAttendance:state.data.getIn(["fetchLiveAttendance","data"]),
        fetchLiveAttendanceStatus:state.data.getIn(["fetchLiveAttendance","fetchStatus",'fetchLiveAttendance']),
        schoolTiming:state.data.getIn(['calendarTimeRange','data'])
}
}


export default connect(mapStateToProps)(TimeTable)