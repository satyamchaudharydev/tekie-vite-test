import React, { memo } from 'react'
import './eventCarousel.scss'

const Slide = ({ content, width }) => {
  return (
    <div
      >{content}</div>
  )
}

export default memo(Slide)