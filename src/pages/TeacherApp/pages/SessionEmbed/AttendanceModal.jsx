import React, { useEffect, useState, useRef } from 'react'
import { CloseCircle } from '../../../../constants/icons';
import styles from './sessionEmbed.module.scss'
import cx from 'classnames'
import { ReactComponent as User } from '../../../../assets/users.svg';
import Tooltip from '../../../../library/Tooltip/Tooltip';
import { AttendanceItem } from './AttendanceItem';
import { gtmUserParams } from '../../../../components/UpdatedSideNavBar/utils';
import { fireGtmEvent } from '../../../../utils/analytics/gtmActions';
import { gtmEvents } from '../../../../utils/analytics/gtmEvents';

const AttendanceModal = ({absentStudentsData,presentStudentsData,totalPresentStudents,closeModal,modalRef}) => {
    const [attendanceState,setAttendanceState] = useState('absent')
    
    const [tooltipOpen,setTooltipOpen] = useState(false)
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
    });

    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
          // Close the modal
          closeModal()
        }
    };
    const attendance = attendanceState === 'absent' ? absentStudentsData : presentStudentsData
    return (
        
        <>
            <div className={styles.modalPopup} ref={modalRef}>
                <div className={styles.attendanceText}>
                    <p style={{color:'#8C61CB'}}>Attendance</p>
                    <div style={{cursor:'pointer'}} onClick={()=>closeModal()}>
                        <CloseCircle height='20' width='20' color='#a27fd5' />
                    </div>
                </div>
                <div className={styles.attendanceStatusContainer}>
                    <button className={cx(attendanceState === 'present' ? styles.presentButton : styles.inactiveButton)} onClick={()=>{
                        const userParams =  gtmUserParams()
                        fireGtmEvent(gtmEvents.presentCTAClickedInsideAttendanceModal,{userParams})
                        setAttendanceState('present')}}>
                            Present ({totalPresentStudents})</button>
                    <button className={cx(attendanceState === 'absent' ? styles.absentButton : styles.inactiveButton)} onClick={()=>{
                        const userParams =  gtmUserParams()
                        fireGtmEvent(gtmEvents.absentCTAClickedInsideAttendanceModal,{userParams})
                        setAttendanceState('absent')}}>Absent ({absentStudentsData.length})</button>
                </div>  
                <div className={styles.table}>
                        {attendance && attendance.map((data) => {
                            let students = data.student
                            if(!Array.isArray(students)) students = [students]
                            const isBuddy = students.length > 1
                            return (
                                <AttendanceItem 
                                    isBuddy={isBuddy}
                                    students={students}
                                />
                            )})}

                </div>
            </div>
            <div className={styles.modalOverlay}></div>
        </>
    )
}

export default AttendanceModal