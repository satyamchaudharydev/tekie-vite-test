import VideoDiscussion from './VideoDiscussion'
import { connect } from 'react-redux'

const mapStateToProps = (state) => ({
    userVideo: state.data.getIn([
        'userVideo',
        'data'
    ]),
    unlockBadge: state.data.getIn(['unlockBadge', 'data']),
})

export default connect(mapStateToProps)(VideoDiscussion)
