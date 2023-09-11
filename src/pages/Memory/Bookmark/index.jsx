import React from 'react'
import Bookmark from './bookmark'
import {LEARNING_VIDEOS, CHATS, PRACTICE_QUESTIONS} from '../../../utils/constants'
import {getPropertyFromId, getDataById, filterKey} from '../../../utils/data-utils'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {Map} from 'immutable'


const getBookmarksData = ({userLearningObjective,
  topics,
  learningObjectives,
  userVideo}) => {
  const data = {
    [LEARNING_VIDEOS]: {
      title: LEARNING_VIDEOS,
      body: []
    },
    [CHATS]: {
      title: CHATS,
      body: []
    },
    [PRACTICE_QUESTIONS]: {
      title: PRACTICE_QUESTIONS,
      body: []
    }
  }
  // Assigning [] here since when the data response is empty the state management does not return the key
  // and receiving null
  const userLearningObjectiveJS = userLearningObjective
    ? userLearningObjective.toJS()
    : []
  const topicsJS = topics ? topics.toJS() : []
  const learningObjectivesJS = learningObjectives
    ? learningObjectives.toJS()
    : []
  const userVideoJS = userVideo ? userVideo.toJS() : []
  userVideoJS
    .forEach(userVideo => {
      if (userVideo.isBookmarked) {
        data[LEARNING_VIDEOS].body.push({
          type: LEARNING_VIDEOS,
          ...getDataById(topicsJS, userVideo.topic.id),
          itemId: userVideo.id
        })
      }
    })
  data[LEARNING_VIDEOS].body.sort((a, b) => a.order > b.order ? 1 : a.order < b.order ? -1 : 0)
  userLearningObjectiveJS
    .forEach(userLO => {
      const {
        isChatBookmarked,
        isPracticeQuestionBookmarked
      } = userLO
      // handling here if learningobjective mapping is absent in case
      const id = userLO.learningObjective && userLO.learningObjective.id
      if (!id) {
        return
      }
      const loData = getDataById(learningObjectivesJS, id)
      const topicOrder = getPropertyFromId('order', topicsJS, loData.topic.id)
      if (isChatBookmarked) {
        data[CHATS].body.push({
          type: CHATS,
          ...loData,
          topicOrder,
          itemId: userLO.id
        })
      }
      if (isPracticeQuestionBookmarked) {
        data[PRACTICE_QUESTIONS].body.push({
          type: PRACTICE_QUESTIONS,
          ...loData,
          topicOrder,
          itemId: userLO.id
        })
      }
    })
  data[CHATS].body
    .sort((a, b) => {
      if (a.topicOrder === b.topicOrder) {
        return a.order > b.order ? 1 : a.order < b.order ? -1 : 0
      } else {
        return a.topicOrder > b.topicOrder ? 1 : -1
      }
    })
  data[PRACTICE_QUESTIONS].body
    .sort((a, b) => {
      if (a.topicOrder === b.topicOrder) {
        return a.order > b.order ? 1 : a.order < b.order ? -1 : 0
      } else {
        return a.topicOrder > b.topicOrder ? 1 : -1
      }
    })
  return data
}

const BookmarkRoot = (props) => {
  return (
    <Bookmark
      data = {getBookmarksData(props)}
      {...props}
      isLoading={props.videosLoading || props.loLoading}
    />
  )
}

const mapStateToProps = (state) => ({
  user: filterKey(state.data.getIn(['user', 'data'], Map({})),'loggedinUser').get(0),
  userVideo : state.data.getIn(['userVideo','data']),
  topics : state.data.getIn(['topic','data']),
  learningObjectives: state.data.getIn(['learningObjective', 'data']),
  userLearningObjective: state.data.getIn(['userLearningObjective', 'data']),
  videosLoading: state.data.getIn(['userVideosBookmark','fetchStatus','userVideosBookmark','loading']),
  loLoading: state.data.getIn(['userLearningObjectivesBookmark','fetchStatus','userLearningObjectivesBookmark','loading']),
  videosFetchSuccess: state.data.getIn(['userVideosBookmark','fetchStatus','userVideosBookmark','success']),
  loFetchSuccess: state.data.getIn(['userLearningObjectivesBookmark','fetchStatus','userLearningObjectivesBookmark','success'])
})

export default connect(mapStateToProps)(withRouter(BookmarkRoot))

