/* eslint-disable */
import React, { Component } from 'react'
import cx from 'classnames'
import { get } from 'lodash'
import { Map } from 'immutable'
import duck from '../../../duck'
import parseMetaTags from '../../../utils/parseMetaTags'
import getPath from '../../../utils/getPath';
import { avatarsRelativePath } from '../../../utils/constants/studentProfileAvatars'
import { ImageBackground } from '../../../image';
import fetchBadge from '../../../queries/fetchBadge'
import videoStyles from "../Video/Video.module.scss";
import codingStyles from "../../UpdatedCodingAssignment/CodingAssignment.module.scss";
import { Button3D } from '../../../photon'
import fetchMentorMenteeSession from '../../../queries/sessions/fetchMentorMenteeSession'
import fetchMenteeCourseSyllabus from '../../../queries/sessions/fetchMenteeCourseSyllabus'
import updateMentorMenteeSession from '../../../queries/sessions/updateMentorMenteeSession'
import fetchMentorFeedback from '../../../queries/fetchMentorFeedback'
import fetchBlockBasedProject from '../../../queries/fetchBlockBasedProject'
import dumpBlockBasedProject from '../../../queries/dumpBlockBasedProject'
import store from '../../../store'
import { fromJS } from 'immutable'
import gql from 'graphql-tag'
import requestToGraphql from '../../../utils/requestToGraphql'
import BadgeModal from '../../Achievements/BadgeModal'
import ArrowIcon from '../../../assets/arrowIcon'
import MentorFeedback from '../../../components/MentorFeedback'
import Skeleton from './skeleton'
import './Project.scss'
import '../Practice/Practice.scss'
import TekieCEParser from '../../../components/Preview'
import UpdatedSideNavBar from '../../../components/UpdatedSideNavBar'
import isMobile from '../../../utils/isMobile'
import Editor from '../../Editor/EditorPage'
import CredentialsPopup from '../../Signup/schoolLiveClassLogin/components/CredentialsPopup/CredentialsPopup'
import mentorMenteeSessionAddOrDelete from '../../../utils/mmSessionAddOrDelete'
import { checkIfEmbedEnabled, getEmbedData } from '../../../utils/teacherApp/checkForEmbed'
import IframeContent from '../../../components/IframeContent/IframeContent'
import { Power } from '../../../constants/icons'
import { sort } from '../../../utils/immutable'
import { getFilteredLoComponentRule, getInSessionRoute, getLORedirectKey } from '../utils'
import goBackToTeacherApp from '../../../utils/teacherApp/goBackToTeacherApp'

class Project extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            activeState: null,
            projectLink: '',
            projectLinkSubmitted: false,
            editProjectLink: false,
            isProjectPreviewModalVisible: false,
            blockBasedData: null,
            blockBasedProjects: null,
            isBadgeModalVisible: false,
            savedBlocks: '',
            showCredentialModal: false,
            startTime: null,
            endTime: null,
        };
        this.initialBlocks = ''
        this.savedBlocks = ''
    }

    async componentDidMount() {
        await this.fetchBlockBasedDataBasedOnType()
        const { topicId } = this.props.match.params
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

    fetchBlockBasedDataBasedOnType = async () => {
        this.setState({
            isLoading: true,
        })
        const { courseId, projectId, topicId } = this.props.match.params
        await fetchBlockBasedProject(this.props.userId, projectId, courseId, null, false, topicId).call()
        let updateObj = {}
        if (this.props.userBlockBasedProjects && this.props.userBlockBasedProjects.getIn([0, 'answerLink']) && this.props.userBlockBasedProjects.getIn([0, 'answerLink']) !== '' && this.props.userBlockBasedProjects.getIn([0, 'blockBasedProject']).toJS().layout === 'externalPlatform') {
            updateObj = {
                activeState: 'started',
                projectLink: this.props.userBlockBasedProjects.getIn([0, 'answerLink']),
                projectLinkSubmitted: true
            }
        } else if (this.props.userBlockBasedProjects && this.props.userBlockBasedProjects.getIn([0, 'blockBasedProject']).toJS().layout === 'playground') {
            updateObj = {
                activeState: 'started',
                savedBlocks: this.props.userBlockBasedProjects.getIn([0, 'savedBlocks']),
                layout: this.props.userBlockBasedProjects.getIn([0, 'blockBasedProject']).toJS().layout
            }
            this.initialBlocks = this.props.userBlockBasedProjects.getIn([0, 'blockBasedProject']).toJS().initialBlocks
            this.savedBlocks = this.props.userBlockBasedProjects.getIn([0, 'savedBlocks'])
        }
        if (this.props.userBlockBasedProjects && this.props.userBlockBasedProjects.getIn([0]).toJS().startTime) {
            updateObj['startTime'] = this.props.userBlockBasedProjects.getIn([0]).toJS().startTime
        } else {
            updateObj['startTime'] = new Date().toISOString()
        }
        this.setState({
            isLoading: false,
            userBlockBasedProjectId: this.props.userBlockBasedProjects && this.props.userBlockBasedProjects.getIn([0, 'id']),
            blockBasedData: this.props.userBlockBasedProjects && this.props.userBlockBasedProjects.getIn([0, 'blockBasedProject']) && this.props.userBlockBasedProjects.getIn([0, 'blockBasedProject']).toJS(),
            ...updateObj
        })
        this.moveCacheToNextComponent()
    }

    async componentDidUpdate(prevProps) {
        const { projectId } = this.props.match.params
        if (prevProps.match.params.projectId !== projectId) {
            await this.fetchBlockBasedDataBasedOnType()
            this.setState({
                projectLink: '',
                projectLinkSubmitted: false,
                editProjectLink: false,
            })
        }
    }

    dumpBlockBasedProject = async () => {
        const { projectId, courseId, topicId } = this.props.match.params
        let input = { blockBasedProjectAction: 'next' }
        if (this.state.projectLink && this.state.blockBasedData.layout === 'externalPlatform') {
            input['answerLink'] = this.state.projectLink
        } else {
            input['savedBlocks'] = this.state.savedBlocks
        }
        if (get(this.state, 'startTime')) {
            input = {
                ...input,
                startTime: get(this.state, 'startTime'),
                endTime: new Date().toISOString()
            }
        }
        await dumpBlockBasedProject(
            this.props.userId,
            topicId,
            projectId,
            courseId,
            input,
            true,
        ).call()
    }

    getDifficultyLevels = () => {
        const { blockBasedData } = this.state
        const difficultyEl = []
        for (let i = 0; i < 3; i++) {
            if (i < blockBasedData.difficulty) {
                difficultyEl.push('project-top-details-difficulty-icon-filled')
            } else {
                difficultyEl.push('project-top-details-difficulty-icon-outline')
            }
        }
        return difficultyEl
    }

    getNextComponent = () => {
        const { topicId, projectId } = this.props.match.params
        const topicJS = this.props.topics && this.props.topics.toJS().filter(topic => topic.id === topicId)
        const { topicComponentRule = [] } = topicJS[0] || {}
        let sortedTopicComponentRule = topicComponentRule.sort((a, b) => a.order > b.order && 1 || -1)
        sortedTopicComponentRule = (sortedTopicComponentRule || []).filter(el => !['homeworkAssignment', 'quiz', 'homeworkPractice'].includes(get(el, 'componentName')))
        const currentTopicComponentIndex = sortedTopicComponentRule.findIndex(el => el.blockBasedProject && el.blockBasedProject.id === projectId)
        let nextComponent = null
        if (sortedTopicComponentRule[currentTopicComponentIndex + 1]) {
            nextComponent = sortedTopicComponentRule[currentTopicComponentIndex + 1]
        }
        return nextComponent
    }

    getButtonTitle = () => {
        const nextComponent = this.getNextComponent()
        if (nextComponent) {
            return 'Next'
        }
        if (this.props.match.path.includes('/revisit')) {
            if (checkIfEmbedEnabled()) {
                return `Back to ${getEmbedData("backToPage")}`
            }
            return 'Back to Sessions'
        }
        return 'END SESSION'
    }

    moveCacheToNextComponent = async () => {
        const { projectId, topicId } = this.props.match.params
        const { userTopicJourney } = this.props
        duck.merge(() => ({
            userTopicJourney: {
                id: topicId,
                blockBasedProjects: userTopicJourney.getIn([0, 'blockBasedProjects']) && userTopicJourney.getIn([0, 'blockBasedProjects']).toJS().map(project => {
                    if (project.id === projectId) {
                        return { ...project, isUnlocked: true }
                    }
                    return project
                })
            }
        }))
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
    handleNext = async () => {
        const { topicId, courseId } = this.props.match.params
        const nextComponent = await this.getNextComponent()
        // fetchBadge(topicId, 'blockBasedPractice', true, { courseId }).call();
        await this.dumpBlockBasedProject()
        duck.merge(() => ({
            userBlockBasedProjects: {
                id: this.state.userBlockBasedProjectId,
                status: 'complete'
            },
        }))
        // if (!nextComponent) {
        //     const badge = this.props.unlockBadge && filterKey(this.props.unlockBadge, `unlockBadge/blockBasedProject/${topicId}`)
        //     const badgeJS = badge && badge.toJS()
        //     if (badgeJS && badgeJS.length) {
        //         this.setState({
        //             isBadgeModalVisible: true,
        //             badge: badgeJS,
        //         })
        //         return
        //     }
        // }
        const isRevisitRoute = this.props.match.path.includes('/revisit')
        if (nextComponent) {
            const revistRoute = isRevisitRoute ? '/revisit' : ''
            // if (nextComponent.componentName === 'blockBasedPractice') {
            //     this.props.history.push(`${revistRoute}/sessions/practice/${courseId}/${topicId}/${get(nextComponent, 'blockBasedProject.id')}`)
            // } else if (nextComponent.componentName === 'learningObjective') {
            //     const LoRedirectKey = this.getNextLoComponent(nextComponent)
            //     this.props.history.push(`${revistRoute}/sessions/${LoRedirectKey}/${courseId}/${topicId}/${get(nextComponent, 'learningObjective.id')}`)
            // } else if (nextComponent && nextComponent.componentName === 'video') {
            //     let videoId = get(nextComponent, 'video.id')
            //     if (videoId) {
            //         this.props.history.push(`${revistRoute}/sessions/video/${courseId}/${topicId}/${videoId}`)
            //     } else {
            //         this.props.history.push(`${revistRoute}/sessions/video/${courseId}/${topicId}`)
            //     }
            // } else if (nextComponent && nextComponent.componentName === 'assignment') {
            //     this.props.history.push(`${revistRoute}/sessions/coding/${courseId}/${topicId}`)
            // }
            const { course } = this.props
            const sortedLoComponentRule = course && sort.ascend(course.getIn(['defaultLoComponentRule'], Map([])), ['order']).toJS()
            const { redirectUrl } = getInSessionRoute({
                topicComponentRule: nextComponent,
                course: {
                    id: courseId,
                    defaultLoComponentRule: sortedLoComponentRule
                },
                topicId,
                learningObjectives: this.props.learningObjective,
                goToNextComponent: true
            })
            if (redirectUrl) {
                return this.props.history.push(redirectUrl)
            }
        } else {
            if (isRevisitRoute) {
                if (checkIfEmbedEnabled()) {
                    return goBackToTeacherApp("backToSession")
                }
                return this.props.history.push('/sessions')
            }
            if (checkIfEmbedEnabled()) {
                return goBackToTeacherApp("endSession")
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

    closeBadgeModal = () => {
        this.setState({
            isBadgeModalVisible: false
        })
        if (checkIfEmbedEnabled()) return goBackToTeacherApp("endSession")
        this.endSession()
    }

    withHttps = (url) => url.replace(/^(?:(.*:)?\/\/)?(.*)/i, (match, schemma, nonSchemmaUrl) => schemma ? match : `https://${nonSchemmaUrl}`);

    checkIfDomainAllowed = (url) => /(code.org|blockly.games|scratch.mit|docs.google.com)/g.test(url)

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
    onClickSave = (xml_text) => {
        this.setState({
            savedBlocks: xml_text
        }, () => {
            this.dumpBlockBasedProject();
        });
    }

    render() {
        const blockBasedData = this.state.blockBasedData && get(this.state, 'blockBasedData')
        const loggedInUserDetails = this.props.loggedInUser && this.props.loggedInUser.toJS()
        const loggedInStudentProfile = this.props.studentProfile && this.props.studentProfile.toJS()
        const { projectId } = this.props.match.params
        const { isLoading } = this.state
        const Progress = ({ start, done }) => {
            const [style, setStyle] = React.useState({});
            setTimeout(() => {
                const newStyle = {
                    opacity: 1,
                    width: `${done}%`
                }

                setStyle(newStyle);
            }, 1);

            return (
                <div className="progress">
                    <div className="progress-done" style={style}>
                    </div>
                </div>
            )
        }
        return (
            <>
                {/* <UpdatedSideNavBar
                    mobileNav
                    computedMatch={this.props.computedMatch || this.props.match}
                    pageTitle="Project"
                    parent='sessions'
                    revisitRoute={this.props.match.path.includes('/revisit')}
                /> */}
                <div className='project-mainContainer' style={{
                    marginTop: isMobile() ? '60px' : ''
                }}>
                    {isLoading ? (
                        <Skeleton />
                    ) : (
                        blockBasedData ? (
                            <>
                                {this.state.isBadgeModalVisible &&
                                    <BadgeModal
                                        closeModal={this.closeBadgeModal}
                                        shouldAnimate
                                        unlockBadge={this.state.badge}
                                    />
                                }
                                <div className='project-details-container project-page-mixpanel-identifier'>
                                    <div className='project-top-container'>
                                        <div className='project-top-flex-container'>
                                            {get(blockBasedData, 'projectThumbnail', null) && (
                                                <div className='project-top-image-container'
                                                    style={{
                                                        backgroundImage: `url(${getPath(blockBasedData.projectThumbnail.uri || '')})`,
                                                    }}
                                                />
                                            )}
                                            <div className='project-top-details-container'>
                                                <div className='project-top-details-heading'>{get(blockBasedData, 'title', '-')}</div>
                                                <div className='project-top-details-difficulty-levels'>
                                                    {get(blockBasedData, 'difficulty') && (
                                                        this.getDifficultyLevels().map(classname => (
                                                            <div className={classname} />
                                                        ))
                                                    )}
                                                </div>
                                                {get(blockBasedData, 'projectDescription') && (
                                                    <div className='project-top-details-description'>
                                                        <TekieCEParser
                                                            value={blockBasedData.projectDescription}
                                                            init={{ selector: `BB-project_${blockBasedData.id}` }}
                                                            legacyParser={(projectDescription) => {
                                                                return parseMetaTags({ statement: projectDescription })
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {get(blockBasedData, 'externalPlatformLogo') && (
                                            <div className='project-top-logo-container' style={{ backgroundImage: `url(${getPath(blockBasedData.externalPlatformLogo.uri)})` }} />
                                        )}
                                    </div>
                                    <div className='project-create-container'>
                                        {/* <div className='project-heading-text'>Create</div> */}
                                        <div className='project-create-description'>
                                            {(get(blockBasedData, 'externalDescriptionEnabled', false) && this.checkIfDomainAllowed(get(blockBasedData, 'projectCreationDescription')) ? (
                                                <IframeContent
                                                projectDescription={get(blockBasedData, 'projectCreationDescription')}
                                                embedViewHeight={get(blockBasedData, 'embedViewHeight')}
                                                />
                                            ) : <TekieCEParser
                                                value={blockBasedData.projectCreationDescription}
                                                init={{ selector: `BB-project-creation_${blockBasedData.id}` }}
                                                legacyParser={(projectCreationDescription) => {
                                                    return parseMetaTags({ statement: projectCreationDescription })
                                                }}
                                            />)}
                                        </div>
                                        {get(blockBasedData, 'externalPlatformLink') && (
                                            <>
                                                {this.state.activeState !== 'started' ? (
                                                    <a
                                                        href={get(blockBasedData, 'externalPlatformLink', '')}
                                                        target='_blank'
                                                        onClick={() => {
                                                            this.setState({
                                                                activeState: 'started'
                                                            })
                                                        }}
                                                        className='project-primary-btn'
                                                    >
                                                        Let's Go!
                                                    </a>
                                                ) : (
                                                    this.state.projectLinkSubmitted ? (
                                                        <a href={get(blockBasedData, 'externalPlatformLink', '')}
                                                            target='_blank' className='project-secondary-btn'>launch app</a>
                                                    )
                                                        : <a href={blockBasedData.externalPlatformLink}
                                                            target='_blank' className='project-secondary-btn'>go to app</a>
                                                )}
                                            </>
                                        )}
                                        <div className='project-divider' />
                                    </div>
                                    {(this.state.activeState === 'started' && !!get(blockBasedData, 'isSubmitAnswer', null) && this.state.blockBasedData.layout === 'externalPlatform') && (
                                        <div className='project-create-container'>
                                            <div className='project-create-description'>
                                                {get(blockBasedData, 'answerDescription') && (
                                                    parseMetaTags({ statement: blockBasedData.answerDescription })
                                                )}
                                            </div>
                                            <div className={cx('practice-submit-container-new')}>
                                                <h3 style={{ letterSpacing: '-0 .02em', }}>Project Submission</h3>
                                                {this.state.projectLinkSubmitted && !this.state.editProjectLink && !this.props.dumpBlockBasedProject.getIn([projectId, 'loading']) ?
                                                    <p style={{ color: '#D0D0D0', fontWeight: 600 }}> Check your blockly code here</p>
                                                    :
                                                    <p style={{ color: '#D0D0D0', fontWeight: 600 }}> Please upload the correct link in here</p>
                                                }
                                                {this.props.dumpBlockBasedProject.getIn([projectId, 'loading']) &&
                                                    <Progress done="90" />
                                                }
                                                {!this.props.dumpBlockBasedProject.getIn([projectId, 'loading']) &&
                                                    <>
                                                        {this.state.projectLinkSubmitted && !this.state.editProjectLink ?
                                                            <div className='practice-submitted-state-new'></div> // remove this line and uncomment below lines to include iframe
                                                            // <>
                                                            //     {this.checkIfDomainAllowed(this.state.projectLink) ?
                                                            //         // eslint-disable-next-line jsx-a11y/iframe-has-title
                                                            //         <iframe
                                                            //             src={`${this.state.projectLink}/embed`} 
                                                            //             allowtransparency="true" frameborder="0" scrolling="no" allowfullscreen
                                                            //             width="250" height="300"
                                                            //             className='practice-submitted-state-frame-new'
                                                            //             // style={{ alignSelf: 'flex-end', margin: '4px', position: 'absolute', top: -20, left: -40}} 
                                                            //         />

                                                            //     : 
                                                            //         <div className='practice-submitted-state-new'></div> 
                                                            //     }
                                                            // </>
                                                            :
                                                            <div className='practice-submit-input-container'>
                                                                <input
                                                                    onChange={(e) => this.setState({
                                                                        projectLink: e.target.value
                                                                    })}
                                                                    value={this.state.projectLink}
                                                                    type='text' className='practice-submit-input' placeholder='Paste link here'
                                                                />
                                                            </div>
                                                        }
                                                    </>
                                                }

                                                <div>
                                                    {this.state.projectLinkSubmitted && !this.state.editProjectLink ?
                                                        <div className='practice-submit-btn-container'>
                                                            <button
                                                                className='practice-submit-icon-new-btn'
                                                                onClick={() => window.open(this.withHttps(this.state.projectLink), '_blank')}
                                                            > VIEW PRACTICE</button>
                                                            <button
                                                                className='practice-submit-icon-new-btn-white'
                                                                onClick={() => this.setState({
                                                                    editProjectLink: true
                                                                })}
                                                            > EDIT LINK</button>
                                                        </div> :
                                                        <div className='practice-submit-btn-container'>
                                                            <button
                                                                className='practice-submit-icon-new-btn'
                                                                onClick={() => {
                                                                    if (this.state.projectLink.trim()) {
                                                                        this.setState({
                                                                            projectLinkSubmitted: true,
                                                                            editProjectLink: false
                                                                        })
                                                                        this.dumpBlockBasedProject()
                                                                    }
                                                                }}> SAVE PRACTICE</button>

                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className={codingStyles.footerContainer}>
                                    {isMobile() ? (
                                        <button className={videoStyles.nextButton}
                                            style={{ margin: 0, marginTop: '8px', marginBottom: '8px' }}
                                            onClick={() => this.handleNext()}
                                        >
                                            <div className={videoStyles.nextTitle}>
                                                {this.getButtonTitle()}
                                            </div>
                                            {this.props.dumpBlockBasedPractice.getIn([projectId, 'loading']) ? (
                                                <span className={videoStyles.loader} />
                                            ) : (
                                                <img alt='loading' style={{ marginLeft: "10px" }} width="25px" src="https://img.icons8.com/material-sharp/50/ffffff/circled-chevron-right.png" />
                                            )}
                                        </button>
                                    ) : (
                                        <Button3D
                                        type={this.getButtonTitle().toLowerCase().includes('end')?'danger':'primary'}
                                            title={this.getButtonTitle()}
                                            onClick={this.handleNext}
                                            loading={this.props.dumpBlockBasedProject.getIn([projectId, 'loading'])}
                                        >
                                            {this.getButtonTitle().toLowerCase().includes('end') && <Power color='white'/>}
                                        </Button3D>
                                    )}
                                </div>

                                {(this.state.activeState === 'started' && this.state.blockBasedData.layout === 'playground') && (
                                    <Editor
                                        editorMode='blockly'
                                        initialBlocks={this.savedBlocks || this.initialBlocks || ''}
                                        blocklySave={this.onClickSave}
                                        saveBtn={true}
                                        scrollbarsvertical={false}
                                        isMobile={isMobile()}
                                    />
                                )}

                                {/* <div className='next-button-container'>
                                        <Button3D
                                            title={this.getButtonTitle()}
                                            onClick={this.handleNext}
                                            loading={this.props.dumpBlockBasedProject.getIn([projectId, 'loading'])}
                                        />
                                </div> */}
                                {this.checkIfDomainAllowed(this.state.projectLink) && (
                                    <div className={`project-embed-modal ${this.state.isProjectPreviewModalVisible ? 'modal-visible' : ''}`}>
                                        <div
                                            className='project-embed-modal-backIcon'
                                            onClick={() => {
                                                this.setState({
                                                    isProjectPreviewModalVisible: false
                                                })
                                            }}> <ArrowIcon /> </div>
                                        <ImageBackground
                                            className='embed-modal-tekie-logo'
                                            src={require('../../../assets/tekieLogo.png')}
                                            srcLegacy={require('../../../assets/tekieLogo.png')}
                                        />
                                        <div className='embed-box'>
                                            <iframe
                                                src={`${this.state.projectLink}/embed`}
                                                allowtransparency="true" frameborder="0" scrolling="no" allowfullscreen
                                                width="450" height="475" />
                                            <span className='embed-box-student-project-name'>
                                                {get(blockBasedData, 'title', '')}
                                            </span>
                                            <div className='embed-box-student-profile-container'>
                                                {get(loggedInStudentProfile[0], 'profileAvatarCode', '') && (
                                                    <ImageBackground
                                                        className='embed-box-student-profile-avatar'
                                                        srcLegacy={avatarsRelativePath[get(loggedInStudentProfile[0], 'profileAvatarCode', 'theo')]}
                                                        src={avatarsRelativePath[get(loggedInStudentProfile[0], 'profileAvatarCode', 'theo')]}
                                                    />
                                                )}
                                                <div>
                                                    <span className='embed-box-student-profile-name'>
                                                        {get(loggedInUserDetails[0], 'name')}
                                                    </span>
                                                    <span className='embed-box-student-profile-grade'>
                                                        {get(loggedInStudentProfile[0], 'grade', '')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className='project-error-text'>
                                Some Error Occured, Please Try Again!
                            </div>
                        )
                    )}
                    {(this.props.match.path === '/sessions/project/:courseId/:topicId/:projectId') && (
                        <MentorFeedback
                            sessionId={this.props.mentorMenteeSessionEndSession.getIn([0, 'id'])}
                            postSubmit={async () => {
                                const isCompleted = await this.checkIfCourseCompleted()
                                let loginWithCode = this.props.loggedInUser && this.props.loggedInUser.toJS() && get(this.props.loggedInUser.toJS(), '[0].fromOtpScreen')
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
                </div>
                {this.state.showCredentialModal && <CredentialsPopup email={get(this.props.loggedInUser.toJS(), '[0].email')} password={get(this.props.loggedInUser.toJS(), '[0].savedPassword')} onClickFn={() => {
                    this.props.dispatch({ type: 'LOGOUT' })
                }} />}
            </>
        )
    }
}

export default Project