import React, { Component } from 'react'
import withScale from '../../../utils/withScale.js'
import { hs } from '../../../utils/size.js'
import { ifNot, minCap } from '../../../utils/data-utils.js'
import { motion } from 'framer-motion'
import YouTube from '../../../lib/react-youtube-player';
import { withRouter } from 'react-router-dom'
import { LinksClicksGA } from '../../../utils/analytics/ga.js'

const variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
  }
}
class YoutubeEmbed extends Component {
  componentDidUpdate(prevProps) {
    if (this.props.visible && !prevProps.visible) {
      LinksClicksGA(this.props.match.path)
    }
  }


  render() {
    const { styles } = this.props
    const horizontalPadding = 100
    const headerHeight = 
      typeof document === 'undefined'
        ? 0
        : ifNot(document.querySelector('#tk-landing-header'), {}).offsetHeight
    const maxHeight = typeof window === 'undefined'
      ? 0
      : minCap(window.innerHeight - headerHeight - hs(80), 0)
    const maxWidth = typeof window === 'undefined'
      ? 0
      : window.innerWidth - hs(horizontalPadding * 2)
    let adjustedWidth = 0
    let adjustedHeight = 0
    let top = 0
    let left = 0
    if (maxWidth > maxHeight * 1.78) {
      adjustedHeight = maxHeight
      top = headerHeight + hs(40) 

      adjustedWidth = adjustedHeight * 1.78
      left = hs(horizontalPadding) + (maxWidth - adjustedWidth) / 2
    } else {
      adjustedWidth = maxWidth
      left = hs(horizontalPadding)

      adjustedHeight = adjustedWidth / 1.78
      top = minCap(headerHeight + hs(40) + (maxHeight - adjustedHeight) / 2, 0)
    }

    return (
      <motion.div
        variants={variants}
        initial='hidden'
        animate={this.props.visible ? 'visible': 'hidden' }
        style={{
          pointerEvents: this.props.visible ? 'auto' : 'none'
        }}
      >
        <div
          style={{
            position: 'absolute',
            zIndex: 999
          }}
          onClick={() => {
            this.props.close()
          }}
        >
          <div style={styles.container}>
          {this.props.visible && (
            <YouTube
              videoId={this.props.id}
              id={this.props.id}
              onReady={(event) => {
                this.player = event.target
                const {  player } = this
                if (!this.props.visible) {
                  player.playVideo()
                } else {
                  player.playVideo()
                }
                
              }}
              style={{
                position: 'absolute',
                top,
                left,
                width: adjustedWidth,
                height: adjustedHeight,
              }}
              // onPlay={func}
              // onPause={func}
              // onEnd={func}
              // onError={func}
              // onStateChange={func}
              // onPlaybackRateChange={func}
              // onPlaybackQualityChange={func}
            />
          )}
          </div>
        </div>
      </motion.div>
    )
  }
}

const styles = {
  container: {
    position: 'fixed',
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    top: 0,
    left: 0,
    'z-index': 222
  }
}

export default withRouter(withScale(YoutubeEmbed, styles))