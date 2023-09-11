import Report from './Report';
import { withRouter } from 'react-router';
import { connect } from 'react-redux'
import {Map} from 'immutable'
import { filterKey } from '../../../../utils/data-utils'

const mapStateToProps = (state) => ({
    batchSessionData: state.data.getIn([
        'batchSessionData',
        'data',
    ]),
    batchReports: 
    state.data.getIn(['batchReports', 'data'])
  ,
    loggedInUser: filterKey(state.data.getIn([
        'user',
        'data'
      ]), 'loggedinUser').get(0) || Map({}),
})


export default connect(mapStateToProps)(withRouter(Report));