import { connect } from "react-redux";
import { withRouter } from "react-router";
import fetchMenteeCourseSyllabus from "../../../../queries/sessions/fetchMenteeCourseSyllabus";
import { filterKey } from "../../../../utils/data-utils";
import TrainingResourcesAssessment from "./TrainingResourcesAssessment";

const mapStateToProps=(state)=>({
    loggedInUser: filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0) || Map({}),
    teacherBatchesData: state.data.getIn(['teacherBatches', 'data']),
    teacherBatchesFetchStatus: state.data.getIn(['teacherBatches', 'fetchStatus', 'teacherBatches']),
    teacherBatchesFetchFailure: state.data.getIn(['errors', 'teacherBatches/fetch']),
    classroomDetails: state.data.getIn(['classroomDetails', 'data']),
    classroomDetailsFetchStatus: state.data.getIn(['classroomDetails', 'fetchStatus', 'classroomDetails']),
    mentorChild: state.data.getIn(['mentorChild', 'data']),
    menteeCourseSyllabus: state.data.getIn(['menteeCourseSyllabus','data']),
    coursePackages: state.data.getIn(['coursePackages', 'data']),
    course: state.data.getIn([
        'course',
        'data'
    ]),
    mentorChildFetchStatus: state.data.getIn(['mentorChild', 'fetchStatus', 'mentorChild']),
    mentorMenteeSession: filterKey(state.data.getIn([
        'menteeCourseHomework',
        'data'
    ]), 'mentorMenteeSession/completed'),
    allMentorMenteeSession: state.data.getIn([
        'mentorMenteeSession',
        'data'
    ]),
    mentorMenteeSessionFetchStatus: state.data.getIn([
        'mentorMenteeSession',
        'fetchStatus',
        'mentorMenteeSession/completed'
    ]),
    topics: state.data.getIn([
        'topic',
        'data'
    ]),
})



export default connect(mapStateToProps)(withRouter(TrainingResourcesAssessment));