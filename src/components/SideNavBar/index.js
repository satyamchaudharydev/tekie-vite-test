import { connect } from 'react-redux'
import fetchTopicJourney from '../../queries/fetchTopicJourney'
import SideNavBar from './SideNavBar'
import { filterKey } from '../../utils/data-utils'
import fetchTopics from '../../queries/sessions/fetchTopic'
import config from "../../config";
import {Map} from "immutable";

const mapStateToProps = (state, { computedMatch }) => {
    const users = state.data.getIn(['user','data'])
    const menteeRole = users.find((userObj)=>userObj.get('role') === config.MENTEE)
    const selfLearnerRole = users.find((userObj)=>userObj.get('role') === config.SELF_LEARNER)
    const studentProfile = state.data.getIn(['studentProfile','data']).find((studentData)=>{
        return studentData.get('id') === (menteeRole || selfLearnerRole).getIn(['studentProfile','id'])
    })
    return {
        profile: menteeRole || selfLearnerRole,
        accountProfileSuccess: state.data.getIn(['user','fetchStatus','accountProfile','success']),
        ...(fetchTopicJourney(computedMatch.params.topicId).mapStateToProps(state)),
        userRole: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'role'], false),
        mentorMenteeSession: state.data.getIn([
            'mentorMenteeSession',
            'data'
        ]),
        mentorMenteeSessionUpdateStatus: state.data.getIn([
            'mentorMenteeSession',
            'updateStatus'
        ]),
        ...fetchTopics().mapStateToProps(state),
        unlockBadge: state.data.getIn(['unlockBadge', 'data']),
        loggedInUser: filterKey(state.data.getIn([
            'user',
            'data'
        ]), 'loggedinUser').get(0) || Map({}),
        topic: state.data.getIn([
            'topic',
            'data'
        ]),
        studentProfile: studentProfile||Map({}),
        unlockBadgeStatus: state.data.getIn([
            'unlockBadge',
            'fetchStatus'
        ])
    }}

export default connect(mapStateToProps)(SideNavBar)
