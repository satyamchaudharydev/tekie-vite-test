import { connect } from 'react-redux'
import {Map} from 'immutable'
import Overview from './Overview'
import { filterKey } from '../../../utils/data-utils'

const mapStateToProps = state => ({
    batchReports: 
      state.data.getIn(['batchReports', 'data'])
    ,
    userQuizReport: 
      state.data.getIn(['userFirstAndLatestQuizReports', 'data'])
    ,
    loggedInUser: filterKey(state.data.getIn([
      'user',
      'data'
    ]), 'loggedinUser').get(0) || Map({}),
  })

export default connect(mapStateToProps)(Overview)