import SwitchAccount from './SwitchAccount'
import { connect } from 'react-redux'
import { Map } from 'immutable'
import { filterKey, pickOne } from '../../utils/data-utils'

const mapStateToProps = (state) => ({
  userChildren: state.data.getIn(['userChildren', 'data']),
  userParent: state.data.getIn(['userParent', 'data', 0], Map({})),
  userId: filterKey(state.data.getIn([
    'user',
    'data'
]), 'loggedinUser').getIn([0, 'id'], ''),
  loggedInUser: pickOne(
    filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0], Map({})),
    filterKey(state.data.getIn(['user', 'data']), 'validateOTP').getIn([0], Map({}))
  ),
})

export default connect(mapStateToProps)(SwitchAccount)
