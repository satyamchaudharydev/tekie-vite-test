import * as React from "react"
import {motion} from 'framer-motion'
import { hs } from "../../utils/size"
import { mapRange } from "../../utils/data-utils"

function Tube(props) {
  const [progress, setProgress] = React.useState(props.progress)

  React.useEffect(() => {
    setProgress(props.progress)
  }, [props.progress])

  const getTransform = progress => mapRange({
    from: [0, 100],
    to: [389, 0]
  }, progress);

  return (
    <svg
      width='100%'
      height='100%'
      viewBox="0 0 101.937 405.63"
    >
      <defs>
        <linearGradient
          id={`tube_${props.type}_a`}
          x1={0.5}
          x2={0.5}
          y2={1}
          gradientUnits="objectBoundingBox"
        >
          {props.tubeConfig.map(tube => (
            <stop offset={tube.offset} stopColor={tube.stopColor} stopOpacity={tube.stopOpacity} />
          ))}
        </linearGradient>
        <linearGradient
          id={`tube_${props.type}_b`}
          x1={0.5}
          x2={0.5}
          y2={1}
          gradientUnits="objectBoundingBox"
        >
          {props.bottomShine.map(tube => (
            <stop offset={tube.offset} stopColor={tube.stopColor} stopOpacity={tube.stopOpacity} />
          ))}
        </linearGradient>
        <linearGradient
          id={`tube_${props.type}_c`}
          x1={0.5}
          x2={0.5}
          y2={1}
          gradientUnits="objectBoundingBox"
        >
          {props.shine.map(tube => (
            <stop offset={tube.offset} stopColor={tube.stopColor} stopOpacity={tube.stopOpacity} />
          ))}
        </linearGradient>
        <linearGradient
          id={`tube_${props.type}_d`}
          x1={0.5}
          x2={0.5}
          y2={1}
          gradientUnits="objectBoundingBox"
        >
          {props.shine.map(tube => (
            <stop offset={tube.offset} stopColor={tube.stopColor} stopOpacity={tube.stopOpacity} />
          ))}
        </linearGradient>
        <linearGradient
          id={`tube_${props.type}_e`}
          x1={0.5}
          x2={0.5}
          y2={1}
          gradientUnits="objectBoundingBox"
        >
          {props.shine.map(tube => (
            <stop offset={tube.offset} stopColor={tube.stopColor} stopOpacity={tube.stopOpacity} />
          ))}
        </linearGradient>
        <linearGradient
          id={`tube_${props.type}_f`}
          x1={0.5}
          x2={0.5}
          y2={1}
          gradientUnits="objectBoundingBox"
        >
          {props.flakeGradient.map(tube => (
            <stop offset={tube.offset} stopColor={tube.stopColor} />
          ))}
        </linearGradient>
        <linearGradient
          id={`tube_${props.type}_g`}
          x1={0.5}
          y1={1}
          x2={0.5}
          gradientUnits="objectBoundingBox"
        >
          {props.borderGradient.map(tube => (
            <stop offset={tube.offset} stopColor={tube.stopColor} />
          ))}
        </linearGradient>
        <clipPath id={`clipath_${props.type}_g`}>
          <path
            data-name="Rectangle 1965"
            d="M0 0h93v348a46 46 0 01-46 46h-1a46 46 0 01-46-46V0z"
            transform="translate(1313 503)"
            fill="#fff"
          />
        </clipPath>
      </defs>
      <g
        data-name="Mask Group 99"
        clipPath={`url(#clipath_${props.type}_g)`}
        transform="translate(-1308.534 -500.021)"
      >
        <g transform="translate(58.178 182.008)">
          <motion.path
            data-name="Path 21278"
            d="M1301.453 715.193a45.907 45.907 0 0045.908-45.908v-196.14h-.046c-.061-63.276-.132-140.769-.132-140.93 0-3.308-9.26-7.978-11.541-8.913-9.73-4-19.428-.755-27.722 4.637a57.341 57.341 0 00-2.415 1.662 54.987 54.987 0 01-23.584 9.82c-9.455 1.466-17.931-1.464-26.39-5.543v335.407a45.909 45.909 0 0045.906 45.908z"
            fill={`url(#tube_${props.type}_a)`}
            animate={{y: getTransform(progress), opacity: progress === 0 ? 0 : 1}}
            initial={{opacity: 0}}
          />
        </g>
        <g transform="translate(58.178 183.809)">
          <motion.path
            data-name="Path 21282"
            d="M1307.92 326.27a58.747 58.747 0 00-2.417 1.662 54.969 54.969 0 01-23.582 9.82c-9.455 1.466-17.931-1.464-26.39-5.543 5.181-10.092 17.025-9.925 26.513-6.966 5.346 1.677 10.316 3.172 16 2.751a48.642 48.642 0 009.876-1.724z"
            fill={`url(#tube_${props.type}_f)`}
            animate={{y: getTransform(progress), opacity: progress === 0 ? 0 : 1}}
            initial={{opacity: 0}}
          />
        </g>
      </g>
      <path
        data-name="Path 34059"
        d="M1257.5 470.184v51.849a39.172 39.172 0 00-.124 2.98c0 22.677 19.1 41.061 42.674 41.061s42.676-18.385 42.676-41.061v-54.829z"
        fill={`url(#tube_${props.type}_b)`}
        transform="translate(-1248.89 -172.936)"
      />
      <path
        data-name="Path 21252"
        d="M1303.8 720.688a51.025 51.025 0 01-50.968-50.967V322.56h1.917v347.161a49.051 49.051 0 0098.1 0V322.56h1.917v347.161a51.025 51.025 0 01-50.966 50.967z"
        transform="translate(-1252.831 -315.058)"
        fill={`url(#tube_${props.type}_g)`}
      />

      <path
        data-name="Path 21283"
        d="M50.969 15.006c-17.629 0-50.968-1.57-50.968-7.5s33.34-7.5 50.968-7.5 50.968 1.568 50.968 7.5-33.34 7.5-50.968 7.5zm0-13.09c-31.682 0-48.526 3.59-49.054 5.6.529 1.98 17.375 5.572 49.054 5.572 31.6 0 48.44-3.575 49.05-5.587-.609-2.009-17.45-5.584-49.05-5.584z"
        fill={props.mainColor}
      />
      
      <path
        data-name="Path 21279"
        d="M1259.721 324.8v209.146l13.594 11.32V326.087a92.078 92.078 0 01-13.594-1.287z"
        transform="translate(-1246.514 -315.007)"
        fill={`url(#tube_${props.type}_c)`}
      />
      <path
        data-name="Path 21280"
        d="M1303.144 324.836v170.618l-8.926 7.824V325.465s2.44-.144 8.926-.629z"
        transform="translate(-1214.888 -314.97)"
        fill={`url(#tube_${props.type}_d)`}
      />
      <path
        data-name="Path 21281"
        d="M1269.034 325.586v279.32l4.462 12.81v-291.1s-1.219-.235-4.462-1.03z"
        transform="translate(-1237.975 -314.283)"
        fill={`url(#tube_${props.type}_e)`}
      />
    </svg>
  )
}

export default Tube
