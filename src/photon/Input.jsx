import React from 'react'
import ReactTooltip from 'react-tooltip'
import cx from 'classnames'
import './photon.scss'

const Input = ({className, labelClassName, label, onChangeText, error, parentClassName, fromRadioStreetInput, ...props}) => {
  return (
    <>
      {props.isDisabled && (
        <ReactTooltip
          id={props.disabledTooltip.replace(' ', '-')}
          place='top'
          effect='float'
          multiline={false}
          className={'photon-input-tooltip'}
          arrowColor='#bff7f9'
          textColor='rgba(0, 0, 0, 0.8)'
        />
      )}
      <div
        data-for={props.disabledTooltip && props.disabledTooltip.replace(' ', '-')}
        data-tip={props.disabledTooltip}
        data-iscapture='true'
        className={cx(parentClassName)}
      >
        <div className={cx('photon-label', labelClassName, error && 'error')}>{(error && !fromRadioStreetInput) ? error : label}</div>
        <input className={cx('photon-input', className, error && 'error', props.isDisabled && 'disabled')} disabled={props.isDisabled} onChange={e => {
          onChangeText(e.target.value)
        }} {...props} />
      </div>
    </>
  )
}

export default Input