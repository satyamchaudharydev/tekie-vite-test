import React from "react"

function SvgComponent(props) {
    return (
        <svg width="100" height="130" viewBox="0 0 114 145" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <g filter="url(#filter0_d)">
            <path d="M2.70703 135.631L12.1834 139.665L10.9389 129.441L2.70703 135.631ZM10.8932 135.525C23.0833 132.445 32.0553 122.528 39.4785 109.666C46.9061 96.7957 52.8943 80.7743 59.0107 65.2386C65.1458 49.6553 71.4086 34.5637 79.3987 23.3647C87.3736 12.1869 96.9664 5.02574 109.755 5.02574V3.24184C96.1645 3.24184 86.0993 10.9014 77.9465 22.3286C69.8089 33.7344 63.4741 49.0319 57.3508 64.5851C51.2087 80.1861 45.2775 96.0488 37.9335 108.774C30.5851 121.507 21.9332 130.896 10.4561 133.796L10.8932 135.525Z" fill="#113366"/>
            </g>
            <circle cx="109.755" cy="4.1342" r="2.67584" fill="white" stroke="#113366" stroke-width="1.7839"/>
            <defs>
            <filter id="filter0_d" x="0.328503" y="3.24219" width="111.805" height="141.18" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
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
