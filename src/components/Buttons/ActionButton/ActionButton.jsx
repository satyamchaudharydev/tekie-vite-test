import React from 'react'
import cx from 'classnames'
import styles from './ActionButton.module.scss'
import SimpleButtonLoader from '../../SimpleButtonLoader'
import { motion } from 'framer-motion'
import isMobile from '../../../utils/isMobile'
const getSmallButtonWithStateClassName = (props) => {
    return (
        cx(styles.smallButtonContainer,
            props.active
                ? styles.active
                : styles.disabled
        )
    )
}

const getChooseProductButtonWithStateClassName = (props) => {
    return (
        cx(styles.chooseProductButtonContainer,
            props.active
                ? styles.activeProductButton
                : styles.disabledProductButton
        )
    )
}

const getPaddedButtonContainerClassname = (props) => {
    if (props.isPadded) {
        return (
            cx(
                styles.buttonContainer,
                styles.buttonContainerPadding
            )
        )
    }

    return styles.buttonContainer
}

const getButtonWithStateClassName = (props) => {
    if (props.active === false) {
        return (
            cx(
                getPaddedButtonContainerClassname(props),
                styles.disabled
            )
        )
    }

    return (
        cx (
            getPaddedButtonContainerClassname(props),
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
    } else if (props.isChooseProductButton) {
        return (
            cx(getChooseProductButtonWithStateClassName(props),
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
    } else if (props.isChooseProductButton) {
        return (
            cx(styles.chooseProductButtonText,
                props.active
                    ? styles.activeProductButtonText
                    : styles.disabledProductButtonText
            )
        )
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

const ActionButton = props => {
  return (
    <motion.div
        className={cx(getButtonContainerClassName(props),{[props.buttonContainer]: !props.isMobile}, {[styles.mbButtonContainer]: props.isMobile}, {[styles.noMarginTop]: props.isMobile && props.noTopMargin})}
        onClick={props.onClick}
        whileHover={props.animationDisabled ? "rest" : "hover"}
        animate="rest"
        initial="rest"
        style={props.style}
    >
        <motion.div className={cx(getButtonTextClassName(props), props.buttonText, {[styles.mbButtonText]: props.isMobile})} style={props.textStyle}>
          {props.title}
        </motion.div>
          {
            props.hideIconContainer
              ? <div />
              : <svg style={isMobile()?{marginLeft:'5px'}:{marginRight:'12px'}} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.25 10C0.25 15.3845 4.61547 19.75 10 19.75C15.3845 19.75 19.75 15.3845 19.75 10C19.75 4.61547 15.3845 0.25 10 0.25C4.61547 0.25 0.25 4.61547 0.25 10ZM12.3142 10L8.34484 6.03016C8.21013 5.88836 8.13614 5.69955 8.13864 5.50398C8.14114 5.3084 8.21995 5.12155 8.35825 4.98325C8.49655 4.84495 8.6834 4.76614 8.87898 4.76364C9.07455 4.76114 9.26336 4.83513 9.40516 4.96984L13.9052 9.46984C14.0457 9.61048 14.1247 9.80117 14.1247 10C14.1247 10.1988 14.0457 10.3895 13.9052 10.5302L9.40516 15.0302C9.26336 15.1649 9.07455 15.2389 8.87898 15.2364C8.6834 15.2339 8.49655 15.1551 8.35825 15.0168C8.21995 14.8785 8.14114 14.6916 8.13864 14.496C8.13614 14.3005 8.21013 14.1116 8.34484 13.9698L12.3142 10Z" fill="white"/>
              </svg> 
          }
          <SimpleButtonLoader
              showLoader={props.showLoader}
              style={props.loaderStyle}
          />
    </motion.div>
  )
}

export default ActionButton
