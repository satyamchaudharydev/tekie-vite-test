import React, { Component } from 'react'
import tubeConfig from '../tubeConfig'
import TubeSVG from '../Tube'
import { mapRange, minCap } from '../../../utils/data-utils'
import { hs } from '../../../utils/size'

import { motion } from 'framer-motion'
import Bubble from './Bubble'
import withScale from '../../../utils/withScale'

const bubblesCount = 15
const bubbleSizes = [11, 10, 7, 5]
const leftSizes = [10, 20, 33, 40, 50, 57]


const Tube = props => {
  const progress = !props.count ?  0 : (props.count / props.total) * 100
  const height = mapRange({
    from: [0, 100],
    to: [0, hs(400)]
  }, progress)
  const tube = tubeConfig[props.type]

  const { styles } = props
  return (
      <div style={{ position: 'relative' }}>
        <TubeSVG {...tube} type={props.type} progress={progress} hasFetched={props.hasFetched} />
        {progress > 10 ? 
          <Bubble
            height={height}
            colors={tube.bubbleColors}
            leftSizes={leftSizes}
            bubblesCount={bubblesCount}
            bubbleSizes={bubbleSizes}
            duration={[2, 7]}
            delay={[1, 5]}
          />
        : <></>}
        <div style={styles.absoluteOverlay}>
          {props.hasFetched ? (
            <motion.div
              style={{ width: '100%', color: '#fff', textAlign: 'center', marginTop: 47.5, fontWeight: 800 }}
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }} 
            >{minCap(props.count, 0)}/{minCap(props.total, 0)}</motion.div>            
          ) : <></>}
        </div>
      </div>
  )
}

export default withScale(Tube, {
  absoluteOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  }
})
