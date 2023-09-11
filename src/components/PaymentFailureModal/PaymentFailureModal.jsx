import React, { Component } from 'react'
import {ActionButton, PaymentButton} from '../Buttons'
import PopUp from '../PopUp/PopUp'
import styles from './PaymentFailureModal.module.scss'
import PurchaseForm from "../PurchaseForm";

const buttonTextProps = {
    hideIconContainer: true,
    buttonTextCenterAligned: true
}

class PaymentFailureModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
        }
    }

    showPaymentPopupState = () => {
        this.props.closePaymentFailurePopup()
        this.props.showPaymentPopupState()
    }

    render () {
        const { visible, closePaymentFailurePopup } = this.props
        return (
            <PopUp
                showPopup={visible}
                closePopUp={closePaymentFailurePopup}
            >
                <div className={styles.mainContainer}>
                    <div className={styles.paymentFailureContainer}>
                        Payment Failed!
                    </div>
                    <div className={styles.paymentFailureSubHeader}>
                        Your payment failed due to an error.
                    </div>
                    <div className={styles.paymentFailureSubHeader}>
                        If the issue persists, contact us at
                        <a className={styles.link} href="mailto:hello@tekie.in" target={'_blank'}> hello@tekie.in</a>
                    </div>
                    <div
                        onClick={this.showPaymentPopupState}
                        className={styles.tryAgainButtonContainer}
                    >
                        <ActionButton
                            {...buttonTextProps}
                            title={'Try Again'}
                            active={true}
                            hoverToCursor={true}
                        />
                    </div>
                </div>
            </PopUp>
        )
    }
}

export default PaymentFailureModal
