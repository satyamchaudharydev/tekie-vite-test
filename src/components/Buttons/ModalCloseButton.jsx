import React from 'react'
import './modal.scss'
function ModalCloseButton({handleClick}) {
  return (
    <div
        className="sf-feedback-modal--close-btn"
        onClick={() => handleClick()}
    >
        <svg  viewBox="0 0 21 21">
            <path id="ic_close_24px" d="M26,7.115,23.885,5,15.5,13.385,7.115,5,5,7.115,13.385,15.5,5,23.885,7.115,26,15.5,17.615,23.885,26,26,23.885,17.615,15.5Z" transform="translate(-5 -5)" fill="#00ADE6"/>
        </svg>

    </div>
  )
}

export default ModalCloseButton