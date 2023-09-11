import React from 'react'
import styles from './Tube.module.scss'
import TubeSVG from './TubeSvg'
import cx from 'classnames'
import { mapRange } from '../../../../utils/data-utils'
import { hs } from '../../../../utils/size'
import { motion } from 'framer-motion'
import Bubble from '../../../JourneyReport/components/Bubble'
import isMobile from '../../../../utils/isMobile'


const getTransform = (progress) => mapRange({
  from: [0, 100],
  to: [0, 410]
}, progress)

const variants = {
  hidden: {
    opacity: 0,
    transition: { duration: 0.5 },
  },
  visible: {
    opacity: 1,
    // transition: { duration: 1 },
  },
}

const bubblesCount = 15
const bubbleSizes = [11, 10, 7, 5]
const leftSizes = [20, 33, 40]

const Tube = props => {
  const height = mapRange({
    from: [0, 100],
    to: [0, hs(388)]
  }, props.progress)

  const ProgressThreshold = isMobile() ? 50 : 70
  return (
    <div className={styles.tubeContainer}>
      <TubeSVG {...props.tubeConfig} i={props.i} poseState={props.poseState} progress={props.progress} />
      <div className={styles.absoluteOverlay}>
        <div className={styles.circleShine}></div>
          <div>
            <div className={cx([styles.bottomCircle, styles[`bottomCircle${props.i + 1}`]])}></div>
            <div className={cx(styles.tubeShine, styles[`tubeShine${props.i + 1}`])}></div>
            <div className={cx(styles.tubeShine, styles.right, styles[`tubeShine${props.i + 1}`])}></div>
          </div>

        {/* <div className={styles.tubeShine}></div> */}
      </div>
      <div
        className={styles.absoluteOverlay}
        style={{
          height,
          // backgroundColor: 'red',
          bottom: 0,
          top: 'unset'
        }}
      >
      {props.progress && props.poseState === 'active' ? (
        <Bubble
          height={height}
          colors={props.colors}
          leftSizes={leftSizes}
          bubblesCount={bubblesCount}
          bubbleSizes={bubbleSizes}
          duration={[2, 7]}
          delay={[1, 5]}
          opacity={[0, 1, 0, 0]}
          times={[0, 0.1, 0.8, 1]}
        />
      ) : <></>}
      </div>
      <div className={styles.absoluteOverlay}>
        <motion.div
          initial='hidden'
          animate={props.poseState === 'active' ? 'visible' : 'hidden'}
          variants={variants}
          className={styles.scoreText}
          style={{
            transform:  props.progress < ProgressThreshold
              ? `translateY(-${hs(getTransform(props.progress))}px)`
              : `translateY(-${hs(getTransform(40))}px)`,
            color: props.progress < ProgressThreshold
              ? props.color
              : props.filledTextColor
          }}
          >{props.fill}</motion.div>
      </div>
    </div>
  )
}

export default Tube
