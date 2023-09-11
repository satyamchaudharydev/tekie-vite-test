import { get } from 'lodash'
import React from 'react'
import styles from './Classrooms.module.scss'


const Header = (props) => {
    return <div className={styles.headerContainer}>
        <h1 className={styles.heading}>Your {get(props, 'isAccessingTraingClasses', false) ? 'Schools' : 'Classrooms'}</h1>
    </div>
}

export default Header