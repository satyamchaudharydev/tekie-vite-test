import React from 'react'
import cx from 'classnames'
import styles from './InvertedActionButton.module.scss'
import SimpleButtonLoader from '../../SimpleButtonLoader'
import { motion } from 'framer-motion'

const getSmallButtonWithStateClassName = (props) => {
    return (
        cx(styles.smallButtonContainer,
            props.active
                ? styles.active
                : styles.disabled
        )
    )
}

const getButtonWithStateClassName = (props) => {
    if (props.active === false) {
        return (
            cx(styles.buttonContainer,
                styles.disabled
            )
        )
    }

    return (
        cx (
            styles.buttonContainer,
            props.defaultHover
                ? styles.defaultHover
                : ''
        )
    )
}

const getButtonContainerClassName = (props) => {
    if (props.isSmallButton) {
        return (
            cx(getSmallButtonWithStateClassName(props),
                props.hoverToCursor
                    ? styles.hoverButtonContainer
                    : styles.defaultHover
            )
        )
    }

    return (
        cx(getButtonWithStateClassName(props),
            props.hoverToCursor
                ? styles.hoverButtonContainer
                : ''
        )
    )
}

const getButtonTextClassName = (props) => {
    if (props.isSmallButton) {
        return styles.smallButtonText
    }

    return (
        cx(styles.buttonText,
            props.buttonTextCenterAligned
                ? styles.centerAlignedButtonText
                : ''
        )
    )
}

const variants = {
  arrow: {
    rest: {
      x: 0,
    },
    hover: {
      x: 2
    }

  }
}

const InvertedActionButton = props => {
  return (
    <motion.div
        className={cx(getButtonContainerClassName(props), props.buttonContainer)}
        onClick={props.onClick}
        whileHover={props.animationDisabled ? "rest" : "hover"}
        animate="rest"
        initial="rest"
    >
          {
            props.hideIconContainer
              ? <div />
              : <motion.div className={cx(styles.iconCircle, props.iconCircle)}>
                  <motion.div variants={variants.arrow}>
                    {props.IconComponent}
                  </motion.div>
                </motion.div>
          }
            <motion.div className={cx(getButtonTextClassName(props), props.buttonText && styles[props.buttonText])}>
                {props.title}
            </motion.div>
          <SimpleButtonLoader
              showLoader={props.showLoader}
              style={props.loaderStyle}
          />
    </motion.div>
  )
}

export default InvertedActionButton
