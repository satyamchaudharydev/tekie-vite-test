import React from 'react'
import { connect } from 'react-redux'
import { Map } from 'immutable'
import { get } from 'lodash'
import { filterKey } from '../../utils/data-utils'
import fetchTopicJourney from '../../queries/fetchTopicJourney'
import fetchMentorFeedback from '../../queries/fetchMentorFeedback'
import fetchMenteeCourseSyllabus from '../../queries/sessions/fetchMenteeCourseSyllabus'

const getArgs = (state, props) => {
    return {
        userId: filterKey(state.data.getIn([
            'user',
            'data'
        ]), 'loggedinUser').get(0).getIn(['id']),
        user: filterKey(state.data.getIn([
            'user',
            'data'
        ]), 'loggedinUser').get(0),
        topicId: getQuizReportId(props) || props.match.params.topicId,
        phoneNumber: filterKey(state.data.getIn([
            'user',
            'data'
        ]), 'loggedinUser').getIn([0, 'parent', 'phone', 'number'])
    }
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

const getQuizReportId = (props) => {
    const quizReportTopicId = props.location.state && props.location.state.quizReportTopicId
    if (quizReportTopicId && ((props.match.path === '/sessions/:courseId/:topicId/codingAssignment') || (props.match.path === '/sessions/codingAssignment/:topicId'))) {
        return quizReportTopicId
    }
    return null
}

const mapStateToProps = (state, props) => ({
    userId: getArgs(state, props).userId,
    phoneNumber: getArgs(state, props).phoneNumber,
    userAssignment: state.data.getIn([
        'userAssignment',
        'data'
    ]),
    userAssignmentStatus: state.data.getIn([
        'userAssignment',
        'fetchStatus',
        `${getArgs(state, props).topicId}`
    ]),
    dumpCodingStatus: state.data.getIn([
        'dumpCoding',
        'fetchStatus',
        `dumpCoding/${getArgs(state, props).topicId}`
    ]),
    mentorMenteeSessionFetchStatus: state.data.getIn([
        'mentorMenteeSession',
        'fetchStatus'
    ]),
    mentorMenteeSessionUpdateStatus: state.data.getIn([
        'mentorMenteeSession',
        'updateStatus'
    ]),
    loggedInUser: filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0) || Map({}),
    ...fetchTopicJourney(props.match.params && props.match.params.topicId).mapStateToProps(),
    ...fetchMentorFeedback().mapStateToProps(),
    mentorMenteeSessionEndSession: getMentorMenteeSession(state, props),
    mentorMenteeSessionUpdateStatusEndSession: state.data.getIn([
        'mentorMenteeSession',
        'updateStatus',
        `mentorMenteeSession/${getQuizReportId(props) || props.match.params.topicId}`
    ]),
    menteeCourseSyllabus: state.data.getIn(['menteeCourseSyllabus', 'data']),
    mentor: filterKey(
        state.data.getIn(['user', 'data']),
        'loggedInMentor'
    ).get(0) || Map({}),
    mentorMenteeSession: state.data.getIn([
        'mentorMenteeSession',
        'data'
    ]),
    topic: state.data.getIn([
        'topic',
        'data'
    ]),
})

let CodingAssignmentWithSSR = () => <div />
const CodingAssignment = (props) => {
    const [renderKey, setRenderKey] = React.useState(0)
    React.useEffect(() => {
        import('./CodingAssignment.jsx')
            .then(CodingAssignmentModule => {
                CodingAssignmentWithSSR = CodingAssignmentModule.default
                setRenderKey(1)
            })
    }, [])
    return <CodingAssignmentWithSSR key={renderKey} {...props} />
}

export default connect(mapStateToProps)(CodingAssignment)
