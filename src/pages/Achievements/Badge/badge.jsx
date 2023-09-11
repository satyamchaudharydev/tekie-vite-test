import React from 'react'
import Lottie from 'react-lottie'
import styles from './styles.module.scss'
import getPath from '../../../utils/getPath'
import classNames from 'classnames'
import RotatingBadge from '../../../assets/animations/rotationBadge.json'
import { Map } from 'immutable'

const rotatingBadgeOptions = {
  loop: false,
  autoplay: true,
  animationData: RotatingBadge,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
}

const BadgeHolderSVG = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" id="prefix__Group_13309" width="100%" height="100%" data-name="Group 13309" viewBox="0 0 149.485 149.489">
      <defs>
        <linearGradient id="prefix__linear-gradient" x1=".865" x2=".168" y1=".053" y2=".907" gradientUnits="objectBoundingBox">
          <stop offset="0" stop-color="#58e8ed" />
          <stop offset="1" stop-color="#25a0e6" />
        </linearGradient>
        <linearGradient id="prefix__linear-gradient-2" x1=".5" x2=".5" y1=".11" y2=".862" xlinkHref="#prefix__linear-gradient"/>
        <linearGradient id="prefix__linear-gradient-3" x1=".362" x2=".727" y1=".205" y2=".985" gradientUnits="objectBoundingBox">
          <stop offset="0" stop-color="#34e4ea" />
          <stop offset="1" stop-color="#2875e5" />
        </linearGradient>
        <linearGradient id="prefix__linear-gradient-4" x1="-.351" x2=".851" y1="1.343" y2=".264" gradientUnits="objectBoundingBox">
          <stop offset="0" stop-color="#25a0e6" />
          <stop offset="1" stop-color="#58e8ed" />
        </linearGradient>
        <linearGradient id="prefix__linear-gradient-5" x1="-.037" x2="1.003" y1=".805" y2="-.045" gradientUnits="objectBoundingBox">
          <stop offset="0" stop-color="#58e8ed" />
          <stop offset="1" stop-color="#e0f9fb" />
        </linearGradient>
        <linearGradient id="prefix__linear-gradient-6" x1=".5" x2=".5" y1=".908" y2=".054" gradientUnits="objectBoundingBox">

          <stop offset="0" stop-color="#58e8ed" />
          <stop offset="1" stop-color="#2875e5" />
        </linearGradient>
      </defs>
      <ellipse id="prefix__Ellipse_839" cx="74.743" cy="74.744" data-name="Ellipse 839" rx="74.743" ry="74.744" fill="url(#prefix__linear-gradient)"/>
      <ellipse id="prefix__Ellipse_840" cx="71.553" cy="71.554" data-name="Ellipse 840" rx="71.553" ry="71.554" transform="translate(3.19 3.19)" fill="url(#prefix__linear-gradient-2)"/>
      <ellipse id="prefix__Ellipse_841" cx="71.553" cy="71.554" data-name="Ellipse 841" rx="71.553" ry="71.554" transform="translate(3.19 3.19)" fill="url(#prefix__linear-gradient-3)"/>
      <path id="prefix__Path_21225" d="M1325.533 759.157c-2.744.173-5.428 1.581-6.4 4.093a55.391 55.391 0 0 1-41.117 34.428c-3.49.672-5.418 4.268-4.9 7.636a7.626 7.626 0 0 0 9.045 6.165 69.891 69.891 0 0 0 34.643-18.889 64.316 64.316 0 0 0 13.067-18.24c1.243-2.691 3.781-7.34 2.907-10.294a6.851 6.851 0 0 0-7.053-4.907z" data-name="Path 21225" transform="translate(-1192.815 -667.733)" fill="url(#prefix__linear-gradient-4)"/>
      <path id="prefix__Path_21226" d="M1240.607 780.141c3.416.672 7.92-.969 8.522-4.767a55.312 55.312 0 0 1 63.582-45.856c3.74.614 8.538-1.586 9.649-5.4 1.3-4.479-2.337-7.9-6.469-8.628a69.737 69.737 0 0 0-80.981 57.84c-.526 3.391 2.306 6 5.4 6.747q.144.035.297.064z" data-name="Path 21226" transform="translate(-1229.054 -710.157)" fill="url(#prefix__linear-gradient-5)"/>
      <ellipse id="prefix__Ellipse_842" cx="54.392" cy="54.394" data-name="Ellipse 842" rx="54.392" ry="54.394" transform="translate(20.349 20.351)" fill="url(#prefix__linear-gradient-6)"/>
    </svg>

  )
}
const BadgeItem = (props) => {
  const {data} = props
  return (
    <div className={classNames(styles.badgeContainer,props.badgeContainerStyle,data && data.get('isUnlocked') && styles.unlockStyle)} onClick={()=>props.openModal && props.openModal(data)}>
      {props.showLockedRotation && (
        <div onClick={props.revealBadge}>
          <Lottie
            options={rotatingBadgeOptions}
          />
        </div>

      )}
      {
        !props.showLockedRotation && (
          <React.Fragment>
            <div className={styles.holderLayout}>
              <BadgeHolderSVG/>
              <img src={data && getPath((data.get('activeImage') || data.get('image') || Map()).get('uri'))} className={classNames(styles.thumbnail,props.thumbnailStyle)} alt='Badge'></img>
            </div>
            <div className={classNames(styles.badgeTextHolder,props.badgeTextHolder)}>
              <span className={classNames(styles.badgeText,props.badgeText)}>{(data && (data.get('isUnlocked') || props.isBadgeUnlocked) ? data.get('name') : '???')}</span>
            </div>
          </React.Fragment>
        )
      }
    </div>
  )
}

export default BadgeItem
