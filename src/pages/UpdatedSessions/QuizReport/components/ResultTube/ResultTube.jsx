import React, { useEffect, useState } from 'react'
import styles from './ResultTube.module.scss'
import { mapRange, maxCap } from '../../../../../utils/data-utils'
import { hs } from '../../../../../utils/size'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { AnsweredSvg, CorrectSvg, InCorrectSvg, NotAnsweredSvg } from '../../assets/quizReportSvgs'

const getDistance = progress => mapRange({
  from: [0, 100],
  to: [0, hs(275)]
}, progress)

const getText = distance => mapRange({
  from: [0, hs(275)],
  to: [0, 10]
}, distance)

// const TubePosed = posed.div({
//   enter: {
//     x: props => getDistance(props.progress),
//     transition:{
//       type: 'spring'
//     },
//   },
//   exit: {
//     x: 0,
//     transition:{
//       type: 'spring'
//     }
//   }
// })

const TubeFillTotal = props => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 338.057 52.271" className={props.className}>
      <defs>
        <linearGradient id="linear-gradient--result-tube-total" y1="0.5" x2="1" y2="0.5" gradientUnits="objectBoundingBox">
          <stop offset="0" stop-color="#cffbff"/>
          <stop offset="0.003" stop-color="#34e4ea"/>
          <stop offset="1" stop-color="#00ade6"/>
        </linearGradient>
      </defs>
      <path id="Path_20808" data-name="Path 20808" d="M-53.958-554.049h0A26.139,26.139,0,0,1-27.82-580.187H276.319c-2.566,4.817-4.412,9.64-3.489,15.024a29.764,29.764,0,0,0,6.181,13.423c.361.447.7.921,1.046,1.395,3.394,4.721,5.439,10.223,2.918,15.761-.589,1.3-3.528,6.595-5.61,6.595-.117,0-278.216.044-305.162.074A26.131,26.131,0,0,1-53.958-554.049Z" transform="translate(53.958 580.187)" fill="url(#linear-gradient--result-tube-total)"/>
    </svg>
  )
}

const TubeFill = props => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 338.057 52.271" className={props.className}>
      <defs>
        <linearGradient id={"linear-gradient--result-tube" + props.colors[0]} x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0" stop-color={props.colors[0]} />
        </linearGradient>
      </defs>
      <path id="Path_20808" data-name="Path 20808" d="M-53.958-554.049h0A26.139,26.139,0,0,1-27.82-580.187H276.319c-2.566,4.817-4.412,9.64-3.489,15.024a29.764,29.764,0,0,0,6.181,13.423c.361.447.7.921,1.046,1.395,3.394,4.721,5.439,10.223,2.918,15.761-.589,1.3-3.528,6.595-5.61,6.595-.117,0-278.216.044-305.162.074A26.131,26.131,0,0,1-53.958-554.049Z" transform="translate(53.958 580.187)" fill={`url(#${"linear-gradient--result-tube" + props.colors[0]})`} />
    </svg>
  )
}

const Flake = props => {
  return (
    <svg className={props.className} xmlns="http://www.w3.org/2000/svg" width="9.225" height="29.838" viewBox="0 0 9.225 29.838">
    <defs>
        <linearGradient id={"prefix__linear-gradient--flake" + props.colors[0] + props.colors[1]} x1=".5" x2=".5" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0" stop-color={props.colors[0]} />
            <stop offset="1" stop-color={props.colors[1]} />
        </linearGradient>
    </defs>
        <path id="prefix__Path_20809" d="M2.475-550.349c-.343-.474-.686-.93-1.046-1.377a29.787 29.787 0 0 1-6.181-13.43c-.923-5.386.923-10.213 3.489-15.031 6.353 2.952 6.248 9.7 4.385 15.1-1.057 3.045-2 5.875-1.732 9.112a25.248 25.248 0 0 0 1.085 5.626z" data-name="Path 20809" transform="translate(4.993 580.187)"  fill={`url(#${"prefix__linear-gradient--flake" + props.colors[0] + props.colors[1]})`} />
    </svg>
  )
}



const ResultTube = props => {
  const x = useMotionValue(getDistance(props.fill / props.total * 100))
  const xSpring = useSpring(
    x,
    { damping: 15 }
  )
  const [xState, setXState] = useState(xSpring.get())

  useEffect(() => {
    let prevX = 0
    const unsubscribe = xSpring.onChange(x => {
      if (x > prevX) {
        setXState(x)
        prevX = x
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    xSpring.set(getDistance(props.fill / props.total * 100))
  }, [props.fill])

  return (
    <>
    {props.summary  ? (
      <div className={styles.summaryStatsContainer}>
        {(props.label === 'Answered' || props.label === 'Submitted') && (
          <div className={styles.SummaryPipeLabel}>
            <AnsweredSvg />
            <p style={{ color: '#00ADE6' }}>{props.label}</p>
          </div>
        )}
        {props.label === 'Correct' && (
          <div className={styles.SummaryPipeLabel}>
            <CorrectSvg />
            <p style={{ color: '#01AA93' }}>{props.label}</p>
          </div>
        )}
        {props.label === 'Incorrect' && (
          <div className={styles.SummaryPipeLabel}>
            <InCorrectSvg />
            <p style={{ color: '#FF5744' }}>{props.label}</p>
          </div>
        )}
        {props.label === 'Unanswered' && (
          <div className={styles.SummaryPipeLabel}>
            <NotAnsweredSvg />
            <p style={{ color: '#A8A7A7' }}>{props.label}</p>
          </div>
        )}
        <div className={styles.summayTube} style={{position: 'relative'}}>
          <motion.div
            className={styles.summaryTubeFillSVG}
            style={{
              backgroundColor: props.colors[0],
              width: `${(props.fill / props.total * 100)}%`
            }}
          >
            <div
              className={styles.summaryTubeLine}
              style={{
                backgroundColor: props.lineColor,
              }}
            ></div>
          </motion.div>
        </div>
        <p className={styles.scoreLabelContainer}>
          {props.fill} <span>{props.fill === 1 ? 'Question' : 'Questions'}</span>
        </p>
      </div>
    ) : (
      <div className={styles.container}>
        <div className={styles.label}>{props.label}</div>
        <div className={styles.tube} style={{position: 'relative'}}>
          {props.noAnimate && (
            <div
              className={styles.tubeFillSVGFull}
             />
          )}
          <motion.div
            className={styles.tubeFillSVG}
            style={{
              backgroundColor: props.colors[0],
              width: `${(props.fill / props.total * 100)}%`
             }}
          >
            {/* {!props.noAnimate && (
              <TubeFill className={styles.tubeFillSVG} colors={props.colors} />
            )} */}
          </motion.div>
        </div>
        <div className={styles.scoreLabel}>
          {props.fill}
        </div>
      </div>
    )}
    </>
  )
}

export default ResultTube
