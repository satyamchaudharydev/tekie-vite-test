import React, { useState } from 'react'
import styles from './SwitchButton.module.scss'

function SwitchButton() {
    const [swithedOn, setSwitchedOn] = useState(false)
    const switchOnHandler = () => {
        setSwitchedOn(!swithedOn)
    }
  return (
    <div className={styles.SwitchButtonContainer} onClick={switchOnHandler}>
        <span className={styles.toggleSwitch}  style={{left:swithedOn?'65%':'5%'}} ></span>
    </div>
  )
}

export default SwitchButton