import { connect } from 'react-redux'
import { get } from 'lodash'
import { Map } from 'immutable'
import GlobalOverlay from './GlobalOverlay'
import {filterKey} from '../../utils/data-utils'

const getUserAndTopicId = (state, props) => {
     const loggedInUser = filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0) || Map({})
    const loggedInUserId = loggedInUser
        ? get(loggedInUser.toJS(), 'id')
        : ''
    const topicId = typeof localStorage === 'undefined' ? '' : localStorage.getItem('currTopicId')
    return {
        loggedInUserId,
        topicId
    }
}

const mapStateToProps = (state, props) => ({
    mentor: filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedInMentor').get(0) || Map({}),
    mentorMenteeSession: state.data.getIn([
        'mentorMenteeSession',
        'data'
    ]),
    studentProfile: filterKey(
        state.data.getIn([
            'studentProfile',
            'data'
        ]), 'sessionHomepage'
    ),
    batchSession: state.data.getIn([
        'batchSession',
        'data'
    ]),
    menteeCourseSyllabus: state.data.getIn([
        'menteeCourseSyllabus',
        'data'
    ]),
    mentorMenteeSessionWithMenteeTopicFilter: filterKey(
        state.data.getIn([
            'mentorMenteeSession',
            'data'
        ]),
        `mentorMenteeSession/${getUserAndTopicId(state, props).loggedInUserId}/${getUserAndTopicId(state, props).topicId}`
    ),
    mentorMenteeSessionAddedForCurrTopic: filterKey(
        state.data.getIn([
            'mentorMenteeSession',
            'data'
        ]),
        `mentorMenteeSession/${getUserAndTopicId(state, props).topicId}`
    ),
})

export default connect(mapStateToProps)(GlobalOverlay)
