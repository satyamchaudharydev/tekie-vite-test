import React from 'react'
import { mapRange } from '../../utils/data-utils'

const getWaveDistance = progress => mapRange({
  from: [0, 100],
  to: [249.292, 98.292]
}, progress)

const PressButton = props => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 196.582 130.566">
      <defs>
        <linearGradient id="linear-gradient--press-button" x1="0.936" y1="0.123" x2="0.37" y2="0.628" gradientUnits="objectBoundingBox">
          <stop offset="0" stop-color="#34e4ea"/>
          <stop offset="1" stop-color="#00ade6"/>
        </linearGradient>
        <clipPath id="clip-path--press-button">
          <path id="Subtraction_4" data-name="Subtraction 4" d="M191.161,130.566H5.422a98.291,98.291,0,1,1,185.739,0Z" transform="translate(0.405)" fill="url(#linear-gradient)"/>
        </clipPath>
        <linearGradient id="linear-gradient-3--press-button" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0" stop-color="#34e4ea"/>
          <stop offset="1" stop-color="#34e4ea" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <g id="Group_12621" data-name="Group 12621" transform="translate(-0.405)" opacity="0.6">
        <path id="Subtraction_6" data-name="Subtraction 6" d="M191.161,130.566H5.422a98.291,98.291,0,1,1,185.739,0Z" transform="translate(0.405)" fill="url(#linear-gradient--press-button)"/>
        <g id="Mask_Group_80" data-name="Mask Group 80" clip-path="url(#clip-path--press-button)">
          <g id="Group_3751" data-name="Group 3751" transform={`translate(-2.53 ${getWaveDistance(props.progress)})`}>
            <path id="Path_7186" data-name="Path 7186" d="M464.036,30.533s21.6-19.283,46.279,3.857c0,0,16.583,20.825,45.893,0,0,0,37.955-36.638,72.89.772,0,0,24.3,23.138,45.122.77L673.988,204.1H463.8Z" transform="translate(-463.804 -137.815)" fill="url(#linear-gradient-3--press-button)"/>
          </g>
        </g>
      </g>
    </svg>
  )
}

export default PressButton
