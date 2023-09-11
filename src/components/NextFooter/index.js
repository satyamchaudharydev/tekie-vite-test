import { get } from "lodash";
import { connect } from "react-redux";
import NextFooter from "./NextFooter";
import { Map } from "immutable";
import { filterKey } from "../../utils/data-utils";
import fetchMenteeCourseSyllabus from "../../queries/sessions/fetchMenteeCourseSyllabus";
const getQuizReportId = (props) => {
    // const quizReportTopicId = props.location.state && props.location.state.quizReportTopicId
    // if (quizReportTopicId && (props.match.path === '/sessions/:courseId/:topicId/codingAssignment')) {
    //     return dquizReportTopicId
    // }
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

const mapStateToProps =  (state,props) => {
    const courses = state.data.getIn([
            'courses',
            'data'
    ]).toJS()
    const courseId = get(props,'match.params.courseId');
    const thisCourse = courses.find((courseObj)=> courseObj.id === courseId)
    
    const userId =  filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0).getIn(['id'])
    const loggedInUser =  filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser')
    const topics = state.data.getIn([
        'topic',
        'data'
    ]).toJS()
    const topicId = get(props, 'match.params.topicId')
    const topic = topics.find((topicObj) => topicObj.id === topicId)
    return {
        ...props,
        loggedInUser,
        userId,
        sessionFeedbackTags: state.data.getIn(['sessionFeedbackTags','data']),
        menteeCourseSyllabus: state.data.getIn(['menteeCourseSyllabus','data']),
        courseDefaultLoComponentRule: get(thisCourse, 'defaultLoComponentRule', []),
        topics,
        topic,
        mentor: filterKey(
            state.data.getIn(['user', 'data']),
            'loggedInMentor'
        ).get(0) || Map({}),
        
        mentorMenteeSessionEndSession: getMentorMenteeSession(state, props),
        mentorMenteeSession: getMentorMenteeSession(state, props),
        userFirstAndLatestQuizReport: state.data.getIn([
            'userFirstAndLatestQuizReport',
            'data'
        ]),
        mentorMenteeSessionUpdateStatus: state.data.getIn([
            'mentorMenteeSession',
            'updateStatus'
        ]),

    }
}
export default connect(mapStateToProps)(NextFooter)
