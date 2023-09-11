import React from 'react'
import './styles.scss'

const DesktopOnly = ({ children }) => {
  const isMobile =  typeof window === 'undefined' ? false : window.innerWidth < 900
  if (!isMobile) return children
  return <></>
}

export default DesktopOnly
