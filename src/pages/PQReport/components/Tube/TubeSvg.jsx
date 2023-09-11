import React from 'react'
import Posed from 'react-pose'
import { mapRange } from '../../../../utils/data-utils'


const getTransform = (progress) => mapRange({
  from: [0, 100],
  to: [560, 0]
}, progress)

const PosedPath = Posed.path({
  inActive: {
    transform: 'translateY(520px)',
    transition: {
      type: 'spring'
    }
  },
  active: {
    transform: props => `translateY(${getTransform(props.progress)}px)`,
    transition: props => ({
      type: props.progress > 80 ? 'tween' : 'spring'
    })
  }
})

const SvgComponent = props => (
  <svg
    width='100%'
    height='100%'
    viewBox='0 0 121 570'
    fillRule='evenodd'
    clipRule='evenodd'
    strokeMiterlimit={1.414}
    {...props}
  >
    <defs>
      <linearGradient
        id={'prefix___Linear1' + props.i}
        x1={181.24}
        y1={568.6}
        x2={181.24}
        y2={45.64}
        gradientUnits='userSpaceOnUse'
        gradientTransform='rotate(90 181.24 307.12)'
      >
        {props.bodyGradient.map((stop, i) => (
          <stop {...stop} key={i} />
        ))}
      </linearGradient>
      <linearGradient
        id={'prefix___Linear2' + props.i}
        x1='0%'
        y1='0%'
        x2='100%'
        y2='0%'
        gradientUnits='userSpaceOnUse'
        gradientTransform='translate(-93.38 307.13) scale(2.2)'
      >
        {props.borderGradient.map((stop, i) => (
          <stop {...stop} key={i} />
        ))}
      </linearGradient>
      <linearGradient
        id={'prefix___Linear4' + props.i}
        x1='0%'
        y1='0%'
        x2='100%'
        y2='0%'
        gradientUnits='userSpaceOnUse'
        gradientTransform='rotate(-90 367.35 197.98) scale(3)'
      >
        {props.fillGradient.map((stop, i) => (
          <stop {...stop} key={i} />
        ))}
      </linearGradient>
      <linearGradient
        id={'prefix___Linear5' + props.i}
        x1={127.77}
        y1={106.89}
        x2={189.04}
        y2={106.89}
        gradientUnits='userSpaceOnUse'
      >
        {props.flakeGradient.map((stop, i) => (
          <stop {...stop} key={i} />
        ))}
      </linearGradient>
    </defs>
    <g transform='translate(-108.8 -.878)'>
      <path
        d='M430.7 307.13c0-32.276-26.204-58.48-58.48-58.48h-406c-32.276 0-58.48 26.204-58.48 58.48v.01c0 32.276 26.204 58.48 58.48 58.48h406c32.276 0 58.48-26.204 58.48-58.48v-.01z'
        fill={`url(#prefix___Linear1${props.i})`}
        transform='rotate(-90 169.22 307.13)'
      />
      <path
        d='M430.7 307.13c0-32.276-26.204-58.48-58.48-58.48h-406c-32.276 0-58.48 26.204-58.48 58.48v.01c0 32.276 26.204 58.48 58.48 58.48h406c32.276 0 58.48-26.204 58.48-58.48v-.01z'
        fill='none'
        strokeWidth={2.24}
        stroke={`url(#prefix___Linear2${props.i})`}
        transform='rotate(-90 169.22 307.13)'
      />
      <g transform='translate(-.447 2.447)'>
        <clipPath id='prefix__a'>
          <path
            d='M223.663 102.686c0-1.473-.075-2.927-.208-4.363v-.689a2.506 2.506 0 0 0-.151-.822c-3.041-25.498-25.573-45.273-52.941-45.273-28.331 0-51.543 21.258-53.196 48.078l-.104-.047V507.828c0 29.239 24.061 53.299 53.3 53.299h.01c29.234 0 53.29-24.056 53.29-53.29v-.057c-.066-65.869-.179-345.835-.208-400.74.133-1.464.208-2.9.208-4.354z'
            clipRule='nonzero'
          />
        </clipPath>
        <g clipPath='url(#prefix__a)'>
          <PosedPath
            pose={props.poseState}
            d='M169.37 565.33c-29.459 0-53.7-24.241-53.7-53.7V18.999c9.89 4.77 19.8 8.2 30.86 6.48a64.326 64.326 0 0 0 27.58-11.48c.92-.67 1.85-1.31 2.83-1.94 9.7-6.31 21-10.11 32.42-5.42 2.67 1.1 13.5 6.55 13.5 10.42 0 .24.13 420.901.21 494.531v.06c0 29.448-24.232 53.68-53.68 53.68h-.02z'
            fill={`url(#prefix___Linear4${props.i})`}
            fillRule='nonzero'
            progress={props.progress}
            ref={props.setPath1}
          />
          <PosedPath
            pose={props.poseState}
            d='M176.94 12.059c-1 .64-1.91 1.27-2.83 1.94a64.33 64.33 0 0 1-27.57 11.47c-11.06 1.71-21-1.71-30.86-6.48 6.06-11.8 19.91-11.61 31-8.14 6.25 2 12.07 3.71 18.71 3.22a56.861 56.861 0 0 0 11.55-2.01z'
            fill={`url(#prefix___Linear5${props.i})`}
            fillRule='nonzero'
            progress={props.progress}
            ref={props.setPath2}
          />
        </g>
      </g>
    </g>
  </svg>
)

export default SvgComponent
