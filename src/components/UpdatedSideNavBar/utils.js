import React from 'react'
import { get } from 'lodash'
import { Map } from 'immutable'
import { checkIfEmbedEnabled, getEmbedData, isPqReportNotAllowed } from '../../utils/teacherApp/checkForEmbed'
import { checkForComponentsInLo, getFilteredLoWithOnlyOnePQ } from '../../pages/UpdatedSessions/utils'
import { loComponentNameToRouteAlias, learningObjectiveComponents } from '../../config'
import { 
  VideoIcon, 
  loIcon, 
  ChatIcon, 
  comicStripIcon, 
  learningSlideIcon, 
  pqIcon, 
  reportIcon, 
  CodingIcon, 
  AssginmentIcon,
} from './mainSideBarIcons'
import store from '../../store'
import { HOMEWORK_COMPONENTS, HOMEWORK_COMPONENTS_CONFIG, TOPIC_COMPONENTS } from '../../constants/topicComponentConstants'
import { filterKey, getDataFromLocalStorage } from '../../utils/data-utils'
import { backToPageConst } from '../../pages/TeacherApp/constants'
import { getUserParams } from '../../utils/getUserParams'
import extractSubdomain from '../../utils/extractSubdomain'
import { STUDENT_BASE_URL } from '../../constants/routes/routesPaths'

const CLASSWORK_SIDEBAR_CONFIG = [
  { 
    type: 'video',
    title: 'Video', 
    icon: VideoIcon,
    link: `/sessions/video/{courseId}/{topicId}/{videoId}`,
  },
  { 
    type: 'homeworkDiscussion',
    title: 'Homework Discussion', 
    icon: ChatIcon,
    link: `/sessions/quiz-report-latest/{courseId}/{topicId}`,
  },
  { 
    type: 'learningObjective',
    titlePath: 'learningObjective.title', 
    icon: loIcon,
    link: `/sessions/{loComponent}/{courseId}/{topicId}/{loId}`,
  },
  { 
    type: 'blockBasedPractice',
    title: 'Assignment', 
    icon: AssginmentIcon,
    link: `/sessions/practice/{courseId}/{topicId}/{practiceId}`,
  },
  { 
    type: 'blockBasedProject',
    title: 'Assignment', 
    icon: AssginmentIcon,
    link: `/sessions/practice/{courseId}/{topicId}/{practiceId}`,
  },
  { 
    type: 'assignment',
    title: 'Coding Assignment', 
    icon: CodingIcon,
    link: `/sessions/coding/{courseId}/{topicId}`,
  },
  { 
    type: 'message',
    title: 'Chat', 
    icon: ChatIcon,
    link: `/sessions/{loComponent}/{courseId}/{topicId}/{loId}`,
  },
  { 
    type: 'practiceQuestion',
    title: 'Practice Questions', 
    icon: pqIcon,
    link: `/sessions/{loComponent}/{courseId}/{topicId}/{loId}`,
  },
  { 
    type: 'comicStrip',
    title: 'Comic Strip', 
    icon: comicStripIcon,
    link: `/sessions/{loComponent}/{courseId}/{topicId}/{loId}`,
  },
  { 
    type: 'chatbot',
    title: 'Chat', 
    icon: ChatIcon,
    link: `/sessions/{loComponent}/{courseId}/{topicId}/{loId}`,
  },
  { 
    type: 'learningSlide',
    title: 'Learning Slide', 
    icon: learningSlideIcon,
    link: `/sessions/{loComponent}/{courseId}/{topicId}/{loId}`,
  },
  { 
    type: 'practiceReport',
    title: 'Quiz Report', 
    icon: reportIcon,
    link: `/sessions/{pqRoute}/{courseId}/{topicId}/{loId}`,
  }
]

export const HOMEWORK_SIDENAV_CONFIG = [
  { 
    type: HOMEWORK_COMPONENTS_CONFIG.homeworkPractice,
    title: 'Assignment', 
    icon: AssginmentIcon,
    link: '/homework/{courseId}/{topicId}/{practiceId}/practice',
  },
  { 
    type: HOMEWORK_COMPONENTS_CONFIG.quiz,
    title: 'Quiz', 
    icon: pqIcon,
    link: '/homework/{courseId}/{topicId}/quiz',
  },
  { 
    type: HOMEWORK_COMPONENTS_CONFIG.homeworkAssignment,
    title: 'Coding Assignment', 
    icon: CodingIcon,
    link: '/homework/{courseId}/{topicId}/codingAssignment',
  },
  {
    type: 'quizReport',
    title: 'Report',
    icon: reportIcon,
    link: '/quiz-report-latest/{courseId}/{topicId}'
  }
]

const getFilteredTopicComponentRule = (topicComponentRule) => {
  const ignoreComponentMap = ['learningObjective']
  const filteredRule = []
  if (topicComponentRule && topicComponentRule.length) {
      topicComponentRule.reduce((prevComponent, currentComponent) => {
              if ((get(prevComponent, 'componentName') === get(currentComponent, 'componentName'))
          && filteredRule.filter(e => get(e, 'componentName') === get(currentComponent, 'componentName')).length
          && !ignoreComponentMap.includes(get(currentComponent, 'componentName'))
          ) {
              if (currentComponent.blockBasedProject) {
                const blockBasedProjectInFilteredRuleIndex = filteredRule.findIndex(e => get(e, 'componentName') === get(currentComponent, 'componentName'))
                const blockBasedProjectInFilteredRule = filteredRule[blockBasedProjectInFilteredRuleIndex]
                let prevBlockBasedProjects = get(blockBasedProjectInFilteredRule, 'blockBasedProjects', [])
                if (!prevBlockBasedProjects || prevBlockBasedProjects.length === 0) {
                  prevBlockBasedProjects = [get(blockBasedProjectInFilteredRule, 'blockBasedProject', [])]
                }
                filteredRule[blockBasedProjectInFilteredRuleIndex] = {
                  ...filteredRule[blockBasedProjectInFilteredRuleIndex],
                  blockBasedProjects: [...prevBlockBasedProjects, currentComponent.blockBasedProject],
                }
              }
              return currentComponent
          } else {
              if (currentComponent.blockBasedProject) {
                filteredRule.push({
                  ...currentComponent,
                  blockBasedProjects: [currentComponent.blockBasedProject],
                })
              } else {
                filteredRule.push(currentComponent)
              }
              return currentComponent
          }
      }, topicComponentRule[0])
      return filteredRule
  }
  return []
}

const getFilteredLoComponentRule = (
  learningObjective, 
  courseLoComponentRule,
  topicLoComponentRule = [], 
  index = null
) => {
  let filteredLoComponent = []
  if (topicLoComponentRule && topicLoComponentRule.length && learningObjective) {
      filteredLoComponent = topicLoComponentRule.sort((a, b) => {
          return get(a, 'order') - get(b, 'order')
      }).filter((componentRule) => checkForComponentsInLo(componentRule, learningObjective))
  } else if (courseLoComponentRule && courseLoComponentRule.length && learningObjective) {
      filteredLoComponent = courseLoComponentRule.sort((a, b) => {
        return get(a, 'order') - get(b, 'order')
      }).filter((componentRule) => checkForComponentsInLo(componentRule, learningObjective))
  }
  filteredLoComponent = getFilteredLoWithOnlyOnePQ({ loComponentRule: filteredLoComponent, learningObjective })
  if ((typeof index === 'number') && filteredLoComponent && filteredLoComponent.length) {
      return [filteredLoComponent[index]]
  }
  return filteredLoComponent || []
}

const getPQRoute = () => {
  let pqRoute = 'practice-report'
  if (checkIfEmbedEnabled()) {
    const backToPage = getEmbedData('backToPage')
    if (backToPage !== backToPageConst.trainingResourcesClasswork) {
      pqRoute = 'pq-report'
    }
  }
  return pqRoute
}

const getLORedirectKey = (loComponentRule) => {
  const componentName = get(loComponentRule, 'componentName', 'comicStrips')
  return loComponentNameToRouteAlias[componentName]
}

const getLink = (
  revisitLink,
  courseId,
  topicId,
  link, 
  loId, 
  loComponentRule,
  videoId,
  practiceId,
) => {
  link = link.replace('{courseId}', courseId)
  link = link.replace('{videoId}', videoId)
  link = link.replace('{topicId}', topicId)
  link = link.replace('{loId}', loId)
  link = link.replace('{loComponent}', getLORedirectKey(loComponentRule))
  link = link.replace('{pqRoute}', getPQRoute())
  link = link.replace('{practiceId}', practiceId)
  if (checkIfEmbedEnabled()) {
    link = link.replace('quiz-report-latest', 'homework-review')
  }
  return STUDENT_BASE_URL + revisitLink + link
}

// const getTitle = ()

const replaceVideoTitleIfMultipleVideos = (sidebarRule) => {
  const videoComponent = sidebarRule.find(e => get(e, 'componentName') === 'video')
  if (videoComponent && get(videoComponent, 'videos', []).length > 1) {
    videoComponent.title = get(videoComponent, 'video.title')
  }
  return sidebarRule
}

const filterEmptyComponents = (sidebarRule) => {
  return sidebarRule.filter(e => {
    if(get(e,'componentName') === TOPIC_COMPONENTS.blockBasedPractice || 
      get(e,'componentName') === TOPIC_COMPONENTS.homeworkPractice
    ){
      return get(e,'blockBasedProjects', []).length
    }
    return true
  })
  
}

const getMentorMenteeSession = (topicId) => {
  const state = store.getState()
  const loggedInUser = filterKey(state.data.getIn([
      'user',
      'data'
  ]), 'loggedinUser').get(0) || Map({})
  const loggedInUserId = (loggedInUser && loggedInUser.toJS)
      ? get(loggedInUser.toJS(), 'id')
      : ''
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


const getInSessionSideBarRule = (
  rawTopicComponentRule, 
  courseDefaultLoComponentRule, 
  courseId, 
  topicId,
  revisitLink,
  classWork =  true,
  shouldHaveHomeworkDiscussion = false,
) => {
   if (checkIfEmbedEnabled()) {
    const componentName = getEmbedData('componentName')
    const backToPage = getEmbedData('backToPage')
    const isViewingHomework = [...HOMEWORK_COMPONENTS].includes(componentName)
    if (!isViewingHomework && componentName === 'homework') {
      shouldHaveHomeworkDiscussion = true
      classWork = true
    }
    if (backToPage === backToPageConst.trainingResourcesClasswork || backToPage === backToPageConst.trainingResourcesAssessment) {
      shouldHaveHomeworkDiscussion = false
    }
  }

  if (!checkIfEmbedEnabled()) {
    shouldHaveHomeworkDiscussion = false
  }
  const SIDEBAR_CONFIG = classWork ? CLASSWORK_SIDEBAR_CONFIG : HOMEWORK_SIDENAV_CONFIG
  
  const addLinksToBlockBasedProject = (sidebarRule) =>
    sidebarRule.map(thisComponentRule => 
      ([TOPIC_COMPONENTS.blockBasedPractice, TOPIC_COMPONENTS.homeworkPractice].includes(
        get(thisComponentRule, 'componentName')) && thisComponentRule.blockBasedProjects && thisComponentRule.blockBasedProjects.length > 0
      ) ? ({
        ...thisComponentRule,
        blockBasedProjects: thisComponentRule.blockBasedProjects.map(blockBasedProject => {
          return ({
          ...blockBasedProject,
          link: getLink(
            classWork ? revisitLink : '',
            courseId,
            topicId,
            classWork 
              ? CLASSWORK_SIDEBAR_CONFIG.find(config => config.type === TOPIC_COMPONENTS.blockBasedPractice).link
              : HOMEWORK_SIDENAV_CONFIG.find(config => config.type === TOPIC_COMPONENTS.homeworkPractice).link,
            null,
            null,
            null,
            get(blockBasedProject, 'id'),
          )
        })
        })
      }) : thisComponentRule
    )


  const sidebar = []

  if (!classWork && !checkIfEmbedEnabled()) {
    const mentorMenteeSession = getMentorMenteeSession(topicId)
    const isSubmittedForReview = mentorMenteeSession && mentorMenteeSession.getIn([0, 'isSubmittedForReview'])  
    if (isSubmittedForReview) {
      const sidebarQuizReportConfig = SIDEBAR_CONFIG.find(config => config.type === 'quizReport')
      sidebar.push({
        ...sidebarQuizReportConfig,
        link: getLink(
          revisitLink,
          courseId,
          topicId,
          sidebarQuizReportConfig.link
        ),
        topicId,
        navType: 'root'
      })
    }
  }

  const topicComponentRule = getFilteredTopicComponentRule(rawTopicComponentRule)
  let sidebarRule = topicComponentRule.map((item, index) => (
    get(item, 'componentName') === 'learningObjective' 
      ? { 
        ...item,
        loRule: 
          getFilteredLoComponentRule(
            get(item, 'learningObjective'),
            courseDefaultLoComponentRule,
            get(item, 'learningObjectiveComponentsRule')
          ),
      }
      : item
  ))

  sidebarRule = replaceVideoTitleIfMultipleVideos(sidebarRule)
  sidebarRule = addLinksToBlockBasedProject(sidebarRule)
  sidebarRule = filterEmptyComponents(sidebarRule)



  if (shouldHaveHomeworkDiscussion && classWork) {
    const config = SIDEBAR_CONFIG.find(item => item.type === 'homeworkDiscussion')
    sidebar.push({
      ...config,
      link: getLink(revisitLink, courseId, topicId, config.link),
      navType: 'root',
      topicId,
    })
  }


  sidebarRule.forEach(item => {
    if (get(item, 'componentName') === 'learningObjective' && classWork) {
      let doesPracticeExist = false
      const childComponents = []
      const loId = get(item, 'learningObjective.id')
      get(item, 'loRule', []).forEach(loItem => {
        if (
          (get(loItem, 'componentName') === learningObjectiveComponents.practiceQuestion && get(item, 'learningObjective.questionBankMeta.count') > 0) ||
          (get(loItem, 'componentName') === learningObjectiveComponents.chatbot && get(item, 'learningObjective.practiceQuestionChatbotMeta.count') > 0) ||
          (get(loItem, 'componentName') === learningObjectiveComponents.learningSlide && get(item, 'learningObjective.practiceQuestionLearningSlidesMeta.count') > 0)
        ) {
          doesPracticeExist = true
        }
        const config = SIDEBAR_CONFIG.find(item => item.type === get(loItem, 'componentName'))
        childComponents.push({
          ...config,
          topicId: topicId,
          loId: loId,
          link: getLink(revisitLink, courseId, topicId, config.link, loId, loItem),
          navType: 'root',
          loTitle: get(item,'learningObjective.title'),
        })
      })
      if (doesPracticeExist) {
        const config = SIDEBAR_CONFIG.find(item => item.type === 'practiceReport')
        childComponents.push({
          ...config,
          topicId: topicId,
          loId: loId,
          navType: 'root',
          link: getLink(revisitLink, courseId, topicId, config.link, loId),
          loTitle: get(item,'learningObjective.title'),
        })
      }

      if (childComponents.length > 1) {
        const config = SIDEBAR_CONFIG.find(item => item.type === 'learningObjective')
        sidebar.push({
          ...config,
          title: (config.titlePath) ? get(item, config.titlePath) : config.title,
          topicId: topicId,
          loId: loId,
          doesPracticeExist,
          navType: 'parent',
          childComponents,
        })
      } else if (childComponents.length === 1) {
        const config = SIDEBAR_CONFIG.find(item => item.type === childComponents[0].type)
        const loConfig = SIDEBAR_CONFIG.find(item => item.type === 'learningObjective')
        sidebar.push({
          ...config,
          title: loConfig.titlePath ? get(item, loConfig.titlePath) : loConfig.title,
          topicId: topicId,
          loId: loId,
          doesPracticeExist,
          navType: 'parent',
          link: getLink(revisitLink, courseId, topicId, config.link, loId, get(item, 'loRule.0', {})),
          childComponents,
        })
      }
    } else {
      SIDEBAR_CONFIG.forEach(config => {
        if (get(item, 'componentName') === config.type) {
          sidebar.push({
            ...config,
            navType: 'root',
            topicId: topicId,
            blockBasedProjects: get(item, 'blockBasedProjects', []),
            title: config.titlePath ? get(item, config.titlePath) : config.title,
            link: getLink(
              revisitLink,
              courseId,
              topicId,
              config.link,
              null,
              null,
              get(item, 'video.id'),
              get(item, 'blockBasedProject.id')
            ),
            topicTitle: get(item,'video.title','') || get(item,'blockBasedProject.title','')
          })
        }
      })
    }
  })
  if(!classWork && !checkIfEmbedEnabled()){
        const checkIfQuizExists = !!sidebar.find(item => item.type === 'quiz')
        if(!checkIfQuizExists){
          const quizReportIndex = sidebar.findIndex(item => item.type === 'quizReport')
          if(quizReportIndex > -1){
            sidebar.splice(quizReportIndex, 1)
          }
        }
  }
  return sidebar
}

const getFilteredLoComponentSidebarItem = (childComponents = []) => {
  let newChildComponents = [...childComponents]
  const isPqReportExist = newChildComponents.find(item => get(item, 'type') === 'practiceReport')
  if (isPqReportExist && isPqReportNotAllowed()) {
    newChildComponents = newChildComponents.filter(item => get(item, 'type') !== 'practiceReport')
  }
  return newChildComponents
}

const getHomeworkSessionSideBarRule = (
  rawTopicComponentRule,
  courseDefaultLoComponentRule,
  courseId,
  topicId,
  revisitLink,
) => getInSessionSideBarRule(rawTopicComponentRule, courseDefaultLoComponentRule, courseId, topicId, revisitLink, false)

const getThisTopic = (topicId) => {
  const topics = get(get(store.getState(), 'data').toJS(), 'topic.data', [])
  const thisTopic = topics.find(topic => topic.id === topicId)
  return thisTopic
}


const getThisTopicComponentRule = (topicId) => {
  const topicComponentRule = get(getThisTopic(topicId), 'topicComponentRule', [])
  return topicComponentRule
}

const thisComponentRule = (componentName, topicId, loId, courseDefaultLoComponentRule = null) => {
  const topicComponentRule = getThisTopicComponentRule(topicId)
  const thisComponentRule = topicComponentRule.find(item => (
    item.componentName === TOPIC_COMPONENTS.learningObjective
      ? loId === get(item, 'learningObjective.id')
      : get(item, 'componentName') === componentName
  ))
  return thisComponentRule
}

const gtmUserParams = () => {
  const classroomSessionsData = getDataFromLocalStorage('classroomSessionsData')
  const batchId = get(classroomSessionsData,'batchId')
  const topicId = get(classroomSessionsData,'topicId')
  const courseId = get(classroomSessionsData,'courseId')
  const sessionId = get(classroomSessionsData,'sessionId')
  const userParams = {
    ...getUserParams(),
    batchId: batchId,
    topicId: topicId,
    courseId: courseId,
    sessionId: sessionId
  }
  return userParams
}

export {
  getInSessionSideBarRule,
  getFilteredTopicComponentRule,
  getFilteredLoComponentRule,
  thisComponentRule,
  getHomeworkSessionSideBarRule,
  getFilteredLoComponentSidebarItem,
  gtmUserParams
}
