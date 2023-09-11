import React, { Component } from 'react'
import cx from 'classnames'
import { withRouter } from 'react-router-dom'
import { get } from 'lodash'
import './SideNavBar.scss'
import fetchTopicJourney from '../../queries/fetchTopicJourney'
import { ReactComponent as NavBarClouds } from './navbarClouds.svg'
import { ReactComponent as Arrow } from '../../assets/arrow.svg'
import SideNavItem from './components/SideNavItem'
import AnimateVisible from '../AnimateVisible'
import { sort } from '../../utils/immutable'
import { motion } from 'framer-motion'
import { NextButton } from '../../components/Buttons/NextButton'
import updateMentorMenteeSession from '../../queries/sessions/updateMentorMenteeSession'
import duck from '../../duck'
import SubmitOverlayMenu from '../../pages/Quiz/components/SubmitOverlayMenu'
import { getPrevTopicId } from '../../utils/getPrevTopicId'
import BadgeModal from '../../pages/Achievements/BadgeModal'
import { filterKey } from '../../utils/data-utils'
import fetchStudentProfile from "../../queries/fetchStudentProfile";
import fetchBadge from '../../queries/fetchBadge'
import withScale from '../../utils/withScale'
import isFeatureEnabled from '../../utils/isFeatureEnabled'
import { getActiveBatchDetail } from '../../utils/multipleBatch-utils'


const arrowLeft =  {
  rest: {
    x: 0,
    opacity: 1,
    transition: {
        duration: 0.1,
    }
  },
  hover: {
    x: -4,
    opacity: 0.6,
    transition: {
      duration: 0.5,
    }
  }
}
const text =  {
  rest: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    }
  },
  hover: {
    x: 1,
    opacity: 0.6,
    transition: {
      duration: 0.1,
    }
  }
}

class SideNavBar extends Component {
  state = {
    dropdown: '',
    closedDropdown: '',
    showSubmitOverlay: false,
    reviewSubmitClicked: false,
    showBadgeOverlay: false,
    badge: null
  }

  openDropdown(dropdown) {
    if (this.state.dropdown === dropdown) {
      this.setState({
        closedDropdown: this.state.dropdown,
        dropdown: '',
      })
      return
    }

    this.setState({
      closedDropdown: this.state.dropdown,
      dropdown
    })
  }

  async componentDidMount() {
    const { computedMatch, parent } = this.props
    const { params } = computedMatch
    if (parent === 'homework') {
        this.setState({
            dropdown: 'homework'
        })
    } else if (
        computedMatch.path === '/sessions/quiz-report-latest/:topicId' ||
        computedMatch.path === '/sessions/see-answers-latest/:topicId' ||
        computedMatch.path === '/sessions/codingAssignment/:topicId'
    ) {
        this.setState({
            dropdown: 'discussion'
        })
    } else if (parent === 'settings') {
    } else {
        this.openDefaultDropdown()
    }
    fetchTopicJourney(params.topicId).call()
      if (!this.props.accountProfileSuccess) {
          await fetchStudentProfile(this.props.loggedInUser && this.props.loggedInUser.toJS() && this.props.loggedInUser.toJS().id)
      }
  }

  closeBadgeModal = () => {
    this.setState({
        isBadgeModalVisible: false
    })
  }

  componentDidUpdate(prevProps, prevState) {
    const {
        computedMatch, parent, mentorMenteeSessionUpdateStatus, mentorMenteeSession,
        unlockBadgeStatus, unlockBadge
    } = this.props
    const { params } = computedMatch
    const { topicId } = this.props.computedMatch.params
    const { courseId } = this.props.computedMatch.params
    const courseIdString = courseId ? '/:courseId' : ''
    if (parent === 'homework' && this.state.dropdown !== 'homework') {
        this.setState({
            dropdown: 'homework'
        })
    }
    if (parent === 'settings') {
        return
    }
    if (params.topicId !== prevProps.computedMatch.params.topicId) {
      fetchTopicJourney(params.topicId).call()
      this.setState({ dropdown: '' })
    }
    if (params.loId !== prevProps.computedMatch.params.loId) {
      this.openDefaultDropdown()
    };

    if (mentorMenteeSessionUpdateStatus && prevProps.mentorMenteeSessionUpdateStatus) {
        if (
            mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${topicId}`, 'success']) &&
            !prevProps.mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${topicId}`, 'success'])
        ) {
            if (mentorMenteeSession && (this.state.reviewSubmitClicked || this.state.showSubmitOverlay)) {
                const modifiedSession = mentorMenteeSession.toJS()
                const { computedMatch: {path, params: { topicId }  } } = this.props
                modifiedSession.forEach((session, index) => {
                    if (session && session.topicId === topicId) {
                        session.isSubmittedForReview = true
                        modifiedSession[index] = session
                    }
                })
                duck.merge(() => ({
                    mentorMenteeSession: modifiedSession
                }))
                //TODO: Handle this in badge next
                 if (path === `/homework${courseIdString}/:topicId/quiz` || path === `/homework${courseIdString}/:topicId/codingAssignment`)
                    this.props.history.push('/sessions')
            } else if (
                mentorMenteeSession &&
                mentorMenteeSession.getIn([0, 'isQuizSubmitted']) &&
                mentorMenteeSession.getIn([0, 'isAssignmentSubmitted'])
            ) {
                this.setState({
                    showSubmitOverlay: true
                })
            }
        }
    }

    if (unlockBadgeStatus && prevProps.unlockBadgeStatus) {
        if (
            unlockBadgeStatus.getIn([`unlockBadge/quiz/${topicId}`, 'success']) &&
            !prevProps.unlockBadgeStatus.getIn([`unlockBadge/quiz/${topicId}`, 'success'])
        ) {
            if (unlockBadge && unlockBadge.size) {
                const badgeJS = unlockBadge.toJS()
                this.setState({
                    showBadgeOverlay: true,
                    badge: badgeJS[0].badge
                })
            }
        }
    }

    if (this.props.computedMatch && prevProps.computedMatch) {
        if (this.props.computedMatch.path !== prevProps.computedMatch.path) {
            if (this.state.showBadgeOverlay) {
                this.setState({
                    showBadgeOverlay: false
                })
            }
        }
    }
  }

  openDefaultDropdown = () => {
    const { computedMatch } = this.props
    const { params } = computedMatch
    if (params.loId) {
      this.setState({ dropdown: params.loId })
    } else if (computedMatch.path === '/quiz/:topicId' ||
        computedMatch.path === '/sessions/quiz/:topicId') {
        this.setState({ dropdown: '' })
      } else if (this.isQuizReportActive(computedMatch)) {
        this.setState({ dropdown: 'quiz' })
    } else {
        this.setState({ dropdown: '' })
    }
  }

  getTransition(dropdown) {
    if (this.state.closedDropdown === '') {
      return '0.3s max-height ease-in-out'
    }

    if (dropdown === this.state.dropdown) {
      return '0.6s max-height ease-in-out 0.2s'
    } else if (dropdown === this.state.closedDropdown) {
      return '0.4s max-height ease-in-out'
    }
    return '0.3s max-height ease-in-out'

  }

  isLOActiveItem = (computedMatch, learningObjective, parent) => {
    if (parent === 'sessions') {
      return (
          ((computedMatch.path === '/sessions/chat/:topicId/:loId') ||
              (computedMatch.path === '/sessions/practice/:topicId/:loId') ||
              (computedMatch.path === '/sessions/practice-report/:topicId/:loId') ||
              (computedMatch.path === '/revisit/sessions/practice-report/:topicId/:loId') ||
              (computedMatch.path === '/revisit/sessions/chat/:topicId/:loId') ||
              (computedMatch.path === '/revisit/sessions/practice-report/:topicId/:loId')) &&
               computedMatch.params.loId === learningObjective.get('id')
      )

    }
      return (
          ((computedMatch.path === '/chat/:topicId/:loId') ||
              (computedMatch.path === '/practice/:topicId/:loId') ||
              (computedMatch.path === '/practice-report/:topicId/:loId')) &&
               computedMatch.params.loId === learningObjective.get('id')
      )
  }

  isQuizReportActive = (computedMatch, parent) => {
    if(parent === 'sessions') {
      return (
          computedMatch.path === '/sessions/quiz-report-latest/:topicId' ||
          computedMatch.path === '/sessions/quiz-report-first/:topicId'
        )
    }

      return (
        computedMatch.path === '/quiz-report-latest/:topicId' ||
        computedMatch.path === '/quiz-report-first/:topicId'
      )
    }

    isSeeAnswersActive = (computedMatch, parent) => {
        if(parent === 'sessions') {
          return (
              computedMatch.path === '/sessions/see-answers-first/:topicId' ||
              computedMatch.path === '/sessions/see-answers-latest/:topicId'
            )
        }

          return (
            computedMatch.path === '/see-answers-first/:topicId' ||
            computedMatch.path === '/see-answers-latest/:topicId'
          )
  }

  renderSideNav = () => {
      const { computedMatch } = this.props
      const { topicId } = computedMatch.params
      const sortedTopic = this.props.topic && (sort.ascend(this.props.topic, ['order'])).toJS()
      const sortedLO = this.props.learningObjective && sort.ascend(this.props.learningObjective, ['order'])
      const firstTopicId = sortedTopic && sortedTopic[0] ? (sortedTopic[0]).id : ''
      const prevTopicId = getPrevTopicId(
          this.props.topic && (sort.ascend(this.props.topic, ['order'])).toJS(),
          topicId
      ) || ''
      
      const { studentProfile } = this.props
      const batchDetail = getActiveBatchDetail(studentProfile && (get(studentProfile.toJS(), 'batch') || get(studentProfile.toJS(), '0.batch')))
      const isBatch = studentProfile
        ? get(batchDetail, 'id') &&
            (
                get(batchDetail, 'type') === 'b2b' ||
                get(batchDetail, 'type') === 'b2b2c'
            )
        : false
      return (
          <div>
              {
                  (
                      this.props.parent === 'sessions' && !this.props.revisitRoute &&
                      topicId !== firstTopicId
                  ) ?
                      <SideNavItem
                          title='Discussion'
                          isOpen={
                              this.state.dropdown === 'discussion' &&
                              (
                                  computedMatch.path === '/sessions/see-answers-latest/:topicId' ||
                                  computedMatch.path === '/sessions/quiz-report-latest/:topicId' ||
                                  computedMatch.path === '/sessions/codingAssignment/:topicId'
                              )
                          }
                          type='dropdownParent'
                          active={
                              computedMatch.path === '/sessions/see-answers-latest/:topicId' ||
                              computedMatch.path === '/sessions/quiz-report-latest/:topicId' ||
                              computedMatch.path === '/sessions/codingAssignment/:topicId'
                          }
                          isUnlocked={
                              !this.props.revisitRoute
                                  ? sort.ascend(this.props.learningObjective, ['order']).getIn([0, 'isUnlocked'])
                                  : true
                          }
                          isLocked={
                              !this.props.revisitRoute
                                  ? !this.props.userTopicJourney.getIn([0, 'video', 'isUnlocked'], true)
                                  : false
                          }
                          onClick={() => {
                            if (this.state.dropdown === '') {
                                this.setState({ dropdown: 'discussion' })
                            } else {
                                this.setState({ dropdown: '' })
                            }
                            this.props.history.push(`/sessions/quiz-report-latest/${topicId}`, {
                                quizReportTopicId: prevTopicId
                            })
                          }}
                      >
                          <AnimateVisible
                              visible={
                                  this.state.dropdown === 'discussion' &&
                                  (
                                      computedMatch.path === '/sessions/see-answers-latest/:topicId' ||
                                      computedMatch.path === '/sessions/quiz-report-latest/:topicId' ||
                                      computedMatch.path === '/sessions/codingAssignment/:topicId'
                                  )
                              }
                              transition={this.getTransition('discussion')}
                          >
                              <SideNavItem
                                  type='dropdownChild'
                                  active={this.props.computedMatch.path === '/sessions/quiz-report-latest/:topicId'}
                                  title='Quiz Report'
                                  isUnlocked={
                                      !this.props.revisitRoute
                                          ? sort.ascend(this.props.learningObjective, ['order']).getIn([0, 'isUnlocked'])
                                          : true
                                  }
                                  isLocked={
                                      !this.props.revisitRoute
                                          ? !this.props.userTopicJourney.getIn([0, 'video', 'isUnlocked'], true)
                                          : false
                                  }
                                  onClick={() => {
                                      this.props.history.push(`/sessions/quiz-report-latest/${topicId}`,{
                                          quizReportTopicId: prevTopicId
                                      })
                                  }}
                              />
                              <SideNavItem
                                  type='dropdownChild'
                                  title='Quiz Answers'
                                  isUnlocked={
                                      !this.props.revisitRoute
                                          ? sort.ascend(this.props.learningObjective, ['order']).getIn([0, 'isUnlocked'])
                                          : true
                                  }
                                  isLocked={
                                      !this.props.revisitRoute
                                          ? !this.props.userTopicJourney.getIn([0, 'video', 'isUnlocked'], true)
                                          : false
                                  }
                                  active={this.props.computedMatch.path === '/sessions/see-answers-latest/:topicId'}
                                  onClick={() => {
                                      this.props.history.push(`/sessions/see-answers-latest/${topicId}`, {
                                          quizReportTopicId: prevTopicId
                                      })
                                  }}
                              />
                              <SideNavItem
                                  type='dropdownChild'
                                  isUnlocked={
                                    !this.props.revisitRoute
                                        ? sort.ascend(this.props.learningObjective, ['order']).getIn([0, 'isUnlocked'])
                                        : true
                                  }
                                  isLocked={
                                    !this.props.revisitRoute
                                      ? !this.props.userTopicJourney.getIn([0, 'video', 'isUnlocked'], true)
                                      : false
                                  }
                                  title='Coding Assignment'
                                  active={computedMatch.path === '/sessions/codingAssignment/:topicId'}
                                  onClick={() => {
                                      this.props.history.push(`/sessions/codingAssignment/${topicId}`,
                                          {
                                              prevTopicId: prevTopicId
                                          })
                                  }}
                              />
                          </AnimateVisible>
                      </SideNavItem>
                      : <div />
              }
              <SideNavItem
                  title='Video'
                  active={computedMatch.path === '/video/:topicId' ||
                  computedMatch.path === '/sessions/video/:topicId' ||
                  computedMatch.path === '/revisit/sessions/video/:topicId'}
                  isUnlocked={this.props.userTopicJourney.getIn([0, 'video', 'isUnlocked'], true) && sort.ascend(this.props.learningObjective, ['order']).getIn([0, 'isUnlocked'])}
                  isLocked={!this.props.userTopicJourney.getIn([0, 'video', 'isUnlocked'], true)}
                  onClick={() => {
                    if (this.props.userTopicJourney.getIn([0, 'video', 'isUnlocked'], true)) {
                      this.setState({ dropdown: '' })
                      this.props.parent === 'sessions' ?
                          (
                              !this.props.revisitRoute
                                  ? this.props.history.push(`/sessions/video/${topicId}`)
                                  : this.props.history.push(`/revisit/sessions/video/${topicId}`)
                          ) :
                          this.props.history.push(`/video/${topicId}`)
                    }
                  }}
              />
              {		
                   this.props.parent === 'sessions' && !this.props.revisitRoute ?		
                       <SideNavItem		
                           title='Video Discussion'		
                           active={computedMatch.path === '/sessions/video/:topicId/discussion'}		
                           isUnlocked={		
                               sort.ascend(this.props.learningObjective, ['order']).getIn([0, 'isUnlocked']) &&		
                               this.props.learningObjective && this.props.learningObjective.toJS().length > 0 &&		
                               (this.props.learningObjective.toJS()[0])['isUnlocked'] === true		
                           }		
                           isLocked={(this.props.learningObjective.getIn([0, 'isUnlocked'], false) === false)}		
                           onClick={() => {		
                               if (this.props.userTopicJourney.getIn([0, 'video', 'isUnlocked'], true)) {		
                                   this.setState({ dropdown: '' })		
                                   this.props.history.push(`/sessions/video/${topicId}/discussion`)		
                               }		
                           }}		
                       /> :		
                       <div />		
               }
              {sort.ascend(this.props.learningObjective, ['order'])
                    .map(learningObjective => (
                  <>
                      <SideNavItem
                          isOpen={this.state.dropdown === learningObjective.get('id')}
                          isUnlocked={learningObjective.get('practiceQuestionStatus') !== 'incomplete'}
                          isLocked={!learningObjective.get('isUnlocked', true)}
                          title={learningObjective.get('title')}
                          active={this.isLOActiveItem(computedMatch, learningObjective)}
                          type='dropdownParent'
                          onClick={() => {
                            if (learningObjective.get('isUnlocked', true)) {
                              this.openDropdown(learningObjective.get('id'))
                            }
                          }}
                      >
                          <AnimateVisible
                              visible={this.state.dropdown === learningObjective.get('id')}
                              transition={this.getTransition(learningObjective.get('id'))}
                          >
                              <SideNavItem
                                  type='dropdownChild'
                                  isUnlocked={learningObjective.get('chatStatus') !== 'incomplete'}
                                  isLocked={!learningObjective.get('isUnlocked', true)}
                                  active={
                                      (computedMatch.path === '/chat/:topicId/:loId' &&
                                          computedMatch.params.loId === learningObjective.get('id')) ||
                                      (computedMatch.path === '/sessions/chat/:topicId/:loId' &&
                                          computedMatch.params.loId === learningObjective.get('id')) ||
                                      (computedMatch.path === '/revisit/sessions/chat/:topicId/:loId' &&
                                          computedMatch.params.loId === learningObjective.get('id'))
                                  }
                                  title='Chat'
                                  onClick={() => {
                                    if (learningObjective.get('isUnlocked', true)) {
                                      this.props.parent === 'sessions' ?
                                          (
                                              !this.props.revisitRoute
                                                  ? this.props.history.push(`/sessions/chat/${topicId}/${learningObjective.get('id')}`)
                                                  : this.props.history.push(`/revisit/sessions/chat/${topicId}/${learningObjective.get('id')}`)
                                          ) :
                                          this.props.history.push(`/chat/${topicId}/${learningObjective.get('id')}`)
                                    }
                                  }}
                              />
                              <SideNavItem
                                  type='dropdownChild'
                                  isUnlocked={learningObjective.get('practiceQuestionStatus') === 'complete'}
                                  isLocked={!learningObjective.get('isUnlocked', true)}
                                  title='Practice'
                                  active={
                                      (computedMatch.path === '/practice/:topicId/:loId' &&
                                          computedMatch.params.loId === learningObjective.get('id')) ||
                                      (computedMatch.path === '/sessions/practice/:topicId/:loId' &&
                                          computedMatch.params.loId === learningObjective.get('id')) ||
                                      (computedMatch.path === '/revisit/sessions/practice/:topicId/:loId' &&
                                          computedMatch.params.loId === learningObjective.get('id'))
                                  }
                                  onClick={() => {
                                    if (learningObjective.get('isUnlocked', true)) {
                                      this.props.parent === 'sessions' ?
                                          (
                                              !this.props.revisitRoute
                                                  ? this.props.history.push(`/sessions/practice/${topicId}/${learningObjective.get('id')}`)
                                                  : this.props.history.push(`/revisit/sessions/practice/${topicId}/${learningObjective.get('id')}`)
                                          ) :
                                          this.props.history.push(`/practice/${topicId}/${learningObjective.get('id')}`)
                                    }
                                  }}
                              />
                              <SideNavItem
                                  type='dropdownChild'
                                  isUnlocked={learningObjective.get('practiceQuestionStatus') === 'complete'}
                                  isLocked={learningObjective.get('practiceQuestionStatus') !== 'complete'}
                                  title='Report'
                                  active={
                                      (computedMatch.path === '/practice-report/:topicId/:loId' &&
                                          computedMatch.params.loId === learningObjective.get('id')) ||
                                      (computedMatch.path === '/sessions/practice-report/:topicId/:loId' &&
                                          computedMatch.params.loId === learningObjective.get('id')) ||
                                      (computedMatch.path === '/revisit/sessions/practice-report/:topicId/:loId' &&
                                          computedMatch.params.loId === learningObjective.get('id'))
                                  }
                                  onClick={() => {
                                    if (learningObjective.get('practiceQuestionStatus') === 'complete') {
                                      this.props.parent === 'sessions' ?
                                          (
                                              !this.props.revisitRoute
                                                  ? this.props.history.push(`/sessions/practice-report/${topicId}/${learningObjective.get('id')}`)
                                                  : this.props.history.push(`/revisit/sessions/practice-report/${topicId}/${learningObjective.get('id')}`)
                                          ) :
                                          this.props.history.push(`/practice-report/${topicId}/${learningObjective.get('id')}`)
                                    }
                                  }}
                              />
                          </AnimateVisible>
                      </SideNavItem>
                  </>
              ))}
              {
                  (
                      this.props.parent !== 'sessions' &&
                          !this.props.revisitRoute
                  )
                      ? (
                        <SideNavItem
                            // type='dropdownParent'
                            isUnlocked
                            title='Coding Assignment'
                            active={computedMatch.path === '/codingAssignment/:topicId'}
                            onClick={() => {
                                this.props.history.push(`/codingAssignment/${topicId}`,
                                    {
                                        prevTopicId: prevTopicId
                                    })
                            }}
                        />
                      ) :
                      <div />
              }
              {
                  (
                      this.props.parent !== 'sessions' &&
                          !this.props.revisitRoute
                  )
                      ? (
                        <SideNavItem
                            // type='dropdownParent'
                            isUnlocked
                            title='Homework Assignment'
                            active={computedMatch.path === '/homework-assignment/:topicId/'}
                            onClick={() => {
                                this.props.history.push(`/homework-assignment/${topicId}`,
                                    {
                                        prevTopicId: prevTopicId
                                    })
                            }}
                        />
                      ) :
                      <div />
              }
              {
                  (
                      this.props.parent !== 'sessions' &&
                          !this.props.revisitRoute
                  )
                      ? (
                          <SideNavItem
                              title='Quiz'
                              active={computedMatch.path === '/quiz/:topicId' ||
                              computedMatch.path === '/sessions/quiz/:topicId'}
                              isUnlocked={this.props.userTopicJourney.getIn([0, 'quiz', 'status']) === 'complete'}
                              isLocked={!this.props.userTopicJourney.getIn([0, 'quiz', 'isUnlocked'], true)}
                              onClick={() => {
                                if (this.props.userTopicJourney.getIn([0, 'quiz', 'isUnlocked'], true)) {
                                  this.setState({ dropdown: '' })
                                  this.props.parent === 'sessions' ?
                                      this.props.history.push(`/sessions/quiz/${topicId}`) :
                                      this.props.history.push(`/quiz/${topicId}`)
                                }
                              }}
                          />
                      ) :
                      <div />
              }
              {
                  (
                      this.props.parent !== 'sessions' &&
                      !this.props.revisitRoute
                  )
                      ? (
                          <SideNavItem
                              type='dropdownParent'
                              title='Quiz Report'
                              active={this.isQuizReportActive(computedMatch, this.props.parent)}
                              isOpen={this.state.dropdown === 'quiz'}
                              isUnlocked={this.props.userTopicJourney.getIn([0, 'quiz', 'status']) === 'complete'}
                              isLocked={!(this.props.userTopicJourney.getIn([0, 'quiz', 'status']) === 'complete')}
                              onClick={() => {
                                if (this.props.userTopicJourney.getIn([0, 'quiz', 'status']) === 'complete') {
                                  this.openDropdown('quiz')
                                }
                              }}
                          >
                              <AnimateVisible
                                  visible={this.state.dropdown === 'quiz'}
                                  transition={this.getTransition('quiz')}
                              >
                                  <SideNavItem
                                      type='dropdownChild'
                                      visible={this.state.dropdown === 'quiz'}
                                      active={
                                          computedMatch.path === '/quiz-report-latest/:topicId' ||
                                          computedMatch.path === '/sessions/quiz-report-latest/:topicId'
                                      }
                                      isUnlocked={this.props.userTopicJourney.getIn([0, 'quiz', 'status']) === 'complete'}
                                      isLocked={!(this.props.userTopicJourney.getIn([0, 'quiz', 'status']) === 'complete')}
                                      title='Latest Report'
                                      onClick={() => {
                                        if (this.props.userTopicJourney.getIn([0, 'quiz', 'status']) === 'complete') {
                                          this.props.parent === 'sessions' ?
                                              this.props.history.push(`/sessions/quiz-report-latest/${topicId}/`) :
                                              this.props.history.push(`/quiz-report-latest/${topicId}/`)
                                        }
                                      }}
                                  />
                                  <SideNavItem
                                      type='dropdownChild'
                                      visible={this.state.dropdown === 'quiz'}
                                      active={
                                          computedMatch.path === '/quiz-report-first/:topicId' ||
                                          computedMatch.path === '/sessions/quiz-report-first/:topicId'
                                      }
                                      isUnlocked={this.props.userTopicJourney.getIn([0, 'quiz', 'status']) === 'complete'}
                                      isLocked={!(this.props.userTopicJourney.getIn([0, 'quiz', 'status']) === 'complete')}
                                      title='First Report'
                                      onClick={() => {
                                        if (this.props.userTopicJourney.getIn([0, 'quiz', 'status']) === 'complete') {
                                          this.props.parent === 'sessions' ?
                                              this.props.history.push(`/sessions/quiz-report-first/${topicId}/`) :
                                              this.props.history.push(`/quiz-report-first/${topicId}/`)
                                        }
                                      }}
                                  />
                              </AnimateVisible>
                          </SideNavItem>
                      ) :
                      <div />
              }
              {
                  (
                      this.props.parent !== 'sessions' &&
                      !this.props.revisitRoute
                  )
                      ? (
                          <SideNavItem
                              type='dropdownParent'
                              title='See Answers'
                              active={this.isSeeAnswersActive(computedMatch, this.props.parent)}
                              isOpen={this.state.dropdown === 'see-answers'}
                              isUnlocked={this.props.userTopicJourney.getIn([0, 'quiz', 'status']) === 'complete'}
                              isLocked={!(this.props.userTopicJourney.getIn([0, 'quiz', 'status']) === 'complete')}
                              onClick={() => {
                                if (this.props.userTopicJourney.getIn([0, 'quiz', 'status']) === 'complete') {
                                  this.openDropdown('see-answers')
                                }
                              }}
                          >
                              <AnimateVisible
                                  visible={this.state.dropdown === 'see-answers'}
                                  transition={this.getTransition('see-answers')}
                              >
                                  <SideNavItem
                                      type='dropdownChild'
                                      visible={this.state.dropdown === 'see-answers'}
                                      active={
                                          computedMatch.path === '/see-answers-latest/:topicId' ||
                                          computedMatch.path === '/sessions/see-answers-latest/:topicId'
                                      }
                                      isUnlocked={this.props.userTopicJourney.getIn([0, 'quiz', 'status']) === 'complete'}
                                      isLocked={!(this.props.userTopicJourney.getIn([0, 'quiz', 'status']) === 'complete')}
                                      title='Latest Quiz Answers'
                                      onClick={() => {
                                        if (this.props.userTopicJourney.getIn([0, 'quiz', 'status']) === 'complete') {
                                          this.props.parent === 'sessions' ?
                                              this.props.history.push(`/sessions/see-answers-latest/${topicId}/`) :
                                              this.props.history.push(`/see-answers-latest/${topicId}/`)
                                        }
                                      }}
                                  />
                                  <SideNavItem
                                      type='dropdownChild'
                                      visible={this.state.dropdown === 'quiz'}
                                      active={
                                          computedMatch.path === '/see-answers-first/:topicId' ||
                                          computedMatch.path === '/sessions/see-answers-first/:topicId'
                                      }
                                      isUnlocked={this.props.userTopicJourney.getIn([0, 'quiz', 'status']) === 'complete'}
                                      isLocked={!(this.props.userTopicJourney.getIn([0, 'quiz', 'status']) === 'complete')}
                                      title='First Quiz Answers'
                                      onClick={() => {
                                        if (this.props.userTopicJourney.getIn([0, 'quiz', 'status']) === 'complete') {
                                          this.props.parent === 'sessions' ?
                                              this.props.history.push(`/sessions/see-answers-first/${topicId}/`) :
                                              this.props.history.push(`/see-answers-first/${topicId}/`)
                                        }
                                      }}
                                  />
                              </AnimateVisible>
                          </SideNavItem>
                      ) :
                      <div />
              }
              {
                  (
                      this.props.parent === 'sessions' ||
                      this.props.revisitRoute
                  )
                      ? (
                          <SideNavItem
                              title='Coding'
                              active={
                                  computedMatch.path === '/sessions/coding/:topicId' ||
                                  computedMatch.path === '/revisit/sessions/coding/:topicId'
                              }
                              isUnlocked={
                                  isBatch
                                    ? true
                                    : sortedLO && sortedLO.toJS()[sortedLO.toJS().length - 1] &&
                                  (sortedLO.toJS()[sortedLO.toJS().length - 1])['practiceQuestionStatus'] === 'complete'
                              }
                              isLocked={
                                  isBatch
                                    ? false
                                    : sortedLO && sortedLO.toJS()[sortedLO.toJS().length - 1] &&
                                  (sortedLO.toJS()[sortedLO.toJS().length - 1])['practiceQuestionStatus'] !== 'complete'
                              }
                              onClick={() => {
                                  if (
                                      isBatch ||
                                      (sortedLO && sortedLO.toJS()[sortedLO.toJS().length - 1] &&
                                      (sortedLO.toJS()[sortedLO.toJS().length - 1])['practiceQuestionStatus'] === 'complete')
                                  ) {
                                    this.setState({ dropdown: '' })
                                      !this.props.revisitRoute
                                          ? this.props.history.push(`/sessions/coding/${topicId}`)
                                          : this.props.history.push(`/revisit/sessions/coding/${topicId}`)
                                  }
                              }}
                          />
                      ) :
                      <div />
              }

              {
                  this.props.revisitRoute
                      ? this.renderHomeworkSideNav()
                      : <div />
              }
          </div>
      )
  }

  submitForReview = async () => {
      const { mentorMenteeSession, computedMatch, unlockBadge } = this.props
      const shouldSubmit = mentorMenteeSession && mentorMenteeSession.getIn([0, 'isAssignmentSubmitted']) &&
          mentorMenteeSession.getIn([0, 'isQuizSubmitted'])
      const topicId = computedMatch.params.topicId
      const badgeInCache = unlockBadge &&
        filterKey(unlockBadge, `unlockBadge/quiz/${topicId}`)
      if (shouldSubmit) {
          const sessionId = mentorMenteeSession.getIn([0, 'id'])
          const input = {
              isSubmittedForReview: true
          }
          if(badgeInCache){
            const badgeToJS  = badgeInCache.toJS()
            if (badgeToJS && badgeToJS.length) {
                this.setState({
                  showBadgeOverlay: true,
                  badge: badgeToJS[0].badge
                })
            }
          } else if (badgeInCache && !badgeInCache.size) {
              //directly assigning the destructured variables to local variables
              await fetchBadge(topicId, 'video', true).call()
          }
          updateMentorMenteeSession(sessionId, input, topicId, true).call()
      }
  }

  showSubmitOverlay = () => {
      this.setState({
          reviewSubmitClicked: true
      })
  }

  closeOverlay = () => {
      this.setState({
          reviewSubmitClicked: false,
          showSubmitOverlay: false
      })
  }

  renderHomeworkSideNavContent = (computedMatch, topicId, shouldShowSubmitButton, courseId = null) => {
      const { mentorMenteeSession } = this.props
      const isSubmittedForReview = mentorMenteeSession && mentorMenteeSession.getIn([0, 'isSubmittedForReview'])
      const courseIdString = courseId ? '/:courseId' : ''
      const courseIdVal = courseId ? `/${courseId}` : ''
      return (
          <div>
              <SideNavItem
                  type='dropdownChild'
                  isUnlocked={mentorMenteeSession && mentorMenteeSession.getIn([0, 'isQuizSubmitted'])}
                  active={
                      computedMatch.path === `/homework${courseIdString}/:topicId/quiz` ||
                      computedMatch.path === `/revisit/homework${courseIdString}/:topicId/quiz`
                  }
                  title='Quiz'
                  onClick={() => {
                      !this.props.revisitRoute
                          ? this.props.history.push(`/homework${courseIdVal}/${topicId}/quiz`)
                          : this.props.history.push(`/revisit/homework${courseIdVal}/${topicId}/quiz`)
                  }}
              />
              <SideNavItem
                  type='dropdownChild'
                  title='Coding'
                  isUnlocked={mentorMenteeSession && mentorMenteeSession.getIn([0, 'isAssignmentSubmitted'])}
                  active={
                      computedMatch.path === `/homework${courseIdString}/:topicId/codingAssignment` ||
                      computedMatch.path === `/revisit/homework${courseIdString}/:topicId/codingAssignment`
                  }
                  onClick={() => {
                      !this.props.revisitRoute
                          ? this.props.history.push(`/homework${courseIdVal}/${topicId}/codingAssignment`)
                          : this.props.history.push(`/revisit/homework${courseIdVal}/${topicId}/codingAssignment`)
                  }}
              />
              {
                  shouldShowSubmitButton
                      ? (
                          <div className={
                              cx(
                                  'side-navbar-buttonContainer',
                                  isSubmittedForReview
                                      ? 'side-navbar-disabled'
                                      : ''
                              )
                          }>
                              <div
                                  onClick={
                                      !isSubmittedForReview && this.showSubmitOverlay
                                  }
                              >
                                  <NextButton
                                      title='Submit for Review'
                                      showTick={isSubmittedForReview}
                                  />
                              </div>
                          </div>
                      ) :
                      (
                          <div />
                      )
              }
          </div>
      )
  }

  renderHomeworkSideNav = () => {
      const { computedMatch } = this.props
      const { topicId, courseId } = computedMatch.params
      const courseIdString = courseId ? '/:courseId' : ''
      const courseIdVal = courseId ? `/${courseId}` : ''
      if (
          computedMatch &&
          (
              computedMatch.path === `/homework${courseIdString}/:topicId/quiz` ||
              computedMatch.path === `/homework${courseIdString}/:topicId/codingAssignment`
          )
      ) {
          return (
              <div>
                  {
                      this.renderHomeworkSideNavContent(computedMatch, topicId, true, courseId)
                  }
              </div>
          )
      }
      return (
          <div>
              <SideNavItem
                  isOpen={this.state.dropdown === 'homework'}
                  isUnlocked
                  title='Homework'
                  active={
                      (computedMatch === `/homework${courseIdString}/:topicId/quiz` ||
                          computedMatch === `/homework${courseIdString}/:topicId/codingAssignment`) ||
                      (computedMatch === `/revisit/homework${courseIdString}/:topicId/quiz` ||
                          computedMatch === `/revisit/homework${courseIdString}/:topicId/codingAssignment`)
                  }
                  type='dropdownParent'
                  onClick={() => {
                      const isActive = (computedMatch === `/homework${courseIdString}/:topicId/quiz` ||
                          computedMatch === `/homework${courseIdString}/:topicId/codingAssignment`) ||
                          (computedMatch === `/revisit/homework${courseIdString}/:topicId/quiz` ||
                              computedMatch === `/revisit/homework${courseIdString}/:topicId/codingAssignment`)
                      if (!isActive) {
                          !this.props.revisitRoute
                              ? this.props.history.push(`/homework${courseIdVal}/${topicId}/quiz`)
                              : this.props.history.push(`/revisit/homework${courseIdVal}/${topicId}/quiz`)
                      }
                      this.openDropdown('homework')
                  }}
              >
                  <AnimateVisible
                      visible={this.state.dropdown === 'homework'}
                      transition={this.getTransition('homework')}
                  >
                      {
                          this.renderHomeworkSideNavContent(computedMatch, topicId, false, courseId)
                      }
                  </AnimateVisible>
              </SideNavItem>
          </div>
      )
  }

  renderSettingsSideNav=()=>{
    const {computedMatch:{path,params}, profile} = this.props
    const inviteCode = profile && profile.toJS() && profile.toJS().inviteCode
    const studentProfile = profile && profile.toJS() && get(profile.toJS(), 'studentProfile');
    const referralFeature = isFeatureEnabled('referralFeature')
    return(
      <div className={'side-navbar-settingsSidebar'}>
        <SideNavItem title="Account" hideStatusIcon
          active={path === '/settings/account'}
          onClick={()=>{
            this.props.history.push('/settings/account')
          }}
        >
          </SideNavItem>
        <SideNavItem title="Journey Report" hideStatusIcon
          active={path === '/settings/journeyreport'}
          onClick={()=>{
            this.props.history.push('/settings/journeyreport')
          }}
        >
        </SideNavItem>
        {!get(studentProfile, 'school.id') && (
            <SideNavItem
            isOpen={this.state.dropdown === 'achievements'}
            hideStatusIcon
            title='Achievements'
            active={(path === '/settings/achievements/characters' ||
                        path === '/settings/achievements/equipments')}
            type='dropdownParent'
            onClick={() => {
                const isActive = (path === '/settings/achievements/characters' ||
                path === '/settings/achievements/equipments')
                if (!isActive) {
                    this.props.history.push(`/settings/achievements/characters`)
                }
                this.openDropdown('achievements')
            }}
        >
            <AnimateVisible
                visible={this.state.dropdown === 'achievements'}
                transition={this.getTransition('achievements')}
            >
                <SideNavItem
                    type='dropdownChild'
                    isUnlocked
                    hideStatusIcon
                    active={path === '/settings/achievements/:type' && params.type === 'characters'}
                    title='Characters'
                    onClick={() => {this.props.history.push('/settings/achievements/characters')}}
                />
                <SideNavItem
                    type='dropdownChild'
                    isUnlocked
                    hideStatusIcon
                    title='Equipments'
                    active={path === '/settings/achievements/:type' && params.type === 'equipments'}
                    onClick={() => {this.props.history.push('/settings/achievements/equipments')}}
                />
            </AnimateVisible>
            </SideNavItem>
        )}
          {referralFeature && (
            <>
              {inviteCode &&
              <>
                  <div className={'side-navbar-emptyDiv'}>
                  </div>
                  <SideNavItem title="Gift & Earn" hideStatusIcon
                              active={path === '/settings/invite'}
                              onClick={()=>{
                                  this.props.history.push('/settings/invite')
                              }}
                  >
                  </SideNavItem>
              </>
              }
              {inviteCode &&
                  <SideNavItem title="My Credits" hideStatusIcon
                              active={path === '/settings/myReferrals'}
                              onClick={()=>{
                                  window.location.href = '/settings/myReferrals'
                                  // this.props.history.to('/settings/myReferrals')
                              }}
                  >
                  </SideNavItem>
              }
            </>
          )}
          <div className={'side-navbar-emptyDiv'}>
          </div>
        <SideNavItem title="Support" hideStatusIcon
          active={path === '/settings/support'}
          onClick={()=>{
            this.props.history.push('/settings/support')
          }}
        >
        </SideNavItem>
      </div>
    )
  }

  getSubmitOverlayMsg = () => {
      const { mentorMenteeSession, computedMatch } = this.props
      if (mentorMenteeSession) {
          if (!mentorMenteeSession.getIn([0, 'isQuizSubmitted']) && this.state.reviewSubmitClicked) {
              return 'Complete quiz before submitting!'
          } else if (!mentorMenteeSession.getIn([0, 'isAssignmentSubmitted']) && this.state.reviewSubmitClicked) {
              return 'Complete coding assignment before submitting!'
          } else  {
              if (this.state.reviewSubmitClicked) {
                  return 'Are you sure you want to submit the homework for review?'
              } else if (this.state.showSubmitOverlay) {
                  return <span>Homework completed! You can submit it for review now.<br/><i>(Note: Once submitted, you cannot change the answers)</i></span>
              }
          }
      }
  }
  handleBadgeNextAction = () => {
    this.setState({
      showBadgeOverlay: false
    })
    const { computedMatch: {path} } = this.props
    if (path === '/homework/:topicId/quiz' || path === '/homework/:topicId/codingAssignment' || path === '/homework/:courseId/:topicId/quiz' || path === '/homework/:courseId/:topicId/codingAssignment')
      this.props.history.push('/sessions')
  }

  closeBadgeModal = () => {
      this.setState({
          isBadgeModalVisible: false
      })
  }

  render() {
    const breakPoint = 900
    const isDesktop = window.innerWidth > breakPoint

    const {computedMatch:{path}, mentorMenteeSessionUpdateStatus} = this.props
      const { topicId } = this.props.computedMatch.params
    const isLoading = mentorMenteeSessionUpdateStatus && mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${topicId}`, 'loading'])
    const isSettingsPage = path.match('settings')
    const topicTitle = this.props.userTopicJourney.getIn([0, 'quiz', 'title'], '')

    const badgeInCache = this.props.unlockBadge &&
        filterKey(this.props.unlockBadge, `unlockBadge/quiz/${this.props.computedMatch.params.topicId}`)
    const badgeToJS = badgeInCache.toJS()

    if (isSettingsPage && !isDesktop) return <></>
    return (
      <div className={'side-navbar-container'}>
        <div className={'side-navbar-navBarCloudsContainer'}>
          <NavBarClouds />
        </div>
        {
          !isSettingsPage && (
            <React.Fragment>
              <motion.div className={'side-navbar-topicTitleContainer'} whileHover="hover" animate="rest" initial="rest" onClick={() => {
                if (this.props.userRole !== 'mentee') {
                  this.props.history.push('/learn')
                } else {
                    if (
                        this.props.computedMatch && this.props.computedMatch.path &&
                        (this.props.computedMatch.path.startsWith('/homework/:topicId') || 
                        this.props.computedMatch.path.startsWith('/homework/:courseId/:topicId'))
                    ) {
                        this.props.history.push('/homework')
                    } else {
                        this.props.history.push('/sessions')
                    }
                }
              }}>
                <motion.div className={'side-navbar-backArrow'} variants={arrowLeft}>
                  <Arrow className={'side-navbar-backIcon'} />
                </motion.div>
                <motion.div className={'side-navbar-topicTitle'} variants={text}>
                  {topicTitle}
                </motion.div>
              </motion.div>
                {
                    (
                        this.props.parent !== 'homework' ||
                            this.props.revisitRoute
                    )
                        ? this.renderSideNav()
                        : this.renderHomeworkSideNav()
                }
            </React.Fragment>
          )
        }
        {
          isSettingsPage && this.renderSettingsSideNav()
        }
{/*        {
          isSettingsPage && (
            <div className={'side-navbar-logoutButton'}>
              <LogoutButton title='Logout'/>
            </div>
          )
        }*/}
        {
            this.props.parent === 'homework'
                ? (
                    <SubmitOverlayMenu
                        title='Submit for Review'
                        visible={this.state.showSubmitOverlay || this.state.reviewSubmitClicked}
                        onQuizSubmit={this.onQuizSubmit}
                        message={this.getSubmitOverlayMsg()}
                        closeOverlay={this.closeOverlay}
                        isLoading={isLoading}
                        submitForReviewOverlay={true}
                        closeImmediately={true}
                        onSubmitForReview={this.submitForReview}
                        disabled={
                            !this.props.mentorMenteeSession.getIn([0, 'isQuizSubmitted']) ||
                            !this.props.mentorMenteeSession.getIn([0, 'isAssignmentSubmitted'])
                        }
                    />
                ) :
                (
                    <div />
                )
        }
        {this.state.showBadgeOverlay &&
          <BadgeModal closeModal={this.closeBadgeModal} shouldAnimate
            unlockBadge={this.state.badge}
            handleNext= {this.handleBadgeNextAction}
          />
        }
      </div>
    )
  }
}

export default withScale(withRouter(SideNavBar), {})
