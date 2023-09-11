import React, { useEffect } from 'react'

const scale = 1.6633336062

function GoogleSlide({slideLink}) {
  const ref = React.useRef(null)
  const [height, setHeight] = React.useState(0)
  useEffect(() => {
    const { current } = ref
    const { offsetWidth } = current
    setHeight(offsetWidth / scale)
  }, [ref])
  return (
    <iframe
        ref={ref}
        src={slideLink}
        title="Google Slide"
        width={"80%"}
        height={height}
        style={{border: "none"}}
        allowfullscreen="true" 
        mozallowfullscreen="true" 
        webkitallowfullscreen="true"
        >
    </iframe>
  )
}

export default GoogleSlide