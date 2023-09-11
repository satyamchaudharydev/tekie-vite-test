import { connect } from "react-redux";
import SubmitOverlayMenu from './SubmitOverlayMenu'
import { filterKey } from "../../../../../utils/data-utils";
import { HOMEWORK_COMPONENTS_CONFIG, TOPIC_COMPONENTS } from "../../../../../constants/topicComponentConstants";
import { get } from "lodash";
import getMe from "../../../../../utils/getMe";

const mapStateToProps = (state,props) => {  
    const {topicId} = props;   
    const userId = get(getMe(),'id')

    return {
        userFirstAndLatestQuizReports: state.data.getIn([
            'userFirstAndLatestQuizReport',
            'data'
        ]),
        userQuizs: filterKey(state.data.getIn([
                            'userQuiz', 'data'
                            ]),`userQuiz/${topicId}`),

         homeWorkMeta: state.data.getIn([
            'homeWorkMeta',
            'data'
        ]),
    
        
        userAssignment: state.data.getIn([
        'userAssignment',
        'data'
        ]),
        userQuizAnswers: state.data.getIn([
            'userQuizAnswers',
            'data'
        ]),
       
        
    }
}

export default connect(mapStateToProps)(SubmitOverlayMenu)
