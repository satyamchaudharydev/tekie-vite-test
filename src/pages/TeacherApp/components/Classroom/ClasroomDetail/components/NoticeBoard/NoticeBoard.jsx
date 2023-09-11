import React from 'react'
import Announcement from './Announcement'
import styles from './NoticeBoard.module.scss'
import NoticeModal from '../ClassModal/NoticeModal'
import LoadingSpinner from '../../../../Loader/LoadingSpinner'
import send from '../../../../../../../assets/teacherApp/classDetail/send.svg'
import {get} from 'lodash'
import { SendIcon } from '../../../../../../../constants/icons'

const NoticeBoard = ({students,notices, batchId, loggedInUser,noticeStatus}) => {
    const [openModal, setOpenModal] = React.useState(false)

    const renderAnnouncement = () => {
        if(notices && notices.length > 0){
            return(
                <>
                    {notices.map((notice) => <Announcement notice={notice} />)}
                </>
            )
        }else{
            return(
                <div className={styles.NoNotice}>No Notices Yet</div>
            )
        }
    }
    return(
        <div className={styles.NoticeBoard_main}>
            {get(noticeStatus, 'loading', true) === true ? (
                <LoadingSpinner left={'50%'} top={'50%'} height={'26px'} width={'26px'}/>
            ) : (
                <>
                    <div className={styles.flexbox}>
                        <div className={styles.heading}>Notice Board</div>
                        {students && students.length>0 && (
                            <button className={styles.noticeButton} onClick={() => setOpenModal(true)}><SendIcon/> Send Notice</button>
                        )}
                    </div>
                    <div className={styles.NoticeBoard_Announcements}>
                        {renderAnnouncement()}
                    </div>
                </>
            )}
            {openModal && <NoticeModal openModal={openModal} students={students} setOpenModal={setOpenModal} batchId={batchId} loggedInUser={loggedInUser} />}
        </div>
    )
}


export default NoticeBoard