import * as React from "react"

function SvgComponent(props) {
    return (
        <svg width='100%' height='100%' viewBox="0 0 12.318 23.648" {...props}>
            <path
                d="M6.288 17.357L.5 22.5V.5h11.318v22z"
                fill={props.isVideoBookmarked ? '#00ade6' : '#aaacae'}
                stroke={props.isVideoBookmarked ? '#00ade6' : '#aaacae'}
            />
        </svg>
    )
}

export default SvgComponent
