import React from 'react'
import { CompletedSessionIcon } from '../../../../../constants/icons'
import styles from './classroomDetails.module.scss'
import SessionStyles from '../../ClassroomCourseListing/components/sessionCard.module.scss'

const statusIcon = {
    completed: <CompletedSessionIcon width={12}  />,
    started:  <div className={SessionStyles.liveSessionIndicator}></div>

}
export const StatusTag = ({type}) => {
    let status = ''
    if(type === 'completed'){
        status = 'Completed'
    }
    else if(type === 'started'){
        status = 'Live'
    }
   if(!status) return null 
    return (
        <div 
            className={styles.statusTag}
            data-status={type}
        >   
            {statusIcon[type]}
            {status}
        </div>
    )
}
