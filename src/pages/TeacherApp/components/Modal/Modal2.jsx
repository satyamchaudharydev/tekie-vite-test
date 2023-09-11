
import React from 'react'
import Button from '../Button/Button'
import { CloseSvg } from '../svg'
import styles from './Modal2.module.scss'
import calendar from "../../../../assets/teacherApp/classDetail/calendar.svg"
import upload from "../../../../assets/teacherApp/classDetail/Vector.svg"

const Modal2 = ({ headerIcon, heading, subHeading, setModalVisibility, footerWithTwoBtns, secBtnText, priBtnText, widthFull, clickHandler,clickHandler2, isLoading, loadingText, children,type="1",footerBtnIcon,classroomId, documentType, handleSubmit,isAnySelected }) => {

    const getFooter = () => {
        if (footerWithTwoBtns && type === "1") {
            return <div className={styles.footer}>
                <Button onBtnClick={() => clickHandler2()} text={secBtnText} type='secondary'></Button>
                {priBtnText !== 'Confirm Re-Schedule' && <Button onBtnClick={() => clickHandler()} text={isLoading ? loadingText : priBtnText} widthFull={widthFull} isLoading={isLoading}></Button>}
                {priBtnText === 'Confirm Re-Schedule' && <Button isDisabled={isAnySelected=== false ? true : false} onBtnClick={() => {clickHandler()}} text={isLoading ? loadingText : priBtnText} widthFull={widthFull} isLoading={isLoading}></Button>}
            </div>
        }else if(footerWithTwoBtns && type === "2"){
            return <div className={styles.footer}>
                <button className={styles.secondaryButton} onClick={() => clickHandler2()} text={secBtnText} type='secondary'><footerBtnIcon />{secBtnText}</button>
                <button className={styles.primaryButton} onClick={() => clickHandler()} text={isLoading ? loadingText : priBtnText} widthFull={widthFull} isLoading={isLoading}>
                <img src={upload} style={{paddingRight: '10px'}}/>{isLoading ? loadingText : priBtnText}
                </button>
            </div>
        }
        return <div className={styles.footer}>
            <Button onBtnClick={() => clickHandler()} text={isLoading ? loadingText : priBtnText} widthFull />
        </div>
    }

    return <div className={styles.modalContainer} role="dialog" aria-labelledby='modalTitle' aria-describedby='modalDesc'>
        <div className={styles.modal}>
            <div className={styles.header}>
                <div className={styles.headerHeadingContainer}>
                    {type === '2' ? (   <div className={styles.headerIcon}><img src={calendar} /></div>) : (<div className={styles.headerIcon}>{headerIcon}</div>)}
                    <div className={styles.headingTextContainer}>
                        <span id='modalTitle' className={styles.heading}>{heading}</span>
                        {subHeading && <span id='modalDesc' className={styles.subHeading}>{subHeading}</span>}
                    </div>
                </div>
                <div className={styles.closeModalIcon} onClick={() => setModalVisibility(false)}>
                    <CloseSvg />
                </div>
            </div>
            <div className={styles.body}>
                {children}
            </div>
            {getFooter()}
        </div>
    </div>
}

export default Modal2