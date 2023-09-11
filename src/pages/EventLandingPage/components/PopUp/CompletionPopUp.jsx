/* eslint-disable no-undef */
import React from 'react'
import './style.scss'
import { CrossBtn } from './ReminderPopUp'
import { get } from 'lodash'

const CompletionPopUp = ({ closeModal = () => {}, onOkButtonClick = () => {}, data }) => {
    return (
        <div className="popup-confirmation-modal-container" >
            <div className="completePop popupBg pop">
                <div className="navbarPopup">
                    <button className="crossBtn" onClick={closeModal}><CrossBtn /></button>
                    <div className="poptitle"><span style={{ margin: 'auto' }}>Event Completed</span></div>
                </div>
                <div className="details">
                    <div className="thanks">Thank You <span className='confetti' aria-label="label" role="img"></span></div>
                    <div className='heading2'>For Participating in the</div>
                    <div className="course" >
                        {get(data, 'name')}
                        </div>
                    <div className="buttonLine">
                       <>
                            <div><button className="dwnldBtn btn desktop" onClick={onOkButtonClick}>DOWNLOAD CERTIFICATE</button></div>
                            {/* <div><button className="RemindBtn btn desktop" onClick={() => handleClick()}>BACK TO EVENTS</button></div>
                            <div><button className="dwnldBtn btn mobile" onClick={() => handle()}>Join Event Now</button></div> */}
                        </>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CompletionPopUp
