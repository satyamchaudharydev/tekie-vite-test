import React, { Component } from 'react'
import cx from 'classnames'
import validateUserOTP from '../../../queries/validateUserOTP'
import { filterKey } from '../../../utils/data-utils'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import SimpleButtonLoader from '../../../components/SimpleButtonLoader'
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import qs from 'query-string'
import './LoginForm.scss'
import './EnrollmentForm.scss'

const validation = Yup.object().shape({
  OTP: Yup.string()
    .trim()
    .required('Required*')
    .max(4, 'OTP cannot be more than 4 digits ')
    .min(4, 'OTP cannot be less than 4 digits '),
})

class OTPForm extends Component {
  state = {
    otp: ''
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.userStatus.get('failure') && this.props.userStatus.get('failure')) {
      if (this.props.prompt) {
        this.props.prompt.open(this.props.error, true)
      }
    }
  }

  signUp = async (OTP) => {
    const { phone, countryCode, history } = this.props
    await validateUserOTP({
      countryCode,
      phone: phone.trim(),
      otp: parseInt(OTP.trim()),
    }, import.meta.env.REACT_APP_NODE_ENV === 'staging').call()

    if (this.props.isLoggedIn) {
      if (this.props.userRole === 'mentee') {
        const params = qs.parse(window.location.search)
        if (Object.keys(params).length > 0) {
          const { redirect, ...restParams } = params
          this.props.history.push('/sessions' + '?' + qs.stringify(restParams))
        } else {
          this.props.history.push('/sessions')
        }
      } else {
        history.push('/learn')
      }
    }
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
                OTP: ''
              }}
              validationSchema={validation}
              onSubmit={({ OTP }) => {
                this.signUp(OTP)
              }}
            >
              {({ errors, touched, isValidating, handleSubmit, values, handleChange }) => (
                <Form style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className={cx('landing-page-enroll-form-inputContainer', 'landing-page-login-form-inputContainer')}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                      <Field
                        name="OTP"
                        placeholder="Enter OTP"
                        id="phone"
                        className={cx('landing-page-enroll-form-input', 'landing-page-login-form-input')}
                      />
                      <div className={'landing-page-enroll-form-error'}>
                        {errors.OTP && touched.OTP && errors.OTP}
                      </div>
                    </div>
                  </div>
                  <div className={cx('landing-page-enroll-form-text', 'landing-page-login-form-text')}>
                    OTP sent to {this.props.countryCode} {this.props.phone} <br /> <span className={'landing-page-login-form-link'} onClick={this.props.openLogin}>Change Number.</span>
                  </div>
                  <div className={'landing-page-login-form-button'} onClick={handleSubmit}>
                    {this.props.userStatus.get('loading') && (
                      <SimpleButtonLoader showLoader style={{ backgroundImage: 'linear-gradient(to bottom, transparent, transparent)' }} />
                    )}
                    <span>LOGIN</span>
                  </div>
                </Form>
              )}
            </Formik>
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

export default connect((state) => ({
  userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
  ...validateUserOTP({ phone: 'a', countryCode: 'a', otp: 'a' }).mapStateToProps(state),
  error: state.data.getIn(['errors', 'user/fetch', 0, 'error', 'errors', 0, 'message']),
  userRole: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'role'], false),
  isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
    state.data.getIn(['userChildren', 'data']).size,
}))(withRouter(OTPForm))
