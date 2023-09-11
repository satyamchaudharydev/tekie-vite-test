import NetPromoterScore from './NetPromoterScore'
import { connect } from 'react-redux'
import addNetPromoterScore from '../../../../queries/addNetPromoterScore'

const mapStateToProps = (state, { userId, menteeId }) => ({
  ...addNetPromoterScore(userId).mapStateToProps(state),
  hasNPSFetched: state.data.getIn(['sessionHomepage', 'fetchStatus', 'sessionHomepage', 'success']),
  hasNPSAdded: state.data.getIn(['nps', 'addStatus', 'addNps', 'success']),
  isNPSLoading: state.data.getIn(['nps', 'addStatus', 'addNps', 'loading']),
  netPromoterScore: state.data.getIn(['netPromoterScore', 'data']),
 
})

export default connect(mapStateToProps)(NetPromoterScore)
