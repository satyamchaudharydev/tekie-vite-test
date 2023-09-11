import StudentLevelReport from './StudentLevelReport';
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
    batchSessionsData: state.data.getIn(['batchSessionData', 'data']),
    batchSessionsFetchStatus: state.data.getIn(['batchSessionData', 'fetchStatus', 'batchSessionsForReports']),
    getPracticeQuestionReport: state.data.getIn(['getPracticeQuestionReport', 'data']),
    getPracticeQuestionReportFetchStatus: state.data.getIn(['getPracticeQuestionReport', 'fetchStatus', 'getPracticeQuestionReport']),
    evaluationData: state.data.getIn(['evaluationData', 'data']),
    evaluationDataFetchStatus: state.data.getIn(['evaluationData', 'fetchStatus', 'evaluationData']),
})

export default connect(mapStateToProps)(withRouter(StudentLevelReport));