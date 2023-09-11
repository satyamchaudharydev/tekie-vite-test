import React from 'react'
import Feed from './Feed'
import styles from './StudentFeed.module.scss'


const StudentFeed = () => {
    return(
        <div className={styles.StudentFeed}>
            <div className={styles.heading}>Student feed</div>
            <div className={styles.feeds}>
                <Feed />
                <Feed />
                <Feed />
                <Feed />
                <Feed />
                <Feed />
                <Feed />
            </div>
        </div>
    )
}

export default StudentFeed