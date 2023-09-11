import React from 'react'
import Studentimg from '../../../../../../../assets/testimonials/medha.jpeg'
import styles from './StudentFeed.module.scss'

const Feed = () => {
    return(
        <div className={styles.feed}>
            <div className={styles.flexContainer}>
                <img src={Studentimg} alt='img' className={styles.studentImg} />
                <div className={styles.studentName}>Naruto UzuMaki</div>
            </div>
            <div className={styles.feedTime}>Submitted Homework 09:35 pm</div>
        </div>
    )
}

export default Feed