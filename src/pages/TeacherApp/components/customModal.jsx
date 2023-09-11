import React from 'react'
import PopUp from "../../../components/PopUp/PopUp"
import '../components/modalStyles.scss'
import { CloseSvg } from "./svg"

const CustomTeacherAppModal = (props) => {

  return (
      <PopUp
      showPopup={props.visible}
    >
    <div className='modal__container-backdrop'>
      <div className='teacher-modal-popup'>
        <div className='teacher-modal-container'>
          <div className='modal__close-icon' onClick={() => props.closeModal()}>
            <CloseSvg />
          </div>
          <div className='modal__header'>
            {props.renderModalHeader()}
          </div>
          <>
            { props.children }
          </>
        </div>
      </div>
    </div>
  </PopUp>
  )
}

export default CustomTeacherAppModal