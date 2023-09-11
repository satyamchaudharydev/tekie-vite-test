import { connect } from 'react-redux'
import IqaReportShowcase from './IqaReportShowcase'
import { withRouter } from 'react-router-dom'
import { filterKey } from '../../utils/data-utils'

const mapStateToProps = (state, props) => ({
  isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
    state.data.getIn(['userChildren', 'data']).size,
  hasMultipleChildren: state.data.getIn(['userChildren', 'data']).size > 1,
  userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
  userRole: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'role'], false),
  userCourse: state.data.getIn([
    'userCourse',
    'data'
  ]),
  isUserCourseLoading: state.data.getIn([
    'userCourse',
    'fetchStatus',
    'userCourse',
    'loading'
  ]),
  userCourseeNotFound: state.data.getIn([
    'userCourse',
    'fetchStatus',
    'userCourse',
    'failure'
  ]),
})

export default connect(mapStateToProps)(withRouter(IqaReportShowcase))
