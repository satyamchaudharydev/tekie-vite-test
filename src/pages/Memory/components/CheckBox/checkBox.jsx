import React from 'react'
import classname from 'classnames'
import styles from './checkBox.module.scss'
import Checkmark from '../Checkmark'
const CheckBox = (props) => {
    return (
        <label className={styles.checkBoxContainer}>
            <input type='checkbox' className ={styles.checkBox} onChange={props.onChange} checked={props.value}></input>
            <span className={classname(styles.emptySpan,styles.addBackground)}></span>
            <div className={classname(styles.checkBoxCustom,styles.addBackground)}>
              <Checkmark/>
            </div>
        </label>
    )
}

export default CheckBox