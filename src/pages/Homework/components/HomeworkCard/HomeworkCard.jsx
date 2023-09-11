import React, { Component } from 'react'
import cx from 'classnames'
import { get } from 'lodash'
import styles from '../../../Sessions/components/SessionCard/SessionCard.module.scss'
import ActionButton from '../../../../components/Buttons/ActionButton'
import getPath from "../../../../utils/getPath";
import getIntlDateTime from '../../../../utils/time-zone-diff'
import formatDate from '../../../../utils/date-utils/formateDate'
import getCourseId, { getCourseName } from '../../../../utils/getCourseId'
import { PYTHON_COURSE } from '../../../../config'

const reviewButtonProps = {
    isSmallButton: true,
    hoverToCursor: true,
    hideIconContainer: true
}

class HomeworkCard extends Component {
    getRenderCardClassName = () => {
        const { isRowLastCard, isLastRowCard, } = this.props
        if (!isLastRowCard) {
            if (!isRowLastCard) {
                return styles.cardContainer
            } else {
                return styles.lastCardContainer
            }
        } else {
            if (!isRowLastCard) {
                return styles.lastRowHomeworkCardContainer
            } else {
                return styles.lastRowHomeworkLastCardContainer
            }
        }
    }

    renderCard = () => {
        const { 
            topicTitle,
            topicThumbnail,
            isQuizSubmitted,
            topicId,
            isAssignmentSubmitted,
            quizSubmitDate,
            assignmentSubmitDate
        } = this.props
        let date
        if (quizSubmitDate && assignmentSubmitDate) {
            date = new Date(quizSubmitDate).setHours(0, 0, 0, 0) > new Date(assignmentSubmitDate).setHours(0, 0, 0, 0)
                    ? formatDate(new Date(quizSubmitDate)).date
                    : formatDate(new Date(assignmentSubmitDate)).date
        } else if (quizSubmitDate) {
            date = formatDate(new Date(quizSubmitDate)).date
        } else if (assignmentSubmitDate) {
            date = formatDate(new Date(assignmentSubmitDate)).date
        }

        return (
            <div className={this.getRenderCardClassName()}>
                <div className={styles.topicNameContainer}>
                    <div className={styles.topicName}>
                        {topicTitle}
                    </div>
                </div>
                <div className={styles.thumbnailContainer}
                     style={{
                         backgroundImage: `url("${topicThumbnail && getPath(topicThumbnail.uri)}")`
                     }}
                >
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row'
                    }}
                    >
                        <div className={
                            cx(
                                styles.leftPanel,
                                styles.leftPaneHeight
                            )
                        }>
                            <div className={cx(styles.iconAndTextContainer, styles.iconAndTextContainerLarge, styles.iconAndTextContainerMargin)}>
                                <div className={cx(styles.iconContainerLarge, styles.calendarImage)}/>
                                <div className={styles.dateTextWrapper}>
                                    <div className={cx(styles.textContainer, styles.attemptedDateHeading)}>Last Attempted On</div>
                                    <div className={cx(styles.textContainer, styles.smallTextSize)}>{date}</div>
                                </div>
                            </div>
                            <div className={styles.quizCodingStatusContainer}>
                                <div className={styles.iconAndTextContainer}>
                                    <div className={
                                        cx(
                                            styles.iconContainerLarge,
                                            isQuizSubmitted
                                                ? styles.completedImage
                                                : styles.pendingImage
                                        )
                                    }></div>
                                    <div className={cx(styles.homeworkCardTextContainer, styles.smallTextSize)}>
                                        {
                                            isQuizSubmitted
                                                ? 'Quiz completed'
                                                : 'Quiz Pending'
                                        }
                                    </div>
                                </div>
                                <div className={cx(styles.iconAndTextContainer, styles.codingStatusContainer)}>
                                    <div className={
                                        cx(
                                            styles.iconContainerLarge,
                                            isAssignmentSubmitted
                                                ? styles.completedImage
                                                : styles.pendingImage
                                        )
                                    } />
                                    <div className={cx(styles.homeworkCardTextContainer, styles.smallTextSize)}>
                                        {
                                            isAssignmentSubmitted
                                                ? 'Coding Question completed'
                                                : 'Coding Question Pending'
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.rightPanel}>
                            <div className={styles.reviewButtonContainer}>
                                <ActionButton
                                    {...reviewButtonProps}
                                    active={true}
                                    hoverToCursor={true}
                                    title={
                                        isAssignmentSubmitted && isQuizSubmitted
                                            ? 'Review'
                                            : 'Solve'
                                    }
                                    onClick={() => {
                                            if (getCourseName() === PYTHON_COURSE) {
                                                this.props.history.push(`/homework/${topicId}/quiz`)
                                            } else {
                                                this.props.history.push(`/homework/${getCourseId(topicId)}/${topicId}/quiz`)
                                            }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        return (
            <div>
                {
                    this.renderCard()
                }
            </div>
        )
    }
}

export default HomeworkCard
