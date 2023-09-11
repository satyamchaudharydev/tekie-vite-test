import React from 'react'
import { withRouter } from 'react-router-dom'
import { get } from 'lodash'
import CloseIcon from '../../../assets/Close.jsx'
import SignupForm from '../SignupForm'
import './SignupModal.scss'
import PopUp from '../../../components/PopUp/PopUp'

const SignupModal = (props) => {
    return (
        <PopUp
            showPopup={get(props, 'visible', false)}
            closePopUp={() => props.closeSignupModal(false)}
        >
            <div className={'signup-modal-container'}>
                <div className={'signup-modal-popup'} onClick={(e) => { e.stopPropagation() }}>
                    <div className={'signup-modal-close'} onClick={() => {
                        props.closeSignupModal(false)
                    }}>
                        <div className={'signup-modal-closeIcon'}>
                            <CloseIcon />
                        </div>
                    </div>
                    <div className={'signup-modal-body'}>
                        <SignupForm
                            isModal
                            shouldRedirect={false}
                            closeSignUp={(status) => props.closeSignupModal(status)}
                        />
                    </div>
                </div>
            </div>
        </PopUp>
    )
}

export default withRouter(SignupModal)
