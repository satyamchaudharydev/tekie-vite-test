 import React, { Component } from 'react'
import cx from 'classnames'
import { Formik, Form, Field } from 'formik';
import PhoneInput from 'react-phone-input-2'
import * as Yup from 'yup';
import SimpleButtonLoader from '../../../components/SimpleButtonLoader'
import { LinksClicksGA } from '../../../utils/analytics/ga'
import 'react-phone-input-2/lib/style.css'
import './phoneNumberInputStyle.scss'
import { countriesAllowed } from '../../../config';
import getCountryCode from '../../../utils/getCountryCode';
import '../styles.scss'
import './EnrollmentForm.scss'
import './LoginForm.scss'

const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/

const validation = Yup.object().shape({
  phone: Yup.string()
    .trim()
    .required('Required*')
    .matches(phoneRegExp, 'Phone number is not valid')
    .test(
      'isValid',
      'Phone number is not valid',
      function(phoneNumber) {
        const conuntryCoderef = Yup.ref('countryCode')
        const countryCode = this.resolve(conuntryCoderef)
        if (phoneNumber.startsWith(countryCode)) {
          const phoneNumberWithoutCountryCode = phoneNumber.replace(countryCode, '')
          if (countryCode === '91') {
            if (phoneNumberWithoutCountryCode.length !== 10) {
              return false
            }
          }
          return true
        }
        return false
      }
    ),
  countryCode: Yup.string()
    .trim()
    .required('Required*'),
})
export default class LoginForm extends Component {
  componentDidMount() {
    LinksClicksGA('/login')
    document.querySelector('body')
      .style.overflow = 'hidden'
  }
  componentWillUnmount() {
    document.querySelector('body')
      .style.overflow = 'overlay'
  }
  render() {
    return (
    <div className={'landing-page-login-form-container'}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div className={'landing-page-login-form-close'} onClick={this.props.onClose}></div>
        <div className={'landing-page-login-form-loginContainer'}>
          <div className={'landing-page-login-form-title'}>LOG INTO YOUR ACCOUNT</div>
          <Formik
              initialValues={{
                phone: '',
                countryCode: '+91'
              }}
              validationSchema={validation}
              onSubmit={({ phone, countryCode }) => {
                this.props.login(phone.replace(countryCode, ''), '+' + countryCode)
              }}
            >
              {({ errors, touched, isValidating, handleSubmit, values, handleChange, setValues}) => (
                <Form style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <div className={cx('landing-page-enroll-form-inputContainer', 'landing-page-login-form-inputContainer')}>
                      <PhoneInput
                        name='phone'
                        country={getCountryCode().toLowerCase()}
                        copyNumbersOnly
                        onlyCountries={countriesAllowed}
                        countryCodeEditable={false}
                        masks={{
                          in: '..........'
                        }}
                        onChange={(phone, data, e, formattedNumber) => {
                          setValues({
                            ...values,
                            phone: phone,
                            countryCode: data.dialCode
                          })
                        }}
                        inputClass={cx('landing-page-enroll-form-phoneInput', 'landing-page-login-form-phoneInput')}
                        buttonClass={cx('landing-page-enroll-form-dropdownButtonClass', 'phone-number-dark-dropdown')}
                      />
                    </div>
                    <div className={cx('landing-page-enroll-form-error', 'landing-page-login-form-error')}>
                      {errors.phone && touched.phone
                        ? errors.phone
                        : errors.countryCode && touched.countryCode
                          ? errors.countryCode
                          : ''
                      }
                    </div>
                  </div>
                  <div className={cx('landing-page-enroll-form-text', 'landing-page-login-form-text')}>You will receive an OTP for<br className={'landing-page-displayOnlyBig'} /> verification purposes.</div>
                  <div className={'landing-page-login-form-button'} onClick={() => {
                    handleSubmit()
                  }}>
                    {this.props.isLoading && (
                      <SimpleButtonLoader showLoader style={{ backgroundImage: 'linear-gradient(to bottom, transparent, transparent)' }} />
                    )}
                    <span>SEND OTP</span>
                  </div>
                </Form>
              )}
            </Formik>
          {/* <div className={'landing-page-login-form-row'}>
            <div className={'landing-page-login-form-line'}></div>
            <div className={'landing-page-login-form-or'}>Or</div>
            <div className={'landing-page-login-form-line'}></div>
          </div>
          <div className={'landing-page-login-form-button'}>LOGIN WiTh PASSWORD</div> */}
          <div className={'landing-page-login-form-notOnTekie'}>
            Not on Tekie yet?{' '}
            <span className={'landing-page-login-form-link'} onClick={this.props.openEnrollmentForm}>Register here</span>
          </div>
        </div> 
      </div>
    </div>
    )
  }
}
