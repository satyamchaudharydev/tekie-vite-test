import React from 'react'
import isMobile from '../../../utils/isMobile'

const getTransformProps = (props) => {
    if (props && props.transformProps) {
        return props.transformProps
    }
}

const NextIcon = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 12.55 21.441"
        height={isMobile()&&15}
        width={isMobile()&&15}
    >
        <defs>
            <linearGradient
                id="next-arrow"
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
            fill="url(#next-arrow)"
            d="M2.072,16.9l7.781-7.69a.82.82,0,0,0,0-1.171L2.072.351a1.225,1.225,0,0,0-1.717,
            0,1.191,1.191,0,0,0,0,1.7L7.011,8.627.355,15.205a1.192,1.192,0,0,0,0,1.7,1.225,1.225,
            0,0,0,1.717,0"
            transform={getTransformProps(props)}
        ></path>
    </svg>
)

export default NextIcon
