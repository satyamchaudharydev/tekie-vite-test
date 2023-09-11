import React, { useState } from 'react'
import Modal from '../../../../components/Modal/Modal'
import { CalenderSvg } from '../../../../components/svg'
import styles from './DeleteSessionModal.module.scss'


const DeleteSessionModal = ({setIsDeleteSessionModalVisible,deleteSession}) => {

    const isDeletingSession= window && window.store.getState().data.getIn(['deleteClassroomSession','deleteStatus','deleteClassroomSession','loading'])


    return <Modal zIndex={9999} headerIcon={<CalenderSvg />} heading={'Do you want to delete the session?'} footerWithTwoBtns widthFull secBtnText={'Cancel'} priBtnText={'Yes, Delete the Session'} isLoading={isDeletingSession} loadingText='Deleting...' clickHandler={deleteSession} clickHandler2={()=>setIsDeleteSessionModalVisible(false)} setModalVisibility={setIsDeleteSessionModalVisible}>

        {/* <div>
            <p className={styles.deleteSessionTitle}>Add a reason for deleting the session:</p>
            <textarea placeholder='Type here...(Optional)' rows={5}></textarea>
        </div> */}
    </Modal >
}

export default DeleteSessionModal