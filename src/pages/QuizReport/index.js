import { connect } from 'react-redux'
import QuizReport from './QuizReport'
import fetchQuizReport from '../../queries/fetchQuizReport'
import fetchTopics from '../../queries/sessions/fetchTopic'
import { filterKey } from '../../utils/data-utils'

const mapStateToProps = (state, props) => ({
  ...fetchQuizReport(
      props.match.path === '/sessions/quiz-report-latest/:topicId'
          ? props.location.state && props.location.state.quizReportTopicId
          : props.match.params.topicId
  ).mapStateToProps(state),
  ...fetchTopics().mapStateToProps(state),
  quizReportFetchErrors: state.data.getIn([
    'errors',
    'userQuizReport/fetch'
  ]),
  quizReportFetchStatus: state.data.getIn([
    'userQuizReport',
    'fetchStatus',
     `userQuizReport/${props.location.state && props.location.state.quizReportTopicId}`
  ]),
  userFirstAndLatestQuizReport: state.data.getIn([
    'userFirstAndLatestQuizReport',
    'data'
  ]),
  quizDumpStatus: state.data.getIn([
      'dumpQuiz',
      'fetchStatus',
      `dumpQuiz/${props.location.state && props.location.state.quizReportTopicId}`
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
  )
})

export default connect(mapStateToProps)(QuizReport)
