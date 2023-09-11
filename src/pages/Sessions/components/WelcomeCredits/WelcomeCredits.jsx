import React, { Component } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Lottie from 'react-lottie'
import styles from './WelcomeCredits.module.scss'
import CreditsLottie from './creditsBonus.json'
import confettiAnime from './confettiAnime.json'

const options = {
  loop: false,
  autoplay: false, 
  animationData: confettiAnime,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid meet'
  }
}

let closeTimeout, isPausedTimeout

export default class WelcomeCredits extends Component {
  state={
    isPaused: true
  }

  componentDidMount() {
    isPausedTimeout = setTimeout(() => {
      this.setState({ isPaused: false })
    }, 3000)

    closeTimeout = setTimeout(() => {
      this.props.close()
    }, 5000)
  }

  componentWillUnmount() {
    clearTimeout(closeTimeout)
    clearTimeout(isPausedTimeout)
  }

  render() {
    return (
      <AnimatePresence>
        {this.props.visible && (
          <motion.div className={styles.container}
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          >
          <Lottie
            options={options}
            isPaused={this.state.isPaused}
          /> 
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
}
