import React from 'react'
import cx from 'classnames'
import ReactTooltip from 'react-tooltip'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import getCountryCode from '../utils/getCountryCode'
import { countriesAllowed } from '../config';
import './photon.scss'

const PhotonPhoneInput = ({className, labelClassName, label, error, ...props}) => {
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
      >
        <div
          className={cx('photon-label', 'photon-label-phone', labelClassName, error && 'error')}
        >{error ? error : label}</div>
        <PhoneInput
          name={'phone' || props.name}
          country={getCountryCode().toLowerCase()}
          copyNumbersOnly
          onlyCountries={countriesAllowed}
          countryCodeEditable={false}
          masks={{
            in: '..........'
          }}
          disabled={props.isDisabled}
          buttonStyle={props.isDisabled ? { opacity: 0.6, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
          inputClass={cx('photon-input photon-phone-input', error && 'error', props.isDisabled && 'disabled')}
          buttonClass={cx('photon-phone-button', error && 'error')}
          {...props}
        />
      </div>
    </>
  )
}

export default PhotonPhoneInput