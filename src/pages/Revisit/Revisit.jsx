import React, { Component } from 'react'
import { get } from 'lodash'
import styles from '../Sessions/components/UpcomingSessions/UpcomingSessions.module.scss'
import SessionCard from '../Sessions/components/SessionCard'
import fetchMenteeCourseSyllabus from '../../queries/sessions/fetchMenteeCourseSyllabus'
import { uhohMessage, takeSessionMsg } from '../../constants/sessions/messages';
import fetchMentorMenteeSession from '../../queries/sessions/fetchMentorMenteeSession';
import SessionCardSkeleton from '../Sessions/components/SessionCardSkeleton';
import ChatWidget from '../../components/ChatWidget'
import fetchStudentCurrentStatus from '../../queries/fetchStudentCurrentStatus'
import renderChats from '../../utils/getChatTags'

class Revisit extends Component {
    async componentDidMount() {
        const { loggedInUser } = this.props
        const menteeId = loggedInUser ? get(loggedInUser.toJS(), 'id') : ''
        fetchMenteeCourseSyllabus()
        fetchMentorMenteeSession(
            null,
            null,
            menteeId,
            'menteeCompletedFilter',
            null,
            true,
            null,
            null
        ).call()
        await fetchStudentCurrentStatus(menteeId)
        if (window && window.fcWidget) {
            window.fcWidget.show()
        }
    }

    componentDidUpdate = () => {
        const { isLoggedIn, studentCurrentStatus, loggedInUserChat } = this.props
        if (window && window.fcWidget) {
            window.fcWidget.on("widget:opened",() => {
                renderChats({
                    isLoggedIn,
                    studentCurrentStatus,
                    loggedInUser: loggedInUserChat
                })
            })
        }
    }

    componentWillUnmount = () => {
        if (window && window.fcWidget) {
            window.fcWidget.setFaqTags({
                tags: ['unregistered'],
                filterType: 'article'
            })
            window.fcWidget.hide()
        }
    } 
    
    sortAscending = (data, path) => {
        return data.sort((a, b) => {
            return a[path] - b[path]
        })
    }

    getCompletedSessions = (sessions) => {
        if (sessions) {
            return this.sortAscending(sessions.toJS(), ['order'])
        }

        return []
    }

    handleRevisit = (topicId) => {
        this.props.history.push(`/revisit/sessions/video/${topicId}`, {
            revisitingSession: true
        })
    }

    renderSessionRow = (sessions, isLastRow = false) => {
        return sessions.map((session, index) => {
            return (
                <SessionCard
                    id={session.id}
                    isLastRow={isLastRow}
                    isLastCard={index % 3 === 2}
                    {...session}
                    isActive
                    isBookedSession={false}
                    isCompletedSession={true}
                    handleSessionRevisit={(topicId) => this.handleRevisit(topicId)}
                    loggedInUser={this.props.loggedInUser}
                    bookingDate={get(session, 'sessionBookingDate')}
                />
            )
        })
    }

    renderSessions = (sessions, isLastRow = false) => {
        const groupedSessionsArr = []
        let groupedSessions = []
        sessions.forEach((_s, index) => {
            groupedSessions.push(_s)
            if (index % 3 == 2) {
                groupedSessionsArr.push(groupedSessions)
                groupedSessions = []
            } else if (index === sessions.length - 1) {
                groupedSessionsArr.push(groupedSessions)
            }
        })

        return groupedSessionsArr.map(_grSessions => (
            <div className={styles.sessionRowContainer}>
                {this.renderSessionRow(_grSessions, isLastRow)}
            </div>
        ))
    }

    render () {
        const { mentorMenteeSession, mentorMenteeSessionStatus } = this.props
        const completedSessions = this.getCompletedSessions(mentorMenteeSession)
        if (mentorMenteeSessionStatus && mentorMenteeSessionStatus.getIn(['loading'])) {
            return (
                <div style={{ display: 'flex', flexDirection: 'row', width: '100vw', justifyContent: 'center' }}>
                    <ChatWidget />
                    {
                        [...Array(3)].map((_,index) => (
                            <SessionCardSkeleton
                                seperateTopMargin
                                cardNumber={index}
                            />
                        ))
                    }
                </div>
            )
        } else if (
            !(mentorMenteeSessionStatus && mentorMenteeSessionStatus.getIn(['loading'])) &&
            completedSessions && completedSessions.length > 0
        ) {
            return (
                <div className={styles.mainContainer}>
                    <ChatWidget />
                    <div className={styles.revisitSessionsContainer}>
                        <div className={styles.revisitSessionCardsContainer}>
                            {
                                this.renderSessions(completedSessions, false)
                            }
                        </div>
                    </div>
                </div>
            )
        }
        return (
            <div className={styles.mainContainer}>
                <ChatWidget />
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <div className={styles.uhohMsgContainer}>
                        { uhohMessage }
                    </div>
                    <div className={styles.emptyMsgContainer}>
                        { takeSessionMsg }
                    </div>
                </div>
            </div>
        )
    }
}

export default Revisit
