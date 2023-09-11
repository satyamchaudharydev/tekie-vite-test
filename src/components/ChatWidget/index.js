import ChatWidget from './ChatWidget'
import { connect } from 'react-redux'
import { filterKey } from '../../utils/data-utils'

const mapStateToProps = (state) => ({
  isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
    state.data.getIn(['userChildren', 'data']).size,
  userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
  loggedInUser: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser'),
})

export default connect(mapStateToProps)(ChatWidget)
