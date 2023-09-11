import PQReport from './PqReportTeacherTraining'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import fetchPQReport from '../../queries/fetchPQReport'
import fetchTopicJourney from '../../queries/fetchTopicJourney'
import { get } from 'lodash'
import { filterKey } from '../../utils/data-utils'
import withNoScrollBar from '../../components/withNoScrollBar'
import fetchMenteeCourseSyllabus from '../../queries/sessions/fetchMenteeCourseSyllabus'
import fetchChatPractice from '../../queries/fetchChatPractice'
import getCourseId from '../../utils/getCourseId'

const getNextComponent = (state, learningObjectiveId) => {
  const filterUserLO = filterKey(
      state.data.getIn(['userLearningObjective', 'data']),
      learningObjectiveId
  )
  if (filterUserLO.size !== 0 && filterUserLO.getIn([0, 'nextComponent'])) { return filterUserLO.getIn([0, 'nextComponent']) }
  return Map({})
}

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
  const userId =  props.match.params.userId
    ? props.match.params.userId
    : filterKey(state.data.getIn([
        'user',
        'data'
      ]), 'loggedinUser').get(0).getIn(['id'])
  const loId = props.match.params.loId
  const topicId = props.match.params.topicId
  const courseId = getCourseId(topicId)
  return {
    userId,
    loId,
    courseId,
    topicId,
    menteeCourseSyllabus: state.data.getIn(['menteeCourseSyllabus','data']),
    ...fetchPQReport(userId, loId, courseId).mapStateToProps(state),
    userLearningObjective: state.data.getIn([
        'userLearningObjective',
        'data'
    ]),
    loggedInUser:filterKey(state.data.getIn([
      'user',
      'data'
    ]), 'loggedinUser').get(0) || Map({}),
    topics: state.data.getIn(['topic', 'data']),
    course: state.data.getIn(['course', 'data']),
    mentorMenteeSessionFetchStatus: state.data.getIn([
      'mentorMenteeSession',
      'fetchStatus'
    ]),
    mentorMenteeSessionUpdateStatus: state.data.getIn([
      'mentorMenteeSession',
      'updateStatus'
    ]),
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
    unlockBadge: filterKey(state.data.getIn(['unlockBadge', 'data']), `unlockBadge/practiceQuestion/${props.match.params.topicId}`),
    pQDumpStatus: state.data.getIn([
      'dumppq',
      'fetchStatus',
      `dumppq/${loId}`
    ], Map({})),
    nextComponent: getNextComponent(
      state,
      loId
    ),
    ...fetchChatPractice(userId, loId, false, true, courseId, topicId).mapStateToProps(state),
    ...(fetchTopicJourney(topicId, courseId).mapStateToProps(state)),
    learningObjectives: state.data.getIn(['learningObjective', 'data']),
    user: filterKey(state.data.getIn(['user', 'data']), `userPracticeQuestionReport/${loId}`),
  }
}

export default withNoScrollBar(connect(mapStateToProps)(PQReport))
