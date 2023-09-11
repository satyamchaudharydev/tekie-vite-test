/* eslint-disable */
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { get, sortBy } from 'lodash'
import {hs} from '../../utils/size'
import { motion } from 'framer-motion'
import { filterKey } from '../../utils/data-utils'
import isMobile from '../../utils/isMobile'
import { getActiveBatchDetail } from '../../utils/multipleBatch-utils'

const variantsLeftAligned = {
    overlaySmall: {
        rest: {
            width: `${hs(160)}px`,
            height: `${hs(160)}px`,
            marginTop: `calc(100vh - ${hs(160)}px`,
            fontSize: `${hs(22)}px`
        },
        hover: {
            width: `${hs(170)}px`,
            height: `${hs(170)}px`,
            borderTopRightRadius: `${hs(170)}px`,
            marginTop: `calc(100vh - ${hs(170)}px`,
            fontSize: `${hs(24)}px`,
            cursor: 'pointer'
        }
    }
}

const variantsRightAligned = {
    overlaySmall: {
        rest: {
            width: `${hs(160)}px`,
            height: `${hs(160)}px`,
            marginTop: `calc(100vh - ${hs(160)}px`,
            fontSize: `${hs(22)}px`
        },
        hover: {
            width: `${hs(170)}px`,
            height: `${hs(170)}px`,
            borderTopLeftRadius: `${hs(170)}px`,
            marginTop: `calc(100vh - ${hs(170)}px`,
            marginLeft: `calc(100vw - ${hs(170)}px`,
            fontSize: `${hs(24)}px`,
            cursor: 'pointer'
        }
    }
}

class GlobalOverlay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            prevRoute: ''
        }
    }
    routeBack = (route) => {
        if (route) {
            this.props.history.push(route)
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', () => {
            if (typeof localStorage !== 'undefined') {
                if (this.state.prevRoute !== localStorage.getItem('prevRoute')) {
                    this.setState({
                        prevRoute: localStorage.getItem('prevRoute')
                    })
                }
            }
        })
    }

    getCurrentTopicComponentId = () => {
        const { menteeCourseSyllabus } = this.props
        let currentTopicComponentId
        if (menteeCourseSyllabus) {
            const bookedSession = get(menteeCourseSyllabus.toJS(), '0.bookedSession')
            const upcomingSessions = get(menteeCourseSyllabus.toJS(), '0.upComingSession')
            if (bookedSession && bookedSession.length) {
                currentTopicComponentId = get(bookedSession, '0.topicId')
            } else if (upcomingSessions && upcomingSessions.length) {
                currentTopicComponentId = get(upcomingSessions, '0.topicId')
            }
        }

        return currentTopicComponentId
    }

    render() {
        const {
            studentProfile,
            batchSession,
            mentorMenteeSessionWithMenteeTopicFilter,
            mentorMenteeSessionAddedForCurrTopic
        } = this.props
        const prevRoute = typeof localStorage === 'undefined' ? '/' :  localStorage.getItem('prevRoute') || this.state.prevRoute
        let currSession
        if (this.props.mentorMenteeSession) {
            this.props.mentorMenteeSession.toJS().forEach(session => {
                if (
                    get(session, 'topicId') === this.getCurrentTopicComponentId() ||
                    get(session, 'topic.id') === this.getCurrentTopicComponentId()
                ) {
                    currSession = session
                }
            })
        }
        const currSessionStatus = get(currSession, 'sessionStatus')
        const currTopicId = get(currSession, 'topicId')
        const currBatchSession = filterKey(batchSession, `batchSession/${currTopicId}`)
        const batchDetail = getActiveBatchDetail(studentProfile && get(studentProfile.toJS(), '0.batch'))
        const isBatch = studentProfile
                            ? get(batchDetail, 'id') &&
                                (
                                    get(batchDetail, 'type') === 'b2b' ||
                                    get(batchDetail, 'type') === 'b2b2c'
                                )
                            : false
        if (
            (
                (this.props.mentor && this.props.mentor.getIn(['id'])) ||
                (
                    isBatch && currBatchSession &&
                    get(currBatchSession.toJS(), '0.sessionStatus') === 'started' &&
                    this.getCurrentTopicComponentId() === currTopicId
                ) ||
                (
                    mentorMenteeSessionWithMenteeTopicFilter &&
                    get(mentorMenteeSessionWithMenteeTopicFilter.toJS(), '0.sessionStatus') === 'started' &&
                    this.getCurrentTopicComponentId() === get(mentorMenteeSessionWithMenteeTopicFilter.toJS(), '0.topic.id')
                ) ||
                (
                    mentorMenteeSessionAddedForCurrTopic &&
                    get(mentorMenteeSessionAddedForCurrTopic.toJS(), '0.sessionStatus') === 'started' &&
                    this.getCurrentTopicComponentId() === get(mentorMenteeSessionAddedForCurrTopic.toJS(), '0.topic.id')
                )
            ) &&
            (currSessionStatus === 'started') &&
            (prevRoute && prevRoute.length > 0)
        ) {
            return <div />;
            return (
                <div>
                    {
                        get(this.props, 'location.pathname') && !get(this.props, 'location.pathname').includes('/code-playground') &&
                        get(this.props, 'location.pathname') !== '/my-code' &&
                        !get(this.props, 'location.pathname').startsWith('/homework/')
                            ? (
                                <motion.div
                                    style={{
                                        width: `${hs(250)}px`,
                                        height: `${hs(250)}px`,
                                        borderTopRightRadius: `${hs(250)}px`,
                                        marginTop: `calc(100vh - ${hs(250)}px`,
                                        backgroundColor: 'rgba(0, 173, 230, 0.9)',
                                        position: 'fixed',
                                        zIndex: '999',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                />
                            )
                            : (
                              <div />
                            )
                    }
                    {!isMobile() && (
                        <>
                         {get(this.props, 'location.pathname') && 
                         (get(this.props, 'location.pathname').includes('/code-playground') || get(this.props, 'location.pathname') === '/my-code')
                            ? (
                                <motion.div
                                    style={{
                                        backgroundColor: 'rgba(0, 173, 230, 0.9)',
                                        position: 'fixed',
                                        zIndex: '9999',
                                        display: 'flex',
                                        border: '6px solid rgba(242, 242, 247, 0.7)',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        paddingLeft: `${hs(8)}px`,
                                        paddingTop: `${hs(16)}px`,
                                        marginLeft: `calc(100vw - ${hs(160)}px`,
                                        borderTopLeftRadius: `${hs(160)}px`,
                                        color: '#fff',
                                        fontWeight: 'bold'
                                    }}
                                    variants={variantsRightAligned.overlaySmall}
                                    initial='rest'
                                    whileHover='hover'
                                    onClick={() => this.routeBack(prevRoute)}
                                >
                                    <div style={{ position: 'relative', left: `${hs(30)}px`, top: `${hs(7)}px` }} >Go back to Session</div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 1)',
                                        position: 'fixed',
                                        zIndex: '9999',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingLeft: `${hs(7)}px`,
                                        paddingTop: `${hs(16)}px`,
                                        borderTopRightRadius: `${hs(160)}px`,
                                        color: '#00ade6',
                                        fontWeight: 'bold'
                                    }}
                                    variants={variantsLeftAligned.overlaySmall}
                                    initial='rest'
                                    whileHover='hover'
                                    onClick={() => this.routeBack(prevRoute)}
                                >
                                    Go back to Session
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            )
        }

        return <div />
    }
}

export default withRouter(GlobalOverlay)
