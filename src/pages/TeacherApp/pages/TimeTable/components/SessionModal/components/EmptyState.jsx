import React from 'react'
import styles from '../SessionModal.module.scss'

const EmptyState = ({text,icon,containerStyles}) => {
    return (
        <div style={containerStyles} className={styles.emptyStateContainer}>
            <div>
                <div className={styles.emptyStateIcon}>
                    {icon}
                </div>
                <p className={styles.emptyStateText}>
                   {text}
                </p>
            </div>
        </div>
    )
}

export default EmptyState