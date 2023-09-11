import { connect } from "react-redux";
import EvaluationModal from "./EvaluationModal";


const mapStateToProps=(state,props)=>({
userAssignments:state.data.getIn(['userAssignments','data'])
})

export default connect(mapStateToProps)(EvaluationModal)
