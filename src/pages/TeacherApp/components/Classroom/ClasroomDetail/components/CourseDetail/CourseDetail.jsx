import React from 'react'
import Course from './Course'
import styles from './CourseDetail.module.scss'

const CourseDetail = ({classroomDetail, batchId}) => {
    return(
        <>
            {/* <div className={styles.CourseDetail_main}>
                <div className={styles.CourseDetail_heading}>All Courses</div>
                <button className={styles.CourseDetail_button}>+ Add Courses</button>
            </div> */}
            <Course classroomDetail={classroomDetail} batchId={batchId} src="clasroomDetail" />
        </>
    )
}
export default CourseDetail