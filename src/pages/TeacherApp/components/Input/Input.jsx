
import { debounce } from 'lodash'
import React from 'react'
import styles from './Input.module.scss'

const Input = ({ input, setInput, ...props }) => {

    const textChangeHandler = props.debounce ? debounce((text) => {
        setInput(text)
    }, 1000) : (text) => {
        setInput(text)
    }


    return <div className={styles.inputContainer}>
        <input placeholder='Search' className={styles.timeTableSearch} onChange={(e) => { textChangeHandler(e.target.value) }} />
        <div className={styles.iconContainer}>
            {props.icon}
        </div>
    </div>
}

export default Input