
import React from 'react'
import Button from '../Button/Button'
import cx from 'classnames'
import { CloseSvg } from '../svg'
import styles from './Modal.module.scss'
import calendar from "../../../../assets/teacherApp/classDetail/calendar.svg"
import upload from "../../../../assets/teacherApp/classDetail/Vector.svg"
import { gtmUserParams } from '../../../../components/UpdatedSideNavBar/utils'
import { fireGtmEvent } from '../../../../utils/analytics/gtmActions'
import { gtmEvents } from '../../../../utils/analytics/gtmEvents'

const Modal = ({ headerIcon, heading, subHeading, setModalVisibility, footerWithTwoBtns, secBtnText, priBtnText, widthFull, clickHandler,clickHandler2, isLoading, loadingText, children,type="1",footerBtnIcon,classroomId, documentType, handleSubmit,isAnySelected,zIndex,nodeRef, allActionButton = false, newFlow = false, secBtnLoading = false, secBtnLoadingText = '' }) => {

    const getFooter = () => {
        if (footerWithTwoBtns && type === "1") {
            return <div className={styles.footer}>
                <Button onBtnClick={() => clickHandler2()} text={secBtnText} type='secondary'></Button>
                {priBtnText !== 'Confirm Re-Schedule' && <Button onBtnClick={() => clickHandler()} text={isLoading ? loadingText : priBtnText} widthFull={widthFull} isLoading={isLoading}></Button>}
                {priBtnText === 'Confirm Re-Schedule' && <Button isDisabled={isAnySelected=== false ? true : false} onBtnClick={() => {clickHandler()}} text={isLoading ? loadingText : priBtnText} widthFull={widthFull} isLoading={isLoading}></Button>}
            </div>
        } else if (footerWithTwoBtns && type === "2") {
            if (newFlow && allActionButton) {
                return <div className={styles.allActionButtonFooter}>
                    <Button onBtnClick={() => {
                        const userParams = gtmUserParams()
                        fireGtmEvent(gtmEvents.markAsCompleteCTAClickedInsideEndClassModal,{userParams})
                        clickHandler2()
                    }} widthFull textClass={'embedFooterSecondaryText'} text={secBtnLoading ? secBtnLoadingText : secBtnText} type='secondary' isLoading={secBtnLoading}></Button>
                    <Button onBtnClick={() => {
                        const userParams = gtmUserParams()
                        fireGtmEvent(gtmEvents.endClassClickedOnLiveSessionModal,{userParams})
                        clickHandler()
                    }} widthFull textClass={'embedFooterPrimaryText'} text={isLoading ? loadingText : priBtnText} isLoading={isLoading}></Button>
                </div>
            }
            if (newFlow) {
                return <div className={cx(styles.footer, styles.embedFooter)}>
                    <Button onBtnClick={() => setModalVisibility(false)} widthFull textClass={'embedFooterSecondaryText'} text={secBtnText} type='secondary'></Button>
                    <Button onBtnClick={() => clickHandler()} widthFull textClass={'embedFooterPrimaryText'} text={isLoading ? loadingText : priBtnText} isLoading={isLoading}></Button>
                </div>
            }
            return <div className={styles.footer}>
                <button className={styles.secondaryButton} onClick={() => clickHandler2()} text={secBtnText} type='secondary'><footerBtnIcon />{secBtnText}</button>
                <button className={styles.primaryButton} onClick={() => clickHandler()} text={isLoading ? loadingText : priBtnText} widthFull={widthFull} isLoading={isLoading}>
                <img src={upload} style={{paddingRight: '10px'}} alt={'upload icon'}/>{isLoading ? loadingText : priBtnText}
                </button>
            </div>
        }
        return <div className={styles.footer}>
            <Button onBtnClick={() => clickHandler()} isLoading={isLoading} text={isLoading ? loadingText : priBtnText} widthFull leftIcon>{footerBtnIcon}</Button>
        </div>
    }

    const closeModalButton = () => {
        return (
            <div className={styles.closeModalIcon} onClick={() => setModalVisibility(false)}>
                <CloseSvg />
            </div>
        )
    }

    return <div ref={nodeRef} style={{zIndex:zIndex}} className={styles.modalContainer} role="dialog" aria-labelledby='modalTitle' aria-describedby='modalDesc'>
        <div className={cx(allActionButton ? styles.allActionButtonModal : styles.modal)}>
            {!allActionButton ? (
                <div className={cx(styles.header, newFlow && styles.endSessionHeader)}>
                    <div className={styles.headerHeadingContainer}>
                        {type === '2' ? (   <div className={styles.headerIcon}><img src={calendar} alt="calendar" /></div>) : (<div className={styles.headerIcon}>{headerIcon}</div>)}
                        <div className={styles.headingTextContainer}>
                            <span id='modalTitle'>{heading}</span>
                            {subHeading && <span id='modalDesc' className={styles.subHeading}>{subHeading}</span>}
                        </div>
                    </div>
                    {closeModalButton()}
                </div>
            ) : (
                <div className={styles.allActionButtonHeader}>
                    <h2>{heading}</h2>
                    {closeModalButton()}
                </div>
            )}
            <div className={styles.body}>
                {children}
            </div>
            {getFooter()}
        </div>
    </div>
}

export default Modal