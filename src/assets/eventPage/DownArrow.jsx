import React from 'react'

const DownArrow = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 12.55 21.441"
    >
        <defs>
            <linearGradient
                id="down-arrow"
                x1="1.099"
                y1="0.5"
                x2="0"
                y2="0.5"
                gradientUnits="objectBoundingBox"
            >
                <stop offset="0" stop-color="#00ADE6"/>
                <stop offset="1" stop-color="#34E4EA"/>
            </linearGradient>
        </defs>
        <path
            fill="url(#down-arrow)"
            d="M8.027,16.9.246,9.213a.82.82,0,0,1,0-1.171L8.027.351a1.225,1.225,0,0,1,1.717,0,1.191,
            1.191,0,0,1,0,1.7L3.088,8.628l6.656,6.578a1.192,1.192,0,0,1,0,1.7,1.225,1.225,0,0,1-1.717,0"
        ></path>
    </svg>
)

export default DownArrow
