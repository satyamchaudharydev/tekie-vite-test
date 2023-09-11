import React, { Component } from 'react'
import cx from 'classnames'
import styles from './IntroductionMastery.module.scss'
import customStyles from './Tube.module.scss'
import MasteryTube from '../../../QuizReport/components/MasteryTube'
import ArrowDown from './ArrowDown'
import { hs } from '../../../../utils/size'
import { motion,AnimatePresence } from 'framer-motion'

export default class IntroductionMastery extends Component {
  render() {
    return (
      <AnimatePresence>
        {this.props.visible && (
        <motion.div className={styles.container} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={this.props.close}>
          <div className={styles.popup} onClick={(e) => { e.stopPropagation()  }}>
            <div className={styles.introducing}>Introducing,</div>
            <div className={styles.title}>Mastery Levels</div>
            <div className={styles.text}>Reach Mastery Levels by answering questions correctly.</div>
            <div className={cx(customStyles.masteryTubeContainer, styles.hoveringScores)}>
              <div className={cx(customStyles.masteryTubeBase, customStyles.masteryTubeLeft, styles.autoImportant, styles.scoreContainer)}>
                <div className={styles.scoreText}>
                    6/10
                </div>
                <div className={styles.arrowDown}>
                  <ArrowDown colors={['#f9ed41', '#fbb040']} />
                </div>
              </div>
              <div className={cx(customStyles.masteryTubeBase, customStyles.masteryTubeCenter, styles.autoImportant, styles.scoreContainer)}>
                <div className={styles.scoreText}>
                    8/10
                  </div>
                  <div className={styles.arrowDown}>
                    <ArrowDown colors={['#ab8ed6', '#7b38e0']} />
                  </div>
                </div>
              <div className={cx(customStyles.masteryTubeBase, customStyles.masteryTubeRight, styles.autoImportant, styles.scoreContainer)}>
                <div className={styles.scoreText}>
                  10/10
                </div>
                <div className={styles.arrowDown}>
                  <ArrowDown colors={['#34e4ea', '#1ac9e8']} />
                </div>
              </div>
            </div>

            <MasteryTube
              shouldAnimate={false}
              mastery={3}
              styles={customStyles}
            />

            <div className={styles.labels}>
              <div className={styles.label}>
                FAMILIAR
              </div>
              <div className={styles.label} style={{ backgroundColor: '#8c61cb' }}>
                Master
              </div>
              <div className={styles.label} style={{ backgroundColor: '#1ac9e8', marginRight: 0 }}>
                PROFICIENT
              </div>
            </div>

            <motion.div onClick={this.props.close} className={styles.gotIt} whileHover={{
              boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.26)',
            }}>
              Got It!
            </motion.div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    )
  }
}
