import React from 'react'
import { Link } from 'react-router-dom'
import { RightArrow } from '../../../../../constants/icons'
import ErrorMessage from '../ErrorMessage/ErrorMessage'
import './LoginForm.scss'
import cx from 'classnames'
import { INCORRECT_OTP } from '../../constants/constants'
import serverPageLinks from '../../../../../constants/serverPageLinks'

const OtpForm = (props) => {
    const { renderOtpOrRollnoInput, loginWithEmail, step, error, width, continueButtonHandler, checkIfButtonDisabled, renderButtonContent, changeLoginMethod, loginChangeType, numLock } = props
    return <>
        <div className={'school-live-class-login-otpRollnoInputContainer'} >
            {renderOtpOrRollnoInput(0)}
            {(!loginWithEmail && step !== 2) && (error.message === INCORRECT_OTP ? < ErrorMessage message={error.message} withCrossIcon={true}/>:< ErrorMessage message={error.message} informationCircle={numLock}/>) }
            {/* {(!loginWithEmail && step !== 2) && < ErrorMessage message={error.message} informationCircle={numLock}/>} */}
            <div style={{display:'block'}}>
                <p className={cx('school-live-class-login-termsConditionText',  loginWithEmail && 'school-live-class-login-otpField')} style={{ marginTop: step === 2 ? '2.5vh !important' : '' }}>By logging in, you agree to our<br/>
                    <a href={serverPageLinks.terms} target={'_blank'}><span> Terms {width < 500 && <br />}and Service</span></a> and <a href={serverPageLinks.privacy} target={'_blank'}><span>Privacy Policy</span></a></p>
                <button className={'school-live-class-login-continueBtn'} onClick={continueButtonHandler} disabled={checkIfButtonDisabled()}>{renderButtonContent()}</button>
            </div>

        </div>
        <p className={'school-live-class-login-loginWithEmailText'} onClick={changeLoginMethod}>{`Login with ${loginChangeType(loginWithEmail)} instead`}
            {<RightArrow color='#A8A7A7' />}
        </p>
    </>
}

export default OtpForm