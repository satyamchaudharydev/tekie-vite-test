import React, { Component } from 'react'
import cx from 'classnames'
import styles from './UnfilledButton.module.scss'

class UnfilledButton extends Component {
    render () {
        return (
            <div className={cx(
                styles.buttonContainer,
                this.props.hoverAble
                    ? styles.hoverButtonContainer
                    : '',
                this.props.overrideButtonContainerStyle
            )}
            >
                <div className={cx(styles.buttonText,this.props.overrideButtonTextStyle)}>
                    {this.props.buttonText}
                </div>
            </div>
        )
    }
}

export default UnfilledButton
