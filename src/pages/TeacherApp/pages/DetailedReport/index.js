import DetailedReport from './DetailedReport';
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
    fetchHomeworkReview:state.data.getIn(['getClassroomReport','data']),
    fetchHomeworkReviewStatus:state.data.getIn(['getClassroomReport','fetchStatus']),
    fetchClassworkReview:state.data.getIn(['getClassroomReportForBlockBasedPractice','data']),
    fetchClassworkReviewStatus:state.data.getIn(['getClassroomReportForBlockBasedPractice','fetchStatus']),
    fetchBlocklyReports:state.data.getIn(['blocklyReports','data']),
    fetchBlocklyReportsStatus:state.data.getIn(['blocklyReports','fetchStatus']),
    classworkSummaryReport:state.data.getIn(['getPracticeQuestionReport','data']),
    classworkSummaryReportFetchStatus:state.data.getIn(['getPracticeQuestionReport','fetchStatus','getPracticeQuestionReport']),
    batchSessionsData: state.data.getIn(['batchSessionData', 'data']),
    batchSessionsFetchStatus: state.data.getIn(['batchSessionData', 'fetchStatus', 'batchSessionsForReports']),
    fetchHomeworkReviewTopicDetail:state.data.getIn(['homeworkReviewTopicDetail','data']),
    fetchHomeworkReviewTopicDetailStatus:state.data.getIn(['homeworkReviewTopicDetail','fetchStatus']),
    fetchCodingQuestion:state.data.getIn(["codingQuestionData","data"]),
    fetchCodingQuestionStatus:state.data.getIn(["codingQuestionData","fetchStatus"]),
})

export default connect(mapStateToProps)(withRouter(DetailedReport));