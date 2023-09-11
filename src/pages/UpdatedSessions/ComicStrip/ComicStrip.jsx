import React, { Component } from 'react'
import './ComicStrip.scss'
import 'swiper/swiper.scss';
import { get, sortBy } from 'lodash'
import { hsm } from '../../../utils/size'
import { Swiper, SwiperSlide } from 'swiper/react';
import fetchChatPractice from '../../../queries/fetchChatPractice'
import { fromJS, Map } from "immutable";
import SwiperCore, { Mousewheel } from 'swiper/core';
import { ImageBackground } from '../../../image';
import { sort } from '../../../utils/immutable'
import duck from '../../../duck'
import Skeleton from './skeleton'
import SkeletonMobile from '../../../components/QuestionTypes/Skeleton'
import { Button3D } from '../../../photon'
import dumpComicStrip from '../../../queries/dumpComicStrip'
import getPath from '../../../utils/getPath';
import { getFilteredLoComponentRule, getInSessionRoute, getLoComponentMapping, getLORedirectKey, getNextLoComponentRoute } from '../utils';
import fetchMentorMenteeSession from '../../../queries/sessions/fetchMentorMenteeSession'
import updateMentorMenteeSession from '../../../queries/sessions/updateMentorMenteeSession'
import fetchMenteeCourseSyllabus from '../../../queries/sessions/fetchMenteeCourseSyllabus'
import fetchMentorFeedback from '../../../queries/fetchMentorFeedback'
import BadgeModal from '../../Achievements/BadgeModal'
import MentorFeedback from '../../../components/MentorFeedback'
import store from '../../../store'
import gql from 'graphql-tag'
import requestToGraphql from '../../../utils/requestToGraphql'
import fetchBadge from '../../../queries/fetchBadge';
import { filterKey } from '../../../utils/data-utils';
import isMobile from '../../../utils/isMobile';
import UpdatedSideNavBar from '../../../components/UpdatedSideNavBar';
import CredentialsPopup from '../../Signup/schoolLiveClassLogin/components/CredentialsPopup/CredentialsPopup';
import mentorMenteeSessionAddOrDelete from '../../../utils/mmSessionAddOrDelete';
import { checkIfEmbedEnabled, getEmbedData } from '../../../utils/teacherApp/checkForEmbed';
import { Power } from '../../../constants/icons';
import goBackToTeacherApp from '../../../utils/teacherApp/goBackToTeacherApp';



SwiperCore.use([Mousewheel]);
class ComicStrip extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isDesktop: typeof window === 'undefined' ? true : window.innerWidth > 900,
            slidestep: 0,
            slides: [],
            showCredentialModal: false,
        };

    }

    async componentDidMount() {
        const { topicId } = this.props.match.params
        await fetchChatPractice(this.props.userId, this.props.loId, false, true, this.props.courseId, topicId).call()
        const learningObjective = this.props.learningObjective && this.props.learningObjective.toJS()[0]
        this.setState({
            comicStrips: (get(learningObjective, 'comicStrips') && get(learningObjective, 'comicStrips')[0]) || [],
            slides: (get(learningObjective, 'comicStrips') && get(get(learningObjective, 'comicStrips')[0], 'comicImages', [])) || []
        })
        this.updateComponentDetail()
        const menteeId = this.props.userId
        mentorMenteeSessionAddOrDelete(menteeId, topicId, '', 'started', 'other', () => fetchMentorMenteeSession(
            null,
            null,
            menteeId,
            'menteeTopicFilter',
            null,
            true,
            topicId,
            null
        ).call())
        let showCredentialModalStatus = localStorage.getItem('showCredentialsModal')
        if (showCredentialModalStatus) {
            this.setState({
                showCredentialModal: true
            })
        }
    }

    async componentDidUpdate(prevProps) {
        const prevLoId = get(prevProps, 'loId')
        if (this.props.loId !== prevLoId) {
            const { topicId } = this.props.match.params
            await fetchChatPractice(this.props.userId, this.props.loId, false, true, this.props.courseId, topicId).call()
            const learningObjective = this.props.learningObjective && this.props.learningObjective.toJS()[0]
            this.setState({
                comicStrips: (get(learningObjective, 'comicStrips') && get(learningObjective, 'comicStrips')[0]) || [],
                slides: (get(learningObjective, 'comicStrips') && get(get(learningObjective, 'comicStrips')[0], 'comicImages', [])) || []
            })
            this.updateComponentDetail()
        }
    }

    closeBadgeModal = () => {
        this.setState({
            isBadgeModalVisible: false
        })
        if (checkIfEmbedEnabled()) return goBackToTeacherApp("endSession")
        this.endSession()
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

    updateComponentDetail = () => {
        const { loId } = this.props.match.params
        duck.merge(() => ({
            learningObjective: {
                id: loId,
                isUnlocked: true
            }
        }))
    }

    getNextComponent = () => {
        const { topicId, loId } = this.props.match.params
        const topicJS = this.props.topics.toJS().filter(topic => topic.id === topicId)
        const { topicComponentRule = [] } = topicJS[0] || {}
        let sortedTopicComponentRule = topicComponentRule.sort((a, b) => a.order > b.order)
        sortedTopicComponentRule = (sortedTopicComponentRule || []).filter(el => !['homeworkAssignment', 'quiz', 'homeworkPractice'].includes(get(el, 'componentName')))
        const currentTopicComponentIndex = sortedTopicComponentRule.findIndex(el => el.learningObjective && el.learningObjective.id === loId)
        let nextComponent = null
        if (sortedTopicComponentRule[currentTopicComponentIndex + 1]) {
            nextComponent = sortedTopicComponentRule[currentTopicComponentIndex + 1]
        }
        return {
            nextComponent,
            currentComponent: sortedTopicComponentRule[currentTopicComponentIndex] || null
        }
    }

    dumpComicStrips = async () => {
        const { topicId, loId, courseId } = this.props.match.params
        const isRevisit = this.props.match.path.includes('/revisit')
        const loggedInUser = this.props.loggedInUser && this.props.loggedInUser.toJS()
        const isMentorLoggedIn = loggedInUser && get(loggedInUser[0], 'isMentorLoggedIn', false)
        const userLearningObjective = this.props.userLearningObjective && this.props.userLearningObjective.toJS()
        const comicStripStatus = get(userLearningObjective, '[0].comicStripStatus', '')
        if (!isRevisit) {
            await dumpComicStrip(
                this.props.userId,
                loId,
                courseId,
                { comicStripAction: 'next' },
                true
            ).call()
        } else if (isRevisit && comicStripStatus !== 'complete') {
            await dumpComicStrip(
                this.props.userId,
                loId,
                courseId,
                { comicStripAction: 'next' },
                true
            ).call()
        }
        duck.merge(() => ({
            learningObjective: {
                id: loId,
                comicStripStatus: 'complete',
                isUnlocked: true
            }
        }))
        const {nextComponent, currentComponent} = this.getNextComponent()

        if (!nextComponent && !isRevisit) {
            await fetchBadge(topicId, 'comicStrip', false, { courseId }).call();
            const badge = this.props.unlockBadge && filterKey(this.props.unlockBadge, `unlockBadge/comicStrip/${topicId}`)
            const badgeJS = badge && badge.toJS()
            if (badgeJS && badgeJS.length) {
                this.setState({
                    isBadgeModalVisible: true,
                    badge: badgeJS,
                })
                return
            }
        }
        // const revistRoute = this.props.match.path === '/revisit/sessions/comic-strip/:courseId/:topicId/:loId' ? '/revisit' : ''
        // const isRevisitRoute = this.props.match.path === '/revisit/sessions/comic-strip/:courseId/:topicId/:loId'
        const { course } = this.props
        const sortedLoComponentRule = course && sort.ascend(course.getIn(['defaultLoComponentRule'], Map([])), ['order']).toJS()
        // let filteredLo = this.props.learningObjective && this.props.learningObjective.toJS().filter(lo => lo.id === loId)
        // let filteredLoComponentRule = getFilteredLoComponentRule(filteredLo[0], sortedLoComponentRule, get(nextComponent, 'learningObjectiveComponentsRule', []))
        // if (filteredLoComponentRule && filteredLoComponentRule.length) {
        //     const currentLoComponentIndex = filteredLoComponentRule.findIndex(componentRule => get(componentRule, 'componentName') === 'comicStrip')
        //     const nextLoComponent = filteredLoComponentRule[currentLoComponentIndex + 1]
        //     if (nextLoComponent && Object.keys(nextLoComponent).length) {
        //         this.props.history.push(`${revistRoute}/sessions/${getLORedirectKey(nextLoComponent)}/${courseId}/${topicId}/${loId}`)
        //         return
        //     }
        // }
        const redirectUrl = getNextLoComponentRoute({
            course,
            learningObjective: this.props.learningObjective,
            learningObjectiveId: loId,
            topicComponentRule: currentComponent,
            courseId,
            topicId,
            childComponentsName: ['comicStrip']
        })
        if (redirectUrl) {
            this.props.history.push(redirectUrl)
            return
        }
        if (nextComponent) {
            const { redirectUrl } = getInSessionRoute({
                topicComponentRule: nextComponent,
                course: {
                    id: courseId,
                    defaultLoComponentRule: sortedLoComponentRule
                },
                topicId,
                learningObjectives: this.props.learningObjective,
                goToNextComponent: true,
            })
            if (redirectUrl) {
                return this.props.history.push(redirectUrl)
            }
            // if (nextComponent && nextComponent.componentName === 'learningObjective') {
            //     filteredLo = this.props.learningObjective && this.props.learningObjective.toJS().filter(lo => lo.id === nextComponent.learningObjective.id)
            //     let LoRedirectKey = 'comic-strip'
            //     if (filteredLo && filteredLo.length && sortedLoComponentRule && sortedLoComponentRule.length) {
            //         filteredLoComponentRule = getFilteredLoComponentRule(filteredLo[0], sortedLoComponentRule, get(nextComponent, 'learningObjectiveComponentsRule', []))
            //         if (filteredLoComponentRule && filteredLoComponentRule.length) {
            //             LoRedirectKey = getLORedirectKey(filteredLoComponentRule[0])
            //         }
            //     }
            //     this.props.history.push(`${revistRoute}/sessions/${LoRedirectKey}/${courseId}/${topicId}/${nextComponent.learningObjective.id}`)
            // } else if (nextComponent && nextComponent.componentName === 'blockBasedProject') {
            //     this.props.history.push(`${revistRoute}/sessions/project/${courseId}/${topicId}/${nextComponent.blockBasedProject.id}`)
            // } else if (nextComponent && nextComponent.componentName === 'video') {
            //     this.props.history.push(`${revistRoute}/sessions/video/${courseId}/${topicId}/${nextComponent.video.id}`)
            // } else if (nextComponent && nextComponent.componentName === 'blockBasedPractice') {
            //     this.props.history.push(`${revistRoute}/sessions/practice/${courseId}/${topicId}/${nextComponent.blockBasedProject.id}`)
            // } else if (nextComponent.componentName === 'assignment') {
            //     this.props.history.push(`${revistRoute}/sessions/coding/${courseId}/${topicId}`)
            // }
        } else {
            if (isRevisit) {
                if (checkIfEmbedEnabled()) {
                    return goBackToTeacherApp("backToSession")
                }
                return this.props.history.push('/sessions')
            }
            if (checkIfEmbedEnabled()) {
                goBackToTeacherApp("endSession")
              }
            this.endSession()
        }
    }

    fetchFeedbackForm = () => {
        fetchMentorFeedback(this.props.mentorMenteeSessionEndSession.getIn([0, 'id'])).call()
    }

    endSession = async () => {
        const { topicId, courseId } = this.props.match.params
        const menteeId = this.props.userId
        this.fetchFeedbackForm()
        this.setState({
            fetchingMentorMenteeSession: true
        })
        const fetchMentorMenteeSessionToEnd = await requestToGraphql(
            gql`
                query {
                    mentorMenteeSessions(filter:{
                        and:[
                            {menteeSession_some: {user_some: {id: "${menteeId}"}}}
                            {topic_some: {id: "${topicId}"}}
                        ]
                    }) {
                        id
                        sessionStatus
                    }
                }   
            `
        )
        if (fetchMentorMenteeSessionToEnd) {
            this.setState({
                fetchingMentorMenteeSession: false
            })
            if (
                get(fetchMentorMenteeSessionToEnd, 'data.mentorMenteeSessions') &&
                get(fetchMentorMenteeSessionToEnd, 'data.mentorMenteeSessions').length
            ) {
                const res = await updateMentorMenteeSession(
                    get(fetchMentorMenteeSessionToEnd, 'data.mentorMenteeSessions.0.id'),
                    { sessionStatus: 'completed', endSessionByMentee: new Date() },
                    topicId,
                    true,
                    courseId
                ).call()
                if (res) {
                    if (this.props.mentor && this.props.mentor.getIn(['id'])) {
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
                    }
                }
            }
        }
    }

    getNextLoComponent = (nextComponent) => {
        const { course } = this.props
        const sortedLoComponentRule = course && sort.ascend(course.getIn(['defaultLoComponentRule'], Map([])), ['order']).toJS()
        const sortedLo = this.props.learningObjective && sort.ascend(this.props.learningObjective, ['order'])
        const filteredLo = sortedLo && sortedLo.toJS().filter(lo => lo.id === nextComponent.learningObjective.id)
        let LoRedirectKey = 'comic-strip'
        if (filteredLo && filteredLo.length && sortedLoComponentRule && sortedLoComponentRule.length) {
            const filteredLoComponentRule = getFilteredLoComponentRule(filteredLo[0], sortedLoComponentRule, (get(nextComponent, 'learningObjectiveComponentsRule', []) || []))
            if (filteredLoComponentRule && filteredLoComponentRule.length) {
                LoRedirectKey = getLORedirectKey(filteredLoComponentRule[0])
            }
        }
        return LoRedirectKey
    }

    getNextComponentDetails = () => {
        const { loId } = this.props.match.params
        const { course } = this.props
        const {nextComponent, currentComponent} = this.getNextComponent()
        let componentDetail = {}
        const sortedLoComponentRule = course && sort.ascend(course.getIn(['defaultLoComponentRule'], Map([])), ['order']).toJS()
        let filteredLo = this.props.learningObjective && this.props.learningObjective.toJS().filter(lo => lo.id === loId)
        let filteredLoComponentRule = getFilteredLoComponentRule(filteredLo[0], sortedLoComponentRule, (get(currentComponent, 'learningObjectiveComponentsRule', []) || []))
        if (filteredLoComponentRule && filteredLoComponentRule.length) {
            const currentLoComponentIndex = filteredLoComponentRule.findIndex(componentRule => get(componentRule, 'componentName') === 'comicStrip')
            const nextLoComponent = filteredLoComponentRule[currentLoComponentIndex + 1]
            if (nextLoComponent && Object.keys(nextLoComponent).length) {
                const Lokey = getLORedirectKey(nextLoComponent)
                const LoTitleText = get(filteredLo[0], 'title') ? `( ${get(filteredLo[0], 'title', '')} )` : ''
                return getLoComponentMapping(Lokey, loId, LoTitleText)
            }
        }
        if (nextComponent && nextComponent.componentName === 'video') {
            const videoId = get(nextComponent, 'video.id')
            componentDetail = {
                id: videoId,
                title: 'Video'
            }
        } else if (nextComponent && nextComponent.componentName === 'learningObjective') {
            const LoRedirectKey = this.getNextLoComponent(nextComponent)
            const LoTitle = get(nextComponent, 'learningObjective.title') ? `( ${get(nextComponent, 'learningObjective.title')} )` : ''
            const LoId = get(nextComponent, 'learningObjective.id')
            componentDetail = getLoComponentMapping(LoRedirectKey, LoId, LoTitle)
        } else if (nextComponent && nextComponent.componentName === 'blockBasedProject') {
            const projectTitle = get(nextComponent, 'blockBasedProject.title') ? `( ${get(nextComponent, 'blockBasedProject.title')} )` : ''
            componentDetail = {
                id: get(nextComponent, 'blockBasedProject.id'),
                title: 'Project',
            }
        } else if (nextComponent && nextComponent.componentName === 'blockBasedPractice') {
            const projectTitle = get(nextComponent, 'blockBasedProject.title') ? `( ${get(nextComponent, 'blockBasedProject.title')} )` : ''
            componentDetail = {
                id: get(nextComponent, 'blockBasedProject.id'),
                title: 'Practice',
            }
        } else if (nextComponent && nextComponent.componentName === 'assignment') {
            componentDetail = {
                id: null,
                title: 'Coding Assignment',
            }
        }
        return componentDetail
    }

    getButtonTitle = (revisitRoute) => {
        const { loId } = this.props.match.params
        const {nextComponent, currentComponent} = this.getNextComponent()
        const { course } = this.props
        const sortedLoComponentRule = course && sort.ascend(course.getIn(['defaultLoComponentRule'], Map([])), ['order']).toJS()
        let filteredLo = this.props.learningObjective && this.props.learningObjective.toJS().filter(lo => lo.id === loId)
        let filteredLoComponentRule = getFilteredLoComponentRule(filteredLo[0], sortedLoComponentRule, (get(currentComponent, 'learningObjectiveComponentsRule', []) || []))
        if (filteredLoComponentRule && filteredLoComponentRule.length) {
            const currentLoComponentIndex = filteredLoComponentRule.findIndex(componentRule => get(componentRule, 'componentName') === 'comicStrip')
            const nextLoComponent = filteredLoComponentRule[currentLoComponentIndex + 1]
            if (nextLoComponent && Object.keys(nextLoComponent).length) {
                return `Next Up: ${this.getNextComponentDetails().title}`
            }
        }
        if (nextComponent) {
            return `Next Up: ${this.getNextComponentDetails().title}`
        }
        if (revisitRoute) {
            if (checkIfEmbedEnabled()) {
                return `Back to ${getEmbedData("backToPage")}`
            }
            return 'Back to Sessions'
        }
        return 'END SESSION'
    }

    render() {
        const { isDesktop } = this.state
        const fetchStatus = this.props.fetchChatStatus && this.props.fetchChatStatus.toJS()
        const { loId } = this.props.match.params
        const revisitRoute = this.props.match.path.includes('/revisit')
        if (get(fetchStatus, 'loading')) {
            if (isMobile()) {
                return (
                    <>
                        {/* <UpdatedSideNavBar
                            parent='sessions'
                            revisitRoute={this.props.match.path.includes('/revisit')}
                            mobileNav
                            computedMatch={this.props.computedMatch || this.props.match}
                            pageTitle="Comic Strips"
                        /> */}
                        <div style={{ marginTop: '70px' }}>
                            <SkeletonMobile isMobile />
                        </div>
                    </>
                )
            }
            return (
                <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
                    <Skeleton />
                </div>
            )
        }
        const isNotDesktop = isMobile()
        return (
            <>
                {this.state.isBadgeModalVisible &&
                    <BadgeModal
                        closeModal={this.closeBadgeModal}
                        shouldAnimate
                        unlockBadge={this.state.badge}
                    />
                }
                {!revisitRoute && (
                    <MentorFeedback
                        sessionId={this.props.mentorMenteeSessionEndSession.getIn([0, 'id'])}
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
                )}
                {/* <UpdatedSideNavBar
                    parent='sessions'
                    revisitRoute={this.props.match.path.includes('/revisit')}
                    mobileNav
                    computedMatch={this.props.computedMatch || this.props.match}
                    pageTitle="Comics Strips"
                /> */}
                <div className='comicStrip-mainContainer comic-strip-page-mixpanel-identifier' style={{
                    marginTop: `${isMobile() ? '60px' : ''}`
                }}>
                    <div style={{ width: '100%', paddingTop: `${isMobile() ? '' : '20px'}` }}>
                        {!isNotDesktop ? <Swiper
                            spaceBetween={0}
                            slidesPerView={2}
                            grabCursor
                            direction='horizontal'
                            mousewheel={{ thresholdTime: 1, sensitivity: 10 }}
                            style={{ padding: '0px 32px' }}
                            onSlideChange={swiper => this.setState({ slidestep: swiper.activeIndex })}
                            onSwiper={(swiper) => this.swiper = swiper}
                        >
                            {!isNotDesktop && this.swiper && this.swiper.activeIndex > 0 && (
                                <div className='comicStrip-left-overlay-shadow' />
                            )}
                            {this.state.slides && sortBy(this.state.slides, ['order']).map(slide => (
                                <SwiperSlide
                                    style={{
                                        marginTop: hsm(2)
                                    }}>
                                    <div style={{
                                        flex: '0 0 auto',
                                        display: 'flex',
                                        background: '#222',
                                        height: '75vh',
                                        justifyContent: 'center',
                                        alignItems: 'center',

                                    }}>
                                        <ImageBackground
                                            src={getPath(slide.image ? slide.image.uri : '')}
                                            srcLegacy={getPath(slide.image ? slide.image.uri : '')}
                                            className={'comic-pages'}
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper> : null}
                        {
                            isNotDesktop ? <>{
                                this.state.slides && sortBy(this.state.slides, ['order']).map(slide => (
                                    <div style={{
                                        flex: '0 0 auto',
                                        display: 'flex',
                                        background: '#222',
                                        height: '45vh',
                                        justifyContent: 'center',
                                        alignItems: 'center',

                                    }}>
                                        <ImageBackground
                                            src={getPath(slide.image ? slide.image.uri : '')}
                                            srcLegacy={getPath(slide.image ? slide.image.uri : '')}
                                            className={'comic-pages'}
                                        />
                                    </div>
                                ))
                            }</> : null
                        }
                        {
                            !isNotDesktop ?
                                <div className='swiper-indicator-container'>
                                    <div className='carousel-ArrowSVG-container'
                                        style={{ transform: 'scaleX(-1)' }}
                                        onClick={() => {

                                            this.swiper.slidePrev()
                                        }}
                                    >
                                        <ImageBackground
                                            src={require('../../../assets/ArrowCircleOutline.png')}
                                            srcLegacy={require('../../../assets/ArrowCircleOutline.png')}
                                            className={'carousel-ArrowSVG'}
                                        />
                                    </div>
                                    {(this.state.slides && this.state.slides.length) && (
                                        <span style={{ userSelect: 'none' }}>
                                            {this.swiper && `${this.swiper.activeIndex + 1}/${get(this.state.slides, 'length', 0)}`}
                                        </span>
                                    )}
                                    <div
                                        style={{ marginLeft: 12 }}
                                        className='carousel-ArrowSVG-container'
                                        onClick={() => {
                                            this.swiper.slideNext()
                                        }}
                                    >
                                        <ImageBackground
                                            src={require('../../../assets/ArrowCircleOutline.png')}
                                            srcLegacy={require('../../../assets/ArrowCircleOutline.png')}
                                            className={'carousel-ArrowSVG'}
                                        />
                                    </div>
                                </div>
                                : null
                        }
                        {<div className={this.props.match.path === '/revisit/sessions/comic-strip/:courseId/:topicId/:loId' ? 'comic-strips-next-btn-stick' : 'comic-strips-next-btn'}>
                            {
                                isNotDesktop ? <button className='nextButton'
                                    onClick={() => {
                                        if (!this.props.dumpComicStrip.getIn([loId, 'loading'])) {
                                               this.dumpComicStrips()
                                        }
                                    }}
                                >
                                    <div className='nextTitle' >
                                        Next Up: {this.getNextComponentDetails().title}
                                    </div>
                                    {this.props.dumpComicStrip.getIn([loId, 'loading']) ? (
                                        <span className='loader' />
                                    ) : (
                                        <img style={{ marginLeft: "10px" }} width="28px" src="https://img.icons8.com/material-sharp/50/ffffff/circled-chevron-right.png" alt="arrow right" />
                                    )}
                                </button> :
                                    <Button3D
                                       type={this.getButtonTitle(revisitRoute).toLowerCase().includes('end') && 'danger'}
                                        title={this.getButtonTitle(revisitRoute)}
                                        onClick={() => {

                                            this.dumpComicStrips()
                                        }}
                                        loading={this.props.dumpComicStrip.getIn([loId, 'loading'])}
                                        leftIcon
                                    >
                                        {this.getButtonTitle(revisitRoute).toLowerCase().includes('end') && <Power color='white'/>}
                                    </Button3D>
                            }
                        </div>
                        }
                    </div>
                </div>
                {this.state.showCredentialModal && <CredentialsPopup email={get(this.props.loggedInUser.toJS(), 'email')} password={get(this.props.loggedInUser.toJS(), 'savedPassword')} onClickFn={() => {
                    this.props.dispatch({ type: 'LOGOUT' })
                }} />}
            </>
        )
    }
}

export default ComicStrip
