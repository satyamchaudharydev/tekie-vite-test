import React, { useEffect } from 'react'
import { CloseCircle, UsersGroupRounded } from '../../../../constants/icons';
import styles from './sessionEmbed.module.scss'
import { CalenderSvg, WarningSvg } from '../../components/svg';
import Button from '../../components/Button/Button';
import ContentLoader from 'react-content-loader';
import LoadingSpinner from '../../components/Loader/LoadingSpinner';
import { hsFor1280 } from '../../../../utils/scale';
import { gtmUserParams } from '../../../../components/UpdatedSideNavBar/utils';
import { fireGtmEvent } from '../../../../utils/analytics/gtmActions';
import { gtmEvents } from '../../../../utils/analytics/gtmEvents';

const ClassOtpModal = ({ otp, isLoading, closeOtpModal, otpModalRef, presentStudents, attendanceData, isOtpModalReOpened,totalPresentStudents }) => {
    
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
    });

    const handleClickOutside = (event) => {
        if (otpModalRef.current && !otpModalRef.current.contains(event.target)) {
            closeOtpModal()
        }
    };

    const getJoinedStudentPercentage = () => {
        const presentStudentsInClass = presentStudents && presentStudents.length
        const totalStudentsInClass = attendanceData && attendanceData.length
        let percentage = (totalPresentStudents / totalStudentsInClass) * 100
        return Math.round(percentage)
    }

    const WarningNudget = () => {
        if (!isOtpModalReOpened) {
            const percentage = getJoinedStudentPercentage()
            if (percentage <= 60) {
                return (
                    <div className={styles.attendanceWarningContainerContain}>
                        <div className={styles.attendanceWarningContainer} style={{ background: '#faad1414' }}>
                            <div className={styles.attendanceWarningIconContainer}>
                                <WarningSvg />
                            </div>
                            <p style={{ color: '#543A07', margin: '0' }}><span style={{ fontWeight: '700' }}>{`Only ${percentage}% of the students have joined the class`}</span>, Are you sure you want to continue?</p>
                        </div>
                    </div>
                )
            }
        }
    }

    const AttendenceBox = () => {
        if (!isOtpModalReOpened) {
            return (
                <div className={styles.attendance} style={{ cursor: 'auto' }}>
                    {isLoading ? <LoadingSpinner height='16px' width='16px' left='50%'/>:
                    <>
                        <div className={styles.groupIcon}>
                            <UsersGroupRounded height={hsFor1280(16)} width={hsFor1280(16)} fill='#858585'/>
                        </div>
                        <p>{presentStudents && totalPresentStudents}/{attendanceData && attendanceData.length} <span className={styles.joinedText}>joined</span></p>
                    </>
                    }
                </div>
            )
        }
    }
     
    const renderOtp = () => {
        const contentLoader = <ContentLoader
            className={styles.otpContainerLoader}
            speed={1}
            foregroundColor={'#8c61cb'}
            viewBox="0 0 30 8"
        >
            <rect x="0" y="0" width="50px" height="20px" />
        </ContentLoader>
        if (isLoading) return contentLoader
        const reformOtp = otp.length && otp.split('')
        return (
            <div className={styles.otpContainer}>
                {reformOtp.length && reformOtp.map(item => (
                    <div className={styles.otptext}>{item}</div>
                ))}
            </div>
        )
    }

    return (
        <>
            <div className={styles.otpmodalPopup} ref={otpModalRef}>
                <div className={styles.otpmodalPopupHeading}>
                    <div className={styles.otpmodalNameContainer}>
                        <div className={styles.otpmodalNameIconContainer}>
                            <CalenderSvg />
                        </div>
                        <p>Class OTP</p>
                    </div>
                    <div className={styles.otpmodalCloseContainer} onClick={() => closeOtpModal()}>
                        <CloseCircle height='24' width='24' color='#a27fd5' />
                    </div>
                </div>
                <div className={styles.otpmodalPopupBody} style={{ paddingBottom: !isOtpModalReOpened ? '12px' : 'auto' }}>
                    <div className={styles.otpmodaPopBodyTextContainer}>
                        <p>Share the <span>code</span> below with students</p>
                        {renderOtp()}
                    </div>
                    {AttendenceBox()}
                    {WarningNudget()}
                </div>
                <div className={styles.otpmodalPopupFooter} >
                    <Button text={'Continue'} onBtnClick={() => {
                        const userParams = gtmUserParams()
                        fireGtmEvent(gtmEvents.continueCTAClickedOnClassOTPModal,{userParams})
                        closeOtpModal()}} widthFull />
                </div>
            </div>
            <div className={styles.modalOverlay} style={{ background: !isOtpModalReOpened ? '#000000cc' : '#00000099' }}></div>
        </>
    )
}

export default ClassOtpModal


