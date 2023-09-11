import React from 'react'
import LoadingSpinner from '../../../pages/TeacherApp/components/Loader/LoadingSpinner'
import styles from './TekieButton.module.scss'


const TekieButton=(props)=>{
    const { text, type, isDisabled, widthFull, rightIcon, leftIcon, children, isLoading, font12, onBtnClick = () => { }, rounded, height, width, posAbsolute, textClass,btnPadding,btnBorder}=props

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
                return null
            }
        }
    }


    return <button onClick={() => onBtnClick()} disabled={isDisabled||isLoading} className={`${styles.btn} ${getBtnType(type)} ${isDisabled && styles.disabled} ${widthFull && styles.widthFull} ${rounded && styles.rounded}  ${posAbsolute && styles.posAbsolute}`} style={{ fontSize: `${font12 ? '12px' : ''}`, height: `${height ? height : 'auto'}`, width: `${width ? width : (widthFull ? '100%' : 'auto')}`,padding:`${btnPadding ? btnPadding : ''}`,border:`${btnBorder && btnBorder}`} }>

    {leftIcon && !isLoading && children}

    {isLoading && <LoadingSpinner height='16px' width='16px' color='white' />}
    <span className={ textClass ? `${getBtnTextClass(textClass)}`: null }>{text}</span>
    {rightIcon && !isLoading && children}
</button>
}

export default TekieButton