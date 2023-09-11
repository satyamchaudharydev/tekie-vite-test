import * as React from "react"

function SvgComponent(props) {
    return (
        <svg width='100%' height='100%' viewBox="0 0 26.23 22.892" {...props}>
            <path
                data-name="Path 4655"
                d="M26.23 6.698v2.1a.773.773 0 00-.047.144 7.871 7.871 0 01-.708 2.413 16.45 16.45 0 01-3.179 4.472 44.408 44.408 0 01-8.97 7 .32.32 0 01-.391 0 47.379 47.379 0 01-7.344-5.408 22.9 22.9 0 01-4.2-4.923A8.9 8.9 0 01.245 5.651 7.355 7.355 0 0112.137 1.74c.351.3.661.653 1.012 1a1.13 1.13 0 01.071-.1A7.121 7.121 0 0120.039.125a7.109 7.109 0 015.878 5.138 13.367 13.367 0 01.313 1.435z"
                fill={props.isVideoLiked ? '#00ade6' : '#aaacae'}
                stroke={props.isVideoLiked ? '#00ade6' : '#aaacae'}
            />
        </svg>
    )
}

export default SvgComponent
