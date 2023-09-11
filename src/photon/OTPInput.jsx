import React, { useState } from 'react'
import cx from 'classnames'
import countdown from '../utils/countdown'
import OTP from 'react-otp-input'
import './photon.scss'

const COUNTDOWN_TIMER = 60
const OTPInput = ({className, labelClassName, label, error, onResend = () => {}, ...props}) => { 
  const [shouldResend, setShouldResend] = useState(false)
  const [timer, setTimer] = useState(COUNTDOWN_TIMER)

  React.useEffect(() => {
    startTimer()
  }, [])
  

  const startTimer = () => {
    countdown(COUNTDOWN_TIMER, (_, seconds) => {
      setTimer(seconds)
    }, () => {
      setShouldResend(true)
    })
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
        <div className={cx('photon-label', labelClassName, error && 'error')}>{error ? error : label}</div>
        {shouldResend ? (
          <div className='photon-label'>
            Didn't receive OTP?{' '}
            <span onClick={() => {
              setShouldResend(false)
              startTimer()
              onResend()
            }} className='photon-link'>Resend</span>
          </div>
        ) : (
          <div className='photon-label'>
            Resend OTP in {timer} seconds {' '}
          </div>
        )}
      </div>
      <div>
        <OTP
          value={props.value}
          onChange={props.onChange}
          className='photon-otp-container'
          inputStyle={cx(`photon-input photon-otp-input ${className}`, error && 'error')}
          {...props}
          isInputNum
        />
      </div>
    </>
  )
}

export default OTPInput