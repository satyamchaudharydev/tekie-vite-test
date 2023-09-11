import HomeworkPage from './HomeworkPage'
import { connect } from 'react-redux'
import { filterKey } from '../../../../utils/data-utils'
import { Map } from 'immutable'

const mapStateToProps = (state) => ({
    classroomDetail: state.data.getIn([
        'classroomDetail',
        'data'
    ] ),
    classroomDetailStatus: state.data.getIn([
        'classroomDetail',
        'fetchStatus',
        'classroomDetail'
    ] ),
    prevSessions: filterKey(state.data.getIn([
        'classroomSession',
        'data'
    ]), 'homeworkPage'),
    reviewStatus: state.data.getIn([
        'studentReview',
        'fetchStatus',
        'classroomDetail'
    ]),
    homeworkStudentsData: state.data.getIn(['homeworkStudentsData', 'data']),
    homeworkStudentsDataFetchStatus: state.data.getIn(['homeworkStudentsData', 'fetchStatus']),
    selectHomeworkTitle:state.data.getIn(['getHomeworkTitle','data']),
    updatedbatchSession: state.data.getIn(['batchSessions', 'data']),
    sessionLink: state.data.getIn(['updateBatch', 'data']),
    loggedInUser: filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser') || Map({}),
    addClassRoomSessionErrorMessage: state.data.getIn(['errors','addClassroomSession/add', '0', 'error','errors','0','message']),
    isCreatingSession: state.data.getIn(['addClassroomSession', 'addStatus', 'addClassroomSession', 'loading']),
    hasCreatedSession: state.data.getIn(['addClassroomSession', 'addStatus', 'addClassroomSession', 'success']),
    addClassRoomSessionErrorMessage: state.data.getIn(['errors','addClassroomSession/add']),
    addClassroomSessionErrorList:state.data.getIn(['errors','addClassroomSession/add']),
    allStudentsQuizAnswers:state.data.getIn(["allStudentsQuizAnswers",'data']),
    allStudentsQuizAnswersFetchStatus:state.data.getIn(["allStudentsQuizAnswers",'fetchStatus',"allStudentsQuizAnswers"]),
})



export default connect(mapStateToProps)(HomeworkPage)
