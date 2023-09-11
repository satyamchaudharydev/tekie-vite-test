import React, { Component } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { range, max } from 'lodash'
import { withRouter } from 'react-router-dom'
import cx from 'classnames'
import { ImageBackground } from '../../../image'
import 'swiper/swiper.scss';
import { Swiper, SwiperSlide } from 'swiper/react';
import withScale from '../../../utils/withScale'
import { hs, hsm } from '../../../utils/size'
import scrollStop from '../../../utils/scrollStop'
import ArrowSVG from '../../../assets/arrowIcon'
import ParentPlaceholder from './parentPlaceholderIcon'
import StudentPlaceholder from './studentPlaceholderIcon'

import './Carousel.scss'

const spring = {
  type: "spring",
};

const variants = {
  active: {
    scale: 1
  },
  hover: {
    scale: 1.1
  }
}

class Testimonials extends Component {
  state = {
    slides: this.getSlides(0, this.props.slides),
    allSlides: this.getAllSlides(0, this.props.slides),
    slideTopDimensions: [],
    step: 0,
    stepMobile: 0,
  }

  componentDidMount() {
    this.setTop()
    this.enableAutoPlay()
  }

  enableAutoPlay = () => {
    this.autoPlay = setInterval(() => {
      this.moveToSlide(this.cycleIndex(this.state.step + 1))
    }, 5000)
  }

  disableAutoPlay = () => {
    window.clearInterval(this.autoPlay)
  }

  setTop = () => {
    const target = document.getElementById('testimonial-container')
    const slides = range(0, 3)
    const slideTopDimensions = {}
    for (const slide of this.state.slides) {
      const slideElem = document.getElementById("testimonial-slide-" + slide.id)
      if (target && slideElem) {
        slideTopDimensions[slide.id] = (target.getBoundingClientRect().height - slideElem.getBoundingClientRect().height) / 2
      }
    }
    this.setState({ slideTopDimensions })
  }

  cycleIndex(step, i = 0) {
    return (step + i + this.props.slides.length) % this.props.slides.length
  }

  getSlides(i, slides) {
    return [
      slides[this.cycleIndex(i, -1)],
      slides[this.cycleIndex(i)],
      slides[this.cycleIndex(i, 1)],
    ]
  }

  getAllSlides(i, slides) {
    return [
      slides[this.cycleIndex(i, -2)],
      slides[this.cycleIndex(i, -1)],
      slides[this.cycleIndex(i)],
      slides[this.cycleIndex(i, 1)],
      slides[this.cycleIndex(i, 2)],
    ]
  }
  
  setSlides(i, slides = this.state.allSlides) {
    this.setState({
      slides: this.getSlides(i, slides),
      allSlides: this.getAllSlides(i, slides),
      step: this.state.allSlides[i].id
    })
  }

  moveToSlide(i) {
    const slideIndex = this.state.allSlides.findIndex(slide => slide.id === i)
    this.setSlides(slideIndex)
  }

  render() {
    const { step } = this.state
    const isMobile = typeof window === 'undefined' ? false : window.innerWidth < 900
    const stylesJS = this.props.styles
    const slides = this.props.slides
    if (isMobile) {
      return (
        <>
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            onSlideChange={swiper => this.setState({ stepMobile: swiper.activeIndex })}
            onSwiper={(swiper) => this.swiper = swiper}
          >
            {slides
              .map((slide, i) => (
                <SwiperSlide style={{
                  marginTop: hsm(35)
                }}>
                  <div style={{
                    width: '100%',
                    flex: '0 0 auto',
                    height: hsm(587, 1, 360),
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <motion.div 
                        key={slide.id}
                        style={{ height: '100%' }}
                        transition={{ ease: "easeOut", duration: 2 }}
                      >
                      <motion.div 
                        style={{
                          position: 'relative',
                          // background: `url('${slide.backgroundImage}')`,
                          cursor: 'pointer',
                          zIndex: i === 1 ? 10 : 1,
                          backgroundSize: 'contain',
                          display: 'flex',
                          flexDirection: 'row',
                        }}
                        className={'landing-page-carousel-cardTestimonialsActive'}
                        id={"testimonial-slide-" + slide.id}
                      >
                        <div className={'landing-page-carousel-quote'}></div>
                        <div className={'landing-page-carousel-cardTestimonialBody'}>
                          <div className={'landing-page-carousel-studentName'}>{slide.childName}</div>
                          <div className={'landing-page-carousel-gradeInfo'}>{slide.gradeInfo}</div>
                          <div className={'landing-page-carousel-parentName'}>{slide.parentName}</div>
                          <div className={'landing-page-carousel-hr'}></div>
                          <div className={'landing-page-carousel-testimonial'}>
                            {slide.testimonial}
                          </div>
                        </div>
                        <div className={'landing-page-carousel-picturesContainer'}>
                          {slide.parentProfile ? (
                            <ImageBackground
                              src={slide.parentProfileWebp}
                              srcLegacy={slide.parentProfile}
                              className={'landing-page-carousel-parentPicture'}
                            />
                          ) : (
                            <div
                              className={'landing-page-carousel-parentPicture'}
                              style={{ boxShadow: 'none' }}
                            >
                              <div className={'landing-page-carousel-placeholderImage'}>
                                <ParentPlaceholder /> 
                              </div>
                            </div>
                          )}
                          {slide.studentProfile ? (
                            <ImageBackground
                              src={slide.studentProfileWebp}
                              srcLegacy={slide.studentProfile}
                              className={'landing-page-carousel-childPicture'}
                            />
                          ) : (
                            <div
                              className={'landing-page-carousel-childPicture'}
                              style={{ boxShadow: 'none' }}
                            >
                              <div className={'landing-page-carousel-placeholderImage'}>
                                <StudentPlaceholder /> 
                              </div>
                            </div>
                          )}
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={stylesJS.indicatorContainer}>
              <div style={{ ...stylesJS.arrowMobile, ...stylesJS.arrowMobileLeft }} onClick={() => {
                if (this.state.stepMobile === 0) {
                  this.swiper.slideTo(this.props.slides.length)
                } else {
                  this.swiper.slidePrev()
                }
              }}>
                <ArrowSVG className={'landing-page-carousel-mobileArrowSVG'} />
              </div>
              {range(this.props.slides.length).map(i => (
                <motion.div style={{
                  ...stylesJS.indicator,
                  ...((i === this.props.slides.length - 1)
                    ? {marginRight: 0 }
                    : {})
                  }}
                  onClick={() => {
                    this.swiper.slideTo(i)
                  }}
                  whileHover={{
                    opacity: 0.4,
                    background: '#57e1ed'
                  }}
                  initial={{
                    opacity: 0.7,
                    background: 'transparent'
                  }}
                  animate={this.state.stepMobile === i ? ({
                    backgroundImage: 'linear-gradient(136deg, #34e4ea 22%, #00ade6 85%)',
                  }) : ({
                    backgroundImage: 'transparent',
                    background: 'transparent'
                  })}
                >
                </motion.div>
              ))}
              <div
                style={{ ...stylesJS.arrowMobile, ...stylesJS.arrowMobileRight }}
                onClick={() => {
                  if (this.state.stepMobile === this.props.slides.length - 1) {
                    this.swiper.slideTo(0)
                  } else {
                    this.swiper.slideNext() 
                  }
                }}
              >
                <ArrowSVG className={'landing-page-carousel-mobileArrowSVG'} />
              </div>
            </div>
          </div>
        </>
      )
    }

    return (
      <>
        <div className={'landing-page-carousel-container'} id='testimonial-container' onMouseOver={this.disableAutoPlay} onMouseOut={this.enableAutoPlay}>
          <div style={{ display: 'flex', flexDirection: 'row',  position: 'relative' }}>
            {this.state.slides
              .map((slide, i) => (
                <motion.div 
                  key={slide.id}
                  transition={{ ease: "easeOut", duration: 2 }}
                >
                  <motion.div 
                    style={{
                      position: 'relative',
                      cursor: 'pointer',
                      zIndex: i === 1 ? 10 : 1,
                      height: hs(550, 1, 1440),
                      backgroundSize: 'contain',
                      display: 'flex',
                      flexDirection: 'row',
                    }}
                    onClick={() => this.moveToSlide(slide.id)}
                    className={cx(
                      i === 1
                        ? 'landing-page-carousel-cardTestimonialsActive' 
                        : 'landing-page-carousel-cardTestimonialsInActive',
                      i === 0
                        ? 'landing-page-carousel-cardTestimonialsInActiveLeft'
                        : i === 2
                          ? 'landing-page-carousel-cardTestimonialsInActiveRight'
                          : ''
                    )}
                    id={"testimonial-slide-" + slide.id}
                    initial={{
                      ...(i === 1 ? ({
                        scale: 1,
                      }) : ({
                        scale: 0.68
                      })),
                      y: i !== 1 ? 60 : 0,
                      opacity: 0,
                    }}
                    animate={{
                      ...(i === 1 ? ({
                        scale: 1,
                      }) : ({
                        scale: 0.68
                      })),
                      y: i !== 1 ? 60 : 0,
                      opacity: 1,
                      top: i === 1 ? 0 : hs(50),
                    }}
                    dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
                  >
                  <div style={{ display: 'flex', flexDirection: 'row' }} className={i === 1 ? 'sr-300-5-600' : 'sr-600-5-600'}>
                    <div className={cx('landing-page-carousel-quote', 'sr-700-15-600')}></div>
                    <div className={'landing-page-carousel-cardTestimonialBody'}>
                      <div className={'landing-page-carousel-studentName'}>{slide.childName}</div>
                      <div className={'landing-page-carousel-gradeInfo'}>{slide.gradeInfo}</div>
                      <div className={'landing-page-carousel-parentName'}>{slide.parentName}</div>
                      <div className={'landing-page-carousel-hr'}></div>
                      <div className={cx('landing-page-carousel-testimonial', i !== 1 ? 'landing-page-carousel-testimonialInActive' : '')}>
                        {slide.testimonial}
                      </div>
                    </div>

                    <div className={'landing-page-carousel-picturesContainer'}>
                      {slide.parentProfile ? (
                        <ImageBackground
                          src={slide.parentProfileWebp}
                          srcLegacy={slide.parentProfile}
                          className={'landing-page-carousel-parentPicture'}
                        />
                      ) : (
                        <div
                          className={'landing-page-carousel-parentPicture'}
                          style={{ boxShadow: 'none' }}
                        >
                          <div className={'landing-page-carousel-placeholderImage'}>
                            <ParentPlaceholder /> 
                          </div>
                        </div>
                      )}
                      {slide.studentProfile ? (
                        <ImageBackground
                          src={slide.studentProfileWebp}
                          srcLegacy={slide.studentProfile}
                          className={'landing-page-carousel-childPicture'}
                        />
                      ) : (
                        <div
                          className={'landing-page-carousel-childPicture'}
                          style={{ boxShadow: 'none' }}
                        >
                          <div className={'landing-page-carousel-placeholderImage'}>
                            <StudentPlaceholder />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
          <div style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            zIndex: 5,
            pointerEvents: 'none'
          }}>
            <div style={stylesJS.overlayLeft}></div>
            <div style={stylesJS.overlayRight}></div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={stylesJS.indicatorContainer}>
            {range(this.props.slides.length).map(i => (
              <motion.div style={{
                ...stylesJS.indicator,
                ...((i === this.props.slides.length - 1)
                  ? {marginRight: 0 }
                  : {})
                }}
                onClick={() => {
                  this.moveToSlide(i) 
                }}
                whileHover={{
                  opacity: 0.4,
                  background: '#57e1ed'
                }}
                initial={{
                  opacity: 0.7,
                  background: 'transparent'
                }}
                animate={this.state.step === i ? ({
                  backgroundImage: 'linear-gradient(136deg, #34e4ea 22%, #00ade6 85%)',
                }) : ({
                  backgroundImage: 'transparent',
                  background: 'transparent'
                })}
              >

              </motion.div>
            ))}
          </div>
        </div>
      </>
    )
  }
}

export default withRouter(withScale(Testimonials, {
  overlayLeft: {
    width: 636,
    height: 700,
    backgroundImage: 'linear-gradient(88deg, rgba(0, 23, 31, 0) 5%, #00171f 99%)',
  },
  overlayRight: {
    width: 636,
    height: 700,
    backgroundImage: 'linear-gradient(272deg, rgba(0, 23, 31, 0.7) 95%, #00171f 72%)',
  },
  activeIndicator: {
    width: 18,
    height: 18,
    backgroundImage: 'linear-gradient(136deg, #34e4ea 22%, #00ade6 85%)',
    opacity: 0.7,
    borderRadius: '50%',
    position: 'absolute',
    top: 1,
  },
  indicator: {
    width: 17,
    height: 17,
    opacity: 0.7,
    border: 'solid 1px #57e1ed',
    borderWidth: 1,
    marginRight: 17,
    borderRadius: '50%',
    cursor: 'pointer',
    background: 'transparent'
  },
  indicatorM: {
    width: 10,
    height: 10,
    opacity: 0.7,
    border: 'solid 1px #57e1ed',
    borderWidth: 1,
    marginRight: 8,
    borderRadius: '50%',
    cursor: 'pointer',
    background: 'transparent'
  },
  indicatorContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 34,
    width: 'min-content'
  },
  indicatorContainerM: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    width: 'min-content'
  },
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
  },
  cardContainer: {
    position: 'absolute'
  },
  arrowMobile: {
    width: 9.4 * 1.1,
    height: 18.5 * 1.1,
  },
  arrowMobileLeft: {
    marginRight: 12,
  },
  arrowMobileRight: {
    marginLeft: 12,
    transform: 'scaleX(-1)'
  }
}))
