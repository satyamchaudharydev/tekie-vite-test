import React from "react"

function SvgComponent(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 10.532 17.992"
      {...props}
      width='100%'
      height='100%'
    >
      <path
        d="M8.37 17.626L.256 9.607a.855.855 0 010-1.221L8.37.366a1.278 1.278 0 011.791 0 1.242 1.242 0 010 1.769L3.22 9l6.941 6.859a1.243 1.243 0 010 1.77 1.278 1.278 0 01-1.791 0"
        fill={props.color ? '#00ADE6' : "#0b535f"}
      />
    </svg>
  )
}

export default SvgComponent
