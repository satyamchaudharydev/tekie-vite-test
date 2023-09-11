import ClassroomDetails from './ClassroomDetails';
import { withRouter } from 'react-router';
import { filterKey } from '../../../../../utils/data-utils';
import { connect } from 'react-redux'

const mapStateToProps = (state, props) => {
    const batchId = props.match.params.batchId
    return {
    batchDetails:filterKey(state.data.getIn(['batchDetails','data']), `batchDetails/${batchId}`),
    batchDetailsFetchStatus:state.data.getIn(['batchDetails','fetchStatus', `batchDetails/${batchId}`]),
    classworkSummaryReport:state.data.getIn(['getPracticeQuestionReport','data']),
    classworkSummaryReportFetchStatus:state.data.getIn(['getPracticeQuestionReport','fetchStatus','getPracticeQuestionReport']),
    homeworkSummaryReport:state.data.getIn(['getClassroomReport','data']),
    homeworkSummaryReportFetchStatus:state.data.getIn(['getClassroomReport','fetchStatus','getClassroomReport']),
    blockBasedSummaryReport:state.data.getIn(['getClassroomReportForBlockBasedPractice','data']),
    blockBasedSummaryReportFetchStatus:state.data.getIn(['getClassroomReportForBlockBasedPractice','fetchStatus','getClassroomReportForBlockBasedPractice']),
    teacherBatchesData: state.data.getIn(['teacherBatches', 'data']),
    teacherBatchesFetchStatus: state.data.getIn(['teacherBatches', 'fetchStatus', 'teacherBatches']),
    teacherBatchesFetchFailure: state.data.getIn(['errors', 'teacherBatches/fetch']),

    classNextSession: filterKey(state.data.getIn(['classroomNextSessions', 'data']), `classroomNextSessions/${batchId}`),
    classNextSessionFetchStatus: state.data.getIn(['classroomNextSessions', 'fetchStatus', `classroomNextSessions/${batchId}`]),

    classroomDetails: state.data.getIn(['classroomDetails', 'data']),
    classroomDetailsFetchStatus: state.data.getIn(['classroomDetails', 'fetchStatus', 'classroomDetails']),

    fetchedClassrooms: state.data.getIn(['teacherAppClassrooms', 'data']),
    loggedInUserArray: filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser'),
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) || state.data.getIn(['userChildren', 'data']).size,
    loggedInUser: filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0) || Map({}),
    evaluationData: state.data.getIn(['evaluationData', 'data']),
    evaluationDataFetchStatus: state.data.getIn(['evaluationData', 'fetchStatus', 'evaluationData']),
}
}


export default connect(mapStateToProps)(withRouter(ClassroomDetails));

