import { connect } from 'react-redux'
import EventCertificateShowcase from './EventCertificateShowcase'
import { withRouter } from 'react-router-dom'
import { filterKey } from '../../utils/data-utils'

const mapStateToProps = (state, props) => ({
  isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
    state.data.getIn(['userChildren', 'data']).size,
  hasMultipleChildren: state.data.getIn(['userChildren', 'data']).size > 1,
  userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
  userRole: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'role'], false),
  userCourseCertificate: state.data.getIn([
    'userCourseCertificate',
    'data'
  ]),
  isUserCourseCertificateLoading: state.data.getIn([
    'userCourseCertificate',
    'fetchStatus',
    'userCourseCertificate',
    'loading'
  ]),
  userCourseCertificateNotFound: state.data.getIn([
    'userCourseCertificate',
    'fetchStatus',
    'userCourseCertificate',
    'failure'
  ]),
  eventCertificate: state.data.getIn([
    'eventCertificate',
    'data'
  ]),
  isEventCertificateLoading: state.data.getIn([
    'eventCertificate',
    'fetchStatus',
    'eventCertificate',
    'loading'
  ]),
  eventCertificateNotFound: state.data.getIn([
    'eventCertificate',
    'fetchStatus',
    'eventCertificate',
    'failure'
  ]),
})

export default connect(mapStateToProps)(withRouter(EventCertificateShowcase))
