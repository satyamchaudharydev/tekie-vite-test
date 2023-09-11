import { connect } from "react-redux";
import { withRouter } from "react-router";
import { filterKey } from "../../../../utils/data-utils";
import QuestionPaperGenerator from "./QuestionPaperGenerator";

const mapStateToProps=(state)=>({
    loggedInUser: filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0) || Map({}),
})



export default connect(mapStateToProps)(withRouter(QuestionPaperGenerator));
