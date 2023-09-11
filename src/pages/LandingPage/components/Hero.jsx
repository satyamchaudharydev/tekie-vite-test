import React, { Component, lazy, Suspense } from 'react'
import cx from 'classnames'
import { ImageBackground } from '../../../image'
import trailer_cut from '../../../assets/trailer.mp4'
import { Link } from 'react-router-dom'
import { enrollNowGA } from '../../../utils/analytics/ga'
import isFeatureEnabled from '../../../utils/isFeatureEnabled'
import './Hero.scss'

export default class Hero extends Component {
  state = {
    videoClassName: typeof window === 'undefined' ? true : window.innerWidth > window.innerHeight * 1.77
        ? 'landing-page-hero-videoPlayerWidth'
        : 'landing-page-hero-videoPlayerHeight',
    videoStyles: typeof window === 'undefined' ? true : window.innerWidth > window.innerHeight * 1.77
      ? { top: (((window.innerWidth / 1.7777) - window.innerHeight) / 2) * -1}
      : { left: (((window.innerHeight * 1.7777) - window.innerWidth) / 2) * -1}
  }

  componentDidMount() {
    const video = document.querySelector('#__landing_bg_video')
    const heroContainer = document.querySelector('#__landing_hero_container')
    video.playbackRate = 0.8
    video.addEventListener("playing", function() {
      if ( video.readyState === 4 ) {
        if (!video.paused) {
          heroContainer.classList.remove('landing-page-hero-containerThumbail')
          heroContainer.style.backgroundImage = ''
        }
        }
    });
    video.addEventListener("suspend", function(e) {
      if ( video.readyState === 4 ) {
        if (!video.paused) {
          heroContainer.classList.remove('landing-page-hero-containerThumbail')
          heroContainer.style.backgroundImage = ''
        }
      }
    })
    window.addEventListener('resize', () => {
      this.setState({
        videoClassName: window.innerWidth > window.innerHeight * 1.77
          ? 'landing-page-hero-videoPlayerWidth'
          : 'landing-page-hero-videoPlayerHeight',
        videoStyles: window.innerWidth > window.innerHeight * 1.77
          ? { top: (((window.innerWidth / 1.7777) - window.innerHeight) / 2) * -1}
          : { left: (((window.innerHeight * 1.7777) - window.innerWidth) / 2) * -1}
      })
    })
  }

  render() {
    const { videoStyles, videoClassName } = this.state
    const shouldIITIIMEnabled = isFeatureEnabled('landingPageIITIIM')
    return (
      <>
        <div className={'landing-page-hero-absoluteContainer'} style={{ position: 'fixed', zIndex: -1  }}>
          <video className={videoClassName} id="__landing_bg_video" style={{
            ...videoStyles,
            backgroundColor: '#041c24'
          }} playsinline muted autoPlay loop>
              <source src={trailer_cut} type="video/mp4"  />
          </video>
        </div>
        <ImageBackground
          className={cx('landing-page-hero-container', 'landing-page-hero-containerThumbail')}
          src={require('../../../assets/videoThumb.webp')}
          srcLegacy={require('../../../assets/videoThumb.jpg')}
          id="__landing_hero_container"
        >
          <div className={cx('landing-page-hero-absoluteContainer', 'landing-page-hero-flexColumn')}>
            <div className={'landing-page-hero-videoOverlay'}>
              <div className={cx('landing-page-hero-body', 'hero-body-scroll')}>
                <h1 className={cx('landing-page-hero-title', 'sr-200-15-600')}>
                  The World’s First<br/> Educational Series.
                </h1>
                <h2 className={cx('landing-page-hero-info', 'sr-250-15-600')}>
                  Teaches the basics of programming
                </h2>
                <div className='sr-300-5-600'>
                  <div className={cx('landing-page-hero-button')} onClick={() => {
                    this.props.openEnrollmentForm()
                    enrollNowGA("Hero Screen")
                  }}>
                    <span>Enroll Now</span>
                  </div>
                </div>
                <div className='sr-350-5-600'>
                  <div className={cx('landing-page-hero-watchTrailer')} onClick={() => { this.props.history.push('/trailer') }} style={{ cursor: 'pointer' }}>
                    <div className={'landing-page-hero-playButton'} >
                      {/* <Play/> */}
                    </div>
                    <span>watch trailer</span>
                  </div>
                </div>
              </div>
              <div className={cx('landing-page-hero-age12', 'sr-200-0-600')}>
                <span className={'landing-page-hero-age12Text'}>age</span>
                <span className={'landing-page-hero-age12Textmd'}>&nbsp;10</span>
                <span className={'landing-page-hero-age12Textsm'}>+</span>
              </div>
            </div>
            <div className={cx('landing-page-hero-teamFromContainer', !shouldIITIIMEnabled && 'landing-page-hero-teamFromContainerNoIIT')}>
              <div className={cx('landing-page-hero-broughtToYou', 'sr-700-10-600')}>Brought to you by a team from</div>
              <div className={cx('landing-page-hero-flexSingleRow', !shouldIITIIMEnabled && 'landing-page-hero-flexSingleRowNoIIT')}>
                <div className={cx('landing-page-hero-row', !shouldIITIIMEnabled && 'landing-page-hero-noIITFeatureRow')}>
                  <ImageBackground
                    className={cx('landing-page-hero-google', 'sr-200-10-600')}
                    src={require('../../../assets/google_lossless.webp')}
                    srcLegacy={require('../../../assets/google.png')}
                  />
                  <ImageBackground
                    className={cx('landing-page-hero-intel', 'sr-250-10-600')}
                    src={require('../../../assets/intel_lossless.webp')}
                    srcLegacy={require('../../../assets/intel.png')}
                  />
                  <ImageBackground
                    className={cx('landing-page-hero-microsoft', 'sr-300-10-600')}
                    src={require('../../../assets/microsoft_lossless.webp')}
                    srcLegacy={require('../../../assets/microsoft.png')}
                  />
                  <ImageBackground
                    className={cx('landing-page-hero-amazon', 'sr-350-10-600')}
                    src={require('../../../assets/amazon_lossless.webp')}
                    srcLegacy={require('../../../assets/amazon.png')}
                    style={{ marginRight: 0 }}
                  />
                  {shouldIITIIMEnabled && (
                    <>
                      <div className={cx('landing-page-hero-iconText', 'landing-page-hero-displayOnlyDesktop', 'sr-400-10-600')}>IIT DELHI</div>
                      <div className={cx('landing-page-hero-iconText', 'landing-page-hero-displayOnlyDesktop', 'sr-450-10-600')}>IIM Ahmedabad</div>
                      <div className={cx('landing-page-hero-iconText', 'landing-page-hero-displayOnlyDesktop', 'sr-500-10-600')}>NITs</div>
                    </>
                  )}
                </div>
                {shouldIITIIMEnabled && (
                  <div className={cx('landing-page-hero-row', 'landing-page-hero-displayOnlyMobile', 'landing-page-hero-rowText')}>
                    <div className={cx('landing-page-hero-iconText', 'iit-delhi-scroll')}>IIT DELHI</div>
                    <div className={cx('landing-page-hero-iconText', 'iim-scroll')}>IIM Ahmedabad</div>
                    <div className={cx('landing-page-hero-iconText', 'nit-scroll')}>NITs</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ImageBackground>
      </>
    )
  }
}
