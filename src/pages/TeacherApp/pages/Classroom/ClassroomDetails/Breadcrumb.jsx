import { get } from 'lodash'
import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from '../../../../../constants/icons'
import styles from './classroomDetails.module.scss'

const Breadcrumb = ({ historyList }) => {
const shouldShowChevronIcon=(idx,list=[])=>{
    if(list.length===1) return false
    if(idx===list.length-1) return false
    return true
}
    return <div className={styles.breadcrumbContainer}>
        {
            historyList && historyList.map((historyItem, idx) => {
                return <Link to={get(historyItem,'route')} className={styles.linkReset}><div className={styles.breadcrumbItem}>{get(historyItem,'label')} {shouldShowChevronIcon(idx,historyList) && <ChevronRight className={styles.nextIcon} color={'rgba(140, 97, 203, 0.5)'} />} </div></Link>
            })
        }
    </div>
}

export default Breadcrumb