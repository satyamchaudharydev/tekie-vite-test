import React, { Component } from 'react'
import PopUp from '../PopUp/PopUp'
import styles from './CourseCertificateModal.module.scss'
import { range } from 'lodash'
import { motion } from 'framer-motion'
import { ReactComponent as StarActive } from '../../pages/Sessions/assets/starActive.svg'
import { ReactComponent as StarInActive } from '../../pages/Sessions/assets/starInActive.svg'
import AnimationJSON from "./animation.json";
import StarsAnimationJSON from "../../assets/animations/stars.json";
import { Document, Page } from 'react-pdf';
import Lottie from "react-lottie";
import CloseIcon from '../../assets/Close.jsx'
import { getCourseTitle } from '../../utils/generateCourseCompletionCertificate'
import getPath from '../../utils/getPath'
import { ImageBackground } from '../../image'

const isMobile = typeof window === 'undefined' ? true : window.innerWidth < 550
class CourseCertificateModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            rating: 0,
            hoveredRating: 0,
            blobCertificateUrl: null
        }
    }

    confettiOption = {
        loop: false,
        autoplay: true,
        animationData: AnimationJSON,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }

    bgStarsOptions = {
        loop: true,
        autoplay: true,
        animationData: StarsAnimationJSON,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }

    componentDidUpdate(prevProps) {
        const { blobCertificateUrl, isCertificateGenerated, courseCertificateURL } = this.props
        if (this.props.visible && prevProps.visible !== this.props.visible) {
            setTimeout(async () => {
                this.setState({
                    showConfetti: true
                })
            }, 2000)
        }
        if (blobCertificateUrl && !prevProps.blobCertificateUrl) {
            this.setState({
                blobCertificateUrl,
            })
        }
        if (isCertificateGenerated && !prevProps.isCertificateGenerated) {
            this.setState({
                isCertificateGenerated,
                courseCertificateURL
            })
        }
    }

    renderStar = (rating) => {
        if (this.state.rating >= rating) {
            return <StarActive />
        }
        if (this.state.hoveredRating >= rating) {
            return (
                <StarActive />
            )
        }
        return <StarInActive />
    }

    render() {
        const { visible, closeCourseCompletionPopup, isModalForFirstTime } = this.props
        return (
            <>
                <PopUp
                    showPopup={visible}
                    closePopUp={closeCourseCompletionPopup}
                >
                    <div className={styles.mainContainer} >
                        <Lottie
                            options={this.bgStarsOptions}
                            style={{ position: 'absolute', zIndex: 0, opacity: 0.5 }}
                        />
                        <div className={styles.courseCompletionClose} onClick={closeCourseCompletionPopup}>
                            <div className={styles.courseCompletionCloseIcon}>
                                <CloseIcon />
                            </div>
                        </div>
                        {isModalForFirstTime && (
                            <div
                                className={styles.courseCompletionSubHeader}
                            >
                                Congratulations on completing <span>{getCourseTitle()}!</span>
                            </div>
                        )}
                        {this.state.isCertificateGenerated ? (
                            <ImageBackground
                                className={styles.courseCompletionCertificate}
                                src={getPath(this.state.courseCertificateURL)}
                                srcLegacy={getPath(this.state.courseCertificateURL)}
                            />
                        ) : (
                            this.state.blobCertificateUrl ? (
                                <Document
                                    file={this.state.blobCertificateUrl}
                                >
                                    <Page width={isMobile ? 300 : 500} pageNumber={1} />
                                </Document>
                            ) : null
                        )}
                        <div className={styles.courseCompletionButtonsContainer}>
                            <motion.div
                                whileTap={{
                                    scale: 0.95
                                }}
                            >
                                <a
                                    id='courseCompletionCertificateModalDownloadBtn'
                                    href={this.state.blobCertificateUrl}
                                    download='courseCertificate.pdf'
                                    className={styles.courseCompletionDownloadButton}
                                >
                                    DOWNLOAD
                                </a>
                            </motion.div>
                            {(this.props.isCertificateGenerated || this.props.certificateUploaded) && (
                                <motion.div
                                    onClick={() => {
                                        this.props.openShareOverlay()
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    className={styles.courseCompletionShareButton}
                                >
                                    SHARE <span className={styles.courseCompletionShareIcon} />
                                </motion.div>
                            )}
                        </div>
                        <div className={styles.courseCompletionDivider} />
                        {isModalForFirstTime && (
                            <div className={styles.courseCompletionDescription}>
                                RATE THE COURSE
                                <div className={styles.courseCompletionRatingContainer}>
                                    {range(1, 6).map(rating => (
                                        <motion.div
                                            whileTap={{
                                                scale: 0.9
                                            }}
                                            className={styles.courseCompletionRateIcon}
                                            onClick={() => {
                                                this.setState({
                                                    rating,
                                                }, () => {
                                                    this.props.openCourseReviewPopup(rating)
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
                                </div>
                            </div>
                        )}
                        {(this.state.showConfetti && isModalForFirstTime) && (
                            <Lottie
                                options={this.confettiOption}
                                style={{ position: 'absolute' }}
                            />
                        )}
                    </div>
                </PopUp>
            </>
        )
    }
}

export default CourseCertificateModal
