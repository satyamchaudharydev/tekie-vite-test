import React from 'react'
import styles from './Updates.module.scss'
import getSlotLabel from '../../../../../../../utils/slots/slot-label'
import status from '../../../../../../../assets/teacherApp/classDetail/Ratio.svg'
import students from '../../../../../../../assets/teacherApp/classDetail/Ratio.png'
import clock from '../../../../../../../assets/teacherApp/classDetail/Timer.png'
import ClassImg from '../../../../../../../assets/b2bLandingPage/CodersJourney/class1-2.png'

const Update = ({session}) => {
    const totalStudents = session.totalStudents || 0
    const topicOrder = session.topicOrder || 0
    const topicTitle = session.topicTitle || 0

    const getStartTime = () => {
        if(session){
            const options = { appendMinutes: true }
            for(let i=0;i<24;i++){
                if(session[`slot${i}`] === true){
                    const time = getSlotLabel(i, options)
                    let startTime = time.startTime.toUpperCase()
                    return startTime
                }
            }
        }
        return "-"
    }
    return(
        <div className={styles.update}>
            <img className={styles.sessionImg} src={ClassImg} alt='sessionImage' />
            <div style={{paddingLeft: '9px'}} className={styles.Update_conatiner}>
                <div className={styles.sessionTitle}>{topicOrder}. {topicTitle}</div>
                <div className={styles.container}>
                    <div className={styles.container2}>
                        <img className={styles.icon} src={students} alt='icon' />
                        <div>
                            <div className={styles.sessionFont}>Total Students</div>
                            <div className={styles.sessionFont2}>{totalStudents}</div>
                        </div>
                    </div>
                    <div className={styles.container2}>
                        <img className={styles.icon} src={clock} alt='icon' />
                        <div>
                            <div className={styles.sessionFont}>Start time</div>
                            <div className={styles.sessionFont2}>{getStartTime()}</div>
                        </div>
                    </div>
                    <div className={styles.container2}>
                        <img className={styles.icon} src={status} alt='icon' />
                        <div>
                            <div className={styles.sessionFont}>Status</div>
                            <div className={styles.sessionFont2}>Upcoming</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Update