import React, { Component } from 'react'
import styles from './Video.module.scss'
import { NextButton } from '../../components/Buttons/NextButton'
import fetchVideoPage from '../../queries/fetchVideoPage'
import dumpVideo from '../../queries/dumpVideo'
import { parse, toSrtTime } from 'subtitle'
import { filter, get, sortBy } from 'lodash'
import getPath from '../../utils/getPath'
import errors from '../../utils/errors'
import fetchImage from '../../utils/fetchImage'
import skipVideo from '../../queries/skipVideo'
import updateUserVideo from '../../queries/updateUserVideo'
import Bookmark from '../../assets/video_bookmark_icon'
import Like from '../../assets/video_like_icon'
import cx from "classnames";
import { List, Map } from "immutable";
import { filterKey, waitForGlobal } from '../../utils/data-utils'
import duck from '../../duck'
import { notSufficientPermission, pageDoesNotExist, componentIsLocked } from '../../constants/video/messages'
import { getToasterBasedOnType, Toaster } from "../../components/Toaster";
import VideoPlayerSkeleton from "./videoPlayerSkeleton";
import VideoTitleSkeleton from "./videoTitleSkeleton";
import SubtitleBoxSkeleton from "./subtitleBoxSkeleton";
import config from "../../config";
import { Helmet } from 'react-helmet'
import fetchBadge from '../../queries/fetchBadge'
import { sort } from '../../utils/immutable'
import mentorMenteeSessionAddOrDelete from '../../utils/mmSessionAddOrDelete'
import { getActiveBatchDetail } from '../../utils/multipleBatch-utils'


// Method to construct data obtained in userVideo and topics, LOs etc as per needed in view
const getUserVideoData = async (
    userVideo,
    learningObjectives,
    topics,
    topicId
) => {
    const resultData = {}
    if (userVideo && learningObjectives && topics && topicId) {
        const userVideoJS = userVideo.toJS()
        const learningObjectivesJS = learningObjectives.toJS()
        const topicsJS = topics.toJS()
        const userVideoData = userVideoJS.filter(
            userVideoData => userVideoData.topic.id === topicId
        )
        resultData.userVideo = userVideoData[0]
        const topicData = topicsJS.filter(topicData => topicData.id === topicId)
        resultData.topic = topicData[0]
        if (
            userVideoData[0] &&
            userVideoData[0].nextComponent &&
            userVideoData[0].nextComponent.learningObjective
        ) {
            const nextComponentData = learningObjectivesJS.filter(
                learningObjectiveData =>
                    learningObjectiveData.id ===
                    userVideoData[0].nextComponent.learningObjective.id
            )
            resultData.nextComponent = nextComponentData[0]
        }
        if (topicData[0] && topicData[0].learningObjectives) {
            const learningObjectivesData = []
            topicData[0].learningObjectives.forEach(learningObjective => {
                const learningObjectiveData = learningObjectivesJS.filter(
                    loData => loData.id === learningObjective.id
                )
                learningObjectivesData.push(learningObjectiveData[0])
            })
            resultData.learningObjectives = learningObjectivesData
        }
    }

    return resultData
}

const getLearningObjectiveDataById = (learningObjectivesData, loId) => {
    if (!learningObjectivesData || !learningObjectivesData.length || !loId) {
        return {}
    }
    return filter(learningObjectivesData, { id: loId })[0]
}

const getJWPlayerId = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
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
        }

        // each instance of <ReactJWPlayer> needs a unique id.
        // we randomly generate it here and assign to the container instance.
        this.playerId = "jwPlayer";
    }

    video = {
        bookmarkTimeOut: null,
        likeTimeOut: null,
        userScrollTimeout: null
    }

    async componentDidMount() {
        const userId = this.props.loggedInUser.toJS().id
        const topicId = this.props.match.params.topicId
        const { path } = this.props.match
        const prevTopicId = this.props.location.state && this.props.location.state.prevTopicId
        const { studentProfile } = this.props
        const nextLO = sort.ascend(
            filterKey(
                this.props.learningObjectives,
                `topicJourney/${topicId}`
            ) || List([]), ['order']
        )
        // const isBatch = studentProfile
        //     ? get(studentProfile.toJS(), 'batch.id') &&
        //         (
        //             get(studentProfile.toJS(), 'batch.type') === 'b2b' ||
        //             get(studentProfile.toJS(), 'batch.type') === 'b2b2c'
        //         )
        //     : false
        const batchDetail = getActiveBatchDetail(studentProfile && get(studentProfile.toJS(), 'batch'))
        const isBatch = get(batchDetail, 'id')

        if (path === '/sessions/video/:topicId') {
            await fetchVideoPage(userId, topicId, 'published', 'withMenteeMentorToken', true).call()
        } else if (path === '/sessions/video/:topicId/:learningObjectiveId') {
            if (prevTopicId) {
                await fetchVideoPage(userId, prevTopicId, 'published', 'withMenteeMentorToken', true).call()
            } else {
                await fetchVideoPage(userId, topicId, 'published', 'withMenteeMentorToken').call()
            }
        } else {
            await fetchVideoPage(userId, topicId, 'published').call()
        }

        const { userVideo, learningObjectives, topics, userTopicJourney, errors: backendErrors } = this.props
        // calling method to get respective data from respective state
        const userVideoData = await getUserVideoData(
            userVideo,
            learningObjectives,
            topics,
            prevTopicId || topicId
        )
        let errorCode = ''
        if (this.props.videoFetchStatus && this.props.videoFetchStatus.get('failure')) {
            errorCode = backendErrors && backendErrors.getIn([backendErrors.size - 1, 'error', 'errors', 0, 'code'])
        }
        mentorMenteeSessionAddOrDelete(userId, prevTopicId || topicId, '', 'started', 'other', null, false)
        if (errorCode === errors.DatabaseRecordNotFoundError) {
            getToasterBasedOnType(pageDoesNotExistToast)
            setTimeout(() => {
                this.props.history.push(`/`)
            }, 2000)
            this.setState({
                insufficientPermissionError: true
            })
        } else if (errorCode === errors.ComponentLockedError) {
            if (isBatch) {
                if (this.props.match.path === '/revisit/sessions/video/:topicId') {
                    this.props.history.push(`/revisit/sessions/chat/${topicId}/${nextLO.getIn(['0', 'id'])}`)
                } else {
                    this.props.history.push(`/sessions/chat/${topicId}/${nextLO.getIn(['0', 'id'])}`)
                }
            } else {
                getToasterBasedOnType(componentIsLockedError)
                setTimeout(() => {
                    if (this.props.loggedInUser && this.props.loggedInUser.toJS() && this.props.loggedInUser.toJS().role === config.MENTEE) {
                        this.props.history.push(`/sessions`)
                    } else {
                        this.props.history.push(`/learn`)
                    }
                }, 5000)
            }
            this.setState({
                insufficientPermissionError: true
            })
        }


        // Logic to check if video is paid, if yes, then show skip to next section pop up
        const userTopicJourneyJS = userTopicJourney.toJS()
        if (!userVideoData.userVideo && userTopicJourneyJS && userTopicJourneyJS.length && userTopicJourneyJS[0].learningObjectives) {
            const loArray = []
            const learningObjectivesJS = learningObjectives.toJS()
            learningObjectivesJS && learningObjectivesJS.length && learningObjectivesJS.forEach((learningObjectiveElem) => {
                userTopicJourneyJS[0].learningObjectives.forEach((learningObjectiveInJourney) => {
                    if (learningObjectiveElem.id === learningObjectiveInJourney.id) {
                        loArray.push(learningObjectiveElem)
                    }
                })
            })
            loArray.sort((a, b) => a.order - b.order)
            userVideoData.nextComponent = loArray[0]
            const videoThumbnail = getPath(get(userVideoData, 'topic.videoThumbnail.uri'))

            if (errorCode === errors.InsufficientPermissionError) {
                getToasterBasedOnType(notSufficientPermissionToast)
                setTimeout(() => {
                    this.props.history.push(`/`)
                }, 2000)
                this.setState({
                    nextLearningObjective: loArray[0],
                    videoThumbnail: videoThumbnail,
                    videoTitle: userVideoData.topic.videoTitle,
                    videoDescription: userVideoData.topic.videoDescription,
                    insufficientPermissionError: true
                })
            } else if (errorCode === errors.PaidComponentLockedError) {
                this.setState({
                    skipVideoOverlay: true,
                    nextLearningObjective: loArray[0],
                    videoThumbnail: videoThumbnail,
                    videoTitle: userVideoData.topic.videoTitle,
                    videoDescription: userVideoData.topic.videoDescription,
                    isPaid: true
                })
            } else {
                this.setState({
                    nextLearningObjective: loArray[0],
                    videoThumbnail: videoThumbnail,
                    videoTitle: userVideoData.topic.videoTitle,
                    videoDescription: userVideoData.topic.videoDescription,
                    isPaid: true
                })
            }
        }

        if (userVideoData && userVideoData.userVideo) {
            this.setState({
                isVideoBookmarked: userVideoData.userVideo.isBookmarked,
                isVideoLiked: userVideoData.userVideo.isLiked,
                isLoading: false
            })
        }

        this.setState({
            userVideoData: userVideoData
        })
        if (
            userVideoData &&
            userVideoData.topic &&
            userVideoData.topic.videoSubtitle &&
            !this.state.subtitleText.length
        ) {
            const subtitleLink = getPath(userVideoData.topic.videoSubtitle.uri)
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
                console.log(e)
            }
        }
        if (userVideoData && userVideoData.topic && userVideoData.topic.video) {
            let videoThumbnail = ''
            const splittedVideoUrl = userVideoData.topic.video.uri.split(".")
            let videoUrl_480, videoUrl_720, videoUrl_1080 = ''

            videoUrl_480 = getPath(`${splittedVideoUrl[0]}_480.${splittedVideoUrl[1]}`)
            videoUrl_720 = getPath(`${splittedVideoUrl[0]}_720.${splittedVideoUrl[1]}`)
            videoUrl_1080 = getPath(`${splittedVideoUrl[0]}_1080.${splittedVideoUrl[1]}`)

            const videoUrl = getPath(userVideoData.topic.video.uri)

            if (userVideoData.topic.videoThumbnail) {
                videoThumbnail = getPath(userVideoData.topic.videoThumbnail.uri)
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
            // if loId is coming in routes such as for recommended video
            const learningObjectiveIdInURL = this.props.match.params.learningObjectiveId
            if (learningObjectiveIdInURL) {
                const loId = this.props.match.params.learningObjectiveId
                const selectedLearningObjectiveData = getLearningObjectiveDataById(
                    this.state.userVideoData.learningObjectives,
                    loId
                )
                this.setState({
                    selectedLearningObjectiveData,
                    selectedLOStartTime: selectedLearningObjectiveData && selectedLearningObjectiveData.videoStartTime,
                    selectedLOEndTime: selectedLearningObjectiveData && selectedLearningObjectiveData.videoEndTime,
                    videoTitle: selectedLearningObjectiveData && selectedLearningObjectiveData.title,
                    selectedLearningObjective: loId
                })
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

        // show lo title if routed through recommendation
        if (!this.state.isRecommendedLO && this.state.userVideoData && this.state.userVideoData.topic) {
            this.setState({
                videoTitle: this.state.userVideoData.topic.videoTitle,
                videoDescription: this.state.userVideoData.topic.videoDescription
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

    moveCacheToNextComponent(status) {
        const nextComponent = this.state.userVideoData.nextComponent
        duck.merge(() => ({
            currentTopicComponent: 'message',
            currentTopicComponentDetail: {
                currentLearningObjectiveId: nextComponent.id,
                componentTitle: nextComponent.title,
                thumbnail: nextComponent.thumbnail,
                description: nextComponent.description,
                percentageCovered: (1 / ((this.props.learningObjectives.size * 2) + 2)) * 100
            },
            userVideo: {
                id: this.props.userVideo.toJS()[0].id,
                status
            }
        }))
    }


    async componentDidUpdate(prevProps) {
        const topicId = this.props.match.params.topicId
        if (this.props.dumpVideoStatus &&
            prevProps.dumpVideoStatus &&
            this.props.dumpVideoStatus.toJS()[topicId] &&
            prevProps.dumpVideoStatus.toJS()[topicId]
        ) {
            const currentStatus = this.props.dumpVideoStatus.toJS()[topicId].success
            const prevStatus = prevProps.dumpVideoStatus.toJS()[topicId].success
            if (currentStatus && !prevStatus) {
                if (this.props.match.path === '/sessions/video/:topicId')
                    this.props.history.push(`/sessions/video/${topicId}/discussion`)
            }
        }

        const { userVideo, learningObjectives, topics } = this.props
        // calling method to get respective data from respective state
        if (!prevProps.userVideo.equals(userVideo)) {
            const userVideoData = await getUserVideoData(
                userVideo,
                learningObjectives,
                topics,
                topicId
            )
            this.setState({
                userVideoData: userVideoData
            })
        }

        const video = userVideo.find(video =>
            video.getIn(['topic', 'id']) === topicId
        ) || Map({})

        if (video.get('id') && this.state.skipVideoOverlay) {
            this.setState({ skipVideoOverlay: false })
        }

    }

    // method when user clicks on confirm button on skip video overlay
    // we are calling skipVideo mutation and skipping user to next section
    onSkipButtonConfirm = async () => {
        let isUnlocked = this.state.nextLearningObjective.isUnlocked
        const userId = this.props.loggedInUser.toJS().id
        const topicId = this.props.match.params.topicId
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
                    nextComponentId
                ).call()
                this.props.history.push(`/sessions/chat/${topicId}/${nextComponentId}`)
            }
        }
    }

    handleNext = async () => {
        const userId = this.props.loggedInUser.toJS().id
        const topicId = this.props.match.params.topicId
        const { userVideo, unlockBadge } = this.props
        const badgeInCache = unlockBadge &&
            filterKey(unlockBadge, `unlockBadge/video/${topicId}`)
        let badge;
        if (userVideo.getIn([0, 'id'])) {
            const nextComponentId = userVideo.toJS()[0].nextComponent.learningObjective.id
            const status = userVideo.toJS()[0].status
            let data = {}
            if (badgeInCache && !badgeInCache.size) {
                //directly assigning the destructured variables to local variables
                badge = this.props.unlockBadge && filterKey(this.props.unlockBadge, `unlockBadge/video/${topicId}`)
            }
            if (status === 'complete') {
                dumpVideo(
                    userId,
                    topicId,
                    { videoAction: 'next' },
                    nextComponentId
                ).call()

            } else {
                let retryCount = 3
                async function dumpVideoWithRetry() {
                    data = await dumpVideo(
                        userId,
                        topicId,
                        { videoAction: 'next' },
                        nextComponentId
                    ).call()
                    if (!get(data, 'addUserActivityVideoDump.id') && retryCount > 1) {
                        retryCount -= 1
                        await dumpVideoWithRetry()
                    }
                }

                await dumpVideoWithRetry()
                if (get(data, 'addUserActivityVideoDump.id')) {
                    duck.merge(() => ({
                        learningObjective: [{
                            id: nextComponentId,
                            isUnlocked: true,
                        }],
                    }))
                    this.moveCacheToNextComponent('complete')
                }
            }
            if (status === 'complete' || get(data, 'addUserActivityVideoDump.id')) {
                if (this.props.match.path === '/sessions/video/:topicId') {
                    this.props.history.push(`/sessions/video/${topicId}/discussion`, {
                        unlockBadge: badge || (badgeInCache && get(badgeInCache.toJS(), '0.badge'))
                    })
                } else if (this.props.match.path === '/revisit/sessions/video/:topicId') {
                    this.props.history.push(`/revisit/sessions/chat/${topicId}/${nextComponentId}`)
                } else {
                    this.props.history.push(`/chat/${topicId}/${nextComponentId}`, {
                        unlockBadge: badge || (badgeInCache && get(badgeInCache.toJS(), '0.badge'))
                    })
                }
            }
        }
    }

    getSkipVideo = () => {
        const userId = this.props.loggedInUser.toJS().id
        const topicId = this.props.match.params.topicId
        if (this.state.insufficientPermissionError) {
            return {
                title: 'Video is locked !!',
                description: 'Ask your mentor to unlock the video',
                buttonText: 'Go Back',
                cancelButtonText: 'Refresh',
                cancelButton: true,
                onCancel: async () => {
                    await fetchVideoPage(
                        userId,
                        topicId,
                        'published'
                    )
                },
                buttonAction: async () => {
                    this.props.history.goBack();
                }
            }
        }
        return {
            title: 'Video is Paid !!',
            description: 'Please continue to the next free section',
            buttonText: 'Next',
            buttonAction: this.onSkipButtonConfirm,
            cancelButton: false
        }
    }

    updateBookmark = () => {
        const videoData = this.state.userVideoData && this.state.userVideoData.userVideo
        this.setState({
            isVideoBookmarked: !this.state.isVideoBookmarked
        })
        clearTimeout(this.video.bookmarkTimeOut)
        this.video.bookmarkTimeOut = setTimeout(() => {
            updateUserVideo(videoData.id, {
                isBookmarked: this.state.isVideoBookmarked
            })
        }, 800)
    }

    updateLike = () => {
        const videoData = this.state.userVideoData && this.state.userVideoData.userVideo
        this.setState({
            isVideoLiked: !this.state.isVideoLiked
        })
        clearTimeout(this.video.likeTimeOut)
        this.video.likeTimeOut = setTimeout(() => {
            updateUserVideo(videoData.id, {
                isLiked: this.state.isVideoLiked
            })
        }, 800)
    }

    /*
Logic when user clicks one of the learning objective
setting state according to the learning objective clicked and further actions
will be performed on basis of that
*/
    onLearningObjectiveClick = (startTime, endTime, key, title) => {
        // play video
        this.playVideoAtTime(startTime)
        this.setState({
            selectedLOStartTime: 0
        })
        if (startTime) {
            this.setState({
                selectedLOStartTime: startTime
            })
        }
        if (endTime) {
            this.setState({
                selectedLOEndTime: endTime
            })
        }
        if (key) {
            this.setState({
                selectedLearningObjective: key
            })
        }
        if (title) {
            this.setState({
                videoTitle: title
            })
        }
        // to handle case when user reaches the video through recommendation
        this.setState({
            isRecommendedLO: false
        })

        if (document.getElementsByClassName('left-lo')[0]) {
            document.getElementsByClassName('left-lo')[0].remove()
        }

        if (document.getElementsByClassName('right-lo')[0]) {
            document.getElementsByClassName('right-lo')[0].remove()
        }

        if (
            this.state.duration
        ) {
            this.setTimeOnPlayerSeekBar(key, startTime, endTime)
        } else {
            // retry after 1 sec
            setTimeout(() => {
                this.state.duration && this.setTimeOnPlayerSeekBar(key, startTime, endTime)
            }, 1000)
        }
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
                if (current.offsetTop > height / 2 && !this.state.isUserScrolling) {
                    const scrollYPos = current.offsetTop - height / 2
                    current.parentNode.scrollTop = scrollYPos;
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
                const topicData = this.state.userVideoData && this.state.userVideoData.topic
                if (window.jwplayer(this.playerId) && window.jwplayer(this.playerId).setup && this.state.videoUrl_720) {
                    window.jwplayer(this.playerId).setup({
                        sources: [{
                            file: this.state.videoUrl_480,
                            label: '480'
                        }, {
                            file: this.state.videoUrl_720,
                            label: '720',
                            default: true
                        }, {
                            file: this.state.videoUrl_1080,
                            label: '1080'
                        }],
                        image: topicData && topicData.videoThumbnail && topicData.videoThumbnail.uri &&
                            getPath(topicData.videoThumbnail.uri),
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
                        console.log('-----Sorry for the inconvenience-----')
                        const htmlVideoPlayer = document.createElement('div')
                        htmlVideoPlayer.innerHTML = `
                        <video width="100%" height="100%" id="video" class="video-js vjs-default-skin" controls data-setup='{}'>
                            <source src = "${this.state.videoUrl_480}" type = "video/mp4" label="480P" res='480'>
                            <source src = "${this.state.videoUrl_720}" type = "video/mp4" label="720P" res='720'>
                            <source src = "${this.state.videoUrl_1080}" type = "video/mp4" label="Full HD" res='1080'>
                            Your browser doesn't support html5 video tag.
                        </video>
                    `
                        const player = document.getElementById('jwPlayer')
                        player.parentNode.replaceChild(htmlVideoPlayer, player)
                    });
                }
                window.jwplayer(this.playerId) && window.jwplayer(this.playerId).on('setupError', e => {
                    console.log('-----Sorry for the inconvenience, setup error-----')
                    const htmlVideoPlayer = document.createElement('div')
                    htmlVideoPlayer.innerHTML = `
                    <video width="100%" height="100%" id="video" class="video-js vjs-default-skin" controls data-setup='{}'>
                        <source src = "${this.state.videoUrl_480}" type = "video/mp4" label="480P" res='480'>
                        <source src = "${this.state.videoUrl_720}" type = "video/mp4" label="720P" res='720'>
                        <source src = "${this.state.videoUrl_1080}" type = "video/mp4" label="Full HD" res='1080'>
                        Your browser doesn't support html5 video tag.
                    </video>
                `
                    const player = document.getElementById('jwPlayer')
                    player.parentNode.replaceChild(htmlVideoPlayer, player)
                });
            })
    }

    initiatePlayerCallbacks = () => {
        // player load callback
        window.jwplayer(this.playerId).on('load', e => {
            setTimeout(() => {
                if (window.jwplayer(this.playerId) && window.jwplayer(this.playerId).getDuration) {
                    this.setState({
                        duration: window.jwplayer(this.playerId).getDuration()
                    })
                    if (!this.state.isVideoLoaded && this.props.match.params.learningObjectiveId) {
                        this.setState({
                            isVideoLoaded: true
                        })
                        this.onLearningObjectiveClick(
                            this.state.selectedLOStartTime,
                            this.state.selectedLOEndTime,
                            this.state.selectedLearningObjective,
                            this.state.videoTitle
                        )
                        this.playVideoAtTime(this.state.selectedLOStartTime)
                    }
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
                if (!this.state.isVideoLoaded && this.props.match.params.learningObjectiveId) {
                    this.setState({
                        isVideoLoaded: true
                    })
                    this.onLearningObjectiveClick(
                        this.state.selectedLOStartTime,
                        this.state.selectedLOEndTime,
                        this.state.selectedLearningObjective,
                        this.state.videoTitle
                    )
                    this.playVideoAtTime(this.state.selectedLOStartTime)
                }
            }
        });
    }

    render() {
        const { topicId } = this.props.match.params
        const topicData = this.state.userVideoData && this.state.userVideoData.topic
        const learningObjectivesData = this.state.userVideoData && this.state.userVideoData.learningObjectives
        const playlist = [{
            file: this.state.videoUrl,
            image: topicData && topicData.videoThumbnail && topicData.videoThumbnail.uri &&
                getPath(topicData.videoThumbnail.uri),
            tracks: [{
                file: this.state.subtitleLink,
                label: 'English',
                kind: 'captions',
                'default': true,
                style: {
                    marginTop: 50,
                    color: 'white',
                    fontFamily: 'Verdana',
                    backgroundOpacity: 70,
                    fontSize: '50%'
                }
            }],
            isAutoPlay: false,
        }];

        return (
            <div className={styles.mainContainer}>
                <Helmet>
                    <script src={import.meta.env.REACT_APP_JW_PLAYER_URL}></script>
                </Helmet>
                <Toaster />
                {!this.state.insufficientPermissionError &&
                    <>
                        {!this.state.skipVideoOverlay ?
                            <div className={styles.container}>
                                <div className={styles.leftContainer}>
                                    <div className={styles.videoContainer}>
                                        {this.state.videoUrl ?
                                            <div id="jwPlayer" />
                                            :
                                            this.state.isLoading && <VideoPlayerSkeleton />
                                        }
                                    </div>
                                    <div className={styles.videoInfoContainer}>
                                        {!this.state.isLoading ?
                                            <>
                                                <div className={styles.videoTitleContainer}>
                                                    <div className={styles.videoTitleTextContainer}>
                                                        {this.state.videoTitle}
                                                    </div>
                                                    <div className={styles.videoActionContainer}>
                                                        <div className={styles.videoLike}
                                                            onClick={this.updateLike}
                                                        >
                                                            <Like className={styles.likeIcon}
                                                                isVideoLiked={this.state.isVideoLiked} />
                                                        </div>
                                                        <div className={styles.videoBookMark}
                                                            onClick={this.updateBookmark}
                                                        >
                                                            <Bookmark className={styles.bookmarkIcon}
                                                                isVideoBookmarked={this.state.isVideoBookmarked} />
                                                        </div>
                                                        {/*<div className={styles.videoShare}>
                                            <Share className={styles.shareIcon} />
                                        </div>*/}
                                                    </div>
                                                </div>
                                                <div className={styles.videoDescContainer}>
                                                    {this.state.videoDescription}
                                                </div>
                                            </> :
                                            <VideoTitleSkeleton />
                                        }
                                    </div>
                                </div>
                                <div className={styles.rightContainer}>
                                    {!this.state.isLoading ?
                                        <div className={styles.subtitleContainer}>
                                            <div className={styles.subtitleHeaderContainer}>
                                                <>
                                                    <div
                                                        className={this.state.isSubtitleVisible ?
                                                            cx(styles.subtitleHeaderText, styles.activeRightHeaderText) :
                                                            cx(styles.subtitleHeaderText)
                                                        }
                                                        onClick={() => {
                                                            this.setState({
                                                                isSubtitleVisible: true
                                                            })
                                                        }}
                                                    >
                                                        Script
                                                    </div>
                                                    <div
                                                        className={this.state.isSubtitleVisible ?
                                                            cx(styles.loHeaderText) :
                                                            cx(styles.loHeaderText, styles.activeRightHeaderText)
                                                        }
                                                        onClick={() => {
                                                            this.setState({
                                                                isSubtitleVisible: false
                                                            })
                                                        }}
                                                    >
                                                        Learning
                                                    </div>
                                                </>
                                            </div>
                                            <div className={styles.subtitleBodyContainer}>
                                                {this.state.isSubtitleVisible ?
                                                    <ul className={styles.subtitleScrollContainer} id={'subtitle-ul-box'}>
                                                        {this.state.subtitleText && this.state.subtitleText.length > 1 ? this.state.subtitleText.map((subtitle, index) => (
                                                            <li
                                                                className={cx(styles.scriptBox,
                                                                    this.shouldSubtitleHighlight(
                                                                        subtitle.start,
                                                                        subtitle.end,
                                                                        index
                                                                    ) && styles.subtitleBoxHighlight,
                                                                    this.shouldSubtitleDisable(subtitle.start, subtitle.end) &&
                                                                    styles.subtitleDisable
                                                                )}
                                                                key={subtitle.start}
                                                                onClick={() => {
                                                                    !this.shouldSubtitleDisable(subtitle.start, subtitle.end) &&
                                                                        this.playVideoAtTime(subtitle.start)
                                                                }}
                                                                ref={this.state.refs[subtitle.start]}
                                                            >
                                                                <div className={styles.scriptTextContainer}>
                                                                    <span
                                                                        className={cx(styles.scriptText,
                                                                            this.shouldSubtitleHighlight(
                                                                                subtitle.start,
                                                                                subtitle.end
                                                                            ) && styles.subtitleTextHighlight
                                                                        )}
                                                                    >
                                                                        {subtitle &&
                                                                            subtitle.start &&
                                                                            toSrtTime(subtitle.start).substring(
                                                                                3,
                                                                                toSrtTime(subtitle.start).indexOf(',')
                                                                            )}
                                                                    </span>
                                                                </div>
                                                                <span
                                                                    className={cx(styles.scriptRightText,
                                                                        this.shouldSubtitleHighlight(
                                                                            subtitle.start,
                                                                            subtitle.end
                                                                        ) && styles.subtitleTextHighlight
                                                                    )}
                                                                >
                                                                    {subtitle.text}
                                                                </span>
                                                            </li>
                                                        )) :
                                                            <>
                                                                <li className={styles.emptySubtitleContainer} />
                                                                <li className={styles.emptySubtitleContainer} />
                                                                <li className={styles.emptySubtitleContainer} />
                                                                <li className={styles.emptySubtitleContainer} />
                                                                <li className={styles.emptySubtitleContainer} />
                                                                <li className={styles.emptySubtitleContainer} />
                                                                <li className={styles.emptySubtitleContainer} />
                                                                <li className={styles.emptySubtitleContainer} />
                                                                <li className={styles.emptySubtitleContainer} />
                                                                <li className={styles.emptySubtitleContainer} />
                                                                <li className={styles.emptySubtitleContainer} />
                                                                <li className={styles.emptySubtitleContainer} />
                                                                <li className={styles.emptySubtitleContainer} />
                                                                <li className={styles.emptySubtitleContainer} />
                                                            </>
                                                        }
                                                    </ul>
                                                    :
                                                    <ul className={styles.subtitleScrollContainer}>
                                                        <li key='revisit'>
                                                            <div className={styles.greyLine} />
                                                            <div
                                                                onClick={() => {
                                                                    this.onLearningObjectiveClick(
                                                                        0,
                                                                        this.state.duration,
                                                                        'revisit',
                                                                        topicData && topicData.videoTitle
                                                                    )
                                                                }}
                                                            >
                                                                <div
                                                                    className={
                                                                        cx(styles.learningObjectiveBox, this.state.selectedLearningObjective === 'revisit' &&
                                                                            styles.subtitleBoxHighlight)
                                                                    }
                                                                >
                                                                    <div className={styles.learningObjectiveThumbnailBox}>
                                                                        <img
                                                                            src={topicData && topicData.videoThumbnail && topicData.videoThumbnail.uri &&
                                                                                getPath(topicData.videoThumbnail.uri)}
                                                                            className={styles.learningObjectiveThumbnail}
                                                                            alt='Learning Objective Thumbnail'
                                                                        />
                                                                        <div className={styles.playIcon} />
                                                                    </div>

                                                                    <span
                                                                        className={cx(
                                                                            styles.learningObjectiveText,
                                                                            this.state.selectedLearningObjective === 'revisit' &&
                                                                            styles.subtitleTextHighlight
                                                                        )}
                                                                    >
                                                                        Revisit
                                                                    </span>

                                                                    <div
                                                                        className={styles.learningObjectiveTime}
                                                                    >
                                                                        <span className={styles.learningObjectiveTimeText}>
                                                                            {this.getVideoDuration(
                                                                                parseFloat(topicData && topicData.videoStartTime, 10),
                                                                                parseFloat(topicData && topicData.videoEndTime, 10)
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>

                                                        {learningObjectivesData && learningObjectivesData.length &&
                                                            sortBy(learningObjectivesData, ['order']).map(
                                                                learningObjective =>
                                                                    learningObjective.id && (
                                                                        <li key={learningObjective.id}>
                                                                            <div className={styles.greyLine} />
                                                                            <div
                                                                                onClick={() => {
                                                                                    this.onLearningObjectiveClick(
                                                                                        learningObjective.videoStartTime,
                                                                                        learningObjective.videoEndTime,
                                                                                        learningObjective.id,
                                                                                        learningObjective.title
                                                                                    )
                                                                                }}
                                                                            >
                                                                                <div
                                                                                    className={
                                                                                        cx(styles.learningObjectiveBox, this.state.selectedLearningObjective === learningObjective.id &&
                                                                                            styles.subtitleBoxHighlight)
                                                                                    }
                                                                                >
                                                                                    <div
                                                                                        className={styles.learningObjectiveThumbnailBox}>
                                                                                        <img
                                                                                            src={learningObjective.videoThumbnail && learningObjective.videoThumbnail.uri &&
                                                                                                getPath(learningObjective.videoThumbnail.uri)}
                                                                                            className={styles.learningObjectiveThumbnail}
                                                                                            alt='Learning Objective Thumbnail'
                                                                                        />
                                                                                        <div className={styles.playIcon} />
                                                                                    </div>

                                                                                    <span
                                                                                        className={cx(
                                                                                            styles.learningObjectiveText,
                                                                                            this.state.selectedLearningObjective === learningObjective.id &&
                                                                                            styles.subtitleTextHighlight
                                                                                        )}
                                                                                    >
                                                                                        {learningObjective.title}
                                                                                    </span>

                                                                                    <div
                                                                                        className={styles.learningObjectiveTime}
                                                                                    >
                                                                                        <span className={styles.learningObjectiveTimeText}>
                                                                                            {this.getVideoDuration(
                                                                                                parseFloat(learningObjective.videoStartTime, 10),
                                                                                                parseFloat(learningObjective.videoEndTime, 10)
                                                                                            )}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </li>
                                                                    )
                                                            )
                                                        }
                                                    </ul>
                                                }
                                            </div>
                                        </div>
                                        :
                                        <SubtitleBoxSkeleton />
                                    }
                                    {!this.state.isLoading &&
                                        <div className={styles.nextButtonContainer}
                                            onClick={this.handleNext}
                                        >
                                            <NextButton
                                                title='Next'
                                                loading={this.props.dumpVideoStatus.getIn([topicId, 'loading'])}
                                            />
                                        </div>}
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
                                        onClick={this.onSkipButtonConfirm}
                                    >
                                        <NextButton
                                            title='Skip'
                                        />
                                    </div>
                                </div>
                            </div>}
                    </>}
            </div>
        )
    }
}

export default Video
