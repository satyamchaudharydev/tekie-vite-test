import {connect} from 'react-redux'
import Video from './Video'
import {filterKey} from "../../utils/data-utils";
import {Map} from "immutable";
import fetchTopicJourney from "../../queries/fetchTopicJourney";
import config from '../../config';


const mapStateToProps = (state, props) => {
    const users = state.data.getIn(['user','data'])
    const menteeRole = users.find((userObj)=>userObj.get('role') === config.MENTEE)
    const selfLearnerRole = users.find((userObj) => userObj.get('role') === config.SELF_LEARNER)
    const menteeRoleOrLearnerProfileId = (menteeRole || selfLearnerRole) ? (menteeRole || selfLearnerRole).getIn(['studentProfile','id']) : '';

    const studentProfile = state.data.getIn(['studentProfile','data']).find((studentData)=>{
        return studentData.get("id") === menteeRoleOrLearnerProfileId;
    })
    return ({
        studentProfile: studentProfile||Map({}),
        loggedInUser: filterKey(state.data.getIn([
            'user',
            'data'
        ]), 'loggedinUser').get(0) || Map({}),
        dumpVideoStatus: state.data.getIn([
            'dumpVideo',
            'fetchStatus'
        ]) || Map({}),
        userVideo: filterKey(state.data.getIn(['userVideo', 'data']), props.match.params.topicId),
        learningObjectives: state.data.getIn(['learningObjective', 'data']),
        topics: state.data.getIn(['topic', 'data']),
        videopage: state.data.getIn(['videopage']) || Map({}),
        errors: state.data.getIn(['errors', 'videopage/fetch']),
        success: state.data.getIn(['success', 'videopage/fetch']),
        unlockBadge: filterKey(state.data.getIn(['unlockBadge', 'data']), `unlockBadge/video/${props.match.params.topicId}`),
        videoFetchStatus: state.data.getIn([
            'videopage',
            'fetchStatus',
            `${props.match.params.topicId}`
        ]),
        ...(fetchTopicJourney(props.match.params.topicId).mapStateToProps(state))
    })
}

export default connect(mapStateToProps)(Video)
