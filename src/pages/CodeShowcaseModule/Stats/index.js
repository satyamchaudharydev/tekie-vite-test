import { connect } from 'react-redux'
import Stats from './Stats'
import { filterKey } from '../../../utils/data-utils'

const mapStateToProps = (state) => ({
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
        state.data.getIn(['userChildren', 'data']).size,
    userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
    userName: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'name'], false),
    studentProfile:  state.data.getIn([
        'studentProfile',
        'data'
    ]),
    approvedCodes: state.data.getIn([
        'approvedCodes',
        'data'
    ]),
    approvedCodesStatus: state.data.getIn([
        'approvedCodes',
        'fetchStatus',
        'fetchApprovedCodes'
    ]),
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

export default connect(mapStateToProps)(Stats)
