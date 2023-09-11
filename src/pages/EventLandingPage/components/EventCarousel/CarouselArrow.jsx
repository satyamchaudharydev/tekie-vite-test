import React, { memo } from 'react'
import image_prev from "../../../../assets/eventPage/caro_prev.png"
import image_next from "../../../../assets/eventPage/caro_next.svg"
import './eventCarousel.scss'

const Arrow = ({ direction, handleClick }) => {
  return (
    <div
      onClick={handleClick}
      className='eventCarousel-arrow'
      style={direction === 'right' ? { right: '25px' } : { left: '25px' }}
    >
          {direction === 'right' ?
              <img src={image_next} style={{transform: `translateX(${direction === 'left' ? '-2' : '2'}px)`}} /> :
              <img src={image_prev} style={{transform: `translateX(${direction === 'left' ? '-2' : '2'}px)`}} />
          }
    </div>
  )
}

export default memo(Arrow)