import { connect } from 'react-redux'
import QuizReport from './QuizReport'
import fetchQuizReport from '../../../queries/fetchQuizReport'
import fetchTopics from '../../../queries/sessions/fetchTopic'
import { filterKey } from '../../../utils/data-utils'

const mapStateToProps = (state, props) => ({
  ...fetchQuizReport(props.match.path === '/sessions/quiz-report-latest/:courseId/:topicId'
          ? props.location.state && props.location.state.quizReportTopicId
          : props.match.params.topicId, props.match.params.courseId).mapStateToProps(state),
  ...fetchTopics().mapStateToProps(state),
  quizReportFetchErrors: state.data.getIn([
    'errors',
    'userQuizReport/fetch'
  ]),
  topic: state.data.getIn([
      'topic',
      'data'
  ]),
  userId:  filterKey(state.data.getIn([
    'user',
    'data'
  ]), 'loggedinUser').get(0).getIn(['id']),
  quizReportFetchStatus: state.data.getIn([
    'userQuizReport',
    'fetchStatus',
     `userQuizReport/${(props.location.state && props.location.state.quizReportTopicId) || props.match.params.topicId}`
  ]),
  userFirstAndLatestQuizReport: state.data.getIn([
    'userFirstAndLatestQuizReport',
    'data'
  ]),
  mentorMenteeSession: state.data.getIn([
    'mentorMenteeSession',
    'data'
  ]),
  quizDumpStatus: state.data.getIn([
      'dumpQuiz',
      'fetchStatus',
      `dumpQuiz/${(props.location.state && props.location.state.quizReportTopicId) || props.match.params.topicId}`
  ]),
  codingDumpStatus: state.data.getIn([
      'dumpCoding',
      'fetchStatus',
      `dumpCoding/${(props.location.state && props.location.state.quizReportTopicId) || props.match.params.topicId}`
  ]),
  userTopicJourneyStatus: state.data.getIn([
      'topicJourney',
      'fetchStatus',
      `topicJourney/${props.match.params.topicId}`
  ]),
  studentProfile: filterKey(
    state.data.getIn([
        'studentProfile',
        'data'
    ]), 'sessionHomepage'
  ),
  userAssignmentStatus: state.data.getIn([
    'userAssignment',
    'fetchStatus',
  ]),
  userAssignment: state.data.getIn([
    'userAssignment',
    'data'
  ]),
})

export default connect(mapStateToProps)(QuizReport)
