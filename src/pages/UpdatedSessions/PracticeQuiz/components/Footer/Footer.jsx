import React from 'react'
import classNames from 'classnames'
import styles from './Footer.module.scss'
import { visibleHintOverlay } from '../../constants'
import UpdatedButton from '../../../../../components/Buttons/UpdatedButton/UpdatedButton'
import { checkIfEmbedEnabled } from '../../../../../utils/teacherApp/checkForEmbed'

const Footer = ({ openOverlay, isCheckButtonActive, onCheckButtonClick, showHelp = true, isHintTextExist = true})=>{
  // let checkBtnActiveStyles = {}
  if(isCheckButtonActive){
    // checkBtnActiveStyles = {
    //   border: 'solid 1px #34e4ea',
    //   color: '#34e4ea',
    //   backgroundColor:'#fff'
    // }
  }
  return(
    <div className={classNames(styles.footerContainer, checkIfEmbedEnabled() && styles.footerContainerForTeacherApp)}>
      {showHelp && (
        <UpdatedButton onBtnClick={()=>openOverlay(visibleHintOverlay, isHintTextExist)} text='Help!' type='secondary'></UpdatedButton>
        // <UpdatedButton>Help!</UpdatedButton>
        // <div className={styles.helpBtn} onClick={()=> openOverlay(visibleHintOverlay)}>Help!</div>
      )}
      {/* <div
      className={styles.checkBtn}
      style={checkBtnActiveStyles}
        onClick={() => {if (isCheckButtonActive){onCheckButtonClick()}}}
      >Check
      </div> */}
      {showHelp && (<div className={styles.footerBtnSeparator} />)}
      <UpdatedButton isDisabled={!isCheckButtonActive} onBtnClick={() => {if (isCheckButtonActive){onCheckButtonClick()}}} text='Check' type={!isCheckButtonActive ? 'disabled' : 'primary'}></UpdatedButton>
    </div>
  )
}

export default Footer
