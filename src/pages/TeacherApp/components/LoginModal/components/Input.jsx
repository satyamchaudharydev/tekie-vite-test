import React from 'react'
import styles from '../LoginModal.module.scss'

const Input = (props) => {


    return <div>
        {props.label && <label for='emailOrUsername' className={styles.label}>{props.label}</label>}
        <input type={props.type || 'text'} className={styles.input} />
    </div>
}

export default Input