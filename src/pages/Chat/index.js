import { connect } from 'react-redux'
import Chat from './Chat'
import { filterKey } from '../../utils/data-utils'
import fetchChatPractice from '../../queries/fetchChatPractice'
import withNoScrollBar from '../../components/withNoScrollBar'

const mapStateToProps = (state, props) => {
  const userId =  filterKey(state.data.getIn([
    'user',
    'data'
  ]), 'loggedinUser').get(0).getIn(['id'])
  const loId = props.match.params.loId
  return {
    userId,
    loId,
    ...fetchChatPractice(userId, loId).mapStateToProps(state),
    dumpChatStatus: state.data.getIn([
      'dumpChat',
      'fetchStatus'
    ]),
    loggedInUser: filterKey(state.data.getIn([
      'user',
      'data'
  ]), 'loggedinUser').get(0) || Map({}),
  }
}

export default withNoScrollBar(connect(mapStateToProps)(Chat))
