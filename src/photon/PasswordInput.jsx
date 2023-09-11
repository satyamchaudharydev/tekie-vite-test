import React from 'react'
import cx from 'classnames'
import './photon.scss'

const EyeIconOpen = () => (
  <svg width='100%' height='100%' viewBox="0 0 37 37" fill="none">
    <path
      d="M18.89 8.215c-5.48 0-11.102 3.171-15.527 9.515a1.125 1.125 0 00-.019 1.25c3.4 5.322 8.946 9.484 15.546 9.484 6.527 0 12.187-4.175 15.593-9.51a1.136 1.136 0 000-1.228c-3.414-5.273-9.115-9.511-15.593-9.511z"
      stroke="#000"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.91 23.964a5.625 5.625 0 100-11.25 5.625 5.625 0 000 11.25z"
      stroke="#000"
      strokeWidth={2.25}
      strokeMiterlimit={10}
    />
  </svg>
)

const EyeIconClose = () => (
  <svg width='100%' height='100%' viewBox="0 0 37 37">
    <path
      d="M30.633 31.838a1.118 1.118 0 01-.795-.33L5.088 6.759A1.125 1.125 0 016.68 5.17l24.749 24.749a1.125 1.125 0 01-.795 1.92zm-12.398-4.5c-2.918 0-5.73-.863-8.362-2.566-2.395-1.547-4.551-3.763-6.236-6.398v-.006c1.402-2.009 2.937-3.707 4.587-5.077a.141.141 0 00.01-.207l-1.4-1.398a.14.14 0 00-.191-.009c-1.752 1.477-3.379 3.288-4.857 5.409a2.244 2.244 0 00-.045 2.498c1.857 2.906 4.246 5.354 6.91 7.077 2.998 1.942 6.226 2.927 9.584 2.927a16.814 16.814 0 005.329-.885.142.142 0 00.09-.171.141.141 0 00-.036-.061l-1.517-1.518a.28.28 0 00-.27-.07 14.404 14.404 0 01-3.596.455zM34.77 17.115c-1.86-2.877-4.274-5.321-6.98-7.068-2.993-1.935-6.297-2.958-9.555-2.958a15.984 15.984 0 00-5.266.902.14.14 0 00-.053.233l1.515 1.515a.281.281 0 00.273.07c1.151-.311 2.338-.47 3.53-.47 2.861 0 5.666.874 8.336 2.601 2.44 1.575 4.622 3.789 6.31 6.398a.009.009 0 010 .012 21.844 21.844 0 01-4.508 5.113.14.14 0 00-.01.208l1.399 1.398a.14.14 0 00.19.01 24.15 24.15 0 004.826-5.519 2.264 2.264 0 00-.007-2.445z"
      fill="#000"
    />
    <path
      d="M18.259 11.586c-.506 0-1.01.056-1.503.169a.14.14 0 00-.107.172.14.14 0 00.037.065l7.916 7.914a.14.14 0 00.204-.003.14.14 0 00.034-.067 6.75 6.75 0 00-6.581-8.25zm-6.343 5.179a.14.14 0 00-.238.07 6.75 6.75 0 008.085 8.086.141.141 0 00.108-.173.14.14 0 00-.037-.065l-7.918-7.918z"
      fill="#000"
    />
  </svg>
)

const Input = ({ className, labelClassName, label, onChangeText, error, eyeIconClassName, ...props }) => {
  const [passwordVisible, setPasswordVisible] = React.useState(false)
  return (
    <>
      <div className={cx('photon-label', labelClassName, error && 'error')}>{error ? error : label}</div>
      <div style={{ position: 'relative' }}>
        <input className={cx('photon-input', 'photon-input-password', className, error && 'error')} type={passwordVisible ? 'text' : 'password'} onChange={e => {
          onChangeText(e.target.value)
        }} {...props} />
        <div className={cx('photon-input-password-eye-icon', eyeIconClassName)} onClick={() => { setPasswordVisible(!passwordVisible) }}>
          {passwordVisible ? <EyeIconClose /> : <EyeIconOpen />}
        </div>
      </div>
    </>
  )
}

export default Input