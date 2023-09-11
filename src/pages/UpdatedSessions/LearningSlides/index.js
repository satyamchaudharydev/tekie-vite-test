import { Map } from 'immutable'
import {connect} from 'react-redux'
import { get } from 'lodash'
import { filterKey } from '../../../utils/data-utils'
import fetchChatPractice from '../../../queries/fetchChatPractice'
import LearningSlides from './LearningSlides'
import fetchMenteeCourseSyllabus from '../../../queries/sessions/fetchMenteeCourseSyllabus'
import { getMapById } from '../../../utils/immutable'

const getUserLearningObjective = (state, loId) => {
  const userlearningObjective = filterKey(
    state.getIn(['userLearningObjective', 'data']),
    loId
  )
  if (userlearningObjective.size === 0) return Map({})
  return userlearningObjective.get(0)
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

const filterLearningObjective = (state, learningObjectiveId) => {
    const learningObjectiveById = getMapById(
        state.data.getIn(['learningObjective', 'data']),
        learningObjectiveId
    )
    if (learningObjectiveById) return learningObjectiveById
    return Map({})
}

const mapStateToProps = (state, props) => {
  const loId = props.match.params.loId
  const topicId = props.match.params.topicId
  const courseId = props.match.params.courseId
  const userDetails = filterKey(state.data.getIn([
    'user',
    'data'
  ]), 'loggedinUser').get(0) || Map({});
  const userId = userDetails && userDetails.getIn(["id"]);
  console.log('New ', userId)
  return ({
    userId,
    courseId,
    loId,
    topicId,
    learningSlideData: state.data.getIn(['learningSlide', 'data']),
    learningSlideFetchStatus: state.data.getIn(['learningSlide', 'fetchStatus', 'learningSlide']),
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
    hasFetched: state.data.getIn([
      'chatPractice',
      'fetchStatus',
      loId,
      'success'
    ]),
    topics: state.data.getIn(['topic', 'data']),
    course: state.data.getIn(['course', 'data']),
    ...fetchChatPractice(userId, loId, false, true, courseId, topicId).mapStateToProps(state),
    userLearningObjective: getUserLearningObjective(
      state.data,
      loId
    ),
    mentor: filterKey(
      state.data.getIn(['user', 'data']),
      'loggedInMentor'
    ).get(0) || Map({}),
    loggedInUser: filterKey(state.data.getIn([
          'user',
          'data'
    ]), 'loggedinUser').get(0) || Map({}),
    menteeCourseSyllabus: state.data.getIn(['menteeCourseSyllabus','data']),
     learningObjectiveData: filterLearningObjective(
            state,
            loId
    ),
    learningObjective: filterKey(state.data.getIn(['learningObjective', 'data']), `blockVideo/${props.match.params.topicId}`),
  })
}

export default connect(mapStateToProps)(LearningSlides)