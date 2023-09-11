import React from 'react'
import cx from 'classnames'

import LoadingSpinner from '../../../pages/TeacherApp/components/Loader/LoadingSpinner'
import styles from './UpdatedButton.module.scss'

const UpdatedButton = (props) => {

    const { 
            text,
            type,
            isDisabled,
            widthFull,
            rightIcon,
            leftIcon,
            children,
            isLoading,
            font12,
            onBtnClick = () => { },
            rounded,
            height,
            width,
            posAbsolute,
            textClass,
            newIcon,
            noShadow,
            wrapperClass,
            loadingType = 'default',
         } = props

    const getBtnType = (type) => {
        switch (type) {
            case 'primary': {
                return styles.primary
            }
            case 'secondary': {
                return styles.secondary
            }
            case 'tertiary': {
                return styles.tertiary
            }
            case 'disabled': {
                return styles.disabled
            }
            case 'danger': {
                return styles.danger
            }
            case 'quaternary':{
                return styles.quaternary
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
    const getBtnTextAndLoaderPosition = () => {
        let color = type === "secondary" ? '#3db6ea' : "#fff"
        if (isLoading && isDisabled) {
            color = 'rgb(125, 199, 236)'
        }
        if(loadingType === 'overlay'){
            return <>
            {
              isLoading && (
                <>
                    <div className={styles.overlayLoading}>
                        <LoadingSpinner height='16px' width='16px' color={color} />
                    </div>
                </>
              )
        
            }            
            <span
                style={{opacity: isLoading ? 0 : 1,visibility: isLoading ? 'hidden' : 'visible'}}
                className={textClass ? `${getBtnTextClass(textClass)}` : null}
                >
                {text}
            </span>
            
            </>
        }
        if(leftIcon && isLoading){
            return <>
            {isLoading && <LoadingSpinner height='16px' width='16px' color={color} />}
            <span className={textClass ? `${getBtnTextClass(textClass)}` : null}>{text}</span>
            </>
        }
        if(rightIcon && isLoading){
            return <>
            <span className={textClass ? `${getBtnTextClass(textClass)}` : null}>{text}</span>
            {isLoading && <LoadingSpinner height='16px' width='16px' color={color} />}
            </>
        }
        return <>
        {isLoading && <LoadingSpinner height='16px' width='16px' color={color} />}
        <span className={textClass ? `${getBtnTextClass(textClass)}` : null}>{text}</span>
        </>
    }
    if(type==='danger'){
        return <button onClick={(e) => onBtnClick(e)} disabled={isDisabled} className={`${styles.dangerBtnWrapper}${styles.updatedBtn2} ${styles.dangerBtn2} ${styles.noSpace}`}>
        <span className={`${styles.updatedBtn2} ${styles.dangerBtn2} ${isDisabled && styles.dangerDisabled}`}>
        {leftIcon && !isLoading && children}
        {getBtnTextAndLoaderPosition()}
        {rightIcon && !isLoading && children}
        </span>
      </button>
    }
    return <button onClick={(e) => {
        onBtnClick(e)}} disabled={isDisabled} className={` ${getBtnType(type)} ${widthFull && styles.widthFull} ${rounded && styles.rounded}  ${posAbsolute && styles.posAbsolute} ${styles.updatedButton} ${noShadow && styles.noShadowBtn} ${text && (text.includes('Report') && styles.reportButton)} ${wrapperClass && wrapperClass } `} style={{ fontSize: `${font12 ? '12px' : ''}` }}>
        {leftIcon && !isLoading && children}
        {/* {isLoading && <LoadingSpinner height='16px' width='16px' color='white' />}
        <span className={textClass ? `${getBtnTextClass(textClass)}` : null}>{text}</span> */}
        {getBtnTextAndLoaderPosition()}
        {rightIcon && !isLoading && children}
       
    </button>
}

export default UpdatedButton