import Book from "./Book";
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
const mapStateToProps = (state, props) => ({
    eBookCourse: state.data.getIn(['eBookCourse','data']),
})

export default connect(mapStateToProps)(withRouter(Book))