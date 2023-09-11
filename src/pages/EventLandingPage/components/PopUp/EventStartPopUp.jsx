import React from 'react'
import { CrossBtn } from './ReminderPopUp'
import './style.scss'

const EventStartPopUp = ({ reminderTime, onOkButtonClick = () => {}, closeModal = () => {} }) => {
    return (
        <div className="popup-confirmation-modal-container eventStart" >
            <div className="pop popupBg">
                <div className="navbarPopup">
                    <button className="crossBtn" onClick={closeModal}><CrossBtn /></button>
                    <div className="poptitle"><span style={{ margin: 'auto' }}>Event {reminderTime > 0 ? 'Starting' : 'Started'}</span></div>
                </div>
                <div className="details">
                    {
                        reminderTime > 0 ? (
                            <>
                                <div className='heading1'>Event about to go live in</div>
                                <div className="time">{reminderTime}:00 Mins</div>
                            </>
                        ) : (
                            <>
                                <div className='heading1'>Event already went live</div>
                                <div className="time"></div>
                            </>
                        )
                    }
                    <div><button className="btn" onClick={onOkButtonClick}>Join Event Now</button></div>
                </div>
            </div>
        </div>
    )
}

export default EventStartPopUp
