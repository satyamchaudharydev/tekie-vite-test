import { connect } from 'react-redux'
import { Map } from 'immutable'
import Quiz from './Quiz'
import { getDataById, filterKey } from '../../utils/data-utils'
import fetchQuizReport from "../../queries/fetchQuizReport";

const getUserQuizs = (userQuiz, key) => {
    const filteredUserQuiz = filterKey(userQuiz, key)
    if (filteredUserQuiz.size !== 0) return filteredUserQuiz.get(0)
    return Map({})
}

const sortByLoOrderAndQuestionOrder = (question1, question2) => {
    const question1LoOrder = question1.getIn(['question', 'learningObjective', 'order'])
    const question2LoOrder = question2.getIn(['question', 'learningObjective', 'order'])
    if (question1LoOrder === question2LoOrder) {
        return question1.getIn(['question', 'order']) - question2.getIn(['question', 'order'])
    }
    return question1LoOrder - question2LoOrder
}

const getQuizReportStatus = (state, topicId) => {
    const quizReportStatus = state.data.getIn([
        'userQuizReport',
        'fetchStatus',
        `userQuizReport/${topicId}`
    ])
    try {
        return quizReportStatus ? quizReportStatus.toJS() : {}
    } catch (e) {
        return quizReportStatus || {}
    }
}

const mapStateToProps = (state, props) => {
    const topicId = props.match.params.topicId
    const courseId = props.match.params.courseId
    const userQuizs = getUserQuizs(
        state.data.getIn(['userQuiz', 'data']),
        `userQuiz/${topicId}`
    ).get('quiz')
    let quizSortedByOrder = Map({})
    if (userQuizs) {
        quizSortedByOrder = userQuizs.sort(sortByLoOrderAndQuestionOrder)
    }
    return ({
        quizDumpStatus: state.data.getIn([
            'dumpQuiz',
            'fetchStatus',
            `dumpQuiz/${topicId}`,
            'loading'
        ]),
        userId:  filterKey(state.data.getIn([
            'user',
            'data'
        ]), 'loggedinUser').get(0).getIn(['id']),
        userQuizs: quizSortedByOrder,
        quizStatus: getUserQuizs(
            state.data.getIn(['userQuiz', 'data']),
            `userQuiz/${topicId}`
        ).get('quizStatus'),
        currentTopic: getDataById(
            state.data.getIn(['topic', 'data']).toJS(),
            topicId
        ),
        nextTopic: getUserQuizs(
            state.data.getIn(['userQuiz', 'data']),
            `userQuiz/${topicId}`
        ).getIn(['nextComponent', 'topic']),
        topicId,
        courseId,
        hasFetched: state.data.getIn([
            'userQuiz',
            'fetchStatus',
            `userQuiz/${topicId}`,
            'success'
        ]),
        isGuestMode: state.data.getIn(['guestMode', 'isGuestMode']),
        unlockBadge: state.data.getIn(['unlockBadge', 'data']),
        currentTopicComponent: state.data.getIn(['currentTopicComponent', 'data']),
        currentTopicComponentDetail:
            state.data.getIn(['currentTopicComponentDetail', 'data']) || Map({}),
        mentorMenteeSession: state.data.getIn([
            'mentorMenteeSession',
            'data'
        ]),
        mentorMenteeSessionFetchStatus: state.data.getIn([
            'mentorMenteeSession',
            'fetchStatus'
        ]),
        mentorMenteeSessionUpdateStatus: state.data.getIn([
            'mentorMenteeSession',
            'updateStatus'
        ]),
        ...fetchQuizReport(props.match.params.topicId).mapStateToProps(state),
        userQuizAnswers: state.data.getIn([
            'userQuizAnswers',
            'data'
        ]),
        userQuizReportStatus: getQuizReportStatus(state, topicId),
        userTopicJourney: filterKey(state.data.getIn(['userTopicJourney', 'data', ]), `topicJourney/${topicId}`),
        badgeFetchStatus: state.data.getIn(['unlockBadge', 'fetchStatus', `unlockBadge/quiz/${topicId}`]),
        userQuizAnswersStatus: state.data.getIn([
            'userQuizAnswers',
            'fetchStatus'
        ])
    })
}

export default connect(mapStateToProps)(Quiz)
