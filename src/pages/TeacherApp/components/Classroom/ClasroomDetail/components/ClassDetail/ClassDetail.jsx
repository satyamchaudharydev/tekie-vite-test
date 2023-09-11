import React from 'react'
import styles from './ClassDetail.module.scss'
import {get} from 'lodash'
import getSlotLabel from '../../../../../../../utils/slots/slot-label'
import clock from '../../../../../../../assets/teacherApp/classDetail/Time.png'
import getPath from '../../../../../../../utils/getPath'
import { Link } from "react-router-dom"
import moment from 'moment'
import { TeacherIcon } from '../../../../../../../constants/icons'



const ClassDetail = ({upcomingSession, classroomDetail, batchId}) => {
    const [startTime, setStartTime] = React.useState('')
    const [endTime, setEndTime] = React.useState('')
    const [clasroomTitle, setClasroomTitle] = React.useState('-')
    const [bookingdate, setBookingDate] = React.useState('')
    React.useEffect(() => {
        getStartTime()
        if(classroomDetail &&  classroomDetail.classroomCourse){
            setClasroomTitle(get(classroomDetail, 'classroomData.classroomTitle', ''))
        }
        if(upcomingSession && upcomingSession.bookingDate){
            setBookingDate(moment(get(upcomingSession,'bookingDate', '')).format('ddd, DD MMM'))
        }
    })

    const getCourseImage = () => {
        if(classroomDetail &&  classroomDetail.classroomCourse){
            return getPath(get(classroomDetail,'batchThumbnail',''))
        }else{
            return getPath('python/clasroomThumbnail_1.png')
        }
    }
    const getStartTime = () => {
        if(upcomingSession){
            const options = { appendMinutes: true }
            for(let i=0;i<24;i++){
                if(upcomingSession[`slot${i}`] === true){
                    const time = getSlotLabel(i, options)
                    const startTime = time.startTime
                    const endTime = time.endTime
                    setStartTime(startTime)
                    setEndTime(endTime)
                }
            }
        }
        return "-"
    }
    return(
        <div className={styles.ClassDetail_main}>
            <div className={styles.ClassDetail_PicContainer}>
                <img className={styles.ClassDetail_classImage} src={getCourseImage()} alt='classImage'/>
            </div>
            <div className={styles.ClassDetail_classInfo}>
                <div className={styles.ClassDetail_flexContainer}>
                    <div className={styles.ClassDetail_grade}>{clasroomTitle}</div>
                    {/* <button onClick={() => openReport()} className={styles.ClassDetail_reportButton}><img src={report} alt='report' style={{paddingRight: '11px'}} />View Report</button> */}
                    {/* <div style={{position: 'relative', width: '20%'}} className={styles.ClassDetail_flexContainer2}>
                        <div className={styles.ClassDetail_threeDots} onClick={() => setSettingOpen(!settingOpen)}>&#xFE19;</div>
                        {settingOpen && <div className={styles.ClassDetail_setting}>
                            <div className={styles.ClassDetail_settingOption}>Edit Classroom</div>
                            <div className={styles.ClassDetail_settingOption}>Setting</div>
                        </div>}
                    </div> */}
                </div>
                
                <div className={styles.ClassDetail_detail}>
                    <div className={styles.ClassDetail_sub}>Next Session</div>
                    <div style={{marginRight: '4px'}}>-</div>
                    {startTime !== '' && (
                        <>
                            <div className={styles.ClassDetail_sub}><img src={clock} style={{paddingRight: '4px'}} alt='clock'/>{startTime}</div>
                            <div className={styles.ClassDetail_sub}>-</div>
                        </>
                    )}
                    {endTime !== '' && (
                        <>
                            <div className={styles.ClassDetail_sub}>{endTime}</div>
                            <div className={styles.ClassDetail_dot}/>
                        </>
                    )}
                    <div className={styles.ClassDetail_sub}>{bookingdate}</div>
                    <Link  className={styles.ClassDetail_underlinedText} to={`/classroom/course/?id=${batchId}`}>View Schedule</Link>
                </div>
                {/* <div className={styles.teachers_name}><span className={styles.icon_container}><TeacherIcon /></span>
                    <span>Teacher - Mr. Ajit Sharma </span>
                </div> */}
            </div>
        </div>
    )
}

export default ClassDetail