import React from 'react'
import canWebP from './canWebP'

const ImageBackground = ({
  className,
  style = {},
  src,
  srcLegacy,
  getBackgroundImage,
  ...props
}) => {
  let webp = canWebP()
  if (global && global.webp) {
    webp = true
  }
  let srcBG = src
  if (!webp) {
    srcBG = srcLegacy
  }

  if (getBackgroundImage) {
    srcBG = getBackgroundImage(webp)
  }

  if (props.renderParent) {
    return props.renderParent({
      ...props,
      className,
      style: {
        ...style,
        backgroundImage: getBackgroundImage ? getBackgroundImage(webp) : `url("${srcBG}")`,
      }
    })
  }
  return (
    React.createElement("div", {
      ...props,
      className: className,
      style: {
        ...style,
        backgroundImage: getBackgroundImage ? getBackgroundImage(webp) : `url("${srcBG}")`
      }
    })
  )
}

export default ImageBackground
