import { get } from 'lodash'
import React from 'react'
import { CrossBtn } from './ReminderPopUp'
import './style.scss'

const EventRegisterMessage = ({ data, closeModal = () => {} }) => {
    return (
        <div className="popup-confirmation-modal-container" >
            <div className="pop popupBg">
                <button className="crossBtn" onClick={closeModal}><CrossBtn /></button>
                <div className="navbarPopup">
                    <div className="poptitle"><span style={{ margin: 'auto' }}>Registered for Event</span></div>
                </div>
                <div className="finalDesc">
                    <div>Congratulations ! You have been registered for</div>
                    <div className="okCourse">
                        {get(data, 'name')}
                        </div>
                    <div>
                        <button className="okBtn" onClick={closeModal}>OK, Got it</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EventRegisterMessage
