import React, { Component } from 'react'
import { get } from 'lodash'
import styles from './VideoDiscussion.module.scss'
import { NextButton } from '../../components/Buttons/NextButton'
import { filterKey } from '../../utils/data-utils'
import fetchBadge from '../../queries/fetchBadge'

class VideoDiscussion extends Component {
    handleNext = async () => {
        const { topicId } = this.props.match.params
        const { userVideo, unlockBadge } = this.props
        const loId = userVideo.getIn([0]).getIn([
            'nextComponent',
            'learningObjective',
            'id'
        ])
        const badgeInCache = filterKey(unlockBadge, `unlockBadge/video/${topicId}`)
        this.props.history.push(`/sessions/chat/${topicId}/${loId}`, {
          unlockBadge: badgeInCache && badgeInCache.toJS && get(badgeInCache.toJS(), '0.badge')
        })
    }

    render() {
        return (
            <div className={styles.container}>
                <div className={styles.bodyContainer}>
                    <div className={styles.videoDiscussionIconContainer} />
                    <div className={styles.text}>Let's discuss what we watched</div>
                </div>
                <div
                    className={styles.nextButtonContainer}
                    onClick={this.handleNext}
                >
                    <NextButton
                        title='Next'
                    />
                </div>
            </div>
        )
    }
}

export default VideoDiscussion
