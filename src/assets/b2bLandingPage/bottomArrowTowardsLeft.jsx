import React from "react"

function SvgComponent(props) {
    return (
        <svg width="110" height="99" viewBox="0 0 114 99" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <g filter="url(#filter0_d)">
            <path d="M2.70703 4.63086L11.1119 10.5835L12.0646 0.328316L2.70703 4.63086ZM10.5382 6.24994C21.3815 8.32988 29.8914 14.7116 37.3468 23.2323C44.8167 31.7697 51.1556 42.3656 57.7068 52.8041C70.7204 73.5397 84.6157 93.7847 109.755 93.7847V92.0008C85.7395 92.0008 72.33 72.7485 59.2178 51.8558C52.7061 41.4802 46.2767 30.7292 38.6893 22.0576C31.0873 13.3694 22.2507 6.6802 10.8742 4.49799L10.5382 6.24994Z" fill="#113366"/>
            </g>
            <circle cx="109.755" cy="92.892" r="2.67584" fill="white" stroke="#113366" stroke-width="1.7839"/>
            <defs>
            <filter id="filter0_d" x="0.328503" y="0.328125" width="111.805" height="98.2134" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
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
