import React from "react"

function SvgComponent(props) {
    return (
        <svg width="180" height="130" viewBox="0 0 215 163" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <g filter="url(#filter0_d)">
            <path d="M212.593 153.225L203.893 147.713L203.469 158.003L212.593 153.225ZM2.94141 5.71519C50.9229 5.71519 77.9984 40.3867 104.784 76.4966C131.457 112.455 157.855 149.885 204.494 153.784L204.642 152.006C158.956 148.187 133.03 111.582 106.217 75.4338C79.5152 39.4372 51.9402 3.93129 2.94141 3.93129V5.71519Z" fill="#113366"/>
            </g>
            <circle cx="4.13029" cy="4.22893" r="2.67584" fill="white" stroke="#113366" stroke-width="1.7839"/>
            <defs>
            <filter id="filter0_d" x="0.562878" y="3.93164" width="214.409" height="158.829" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
            <feOffset dy="2.37853"/>
            <feGaussianBlur stdDeviation="1.18926"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
            </filter>
            </defs>
        </svg>

    )
}

export default SvgComponent
