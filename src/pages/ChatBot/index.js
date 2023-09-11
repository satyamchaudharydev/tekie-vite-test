import { connect } from 'react-redux'
import Chat from './Chat'
import { filterKey } from '../../utils/data-utils'
import fetchChatPractice from '../../queries/fetchChatPractice'
import withNoScrollBar from '../../components/withNoScrollBar'
import fetchTopicJourney from '../../queries/fetchTopicJourney'

const mapStateToProps = (state, props) => {
  const userId =  filterKey(state.data.getIn([
    'user',
    'data'
  ]), 'loggedinUser').get(0).getIn(['id'])
  const loId = props.match.params.loId
  return {
    userId,
    loId,
    ...fetchTopicJourney(props.match.params && props.match.params.topicId).mapStateToProps(),
    ...fetchChatPractice(userId, loId).mapStateToProps(state),
    dumpChatStatus: state.data.getIn([
      'dumpChat',
      'fetchStatus'
    ]),
    course: state.data.getIn(['course', 'data']),
    learningObjectives: state.data.getIn(['learningObjective', 'data']),
    topics: state.data.getIn(['topic', 'data']),
    loggedInUser: filterKey(state.data.getIn([
      'user',
      'data'
  ]), 'loggedinUser').get(0) || Map({}),
  }
}

export default withNoScrollBar(connect(mapStateToProps)(Chat))
