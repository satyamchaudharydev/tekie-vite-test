import React, { Component } from 'react'
import cx from 'classnames'
import LoadingSpinner from '../pages/TeacherApp/components/Loader/LoadingSpinner'
import styles from '../components/Buttons/UpdatedButton/UpdatedButton.module.scss'

export default class Button3D extends Component {
   getBtnTextClass = (textClass) => {
    switch (textClass) {
        case 'addIcon': {
            return styles.addIcon
        }
        default: {
            return null
        }
    }
}
  getBtnTextAndLoaderPosition = () => {
    let color = 'white'
    if (this.props.isLoading && this.props.isDisabled) {
        color = 'rgb(125, 199, 236)'
    }
    if(this.props.leftIcon && this.props.loading){
        return <>
        {this.props.loading && <LoadingSpinner height='16px' width='16px' color={color} />}
        <span className={this.props.textClass ? `${this.getBtnTextClass(this.props.textClass)}` : null}>{this.props.title}</span>
        </>
    }
    if(this.props.rightIcon && this.props.loading){
        return <>
        <span className={this.props.textClass ? `${this.getBtnTextClass(this.props.textClass)}` : null}>{this.props.title}</span>
        {this.props.loading && <LoadingSpinner height='16px' width='16px' color={color} />}
        </>
    }
    return <>
    {this.props.loading && <LoadingSpinner height='16px' width='16px' color={color} />}
    <span className={this.props.textClass ? `${this.getBtnTextClass(this.props.textClass)}` : null}>{this.props.title}</span>
    </>
}
  
  render() {
    const { text, type, isDisabled, rightIcon, leftIcon, children, loading, font12, onClick = () => { },title }=this.props

    if(type==='danger'){
      return <button onClick={() => onClick()} disabled={isDisabled} className={`${styles.dangerBtnWrapper}${styles.updatedBtn2} ${styles.dangerBtn2} ${styles.noSpace}`}>
      <span className={`${styles.updatedBtn2} ${styles.dangerBtn2} ${isDisabled && styles.dangerDisabled}`}>
      {leftIcon && !loading && children}
      {this.getBtnTextAndLoaderPosition()}
      {rightIcon && !loading && children}
      </span>
    </button>
  }

    return (
      <div style={this.props.outerContainerStyle}>
        <div {...this.props} className={cx('photon-button-3d-shadow', this.props.disabled && 'disabled', this.props.className)} >
          <div className={cx('photon-button-3d-inner-container', this.props.disabled && 'disabled', this.props.title === 'Start Session' && 'transform')} style={this.props.innerTextContainerStyle}>
            {this.props.loading && (
              <div class="photon-button-loading"></div>
            )}
            <span>{this.props.title}</span>
          </div>
        </div>
      </div>
    )
  }
}