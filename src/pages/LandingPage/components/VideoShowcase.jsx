import React, { Component } from 'react'
import cx from 'classnames'
import { withRouter } from 'react-router-dom'
import { ImageBackground } from '../../../image'
import { motion } from 'framer-motion'
import { ReactComponent as Play } from '../../../assets/play.svg'
import './VideoShowcase.scss'
import './Collapsible.scss'
import '../styles.scss'

const variants = {
  image: {
    rest: {
      scale: 1
    },
    hover: {
      scale: 1
    }
  }
}

const breakPoint = 900
class VideoShowcase extends Component {
  state = {
    isDesktop: window.innerWidth > breakPoint
  }

  componentDidMount() {
    window.addEventListener('resize', () => {
      const isDesktop = window.innerWidth > breakPoint
      this.setState({
        isDesktop
      })
    })
  }

  render() {
    const { isDesktop } = this.state
    if (isDesktop) {
      return (
        <div style={{ width: '100%', position: 'relative', zIndex: 0 }} className={'landing-page-video-showcase-container'}>
          <div className={'landing-page-video-showcase-gradientOverlay'}></div>
          <div className={'landing-page-video-showcase-cardLg'}>
            <div className={'landing-page-video-showcase-bodyLg'}>
              <div className={'landing-page-video-showcase-titleLgBlue'}>Episode 1 - Intro to Programming</div>
              <div className={cx('landing-page-text', 'landing-page-video-showcase-textLg')}>
                Meet Theo, a curious teen, who goes on 
                an adventure involving various sci-fi 
                coding activities. This is the first of our 
                many episodes that cover the basics of 
                programming. It starts off with the story, 
                so skip to 8:32 if you want to dive 
                into the teaching right away!
              </div>
            </div>
            <div className={'landing-page-video-showcase-posterLg'}>
              <div className={'landing-page-video-showcase-posterThumbLg'}>
                <div className={'landing-page-video-showcase-playButtonLg'} onClick={() => {
                  this.props.history.push('/intro-to-programming')
                }} />
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={'landing-page-video-showcase-card'}>
        <div className={cx('landing-page-video-showcase-title', 'landing-page-displayOnlySmall')}>{this.props.title}</div>
        <div className={cx('landing-page-collapsible-title', 'landing-page-video-showcase-blueTitle')}>
          Intro To Programming
        </div>
        <div className={cx('landing-page-text', 'landing-page-video-showcase-text')}>
          Meet Theo, a curious teen, who goes on 
          an adventure involving various sci-fi 
          coding activities. This is the first of our 
          many episodes that cover the basics of 
          programming. It starts off with the story, 
          so skip to 8:32 if you want to dive 
          into the teaching right away!
        </div>
        <ImageBackground
          className={'landing-page-video-showcase-thumbnail'}
          getBackgroundImage={webp => {
            if (webp) {
              return `linear-gradient(to left, rgba(0, 0, 0, 0.5) 100%, #000000), url('${this.props.webpThumbnail}')`
            }
            return `linear-gradient(to left, rgba(0, 0, 0, 0.5) 100%, #000000), url('${this.props.thumbnail}')`
          }}
        >
          <div className={'landing-page-video-showcase-playButton'} onClick={() => {
            this.props.history.push('/intro-to-programming')
          }}>
            <Play className={'landing-page-video-showcase-playSvg'} /> 
          </div>
        </ImageBackground>
        <div className={cx('landing-page-divider', 'landing-page-displayOnlySmall')} />
        <div />
      </div>
    )
  }
}

export default withRouter(VideoShowcase)
