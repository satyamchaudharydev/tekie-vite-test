import { List } from 'immutable'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import CodeShowcase from './CodeShowcase'
import { filterKey, filterKeyReverse } from '../../../utils/data-utils'

    const mapStateToProps = (state) => ({
        isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
            state.data.getIn(['userChildren', 'data']).size,
        hasMultipleChildren: state.data.getIn(['userChildren', 'data']).size > 1,
        userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
        userRole: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'role'], false),
        approvedCodes: filterKey(state.data.getIn([
            'approvedCodes',
            'data'
        ]), 'fetchApprovedCodes'),
        approvedCodesTrending: filterKey(state.data.getIn([
            'approvedCodes',
            'data'
        ]), 'fetchApprovedCodes/trending') || List([]),
        approvedCodesStatus: state.data.getIn([
            'approvedCodes',
            'fetchStatus',
            'fetchApprovedCodes'
        ]),
        approvedCodesStatusTrending: state.data.getIn([
            'approvedCodes',
            'fetchStatus',
            'fetchApprovedCodes/trending'
        ]),
        approvedCodesFailure: state.data.getIn([
            'approvedCodes',
            'fetchStatus',
            'fetchApprovedCodes',
            'failure'
        ]),
        userApprovedCodeTagMappingsCount: state.data.getIn([
            'userApprovedCodeTagMappingsCount',
            'data'
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
        ]),
        error: state.data.getIn(['errors', 'approvedCodes/fetch', 0, 'error', 'status']),
        studentCurrentStatus: state.data.getIn(['getStudentCurrentStatus', 'data', 'status']),
        loggedInUser: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser'),
    })

    export default connect(mapStateToProps)(withRouter(CodeShowcase))
