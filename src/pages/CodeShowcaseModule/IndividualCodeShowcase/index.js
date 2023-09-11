import {List, Map} from 'immutable'
import { connect } from 'react-redux'
import IndividualCodeShowcase from './IndividualCodeShowcase'
import { withRouter } from 'react-router-dom'
import { filterKey } from '../../../utils/data-utils'

const mapStateToProps = (state, props) => ({
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
        state.data.getIn(['userChildren', 'data']).size,
    hasMultipleChildren: state.data.getIn(['userChildren', 'data']).size > 1,
    userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
    userRole: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'role'], false),
    approvedCodes: (state.data.getIn([
        'approvedCodes',
        'data'
    ]) || List([])).filter(code => code.get('id') === props.match.params.id),
    approvedCodesStatus: state.data.getIn([
        'approvedCodes',
        'fetchStatus',
        'fetchApprovedCodes'
    ]) || Map({}),
    approvedCodeReactionLogs: state.data.getIn([
        'approvedCodeReactionLogs',
        'data'
    ]),
    totalApprovedCodes: state.data.getIn([
        'totalApprovedCodes',
        'data'
    ]),
    trendingUserApprovedCode: state.data.getIn([
        'trendingUserApprovedCode',
        'data'
    ])
})

export default connect(mapStateToProps)(withRouter(IndividualCodeShowcase))
