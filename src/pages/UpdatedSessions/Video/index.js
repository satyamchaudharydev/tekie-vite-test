import {connect} from 'react-redux'
import Video from './Video'
import {filterKey} from "../../../utils/data-utils";
import {Map} from "immutable";
import fetchTopicJourney from "../../../queries/fetchTopicJourney";
import config from '../../../config';
import { get } from 'lodash';
// import { useParams } from 'react-router';

const mapStateToProps = (state, props ) => {
    
    const courses = state.data.getIn([
        'courses',
        'data'
    ]).toJS()
    const courseId = get(props,'match.params.courseId');
    const thisCourse = courses.find((courseObj)=> courseObj.id === courseId)
    const users = state.data.getIn(['user','data'])
    const menteeRole = users.find((userObj)=>userObj.get('role') === config.MENTEE)
    const selfLearnerRole = users.find((userObj) => userObj.get('role') === config.SELF_LEARNER)
    const menteeRoleOrLearnerProfileId = (menteeRole || selfLearnerRole) ? (menteeRole || selfLearnerRole).getIn(['studentProfile','id']) : '';

    const studentProfile = state.data.getIn(['studentProfile','data']).find((studentData)=>{
        return studentData.get("id") === menteeRoleOrLearnerProfileId;
    })
    const topicId = "cl3gz6sgs008z0u24au882fhk"
    const userVideo = state.data.getIn(['userVideo', 'data'])
    console.log({userVideo})
    return ({
        ...(fetchTopicJourney(props.match.params.topicId, false, props.match.params.courseId).mapStateToProps(state)),
        studentProfile: studentProfile||Map({}),
        loggedInUser: filterKey(state.data.getIn([
            'user',
            'data'
        ]), 'loggedinUser').get(0) || Map({}),
        courseDefaultLoComponentRule: get(thisCourse, 'defaultLoComponentRule', []),
        dumpVideoStatus: state.data.getIn([
            'dumpVideo',
            'fetchStatus'
        ]) || Map({}),
        userVideo: filterKey(state.data.getIn(['userVideo', 'data']), `userVideo/${topicId}`),
        learningObjectives: filterKey(state.data.getIn(['learningObjective', 'data']), `userVideo/${topicId}`),
        topics: filterKey(state.data.getIn(['topic', 'data']), `userVideo/${topicId}`),
        course: state.data.getIn(['course', 'data']),
        videopage: state.data.getIn(['videopage']) || Map({}),
        errors: state.data.getIn(['errors', 'videopage/fetch']),
        success: state.data.getIn(['success', 'videopage/fetch']),
        unlockBadge: filterKey(state.data.getIn(['unlockBadge', 'data']), `unlockBadge/video/${topicId}`),
        videoFetchStatus: state.data.getIn([
            'videopage',
            'fetchStatus',
            `blockVideo/${props.match.params.topicId}`
        ]),
    })
}

export default connect(mapStateToProps)(Video)
