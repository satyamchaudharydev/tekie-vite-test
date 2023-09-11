import React from "react"

function SvgComponent(props) {
    return (
        <svg width="175" height="58" viewBox="0 0 183 58" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <g filter="url(#filter0_d)">
            <path d="M179.778 5.63086L170.754 0.66725L170.967 10.9644L179.778 5.63086ZM5.97656 50.1873C42.8264 50.1873 66.9953 39.9798 90.5947 29.4589C114.172 18.9478 137.146 8.14444 171.79 6.68848L171.715 4.90616C136.692 6.37806 113.434 17.3237 89.8683 27.8296C66.3243 38.3258 42.4383 48.4034 5.97656 48.4034V50.1873Z" fill="#113366"/>
            </g>
            <g filter="url(#filter1_d)">
            <circle cx="5.97795" cy="49.2944" r="3.56779" fill="white"/>
            <circle cx="5.97795" cy="49.2944" r="2.67584" stroke="#113366" stroke-width="1.7839"/>
            </g>
            <defs>
            <filter id="filter0_d" x="3.59803" y="0.666992" width="178.559" height="54.2771" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
            <feOffset dy="2.37853"/>
            <feGaussianBlur stdDeviation="1.18926"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
            </filter>
            <filter id="filter1_d" x="0.0316277" y="45.7266" width="11.8926" height="11.8926" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
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
