import React from 'react'
import { PingIcon, StopCircleIcon } from '../../../../../../constants/icons'
import useClickOutside from '../../../../../../utils/teacherApp/useClickOutside'
import Modal from '../../../../components/Modal/Modal'
import styles from './EndSessionModal.module.scss'

const EndSessionModal = (props) => {
    const { endSession, markAsIncompleteSession, setIsEndSessionModalVisible, isLoading, newFlow = false, fromSessionEmbed = false } = props
    const domRef = useClickOutside(() => setIsEndSessionModalVisible(false))
    if (newFlow) {
        return (
            <Modal
                nodeRef={domRef}
                zIndex={9999991}
                headerIcon={<PingIcon />}
                heading={'End Class'}
                widthFull
                priBtnText={'End class'}
                isLoading={isLoading || false}
                loadingText='Ending...'
                clickHandler={endSession}
                setModalVisibility={setIsEndSessionModalVisible}
                footerBtnIcon={<StopCircleIcon />}
                type={'2'}
                footerWithTwoBtns
                newFlow
                allActionButton={fromSessionEmbed}
                secBtnText={fromSessionEmbed ? 'Mark as Incomplete' : 'No'}
                secBtnLoadingText='Marking as Incomplete...'
                clickHandler2={markAsIncompleteSession}
            >
                <div className={fromSessionEmbed ? styles.endSessionModalContainer : styles.endSessionModalContainerSec}>
                    <h3>{fromSessionEmbed ? 'Do you want to end today’s class? Or if you mark it incomplete, you can return to it at any time.' : 'Are you sure you want to end the class?'}</h3>
                    <p>This will logout all current active students.</p>
                </div>
            </Modal >
        )
    }
    return <Modal
        nodeRef={domRef}
        zIndex={9999}
        headerIcon={<PingIcon />}
        heading={'Are you sure you want to end the session?'}
        widthFull
        priBtnText={'Yes, end anyway'}
        isLoading={isLoading || false}
        loadingText='Ending...'
        clickHandler={endSession}
        setModalVisibility={setIsEndSessionModalVisible}
        footerBtnIcon={<StopCircleIcon />}
    >
    </Modal >
}

export default EndSessionModal