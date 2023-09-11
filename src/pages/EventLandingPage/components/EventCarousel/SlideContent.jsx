import React from 'react'
import './eventCarousel.scss'

const SliderContent = props => (
  <div
  className='eventCarousel-SliderContent'
  style={{ transform: `translateX(-${props.translate}px)`, transition: `transform ease-out ${props.transition}s`, width: `${props.width}px` }}
  >
    {props.children}
  </div>
)

export default SliderContent