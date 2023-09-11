import React from 'react'
import cx from 'classnames'
import './VideoBtn.scss'
import ReactTooltip from 'react-tooltip'


const VideoBtn = ({disabledBtn, showFilter, ...props}) => {
    return (showFilter ?
        <>
            <button {...props}
                data-for='videoBtn'
                data-tip='Join Session'
                data-iscapture='true'
                className={cx('videoBtn', disabledBtn && 'videoBtnDisabled')}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M26.3524 21.706L32.1677 25.7994C32.3389 25.8756 32.5265 25.9077 32.7134 25.8929C32.9002 25.8781 33.0804 25.8169 33.2376 25.7148C33.3948 25.6126 33.524 25.4729 33.6134 25.3081C33.7028 25.1434 33.7496 24.9589 33.7496 24.7715V11.2187C33.7496 11.0312 33.7028 10.8468 33.6134 10.682C33.524 10.5173 33.3948 10.3775 33.2376 10.2754C33.0804 10.1733 32.9002 10.112 32.7134 10.0973C32.5265 10.0825 32.3389 10.1146 32.1677 10.1908L26.3524 14.2842C26.2049 14.388 26.0846 14.5257 26.0015 14.6857C25.9184 14.8458 25.875 15.0235 25.875 15.2038V20.7864C25.875 20.9667 25.9184 21.1444 26.0015 21.3044C26.0846 21.4645 26.2049 21.6022 26.3524 21.706V21.706Z" stroke="white" stroke-width="2.24989" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18.843 26.9953H5.90608C4.93728 26.9925 4.00896 26.6064 3.32391 25.9213C2.63887 25.2363 2.25278 24.308 2.25 23.3392V12.6522C2.25278 11.6834 2.63887 10.7551 3.32391 10.07C4.00896 9.38496 4.93728 8.99888 5.90608 8.99609H18.8767C19.8365 8.99906 20.7561 9.38165 21.4348 10.0603C22.1135 10.739 22.4961 11.6586 22.4991 12.6184V23.3392C22.4963 24.308 22.1102 25.2363 21.4251 25.9213C20.7401 26.6064 19.8118 26.9925 18.843 26.9953Z" stroke="white" stroke-width="2.24989" stroke-miterlimit="10"/>
        </svg>
    </button></> : <div></div>
    )
}

export default VideoBtn