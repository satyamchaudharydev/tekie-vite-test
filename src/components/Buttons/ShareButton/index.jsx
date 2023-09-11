import React from 'react'
import classnames from 'classnames'
import styles from './styles.module.scss'
import waveBG from '../../../assets/waveBG.png'
import waveBG2X from '../../../assets/waveBG.png'
import waveBG3X from '../../../assets/waveBG.png'

const ShareButton = (props) =>{
  return(
    <div className={classnames(styles.buttonContainer,props.overrideStyles)} onClick={props.onClick}>
      <img src={waveBG} srcSet={`${waveBG2X} 2x,${waveBG3X} 3x`} alt="Wave" className={styles.imageBG}></img>
      <span className={styles.btnText}>{props.text}</span>
    </div>
  )
}

export default ShareButton