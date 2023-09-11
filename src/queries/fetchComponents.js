import gql from 'graphql-tag'
import get from 'lodash/get'
import { List, Map } from 'immutable'
import duck from '../duck'
import store from '../store'
import { 
  FETCH_TOPIC_COMPONENT_RULE,
  FETCH_VIDEO_PAGE,
  FETCH_USER_LEARNING_OBJECTIVE,
  FETCH_BLOCK_BASED_PRACTICE,
  FETCH_CODING_ASSIGNMENT,
} from './componentQueries'
import { getHomeworkSessionSideBarRule, getInSessionSideBarRule } from '../components/UpdatedSideNavBar/utils'
import { filterKey, getAppUserAuthToken, getBuddies } from '../utils/data-utils'
import { CACHE_TTL_ONE_HOUR, learningObjectiveComponents } from '../config'
import { TOPIC_COMPONENTS } from '../constants/topicComponentConstants'
import FETCH_COURSE_DETAIL from './componentQueries/FETCH_COURSE_DETAIL'
import { checkIfEmbedEnabled } from '../utils/teacherApp/checkForEmbed'

const fetchComponents =  (
  topicId,
  courseId
) => {
  console.log({topicId,courseId})
  topicId = "clf9k4eep0b7m0ui92mfe45r2"
  const getCurrentCourse = () => get(
    get(store.getState(), 'data').toJS(), 
    'courses.data',
    []
  ).find(course => course.id === courseId)

  const getCurrentCourseFromSingleCourse = () => get(
    get(store.getState(), 'data').toJS(), 
    'course.data',
    {}
  )
  
  const singleCourseId = get(getCurrentCourseFromSingleCourse(), 'id')
  const currentCourseId = get(getCurrentCourse(), 'id')
  if (
    (singleCourseId !== currentCourseId) && currentCourseId && courseId
  ) {
    duck.merge(() => ({
      course: getCurrentCourse()
    }))
  }

  const getUserId = () => {
    return filterKey(
      get(store.getState(), 'data')
        .getIn([
          'user',
          'data'
        ]),
        'loggedinUser'
      ).getIn([0, 'id'])
  }

  const getThisTopic = () => {
    const topics = get(get(store.getState(), 'data').toJS(), 'topic.data', [])
    const thisTopic = topics.find(topic => topic.id === topicId)
    return thisTopic
  }

  const fetchComponentRule = async () => {
    const thisTopic = getThisTopic()
    const thisTopicComponentRule = thisTopic && get(thisTopic, 'thumbnailSmall') && get(thisTopic, 'topicComponentRule')
    const loggedInUser = filterKey(
      get(store.getState(), 'data')
        .getIn([
          'user',
          'data'
        ]),
        'loggedinUser')
    const rawDataRoles = get(loggedInUser && loggedInUser.toJS(), '[0].rawData.roles', [])
    const isCmsAdmin = rawDataRoles.includes('cmsAdmin')
    if (true) {
      await duck.get({
          query: `/topic/${topicId}`,
          changeExtractedData: (extractedData, originalData) => {
            console.log(extractedData,originalData,"original")
            return extractedData
          },
          type: "topic/fetch",
          key: `topic/${topicId}`,
          expiresIn: CACHE_TTL_ONE_HOUR
       })
    }
    console.log(getThisTopic(),'topic')
    return getThisTopic()
  }


  const fechCourseComponentRule = async () => {
    if (!courseId) {
      return {}
    }
    const course = getCurrentCourse() || getCurrentCourseFromSingleCourse()
    let courseComponentRule = get(course, 'defaultLoComponentRule', [])
    if ((!courseComponentRule || (courseComponentRule && !courseComponentRule.length)) || (!courseComponentRule && checkIfEmbedEnabled())) {
      await duck.query({
        query: gql`${FETCH_COURSE_DETAIL(courseId)}`,
        variables: {
          CDNCaching: true,
        },
      })
      courseComponentRule = get(getCurrentCourseFromSingleCourse(), 'defaultLoComponentRule')
    }
    return courseComponentRule
  }
  
  const isVideoPageFetched = (
    topicId, 
    customKey
  ) => {
    const key = customKey ? `${customKey}/${topicId}` : topicId
    const userVideo = (filterKey(
      get(store.getState(), 'data')
        .getIn([
          'userVideo', 
          'data'
        ]),
        key
    ) || List({}))
    return userVideo.size > 0
  }
  
  const isLearningObjectiveFetched = (loId) => {
    const state = get(store.getState(), 'data')
    const fetched = state.getIn([
      'chatPractice', 
      'fetchStatus',
      loId,
      'success'
    ], false)

    const staled = state.getIn([
      'chatPractice', 
      'fetchStatus',
      loId,
      'stale'
    ], false)
    return fetched && !staled
  }

  const isCodingFetched = (topicId) => {
    const state = get(store.getState(), 'data')
    const fetched = state.getIn([
      'userAssignment',
      'fetchStatus',
      topicId,
      'success'
    ])
    const staled = state.getIn([
      'userAssignment',
      'fetchStatus',
      topicId,
      'stale'
    ])
    return fetched && !staled
  }
  
  const hasBlockBasedPracticeFetched = (topicId, userId, type) => {
    const state = get(store.getState(), 'data')
    const fetched = state.getIn([
      'userBlockBasedPractices',
      'fetchStatus',
      topicId + '/' + type + '/' + userId,
      'success'
    ])
    const staled = state.getIn([
      'userBlockBasedPractices',
      'fetchStatus',
      topicId + '/' + type + '/' + userId,
      'stale'
    ])
    return fetched && !staled
  }

  const getVideoPageQuery = async (component, userId) => {
    // Video
    if (
      component.type === TOPIC_COMPONENTS.video && 
      !isVideoPageFetched(topicId, 'blockVideo')
    ) {
      const videoId = component.arg.videoId
      console.log(JSON.stringify({userId,topicId,courseId,videoId: component.arg.videoId}))
     
      return await duck.post({
        query: "/userVideos",
        options: {
          data: {
            userId,
            topicId,
            courseId,
            videoId
          },
        },
        type: 'userVideos/fetch',
        key: `userVideo/${topicId}` 
      })
    }
    return ''
  }

  const getLOQuery = async (component, userId) => {
    console.log("learning slide")
    // Any Learning Objective Type
    if (
      Object.values(learningObjectiveComponents).includes(component.type)
      && !isLearningObjectiveFetched(component.arg.loId)
    ) {
      const learningObjectiveId = component.arg.loId

      return await duck.post({
        query: "/user-learning-objective",
        options: {
          data: {
            userId,
            topicId,
            courseId,
            learningObjectiveId
          },
          apiType: "userLearningObjectives"
        },
        type: "learningObjective/fetch",
        key: `learningObjective/${topicId}`,
        changeExtractedData: (original,extractedData) => {
          console.log(original,{extractedData})
          return extractedData
        },
        transformResponse: (res) => {
          const userLearningObjectives = res.data.userLearningObjectives
          const result = {
            data: {
              learningObjective: [
                userLearningObjectives
              ]
            }
          } 
          console.log({result})
          return result
        }

      })
    }
    return ''
  }

  const getCodingAssignmentQuery = (component, userId) => {
    if (
      component.type === TOPIC_COMPONENTS.assignment
      && !isCodingFetched(topicId)
    ) {
      return FETCH_CODING_ASSIGNMENT(
        userId,
        topicId,
        courseId,
      )
    }
    return ''
  }

  const getBlockBasedPracticeQuery = (component, userId) => {
    if (
      ((component.type === TOPIC_COMPONENTS.blockBasedPractice) ||
      (component.type === TOPIC_COMPONENTS.blockBasedProject) ||
      (component.type === TOPIC_COMPONENTS.homeworkPractice)
      ) && 
      !hasBlockBasedPracticeFetched(topicId, userId, component.type)
    ) {
      return FETCH_BLOCK_BASED_PRACTICE(
        userId,
        topicId,
        courseId,
        component.arg.blockBasedPracticeIds,
        component.type,
      )
    }
    return ''
  }

  const fetchComponents = async (componentsToFetch, buddyUserId = null, buddyUserToken = null, fetchedFromClasswork = false) => {
    console.log({componentsToFetch})
    let query = ''
    const userId = buddyUserId ? buddyUserId : getUserId()
    let skipStateMerge = !!buddyUserId
    const filterredComponents = componentsToFetch.map((component, index) => {
      if (Object.values(learningObjectiveComponents).includes(component.type)) {
        if (componentsToFetch.findIndex(
          item => item.location === component.location
        ) !== index) {
          return { ...component, skipRequest: index };
        }
        return component
      }
      return component;
		});

    for (let component of filterredComponents) {

      if (!component.arg) {
        const classworkSidebarRule = await getSideBarRule(true)
        const homeworkSidebarRule = await getSideBarRule(false)
        let thisComponentbarInSideBar = classworkSidebarRule.find(rule => rule.type === component.type)
        if (!thisComponentbarInSideBar) {
          thisComponentbarInSideBar = homeworkSidebarRule.find(rule => rule.type === component.type)
        }
        if (thisComponentbarInSideBar) {
          component.arg = getComponentTypeAndArg(thisComponentbarInSideBar).arg
        }
      }

      const userBuddies = getBuddiesFromStore()

      if (userBuddies && userBuddies.length > 0 && !fetchedFromClasswork && !buddyUserId) {
        for (let buddy of userBuddies) {
          if (buddy.id !== userId) {
            fetchComponents([component], buddy.id, getAppUserAuthToken(buddy.token))
          }
        }
      }

      query += await getVideoPageQuery(component, userId)
      query += getLOQuery(component, userId)
      query += getCodingAssignmentQuery(component, userId)
      query += getBlockBasedPracticeQuery(component, userId)

      // Skip state merge for block based practice
      if (((component.type === TOPIC_COMPONENTS.blockBasedPractice) ||
      (component.type === TOPIC_COMPONENTS.blockBasedProject) ||
      (component.type === TOPIC_COMPONENTS.homeworkPractice))) {
        skipStateMerge = false
      }
    }
    let res = {}

    return res
  }

  const getComponentTypeAndArg = (component) => {
    let componentType = get(component, 'type')
    let arg = {
      topicId,
      courseId,
    }
    if (componentType === 'learningObjective') {
      componentType = get(component, 'childComponents.0.type')
      arg = {
        ...arg,
        doesPracticeExist: get(component, 'doesPracticeExist'),
        loId: get(component, 'childComponents.0.loId'),
      }
    }
    if (Object.keys(learningObjectiveComponents).includes(componentType) && get(component, 'loId')) {
      arg = {
        ...arg,
        doesPracticeExist: get(component, 'doesPracticeExist', false),
        loId: get(component, 'loId'),
      }
    }

    if (componentType === 'video') {
      arg = {
        ...arg,
        videoId: get(component, 'video.id'),
      }
    }
    
    if (componentType === 'blockBasedPractice') {
      arg = {
        ...arg,
        blockBasedPracticeIds: get(component, 'blockBasedProjects', []).map(blockBasedProject => blockBasedProject.id),
      }
    }
    if (componentType === TOPIC_COMPONENTS.homeworkPractice) {
      arg = {
        ...arg,
        blockBasedPracticeIds: get(component, 'blockBasedProjects', []).map(blockBasedProject => blockBasedProject.id),
      }
    }
    return { type: componentType, arg }
  }

  const getSideBarRule = async (classwork = true) => {
    const courseDefaultLoComponentRule = await fechCourseComponentRule()
    const topic = await fetchComponentRule()
    
    const topicComponentRule = get(topic, 'topicComponentRule', [])

    return getInSessionSideBarRule(
      topicComponentRule,
      courseDefaultLoComponentRule,
      courseId, 
      topicId,
      '',
      classwork
    )
  }

  const getBuddiesFromStore = () => {
    const user = filterKey(
      window && window.store.getState().data.getIn(["user", "data"]),
      "loggedinUser"
    ).get(0) || new Map({});
    return getBuddies(get(user.toJS(), 'buddyDetails', []))
  }

  const fetchForBuddies = async () => {
    const sidebarRule = await getSideBarRule(true)
    const userBuddies = getBuddiesFromStore()
    if (userBuddies && userBuddies.length) {
      userBuddies.forEach(userBuddy => {
        fetchComponents(
          sidebarRule,
          userBuddy.id,
          getAppUserAuthToken(userBuddy.token)
        )
      })
    }
  }

  const fetchClasswork = async (classwork = true) => {
    return
    const sidebarRule = await getSideBarRule(classwork)
    console.log({sidebarRule})
    const [firstComponent, ...rest] = sidebarRule
    // fetch all components expect first, asynchronously
    fetchComponents(rest.map(component => getComponentTypeAndArg(component)), null, null, true)
    // fetch first component synchronously
    const res = await fetchComponents([getComponentTypeAndArg(firstComponent)], null, null, true)

    // fetch for buddies if available
    fetchForBuddies()
    return get(res, 'data', {})
  }

  const fetchHomework = () => fetchClasswork(false)

  return {
    classwork: fetchClasswork,
    componentRule: fetchComponentRule,
    components: fetchComponents,
    homework: fetchHomework,
    sidebar: getSideBarRule,
  };
}

export default fetchComponents
