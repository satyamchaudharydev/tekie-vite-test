import { Map } from 'immutable'
import { connect } from 'react-redux'
import { filterKey } from '../../utils/data-utils'
import QRCodePreview from './QRCodePreview'


const mapStateToProps = state => ({
  loggedInUser: filterKey(state.data.getIn([
    'user',
    'data'
  ]), 'loggedinUser').get(0) || Map({}),
})

export default connect(mapStateToProps)(QRCodePreview)
