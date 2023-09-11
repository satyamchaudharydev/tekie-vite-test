import RecordingPage from './RecordingPage';
import { withRouter } from 'react-router';
import { connect } from 'react-redux'

const mapStateToProps = (state) => ({
    classnameDetails:state.data.getIn(['classroomDetail' , 'data']),
    recordingBatches: state.data.getIn(['recordingBatches', 'data']),
    recordingDataFetchStatus: state.data.getIn(['recordingBatches', 'fetchStatus', 'recordingBatches']),
})




export default connect(mapStateToProps)(RecordingPage);