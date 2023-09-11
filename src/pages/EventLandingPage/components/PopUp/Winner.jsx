import React from 'react'
import { CrossBtn } from './ReminderPopUp'
import trophy from './assets/trophy.png'
import './winner.style.scss'

const DwnldIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M5.83203 8.33594L9.9987 12.5026L14.1654 8.33594" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10 12.5V2.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
)

const Winner = ({setVisible}) => {
    const handleOnClick = () => {
        setVisible()
    }
    return (
        <div className="winner-confirmation-modal-container">
        <div className="winnerPopup">
                <div className="popup-footer">
                <div className="popup-header">
                    <div className="cross" onClick={handleOnClick}><CrossBtn /></div>
                    <div className="trophy">
                        <img src={trophy} alt="Trophy" className="trophy-img" />
                    </div>
                </div>
                    <div className="winner-footer">
                        <div className='description'>
                            <div className="winner-tag">You are a Winner</div>
                            <div className="winner-desc">
                                <div style={{ margin: 'auto', width: '47%' }}><span role="img" aria-label='congo' className='party-popper'></span> Congrats John,</div> 
                                <div>on finishing <span className="course-bold">Spy Sqaud Game</span> with <span className="course-bold">#1</span> position</div> 
                            </div>
                            <button className="winner-btn">
                                <div>Download Certificate</div> 
                                <div style={{ marginLeft: '10px' }}><DwnldIcon /></div>
                            </button>
                        </div>
                    
                    </div>
                </div>
        </div>
        </div>
    )
}

export default Winner
