import React from 'react'
import './styles.scss'

const MobileOnly = ({ children, ...props }) => {
  const isMobile =  typeof window === 'undefined' ? false : window.innerWidth < 900
  if (isMobile) return children
  return <></>
}

export default MobileOnly
