import React from 'react'

const Image = props => {
  let legacyType = 'image/png'
  if (props.jpg) {
    legacyType = 'image/jpeg'
  }
  if (props.legacyType) {
    legacyType = props.legacyType
  }
  if (typeof global !== 'undefined') {
    if (global.webp) {
      return React.createElement('img', { className: props.className, style: props.style, srcSet: props.src, type: 'image/webp' })
    }
  }
  return (
    React.createElement(
      'picture',
      null,
      React.createElement('source', { className: props.className, style: props.style, srcSet: props.src, type: 'image/webp' }),
      React.createElement('source', { className: props.className, style: props.style, srcSet: props.srcLegacy, type: legacyType }),
      React.createElement('img', { className: props.className, style: props.style, src: props.srcLegacy, alt: props.alt })
    )
  )
}


export default Image
