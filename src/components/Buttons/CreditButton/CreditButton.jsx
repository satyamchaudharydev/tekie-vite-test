import React from 'react'
import styles from './CreditButton.module.scss'
import InvertedActionButton from '../InvertedActionButton'
import CreditIcon from './CreditIcon'

const CreditButton = props => (
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
            <div className={styles.creditIconContainer}>
                <CreditIcon />
            </div>
        )}
        buttonText={'minTextWidth'}
    />
)

export default CreditButton
