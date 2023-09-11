import NavBar from './NavBar'
import { connect } from 'react-redux'
import { Map } from 'immutable'
import fetchUserCredit from '../../queries/fetchUserCredit'
import { filterKey } from '../../utils/data-utils'

const mapStateToProps = (state) => {
  const user = filterKey(state.data.getIn([
    'user',
    'data'
  ]), 'loggedinUser').get(0) || Map({})
  return {
    user: user,
    ...fetchUserCredit(user.get('id')).mapStateToProps(),
    hasMultipleChildren: 
      state.data.getIn(['userChildren', 'data']).size > 1,
    hasCodePlayground: false
  }
}


export default connect(mapStateToProps)(NavBar)
