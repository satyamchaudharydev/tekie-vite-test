import FeedbackForm from './FeedbackForm';
import { withRouter } from 'react-router';
import { connect } from 'react-redux'

const mapStateToProps = (state) => ({
    batchSessionData: state.data.getIn([
        'batchSessionData',
        'data',
    ]),
    updateBatchSessionStatus: state.data.getIn([
        'mentorSessions',
        'updateStatus',
        'updateBatchSession',
    ]),
})


export default connect(mapStateToProps)(withRouter(FeedbackForm));