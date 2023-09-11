import FeedBackModal from "./FeedBackModal";

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
const mapStateToProps = (state, props) => ({
    sessionFeedbackTags: state.data.getIn(['sessionFeedbackTags','data']),
})

export default connect(mapStateToProps)(withRouter(FeedBackModal))