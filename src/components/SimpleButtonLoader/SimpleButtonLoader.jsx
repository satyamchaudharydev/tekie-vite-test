import React, { Component } from 'react'
import cx from 'classnames'
import styles from './SimpleButtonLoader.module.scss'

class SimpleButtonLoader extends Component {
    getLoaderClassName = () => {
        const { rightPositioned, customClassName, noGradient } = this.props
        if (customClassName) {
            return cx(styles.loader, customClassName)
        }
        if (noGradient) {
            return cx(
                styles.loader,
                styles.noGradient,
                rightPositioned
                    ? styles.loaderRightPositioned
                    : ''
            )
        }
        return cx(
            styles.loader,
            rightPositioned
                ? styles.loaderRightPositioned
                : ''
        )
    }

    render() {
        return (
            <div className={
                cx(this.getLoaderClassName(),
                    this.props.showLoader ?
                        styles.visible :
                        styles.hidden,
                )
            } style={this.props.style} />
        )
    }
}

export default SimpleButtonLoader
