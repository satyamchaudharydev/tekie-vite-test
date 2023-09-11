import React, { Component } from 'react'
import cx from 'classnames'
import { motion } from 'framer-motion'
import { withRouter } from 'react-router-dom'
import { canUseWebP } from '../../../image'
import withScale from '../../../utils/withScale'
import { hs } from '../../../utils/size'
import ArrowSVG from '../../../assets/arrowIcon'
import './Carousel.scss'

class Carousel extends Component {
  state = {
    slides: this.props.slides
  }


  cycleIndex(step, i = 0) {
    return (step + i + 3) % 3
  }

  getSlides(i, slides) {
    return [
      slides[this.cycleIndex(i, -1)],
      slides[this.cycleIndex(i)],
      slides[this.cycleIndex(i, 1)],
    ]
  }
  
  setSlides(i, slides = this.state.slides) {
    this.setState({
      slides: this.getSlides(i, slides)
    })
  }

  render() {
    const isMobile = typeof window === 'undefined' ? false : window.innerWidth < 900
    
    return (
      <div className={cx('landing-page-carousel-container', 'sr-300-5-600')}>
        <div style={{ display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
          {this.state.slides
            .filter((slide, i) => isMobile ? i === 1 : true)
            .map((slide, i) => (
              <motion.div 
                key={slide.id} style={{ position: 'relative' }} className={'landing-page-carousel-rowCenter'}>
                  <motion.div className={i === 1 ? 'landing-page-carousel-text' : 'landing-page-carousel-textInActive'}>{slide.text}</motion.div>
                  <motion.div
                    className={i === 1 ? 'landing-page-carousel-cardActive' : 'landing-page-carousel-cardInActive'}
                    style={{
                      position: 'relative',
                      cursor: 'pointer',
                      zIndex: i === 1 ? 2 : 1,
                      backgroundSize: 'contain',
                      display: 'flex',
                      flexDirection: 'row',
                      backgroundImage: canUseWebP() ? `url("${slide.webpBackgroundImage}")` : `url("${slide.backgroundImage}")`
                    }}
                    animate
                    whileHover={{
                      scale: isMobile ? 1 : 1.1
                    }}
                    initial={{
                      scale: 1
                    }}
                  >
                  <div
                    style={{ 
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }} 
                    onClick={() => {
                      this.props.history.push(slide.route)
                    }}>
                  </div>
                  {isMobile && (
                    <>
                      <div style={{
                        width: '50%',
                        height: '100%',
                        pointerEvents: 'none',
                        transform: 'scaleX(-1)',
                        backgroundImage: 'linear-gradient(89deg, rgba(0, 23, 31, 0) 1%, #00171f 99%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                      }}>
                        <div className={'landing-page-carousel-arrow'} onClick={() => {
                          this.setSlides(0)
                        }}>
                          <ArrowSVG />
                        </div>
                        
                      </div>
                      <div style={{
                        width: '50%',
                        height: '100%',
                        pointerEvents: 'none',
                        backgroundImage: 'linear-gradient(89deg, rgba(0, 23, 31, 0) 1%, #00171f 99%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end'
                      }}>
                        <div className={'landing-page-carousel-arrow'} onClick={() => {
                          this.setSlides(0)
                        }}>
                          <ArrowSVG />
                        </div>
                      </div>
                    </>
                  )}
                  </motion.div>
                </motion.div>
            ))}
        </div>
      {isMobile ? (
        <></>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            padding: `0 ${hs(136)}px`,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            zIndex: 5,
            pointerEvents: 'none'
          }}
          >
            <motion.div
              style={{
                width: hs(501),
                height: '100%',
                backgroundImage: 'linear-gradient(89deg, rgba(0, 23, 31, 0) 15%, #00171f 99%)',
                transform: 'scaleX(-1)',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                pointerEvents: 'auto',
                cursor: 'pointer'
              }}
              whileHover={{
                backgroundImage: 'linear-gradient(89deg, rgba(0, 23, 31, 0) 30%, #00171f 90%)',
              }}
              onClick={() => {
                this.setSlides(0)
              }}
            >
              <div style={{
                width: hs(27.9),
                height: hs(54.6),
                marginTop: hs(210),
                transform: 'scaleX(-1)'
              }}>
                <ArrowSVG />
              </div>
            </motion.div>
            <motion.div
              style={{
                width: hs(501),
                height: '100%',
                backgroundImage: 'linear-gradient(89deg, rgba(0, 23, 31, 0) 15%, #00171f 99%)',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                pointerEvents: 'auto',
                cursor: 'pointer'
              }}
              whileHover={{
                backgroundImage: 'linear-gradient(89deg, rgba(0, 23, 31, 0) 30%, #00171f 90%)',
              }}
              onClick={() => {
                this.setSlides(2)
              }}
            >
              <div style={{
                width: hs(27.9),
                height: hs(54.6),
                marginTop: hs(210),
                transform: 'scaleX(-1)'
              }}>
                <ArrowSVG />
              </div>
            </motion.div>
          </div>
      )}
      </div>
    )
  }
}

export default withRouter(withScale(Carousel, {
  cardActive: {
    width: 644,
    height: 362,
  },
  cardActiveM: {
    width: '100%',
    height: '100%'
  },
  cardInActive: {
    width: 501,
    height: 282,
  }
}))
