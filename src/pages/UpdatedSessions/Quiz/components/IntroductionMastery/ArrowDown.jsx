import * as React from "react"

function SvgComponent(props) {
  return (
    <svg width='100%' height='100%' viewBox="0 0 22.574 21.509" {...props}>
      <defs>
        <linearGradient
          id={"arrow_down_introduction_mastery__a_" + props.colors[0]}
          x1={0.5}
          x2={0.5}
          y2={0.748}
          gradientUnits="objectBoundingBox"
        >
          {props.colors.map((color, i) => (
            <stop offset={i} stopColor={color} />
          ))}
        </linearGradient>
      </defs>
      <path
        data-name="Path 21627"
        d="M-5385.216-473.372l11.32 21.509 11.254-21.509z"
        transform="translate(5385.216 473.372)"
        fill={`url(#arrow_down_introduction_mastery__a_${props.colors[0]})`}
      />
    </svg>
  )
}

export default SvgComponent
