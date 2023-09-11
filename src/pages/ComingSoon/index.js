import ComingSoon from './ComingSoon'
import { connect } from 'react-redux'
import { filterKey } from '../../utils/data-utils'

const mapStateToProps = (state) => ({
  loggedInUser: filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0) || Map({})
})

export default connect(mapStateToProps)(ComingSoon)
