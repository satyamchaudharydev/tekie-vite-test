import React from 'react'
import Memory from './rewatch'
import {connect} from 'react-redux'
import {Map} from 'immutable'
import {withRouter} from 'react-router-dom'
import {nestTopicsInChapter,getPropertyFromId, filterKey, nestChildrenIntoParent} from '../../../utils/data-utils'

const userVideoData = (chapters, topics, userVideos) => {
    const data = []
    if (chapters && topics) {
      const chaptersJS = chapters.toJS()
      const topicsJS = topics.toJS()
      const nestedTopics = nestTopicsInChapter(topicsJS).map((item, index) => {
        const order = getPropertyFromId('order', chaptersJS, item.id) || index
        return { ...item, order }
      })
      nestedTopics.sort((a, b) => (a.order > b.order ? 1 : a.order < b.order ? -1 : 0)).forEach(section => {
        const sectionHeader = chaptersJS.find(
          chapterObject => chapterObject.id === section.id
        )
        const sectionBody = section.topics.sort((a, b) => (a.order > b.order ? 1 : a.order < b.order ? -1 : 0)).reduce((finalResult, topic) => {
          const topicUserVideo = topic.userVideos
          const userVideoId = topicUserVideo && topicUserVideo[0].id
          if (userVideoId) {
            const userVideo = userVideos.find(userVideo => userVideo.get('id') === userVideoId)
            finalResult.push({
              ...topic,
              status: userVideo && userVideo.get('status')
            })
          }
          return finalResult
        }, [])
        if (sectionBody.length) {
          data.push({
            id: sectionHeader.id,
            mainTitle: sectionHeader.title,
            body: sectionBody
          })
        }
      })
    }
    return data
  }

const userChatData = (learningObjectives, topics, userLearningObjectives) => {
  const data = []
  if (learningObjectives && topics) {
    const learningObjectivesJS = learningObjectives.toJS()
    const topicsJS = topics.toJS()

    const nestedLO = nestChildrenIntoParent(
      learningObjectivesJS,
      'learningObjectives',
      'topic'
    ).map((item, index) => {
      const order = getPropertyFromId('order', topicsJS, item.id) || index
      return { ...item, order }
    })
    nestedLO.sort((a, b) => (a.order > b.order ? 1 : b.order > a.order ? -1 : 0)).forEach(section => {
      const sectionHeader = topicsJS.find(
        topicObject => topicObject.id === section.id
      )
      const sectionBody = section.learningObjectives.sort((a, b) => (a.order > b.order ? 1 : b.order > a.order ? -1 : 0))
        .reduce((finalResult, learningObjective) => {
          const loMappedUserLO = learningObjective.userLearningObjectives
          const userLOId = loMappedUserLO && loMappedUserLO[0].id
          if (userLOId) {
            const userLearningObjective = userLearningObjectives.find(userVideo => userVideo.get('id') === userLOId)
            finalResult.push({
              ...learningObjective,
              chatStatus: userLearningObjective && userLearningObjective.get('chatStatus')
            })
          }
          return finalResult
        }, [])
      if (sectionBody.length) {
        data.push({
          id: sectionHeader.id,
          mainTitle: sectionHeader.title,
          body: sectionBody
        })
      }
    })
  }
  return data
}

const userPracticeData = (learningObjectives, topics, userLearningObjectives) => {
  const data = []
  if (learningObjectives && topics) {
    const learningObjectivesJS = learningObjectives.toJS()
    const topicsJS = topics.toJS()
    const nestedLO = nestChildrenIntoParent(
      learningObjectivesJS,
      'learningObjectives',
      'topic'
    ).map((item, index) => {
      const order = getPropertyFromId('order', topicsJS, item.id) || index
      return { ...item, order }
    })
    nestedLO.sort((a, b) => (a.order > b.order ? 1 : b.order > a.order ? -1 : 0)).forEach(section => {
      const sectionHeader = topicsJS.find(
        chapterObject => chapterObject.id === section.id
      )
      const sectionBody = section.learningObjectives.sort((a, b) => (a.order > b.order ? 1 : b.order > a.order ? -1 : 0))
        .reduce((finalResult, learningObjective) => {
          const loMappedUserLO = learningObjective.userLearningObjectives
          const userLOId = loMappedUserLO && loMappedUserLO[0].id
          if (userLOId) {
            const userLearningObjective = userLearningObjectives.find(userVideo => userVideo.get('id') === userLOId)
            finalResult.push({
              ...learningObjective,
              practiceQuestionStatus: userLearningObjective && userLearningObjective.get('practiceQuestionStatus')
            })
          }
          return finalResult
        }, [])
      if (sectionBody.length) {
        data.push({
          id: sectionHeader.id,
          mainTitle: sectionHeader.title,
          body: sectionBody
        })
      }
    })
  }
  return data
}

const getLevelOfProgress = (userProfileJS, topicId) => {
  let found = false
  let progress = 0
  if (userProfileJS.length > 0) {
    const {
      proficientTopics,
      familiarTopics,
      masteredTopics
    } = userProfileJS[0]
    const findTopicId = topic => topic.id === topicId
    if (!found) {
      found = proficientTopics.find(findTopicId)
      progress = 3
    }
    if (!found) {
      found = masteredTopics.find(findTopicId)
      progress = 2
    }
    if (!found) {
      found = familiarTopics.find(findTopicId)
      if (found) {
        progress = 1
      } else {
        progress = 0
      }
    }
  }
  return progress
}

const quizData = (userProfile, topics, chapters) => {
  const data = []
  if (userProfile && topics && chapters) {
    const userProfileJS = userProfile.toJS()
    const topicsJS = topics.toJS()
    const chaptersJS = chapters.toJS()
    const nestedTopics = nestTopicsInChapter(topicsJS).map((item, index) => {
      const order = getPropertyFromId('order', chaptersJS, item.id) || index
      return { ...item, order }
    })
    nestedTopics.sort((a, b) => (a.order > b.order ? 1 : a.order < b.order ? -1 : 0)).forEach(section => {
      const sectionHeader = chaptersJS.find(
        chapterObject => chapterObject.id === section.id
      )
      data.push({
        id: sectionHeader && sectionHeader.id,
        mainTitle: sectionHeader && sectionHeader.title,
        body: section.topics.sort((a, b) => (a.order > b.order ? 1 : a.order < b.order ? -1 : 0)).map(topic => ({
          ...topic,
          proficientLevel: getLevelOfProgress(userProfileJS, topic.id)
        }))
      })
    })
  }
  return data
}

const getDataByRoute = (activeItem,props) => {
      switch (activeItem) {
          case 'Videos':
              return userVideoData(
                filterKey(props.chapters,'learningVideosRewatch'),
                filterKey(props.topics,'learningVideosRewatch'),
                props.userVideo
              );
          case 'Chats' :
              return userChatData(
                filterKey(props.learningObjectives,'chatRewatch'),
                filterKey(props.topics, 'chatRewatch'),
                props.userLearningObjectives
              )
          case 'Practice Questions' :
              return userPracticeData(
                filterKey(props.learningObjectives,'practiceRewatch'),
                filterKey(props.topics,'practiceRewatch'),
                props.userLearningObjectives
              )
          case 'Quizzes' :
              return quizData(
                props.userProfile,
                filterKey(props.topics,'userProfileRewatch'),
                filterKey(props.chapters,'userProfileRewatch')
              )
          default:
              return []
      }
}

const RewatchRoot = (props) => {
    let activeItem = props.location.pathname.replace('/memory/rewatch/','');
    const data = getDataByRoute(activeItem,props);
    const isLoading = (props.videosLoading || props.chatLoading ||
      props.practiceLoading || props.quizLoading)
    return(
        <Memory {...props} data={data} isLoading={isLoading}/>
    )
}

const mapStateToProps = (state) => ({
    user: filterKey(state.data.getIn(['user', 'data'], Map({})),'loggedinUser').get(0),
    userVideo : state.data.getIn(['userVideo','data']),
    topics : state.data.getIn(['topic','data']),
    chapters : state.data.getIn(['chapter','data']),
    learningObjectives: state.data.getIn(['learningObjective', 'data']),
    userLearningObjectives: state.data.getIn(['userLearningObjective', 'data']),
    userProfile: state.data.getIn(['userProfile', 'data']),
    videosLoading: state.data.getIn(['learningVideosRewatch','fetchStatus','learningVideosRewatch','loading']),
    chatLoading: state.data.getIn(['chatRewatch','fetchStatus','chatRewatch','loading']),
    practiceLoading: state.data.getIn(['practiceRewatch','fetchStatus','practiceRewatch','loading']),
    quizLoading: state.data.getIn(['userProfileRewatch','fetchStatus','userProfileRewatch','loading']),
    videosFetchSuccess: state.data.getIn(['learningVideosRewatch','fetchStatus','learningVideosRewatch','success']),
    chatFetchSuccess: state.data.getIn(['chatRewatch','fetchStatus','chatRewatch','success']),
    practiceFetchSuccess: state.data.getIn(['practiceRewatch','fetchStatus','practiceRewatch','success']),
    quizFetchSuccess: state.data.getIn(['userProfileRewatch','fetchStatus','userProfileRewatch','success'])
})

export default connect(mapStateToProps)(withRouter(RewatchRoot))
