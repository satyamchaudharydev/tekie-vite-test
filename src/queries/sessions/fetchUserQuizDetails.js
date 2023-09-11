import gql from 'graphql-tag'
import { PYTHON_COURSE, PYTHON_COURSE_BACKEND } from '../../config'
import duck from '../../duck'

import getCourseId, { getCourseName } from '../../utils/getCourseId'

const FETCH_USER_DETAILS = (userId) => gql`
query {
  userHomeworkStreaks: userCourses(filter:{
    and: [
      {user_some:{
        id: "${userId}"
      }},
      ${getCourseId() ? `{courses_some:{
        id: "${getCourseId()}"
      }}` : ''}
    ]
  }) {
    homeworkStreaks {
      course { id }
      mentorMenteeSession {
        isReviewSubmittedOnTime
      }
      createdAt
    }
    homeworkStreaksLog {
      course { id }
      mentorMenteeSession {
        isReviewSubmittedOnTime
        topic {
          title
        }
      }
      createdAt
    }
  }
  userProfiles(filter: { user_some: { id: "${userId}" } }) {
    totalTopicsMeta(filter:{courses_some:{id:"${getCourseId()}"}}){
      count
    }
    topicsCompleted
    proficientTopicCount
    masteredTopicCount
    proficientTopicsMeta(filter:{courses_some:{id:"${getCourseId()}"}}) {
      count
    }
    familiarTopicsMeta(filter:{courses_some:{id:"${getCourseId()}"}}) {
      count
    }
    masteredTopicsMeta(filter:{courses_some:{id:"${getCourseId()}"}}) {
      count
    }
  }
  userQuizReports(
    filter: {
      and:[
        {
          topic_some:{
            and: [
              {
                status:published
              }
              {
                courses_some: {
                  ${(getCourseName() !== PYTHON_COURSE) ? `id: "${getCourseId()}"` : `title: "${PYTHON_COURSE_BACKEND}"`}
                }
              }
            ]
          }
        }
        { user_some: { id: "${userId}" } }
      ]
    }
    orderBy: createdAt_DESC
  ) {
    id
    topic {
      id
      title
      courses {
        title
      }
    }
    course {
      title
    }
    createdAt
    quizReport {
      totalQuestionCount
      correctQuestionCount
      inCorrectQuestionCount
      unansweredQuestionCount
      masteryLevel
    }
  }
}
`

function fetchUserQuizDetails(sid) {
  return duck.query({
    query: FETCH_USER_DETAILS(sid),
    type: 'userQuizDetails/fetch',
    key: 'userQuizDetails',
  })
}

export default fetchUserQuizDetails
