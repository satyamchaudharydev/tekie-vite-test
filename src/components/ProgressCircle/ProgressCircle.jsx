import React from 'react'

const ProgressCircle = ({ percentage, sqSize, strokeWidth }) => {
    const radius = (sqSize - strokeWidth) / 2
    const viewBox = `0 0 ${sqSize} ${sqSize}`
    const dashArray = radius * Math.PI * 2
    const dashOffset = dashArray - dashArray * percentage / 100
    return (
        <svg
            width={sqSize}
            height={sqSize}
            viewBox={viewBox}
        >
            <circle
                style={{ fill: 'none', stroke: '#94C1CF' }}
                cx={sqSize / 2}
                cy={sqSize / 2}
                r={radius}
                strokeWidth={`${strokeWidth}px`}
            />
            <circle
                cx={sqSize / 2}
                cy={sqSize / 2}
                r={radius}
                strokeWidth={`${strokeWidth}px`}
                transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
                style={{
                    strokeDasharray: dashArray,
                    strokeDashoffset: dashOffset,
                    stroke: '#005773',
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    fill: 'none',
                }}
            />
        </svg>
    )
}

export default ProgressCircle