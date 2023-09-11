import React, { Component } from 'react'
import cx from 'classnames'
import styles from './Breakdown.module.scss'
import getPath from '../../../../utils/getPath'
import { ReactComponent as ChatSVG } from './chatDrop.svg'
import { withRouter } from 'react-router-dom'
import { motion } from 'framer-motion'

const RightDrop = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 57.088 64.8">
    <defs>
      <linearGradient id="linear-gradient--right-drop" x1="0.5" y1="1.1" x2="0.5" y2="0.324" gradientUnits="objectBoundingBox">
        <stop offset="0" stop-color="#2875e5"/>
        <stop offset="0" stop-color="#01ddb2"/>
        <stop offset="1" stop-color="#16d977"/>
      </linearGradient>
      <clipPath id="clip-path--right-drop">
        <path id="Path_20340" data-name="Path 20340" d="M7759.515,567.642c1.2-1.09,4.32-1.2,5.87-1.47a57.695,57.695,0,0,1,15.844-.548c1.917.2,6.2.112,7.385,1.959,1.464,2.288-1.525,6.784-2.967,8.493a14.719,14.719,0,0,1-11.454,5.123c-5.245,0-10.736-1.6-13.341-6.586a17.228,17.228,0,0,1-1.771-5.257,1.91,1.91,0,0,1,.406-1.683C7759.495,567.661,7759.507,567.651,7759.515,567.642Z" transform="translate(-7759.043 -565.316)" fill="#87fdc2"/>
      </clipPath>
    </defs>
    <g id="Group_14206" data-name="Group 14206" transform="translate(-792.824 -1318.001)">
      <path id="Path_20336" data-name="Path 20336" d="M7791.586,545.967a28.544,28.544,0,1,1-57.088,0c0-15.764,28.545-36.256,28.545-36.256S7791.586,530.2,7791.586,545.967Z" transform="translate(-6941.675 808.291)" fill="url(#linear-gradient--right-drop)"/>
      <path id="Path_20338" data-name="Path 20338" d="M7759.515,567.642c1.2-1.09,4.32-1.2,5.87-1.47a57.695,57.695,0,0,1,15.844-.548c1.917.2,6.2.112,7.385,1.959,1.464,2.288-1.525,6.784-2.967,8.493a14.719,14.719,0,0,1-11.454,5.123c-5.245,0-10.736-1.6-13.341-6.586a17.228,17.228,0,0,1-1.771-5.257,1.91,1.91,0,0,1,.406-1.683C7759.495,567.661,7759.507,567.651,7759.515,567.642Z" transform="translate(-6953.117 782.372)" fill="#0b8045"/>
      <g id="Group_11529" data-name="Group 11529" transform="translate(805.924 1347.688)" clip-path="url(#clip-path--right-drop)">
        <path id="Path_20339" data-name="Path 20339" d="M7788.628,580.34s-14.217-6.872-24,2.913,23.1,5.916,23.1,5.916Z" transform="translate(-7760.797 -571.226)" fill="#87fdc2"/>
      </g>
      <path id="Path_20341" data-name="Path 20341" d="M7795.165,550.667a1.037,1.037,0,0,1-.669-1.828c.026-.031.062-.072.1-.12.635-.756,2.554-3.058,5.269-2.983,1.818.05,3.546,1.152,5.133,3.273a1.036,1.036,0,1,1-1.658,1.242c-1.19-1.589-2.379-2.41-3.533-2.442-1.708-.049-3.1,1.616-3.622,2.243a1.49,1.49,0,0,1-.692.562A1.031,1.031,0,0,1,7795.165,550.667Zm-.331-2.02Zm0,0Z" transform="translate(-6969.47 791.501)" fill="#0b8045"/>
      <path id="Path_20342" data-name="Path 20342" d="M7760.374,550.667a1.037,1.037,0,0,1-.669-1.828c.027-.031.063-.072.1-.12.635-.756,2.557-3.058,5.271-2.983,1.817.05,3.547,1.152,5.131,3.273a1.036,1.036,0,1,1-1.659,1.242c-1.189-1.589-2.377-2.41-3.531-2.442-1.7-.049-3.1,1.616-3.624,2.243a1.478,1.478,0,0,1-.691.562A1.029,1.029,0,0,1,7760.374,550.667Zm-.331-2.02Zm0,0h0Z" transform="translate(-6953.253 791.501)" fill="#0b8045"/>
    </g>
  </svg>
)

const WrongDrop = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 57.091 64.811">
  <defs>
    <linearGradient id="linear-gradient--wrong-drop" x1="0.5" y1="1.1" x2="0.5" y2="0.121" gradientUnits="objectBoundingBox">
      <stop offset="0" stop-color="#fd6554"/>
      <stop offset="0.038" stop-color="#b52c00"/>
      <stop offset="1" stop-color="#ff5644"/>
    </linearGradient>
    <clipPath id="clip-path--wrong-drop">
      <path id="Path_20350" data-name="Path 20350" d="M7989.594,578.738c-1.191,1.079-4.274,1.188-5.812,1.456a57.135,57.135,0,0,1-15.689.542c-1.9-.2-6.142-.11-7.311-1.939-1.449-2.265,1.51-6.718,2.938-8.409a14.575,14.575,0,0,1,11.341-5.072c5.192,0,10.631,1.587,13.212,6.521a17.128,17.128,0,0,1,1.753,5.206,1.894,1.894,0,0,1-.4,1.667Z" transform="translate(-7960.393 -565.316)" fill="#ffb1a8"/>
    </clipPath>
  </defs>
  <g id="Group_11574" data-name="Group 11574" transform="translate(0)">
    <path id="Path_20347" data-name="Path 20347" d="M7992.938,545.973a28.545,28.545,0,1,1-57.091,0c0-15.767,28.545-36.262,28.545-36.262S7992.938,530.206,7992.938,545.973Z" transform="translate(-7935.848 -509.711)" fill="url(#linear-gradient--wrong-drop)"/>
    <g id="Group_11535" data-name="Group 11535" transform="translate(13.249 29.693)">
      <path id="Path_20348" data-name="Path 20348" d="M7989.594,578.738c-1.191,1.079-4.274,1.188-5.812,1.456a57.135,57.135,0,0,1-15.689.542c-1.9-.2-6.142-.11-7.311-1.939-1.449-2.265,1.51-6.718,2.938-8.409a14.575,14.575,0,0,1,11.341-5.072c5.192,0,10.631,1.587,13.212,6.521a17.128,17.128,0,0,1,1.753,5.206,1.894,1.894,0,0,1-.4,1.667Z" transform="translate(-7960.393 -565.316)" fill="#711b00"/>
      <g id="Group_11534" data-name="Group 11534" transform="translate(0 0)" clip-path="url(#clip-path--wrong-drop)">
        <path id="Path_20349" data-name="Path 20349" d="M7991.489,588.37s-14.87-11.52-25.294.623c-8.015,9.337,18.285,5.857,18.285,5.857Z" transform="translate(-7962.412 -573.855)" fill="#ffb1a8"/>
      </g>
    </g>
    <path id="Path_20351" data-name="Path 20351" d="M7996.5,550.619a1.027,1.027,0,0,1-.662-1.81c.024-.031.061-.071.1-.119.628-.749,2.528-3.028,5.215-2.953,1.8.05,3.511,1.14,5.084,3.24a1.026,1.026,0,0,1-1.643,1.23c-1.179-1.573-2.355-2.387-3.5-2.418-1.694-.048-3.069,1.6-3.588,2.221a1.474,1.474,0,0,1-.684.557A1.029,1.029,0,0,1,7996.5,550.619Zm-.327-2Zm0,0h0Z" transform="translate(-7963.564 -526.278)" fill="#6f1b00"/>
    <path id="Path_20352" data-name="Path 20352" d="M7961.712,550.619a1.028,1.028,0,0,1-.664-1.81c.028-.031.061-.071.1-.119.628-.749,2.527-3.028,5.216-2.953,1.8.05,3.51,1.14,5.081,3.24a1.026,1.026,0,1,1-1.642,1.23c-1.177-1.573-2.353-2.387-3.5-2.418-1.683-.048-3.065,1.6-3.584,2.221a1.469,1.469,0,0,1-.686.557A1.023,1.023,0,0,1,7961.712,550.619Zm-.327-2Zm0,0Z" transform="translate(-7947.394 -526.278)" fill="#6f1b00"/>
  </g>
</svg>
)

const UnAnsweredDrop = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 56.522 64.161">
  <defs>
    <linearGradient id="linear-gradient--unanswered-drop" x1="0.5" y1="1.1" x2="0.5" y2="-0.184" gradientUnits="objectBoundingBox">
      <stop offset="0" stop-color="#2875e5"/>
      <stop offset="0.006" stop-color="#bfbfbf"/>
      <stop offset="1" stop-color="#707070"/>
    </linearGradient>
    <clipPath id="clip-path--unanswered-drop">
      <path id="Path_20350" data-name="Path 20350" d="M7989.594,578.738c-1.191,1.079-4.274,1.188-5.812,1.456a57.135,57.135,0,0,1-15.689.542c-1.9-.2-6.142-.11-7.311-1.939-1.449-2.265,1.51-6.718,2.938-8.409a14.575,14.575,0,0,1,11.341-5.072c5.192,0,10.631,1.587,13.212,6.521a17.128,17.128,0,0,1,1.753,5.206,1.894,1.894,0,0,1-.4,1.667Z" transform="translate(-7960.393 -565.316)" fill="#dedede"/>
    </clipPath>
  </defs>
  <g id="Group_11599" data-name="Group 11599" transform="translate(0)">
    <path id="Path_20347" data-name="Path 20347" d="M7992.371,545.609a28.261,28.261,0,1,1-56.522,0c0-15.609,28.261-35.9,28.261-35.9S7992.371,530,7992.371,545.609Z" transform="translate(-7935.849 -509.711)" fill="url(#linear-gradient--unanswered-drop)"/>
    <path id="Path_20348" data-name="Path 20348" d="M7989.594,578.738c-1.191,1.079-4.274,1.188-5.812,1.456a57.135,57.135,0,0,1-15.689.542c-1.9-.2-6.142-.11-7.311-1.939-1.449-2.265,1.51-6.718,2.938-8.409a14.575,14.575,0,0,1,11.341-5.072c5.192,0,10.631,1.587,13.212,6.521a17.128,17.128,0,0,1,1.753,5.206,1.894,1.894,0,0,1-.4,1.667Z" transform="translate(-7947.418 -535.923)" fill="#504f4f"/>
    <g id="Group_11534" data-name="Group 11534" transform="translate(12.974 29.393)" clip-path="url(#clip-path--unanswered-drop)">
      <path id="Path_20349" data-name="Path 20349" d="M7991.489,588.37s-14.87-11.52-25.294.623c-8.015,9.337,18.285,5.857,18.285,5.857Z" transform="translate(-7962.412 -573.855)" fill="#dedede"/>
    </g>
    <path id="Path_20359" data-name="Path 20359" d="M7996.5,550.619a1.027,1.027,0,0,1-.662-1.81c.024-.031.061-.071.1-.119.628-.749,2.528-3.028,5.215-2.953,1.8.05,3.511,1.14,5.084,3.24a1.026,1.026,0,0,1-1.643,1.23c-1.179-1.573-2.355-2.387-3.5-2.418-1.694-.048-3.069,1.6-3.588,2.221a1.474,1.474,0,0,1-.684.557A1.029,1.029,0,0,1,7996.5,550.619Zm-.327-2Zm0,0h0Z" transform="translate(-7963.958 -525.952)" fill="#504f4f"/>
    <path id="Path_20360" data-name="Path 20360" d="M7961.712,550.619a1.028,1.028,0,0,1-.664-1.81c.028-.031.061-.071.1-.119.628-.749,2.527-3.028,5.216-2.953,1.8.05,3.51,1.14,5.081,3.24a1.026,1.026,0,1,1-1.642,1.23c-1.177-1.573-2.353-2.387-3.5-2.418-1.683-.048-3.065,1.6-3.584,2.221a1.469,1.469,0,0,1-.686.557A1.023,1.023,0,0,1,7961.712,550.619Zm-.327-2Zm0,0Z" transform="translate(-7947.558 -525.952)" fill="#504f4f"/>
  </g>
</svg>

)

const playVariants = {
  rest: {
    scale: 1
  },
  hover: {
    scale: 1.1
  }
}

class Breakdown extends Component {
  render() {
    const { report } = this.props
    return (
      <div className={cx(styles.container, this.props.last && styles.containerNoMargin)}>
        <div className={styles.body}>
          <div className={styles.title}>{report.getIn(['learningObjective', 'title'])}</div>
          <div className={styles.dropsRow}>
            {Array.from('x'.repeat(report.getIn(['correctQuestionCount']))).map(() => (
              <div className={styles.drop}>
                <RightDrop />
              </div>
            ))}
          </div>
          <div className={styles.dropsRow}>
            {Array.from('x'.repeat(report.getIn(['inCorrectQuestionCount']))).map(() => (
              <div className={styles.drop}>
                <WrongDrop />
              </div>
            ))}
          </div>
          <div className={styles.dropsRow}>
            {Array.from('x'.repeat(report.getIn(['unansweredQuestionCount']))).map(() => (
              <div className={styles.drop}>
                <UnAnsweredDrop />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.suggestions}>
          <div className={styles.needWork}>{report.get('recommendationText')}</div>
          <motion.div
            className={styles.card}
            whileHover="hover"
            initial="rest"
            animate="rest"
            onClick={() => {
              // if (this.props.path === '/sessions/quiz-report-latest/:topicId') {
              //   this.props.history.push(`/sessions/video/${this.props.match.params.topicId}/${report.getIn(['learningObjective', 'id'])}`,{
              //     prevTopicId: this.props.quizReportTopicId
              //   })
              // } else {
                window.open(`/video/${this.props.match.params.topicId}/${report.getIn(['learningObjective', 'id'])}`, '_blank', 'noreferrer')
              // }
            }}
            style={{
              backgroundImage: `url(${getPath(report.getIn(['learningObjective', 'videoThumbnail', 'uri']))})`
            }}>
              <motion.div className={styles.playButtonContainer} variants={playVariants}></motion.div>
            </motion.div>
          <div className={styles.card} style={{ backgroundColor: '#dcf7fc' }}  onClick={() => {
            this.props.history.push(
              `/chat/${this.props.match.params.topicId}/${report.getIn(['learningObjective', 'id'])}`
            )
          }}>
            <div className={styles.chatIconContainer}>
              <ChatSVG />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(Breakdown)
