import React from 'react'

const noSSR = (component) => {
  if (typeof window === 'undefined') {
    return <div />
  }
  return component
}

export default noSSR