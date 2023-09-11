import React, { Component } from 'react'
import { motion } from 'framer-motion'
import { sample, random } from 'lodash'

export default class Bubble extends Component {
  render() {
    const {
      height,
      colors,
      bubblesCount,
      bubbleSizes,
      leftSizes,
      opacity = [0, 0, 1, 0, 0],
      times = [0, 0.1, 0.2, 0.8, 1]
    } = this.props
    return (
      <div style={{
        width: '100%',
        height,
        position: 'absolute',
        bottom: 0,
        left: 0
      }}>
        {/* {new Array(bubblesCount).fill(undefined).map(() => {
          const size = sample(bubbleSizes)
          const left = sample(leftSizes)
          return (
            <motion.div
              initial={{
                opacity: 0,
                bottom:  0,
              }}
              animate={{
                opacity: opacity,
                bottom: height * -1,
                transition: {
                  type: 'tween',
                  times: times,
                  duration: random(...this.props.duration),
                  loop: Infinity,
                  delay:  random(...this.props.delay, false),
                },

              }}
              style={{
                width: size,
                height: size,
                position: 'absolute',
                left,
                background: `linear-gradient(to top, ${colors[0]}, ${colors[1]})`,
                borderRadius: '50%'
              }}
            ></motion.div>
          )
        })} */}
      </div>
    )
  }
}
