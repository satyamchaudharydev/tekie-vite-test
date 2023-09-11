import React from 'react';
import './popup.scss'
import { CrossBtn } from './ReminderPopUp';
import dangerBg from './assets/dangerBG.png'
import { useHistory } from 'react-router';

const CommonEventPopup = ({ message = '', closeModal = () => { } }) => {
  const history = useHistory()
  const title = message === 'Unfortunately, the event has been cancelled. We\'ll update you when we have more details.' ? 'Event Cancelled' : 'Registration Closed'
  return (
    <div className="popup-confirmation-modal-container" >
        <div className="commonEventPopup pop popupBg" style={{ backgroundImage: `url(${dangerBg})` }}>
            <button className="commonEventPopup-crossBtn" onClick={closeModal}><CrossBtn /></button>
            <div className="commonEventPopup-navbarPopup">
                <div className="commonEventPopup-navbarTitle"><span style={{ margin: 'auto' }}>{title}</span></div>
            </div>
            <div className="commonEventPopup-details">
                <div className='commonEventPopup-detailsText'>
                    {message}
                </div>
                {/* <div className='commonEventPopup-detailsReturn'>But learning with <span className='tekie-name'>TEKIE</span> never stops <span role='img' aria-label='image'>🔥</span></div> */}
                <div className="buttonLine">
                    <>
                        <div><button className="dwnldBtn btn" onClick={() => history.push('/events')}>Explore More Events</button></div>
                        {/* <div><button className="RemindBtn" onClick={() => handleClick()}>BACK TO EVENTS</button></div> */}
                    </>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CommonEventPopup;
