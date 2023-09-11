import {connect} from 'react-redux'
import Practice from './Practice'
import { Map } from "immutable";
import { get } from 'lodash'
import {filterKey, getBuddies} from "../../../utils/data-utils";
import fetchMenteeCourseSyllabus from '../../../queries/sessions/fetchMenteeCourseSyllabus'
import fetchTopicJourney from "../../../queries/fetchTopicJourney";
import { withRouter } from 'react-router';
import { TOPIC_COMPONENTS } from '../../../constants/topicComponentConstants';

const getQuizReportId = (props) => {
    const quizReportTopicId = props.location.state && props.location.state.quizReportTopicId
    if (quizReportTopicId && (props.match.path === '/sessions/:courseId/:topicId/codingAssignment')) {
        return quizReportTopicId
    }
    return null
}

const getMentorMenteeSession = (state, props) => {
    const loggedInUser = filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0) || Map({})
    const loggedInUserId = (loggedInUser && loggedInUser.toJS)
        ? get(loggedInUser.toJS(), 'id')
        : ''
    const topicId = getQuizReportId(props) || get(props, 'match.params.topicId')
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
    const userDetails = filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0) || Map({});
    const userId = userDetails && userDetails.getIn(["id"]);
    const loggedInUser =  filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser')
    const studentProfile = state.data.getIn([
        'studentProfile',
        'data'
    ])
    const user = filterKey(
        window && window.store.getState().data.getIn(["user", "data"]),
        "loggedinUser"
    ).get(0) || new Map({});
    const userBuddies = getBuddies(get(user.toJS(), 'buddyDetails', []))


    const isHomework = ((props.match.path = '/homework/:courseId/:topicId/:projectId/practice') || (props.match.path = '/sessions/:courseId/:topicId/:projectId/practice')) &&
    !props.match.url.includes('/sessions/practice/')

    let userBlockBasedPractices =  filterKey(state.data.getIn([
        'userBlockBasedPractices',
        'data'
    ]), props.match.params.topicId + '/' + (isHomework ? TOPIC_COMPONENTS.homeworkPractice : TOPIC_COMPONENTS.blockBasedPractice) + '/' + userId)
    const allBlockBasedPractice = userBlockBasedPractices;
    if (userBlockBasedPractices.size > 0 && props.match.params.projectId) {
        userBlockBasedPractices = userBlockBasedPractices.filter((item) => {
            return item.getIn(['blockBasedPractice', 'id']) === props.match.params.projectId
        })
    }

    const loId = props.match.params.loId
    return ({
        menteeCourseSyllabus: state.data.getIn(['menteeCourseSyllabus','data']),
        userId,
        loggedInUser,
        studentProfile,
        loId,
        userBlockBasedPractices,
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
        unlockBadge: filterKey(state.data.getIn(['unlockBadge', 'data']), `unlockBadge/blockBasedPractice/${props.match.params.topicId}`),
        learningObjectives: state.data.getIn(['learningObjective', 'data']),
        course: state.data.getIn(['course', 'data']),
        ...(fetchTopicJourney(props.match.params.topicId).mapStateToProps(state)),
        allBlockBasedPractice,
        userBuddies,
    })
}

export default connect(mapStateToProps)(withRouter(Practice))
