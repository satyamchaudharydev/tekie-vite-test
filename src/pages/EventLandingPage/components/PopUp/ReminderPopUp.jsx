import moment from 'moment';
import React from 'react';
import './style.scss'

export const CrossBtn = () => (
    <svg width="50" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d_1302_71328)">
    <circle cx="32" cy="28" r="26" fill="#00ADE6"/>
    <path d="M40.56 34.32C41.04 34.8 41.28 35.3467 41.28 35.96C41.28 36.5467 41.0533 37.08 40.6 37.56C40.1467 38.0133 39.6133 38.24 39 38.24C38.3333 38.24 37.76 37.96 37.28 37.4L31.64 31.16L26 37.4C25.4933 37.9333 24.92 38.2 24.28 38.2C23.6933 38.2 23.1733 37.9733 22.72 37.52C22.2667 37.0667 22.04 36.5467 22.04 35.96C22.04 35.3467 22.28 34.8 22.76 34.32L28.6 27.96L23.08 21.96C22.6 21.48 22.36 20.9333 22.36 20.32C22.36 19.7067 22.5867 19.1867 23.04 18.76C23.4933 18.3067 24.0133 18.08 24.6 18.08C25.24 18.08 25.8133 18.3467 26.32 18.88L31.64 24.72L36.96 18.88C37.4667 18.3467 38.04 18.08 38.68 18.08C39.2933 18.08 39.8133 18.3067 40.24 18.76C40.6933 19.1867 40.92 19.7067 40.92 20.32C40.92 20.9333 40.68 21.48 40.2 21.96L34.68 27.96L40.56 34.32Z" fill="white"/>
    </g>
    <defs>
    <filter id="filter0_d_1302_71328" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
    <feOffset dx="-2" dy="2"/>
    <feGaussianBlur stdDeviation="2"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0.00931948 0 0 0 0 0.384665 0 0 0 0 0.508333 0 0 0 1 0"/>
    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1302_71328"/>
    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1302_71328" result="shape"/>
    </filter>
    </defs>
    </svg>
)

const ReminderPopUp = ({handleEvent, closeModal, reminderTime}) => {
    const handleClick = () => {
        handleEvent('join')
    }
    const handleClose = () => {
        closeModal(false)
    }
    return (
        <div className="popup-confirmation-modal-container" >
            <div className="pop">
                <div className="navbarPopup">
                    <div className="crossBtn" onClick={() => handleClose()}><CrossBtn /></div>
                    <div className="poptitle"><span style={{ margin: 'auto' }}>Events {reminderTime && reminderTime > 0 ? 'Starting' : 'Started'}</span></div>
                </div>
                <div className="descs">
                    {reminderTime && reminderTime > 0 ? (
                        <>
                            <div>Event about to go live in</div>
                            <div className="time">{reminderTime} Mins</div>
                        </>
                    ) : (
                        <div style={{ marginBottom: '20px' }}>Event already went live</div>
                    )}
                    <div><button className="joinBtn" onClick={() => handleClick()}>JOIN EVENT NOW</button></div>
                </div>
            </div>
        </div>
    )
}

export default ReminderPopUp;