import QuestionArea from './QuestionArea'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

const mapStateToProps = (state) => {
    return {
        homeWorkMeta: state.data.getIn([
            'homeWorkMeta',
            'data'
        ]),
    }

}

export default connect(mapStateToProps)(withRouter(QuestionArea))
