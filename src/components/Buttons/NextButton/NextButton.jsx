import React from 'react'
import styles from './NextButton.module.scss'
import ActionButton from '../ActionButton'
import TickIcon from './Tick'
import SaveIcon from './Save'
const NextButton = props => (
    <ActionButton
        {...props}
        showLoader={props.loading}
        hideIconContainer={props.loading}
        loaderStyle={{
            marginLeft: 16
        }}
        active={!props.loading}
        disabled={props.loading}
        animationDisabled={props.showTick}
        defaultHover={props.showTick}
        IconComponent={(
            props.showSave ? (
                <div className={styles.saveIconContainer}>
                    <SaveIcon />
                </div>
            ): (
                props.showTick ?
                    (
                        <div className={styles.tickIconContainer}>
                            <TickIcon />
                        </div>
                    ) :
                    (
                        <div/>
                    )
            )
        )}
    />
)

export default NextButton
