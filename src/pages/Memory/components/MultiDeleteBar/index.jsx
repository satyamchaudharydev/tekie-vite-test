import React from 'react'
import classnames from 'classnames'
import styles from './style.module.scss'
import { SELECT_TYPE } from '../../../../utils/constants'
import Arrow from '../Arrow'
import DeleteIcon from '../DeleteIcon'
const Button = (props) => {
  return(
  <div className={classnames(styles.buttonWrapper,styles.noSelectable,props.styles)}
    onClick={props.onClick}
  >
    <props.component/>
  </div>
  )
}
const MultiDeleteBar = (props) => {
  return(
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <div className={styles.deleteIconWrapper} onClick={props.onSelectedPress}>
          <DeleteIcon/>
        </div>
      </div>
      <div className={styles.row}>
        <Button 
          onClick={props.onBackPress}
          styles={styles.arrowBtn}
          component={()=><div className={styles.arrowWrapper}><Arrow fill='#00ade6'/></div>}/>
        <Button 
          onClick={()=>props.selectToggle(props.selectType === 0)}
          styles={styles.selectBtn}
          component = {
            () =>(
            <span className={styles.selectTypeText}>
              {SELECT_TYPE[props.selectType]}
            </span>
            )
          }
        />
      </div>
    </div>
  )
}
export default MultiDeleteBar