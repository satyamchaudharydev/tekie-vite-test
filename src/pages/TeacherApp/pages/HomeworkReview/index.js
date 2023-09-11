import HomeworkReview from './HomeworkReview';
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
    fetchHomeworkReview:state.data.getIn(['homeworkReview','data']),
    fetchHomeworkReviewStatus:state.data.getIn(['homeworkReview','fetchStatus']),
    fetchQuizQuestions:state.data.getIn(['fetchQuizQuestions1','data']),
    fetchHomeworkReviewTopicDetail:state.data.getIn(['homeworkReviewTopicDetail','data']),
    fetchHomeworkReviewTopicDetailStatus:state.data.getIn(['homeworkReviewTopicDetail','fetchStatus']),
    fetchHomeworkReviewCurrentTopicDetail:state.data.getIn(['fetchHomeworkReviewCurrentTopicDetail','data']),
    fetchCodingQuestion:state.data.getIn(["codingQuestionData","data"]),
    fetchBlocklyQuestion:state.data.getIn(["fetchBlocklyQuestion","data"]),
    fetchTopicComponentRule:state.data.getIn(["fetchTopicComponentRule","data"]),
    fetchLiveAttendance:state.data.getIn(["fetchLiveAttendance","data"]),
    fetchLiveAttendanceStatus:state.data.getIn(["fetchLiveAttendance","fetchStatus"]),
})

export default connect(mapStateToProps)(withRouter(HomeworkReview));