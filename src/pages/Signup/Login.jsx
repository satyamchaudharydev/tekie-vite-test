/* eslint-disable */
import React, { Component } from 'react'
import PhoneInput from 'react-phone-input-2'
import { Formik, Form, Field } from 'formik'
import gql from 'graphql-tag'
import { get } from 'lodash'
import cx from 'classnames'
import * as Yup from 'yup'
import { motion } from 'framer-motion'
import OtpInput from 'react-otp-input'
import qs from 'query-string'
import { getToasterBasedOnType, Toaster } from '../../components/Toaster'
import { countriesAllowed } from '../../config'
import { LinksClicksGA } from '../../utils/analytics/ga'
import requestToGraphql from '../../utils/requestToGraphql'
import { Link, withRouter } from 'react-router-dom'
import SimpleButtonLoader from '../../components/SimpleButtonLoader'
import validateUserOTP from '../../queries/validateUserOTP'
import { filterKey } from '../../utils/data-utils'
import { connect } from 'react-redux'
import CloseIcon from '../../assets/Close.jsx'
import getCountryCode from '../../utils/getCountryCode'
import './phoneNumberOverrideStyles.scss'
import './Login.scss'
import isSchoolWebsite from '../../utils/isSchoolWebsite'
import slugifyContent from '../../utils/slugifyContent'

const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/

const validation = Yup.object().shape({
  phone: Yup.string()
    .trim()
    .required('Required*')
    .matches(phoneRegExp, 'Phone number is not valid')
    .test(
      'isValid',
      'Phone number is not valid',
      function (phoneNumber) {
        const conuntryCoderef = Yup.ref('countryCode')
        const countryCode = this.resolve(conuntryCoderef)
        if (!phoneNumber) return false
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

const otpValidation = Yup.object().shape({
  otp: Yup.string()
    .trim()
    .required('Required*')
    .min(4, 'OTP should be minimum 4 characters')
})

const failureToasterProps = e => ({
  type: 'error',
  message: e,
  autoClose: 4000
})

class Login extends Component {
  state = {
    loading: false,
    otpForm: this.props.otpDefault || false,
    phone: this.props.phoneNumber || '',
    countryCode: this.props.phoneNumber || '+91',
    otp: ''
  }

  componentDidMount() {
    LinksClicksGA('/signin')
  }

  componentDidUpdate(prevProps) {
    if (isSchoolWebsite()) {
      if (!prevProps.userStatus.get('failure') && this.props.userStatus.get('failure')) {
        getToasterBasedOnType(failureToasterProps(this.props.error, true))
      }
    }
    if (prevProps.visible && !this.props.visible) {
      this.setState({
        loading: false,
        phone: '',
        countryCode: '+91',
        otp: ''
      })
    }
  }

  handleSubmit = () => {
    const { onSubmit } = this.props
    onSubmit(this.state.email && this.state.email.trim(), this.state.password)
  }

  closeLoginModal = () => {
    this.setState({
      loading: false,
      otpForm: false,
      phone: '',
      countryCode: '+91',
      otp: ''
    })
    this.props.closeLoginModal()
  }

  validateOTP = async (otp) => {
    let phone = this.props.phoneNumber ? this.props.phoneNumber : this.state.phone
    let countryCode = this.props.countryCode ? this.props.countryCode : this.state.countryCode
    this.setState({ loading: true })
    await validateUserOTP({
      phone: phone.trim(),
      otp: parseInt(otp.trim()),
      countryCode: countryCode.trim()
    },
      import.meta.env.REACT_APP_NODE_ENV === 'staging',
      'loggedinUser',
      () => { }).call()
    if (this.props.isLoggedIn) {
      if (this.props.otpDefault) {
        this.closeLoginModal()
        this.props.postLogin()
        return;
      }
      if (isSchoolWebsite()) {
        if (!!this.props.userData.getIn([0, 'schoolAdmin', 'id'])) {
          const schoolName = this.props.userData.getIn([0, 'schools', 0, 'name']) || null
          this.props.history.push(`/dashboard/${slugifyContent(schoolName)}`)
          window.location.reload()
        } else {
          this.props.history.push('/not-found')
        }
      }
      if (!get(this.props, 'shouldRedirect', true)) {
        this.closeLoginModal()
      }
      else if (this.props.userRole === 'mentee') {
        const params = qs.parse(window.location.search)
        if (Object.keys(params).length > 0) {
          const { redirect, ...restParams } = params
          this.props.history.push('/sessions' + '?' + qs.stringify(restParams))
        } else {
          this.props.history.push('/sessions')
        }
      } else {
        this.props.history.push('/learn')
      }
    }
    this.setState({ loading: false })
  }

  login = async (phone, countryCode) => {
    try {
      this.setState({ loading: true, phone: phone, countryCode })
      const res = await requestToGraphql(gql`
        mutation {
          loginViaOtp(input: {
            phone: {
              countryCode: "${countryCode}"
              number: "${phone.trim()}"
            }
          }) {
            result
          }
        }`)
      if (res) {
        const result = get(res, 'data.loginViaOtp.result')
        if (result) {
          this.setState({ otpForm: true, loading: false })
        }
      }
      this.setState({ loading: false })
    } catch (e) {
      if (e.errors && e.errors[0]) {
        if (this.props.prompt) {
          if (e.errors[0].message.includes('Database record not found')) {
            this.props.prompt('User Not Found!', true)
          } else {
            this.props.prompt(e.errors[0].message, true)
          }
          this.setState({ loading: false })
        }
      }
    }
  }

  render() {
    let { otpForm } = this.state
    const phoneNumber = this.props.phoneNumber ? this.props.phoneNumber : this.state.phone
    const countryCode = this.props.countryCode ? this.props.countryCode : this.state.countryCode
    otpForm = this.props.otpDefault ? true : otpForm
    return (
      <div className={'signup-page-login-container'} onClick={() => {
        if (!get(this.props, 'shouldRedirect', true)) {
          this.closeLoginModal()
        } else {
          this.props.history.push('/signup')
        }
      }}>
        <div className={'signup-page-login-popup'} onClick={(e) => { e.stopPropagation() }}>
          <div className={'signup-page-login-close'} onClick={() => {
            if (!get(this.props, 'shouldRedirect', true)) {
              this.closeLoginModal()
            } else {
              this.props.history.push('/signup')
            }
          }}>
            <div className={'signup-page-login-closeIcon'}>
              <CloseIcon />
            </div>
          </div>
          <div className={'signup-page-login-signinText'}>
            {this.props.titleText ? this.props.titleText : 'Sign In'}
          </div>
          <div className={'signup-page-login-helpText'}>
            <span style={{ opacity: 0.5 }}>
              {otpForm
                ? 'OTP sent to ' + countryCode + ' ' + phoneNumber + ' '
                : 'You will receive an OTP for verification purposes.'
              }
            </span>
            {(otpForm && !this.props.otpDefault) &&
              <span
                onClick={() => {
                  if (this.props.onChangeNumber) {
                    this.props.onChangeNumber()
                  } else {
                    this.setState({ otpForm: false, otp: '' })
                  }
                }}
                style={{
                  color: '#00ADE5',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >Change Number</span>
            }
          </div>
          <Formik
            initialValues={
              otpForm
                ? { otp: '' }
                : {
                  phone: this.state.phone,
                  countryCode: this.state.countryCode
                }
            }
            validationSchema={otpForm ? otpValidation : validation}
            onSubmit={({ phone, countryCode, otp }) => {
              if (otpForm) {
                this.validateOTP(otp)
              } else {
                this.login(phone.replace(countryCode, ''), '+' + countryCode)
              }
            }}
          >
            {({ errors, touched, isValidating, handleSubmit, values, handleChange, setValues, validateForm }) => (
              <Form style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <>
                  <div className={cx('signup-page-login-phoneInputContainer', otpForm && 'signup-page-login-otpContainer')}>
                    {otpForm ? (
                      <OtpInput
                        value={this.state.otp}
                        shouldAutoFocus
                        onChange={otp => {
                          this.setState({ otp })
                          setValues({
                            ...values,
                            otp: otp
                          })
                        }}
                        numInputs={4}
                        isInputNum
                        separator={<span></span>}
                        inputStyle={'signup-page-login-otpInput'}
                        containerStyle={'signup-page-login-otpContainer'}
                      />
                    ) : (
                      <PhoneInput
                        country={getCountryCode().toLowerCase()}
                        value={values.phone}
                        onlyCountries={countriesAllowed}
                        onChange={(phone, data, e, formattedNumber) => {
                          setValues({
                            ...values,
                            phone: phone,
                            countryCode: data.dialCode
                          })
                        }}
                        countryCodeEditable={false}
                        masks={{
                          in: '..........'
                        }}
                        copyNumbersOnly
                        inputClass={cx(
                          'signup-page-login-phoneInput',
                          (
                            errors.phone && touched.phone ||
                            errors.countryCode && touched.countryCode
                          ) && 'signup-page-login-inputError'
                        )}
                        buttonClass={cx('signup-page-login-dropdownButtonClass', 'dropdown-phone-number-light')}
                      />
                    )}
                  </div>
                  <div className={cx('signup-page-login-error', otpForm && 'signup-page-login-otpError')}>
                    {otpForm
                      ? errors.otp && touched.otp
                        ? errors.otp
                        : ''
                      : errors.phone && touched.phone
                        ? errors.phone
                        : errors.countryCode && touched.countryCode
                          ? errors.countryCode
                          : ''
                    }
                  </div>
                  {/* {!this.props.hideRegisterNow && (
                    <div className={'signup-page-login-notOnTekie'}>Not on Tekie yet?
                      <Link style={{ color: '#00ADE5', marginLeft: '4px' }}
                          onClick={() => {
                            if (!get(this.props, 'shouldRedirect', true)) {
                              this.props.openSignupModal()
                            } else {
                              this.props.history.push('/signup')
                            }
                          }}
                      >
                        Register here
                      </Link>
                    </div> 
                  )} */}
                  <motion.div
                    whileTap={{
                      scale: 0.95
                    }}
                    className={'signup-page-login-signupButton'}
                    onClick={() => {
                      validateForm()
                      handleSubmit()
                    }}
                  >
                    {this.state.loading && (
                      <div className={'signup-page-login-loadingIconContainer'}>
                        <SimpleButtonLoader
                          showLoader
                          style={{
                            backgroundImage: 'linear-gradient(to bottom, transparent, transparent)'
                          }}
                          customClassName={'signup-page-login-loadingIcon'}
                        />
                      </div>
                    )}
                    {otpForm
                      ? (
                        <span>{this.props.ctaText ? this.props.ctaText : 'Sign In'}</span>
                      ) : (
                        <span>Send OTP</span>
                      )
                    }
                  </motion.div>
                </>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    )
  }
}
export default connect((state) => ({
  userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
  ...validateUserOTP({ phone: 'a', countryCode: 'a', otp: 'a' }).mapStateToProps(state),
  error: state.data.getIn(['errors', 'user/fetch', 0, 'error', 'errors', 0, 'message']),
  userData: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser'),
  isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
    state.data.getIn(['userChildren', 'data']).size,
}))(withRouter(Login))
