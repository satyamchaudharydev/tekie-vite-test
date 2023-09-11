import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import get from 'lodash/get'
import { motion } from 'framer-motion'

import { ChevronRight } from '../../../../constants/icons'
import ProgressBar from '../Classroom/components/BatchCarousel/ProgressBar'

import styles from './Classrooms.module.scss'
import { hsFor1280 } from '../../../../utils/scale'


const ClassroomCard = (props) => {
    const [arrowColor,setArrowColor]=useState('#A8A7A7')
    const { batch, batchesLength } = props
    const isAccessingTraingClasses = get(props, 'isAccessingTraingClasses', false);
    let redirectLink = `/teacher/classrooms/${get(batch, 'batchId')}`
    if (isAccessingTraingClasses) {
        redirectLink = `/teacher/training-classrooms/${get(batch, 'batchId')}`
    }
    return <Link className={styles.resetLinkStyle} to={redirectLink}>
        <motion.div
        initial={{opacity:0}}
        animate={{ opacity:1 }}
        transition={{ delay: 0.15}}
        >
        <div onMouseEnter={()=>setTimeout(() => {
            setArrowColor('#8c61cb')
        }, 100)} onMouseLeave={()=>setArrowColor('#A8A7A7')} className={`${styles.classroomCardContainer} ${isAccessingTraingClasses && styles.classroomCardForTraining} ${batchesLength<6 && styles.biggerCard}`}>
                <div className={styles.gradeAndSectionContainer}>
                    <p>{get(batch, 'classroomTitle')}</p>
                    <div className={styles.iconContainer}>
                        <ChevronRight height={hsFor1280(16)} width={hsFor1280(16)} color={arrowColor} />
                    </div>
                </div>
                <div className={styles.sessionProgressBarContainer}>
                    {/* <ProgressBar forClassroomsPage done={30}/> */}
                    <ProgressBar forClassroomsPage done={get(batch,'sessionProgress')}/>
                </div>
            </div>
        </motion.div>
            
    </Link>
}

export default ClassroomCard