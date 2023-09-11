import React, { memo } from 'react'
import styles from '../SessionModal.module.scss'
import Button from '../../../../../components/Button/Button'
const OtpBox = (props) => {
    const { sessionStatus, isRetakeClassButtonClicked, setIsRetakeClassButtonClicked } = props

    const retakeCompletedClass = async () => {
        setIsRetakeClassButtonClicked(true)
    }
 
    const renderRetakeClass = () => {
        if (isRetakeClassButtonClicked) return showOtpContainer()
        return (
            <Button
                text='Retake Class'
                btnPadding='8px 10px'
                onBtnClick={retakeCompletedClass}
            />
        )
    }

    const getOtpHeaderText = () => {
        let text = ''
        if (sessionStatus === 'yetToBegin') {
            text += 'Start Class '
        } else if (sessionStatus === 'inProgress') {
            text += 'Resume Class '
        } else if (sessionStatus === 'completed') {
            text += 'Retake Class'
        }
        return text
    }

    const showOtpContainer = () => {
        return (
            <>
                <div>
                    <p className={styles.otpHeadingText}>{getOtpHeaderText()}</p>
                    <p className={styles.otpHeadingText}>to generate</p>
                </div>
                <p className={styles.otpHeading}>OTP</p>
            </>
        )
    }

    return (
        <div className={styles.retakeSessionOtpContainer}>
            <div className={styles.otpBoxContainer}>
                <div className={styles.headingAndOtpContainer}>
                    {(sessionStatus && sessionStatus === 'completed') ? (
                        renderRetakeClass()
                    ) : (
                        showOtpContainer()
                    )}
                </div>
            </div>
        </div>
    )
}

export default memo(OtpBox)