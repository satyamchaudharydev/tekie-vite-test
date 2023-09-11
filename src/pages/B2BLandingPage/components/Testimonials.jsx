import React, { Component } from 'react'
import { motion } from 'framer-motion'
import { range } from 'lodash'
import { withRouter } from 'react-router-dom'
import cx from 'classnames'
import { ImageBackground } from '../../../image'
import 'swiper/swiper.scss';
import withScale from '../../../utils/withScale'

import './HeroSlideAnimations.scss'
import './Carousel.scss'

class Testimonials extends Component {
  state = {
    slides: this.getSlides(0, this.props.slides),
    allSlides: this.getAllSlides(0, this.props.slides),
    slideTopDimensions: [],
    step: 0,
  }

  componentDidMount() {
    this.setTop()
    this.enableAutoPlay()
  }

  enableAutoPlay = () => {
    const { animationSpeed } = this.props
    this.autoPlay = setInterval(() => {
      this.moveToSlide(this.cycleIndex(this.state.step + 1))
    }, animationSpeed)
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
    const { slides: propSlides } = this.props
    const  allSlides = []
    for (let subIndex = (-propSlides.length); subIndex < propSlides.length; subIndex++) {
      allSlides.push(slides[this.cycleIndex(i, subIndex)])
    } 
    return allSlides
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
    const { immersivePedogogy, customImageBGStyles } = this.props
    return (
      <>
        <div className={'b2b-landing-page-carousel-container'} id='testimonial-container'
          onMouseOver={this.disableAutoPlay} onMouseOut={this.enableAutoPlay}
        >
          <div style={{ display: 'flex', flexDirection: 'row',  position: 'relative' }}>
            {this.state.slides
              .map((slide, i) => (
                  <motion.div 
                    style={{
                      position: 'relative',
                      cursor: 'pointer',
                      zIndex: i === 1 ? 10 : 1,
                      height: '100%',
                      backgroundSize: 'contain',
                      display: 'flex',
                      flexDirection: 'row',
                    }}
                    key={slide.id}
                    onClick={() => this.moveToSlide(slide.id)}
                    className={cx(
                      i === 1
                        ? 'b2b-landing-page-carousel-cardTestimonialsActive' 
                        : 'b2b-landing-page-carousel-cardTestimonialsInActive',
                      i === 0
                        ? 'b2b-landing-page-carousel-cardTestimonialsInActiveLeft'
                        : i === 2
                          ? 'b2b-landing-page-carousel-cardTestimonialsInActiveRight'
                          : ''
                    )}
                    id={"testimonial-slide-" + slide.id}
                    initial={{
                      ...(i === 1 ? ({
                        scale: 1,
                      }) : ({
                        scale: 0.68
                      })),
                      y: i !== 1 ? 40 : 0,
                      opacity: i !== 1 ? 0 : 1,
                    }}
                    animate={{
                      ...(i === 1 ? ({
                        scale: 1,
                      }) : ({
                        scale: 0.68
                      })),
                      y: i !== 1 ? 40 : 0,
                      opacity: 1,
                    }}
                    dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
                  >
                  <div style={{ width: '100%' }}>
                    <ImageBackground
                      src={slide.thumbnailWebp}
                      srcLegacy={slide.thumbnailPng}
                      className={cx('b2b-landing-page-carousel-image-container', immersivePedogogy && 'b2b-landing-page-carousel-image-container-pedagogy')}
                      style={{
                        backgroundSize: immersivePedogogy ? 'contain' : 'cover',
                        boxSizing: 'border-box',
                        display: 'block',
                        position: 'relative',
                        ...customImageBGStyles
                      }}
                    >
                      {i === 1 ? slide.customRender : null}
                    </ImageBackground>
                    {!immersivePedogogy ? <span>{slide.content}</span> : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className={'b2b-landing-page-carousel-title'}>
                          {slide.content}
                        </div>
                        <div className={'b2b-landing-page-carousel-description'}>
                          {slide.description}
                        </div>
                      </motion.div>
                    )} 
                  </div>
                </motion.div>
            ))}
          </div>
        </div>
      </>
    )
  }
}

export default withRouter(withScale(Testimonials, {}))
