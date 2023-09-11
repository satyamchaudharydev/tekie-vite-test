import React from 'react'

const DeleteIcon = props => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24.3 35.6">
      <defs>
        <linearGradient id="prefix__linear-gradient-deleteicon" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="#ff5744" />
          <stop offset="1" stopColor="#f98787" />
        </linearGradient>
      </defs>
      <g id="prefix__Layer_2" data-name="Layer 2" transform="translate(-63)">
        <g id="prefix__Layer_1" data-name="Layer 1" transform="translate(63)">
          <path id="prefix__ic_delete_24px-2" d="M1.5 32.2A3.5 3.5 0 0 0 5 35.6h13.9a3.4 3.4 0 0 0 3.4-3.4V11.4H1.5zM23.4 0l-5.8 1.6L15.4.4 7.1 2.6 5.9 4.8 0 6.4l.9 3.3 23.4-6.4z" 
            data-name="ic delete 24px-2" 
            fill="url('#prefix__linear-gradient-deleteicon')"
          />
        </g>
      </g>
    </svg>
  )
}

export default DeleteIcon