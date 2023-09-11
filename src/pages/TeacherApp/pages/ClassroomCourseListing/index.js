import ClassroomCourseListing from './ClassroomCourseListing';
import { withRouter } from 'react-router';
import { filterKey } from '../../../../utils/data-utils';
import { connect } from 'react-redux'
import get from 'lodash/get';

const mapStateToProps = (state, props) => {
    const currentBatchId = get(props, 'match.params.batchId')
    return {
    loggedInUserArray: filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser'),
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) || state.data.getIn(['userChildren', 'data']).size,
    loggedInUser: filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0) || Map({}),
    batches: state.data.getIn(['teacherBatches', 'data']),
    batchesFetchStatus: state.data.getIn(['teacherBatches', 'fetchStatus', 'teacherBatches']),
    batchDetails: state.data.getIn(['batchCoursePackageDetail', 'data']),
    batchDetailsFetchStatus: state.data.getIn(['batchCoursePackageDetail', 'fetchStatus']),
    batchSessions: filterKey(state.data.getIn(['batchSession', 'data']), `batchSession/${currentBatchId}`),
    batchSessionsFetchStatus: state.data.getIn(['batchSession', 'fetchStatus', `batchSession/${currentBatchId}`]),
    updateBatchSessionQueryStatus:state.data.getIn(['updateBatchSession','updateStatus','updateBatchSession']),
    updateAdhocSessionQueryStatus: state.data.getIn(['updateAdhocSession', 'updateStatus', 'updateAdhocSession']),
    fetchLiveAttendance:state.data.getIn(["fetchLiveAttendance","data"]),
    fetchLiveAttendanceStatus:state.data.getIn(["fetchLiveAttendance","fetchStatus",'fetchLiveAttendance']),
    evaluationData: state.data.getIn(['evaluationData', 'data']),
    evaluationDataFetchStatus: state.data.getIn(['evaluationData', 'fetchStatus', 'evaluationData']),
    fetchBatchSessionOtpData:state.data.getIn(["fetchBatchSessionOtp","data"]),
    fetchBatchSessionOtpStatus:state.data.getIn(["fetchBatchSessionOtp","fetchStatus",'fetchBatchSessionOtp']),
    mentorChildFetchStatus:state.data.getIn(["mentorChild", "fetchStatus", "mentorChild"]),
    mentorChildData:state.data.getIn(["mentorChild", "data"]),
}
}

export default connect(mapStateToProps)(withRouter(ClassroomCourseListing));