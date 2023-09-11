import Achievements from './achievements'
import { connect } from 'react-redux'

const mapStateToProps = state => {
  return {
    badgeFetchLoading: state.data.getIn(['userBadge', 'fetchStatus', 'userBadge', 'loading']),
    badgeFetchSuccess: state.data.getIn(['userBadge', 'fetchStatus', 'userBadge', 'success']),
    badges: state.data.getIn(['userBadge', 'data', 0])
  }
}
export default connect(mapStateToProps)(Achievements)