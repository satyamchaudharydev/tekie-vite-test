import Practice from './Practice'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { filterKey } from '../../../utils/data-utils'
import { getMapById } from '../../../utils/immutable'
import { Map } from 'immutable'
import fetchTopicJourney from '../../../queries/fetchTopicJourney'

const getUserLearningObjective = (state, loId) => {
    const userlearningObjective = filterKey(
        state.getIn(['userLearningObjective', 'data']),
        loId
    )
    if (userlearningObjective.size === 0) return Map({})
    return userlearningObjective.get(0)
}

const filterLearningObjective = (state, learningObjectiveId) => {
    const learningObjectiveById = getMapById(
        state.data.getIn(['learningObjective', 'data']),
        learningObjectiveId
    )
    if (learningObjectiveById) return learningObjectiveById
    return Map({})
}

const filterPracticeQuestions = (state, learningObjectiveId) => {
    const filterPracticeQuestions = filterKey(
        state.data.getIn(['userLearningObjective', 'data']),
        learningObjectiveId
    ).filter(
        item => item.getIn(['learningObjective', 'id']) === learningObjectiveId
    )
    if (filterPracticeQuestions.size !== 0) return filterPracticeQuestions.get(0)
    return Map({})
}

const getStatus = (state, learningObjectiveId) => {
    const filterUserLO = filterKey(
        state.data.getIn(['userLearningObjective', 'data']),
        learningObjectiveId
    )
    if (
        filterUserLO.size !== 0 &&
        filterUserLO.getIn([0, 'practiceQuestionStatus']) &&
        filterUserLO.getIn([0, 'chatStatus'])
    ) {
        return {
            chatStatus: filterUserLO.getIn([0, 'chatStatus']),
            practiceQuestionStatus: filterUserLO.getIn([0, 'practiceQuestionStatus'])
        }
    }
    return {
        chatStatus: '',
        practiceQuestionStatus: ''
    }
}

const getNextComponent = (state, learningObjectiveId) => {
    const filterUserLO = filterKey(
        state.data.getIn(['userLearningObjective', 'data']),
        learningObjectiveId
    )
    if (filterUserLO.size !== 0 && filterUserLO.getIn([0, 'nextComponent'])) { return filterUserLO.getIn([0, 'nextComponent']) }
    return Map({})
}


const filterTopic = (state, topicId) => {
    const topicData = getMapById(state.data.getIn(['topic', 'data']), topicId)
    if (topicData) return topicData
    return Map({})
}


const mapStateToProps = (state,props) => {
    const loId = props.match.params.loId
    const topicId = props.match.params.topicId
    const courseId = props.match.params.courseId
    return ({
        learningObjectiveId:loId,
        courseId,
        practiceQuestionDumpStatus: state.data.getIn([
            'dumppq',
            'fetchStatus',
            `dumppq/${loId}`,
            'loading'
        ]),
        userId: filterKey(state.data.getIn([
            'user',
            'data'
        ]), 'loggedinUser').get(0).getIn(['id']),
        userLearningObjective: getUserLearningObjective(
            state.data,
            loId
        ),
        userPracticeQuestions: filterPracticeQuestions(
            state,
            loId
        ),
        ...(fetchTopicJourney(topicId).mapStateToProps(state)),
        topicData: filterTopic(state, topicId),
        topics: state.data.getIn(['topic', 'data']),
        course: state.data.getIn(['course', 'data']),
        topicId,
        hasFetched: state.data.getIn([
            'chatPractice',
            'fetchStatus',
            loId,
            'success'
        ]),
        pQDumpStatus: state.data.getIn([
            'dumppq',
            'fetchStatus',
            `dumppq/${loId}`
        ], Map({})),
        learningObjectiveData: filterLearningObjective(
            state,
            loId
        ),
        ...getStatus(state, loId),
        nextComponent: getNextComponent(
            state,
            loId
        ),
        isDumpChatLoading: state.data.getIn([
            'dumpChat',
            'fetchStatus',
            loId,
            'loading'
        ]),
        learningObjectives: state.data.getIn(['learningObjective', 'data']),
        loggedInUser: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser'),
    })
}

export default connect(mapStateToProps)(withRouter(Practice))
