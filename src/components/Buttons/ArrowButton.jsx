import React from 'react'
import styles from './ResumeButton/ResumeButton.module.scss'
import ActionButton from './ActionButton'
import cx from 'classnames'

export const ArrowIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 10.1 17.254" style={props.style}>
    <defs>
        <linearGradient id="prefix__linear-gradient" x1="1.099" x2="0" y1=".5" y2=".5" gradientUnits="objectBoundingBox">
            <stop offset="0" stop-color="#00ade6"/>
            <stop offset="1" stop-color="#34e4ea"/>
        </linearGradient>
    </defs>
    <path id="prefix__Chevron" fill="url(#prefix__linear-gradient)" d="M8.027 16.9L.246 9.213a.82.82 0 0 1 0-1.171L8.027.351a1.225 1.225 0 0 1 1.717 0 1.191 1.191 0 0 1 0 1.7L3.088 8.628l6.656 6.578a1.192 1.192 0 0 1 0 1.7 1.225 1.225 0 0 1-1.717 0"/>
  </svg>
)

const Button = props => (
  <ActionButton title={props.title} {...props}  IconComponent={(
    <div className={cx(styles.iconContainerArrow, props.styles ? props.styles : '')} style={!props.isMobile ? {
      transform: 'scaleX(-1)'
    }:{
      transform: 'scaleX(-1)',
      width: '10px',
      height: '10px',
      marginTop: '1px',
      marginLeft: '1px'
    }}
    isMobile={props.isMobile}
    >
      <ArrowIcon />
    </div>
  )} />
)

export default Button
