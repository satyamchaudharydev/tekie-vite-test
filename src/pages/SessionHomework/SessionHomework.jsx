import React, { Component } from 'react'
import cx from 'classnames'
import styles from './SessionHomework.module.scss'
import { NextButton } from '../../components/Buttons/NextButton'
import updateMentorMenteeSession from '../../queries/sessions/updateMentorMenteeSession'
import duck from '../../duck'
import store from '../../store'
import { fromJS } from 'immutable'
import MentorFeedback from '../../components/MentorFeedback'
import fetchMenteeCourseSyllabus from '../../queries/sessions/fetchMenteeCourseSyllabus'
import fetchMentorFeedback from '../../queries/fetchMentorFeedback'
import { get } from 'lodash'
import CredentialsPopup from '../Signup/schoolLiveClassLogin/components/CredentialsPopup/CredentialsPopup'
import { checkIfEmbedEnabled } from '../../utils/teacherApp/checkForEmbed'
import goBackToTeacherApp from '../../utils/teacherApp/goBackToTeacherApp'
class SessionHomework extends Component {
    state = {
        showCredentialsModal: false,
    }
    componentDidMount() {
        let showCredentialModalStatus = localStorage.getItem('showCredentialsModal')
        if (showCredentialModalStatus) {
            this.setState({
                showCredentialModal: true
            })
        }
    }

    fetchFeedbackForm = () => {
        fetchMentorFeedback(this.props.mentorMenteeSession.getIn([0, 'id'])).call()
    }

    endSession = async () => {
        if (checkIfEmbedEnabled()) goBackToTeacherApp("endSession")
        const input = {
            sessionStatus: 'completed',
            endSessionByMentee: new Date()
        }
        const { topicId } = this.props.match.params
        this.fetchFeedbackForm()
        const res = await updateMentorMenteeSession(this.props.mentorMenteeSession.getIn([0, 'id']), input, topicId, true).call()
        if (res) {
            const { menteeCourseSyllabus, mentorMenteeSession } = this.props
            if (menteeCourseSyllabus.toJS()[0] && mentorMenteeSession) {
                const bookedSessions = menteeCourseSyllabus.toJS()[0].bookedSession
                let completedSessions = menteeCourseSyllabus.toJS()[0].completedSession
                bookedSessions.forEach((session, index) => {
                    if (session.topicId === mentorMenteeSession.getIn([0, 'topic', 'id'])) {
                        bookedSessions.splice(index, 1)
                        if (completedSessions) {
                            session.endingDate = session.bookingDate
                            completedSessions.push(session)
                        } else {
                            completedSessions = [session]
                        }
                    }
                })
                duck.merge(() => ({
                    menteeCourseSyllabus: {
                        bookedSession: bookedSessions,
                        completedSession: completedSessions
                    }
                }))
                store.dispatch({
                    type: 'user/delete/success',
                    payload: fromJS({
                        extractedData: {
                            user: {
                                id: this.props.mentor && this.props.mentor.getIn(['id'])
                            }
                        }
                    }),
                    autoReducer: true
                })
                localStorage.setItem('prevRoute', '')
            }
        }
    }

    checkIfCourseCompleted = async () => {
        let menteeCourseSyllabus = this.props.menteeCourseSyllabus && this.props.menteeCourseSyllabus.toJS()
        if (menteeCourseSyllabus && !menteeCourseSyllabus.length) {
            await fetchMenteeCourseSyllabus()
        }
        if (this.props.menteeCourseSyllabus && this.props.menteeCourseSyllabus.toJS()) {
            const upcomingSessions = this.props.menteeCourseSyllabus.getIn([0, 'upComingSession']).toJS()
            if ((upcomingSessions && upcomingSessions.length < 1)) {
                return true
            }
        }
        return false
    }

    render() {
        return (
            <>
                <div className={styles.container}>
                    <div className={styles.bodyContainer}>
                        <div className={styles.videoDiscussionIconContainer} />
                        <div className={
                            cx(
                                styles.text,
                                styles.marginText
                            )
                        }>
                            Session completed!
                        </div>
                        <div className={styles.text}>
                            Click on End Session and go to the homework tab.
                        </div>
                    </div>
                    <div
                        className={styles.nextButtonContainer}
                        onClick={this.endSession}
                    >
                        <NextButton
                            title='End Session'
                            loading={(
                                this.props.mentorMenteeSessionUpdateStatus &&
                                this.props.mentorMenteeSessionUpdateStatus.getIn(['loading']) ||
                                this.props.mentorFeedbackStatus.get('loading')
                            )}
                        />
                    </div>
                    <MentorFeedback
                        sessionId={this.props.mentorMenteeSession.getIn([0, 'id'])}
                        postSubmit={async () => {
                            const isCompleted = await this.checkIfCourseCompleted()
                            let loginWithCode = this.props.loggedInUser && this.props.loggedInUser.toJS() && get(this.props.loggedInUser.toJS(), 'fromOtpScreen')
                            if (loginWithCode && !isCompleted) {
                                localStorage.setItem('showCredentialsModal', true)
                                this.setState({
                                    showCredentialModal: true
                                })
                                return
                            }
                            if (isCompleted) {
                                localStorage.setItem('showCourseCompletionCertificateModal', 'show')
                            }
                            this.props.history.push('/sessions')
                        }}
                    />
                </div>
                {this.state.showCredentialsModal && <CredentialsPopup email={get(this.props.loggedInUser.toJS(), 'email')} password={get(this.props.loggedInUser.toJS(), 'savedPassword')} onClickFn={() => {
                    this.props.dispatch({ type: 'LOGOUT' })
                }} />}
            </>
        )
    }
}

export default SessionHomework
