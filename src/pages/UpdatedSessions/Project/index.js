import {connect} from 'react-redux'
import Project from './Project'
import { Map } from "immutable";
import { get } from 'lodash'
import { filterKey } from "../../../utils/data-utils";
import fetchMenteeCourseSyllabus from '../../../queries/sessions/fetchMenteeCourseSyllabus'
import fetchTopicJourney from "../../../queries/fetchTopicJourney";

const getMentorMenteeSession = (state, props) => {
    const loggedInUser = filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0) || Map({})
    const loggedInUserId = (loggedInUser && loggedInUser.toJS)
        ? get(loggedInUser.toJS(), 'id')
        : ''
    const topicId = get(props, 'match.params.topicId')
    let mentorMenteeSession = filterKey(
        state.data.getIn([
            'mentorMenteeSession',
            'data'
        ]),
        `mentorMenteeSession/${topicId}`
    )
    if (!(mentorMenteeSession && mentorMenteeSession.toJS && mentorMenteeSession.toJS().length)) {
        mentorMenteeSession = filterKey(
            state.data.getIn([
                'mentorMenteeSession',
                'data'
            ]),
            `mentorMenteeSession/${loggedInUserId}/${topicId}`
        )
    }

    return mentorMenteeSession
}

const mapStateToProps = (state, props) => {
    const userId =  filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0).getIn(['id'])
    const loggedInUser =  filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser')
    const studentProfile = state.data.getIn([
        'studentProfile',
        'data'
    ])
    const userBlockBasedProjects =  state.data.getIn([
        'userBlockBasedProjects',
        'data'
    ])
    const loId = props.match.params.loId
    return ({
        menteeCourseSyllabus: state.data.getIn(['menteeCourseSyllabus','data']),
        userId,
        loggedInUser,
        studentProfile,
        loId,
        userBlockBasedProjects,
        mentor: filterKey(
            state.data.getIn(['user', 'data']),
            'loggedInMentor'
        ).get(0) || Map({}),
        mentorMenteeSessionFetchStatus: state.data.getIn([
            'mentorMenteeSession',
            'fetchStatus'
        ]),
        mentorMenteeSessionUpdateStatus: state.data.getIn([
            'mentorMenteeSession',
            'updateStatus'
        ]),
        dumpBlockBasedPractice: state.data.getIn([
            'dumpBlockBasedPractice',
            'fetchStatus'
        ]) || Map({}),
        dumpBlockBasedProject: state.data.getIn([
            'dumpBlockBasedProject',
            'fetchStatus'
        ]) || Map({}),
        mentorMenteeSessionEndSession: getMentorMenteeSession(state, props),
        mentorMenteeSessionUpdateStatusEndSession: state.data.getIn([
            'mentorMenteeSession',
            'updateStatus',
            `mentorMenteeSession/${props.match.params && props.match.params.topicId}`
        ]),
        mentorMenteeSession: state.data.getIn([
            'mentorMenteeSession',
            'data'
        ]),
        topics: state.data.getIn(['topic', 'data']),
        course: state.data.getIn(['course', 'data']),
        unlockBadge: filterKey(state.data.getIn(['unlockBadge', 'data']), `unlockBadge/blockBasedProject/${props.match.params.topicId}`),
        ...(fetchTopicJourney(props.match.params.topicId).mapStateToProps(state))
    })
}

export default connect(mapStateToProps)(Project)
