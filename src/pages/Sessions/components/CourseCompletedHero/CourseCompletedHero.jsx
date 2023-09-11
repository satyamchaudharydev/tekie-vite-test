import React, { Component } from 'react'
import { capitalize, get, range } from 'lodash'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import ReactToolTip from 'react-tooltip'
import { Document, Page, pdfjs } from 'react-pdf';
import { ImageBackground } from '../../../../image'
import { List } from 'immutable'
import { filterKey } from '../../../../utils/data-utils'
import { ReactComponent as StarActive } from '../../assets/starActive.svg'
import { ReactComponent as StarInActive } from '../../assets/starInActive.svg'
import ShareOverlay from '../../../Invite/component/ShareOverlay/ShareOverlay'
import generateCourseCompletionCertificate, { getCourseTitle } from '../../../../utils/generateCourseCompletionCertificate'
import CourseReviewModal from '../../../../components/CourseReviewModal'
import CourseCompletionCertificateModal from '../../../../components/CourseCertificateModal'
import getPath from '../../../../utils/getPath';
import getCourseId, { getCourseName } from '../../../../utils/getCourseId'
import addUserCourseCompletion from '../../../../queries/addUserCourseCompletion'
import fetchUserCourseCompletions from '../../../../queries/sessions/fetchUserCourseCompletions'
import uploadCompletionCertificate from '../../../../queries/sessions/uploadCompletionCertificate'

import './CourseCompletedHero.scss'
import updateUserCourseCompletion from '../../../../queries/updateUserCourseCompletion'
import getIdArrForQuery from '../../../../utils/getIdArrForQuery'
import { slugifyID } from '../../../../utils/slugifyContent'

class CourseCompletedHero extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showLoader: false,
            rating: null,
            hoveredRating: 0,
            courseReviewModalVisible: false,
            courseCompletionCertificateModalVisible: false,
            blobCertificateUrl: null,
            isCertificateModalForFirstTime: false,
            isCourseRated: false,
            isCertificateGenerated: false,
            canvasImageBlob: null,
            certificateUploaded: false,
            visibleShareOverlay: false,
            shareCodeDetails: {
                id: null,
                courseName: null,
            }
        }
        this.canvasRef = React.createRef()
    }

    getUserProficiency = (userProfile) => {
        const { topicsCompleted, proficientTopicCount, masteredTopicCount } = userProfile
        const proficientTopicsPer = (proficientTopicCount / topicsCompleted) * 100
        const masterTopicsPer = (masteredTopicCount / topicsCompleted) * 100
        if (proficientTopicsPer >= 20) {
            return 'PROFICIENT'
        } else if (masterTopicsPer >= 10) {
            return 'MASTER'
        } else {
            return 'FAMILIAR'
        }
    }

    async componentDidMount() {
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
        await fetchUserCourseCompletions(this.props.loggedInUser.get('id'), true).call()
        const courseCertificateURL = this.props.userCourseCompletions.getIn([0, 'certificate', 'uri'])
        this.setState({
            courseCertificateURL: courseCertificateURL || null,
            isCertificateGenerated: courseCertificateURL && true,
            courseCompletionId: this.props.userCourseCompletions.getIn([0, 'id']),
            rating: this.props.userCourseCompletions.getIn([0, 'rating']),
            isCourseRated: typeof this.props.userCourseCompletions.getIn([0, 'rating']) === "number" && true
        })
        const { completedSessions } = this.props
        const userProfile = this.props.userProfile && this.props.userProfile.toJS()[0]
        if (completedSessions && completedSessions.length && userProfile) {
            const proficiencyLevel = await this.getUserProficiency(userProfile)
            const lastSessionDate = get(completedSessions[completedSessions.length - 1], 'endingDate')
            const blobCertificateUrl = await generateCourseCompletionCertificate(false, lastSessionDate, proficiencyLevel)
            if (blobCertificateUrl) {
                this.setState({
                    blobCertificateUrl,
                    lastSessionDate,
                    userProfile
                })
            }
        }
    }

    async componentDidUpdate(prevProps) {
        const showCourseCompletionCertificateModal = localStorage.getItem('showCourseCompletionCertificateModal')
        if (showCourseCompletionCertificateModal === "show") {
            this.setState({
                courseCompletionCertificateModalVisible: true,
                isCertificateModalForFirstTime: true
            })
            localStorage.setItem('showCourseCompletionCertificateModal', false)
        }
    }

    componentWillUnmount() {
        pdfjs.GlobalWorkerOptions.workerSrc = null
    }

    renderStar = (rating) => {
        if (this.state.rating >= rating) {
            if (this.isCourseRated()) {
                return (
                    <span className='sp-completed-ratedStar'>
                        <StarActive />
                    </span>
                )
            }
            return <StarActive />
        }
        if (this.state.hoveredRating >= rating) {
            return (
                <StarActive />
            )
        }
        return <StarInActive />
    }


    startOfWeek = (date) => {
        const day = 24 * 60 * 60 * 1000;
        const weekday = date.getDay();
        return new Date(date.getTime() - Math.abs(0 - weekday) * day);
    }

    weeksBetween = (startDate, endDate) => {
        const week = 7 * 24 * 60 * 60 * 1000;
        return Math.ceil((this.startOfWeek(endDate) - this.startOfWeek(startDate)) / week);
    }


    getCourseDurationString = (completedSessions, onlyDuration = false) => {
        let firstSessionDate = get(completedSessions[0], 'endingDate')
        let lastSessionDate = get(completedSessions[completedSessions.length - 1], 'endingDate')
        if (firstSessionDate && lastSessionDate) {
            firstSessionDate = new Date(firstSessionDate)
            lastSessionDate = new Date(lastSessionDate)
            if (onlyDuration) {
                return `${this.weeksBetween(firstSessionDate, lastSessionDate)} weeks`
            }
            if (firstSessionDate.getFullYear() < lastSessionDate.getFullYear()) {
                return `${format(firstSessionDate, 'MMM dd, yyyy')} - ${format(lastSessionDate, 'MMM dd, yyyy')} 
                (${this.weeksBetween(firstSessionDate, lastSessionDate)} weeks)`
            }
            return `${format(firstSessionDate, 'MMM dd')} - ${format(lastSessionDate, 'MMM dd, yyyy')} 
            (${this.weeksBetween(firstSessionDate, lastSessionDate)} weeks)`
        }
        return null
    }

    isCourseRated = () => {
        if (this.state.overrideCourseRated) {
            return true
        }
        if (this.state.isCourseRated) {
            return true
        }
        return false
    }


    convertCanvasToImage = () => {
        var canvasImage = this.canvasRef.current
        if (!canvasImage.toBlob) {
            var dataURL = canvasImage.toDataURL();
            var bytes = atob(dataURL.split(',')[1])
            var arr = new Uint8Array(bytes.length);
            for (var i = 0; i < bytes.length; i++) {
                arr[i] = bytes.charCodeAt(i);
            }
            const blob = new Blob([arr], { type: 'image/png' })
            const url = URL.createObjectURL(blob);
            this.setState({
                canvasImageBlob: blob,
            })
        } else {
            canvasImage.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                this.setState({
                    canvasImageBlob: blob,
                })
            });
        }
        return true
    }

    addOrUpdateUserCourseCompletion = async (comment = false, rating) => {
        const user = filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser') || List({})
        if (!user || !user.getIn([0, 'parent', 'parentProfile', 'children'])) {
            return ''
        }
        let selectedChild = user
            .getIn([0, 'parent', 'parentProfile', 'children'])
            .find(child => child.getIn(['user', 'id']) === user.getIn([0, 'id']))
        selectedChild = selectedChild && selectedChild.toJS()
        const userId = get(selectedChild, 'user.id')

        const { courseCompletionId, userProfile } = this.state
        const { completedSessions } = this.props
        const input = {
            comment: comment || '',
            courseEndingDate: format(new Date(this.state.lastSessionDate), 'MMM dd, yyyy'),
        }
        if (userProfile) {
            input.topicsCompleted = get(userProfile, 'topicsCompleted', 0)
            input.proficientTopicCount = get(userProfile, 'proficientTopicCount', 0)
            input.masteredTopicCount = get(userProfile, 'masteredTopicCount', 0)
            input.familiarTopicCount = get(userProfile, 'familiarTopicCount', 0)
        }
        if (this.getCourseDurationString(completedSessions, true)) {
            input.courseDuration = this.getCourseDurationString(completedSessions, true)
        }
        const mentorIds = getIdArrForQuery([
            ...new Set(completedSessions.filter(session => get(session, 'mentorId')).map((session) => get(session, 'mentorId')))
        ])

        if (rating) {
            input.rating = rating
        }
        if (courseCompletionId) {
            await updateUserCourseCompletion(courseCompletionId, input, mentorIds).call().then(async (res) => {
                const courseCompletionId = get(res, 'updateUserCourseCompletion.id')
                const { canvasImageBlob } = this.state
                if (courseCompletionId &&
                    canvasImageBlob &&
                    (!this.state.isCertificateGenerated && !this.state.certificateUploaded)
                ) {
                    const res = await uploadCompletionCertificate(canvasImageBlob, courseCompletionId)
                    this.setState({
                        certificateUploaded: true,
                    })
                }
            })
        } else {
            await addUserCourseCompletion(getCourseId(), userId, input, mentorIds).call().then(async (res) => {
                const courseCompletionId = get(res, 'addUserCourseCompletion.id')
                const { canvasImageBlob } = this.state
                this.setState({
                    courseCompletionId
                })
                if (courseCompletionId &&
                    canvasImageBlob &&
                    (!this.state.isCertificateGenerated && !this.state.certificateUploaded)
                ) {
                    const res = await uploadCompletionCertificate(canvasImageBlob, courseCompletionId)
                    this.setState({
                        certificateUploaded: true,
                    })
                }
            })
        }
    }

    onShareButtonClick = () => {
        const user = filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser') || List({})
        if (!user || !user.getIn([0, 'parent', 'parentProfile', 'children'])) {
            return ''
        }
        const userName = user.getIn([0, 'name'])
        if (navigator && navigator.share) {
            navigator
                .share({
                    title: `${capitalize(getCourseName())} Completion Certificate.`,
                    text: `Hi, check out my course completion certificate from Tekie.\nCourse: ${capitalize(getCourseName())}`,
                    url: `${import.meta.env.REACT_APP_TEKIE_WEB_URL}/course-completion/${this.state.courseCompletionId}`,
                })
                .then(() => console.log("Successful share"))
                .catch((error) => console.log("Error sharing", error));
        } else {
            this.setState({
                shareCodeDetails: {
                    id: this.state.courseCompletionId,
                    courseName: capitalize(getCourseName()),
                    studentName: userName
                },
                visibleShareOverlay: true
            })
        }
    }

    closeShareOverlay = () => {
        this.setState({ visibleShareOverlay: false })
    }

    getCourseCertificateShareUrl = () => {
        const { id } = this.state.shareCodeDetails
        if (id) {
            return `${import.meta.env.REACT_APP_TEKIE_WEB_URL}/course-completion/${slugifyID(id)}`
        }
        return null
    }

    render() {
        const { completedSessions } = this.props
        let mentors = completedSessions && completedSessions.filter(session => get(session, 'mentorId')).map((session) => {
            if (get(session, 'mentorName')) {
                return {
                    id: get(session, 'mentorId'),
                    name: get(session, 'mentorName'),
                    profilePic: get(session, 'mentorProfilePic.uri'),
                }
            }
            return {}
        })
        let mentorIds = mentors.map(mentor => mentor.id)
        mentors = mentors.filter(({ id }, index) => !mentorIds.includes(id, index + 1))

        return (
            <>
                <div className='sp-completed-component-bg'>
                    {/* <div className='sp-completed-component-container'> */}
                    <div className='sp-completed-component-left-container'>
                        <div className='sp-completed-component-title'>
                            {getCourseTitle()}
                        </div>
                        <div className='sp-completed-component-divider' />
                        {((completedSessions && completedSessions.length) && this.getCourseDurationString(completedSessions)) && (
                            <div className='sp-completed-details-row'>
                                <div className='sp-completed-details-header'>Course Duration</div>
                                <div className='sp-completed-details-description'>
                                    {this.getCourseDurationString(completedSessions)}
                                </div>
                            </div>
                        )}
                        <div className='sp-completed-details-row'>
                            <div className='sp-completed-details-header'>Mentors who led you in the journey</div>
                            <div className='sp-completed-details-description'>
                                {mentors.slice(0, 2).map(({ name, profilePic }) => (
                                    <div className='sp-completed-details-mentorContainer'>
                                        <span
                                            style={{ backgroundImage: profilePic ? `url(${getPath(profilePic)})` : '' }}
                                            className='sp-completed-details-userIcon'
                                        />
                                        {name}
                                    </div>
                                ))}
                                <ReactToolTip
                                    id='mentors'
                                    place='right'
                                    effect='float'
                                    multiline={false}
                                    className='photon-input-tooltip cn-tooltip'
                                    arrowColor='#00ADE6'
                                    textColor='rgba(0, 0, 0, 0.8)'
                                />
                                {(mentors && mentors.length > 2) && (
                                    <div
                                        data-for='mentors'
                                        data-tip={mentors.slice(2).map(({ name }) => `${name}\n`)}
                                        data-iscapture='true'
                                        className='sp-completed-details-mentorContainer'
                                        style={{ cursor: 'pointer' }}
                                    >
                                        +{mentors.slice(2).length}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='sp-completed-details-row' style={{ marginBottom: 0 }}>
                            <div className='sp-completed-details-description'>
                                {this.isCourseRated() ? 'You rated the course' : 'RATE THE COURSE'}
                                <div className='sp-completed-details-rating-container'>
                                    {this.isCourseRated() ? (
                                        <>
                                            {range(1, 6).map(rating => (
                                                <div style={{ cursor: 'default' }} className='sp-completed-rateIcon'>
                                                    {this.renderStar(rating)}
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            {range(1, 6).map(rating => (
                                                <motion.div
                                                    whileTap={{
                                                        scale: 0.9
                                                    }}
                                                    className='sp-completed-rateIcon'
                                                    onClick={() => {
                                                        this.setState({
                                                            rating,
                                                            courseReviewModalVisible: true
                                                        })
                                                    }}
                                                    onMouseOver={() => {
                                                        this.setState({
                                                            hoveredRating: rating,
                                                        })
                                                    }}
                                                    onMouseOut={() => {
                                                        this.setState({
                                                            hoveredRating: 0,
                                                        })
                                                    }}
                                                >
                                                    {this.renderStar(rating, this.state.hoveredRating)}
                                                </motion.div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='sp-completed-component-right-container'>
                        <div className='sp-completed-component-certificate-container'>
                            {this.state.isCertificateGenerated ? (
                                <ImageBackground
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'cover'
                                    }}
                                    src={getPath(this.state.courseCertificateURL)}
                                    srcLegacy={getPath(this.state.courseCertificateURL)}
                                />
                            ) : (
                                this.state.blobCertificateUrl ? (
                                    <>
                                        <Document
                                            file={this.state.blobCertificateUrl}
                                        >
                                            <Page width={400} pageNumber={1} />
                                        </Document>
                                        <Document
                                            className='sp-completed-noView-Canvas'
                                            file={this.state.blobCertificateUrl}
                                        >
                                            <Page
                                                width={1200}
                                                pageNumber={1}
                                                canvasRef={this.canvasRef}
                                                onRenderSuccess={async () => {
                                                    /** 
                                                     * # Upload Certificate If Does Not Exists
                                                     */
                                                    if (!this.state.isCertificateGenerated) {
                                                        await this.convertCanvasToImage()
                                                        this.addOrUpdateUserCourseCompletion()
                                                    }
                                                }}
                                            />
                                        </Document>
                                    </>
                                ) : null
                            )}
                            <div
                                onClick={() => {
                                    if (this.state.courseCompletionId) {
                                        window.open(`/course-completion/${slugifyID(this.state.courseCompletionId)}`, '_blank', 'noreferrer')
                                    }
                                }}
                                className='sp-completed-component-viewCertiText'
                            >
                                {!this.state.blobCertificateUrl && !this.state.isCertificateGenerated ?
                                    'Generating ' :
                                    'VIEW '
                                }
                                CERTIFICATE <span className='sp-completed-component-linkIcon' />
                            </div>
                        </div>
                        <div className='sp-completed-component-buttons-container'>
                            <motion.div
                                whileTap={{
                                    scale: 0.95
                                }}
                            >
                                <a
                                    id='courseCompletionCertificateDownloadBtn'
                                    className='sp-completed-component-download-button'
                                    href="#1"
                                    alt="Download Certificate"
                                >
                                    DOWNLOAD
                                </a>
                            </motion.div>
                            {(this.state.isCertificateGenerated || this.state.certificateUploaded) && (
                                <motion.div
                                    onClick={() => {
                                        this.onShareButtonClick()
                                    }}
                                    whileTap={{ scale: 0.95 }} className='sp-completed-component-share-button'
                                >
                                    SHARE <span className='sp-completed-component-shareIcon' />
                                </motion.div>
                            )}
                        </div>
                    </div>
                    {/* </div> */}
                    <CourseReviewModal
                        rating={this.state.rating}
                        visible={this.state.courseReviewModalVisible}
                        addOrUpdateUserCourseCompletion={(comment, rating) =>
                            this.addOrUpdateUserCourseCompletion(comment, rating)
                        }
                        closeCourseReviewPopup={(rating = null) => {
                            if (rating) {
                                this.setState({
                                    overrideCourseRated: true,
                                    rating,
                                    courseReviewModalVisible: false
                                })
                            }
                            this.setState({
                                courseReviewModalVisible: false,
                            })
                        }}
                    />
                    <CourseCompletionCertificateModal
                        isModalForFirstTime={this.state.isCertificateModalForFirstTime}
                        visible={this.state.courseCompletionCertificateModalVisible}
                        blobCertificateUrl={this.state.blobCertificateUrl}
                        isCertificateGenerated={this.state.isCertificateGenerated}
                        certificateUploaded={this.state.certificateUploaded}
                        courseCertificateURL={this.state.courseCertificateURL}
                        openShareOverlay={this.onShareButtonClick}
                        courseCompletionId={this.state.courseCompletionId}
                        openCourseReviewPopup={(rating) => {
                            this.setState({
                                courseCompletionCertificateModalVisible: false,
                                isCertificateModalForFirstTime: false,
                                rating,
                                courseReviewModalVisible: true
                            })
                        }}
                        closeCourseCompletionPopup={() => {
                            this.setState({
                                courseCompletionCertificateModalVisible: false,
                                isCertificateModalForFirstTime: false
                            })
                        }}
                    />
                    <ShareOverlay
                        visible={this.state.visibleShareOverlay}
                        closeOverlay={this.closeShareOverlay}
                        shareUrl={this.getCourseCertificateShareUrl()}
                        title={`Hi, check out my course completion certificate from Tekie.\nCourse: ${this.state.shareCodeDetails.courseName} successfully completed by ${capitalize(this.state.shareCodeDetails.studentName)}\n`}
                    />
                </div>
            </>
        )
    }
}

export default CourseCompletedHero
