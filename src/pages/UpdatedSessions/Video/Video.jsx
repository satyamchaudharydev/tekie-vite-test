import React, { Component } from 'react'
import styles from './Video.module.scss'
import { Button3D } from '../../../photon'
import dumpVideo from '../../../queries/dumpVideo'
import { parse } from 'subtitle'
import { get, sortBy } from 'lodash'
import getPath from '../../../utils/getPath'
import errors from '../../../utils/errors'
import fetchImage from '../../../utils/fetchImage'
import skipVideo from '../../../queries/skipVideo'
import updateUserVideo from '../../../queries/updateUserVideo'
import cx from "classnames";
import codingStyles from '../../UpdatedCodingAssignment/CodingAssignment.module.scss'
import { Map } from "immutable";
import { waitForGlobal } from '../../../utils/data-utils'
import duck from '../../../duck'
import { notSufficientPermission, pageDoesNotExist, componentIsLocked } from '../../../constants/video/messages'
import { getToasterBasedOnType } from "../../../components/Toaster";
import VideoPlayerSkeleton from "./videoPlayerSkeleton";
import VideoTitleSkeleton from "./videoTitleSkeleton";
import config, { FileBucket, MOBILE_BREAKPOINT } from "../../../config";
import { Helmet } from 'react-helmet'
import { sort } from '../../../utils/immutable'
import { getFilteredLoComponentRule, getInSessionRoute, getLORedirectKey } from '../utils';
import VideoPlayerSkeletonMobile from './videoPlayerSkeletonMobile/videoPlayerSkeleton';
import isMobile from '../../../utils/isMobile';
import Badge from './components/Badge/Badge';
import { ArrowForward, CheckedIcon, LockIcon, PlayIcon } from '../../../constants/icons';
import UpdatedButton from '../../../components/Buttons/UpdatedButton/UpdatedButton';
import VideoBadgeStatusSkeleton from './videoBadgeStatusSkeleton/videoBadgeStatusSkeleton';
import FooterBtnSkeleton from './footerBtnSkeleton';
import mentorMenteeSessionAddOrDelete from '../../../utils/mmSessionAddOrDelete';
import { checkIfEmbedEnabled } from '../../../utils/teacherApp/checkForEmbed';
import TekieLoader from '../../../components/Loading/TekieLoader'
import fetchComponents from '../../../queries/fetchComponents';
import goBackToTeacherApp from '../../../utils/teacherApp/goBackToTeacherApp'
import { getInSessionSideBarRule } from '../../../components/UpdatedSideNavBar/utils'
import NextFooter from '../../../components/NextFooter'
import store from '../../../store'

// Method to construct data obtained in userVideo and topics, TopicComponentRUle etc as per needed in view
const getUserVideoData = async (
    userVideo,
    topics,
    topicId,
    videoId
) => {
    topicId = "cl3gz6sgs008z0u24au882fhk"
    videoId = "ckpzvemak003c0vw153vm914d"
    console.log(userVideo.toJS(), "==>", userVideo)
    const resultData = {}
    if (userVideo && topics && topicId) {
        const userVideoJS = userVideo.toJS()
        const topicsJS = topics.toJS()
        const topicData = topicsJS.filter(topicData => topicData.id === topicId)
        console.log({ topicData }, userVideo, topics)
        resultData.topic = topicData[0]
        resultData.userVideo = topicData[0] && topicData[0].videoContent.filter(el => el.id === "ckqjpdnqy002z0vz6f6ue5pon")[0]
        resultData.allUserVideos = topicData[0] && topicData[0].videoContent
        const sortedTopicComponentRule = topicData[0] && topicData[0].topicComponentRule
        resultData.topicComponentRule = sortedTopicComponentRule
    }
    console.log({ resultData })
    return resultData
}

const notSufficientPermissionToast = {
    type: 'error',
    message: `${notSufficientPermission}`
}

const pageDoesNotExistToast = {
    type: 'error',
    message: `${pageDoesNotExist}`
}

const componentIsLockedError = {
    type: 'error',
    message: `${componentIsLocked}`
}

class Video extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTime: 0,
            userVideoData: {},
            paused: false,
            progress: 0,
            duration: 0,
            subtitleText: [],
            subtitleBoxHeights: [],
            subtitleHeight: 0,
            subtitleLink: '',
            videoThumbnail: null,
            videoUrl: '',
            videoUrl_480: '',
            videoUrl_720: '',
            videoUrl_1080: '',
            isFullscreen: false,
            seekTime: -1,
            isUserScrolling: false,
            showControls: false,
            selectedLearningObjective: 'none',
            selectedLOStartTime: 0,
            selectedLOEndTime: 0,
            videoTitle: '',
            videoDescription: '',
            progressCountLOScroll: 0,
            isRecommendedLO: false,
            selectedLearningObjectiveData: '',
            isLoading: true,
            skipVideoOverlay: false,
            nextLearningObjective: {},
            base64VideoThumbnail: null,
            isPaid: false,
            insufficientPermissionError: false,
            isVideoBookmarked: false,
            isSubtitleVisible: true,
            refs: [],
            isVideoLoaded: false,
            isPlayerReady: false,
            pastVideoIds: [],
            windowWidth: window.innerWidth,
            visitedVideos: []
        }

        // each instance of <ReactJWPlayer> needs a unique id.
        // we randomly generate it here and assign to the container instance.
        this.playerId = "jwPlayer";
    }

    video = {
        bookmarkTimeOut: null,
        userScrollTimeout: null
    }

    async componentDidMount() {
        window.addEventListener("resize", this.handleResize);
        const topicId = this.props.match.params.topicId
        const courseId = this.props.match.params.courseId

        const topic = await fetchComponents(topicId).componentRule()
        const componentRules = getInSessionSideBarRule(
            get(topic, 'topicComponentRule'),
            this.props.courseDefaultLoComponentRule,
            courseId,
            topicId
        )
        if (courseId === 'cjs8skrd200041huzz78kncz5') {
            this.props.history.push(`/sessions/video/${topicId}`)
            return
        }
        mentorMenteeSessionAddOrDelete(get(this.props.loggedInUser.toJS(), 'id'), topicId, '', 'started', 'other', null, false)
        // await fetchTopicJourney(topicId, false, courseId).call()
        await this.fetchUserVideoPage()

        const allVideos = this.getVideoArr()
        this.setState({ visitedVideos: [...this.state.visitedVideos, get(allVideos[0], 'id')] })
    }

    handleResize = (e) => {
        this.setState({ windowWidth: window.innerWidth });
    };

    componentDidUpdate(prevProps, prevState) {
        const { userTopicJourney } = this.props
        const { userTopicJourney: prevUserTopicJourney } = prevProps
        if (prevUserTopicJourney.getIn([0, 'videos']) !== userTopicJourney.getIn([0, 'videos'])) {
            this.fetchUserVideoPage()
        }
        if (prevState.selectedVideoId !== this.state.selectedVideoId) {
            this.setState({ visitedVideos: [...this.state.visitedVideos, this.state.selectedVideoId] })
        }
        // if video id changes, fetch the new video
        if (prevProps.match.params.videoId !== this.props.match.params.videoId) {
            this.fetchUserVideoPage()
        }
    }

    fetchUserVideoPage = async (idToFetch = null) => {
        this.setState({
            isLoading: true,
        })
        const topicId = this.props.match.params.topicId
        const videoId = this.props.match.params.videoId
        const userId = this.props.loggedInUser.toJS().id
        const courseId = this.props.match.params.courseId
        const prevTopicId = this.props.location.state && this.props.location.state.prevTopicId
        const { studentProfile } = this.props
        const { userTopicJourney } = this.props
        if (!idToFetch && videoId) {
            idToFetch = videoId
        }
        if (!idToFetch) {
            idToFetch = userTopicJourney.getIn([0, 'videos']) && sort.ascend(userTopicJourney.getIn([0, 'videos']), ['order']).getIn([0, 'id'])
        }
        console.log("fetching")
        if (idToFetch) {
            await fetchComponents(topicId, courseId)
                .components([{ type: 'video', arg: { videoId: idToFetch } }])
        }
        console.log(store.getState().data.toJS().userVideo, "userVideo")
        console.log("fetched")
        const { userVideo, topics, errors: backendErrors } = this.props
        console.log(userVideo.toJS(), userId)
        // calling method to get respective data from respective state
        const userVideoData = await getUserVideoData(
            userVideo,
            topics,
            prevTopicId || topicId,
            idToFetch,
        )
        console.log({ userVideoData })
        let errorCode = ''
        if (this.props.videoFetchStatus && this.props.videoFetchStatus.get('failure')) {
            errorCode = backendErrors && backendErrors.getIn([backendErrors.size - 1, 'error', 'errors', 0, 'code'])
        }
        if (errorCode === errors.DatabaseRecordNotFoundError) {
            getToasterBasedOnType(pageDoesNotExistToast)
            setTimeout(() => {
                if (checkIfEmbedEnabled()) {
                    return goBackToTeacherApp("backToSession")
                } else this.props.history.push(`/`)
            }, 2000)
            this.setState({
                insufficientPermissionError: true
            })
        } else if (errorCode === errors.ComponentLockedError) {
            getToasterBasedOnType(componentIsLockedError)
            setTimeout(() => {
                if (this.props.loggedInUser && this.props.loggedInUser.toJS() && this.props.loggedInUser.toJS().role === config.MENTEE) {
                    this.props.history.push(`/sessions`)
                } else {
                    this.props.history.push(`/learn`)
                }
            }, 5000)
            this.setState({
                insufficientPermissionError: true
            })
        } else if (errorCode === errors.PaidComponentLockedError) {
            getToasterBasedOnType(notSufficientPermissionToast)
            // setTimeout(() => {
            //     if(this.props.loggedInUser && this.props.loggedInUser.toJS() && this.props.loggedInUser.toJS().role === config.MENTEE) {
            //         this.props.history.push(`/sessions`)
            //     } else {
            //         this.props.history.push(`/learn`)
            //     }
            // }, 5000)
            this.setState({
                insufficientPermissionError: true
            })
        } else if (errorCode === errors.InsufficientPermissionError) {
            getToasterBasedOnType(notSufficientPermissionToast)
            setTimeout(() => {
                if (this.props.loggedInUser && this.props.loggedInUser.toJS() && this.props.loggedInUser.toJS().role === config.MENTEE) {
                    this.props.history.push(`/sessions`)
                } else {
                    this.props.history.push(`/learn`)
                }
            }, 5000)
            this.setState({
                insufficientPermissionError: true
            })
        }

        if (userVideo && userVideo.toJS()) {
            this.setState({
                isVideoBookmarked: userVideo.getIn([0, 'isBookmarked']),
                userVideoId: userVideo.getIn([0, 'id']),
                selectedVideoId: idToFetch,
                isLoading: false,
                subtitleText: []
            })
        }
        this.setState({
            userVideoData: userVideoData,
        })
        if (
            userVideoData.userVideo &&
            userVideoData.userVideo.subtitle &&
            !this.state.subtitleText.length &&
            !this.state.isLoading
        ) {
            const subtitleLink = getPath(userVideoData.userVideo.subtitle.uri)
            try {
                const result = await fetch(subtitleLink)
                const subtitleText = await result.text()
                if (subtitleText) {
                    const parsedSubtitleText = parse(subtitleText)

                    const refs = parsedSubtitleText.reduce((acc, value, index) => {
                        acc[value.start] = React.createRef();
                        return acc;
                    }, {});
                    this.setState({
                        subtitleText: parsedSubtitleText,
                        refs
                    })
                }

                if (subtitleLink) {
                    this.setState({
                        subtitleLink: subtitleLink
                    })
                }
            } catch (e) {
                console.warn(e)
            }
        }
        if (userVideoData && userVideoData.userVideo && userVideoData.userVideo.videoFile) {
            let videoThumbnail = ''
            const splittedVideoUrl = userVideoData.userVideo.videoFile.uri.split(".")
            let videoUrl_480, videoUrl_720, videoUrl_1080 = ''
            const pathConfig = {
                replaceRootFolderPath: {
                    where: `${FileBucket.VIDEO_TO_TRANSCODE}/`,
                    with: `${FileBucket.PYTHON}/`
                },
            };

            if (userVideoData.userVideo.videoFile.uri.includes(FileBucket.VIDEO_TO_TRANSCODE)) this.setState({ showDefaultVideo: true })

            videoUrl_480 = getPath(`${splittedVideoUrl[0]}_480.${splittedVideoUrl[1]}`, pathConfig)
            videoUrl_720 = getPath(`${splittedVideoUrl[0]}_720.${splittedVideoUrl[1]}`, pathConfig)
            videoUrl_1080 = getPath(`${splittedVideoUrl[0]}_1080.${splittedVideoUrl[1]}`, pathConfig)

            const videoUrl = getPath(userVideoData.userVideo.videoFile.uri)

            if (userVideoData.userVideo.videoFile.thumbnail) {
                videoThumbnail = getPath(userVideoData.userVideo.videoFile.thumbnail.uri)
                if (videoThumbnail) {
                    this.setState({
                        videoThumbnail: videoThumbnail
                    })
                }
                if (videoThumbnail) {
                    fetchImage(videoThumbnail, base64Data => {
                        this.setState({
                            base64VideoThumbnail: base64Data
                        })
                    })
                }
            }

            if (videoUrl) {
                this.setState({
                    videoUrl,
                    videoUrl_480,
                    videoUrl_720,
                    videoUrl_1080
                }, () => {
                    this.onReady()
                })
            }
        }

        if (this.state.userVideoData && this.state.userVideoData.topic) {
            this.setState({
                videoTitle: get(this.state, 'userVideoData.userVideo.title'),
                videoDescription: get(this.state, 'userVideoData.userVideo.description')
            })
        }
        // we are setting showControls to true so that controls are shown by default
        this.setState({
            showControls: true
        })
        if (document.getElementById('subtitle-ul-box'))
            document.getElementById('subtitle-ul-box').addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        if (document.getElementById('subtitle-ul-box'))
            document.getElementById('subtitle-ul-box').removeEventListener('scroll', this.handleScroll);

        window.addEventListener("resize", this.handleResize);
    }

    handleScroll = (event) => {
        clearTimeout(this.video.userScrollTimeout)
        this.setState({
            isUserScrolling: true
        })
        this.video.userScrollTimeout = setTimeout(() => {
            this.setState({
                isUserScrolling: false
            })
        }, 5000)
    }

    moveCacheToNextComponent() {
        const { topicId } = this.props.match.params
        const { userTopicJourney } = this.props
        duck.merge(() => ({
            userVideo: {
                id: this.state.userVideoId,
                status: 'complete'
            },
        }), { key: `blockVideo/${topicId}` })

        duck.merge(() => ({
            userTopicJourney: {
                id: topicId,
                videos: userTopicJourney.getIn([0, 'videos']) && userTopicJourney.getIn([0, 'videos']).toJS().map(video => {
                    if (video.id === this.state.selectedVideoId) {
                        return { ...video, isUnlocked: true }
                    }
                    return video
                })
            },
            learningObjective: [{
                id: this.getNextLoId(),
                isUnlocked: true,
            }],
        }))
    }

    // method when user clicks on confirm button on skip video overlay
    // we are calling skipVideo mutation and skipping user to next section
    onSkipButtonConfirm = async () => {
        let isUnlocked = this.state.nextLearningObjective.isUnlocked
        const userId = this.props.loggedInUser.toJS().id
        const topicId = this.props.match.params.topicId
        const courseId = this.props.match.params.courseId
        if (!isUnlocked) {
            await skipVideo(
                topicId
            )
            const { learningObjectives } = this.props
            const learningObjectivesJS = learningObjectives.toJS()
            const newLearningObjectiveData = learningObjectivesJS.filter(
                learningObjectiveData => {
                    if (learningObjectiveData.id ===
                        this.state.nextLearningObjective.nextLearningObjective.id) {
                        return learningObjectiveData
                    }
                    return false
                }
            )
            isUnlocked = newLearningObjectiveData[0].isUnlocked
        }

        if (isUnlocked) {
            const { userVideo } = this.props
            if (userVideo) {
                const nextComponentId = userVideo.toJS()[0].nextComponent.learningObjective.id
                await dumpVideo(
                    userId,
                    topicId,
                    { videoAction: 'skip' },
                    null,
                    false,
                    courseId
                ).call()
                this.props.history.push(`/sessions/comic-strip/${courseId}/${topicId}/${nextComponentId}`)
            }
        }
    }

    getNextLoId = () => {
        const { userVideoData } = this.state
        const { topicComponentRule } = userVideoData
        const sortedTopicComponentRule = topicComponentRule.sort((a, b) => a.order > b.order)
        const currentTopicComponentIndex = sortedTopicComponentRule.findIndex(el => el.video && el.video.id === userVideoData.userVideo.id)
        const nextComponent = sortedTopicComponentRule[currentTopicComponentIndex + 1]
        return get(nextComponent, 'learningObjective.id')
    }

    getNextTopicComponent = () => {
        const { userVideoData } = this.state
        const { topicComponentRule } = userVideoData
        if (topicComponentRule && topicComponentRule.length) {
            let sortedTopicComponentRule = topicComponentRule.sort((a, b) => a.order > b.order)
            sortedTopicComponentRule = (sortedTopicComponentRule || []).filter(el => !['homeworkAssignment', 'quiz', 'homeworkPractice'].includes(get(el, 'componentName')))
            const currentTopicComponentIndex = sortedTopicComponentRule.findIndex(el => el.video && el.video.id === userVideoData.userVideo.id)
            const nextComponent = sortedTopicComponentRule[currentTopicComponentIndex + 1]
            return nextComponent
        }
        return null
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
        const nextComponent = this.getNextTopicComponent()
        let componentDetail = {
            title: '',
            id: ''
        }
        if (nextComponent && nextComponent.componentName === 'video') {
            const videoId = get(nextComponent, 'video.id')
            const allVideos = this.getVideoArr()
            componentDetail = {
                id: videoId,
                title: get((allVideos || []).filter(el => get(el, 'id') === videoId)[0], 'title', '')
            }
        } else if (nextComponent && nextComponent.componentName === 'learningObjective') {
            const LoRedirectKey = this.getNextLoComponent(nextComponent)
            const LoTitle = get(nextComponent, 'learningObjective.title') ? `( ${get(nextComponent, 'learningObjective.title')} )` : ''
            const LoId = get(nextComponent, 'learningObjective.id')
            componentDetail = {
                title: LoTitle,
                id: LoId
            }
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

    handleNext = async () => {
        const topicId = this.props.match.params.topicId
        const courseId = this.props.match.params.courseId
        const userId = this.props.loggedInUser.toJS().id
        const { userVideo, unlockBadge } = this.props
        const { userVideoData } = this.state
        const { topicComponentRule } = this.state.userVideoData
        if (topicComponentRule && topicComponentRule.length) {
            const nextComponent = this.getNextTopicComponent()
            if (userVideo.getIn([0, 'id'])) {
                const status = userVideo.toJS()[0].status
                if (status === 'complete') {
                    dumpVideo(
                        userId,
                        topicId,
                        { videoAction: 'next' },
                        null,
                        false,
                        courseId,
                        get(userVideoData, 'userVideo.id')
                    ).call()
                } else {
                    dumpVideo(
                        userId,
                        topicId,
                        { videoAction: 'next' },
                        null,
                        false,
                        courseId,
                        get(userVideoData, 'userVideo.id')
                    ).call()
                    this.moveCacheToNextComponent('complete')
                }
                const isRevisitRoute = this.props.match.path.includes('/revisit')
                const revistRoute = isRevisitRoute ? '/revisit' : ''
                if (nextComponent && nextComponent.componentName === 'video') {
                    this.setState({
                        pastVideoIds: [...this.state.pastVideoIds, userVideoData.userVideo.id],
                        subtitleText: []
                    })
                    this.fetchUserVideoPage(get(nextComponent, 'video.id'))
                } else {
                    const { course } = this.props
                    const sortedLoComponentRule = course && sort.ascend(course.getIn(['defaultLoComponentRule'], Map([])), ['order']).toJS()
                    const { redirectUrl } = getInSessionRoute({
                        topicComponentRule: nextComponent,
                        course: {
                            id: courseId,
                            defaultLoComponentRule: sortedLoComponentRule
                        },
                        topicId,
                        learningObjectives: this.props.learningObjectives,
                        goToNextComponent: true
                    })
                    if (redirectUrl) {
                        return this.props.history.push(redirectUrl)
                    }
                }
            }

        }
    }

    updateBookmark = () => {
        const videoData = this.state.userVideoData && this.state.userVideoData.userVideo
        this.setState({
            isVideoBookmarked: !this.state.isVideoBookmarked
        })
        clearTimeout(this.video.bookmarkTimeOut)
        this.video.bookmarkTimeOut = setTimeout(() => {
            updateUserVideo(this.state.userVideoId, {
                isBookmarked: this.state.isVideoBookmarked
            })
        }, 800)
    }


    setTimeOnPlayerSeekBar = (key, startTime, endTime) => {
        if (key !== 'none' && key !== 'revisit') {
            const startWidth = (startTime / (this.state.duration * 1000))
            const endWidth = (endTime / (this.state.duration * 1000))

            const newLeftElement = document.createElement('div');
            newLeftElement.setAttribute('class', 'jw-progress jw-reset left-lo');
            newLeftElement.style.cssText = `width:${startWidth * 100}%; background-color:#707070`;

            const newRightElement = document.createElement('div');
            newRightElement.setAttribute('class', 'jw-progress jw-reset right-lo');
            newRightElement.style.cssText = `left: ${endWidth * 100}%;width:${100 - endWidth * 100}%; background-color:#707070`;

            document.getElementsByClassName('jw-slider-container')[0].appendChild(newLeftElement)
            document.getElementsByClassName('jw-slider-container')[0].appendChild(newRightElement)
        }
    }

    /*
      Logic which determines should subtitle be disables in case learning objective is selected
      If none is selected or revisit section is selected it willl return false
    */
    shouldSubtitleDisable = (subtitleStartTime, subtitleEndTime) => {
        if (
            this.state.selectedLearningObjective !== 'none' &&
            this.state.selectedLearningObjective !== 'revisit'
        ) {
            if (
                this.state.selectedLOStartTime > subtitleEndTime ||
                this.state.selectedLOEndTime < subtitleStartTime
            ) {
                return true
            }
        }
        return false
    }

    // Logic to determine which subtitle should be hoghlighted when video plays
    shouldSubtitleHighlight = (subtitleStartTime, subtitleEndTime, index) => {
        if (!subtitleStartTime || !subtitleEndTime) return false
        const subtitleStartTimeInSec = subtitleStartTime / 1000
        const subtitleEndTimeInSec = subtitleEndTime / 1000
        const videoCurrentTimeInSec = this.state.currentTime
        if (
            videoCurrentTimeInSec >= subtitleStartTimeInSec &&
            videoCurrentTimeInSec <= subtitleEndTimeInSec &&
            !this.shouldSubtitleDisable(subtitleStartTime, subtitleEndTime) &&
            this.state.isSubtitleVisible
        ) {
            if (this.state.refs && this.state.refs[subtitleStartTime] && this.state.refs[subtitleStartTime].current) {
                const height = document.getElementById('subtitle-ul-box').clientHeight;
                const current = this.state.refs[subtitleStartTime].current
                if (isMobile() && current && current.scrollIntoView && !this.state.isUserScrolling) {
                    current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    if (current.offsetTop > height / 2 && !this.state.isUserScrolling) {
                        const scrollYPos = current.offsetTop - height / 2
                        current.parentNode.scrollTop = scrollYPos;
                    }
                }
            }
            return true
        }
        return false
    }

    getVideoDuration = (videoStartTime, videoEndTime) => {
        if (
            !isNaN(videoStartTime) &&
            !isNaN(videoEndTime) &&
            videoStartTime !== undefined &&
            videoStartTime !== '' &&
            videoStartTime !== null &&
            videoEndTime !== null &&
            (videoEndTime !== undefined && videoEndTime !== '')
        ) {
            const duration = Math.round((videoEndTime - videoStartTime) / 1000)
            return duration > 60
                ? `${Math.round((duration / 60) * 10) / 10}m`
                : `${duration}s`
        }
        return 0
    }

    // setting current time of video to a timestamp
    setVideoCurrentTime = time => {
        this.setState({
            currentTime: time
        })
        // pausing video if it is going beyond LO end time in case of LO
        if (
            this.state.selectedLearningObjective !== 'none' &&
            this.state.selectedLearningObjective !== 'revisit'
        ) {
            if (this.state.currentTime * 1000 > this.state.selectedLOEndTime) {
                window.jwplayer(this.playerId).seek(this.state.selectedLOEndTime / 1000)
                window.jwplayer(this.playerId).pause()
                this.setState({
                    paused: true
                })
            }

            if (this.state.currentTime * 1000 < this.state.selectedLOStartTime) {
                window.jwplayer(this.playerId).seek(this.state.selectedLOStartTime / 1000)
                window.jwplayer(this.playerId).pause()
                this.setState({
                    paused: true
                })
            }
        }
    }

    // method to play video at particular time
    playVideoAtTime = time => {
        if (this.state.duration) {
            window.jwplayer(this.playerId).seek(time / 1000)
            this.setState({
                isUserScrolling: false
            })
            const timeInSec = time / 1000
            this.setState({
                seekTime: timeInSec
            })
            this.setState({
                currentTime: timeInSec
            })
        }
    }

    // initializing seekTime to -1 in beginning to differentiate later
    initializeSeekTime = () => {
        this.setState({
            seekTime: -1
        })
    }
    onReady(event) {
        //write code here
        waitForGlobal('jwplayer', 200)
            .then(() => {
                const userVideo = this.state.userVideoData && this.state.userVideoData.userVideo
                if (window.jwplayer(this.playerId) && window.jwplayer(this.playerId).setup && this.state.videoUrl_720) {
                    let sources = [{
                        file: this.state.videoUrl_480,
                        label: '480'
                    }, {
                        file: this.state.videoUrl_720,
                        label: '720',
                        default: true
                    }, {
                        file: this.state.videoUrl_1080,
                        label: '1080'
                    }];
                    if (this.state.showDefaultVideo) {
                        sources.push({
                            file: this.state.videoUrl,
                            label: "default"
                        });
                    }
                    window.jwplayer(this.playerId).setup({
                        sources,
                        image: userVideo && userVideo.thumbnail && userVideo.thumbnail.uri &&
                            getPath(userVideo.thumbnail.uri),
                        tracks: [{
                            file: this.state.subtitleLink,
                            label: 'English',
                            kind: 'captions',
                            default: true,
                            style: {
                                marginTop: 50,
                                color: '#ffffff',
                                fontFamily: 'Verdana',
                                fontSize: 9
                            }
                        }],
                        autostart: false,
                        // stretching: 'exactfit'
                    })
                    window.jwplayer(this.playerId).on('ready', e => {
                        this.setState({
                            isPlayerReady: true
                        });
                        // show control bar at start
                        const controlBar = window.jwplayer(this.playerId).getContainer() &&
                            window.jwplayer(this.playerId).getContainer().querySelector('.jw-controlbar');
                        controlBar.style.display = 'flex';
                        this.initiatePlayerCallbacks()
                    });
                    window.jwplayer(this.playerId).on('error', e => {
                        const htmlVideoPlayer = document.createElement('div')
                        htmlVideoPlayer.innerHTML = `
                            <video width="100%" height="100%" id="video" class="video-js vjs-default-skin" controls data-setup='{}'>
                                <source src = "${this.state.videoUrl_480}" type = "video/mp4" label="480P" res='480'>
                                <source src = "${this.state.videoUrl_720}" type = "video/mp4" label="720P" res='720'>
                                <source src = "${this.state.videoUrl_1080}" type = "video/mp4" label="Full HD" res='1080'>
                                ${this.state.showDefaultVideo ? (`<source src = "${this.state.videoUrl}" type = "video/mp4" label="default" res='default'>`) : ''}
                                Your browser doesn't support html5 video tag.
                            </video>
                        `;
                        // htmlVideoPlayer.style.setAttribute('flex',1)
                        htmlVideoPlayer.style.flex = '1'
                        const player = document.getElementById('jwPlayer')
                        player.parentNode.replaceChild(htmlVideoPlayer, player)
                    });
                }
                window.jwplayer(this.playerId) && window.jwplayer(this.playerId).on('setupError', e => {
                    const htmlVideoPlayer = document.createElement('div')
                    htmlVideoPlayer.innerHTML = `
                    <video width="100%" height="100%" id="video" class="video-js vjs-default-skin" controls data-setup='{}'>
                        <source src = "${this.state.videoUrl_480}" type = "video/mp4" label="480P" res='480'>
                        <source src = "${this.state.videoUrl_720}" type = "video/mp4" label="720P" res='720'>
                        <source src = "${this.state.videoUrl_1080}" type = "video/mp4" label="Full HD" res='1080'>
                        ${this.state.showDefaultVideo ? (`<source src = "${this.state.videoUrl}" type = "video/mp4" label="default" res='default'>`) : ''}
                        Your browser doesn't support html5 video tag.
                    </video>
                `;
                    htmlVideoPlayer.style.flex = '1'
                    const player = document.getElementById('jwPlayer')
                    player.parentNode.replaceChild(htmlVideoPlayer, player)
                });
            }
            )
    }

    initiatePlayerCallbacks = () => {
        // player load callback
        window.jwplayer(this.playerId).on('load', e => {
            setTimeout(() => {
                if (window.jwplayer(this.playerId) && window.jwplayer(this.playerId).getDuration) {
                    this.setState({
                        duration: window.jwplayer(this.playerId).getDuration()
                    })
                }
            }, 400)
        });

        // player callback when playing
        window.jwplayer(this.playerId).on('time', e => {
            this.setVideoCurrentTime(e && e.currentTime)
            if (!this.state.duration && e) {
                this.setState({
                    duration: e.duration
                })
            }
        });
    }

    getVideoArr = () => {
        const { userVideoData } = this.state
        const { videoId } = this.props.match.params
        let topicComponentRule = get(userVideoData, 'topicComponentRule', [])
        let nestedVideosArr = []
        topicComponentRule = sortBy(topicComponentRule, 'order') || []
        if (topicComponentRule && topicComponentRule.length) {
            let tempComponentBucket = []
            topicComponentRule.forEach((componentRule, index) => {
                if (get(componentRule, 'componentName') === 'video') {
                    tempComponentBucket.push(componentRule)
                } else {
                    if (tempComponentBucket.length) {
                        nestedVideosArr.push(tempComponentBucket)
                        tempComponentBucket = []
                    }
                }
                if ((index === (topicComponentRule.length - 1)) && (tempComponentBucket.length > 0)) {
                    nestedVideosArr.push(tempComponentBucket)
                    tempComponentBucket = []
                }
            })
        }
        let videosIdArr = nestedVideosArr.filter(el => el.some(nestedEl => get(nestedEl, 'video.id') === videoId)).map(el => el && el.map(nestedEl => get(nestedEl, 'video.id')))
        if (videosIdArr && videosIdArr.length) {
            videosIdArr = videosIdArr[0]
        } else { videosIdArr = [] }
        if (userVideoData && userVideoData.allUserVideos && userVideoData.allUserVideos.length) {
            const videosArray = userVideoData.allUserVideos.filter(video => get(video, 'videoFile.uri'))
            const sortedVideoArr = sortBy(videosArray.map(video => {
                const order = get((userVideoData.topicComponentRule || []).filter(el => get(el, 'video.id') === video.id)[0], 'order')
                return {
                    order,
                    ...video
                }
            }) || [], 'order')
            if (videoId) {
                return sortedVideoArr.filter(el => videosIdArr.includes(get(el, 'id')))
            }
            return sortedVideoArr
        }
        return []
    }

    getBadgeType = (elementId) => {
        const { userVideoData } = this.state

        // if(get(userVideoData, 'userVideo.id') !== elementId){
        //     if(this.state.pastVideoIds.includes(elementId)) return 'completed'
        //     if(this.state.visitedVideos.includes(elementId)) return 'inProgress'
        //     return 'disabled'
        // }
        // if(this.state.pastVideoIds.includes(elementId)) {
        //     return 'completed'
        // }
        return 'inProgress'
    }
    getBadgeIcon = (elementId) => {
        const { userVideoData } = this.state
        return <PlayIcon />
    }

    render() {
        const { topicId } = this.props.match.params
        const { userVideoData } = this.state
        const allVideos = this.getVideoArr()
        const isLastVideo = allVideos && allVideos.length && allVideos[allVideos.length - 1].id === this.state.selectedVideoId
        if (this.state.isLoading) return <TekieLoader />
        if (this.state.windowWidth > MOBILE_BREAKPOINT) {
            return (
                <>
                    {/* <VideoBadgeStatusSkeleton/> */}
                    <div className={styles.mainContainer}>
                        <Helmet>
                            <script src={import.meta.env.REACT_APP_JW_PLAYER_URL}></script>
                        </Helmet>

                        {!this.state.insufficientPermissionError &&
                            <>
                                {!this.state.skipVideoOverlay ?
                                    <div className={styles.flexContainer}>
                                        {allVideos && allVideos.length > 1 && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
                                            {(allVideos && allVideos.length) ? allVideos.map(el => (
                                                <div
                                                    onClick={() => {
                                                        this.fetchUserVideoPage(el.id)
                                                    }}
                                                    className={cx(styles.cardAbsoluteTag)}
                                                    style={
                                                        this.state.selectedVideoId === (el.id)
                                                            ? {
                                                                border: '2px dashed #00ADE6'
                                                            } : {
                                                                border: '2px solid rgba(0,0,0,0)'
                                                            }
                                                    }
                                                >
                                                    <Badge
                                                        text={el.title}
                                                        type={this.getBadgeType(el.id)}
                                                        leftIcon
                                                    >
                                                        {this.getBadgeIcon(el.id)}
                                                    </Badge>
                                                </div>
                                            )) : <VideoBadgeStatusSkeleton />}
                                        </div>}
                                        <div className={styles.container}>
                                            <div className={styles.leftContainer}>
                                                <div className={styles.videoContainer}>
                                                    {this.state.videoUrl ?
                                                        <div id="jwPlayer" className='video-page-mixpanel-identifier' />
                                                        :
                                                        this.state.isLoading && <VideoPlayerSkeleton />
                                                    }
                                                </div>
                                            </div>
                                            <div className={styles.rightContainer}>
                                                <div className={styles.videoInfoContainer}>
                                                    {!this.state.isLoading ?
                                                        <>
                                                            <div className={styles.videoTitleContainer}>
                                                                <div className={styles.videoTitleTextContainer}>
                                                                    {this.state.videoTitle}
                                                                </div>
                                                                {/* <div className={styles.videoActionContainer}>
                                                                <div className={styles.videoBookMark}
                                                                    onClick={this.updateBookmark}
                                                                >
                                                                    <Bookmark className={styles.bookmarkIcon}
                                                                        isVideoBookmarked={this.state.isVideoBookmarked} />
                                                                </div>
                                                            </div> */}
                                                            </div>
                                                            <div className={styles.videoDescContainer}>
                                                                {this.state.videoDescription}
                                                            </div>
                                                        </> :
                                                        <VideoTitleSkeleton />
                                                    }
                                                </div>
                                                {/* {!this.state.isLoading &&
                                                <div className={styles.nextButtonContainer}
                                                >
                                                    <Button3D
                                                        title='Next'
                                                        onClick={this.handleNext}
                                                        loading={this.props.dumpVideoStatus.getIn([topicId, 'loading'])}
                                                    />
                                                </div>} */}
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <div className={styles.container}>
                                        <div className={styles.leftContainer}>
                                            <span className={styles.componentPaidText}>
                                                This video is paid. Please skip to next component.
                                            </span>
                                        </div>
                                        <div className={styles.paidComponentRightContainer}>
                                            <div className={styles.nextButtonContainer}
                                            >
                                                <Button3D
                                                    title='Next'
                                                    onClick={this.onSkipButtonConfirm}
                                                />
                                            </div>
                                        </div>
                                    </div>}
                            </>}
                    </div>
                    <NextFooter
                        match={this.props.match}
                        footerFrom={'video'}
                        loading={this.state.nextLoading}
                        nextItem={() => this.handleNext()}
                        dumpSession={() => dumpVideo(
                            this.props.loggedInUser.toJS().id,
                            this.props.match.params.topicId,
                            { videoAction: 'next' },
                            null,
                            false,
                            this.props.match.params.courseId,
                            get(userVideoData, 'userVideo.id')
                        ).call()
                        }
                        lastItem={isLastVideo}
                    >
                    </NextFooter>
                    {/* <footer className={cx(styles.nextBtnFooter, checkIfEmbedEnabled() && styles.nextBtnFooterTeacherApp)}>
                      {this.state.isLoading && !this.state.selectedVideoId?<FooterBtnSkeleton/>:<UpdatedButton onBtnClick={()=>this.handleNext()} text={`Next Up: ${this.getNextComponentDetails().title}`}  isLoading={false} rightIcon><ArrowForward color='white'/></UpdatedButton>}
                </footer> */}
                </>
            )
        }
        else {
            return (
                <div>
                    <div style={{ marginTop: '60px' }}>
                        <Helmet>
                            <script src={import.meta.env.REACT_APP_JW_PLAYER_URL}></script>
                        </Helmet>

                        <div className={styles.videoContainerMobile}>
                            {this.state.videoUrl ?
                                <div id="jwPlayer" />
                                :
                                this.state.isLoading && <VideoPlayerSkeletonMobile />
                            }
                        </div>

                        {(this.state.videoUrl && !this.state.isLoading) ?
                            <div className={styles.description} >
                                <div className={styles.redCircle} ></div>
                                <div className={styles.descriptionHeading} >
                                    {this.state.videoTitle}
                                </div>
                                <div>
                                    {this.state.videoDescription}
                                </div>
                            </div>
                            :
                            <div />
                        }
                    </div>
                </div>
            )
        }
    }
}

export default Video
