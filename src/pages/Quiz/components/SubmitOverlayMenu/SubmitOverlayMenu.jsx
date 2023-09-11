import React from 'react'
import cx from 'classnames'
import styles from './SubmitOverlayMenu.module.scss'
import Modal from 'react-modal'
import SimpleButtonLoader from '../../../../components/SimpleButtonLoader'
import { hs } from '../../../../utils/size'

const getButtonTitle = (deleteOverlay, path) => {
    if (deleteOverlay) {
        return 'Delete'
    } else if (path === '/homework/:topicId/quiz' || path === '/revisit/homework/:topicId/quiz') {
        return 'Save'
    }

    return 'Submit'
}

const SubmitOverlay = ({
     visible, onQuizSubmit,message,closeOverlay,isLoading,closeImmediately,
     title,deleteOverlay,onDelete,onSubmitForReview,submitForReviewOverlay,path,disabled
}) => {
    return (
        <Modal
            isOpen={visible}
            className={styles.modalContainer}
            overlayClassName={styles.container}
            closeTimeoutMS={closeImmediately ? 0 : 500}
        >
            <div className={styles.submit}>
                {title || 'Submit'}
            </div>
            <div className={styles.confirmText}>
                {message}
            </div>
            <div className={styles.buttonArea}>
                <div onClick={() => closeOverlay('visibleSubmitOverlay')} className={styles.cancelBtn}>
                    { deleteOverlay ? 'No' : 'Cancel' }
                </div>
                <div
                    onClick={() => {
                        if (deleteOverlay) {
                            onDelete()
                        } else if (submitForReviewOverlay) {
                            onSubmitForReview()
                        } else {
                            onQuizSubmit()
                        }
                    }}
                    className={
                        cx(
                            styles.submitBtn,
                            disabled ? styles.disabled : ''
                        )
                    }
                >
                    <div
                        style={{
                            marginRight: `${isLoading ? hs(10) : hs(0)}px`
                        }}
                    >
                        { getButtonTitle(deleteOverlay, path) }
                    </div>
                    <div
                        style={{
                            marginLeft: `${isLoading ? hs(10) : hs(0)}px`
                        }}
                    >
                        <SimpleButtonLoader
                            showLoader={isLoading}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default SubmitOverlay