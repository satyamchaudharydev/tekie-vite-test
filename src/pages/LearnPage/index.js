import { connect } from "react-redux"
import { LearnVideo } from "./LearnVideo"


const mapStateToProps = (state) => {
    return {
        menteeSession: state.data.getIn([
            'menteeCourseSyllabus',
            'data'
        ]),
        videos: state.data.getIn([
            'videos',
            'data'
        ]),
        learnUserVideos:  state.data.getIn([
            'learnVideos',
            'data'
        ]),
        courses: state.data.getIn([
            'courses',
            'data'
        ]).toJS()
        

    }
}


export default connect(mapStateToProps)(LearnVideo)