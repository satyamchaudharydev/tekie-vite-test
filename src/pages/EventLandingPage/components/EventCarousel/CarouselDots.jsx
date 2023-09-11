import React, { memo } from 'react'
import './eventCarousel.scss'

const Dot = ({ active }) => {
  return (
    <span
      style={{ backgroundColor: active ? 'black' : 'white' }}
      className='eventCarousel-dots'
    />
  )
}

const MemoDot = memo(Dot)

const Dots = ({ slides, activeSlide }) => {
  return (
    <div
      className='eventCarousel-dotsData'
    >
      {slides.map((slide, i) => (
        <MemoDot key={slide} active={activeSlide === i} />
      ))}
    </div>
  )
}

export default Dots