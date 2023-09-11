import { connect } from 'react-redux'
import SessionHomework from './SessionHomework'
import fetchMenteeCourseSyllabus from '../../queries/sessions/fetchMenteeCourseSyllabus'
import { filterKey } from '../../utils/data-utils'
import { Map } from 'immutable'
import fetchMentorFeedback from '../../queries/fetchMentorFeedback'

const getTopicId = (props) => {
    const { userId, match: { path, params: { topicId } } } = props
    return topicId
}

const mapStateToProps = (state, props) => ({
  ...fetchMentorFeedback().mapStateToProps(),
   mentorMenteeSession: filterKey(
       state.data.getIn([
           'mentorMenteeSession',
           'data'
       ]),
       `mentorMenteeSession/${getTopicId(props)}`
   ),
   loggedInUser: filterKey(state.data.getIn([
    'user',
    'data'
]), 'loggedinUser').get(0) || Map({}),
   mentorMenteeSessionUpdateStatus: state.data.getIn([
        'mentorMenteeSession',
        'updateStatus',
        `mentorMenteeSession/${getTopicId(props)}`
   ]),
    menteeCourseSyllabus: state.data.getIn(['menteeCourseSyllabus','data']),
    mentor: filterKey(
        state.data.getIn(['user', 'data']),
        'loggedInMentor'
    ).get(0) || Map({})
})

export default connect(mapStateToProps)(SessionHomework)
