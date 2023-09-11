import React from 'react'
import styles from './Badge.module.scss'
const Badge = (props) => {
    const { text, type, rightIcon, leftIcon, children } = props

    const getBadgeType = (type) => {
        switch (type) {
            case 'completed': {
                return styles.completed
            }
            case 'inProgress': {
                return styles.inProgress
            }
            case 'disabled':{
                return styles.disabled
            }
            default: {
                return styles.completed
            }
        }
    }
    return <div className={`${styles.badgeBase} ${getBadgeType(type)}`}>
        {leftIcon && children}
        <span className={styles.badgeText}>{text}</span>
        {rightIcon && children}
    </div>
}
export default Badge