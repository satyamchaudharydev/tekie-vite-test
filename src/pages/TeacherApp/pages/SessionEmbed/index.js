import { connect } from 'react-redux'
import { Map } from 'immutable'
import { filterKey } from '../../../../utils/data-utils'
import SessionEmbed from './SessionEmbed'

const mapStateToProps = (state) => ({
    loggedInUser: filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0) || Map({}),
    fetchedCourses: state.data.getIn(['courses', 'data']),
    isFetchingCourses: state.data.getIn(['courses', 'fetchStatus', 'teacherAppCourses', 'loading']),
    fetchedCourseTopics: filterKey(state.data.getIn(['topic', 'data']), 'courseTopics'),
    fetchedTopics: state.data.getIn(['topic', 'data']),
    fetchedClassrooms: state.data.getIn(['teacherAppClassrooms', 'data']),
    fetchedClassroomSessions: state.data.getIn(['classroomSessions', 'data']),
    isFetchingClassroomSessions: state.data.getIn(['classroomSessions', 'fetchStatus', 'classroomSessions', 'loading']),
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
    updateAdhocSessionQueryStatus: state.data.getIn(['updateAdhocSession', 'updateStatus', 'updateAdhocSession']),
    studentProfile: state.data.getIn(['studentProfile', 'data']),
    batchSessionDataFetchStatus: state.data.getIn(['batchSessionData', 'fetchStatus', 'batchSessionData']),
})


export default connect(mapStateToProps)(SessionEmbed)