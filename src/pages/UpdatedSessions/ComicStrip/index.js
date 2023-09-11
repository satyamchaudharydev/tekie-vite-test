import {connect} from 'react-redux'
import ComicStrip from './ComicStrip'
import { Map } from 'immutable'
import { get } from 'lodash'
import {filterKey} from "../../../utils/data-utils";
import fetchTopicJourney from "../../../queries/fetchTopicJourney";
import fetchChatPractice from '../../../queries/fetchChatPractice'
import fetchMenteeCourseSyllabus from '../../../queries/sessions/fetchMenteeCourseSyllabus';

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
    const loId = props.match.params.loId
    const courseId = props.match.params.courseId
    const topicId = props.match.params.topicId
    return ({
        userId,
        loId,
        courseId,
        topicId,
        menteeCourseSyllabus: state.data.getIn(['menteeCourseSyllabus','data']),
        fetchChatStatus: state.data.getIn([
            'chatPractice',
            'fetchStatus',
            `${loId}`
        ]),
        loggedInUser: filterKey(state.data.getIn([
          'user',
          'data'
      ]), 'loggedinUser').get(0) || Map({}),
        dumpComicStrip: state.data.getIn([
            'dumpComicStrip',
            'fetchStatus'
        ]) || Map({}),
        topics: state.data.getIn(['topic', 'data']),
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
        unlockBadge: filterKey(state.data.getIn(['unlockBadge', 'data']), `unlockBadge/comicStrip/${props.match.params.topicId}`),
        course: state.data.getIn(['course', 'data']),
        ...fetchChatPractice(userId, loId, false, true, courseId, topicId).mapStateToProps(state),
        ...(fetchTopicJourney(props.match.params.topicId, courseId).mapStateToProps(state)),
        learningObjectives: state.data.getIn(['learningObjective', 'data']),
        userLearningObjective: filterKey(state.data.getIn([
          'userLearningObjective',
          'data'
      ]), `${loId}`),
    })
}

export default connect(mapStateToProps)(ComicStrip)
