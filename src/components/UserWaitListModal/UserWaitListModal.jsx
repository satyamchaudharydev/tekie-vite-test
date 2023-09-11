import React, { useEffect, useState, memo } from 'react'
import "./userWaitListModal.scss"
import PhoneInput from 'react-phone-input-2'
import cx from 'classnames'
import { countriesAllowed } from '../../config'
import getCountryCode from '../../utils/getCountryCode'
import requestToGraphql from '../../utils/requestToGraphql'
import "../../pages/EventLandingPage/pages/LandingPage/fonts/Gilroy.css"
import get from 'lodash/get'

const UserWaitListModal = ({ visible, closeWaitListModal = () => { }, ...props }) => {
  const [showLabel, setShowLabel] = useState(true)
  const [isSubmiting, setIsSubmiting] = useState(false)
  const [currentModal, setCurrentModal] = useState("formModal")
  const [formData, setFormData] = useState({
    parentEmail: '',
    parentName: '',
    countryCode: '+91',
    number:""
  })

  const [formErrors, setFormErrors] = useState({
    parentEmail: false,
    parentName: false,
    parentPhone: false
  })
 
    useEffect(() => {
        if (visible) {
            let phoneNumber = ''
            let countryCode = ''
            let parentEmail = ''
            if (get(props, 'phone.phoneNumber')) phoneNumber = get(props, 'phone.phoneNumber')
            if (get(props, 'phone.countryCode')) countryCode = get(props, 'phone.countryCode')
            if (get(props, 'email')) parentEmail = get(props, 'email')
            setFormData({
                parentEmail,
                parentName: '',
                countryCode: countryCode || '91',
                number: phoneNumber || '91'
            })
            if (parentEmail) setShowLabel(false)
        }
    }, [visible])
  const onInputChange = (event) =>{
    const { name, value } = event.target
    setFormData({
        ...formData,
        [name]: value
    })
  }
  const onCloseModal = () =>{
    setFormData({
        parentEmail: '',
        parentName: '',
        countryCode: '+91',
        number:""
    })
    setFormErrors({
        parentEmail: false,
        parentName: false,
        parentPhone: false
    })
    setCurrentModal("formModal")
    closeWaitListModal()
  }
  const onSubmit = async () =>{
    const { parentEmail, parentName, number, countryCode } = formData
    const dataInput = {}
    let shouldAdd = true
    if (!parentEmail ||
        !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(parentEmail)) {
        setFormErrors(prevError => (
            {
            ...prevError,
            parentEmail: true
        }
        ))
        shouldAdd = false
    } else {
        setFormErrors(prevError => (
            {
            ...prevError,
            parentEmail: false
        }
        ))
        dataInput.email = parentEmail
    }
    if (parentName && parentName.trim()) {
        dataInput.name = parentName
    }
      if (number && number && number.trim() && countryCode) {
        const phoneNumber = number.trim().replace(countryCode, '')
        if (phoneNumber) {
            dataInput.phone = {
                number: phoneNumber,
                countryCode: `+${countryCode}`
            }
        }
    }
    if (dataInput.name && !/^[A-Za-z0-9_-]*$/.test(dataInput.name)) {
        setFormErrors(prevError => (
            {
            ...prevError,
            parentName: true
        }
        ))
        shouldAdd = false
    } else {
        setFormErrors(prevError => (
            {
            ...prevError,
            parentName: false
        }
        ))
    }
    if (shouldAdd) {
      let input = ``
      if (dataInput.email) input += `email: "${dataInput.email}"`
      if (dataInput.name) input += `name: "${dataInput.name}"`
      if (dataInput.phone) input += `phone: {
        number: "${dataInput.phone.number}"
        countryCode: "${dataInput.phone.countryCode}"
      }`
      input += `shouldAddInWaitingList: true`
      input += ``
      setIsSubmiting(true)
      const data = await requestToGraphql(`mutation {
            signupOrLoginViaOtp(input: {
            ${input}
            }) {
            result
            }
        }`).then(res => {
            setCurrentModal('successModal')
        }).catch(err => {
            if (get(err, 'errors[0].code') === "UserAlreadyExistsError") {
                setCurrentModal('failureModal')
            } else if (get(err, 'errors[0].code') === "InvalidPhoneError") {
                setFormErrors(prevError => (
                    {
                        ...prevError,
                        parentPhone: true
                    }
                ))
            } else {
                setCurrentModal('failureModal')
            }
        })
      setIsSubmiting(false)
    }
  }
  return (
    <div className={`userWaitListModal ${visible && 'opened'}`} aria-hidden="true">
    <div className="userWaitingListBgOverlay" onClick={onCloseModal}></div>
    <div className={`modal-dialog-main ${currentModal === 'formModal' && 'show'}`}>
        <div className='imageHolder'>
            <div className='text-Holder'>
                <div className='heading-text'>Something <span className='special-text'>Special’s</span> Brewing!</div>
                <p className='heading-sub-text'>There are some exciting updates coming and new registrations have been paused currently.</p>
            </div>
        </div>
        <div className="modal-body">
            <div className='logic-heading-text'>
                Please share your details below to be the first ones to know about the updates.
            </div>
            <form className="waitingListFormContainer">
                <div className="waitingListform-group name-group parent-email-field"
                    onClick={() =>{
                        const inputField = document.querySelector("#waitList-parent-email")
                        setShowLabel(false)
                        inputField.focus()
                    }}
                >
                    {showLabel && (
                        <label><span className="parentEmailSpan">Email</span> <span className="palceholder-star">*</span></label>
                    )}
                    <input
                        name="parentEmail"
                        type="email"
                        id="waitList-parent-email"
                        className={`form-input-modal ${formErrors.parentEmail && "error"} `}
                        value={formData.parentEmail}
                        onChange={onInputChange}
                        onBlur={() =>{
                            if (!formData.parentEmail) setShowLabel(true)
                        }}
                    />
                </div>
                <div className="waitingListform-group name-group">
                    <input name="parentName" type="text" id="waitList-parent-name" className={`form-input-modal ${formErrors.parentName && "error"} `} placeholder="Name" onChange={onInputChange} />
                </div>
                <div className="waitingListform-group name-group">
                    <PhoneInput
                        country={getCountryCode().toLowerCase()}
                        onlyCountries={countriesAllowed}
                        value={formData.number}
                        placeholder='Phone Number'
                        onChange={(phone, data, e, formattedNumber) => {
                            setFormData({
                                ...formData,
                                number: phone,
                                countryCode: data.dialCode
                            })
                        }}
                        countryCodeEditable={false}
                        masks={{
                          in: '..........'
                        }}
                        buttonClass={cx('photon-phone-button', formErrors.parentPhone && 'error')}
                        copyNumbersOnly
                        inputClass={cx(
                          'form-input-modal', 'form-input-phone', formErrors.parentPhone && "error"
                        )}
                      />
                </div>
                <div className='waitingListButton' id="waitingListButton">
                    <div className='btn-sd-blue-container' onClick={onSubmit}>
                        <div className={`loader ${!isSubmiting && 'hide'} `}></div>
                        <span>Ok, Notify me!</span>
                    </div>
                </div>
            </form>
    </div>
    </div>
        <div className={`successMessageModal ${currentModal === 'successModal' && 'show'}`}>
        <div className='imageHolder successModal'>
                <div className='text-Holder'>
                    <div className='heading-text'>Thank You!</div>
                </div>
            </div>
            <div className="modal-body">
                <div className='logic-heading-text'>
                    Great things come to those who wait.<br />Stay tuned for more updates!
                </div>
                <form className="waitingListFormContainer">
                      <div className='waitingListButton successMessageButton' id="waitingListButton" onClick={onCloseModal}>
                          <div className='btn-sd-blue-container'>
                            <span>Got it!</span>
                          </div>
                    </div>
                </form>
        </div>
    </div>
    <div className={`failureMessageModal ${currentModal === 'failureModal' && 'show'}`}>
        <div className='imageHolder failureModal'>
                <div className='text-Holder'>
                    <div className='heading-text'>We have your spot reserved.</div>
                </div>
            </div>
            <div className="modal-body">
                <div className='logic-heading-text'>
                    Looks like you've already registered with us.<br /> Stay tuned for more updates
                </div>
                <form className="waitingListFormContainer">
                      <div className='waitingListButton successMessageButton' id="waitingListButton" onClick={onCloseModal}>
                          <div className='btn-sd-blue-container'>
                            <span>Ok, Got it!</span>
                          </div>
                    </div>
                </form>
        </div>
    </div>
    </div>
  )
}

export default memo(UserWaitListModal)