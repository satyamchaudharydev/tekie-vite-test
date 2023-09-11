import React, { Component } from 'react'
import styles from './ResumeLearning.module.scss'
import { ResumeButton } from '../../../../components/Buttons'
import { motion } from 'framer-motion'
import { withRouter } from 'react-router-dom'

class ResumeLearning extends Component {
  onResume = () => {
    const { currentTopicComponentDetail, currentTopicComponent, history } = this.props
    if (currentTopicComponent === 'video') {
      history.push(`/video/${currentTopicComponentDetail.get('currentTopicId')}`)
    } else if (currentTopicComponent === 'message') {
      history.push(
        `/chat/${currentTopicComponentDetail.get('currentTopicId')}/${currentTopicComponentDetail.get('currentLearningObjectiveId')}`
      )
    } else if (currentTopicComponent === 'practiceQuestion') {
        history.push(
          `/practice/${currentTopicComponentDetail.get('currentTopicId')}/${currentTopicComponentDetail.get('currentLearningObjectiveId')}`
        )
      } else if (currentTopicComponent === 'quiz') {
        history.push(
          `/quiz/${currentTopicComponentDetail.get('currentTopicId')}`
        )
    }
  }

  render() {
    const { currentTopicComponentDetail } = this.props
    return (
      <div className={styles.container}>
        <div
          className={styles.thumbnailContainer}
          style={{
            backgroundImage: `url("${this.props.thumbnail}")`
          }}
        >
          <motion.div
            className={styles.playButtonContainer}
            whileHover={{
              scale: 1.2
            }}
            onClick={this.onResume}
          />
        </div>
        <div className={styles.infoContainer}>
          <div className={styles.title}>{currentTopicComponentDetail && currentTopicComponentDetail.get('componentTitle')}</div>
          <div className={styles.description}>{currentTopicComponentDetail && currentTopicComponentDetail.get('description')}</div>
          <div className={styles.footerWrapper}>
            <div className={styles.footer}>
              <div>
                  <div className={styles.progressWrapper}>
                      <div className={styles.progressOuter}>
                        <div className={styles.progressInner} style={{
                          left: `-${(100 - Math.round(currentTopicComponentDetail.get('percentageCovered')))}%`
                        }} />
                      </div>
                    <div className={styles.progressText}>
                      {Math.round(currentTopicComponentDetail.get('percentageCovered'))}%
                    </div>
                  </div>
                <div className={styles.topicTitle}>{currentTopicComponentDetail.get('topicTitle')}</div>
              </div>
              <div>
                <ResumeButton title='Resume' onClick={this.onResume} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(ResumeLearning)
