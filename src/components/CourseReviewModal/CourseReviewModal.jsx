import React, { Component } from 'react'
import PopUp from '../PopUp/PopUp'
import styles from './CourseReviewModal.module.scss'
import { range } from 'lodash'
import { motion } from 'framer-motion'
import { getCourseTitle } from '../../utils/generateCourseCompletionCertificate'
import { ReactComponent as StarActive } from '../../pages/Sessions/assets/starActive.svg'
import { ReactComponent as StarInActive } from '../../pages/Sessions/assets/starInActive.svg'
import { Button } from '../../photon'
import ArrowButton from "../Buttons/ArrowButton";
import CloseIcon from '../../assets/Close.jsx'

const courseCompletionSurveyLink = 'https://lt5w9obz0m7.typeform.com/to/S6MUUJr1'
class courseReviewModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            rating: 0,
            hoveredRating: 0,
            comment: '',
            isFeedbackSubmitted: false
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.visible && prevProps.visible !== this.props.visible) {
            const { rating } = this.props
            if (rating) {
                this.setState({
                    rating
                })
            }
        }
    }

    renderStar = (rating) => {
        if (this.state.rating >= rating) {
            // return <StarInActive style={{ fill: '#2cdbe8' }} />
            return <StarActive />
        }
        if (this.state.hoveredRating >= rating) {
            return (
                <StarActive />
            )
        }
        return <StarInActive />
    }

    submitFeedback = async () => {
        const { comment, rating } = this.state
        await this.props.addOrUpdateUserCourseCompletion(comment, rating)
        this.setState({
            isFeedbackSubmitted: true
        })
    }

    closeModal = () => {
        const { rating, isFeedbackSubmitted } = this.state
        this.setState({
            isFeedbackSubmitted: false,
            isLoading: true,
            rating: 0,
            hoveredRating: 0,
            comment: null,
        })
        if (isFeedbackSubmitted) {
            this.props.closeCourseReviewPopup(rating)
        }
        this.props.closeCourseReviewPopup()
    }
    render() {
        const { visible } = this.props
        const { isFeedbackSubmitted } = this.state
        return (
            <>
                <PopUp
                    showPopup={visible}
                    closePopUp={this.closeModal}
                >
                    <div
                        className={styles.mainContainer}
                    >
                        <div className={styles.courseReviewClose} onClick={this.closeModal}>
                            <div className={styles.courseReviewCloseIcon}>
                                <CloseIcon />
                            </div>
                        </div>
                        <div
                            style={{ color: '#504F4F', fontWeight: 'bold' }}
                            className={styles.courseReviewContainer}
                        >
                            {!isFeedbackSubmitted ? getCourseTitle() : 'Thank You!'}
                        </div>
                        <div
                            style={{ color: '#504F4F', opacity: 0.7, fontWeight: 'normal' }}
                            className={styles.courseReviewSubHeader}
                        >
                            {!isFeedbackSubmitted ? 'Your Review' : 'Please also give feedback to Tekie and the mentors in a 5 min survey.'}
                        </div>
                        {!isFeedbackSubmitted && (
                            <>
                                <div className={styles.courseReviewRatingContainer}>
                                    {range(1, 6).map(rating => (
                                        <motion.div
                                            whileTap={{
                                                scale: 0.9
                                            }}
                                            className={styles.spCompletedRateIcon}
                                            onClick={() => this.setState({ rating })}
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
                                <textarea
                                    value={this.state.comment}
                                    onChange={(e) => {
                                        this.setState({
                                            comment: e.target.value
                                        })
                                    }}
                                    className={styles.courseReviewCommentInput}
                                    placeholder='Write Something (optional)'
                                />
                            </>
                        )}
                        <div className={styles.courseReviewActionContainer}>
                            {!isFeedbackSubmitted ? (
                                <div
                                    onClick={this.bookSession}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        zIndex: '9999999'
                                    }}
                                >
                                    <Button
                                        onClick={this.submitFeedback}
                                        title={'Submit'}
                                    />
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', justifyContent: 'center' }}>
                                    <div
                                        style={{
                                            cursor: 'pointer',
                                            color: '#00ADE6',
                                            display: 'grid',
                                            placeItems: 'center',
                                            marginRight: 40,
                                            textTransform: 'uppercase',
                                            fontWeight: 700
                                        }}
                                        onClick={this.closeModal}
                                    >
                                        No thanks
                                    </div>
                                    <ArrowButton
                                        buttonText={styles.buttonText}
                                        onClick={() => {
                                            window.open(courseCompletionSurveyLink, '_blank', 'noreferrer')
                                            this.closeModal()
                                        }}
                                        title={'CONTINUE'}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </PopUp>
            </>
        )
    }
}

export default courseReviewModal
