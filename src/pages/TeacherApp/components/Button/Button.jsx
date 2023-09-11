import React from 'react'
import LoadingSpinner from '../Loader/LoadingSpinner'
import styles from './Button.module.scss'

const Button = ({ text, type='primary', isDisabled, widthFull, rightIcon, leftIcon, children, isLoading, font12, onBtnClick = () => { }, rounded, height, width, posAbsolute, textClass,btnPadding,tooltip = false,tooltipText,noShadow}) => {
    const getBtnType = (type) => {
        switch (type) {
            case 'primary': {
                return styles.primary
            }
            case 'secondary': {
                return styles.secondary
            }
            case 'tertiary':{
                return styles.tertiary
            }
            case 'ghost':{
                return styles.ghost
            }
            case 'default':{
                return styles.default
            }
            default: {
                return styles.primary
            }
        }
    }
    
    const getBtnTextClass = (textClass) => {
        switch (textClass) {
            case 'addIcon': {
                return styles.addIcon
            }
            default: {
                return styles[textClass] || null
            }
        }
    }

    return <button onClick={(e) => onBtnClick(e)} disabled={isDisabled} className={`${styles.btn} ${getBtnType(type)} ${widthFull && styles.widthFull} ${rounded && styles.rounded} ${noShadow && styles.noShadow} ${posAbsolute && styles.posAbsolute}`} style={{ fontSize: `${font12 ? '12px' : ''}`, height: `${height ? height : 'auto'}`, width: `${width ? width : (widthFull ? '100%' : 'auto')}`,padding:`${btnPadding ? btnPadding : ''}`} }>
        {leftIcon && !isLoading && children}
        {isLoading && !(leftIcon || rightIcon) ? <LoadingSpinner height='16px' width='16px' color={type==='primary'?'white':'#8C61CB'} /> : null}
        {/* <div>{isLoading && <LoadingSpinner height='16px' width='16px' color={type==='primary'?'white':'#8C61CB'} />}</div> */}
        {isLoading && leftIcon && <LoadingSpinner height='16px' width='16px' color={type==='primary'?'white':'#8C61CB'} />}
        <span className={ textClass ? `${getBtnTextClass(textClass)}`: null }>{text}</span>
        {isLoading && rightIcon && <LoadingSpinner height='16px' width='16px' color={type==='primary'?'white':'#8C61CB'} />}
        {rightIcon && !isLoading && children}
    </button>
}

export default Button