import React, { Component } from 'react'
import cx from 'classnames'
import { get } from 'lodash'
import styles from './Topics.module.scss'
import getPath from '../../../../utils/getPath'
import { ReactComponent as LockedSvg } from '../../../../assets/lockedHomepage.svg';
import { ReactComponent as UnLockedSvg } from '../../../../assets/unlocked.svg';
import { withRouter } from 'react-router-dom';
import { motion } from 'framer-motion';

const Topic = props => {
  return (
    <motion.div className={styles.card} style={{
      backgroundImage: `url("${getPath(get(props, 'thumbnail.uri'))}")`,
      cursor: props.isUnlocked ? 'pointer' : 'auto'
    }} whileHover={props.isUnlocked ? { scale: 1.1 } : {}} onClick={() => {
      if (props.isUnlocked) {
        props.history.push(`/video/${props.id}`)
      }
    }}>
      <div style={{ zIndex: 2 }}>
        <div className={styles.topicTitle}>{props.title}</div>
      </div>
      <div className={styles.statusIcon}>
        {props.isUnlocked
          ? <UnLockedSvg />
          : <LockedSvg />
        }
      </div>
    </motion.div>
  )
}

class Topics extends Component {
  render() {
    return (
      <div className={[cx(styles.container, this.props.firstTopic && styles.firstContainer)]}>
        <div className={styles.chapterTitle}>
          {this.props.title}
        </div>
        <div className={styles.cardContainer}>
          {this.props.topics && this.props.topics.map(topic => (
            <Topic {...topic} history={this.props.history} />
          ))}
        </div>
      </div>
    )
  }
}

export default withRouter(Topics)
