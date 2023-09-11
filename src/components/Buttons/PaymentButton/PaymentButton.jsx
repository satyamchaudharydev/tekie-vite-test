import React from 'react'
import styles from './PaymentButton.module.scss'
import InvertedActionButton from '../InvertedActionButton'
import TickIcon from './Tick'

const PaymentButton = props => (
    <InvertedActionButton
        {...props}
        showLoader={props.loading}
        hideIconContainer={props.loading}
        loaderStyle={{
            marginLeft: 16
        }}
        animationDisabled={props.showTick}
        defaultHover={props.showTick}
        IconComponent={(
            <div className={styles.tickIconContainer}>
                <TickIcon />
            </div>
        )}
    />
)

export default PaymentButton
