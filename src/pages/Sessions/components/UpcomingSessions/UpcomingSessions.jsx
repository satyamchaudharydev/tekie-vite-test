import React, { Component } from 'react'
import cx from 'classnames'
import styles from './UpcomingSessions.module.scss'
import SessionCard from '../SessionCard'
import { NextIcon } from '../../../../components/Buttons/NextButton'
import AnimateVisible from '../../../../components/AnimateVisible'
import { slotBookMessage } from '../../../../constants/sessions/messages'
import SessionCardSkeleton from '../../components/SessionCardSkeleton'

class UpcomingSessions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showHiddenUpcomingSessions: false,
            showInfo: false,
            nextState: 'expand',
            width: window.innerWidth
        }
    }

    componentDidMount() {
        window.addEventListener('resize', () => {
            const { innerWidth } = window
            if (this.state.width !== innerWidth) {
                this.setState({
                    width: innerWidth
                })
            }
        })
        document.addEventListener('mouseover', this.toggleShowInfoOption, false)
    }

    componentWillUnmount() {
        document.removeEventListener('mouseover', this.toggleShowInfoOption, false)
    }

    showHiddenUpcomingSessions = () => {
        if (this.state.nextState === 'expand') {
            this.setState({
                showHiddenUpcomingSessions: true,
                nextState: 'collapse'
            })
        } else if (this.state.nextState === 'collapse') {
            this.setState({
                showHiddenUpcomingSessions: false,
                nextState: 'expand'
            })
        }
    }

    renderExpandableSection = () => (
        <div className={cx(styles.expandableContainer,
            this.state.showHiddenUpcomingSessions
                ? styles.fadeOut
                : styles.fadeIn
        )}
        >
            <div className={
                cx(styles.expandButtonContainer,
                    this.state.showHiddenUpcomingSessions
                        ? styles.hideDisplay
                        : styles.blockDisplay)
            }
                onClick={this.showHiddenUpcomingSessions}
            >
                <div className={styles.expandIconContainer}>
                    <NextIcon />
                </div>
            </div>
        </div>
    )

    renderEachRowSessions = (sessions, isLastRow, isCompletedSession, isBookedSession, count) => {
        return sessions.map((session, index) => (
            <SessionCard
                id={session.id}
                isLastRow={isLastRow}
                isLastCard={index % count === count - 1}
                {...session}
                isActive={false}
                isBookedSession={isBookedSession}
                showBookPopup={(topicTitle, topicId) => this.props.showBookPopup(topicId, topicTitle)}
                showEditPopup={(id, topicId, topicTitle, bookingDate, slotTime) => this.props.showEditPopup(id, topicId, topicTitle, bookingDate, slotTime)}
                showBookingNotAllowedToastr={this.props.showBookingNotAllowedInfo}
                isCompletedSession={isCompletedSession}
                handleSessionRevisit={(topicId) => this.props.handleSessionRevisit(topicId)}
            />
        ))
    }

    renderSessions = (sessions, isLastRow = false,
        noBookedSessions = false, isBookedSession = false, isCompletedSession = false) => {
        let sessionsToRender = []
        if (isBookedSession && noBookedSessions) {
            sessionsToRender = sessions.slice(1, sessions.length)
        } else {
            sessionsToRender = sessions
        }
        const count = this.state.width < 1300 ? 5 : 3
        const rowWiseSessions = []
        let _sessions = []
        let index = 0
        while (index < sessionsToRender.length) {
            for (let i = index; i < index + count; i += 1) {
                if (i < sessionsToRender.length) {
                    _sessions.push(sessionsToRender[i])
                } else {
                    break
                }
            }
            rowWiseSessions.push(_sessions)
            _sessions = []
            index += count
        }
        return rowWiseSessions.map(_sessionsList => (
            <div className={styles.sessionsContainer}>
                <div className={styles.sessionCardsContainer}>
                    {
                        this.renderEachRowSessions(_sessionsList, isLastRow, isCompletedSession, isBookedSession, count)
                    }
                </div>
            </div>
        ))
    }

    renderUpcomingSessions = () => {
        const { upComingSessions, noUpcomingSession } = this.props
        if (!noUpcomingSession && upComingSessions && upComingSessions.length > 6) {
            const firstVisibleRowSessionCards = upComingSessions.slice(0, 3)
            const lastVisibleRowSessionCards = upComingSessions.slice(3, 6)
            return (
                <div>
                    <div className={styles.sessionCardsContainer}>
                        {
                            this.renderSessions(firstVisibleRowSessionCards)
                        }
                        {
                            this.renderExpandableSection()
                        }
                        {
                            this.renderSessions(lastVisibleRowSessionCards, true)
                        }
                        {
                            this.renderHiddenSession(upComingSessions)
                        }
                    </div>
                </div>
            )
        } else {
            return (<div className={styles.sessionCardsContainer}>
                {
                    this.renderSessions(upComingSessions, false, false)
                }
            </div>
            )
        }
    }

    renderHiddenSession = (upcomingSessions) => {
        const hiddenSessions = upcomingSessions.slice(6, upcomingSessions.length)
        return <AnimateVisible
            visible={this.state.showHiddenUpcomingSessions}
            transition={
                this.state.showHiddenUpcomingSessions
                    ? '0.6s ease-in-out'
                    : '0.3s ease-in-out'
            }
        >
            <div className={styles.sessionCardsContainer}>
                {
                    this.renderSessions(hiddenSessions)
                }
            </div>
            <div className={styles.collapsableContainer}>
                <div
                    className={styles.collapseButtonContainer}
                    onClick={this.showHiddenUpcomingSessions}
                >
                    <div className={styles.expandIconContainer}>
                    </div>
                </div>
            </div>
        </AnimateVisible>
    }

    shouldShowUpComingSessions = () => {
        const { upComingSessions } = this.props
        if (upComingSessions && upComingSessions.length > 0) {
            return true
        }

        return false
    }

    toggleShowInfoOption = (e) => {
        if (this.node && this.node.contains(e.target)) {
            const currOption = this.state.showInfo
            this.setState({
                showInfo: !currOption
            })
        } else {
            this.setState({
                showInfo: false
            })
        }
    }

    renderSessionToBook = (isRenderingUpComingSessions) => {
        const { notBookedSessions, noBookedSession } = this.props
        if (notBookedSessions && notBookedSessions.length > 0) {
            return (
                <div style={{ paddingBottom: '40px' }}>
                    <div className={styles.titleWrapper}>
                        <div className={styles.title}>Book a session</div>
                        <div className={styles.infoIconContainer}
                            ref={node => this.node = node}
                        />
                        <div className={
                            cx(
                                styles.overlayContainer,
                                this.state.showInfo
                                    ? styles.fadeInInfo
                                    : styles.fadeOut
                            )
                        }>
                            <div className={styles.arrowDown} />
                            <div className={styles.infoContainer}>
                                <div className={styles.infoText}>
                                    {slotBookMessage}
                                </div>
                            </div>
                        </div>
                    </div>
                    {
                        this.renderSessions(notBookedSessions, false,
                            noBookedSession, true)
                    }
                </div>
            )
        }

        return <div />
    }

    getLoaderTitleResponsivePos = () => {
        if (this.state.width < 550) {
            return '15px'
        } else if (this.state.width >= 550 && this.state.width < 800) {
            return '24px'
        } else if (this.state.width >= 800 && this.state.width < 950) {
            return '35px'
        } else if (this.state.width >= 950 && this.state.width < 1000) {
            return '43px'
        } else if (this.state.width > 1200) {
            return '28px'
        }
    }

    getLoaderTopPosition = () => {
        if (this.state.width <= 550)
            return '-40px'
        else if (550 < this.state.width <= 800)
            return '-50px'
        else if (800 < this.state.width <= 1000)
            return '-80px'
        else
            return '-90px'
    }

    render() {
        return (
            <div>
                {
                    this.props.isLoading
                        ? (
                            <div className={styles.sessionsContainer}>
                                <div style={{ marginTop: `${this.getLoaderTitleResponsivePos()}`, marginLeft: '4px', position: 'relative' }} className={styles.title}>Book a Session</div>
                                <div className={styles.sessionCardsContainer} style={{ position: 'relative', top: `${this.getLoaderTopPosition()}` }}>
                                    {
                                        [...Array(3)].map((_, index) => (
                                            <SessionCardSkeleton
                                                cardNumber={index}
                                            />
                                        ))
                                    }
                                </div>
                            </div>
                        )
                        : <div />
                }
                {
                    !this.props.isLoading && this.shouldShowUpComingSessions()
                        ?
                        <div className={styles.sessionsContainer}>
                            <div className={styles.title}>Upcoming Sessions</div>
                            {
                                this.renderUpcomingSessions()
                            }
                        </div>
                        : <div />
                }
                {
                    !this.props.isLoading && this.renderSessionToBook()
                }
            </div>
        )
    }
}

UpcomingSessions.defaultProps = {
    upComingSession: []
}

export default UpcomingSessions
