import React from 'react'
import styles from './ResumeButton.module.scss'
import ActionButton from '../ActionButton'

const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 11.935 13.003"
  >
    <defs>
      <linearGradient
        id="a"
        x1="1.099"
        x2="0"
        y1="0.5"
        y2="0.5"
        gradientUnits="objectBoundingBox"
      >
        <stop offset="0" stopColor="#00ade6"></stop>
        <stop offset="1" stopColor="#34e4ea"></stop>
      </linearGradient>
    </defs>
    <path
      fill="url(#a)"
      d="M0 0v13l11.935-6.5z"
      data-name="Path 3629"
    ></path>
  </svg>
)


const ResumeButton = props => (
  <ActionButton {...props} IconComponent={(
    <div className={styles.iconContainer}>
      <PlayIcon />
    </div>
  )} />
)

export default ResumeButton