import Revisit from './Revisit'
import { connect } from 'react-redux'
import { filterKey } from '../../utils/data-utils'

const mapStateToProps = (state) => ({
    loggedInUser: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').get(0) || Map({}),
    mentorMenteeSession: filterKey(state.data.getIn([
        'mentorMenteeSession',
        'data'
    ]), 'mentorMenteeSession/completed'),
    mentorMenteeSessionStatus: state.data.getIn([
        'mentorMenteeSession',
        'fetchStatus',
        'mentorMenteeSession/completed'
    ]),
    studentCurrentStatus: state.data.getIn(['getStudentCurrentStatus', 'data', 'status']),
    loggedInUserChat: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser'),
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
        state.data.getIn(['userChildren', 'data']).size,
})

export default connect(mapStateToProps)(Revisit)
