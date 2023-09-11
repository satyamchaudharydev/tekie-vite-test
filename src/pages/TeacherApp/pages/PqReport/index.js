import PqReport from './PqReport';
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
   
    fetchPqReportDetail:state.data.getIn(['getPracticeQuestionReport','data']),
    fetchPqReportDetailStatus:state.data.getIn(['getPracticeQuestionReport','fetchStatus']),
    fetchQuizQuestionsPq:state.data.getIn(['fetchQuizQuestionsPq','data']),
    fetchQuizQuestionsIndividualPq:state.data.getIn(['fetchQuizQuestionsIndividualPq','data']),
    fetchTopicPqStatus:state.data.getIn(['topicDetailPq','fetchStatus']),
    fetchTopicPq:state.data.getIn(['topicDetailPq','data']),
    fetchIndividualStudentReport:state.data.getIn(['fetchPqStudentReport','data']),
    fetchIndividualStudentReportStatus:state.data.getIn(['fetchPqStudentReport','fetchStatus']),
    fetchTopicComponentRule: state.data.getIn(["fetchTopicComponentRule", "data"]),
    fetchTopicComponentRuleFetchStatus: state.data.getIn(['fetchTopicComponentRule', 'fetchStatus', 'fetchTopicComponentRule'])


})

export default connect(mapStateToProps)(withRouter(PqReport));