import { motion } from 'framer-motion'
import gql from 'graphql-tag'
import get from 'lodash/get'
import React from 'react'
import { sections } from '../../config'
import requestToGraphql from '../../utils/requestToGraphql'
import { hsFor1280 } from '../../utils/scale'
import { getGradesOrSections, getTimeRangeFromSession } from '../../utils/teacherApp/mapQueryResponseToFullCalendarEvents'
import { customStyles } from './components/Dropdowns/Dropdown'
import { PlusSvg, CloseSvg } from "./components/svg"

export const FloatingAddButton = (props) => (
    <button className={props.className} onClick={() => props.actionHandler()}>
       <PlusSvg />
    </button>
)

export const CreateButton = (props) => (
    <motion.div
        whileTap={{ scale: 0.97 }}
        className={props.className} 
        onClick={() => props.actionHandler()} 
        disabled={props.disabled ? props.disabled : ''}
    >
        <PlusSvg />
        {props.text}
    </motion.div>
)

export const FilterDisplayTag = (props) => (
    <div className={props.className}>
        {props.text}
        <div onClick={() => props.removeFilterTag(props.element)}>
            <CloseSvg />
        </div>
    </div>
)

export const studentDropdownStyles = {
  ...customStyles,
  option: (styles, { isFocused, isSelected }) => ({
    ...styles,
    cursor: 'pointer',
    fontFamily: 'Inter',
    fontSize: hsFor1280(14),
    backgroundColor: isSelected ? '#F4F0FA' : '#fff',
    color: '#333333',
    '&:hover': {
      backgroundColor: '#F4F0FA',
      color: '#333333',
    }
  }),
  control: (styles) => ({
    ...styles,
    cursor: 'pointer',
    fontFamily: 'Inter',
    minHeight: hsFor1280(30),
    maxHeight: hsFor1280(30),
    border: '1px solid #EEEEEE',
    boxShadow: '0 0 0 0px black',
    borderRadius: hsFor1280(10),
    '&:hover': {
      border: '1px solid #EEEEEE',
      boxShadow: '0 0 0 0px black',
    }
  }),
  placeholder: (styles) => ({
    ...styles,
    fontSize: hsFor1280(16),
    top: '50%',
    color: '#282828',
    fontWeight: '500'
  }),
  singleValue: (styles) => ({
    ...styles,
    fontSize: hsFor1280(14),
    fontWeight: '500',
    top: '50%',
  }),
  valueContainer: (styles) => ({
    ...styles,
    padding: `0 0 0 ${hsFor1280(10)}`
  }),
  input: (styles) => ({
    ...styles,
    color: 'transparent'
  }),
  menu: (base) => ({
    ...base,
    zIndex: '100',
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: hsFor1280(140),
    "::-webkit-scrollbar": {
      width: "4px"
    },
    "::-webkit-scrollbar-thumb": {
      background: "#8C61CB"
    },
    "::-webkit-scrollbar-thumb:hover": {
      background: "#8C61CB"
    },
  }),
  container: (style) => ({
    ...style,
    width: hsFor1280(200)
  }),
  dropdownIndicator: (style) => ({
    ...style,
    padding: hsFor1280(4),
    color: '#757575',
    paddingRight: hsFor1280(12)
  })
}

export const loFilterDropdownStyles = {
  ...studentDropdownStyles,
  control: (styles) => ({
    ...styles,
    cursor: 'pointer',
    fontFamily: 'Inter',
    minHeight: hsFor1280(36),
    maxHeight: hsFor1280(36),
    border: '1px solid #AAAAAA',
    boxShadow: '0 0 0 0px black',
    borderRadius: hsFor1280(8),
    '&:hover': {
      border: '1px solid #AAAAAA',
      boxShadow: '0 0 0 0px black',
    }
  }),
}

export const fetchUserAssignment = async (userId, topicId, courseId) => {
  const data = await requestToGraphql(gql`query {
            userAssignments(filter:{
            and: [
              {user_some: {id:"${userId}"}}
              {topic_some:{id: "${topicId}"}}
              {course_some:{id: "${courseId}"}}
            ]
            },  orderBy: createdAt_DESC) {
            id
            user{
              id
            }
            assignment {
              assignmentQuestion {
                id
                isHomework
              }
              assignmentQuestionDisplayOrder
              userAnswerCodeSnippet
              isAttempted
              evaluation{
                id
                star
                tags{
                  id
                  name
                  minStar
                  maxStar
                }
                comment
              }
            }
            assignmentStatus
            }
          }`)
  return get(data, 'data.userAssignments', [])
}

export const fetchUserBlockBasedProjectData = async (userId, topicId, courseId) => {
  const data = await requestToGraphql(gql`query {
          userBlockBasedProjects(
            filter: {
              and: [
                { user_some: { id: "${userId}" } }
                { topic_some: { id: "${topicId}" } }
                { course_some: { id: "${courseId}" } }
              ]
            }
            orderBy: createdAt_DESC
        ){
            id
            answerLink
            savedBlocks
            status
            startTime
            endTime
            blockBasedProject {
              id
              type
              isHomework
            }
        }
      }`)
  return get(data, 'data.userBlockBasedProjects', [])
}

export const fetchUserBlockBasedPracticeData = async (userId, topicId, courseId) => {
  const data = await requestToGraphql(gql`query {
          userBlockBasedPractices(
            filter: {
              and: [
                { user_some: { id: "${userId}" } }
                { topic_some: { id: "${topicId}" } }
                { course_some: { id: "${courseId}" } }
              ]
            }
            orderBy: createdAt_DESC
        ){
            id
            answerLink
            savedBlocks
            status
            startTime
            endTime
            evaluationStatus
            isGsuiteFileVisited
            evaluation {
              id
              star
              comment
              tags {
                id
                name
                minStar
                maxStar
                category
              }
            }
            attachments {
              id
              type
              name
              uri
            }
            updatedAt
            blockBasedProject: blockBasedPractice {
              id
              type
              title
              isHomework
              layout
              answerFormat
              answerFormatDescription
            }
        }
      }`)
  return get(data, 'data.userBlockBasedPractices', [])
}

export const getTopicComponentData = async (topicId) => {
  const data = await requestToGraphql(gql`{
  topic(id: "${topicId}") {
    topicComponentRule {
      componentName
      blockBasedProject {
        id
        title
        type
        isHomework
        order
        projectDescription
        externalPlatformLink
        externalPlatformLogo {
          id
          name
          uri
        }
        layout
        answerFormat
        answerFormatDescription
        projectCreationDescription
        externalDescriptionEnabled
      }
    }
  }
}`)
  return get(data, 'data.topic.topicComponentRule', [])
}

export const fetchUserQuizReports = async (userId, topicId) => {
  const data = await requestToGraphql(gql`{
    userQuizReports(
    filter: {
      and:[
        { user_some: { id: "${userId}" } }
        {
          topic_some:{
            id:"${topicId}"
          }
        }
      ]
    }
    orderBy: createdAt_DESC
    first: 1
  ) {
    id
    createdAt
    quizAnswers{
       question{
         id
       }
      isAttempted
      isCorrect
      userMcqAnswer{
        questionBankImage {
          id
          image {
            id
            uri
          }
        }
        statement
        isSelected
        initialXML
        blocksJSON
      }
      userFibInputAnswer{
        answer
        position
      }
      userFibBlockAnswer{
        statement
        position
      }
      userArrangeAnswer{
        statement
        position
      }
    }
    quizReport {
      totalQuestionCount
      correctQuestionCount
      inCorrectQuestionCount
      unansweredQuestionCount
      masteryLevel
    }
    learningObjectiveReport{
      totalQuestionCount
      correctQuestionCount
      inCorrectQuestionCount
      unansweredQuestionCount
      learningObjective{
        id
      }
    }
  }
  }`)
  return get(data, 'data.userQuizReports', [])
}

export const getPercentage = (num, deno) => {
  if (num <= deno && num > 0) {
    return (num / deno) * 100
  }
  return 0
}

export const fetchTopicLevelAssignmentQuiz = async (topicId, isAssignment, isHomeworkAssignment, isQuiz, isPractice) => {
  const data = await requestToGraphql(gql`{
  topic(id: "${topicId}") {
    id
    courses{
      id
    }
    ${isAssignment ? `topicAssignmentQuestions {
      assignmentQuestion {
        id
        statement
        questionCodeSnippet
        answerCodeSnippet
        editorMode
        isHomework
        status
        initialCode
      }
      order
    }` : ''}
    ${isHomeworkAssignment ? `topicHomeworkAssignmentQuestion {
      assignmentQuestion {
        id
        statement
        questionCodeSnippet
        answerCodeSnippet
        editorMode
        isHomework
        status
        initialCode
      }
    }` : ''}
    ${isQuiz ? `topicQuestions {
      order
      question {
        id
        status
        questionType
        difficulty
        assessmentType
        order
        questionLayoutType
        blockLayoutType
        statement
        hint
        learningObjectives {
          id
        }
        mcqOptions {
          isCorrect
          statement
          blocksJSON
          initialXML
          questionBankImage {
            id
            image {
              id
              uri
            }
          }
        }
        fibInputOptions {
          answers
          correctPosition
        }
        fibBlocksOptions {
          statement
          displayOrder
          correctPositions
        }
        explanation
        answerCodeSnippet
        questionCodeSnippet
        arrangeOptions {
          statement
          displayOrder
          correctPosition
          correctPositions
        }
      }
    }` : ''}
    ${isPractice ? `
    blockBasedProjects {
      id
      title
      projectCreationDescription
      answerFormat
      answerFormatDescription
      layout
      externalPlatformLink
      fileUploadFormats
    }
    topicComponentRule {
      componentName
      blockBasedProject {
        id
        title
        projectCreationDescription
        answerFormat
        answerFormatDescription
        layout
        externalPlatformLink
        fileUploadFormats
      }
    }` : ''}
  }
}`)
  return get(data, 'data.topic')
}

export const getMappedCourseForTopic = (courses = [], topic) => {
  let topicCourse = {
      id: '',
      title: '',
      thumbnailUri: ''
  }
  for (const course of courses) {
      const courseTopic = get(course, 'topics', []).find(topicData => get(topicData, 'typeId') === get(topic, 'id'))
      if (courseTopic) {
          topicCourse = {
              id: get(course, 'id'),
              title: get(course, 'title'),
              thumbnailUri: get(course, 'thumbnail.uri'),
              category: get(course, 'category'),
              defaultLoComponentRule: get(course, 'defaultLoComponentRule', []),
              codingLanguages: get(course, 'codingLanguages', [])
          }
          break;
      }
  }
  return topicCourse
}

export const getRevisionTopic = (coursePackageTopicRule, revisionTopicRule) => {
  let revisionTopicIndex = coursePackageTopicRule.findIndex(topicRule => get(topicRule, 'order') === get(revisionTopicRule, 'previousTopicOrder'))
  if (revisionTopicIndex !== -1) return coursePackageTopicRule[revisionTopicIndex]
  return null
}

export const getSessionDetailsForModal = (batchSession, batchDetail, topicRule, topicOrder, sessionStatus, isEndingSession = false) => {
  let bookingDate = get(batchSession, 'bookingDate') || null
  let { startTime, endTime } = getTimeRangeFromSession(bookingDate, batchSession)
  const classroomClasses = { classroom: { classes: get(batchDetail, 'classes', []) } }
  const topicTitle = get(topicRule, 'topic.title')
  if (!batchSession) {
    bookingDate = ''
    startTime = ''
    endTime = ''
  }
  const sessionDetails = {
    id: get(batchSession, 'id') || get(topicRule, 'topic.id'),
    start: startTime,
    end: endTime,
    title: topicTitle,
    isBatchSessionPresent: Boolean(batchSession),
    isStartingSession: sessionStatus === 'upComingSession',
    isRetakeSession: get(batchSession, 'isRetakeSession'),
    groupName: get(batchDetail, 'groupName'),
    extendedProps: {
      title: topicTitle,
      order: topicOrder,
      topic: get(topicRule, 'topic'),
      sessionStartedByMentorAt: get(batchSession, 'sessionStartedByMentorAt') || null,
      grades: getGradesOrSections(classroomClasses, 'grades'),
      sections: getGradesOrSections(classroomClasses, 'sections'),
      course: get(topicRule, 'course'),
      topicComponentRule: get(topicRule, 'topic.topicComponentRule', []),
      bookingDate,
      sessionMode: 'online',
      sessionStatus: get(batchSession, 'sessionStatus') || 'allotted',
      sessionRecordingLink: get(batchSession, 'sessionRecordingLink') || '',
      documentType: 'batchSession',
      classroom: batchDetail,
      totalStudents: get(batchSession, 'attendance', []).length,
      attendance: get(batchSession, 'attendance', []),
      previousTopic: null,
      sessionType: 'learning',
      sessionOtp: get(batchSession, 'schoolSessionsOtp[0].otp') || '',
      thumbnail: get(topicRule, 'topic.thumbnailSmall.uri'),
      startMinutes: get(batchSession, 'startMinutes') || 0,
      endMinutes: get(batchSession, 'endMinutes') || 0,
      sessionStartTime: get(batchSession, 'sessionStartDate') || '',
      sessionEndTime: get(batchSession, 'sessionEndDate') || '',
      classType: get(topicRule, 'topic.classType'),
      retakeSessions: get(batchSession, 'retakeSessions', []),
      classroomTitle: get(batchDetail, 'classroomTitle',''),
      referenceContent: get(batchSession, 'topicData.referenceContent'),
      contentStatus: get(batchSession, 'topicData.contentStatus'),
    }
  }
  if (sessionStatus === 'completed') {
    let sessionOtp = get(sessionDetails, 'extendedProps.sessionOtp');
    if (isEndingSession) sessionOtp = null
    Object.assign(sessionDetails.extendedProps, {
      sessionStatus,
      sessionOtp
    })
  }
  if (get(batchSession, 'isRetakeSession') && get(batchSession, 'sessionStatus') === 'completed') {
    Object.assign(sessionDetails.extendedProps, {
      sessionStatus: sessionStatus === 'upComingSession' ? 'allotted' : 'started',
    })
  }
  return sessionDetails
}


export const getCourseLanguage = (course) => {
  if ((get(course, 'codingLanguages', []) || []).length) {
    const codingLanguagesValue = (get(course, 'codingLanguages', []) || [])
      .map(language => get(language, 'value', '').toLowerCase())
    const language = get(codingLanguagesValue, 0).toLowerCase()
    if (language === 'javascript') return 'markup'
    return language
  }
  return ''
}

export const getTopicsOfCourse = (course, coursePackageTopicRule = []) => {
  const courseTopics = get(course, 'topicsData', []).map(topic => get(topic, 'id'))
  const selectedCourseTopics = []
  coursePackageTopicRule.forEach(topicRule => {
      if (courseTopics.includes(get(topicRule, 'topic.id'))) {
          selectedCourseTopics.push(topicRule)
      }
  })
  return selectedCourseTopics
}

export const sortBatches = (batches = []) => {
  const sortedBatches = batches.sort((firstItem, secondItem) => {
    let firstItemGrade = get(firstItem, 'classes[0].grade', '').replace('Grade', '')
    let secondItemGrade = get(secondItem, 'classes[0].grade', '').replace('Grade', '')
    const firstItemSection = get(firstItem, 'classes[0].section')
    const secondItemSection = get(secondItem, 'classes[0].section')
    firstItemGrade = Number(firstItemGrade)
    secondItemGrade = Number(secondItemGrade)
    const firstItemSectionIndex = sections.findIndex(section => section === firstItemSection)
    const secondItemSectionIndex = sections.findIndex(section => section === secondItemSection)
    return firstItemGrade === secondItemGrade ? firstItemSectionIndex - secondItemSectionIndex : firstItemGrade - secondItemGrade
  })
  return sortedBatches
}

export const padWithZero=(num=0)=>{
    if(num.toString().length===1) return `0${num}`
    return num
}

export const filterNullValues=(obj)=>{
  const quesCopy={}
  for(let key in obj){
    if(obj[key]!==null){
      quesCopy[key]=obj[key]
    }
  }
  return quesCopy
}

export const calculateClassworkTotalSubmission = (classworkSummaryReportData, blockBasedSummaryReportData) => {
  const { practiceQuestionOverallReport } = classworkSummaryReportData
  const { coding, blockBasedPractice } = blockBasedSummaryReportData
  let practicePercentage = 0
  let practicesCount = 0
  practiceQuestionOverallReport && practiceQuestionOverallReport.length && practiceQuestionOverallReport.forEach(item => {
    if (get(item, 'submittedPercentage')) {
      practicePercentage += get(item, 'submittedPercentage')
      practicesCount += 1
    }
  })
  if (get(coding, 'submittedPercentage')) {
    practicePercentage += get(coding, 'submittedPercentage')
    practicesCount += 1
  }
  if (blockBasedPractice && blockBasedPractice.length) {
    blockBasedPractice.forEach(item => {
      if (get(item, 'submittedPercentage')) {
        practicePercentage += Number(get(item, 'submittedPercentage'))
        practicesCount += 1
      }
    })
  }
  if (practicePercentage && practicesCount) {
    let overallAvgPercentage = (practicePercentage / practicesCount).toFixed()
    if (!isNaN(overallAvgPercentage)) {
      return overallAvgPercentage
    }
  }
  return 0
}

export const calculateHomeworkTotalSubmission = (homeworkSummaryReportData) => {
  const { coding, quiz, blockBasedPractice } = homeworkSummaryReportData
  let practicePercentage = 0
  let practicesCount = 0
  if (get(coding, 'submittedPercentage')) {
    practicePercentage += get(coding, 'submittedPercentage')
    practicesCount += 1
  }
  if (get(quiz, 'submittedPercentage')) {
    practicePercentage += get(quiz, 'submittedPercentage')
    practicesCount += 1
  }
  if (blockBasedPractice && blockBasedPractice.length) {
    blockBasedPractice.forEach(item => {
      if (get(item, 'submittedPercentage')) {
        practicePercentage += get(item, 'submittedPercentage')
        practicesCount += 1
      }
    })
  }
  if (practicePercentage && practicesCount) {
    let overallAvgPercentage = (practicePercentage / practicesCount).toFixed()
    if (!isNaN(overallAvgPercentage)) {
        return overallAvgPercentage
    }
  }
  return 0
}

export const evaluationTypes={
    CODING_ASSIGNMENT:'codingAssignment',
    HW_ASSIGNMENT:'hwAssignment',
    PRACTICE: 'practice',
    HW_PRACTICE: 'hwPractice',
}

export const PUBLISHED_STATUS = 'published'
export const UNPUBLISHED_STATUS = 'unpublished'