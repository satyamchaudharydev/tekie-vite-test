import React, { useEffect, useState } from 'react'
import { random } from 'lodash'
import { motion } from 'framer-motion'
import cx from 'classnames'
import styles from './MasteryTube.module.scss'
import { hs } from '../../../../utils/size'

const bubbles = [
  {
    style: {
      size: hs(17),
      top: hs(13),
      left: hs(140)
    },
    duration: 7000,
    delay: 0
  },
  {
    style: {
      size: hs(14),
      top: hs(45),
      left: hs(45)
    },
    duration: 5000,
    delay: 100
  },
  {
    style: {
      size: hs(10),
      top: hs(6.3),
      left: hs(26.3)
    },
    duration: 3000,
    delay: 500
  },
  {
    style: {
      size: hs(9),
      top: hs(20.3),
      left: hs(40.3)
    },
    duration: 3000,
    delay: 200
  },
  {
    style: {
      size: hs(13),
      top: hs(22),
      left: hs(82)
    },
    duration: 2000,
    delay: 200
  },
  {
    style: {
      size: hs(8),
      top: hs(22),
      left: hs(95)
    },
    duration: 5000,
    delay: 200
  },
  {
    style: {
      size: hs(10),
      top: hs(22),
      left: hs(74)
    },
    duration: 2000,
    delay: 200
  },
  {
    style: {
      size: hs(13),
      top: hs(22),
      left: hs(62)
    },
    duration: 4000,
    delay: 200
  },
  {
    style: {
      size: hs(8),
      top: hs(22),
      left: hs(110)
    },
    duration: 2000,
    delay: 200
  },
  {
    style: {
      size: hs(14),
      top: hs(22),
      left: hs(130)
    },
    duration: 4000,
    delay: 200
  },
  {
    style: {
      size: hs(10),
      top: hs(22),
      left: hs(120)
    },
    duration: 3000,
    delay: 200
  }
]
const delays = [ 500, 700, 1000, 2000]

const Bubble = ({ bubble, bubbleColors, shouldBubble }) => {
  return (
    <motion.div
      style={{
        position: 'absolute',
        width: bubble.style.size,
        height: bubble.style.size,
        borderRadius: bubble.style.size / 2,
        top: hs(70),
        left: bubble.style.left,
        backgroundImage: `linear-gradient(to bottom, ${bubbleColors[0]}, ${bubbleColors[1]})`,
      }}
      animate={{
        y: hs(-70),
        opacity: 0.1,
        transition: {
          duration: bubble.duration / 1000,
          loop: Infinity,
          // repeatDelay: bubble.delay / 1000,
          delay: bubble.delay / 1000
        }
      }}
    />
  )
}

const MasteryTube = ({ shouldAnimate = true, ...props }) => {
  const [mastery, setMastery] = useState(props.shouldAnimate ? 0 : props.mastery)
  
  useEffect(() => {
    setTimeout(() => {
      if (shouldAnimate) {
        setMastery(props.mastery)
      }
    }, 1000)
  }, [props.mastery])
  const { styles: customStyles = {}} = props
  return (
    <div className={cx(styles.masteryTubeContainer, customStyles.masteryTubeContainer)}>
      <div className={cx(styles.masteryTubeLeft, customStyles.masteryTubeLeft)}>
        <motion.div className={styles.fillLeft} initial={!shouldAnimate ? {
          x: (mastery >= 1) ? hs(196.5) : 0,
        }: {}} animate={{
          x: (mastery >= 1) ? hs(196.5) : 0,
          transition: {
            duration: 0.8,
            type: 'tween'
          }
        }}>
          {bubbles.map((bubble, i) => (
            <Bubble
              bubble={{ ...bubble, delay: delays[random(0, delays.length)] }}
              bubbleColors={['#f9ed41', '#f7941d']}
              key={i}
              shouldBubble={props.shouldBubble}
            />
          ))}
        </motion.div>
      </div>
      <div className={cx(styles.masteryTubeCenter, customStyles.masteryTubeCenter)}>
        <motion.div initial={!shouldAnimate ? {
          x: (mastery >= 2) ? hs(196.5) : 0,
        } : {}} className={styles.fillCenter} animate={{
          x: (mastery >= 2) ? hs(196.5) : 0,
          transition: {
            duration: 0.8,
            type: 'tween',
            delay: 0.6
          }
        }}>
          {bubbles.map((bubble, i) => (
            <Bubble
              bubble={{ ...bubble, delay: delays[random(0, delays.length)] }}
              bubbleColors={['#8c61cb', '#a17dd6']}
              key={i}
              shouldBubble={props.shouldBubble}
            />
          ))}
        </motion.div>
      </div>
      <div className={cx(styles.masteryTubeRight, customStyles.masteryTubeRight)}>
      <motion.div initial={!shouldAnimate ? {
          x: (mastery >= 3) ? hs(196.5) : 0,
        } : {}} className={styles.fillRight} animate={{
          x: (mastery === 3) ? hs(196.5) : 0,
          transition: {
            duration: 0.8,
            type: 'tween'
          }
        }}>
          {bubbles.map((bubble, i) => (
            <Bubble
              bubble={{ ...bubble, delay: delays[random(0, delays.length)] }}
              bubbleColors={['#34e4ea', '#00ade6']}
              key={i}
              shouldBubble={props.shouldBubble}
            />
          ))}
        </motion.div>
      </div>
      <div className={cx(styles.absoulteShine, customStyles.absoulteShine)}></div>
    </div>
  )
}

export default MasteryTube
