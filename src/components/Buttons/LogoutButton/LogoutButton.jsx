import React from 'react'
import styles from './LogoutButton.module.scss'
import ActionButton from '../ActionButton'

const LogoutGradient = () => {
  return(
    <svg xmlns="http://www.w3.org/2000/svg" id="prefix__logout" width="100%" height="100%" viewBox="0 0 21.791 21.791">
    <defs>
        <linearGradient id="prefix__linear-gradient" x1="1.099" x2="0" y1=".5" y2=".5" gradientUnits="objectBoundingBox">
            <stop offset="0" stop-color="#00ade6"/>
            <stop offset="1" stop-color="#34e4ea"/>
        </linearGradient>
        <style>
            {`.prefix__cls-1{fill:url(#prefix__linear-gradient)}`}
        </style>
    </defs>
    <g id="prefix__Group_14283" data-name="Group 14283">
        <g id="prefix__Group_14282" data-name="Group 14282">
            <path id="prefix__Path_21815" d="M14.073 16.343h-.908a.454.454 0 0 0-.454.454v3.178H1.816V1.816h10.9v3.178a.454.454 0 0 0 .454.454h.908a.454.454 0 0 0 .454-.454V1.816A1.816 1.816 0 0 0 12.711 0H1.816A1.816 1.816 0 0 0 0 1.816v18.159a1.816 1.816 0 0 0 1.816 1.816h10.9a1.816 1.816 0 0 0 1.816-1.816V16.8a.454.454 0 0 0-.459-.457z" class="prefix__cls-1" data-name="Path 21815"/>
            <path id="prefix__Path_21816" d="M144.2 133.107l-5.448-4.994a.454.454 0 0 0-.761.335v.908a.453.453 0 0 0 .15.337l3.156 2.84h-12.843a.454.454 0 0 0-.454.454v.908a.454.454 0 0 0 .454.454h12.839l-3.156 2.84a.453.453 0 0 0-.15.337v.908a.454.454 0 0 0 .271.415.448.448 0 0 0 .183.039.456.456 0 0 0 .307-.119l5.448-4.994a.454.454 0 0 0 0-.669z" class="prefix__cls-1" data-name="Path 21816" transform="translate(-122.552 -122.546)"/>
        </g>
    </g>
</svg>

  )
}

const LogoutButton = props => (
  <ActionButton {...props} IconComponent={(
    <div className={styles.iconContainer}>
      <LogoutGradient />
    </div>
  )} />
)

export default LogoutButton