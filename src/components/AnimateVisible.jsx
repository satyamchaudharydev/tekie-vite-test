import React from 'react'

const AnimateVisible = props => {
  return (
    <div style={{
      maxHeight: props.visible ? '3000px' : 0,
      overflow: 'hidden',
      transition: props.transition
    }}>
      {props.children}
    </div>
  )
}

export default AnimateVisible
