import React from 'react'
import cx from 'classnames'
import { get } from 'lodash'
import './PopUp.scss'

const getPopContainerStyles = (isChildrenLeftAligned, isPaymentPopup = false) => {
    if (isChildrenLeftAligned) {
        if(isPaymentPopup) {
            return (
                cx('popup-component-paymentPopUpBackground','popup-component-leftAlignedChildren')
            )
        }
        return (
            cx('popup-component-popUpBackground','popup-component-leftAlignedChildren')
        )
    }
    if(isPaymentPopup) {
        return 'popup-component-paymentPopUpBackground'
    }
    return 'popup-component-popUpBackground'
}

const PopUp =(props) => {
    const handleOnClick = (event) => {
        if (event.target === event.currentTarget) {
            props.closePopUp()
        }
    }

    return (
        <div className={'popup-component-popUpContainer'} style={props.style}>
            <div className={
                cx(getPopContainerStyles(props.leftAlignedChildren, props.isPaymentPopup),
                    get(props, 'showPopup', false)
                        ? 'popup-component-fadeIn'
                        : 'popup-component-fadeOut'
                )}
                 style={props.backGroundStyle}
                 onClick={(event) => handleOnClick(event)}
            >
                <div className={'popup-component-childrenContainer'}>
                    <div>{props.children}</div>
                </div>
            </div>
        </div>
    )
}

export default PopUp
