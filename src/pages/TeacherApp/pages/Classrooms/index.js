import { connect } from "react-redux";
import { withRouter } from "react-router";
import { filterKey } from "../../../../utils/data-utils";
import Classrooms from "./Classrooms";

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
})



export default connect(mapStateToProps)(withRouter(Classrooms));
