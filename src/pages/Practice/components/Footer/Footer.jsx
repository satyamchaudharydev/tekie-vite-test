import React from 'react'
import styles from './Footer.module.scss'
import { visibleHintOverlay } from '../../constants'

const Footer = ({ openOverlay, isCheckButtonActive, onCheckButtonClick})=>{
  let checkBtnActiveStyles = {}
  if(isCheckButtonActive){
    checkBtnActiveStyles = {
      border: 'solid 1px #34e4ea',
      color: '#34e4ea',
      backgroundColor:'#fff'
    }
  }
  return(
    <div className={styles.footerContainer}>
      <div className={styles.helpBtn} onClick={()=> openOverlay(visibleHintOverlay)}>Help!</div>
      <div
      className={styles.checkBtn}
      style={checkBtnActiveStyles}
        onClick={() => {if (isCheckButtonActive){onCheckButtonClick()}}}
      >Check
      </div>
    </div>
  )
}

export default Footer
