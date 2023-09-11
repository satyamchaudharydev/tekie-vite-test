import { Map } from 'immutable'
import JourneyReport from './JourneyReport'
import { connect } from 'react-redux'
import { filterKey } from 'duck-state/lib/State'
import fetchUserProfile from '../../queries/fetchUserProfile'


const mapStateToProps = (state) => ({
  user: filterKey(state.data.getIn([
    'user',
    'data'
  ]), 'loggedinUser').get(0) || Map({}),
  ...fetchUserProfile().mapStateToProps(state)
})
export default connect(mapStateToProps)(JourneyReport)
