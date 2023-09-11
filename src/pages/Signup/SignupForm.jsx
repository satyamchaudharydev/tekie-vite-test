/* eslint-disable */
import { Field, Form, Formik } from 'formik'
import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import PhoneInput from 'react-phone-input-2'
import { motion } from 'framer-motion'
import { get } from 'lodash'
import * as Yup from 'yup'
import qs from 'query-string'
import 'react-phone-input-2/lib/style.css'
import cx from 'classnames'
import { DesktopOnly } from '../../components/MediaQuery'
import { getToasterBasedOnType } from '../../components/Toaster'
import { registrationFailedGA } from '../../utils/analytics/ga'
import { countriesAllowed } from '../../config'
import SimpleButtonLoader from '../../components/SimpleButtonLoader'
import signUpMentee from '../../queries/signUpMentee'
import { connect } from 'react-redux'
import getCountryCode from '../../utils/getCountryCode'
import { filterKey } from '../../utils/data-utils'
import CalendarIcon from './CalendarIcon.jsx'
import TestimonialDrop from './TestimonialDrop.jsx'
import './phoneNumberOverrideStyles.scss'
import './Signup.scss'
import getCountry, { getCity } from '../../utils/getCountry'
import CheckBox from '../../components/CheckBox/checkBox'
import utmParamsAction from '../../utils/utmParameterAction'
import getDeviceInfo from '../../utils/getDeviceInfo'

const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/

const failureToasterProps = e => ({
  type: 'error',
  message: e,
  autoClose: 4000
})


const getGradeLabel = (grade) => {
  if (grade === 1) {
    return '1st'
  }
  if (grade === 2) {
    return '2nd'
  }
  if (grade === 3) {
    return '3rd'
  }
  return `${grade}th`
}
const validationMentee = Yup.object().shape({
  parentName: Yup.string()
    .trim()
    .min(3, 'Name cannot be less than 3 letters')
    .max(30, 'Name cannot be more than 30 letters')
    .required('Required*'),
  email: Yup.string()
    .email('Invalid email')
    .trim()
    .required('Required*'),
  parentPhone: Yup.string()
    .trim()
    .required('Required*')
    .matches(phoneRegExp, 'Phone number is not valid')
    .test(
      'isValid',
      'Invalid phone number',
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
  childName: Yup.string()
    .trim()
    .min(3, 'Name cannot be less than 3 letters')
    .max(30, 'Name cannot be more than 30 letters')
    .required('Required*')
});

class Signup extends Component {
  state = {
    grade: 6,
    parentName: '',
    childName: '',
    parentEmail: '',
    countryCode: '+91',
    parentPhone: '',
    slide: 0,
    hasLaptopOrDesktop: null,
  }

  componentDidMount() {
    this.startAutoPlay()

    const query = qs.parse(window.location.search)
    const queryKeys = Object.keys(query)

    // for (const key of queryKeys) {
    //   localStorage.setItem(key, query[key])
    // }

    utmParamsAction()
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.userStatus.get('failure') && this.props.userStatus.get('failure')) {
      getToasterBasedOnType(failureToasterProps(this.props.error, true))
      registrationFailedGA(this.props.error)
    }
    if (!prevProps.userStatus.get('success') && this.props.userStatus.get('success')) {
      getToasterBasedOnType({
        type: 'success',
        message: 'Successfully LoggedIn!'
      })
    }
  }

  signUp = async ({
    parentName, email: parentEmail, countryCode, parentPhone, childName
  }) => {
    const {
      grade,
    } = this.state
    const prevUserId = this.props.userId
    const referralCode = sessionStorage.getItem('referralCode')
    const schoolName = sessionStorage.getItem('schoolName')
    const timezone = localStorage.getItem('timezone')
    let campaignInput = {}
    if (localStorage.getItem('utm_source')) {
      campaignInput.utmSource = localStorage.getItem('utm_source')
    }
    if (localStorage.getItem('utm_campaign')) {
      campaignInput.utmCampaign = localStorage.getItem('utm_campaign')
    }
    if (localStorage.getItem('utm_term')) {
      campaignInput.utmTerm = localStorage.getItem('utm_term')
    }
    if (localStorage.getItem('utm_content')) {
      campaignInput.utmContent = localStorage.getItem('utm_content')
    }
    if (localStorage.getItem('utm_medium')) {
      campaignInput.utmMedium = localStorage.getItem('utm_medium')
    }
    await signUpMentee({
      parentName: parentName.trim(),
      childName: childName.trim(),
      parentEmail: parentEmail.trim(),
      parentPhone: {
        number: parentPhone.trim(),
        countryCode,
      },
      grade: `Grade${grade}`,
      country: getCountry(),
      city: getCity(),
      hasLaptopOrDesktop: this.state.hasLaptopOrDesktop,
      ...(referralCode ? { referralCode } : {}),
      ...(schoolName ? { schoolName } : {}),
      ...(timezone ? { timezone } : {}),
      ...campaignInput,
      ...getDeviceInfo()
    }).call()
    if (this.props.isLoggedIn) {
      const shouldRedirect = get(this.props, 'shouldRedirect', true)
      const params = qs.parse(window.location.search)
      if (shouldRedirect) {
        if (params.redirect) {
          const { redirect, ...restParams } = params
          this.props.history.push(redirect + '?' + qs.stringify(restParams))
        } else {
          if (this.props.userSource === 'school') {
            this.props.history.push('/sessions')
          } else {
            this.props.history.push('/sessions/book')
          }
        }
      } else {
        this.props.closeSignUp(true)
      }
    }
  }

  startAutoPlay() {
    setTimeout(() => {
      this.setState(prev => ({
        slide: prev.slide === 2 ? 0 : prev.slide + 1
      }))
      this.startAutoPlay()
    }, 10000)
  }

  shouldShowSep = grade => {
    if (grade === 12) {
      return false
    }
    if (grade === this.state.grade) {
      return false
    }
    if (grade === (this.state.grade - 1)) {
      return false
    }
    return true
  }

  renderTestimonial = () => {
    return (
      <>
        <div className={'signup-page-slideTitle'} style={{ pointerEvents: 'none' }}>Parents trust us.</div>
        <div className={'signup-page-dropTestimonial'}>
          <TestimonialDrop />
          <div className={'signup-page-parentImageContainer'}>
            <div className={'signup-page-parentImage'}></div>
          </div>
        </div>
        <div className={'signup-page-testimonialText'}>
          The best learning happens when you are not learning, you are playing and enjoying. For Medha, learning has been a pleasant glide, thanks to a warm and interpersonal method of teaching; it's like she is learning from a friend who knows her! She loves the puzzles and other methods used- both experimental and classic.
        </div>
        <div className={'signup-page-testimonialAuthor'}>
          Sudipto Mondal
        </div>
        <div className={'signup-page-testimonialAuthorLocation'}>
          Delhi
        </div>
      </>
    )
  }

  renderTekieFeature = (slide) => {
    return (
      <>
        <div className={'signup-page-slideTitle'}>What the world says about Tekie</div>
        <div className={'signup-page-tekieFeatureContainer'} style={{ pointerEvents: slide === 1 ? 'auto' : 'none' }}>
          <div className={'signup-page-TFrow'}>
            <a href="https://inc42.com/startups/tekie-bets-on-animation-to-take-on-whitehat-jr-co-in-edtechs-coding-for-kids-race/" target='_blank'>
              <div className={'signup-page-inc42Icon'}></div>
            </a>
            <div className={'signup-page-featureText'}>
              “While most competing platforms are teaching students block-based programming, Tekie is attempting to teach young students the fundamentals of text-based programming, which is to write actual coding language syntax.”
            </div>
          </div>
          <div className={cx('signup-page-TFrow', 'signup-page-yourStoryContainer')}>
            <div className={'signup-page-featureText'} style={{ marginLeft: 0 }}>
              The founder elaborates, “We came up with the idea of animation because that helps bring imagination to reality. We also wanted to make learning interesting and engaging.”
            </div>
            <a href="https://yourstory.com/2020/11/edtech-startup-whitehat-jr-rival-animation-coding" target='_blank'>
              <div className={'signup-page-yourStoryIcon'}></div>
            </a>
          </div>
        </div>
      </>
    )
  }

  renderGCI = (slide) => {
    return (
      <>
        <div className={'signup-page-slideTitle'}>Our Result</div>
        <div className={'signup-page-gciThumb'} onClick={() => { window.open('https://codein.withgoogle.com/archive/2017/') }} style={{ pointerEvents: slide === 0 ? 'auto' : 'none' }}></div>
        <div className={'signup-page-gciText'}>
          Sanatan is our in-house coding prodigy who ranked as a Top 2 finalist in Google’s Code-In competition (now defunct). He’s a great example of how starting early in your coding journey can be so empowering that you can even find yourself tackling challenges at tech giants like Google!
        </div>
      </>
    )
  }

  renderSignupForm = (isModal) => {
    return (
      <Formik
        initialValues={{
          parentName: '',
          email: '',
          parentPhone: '',
          childName: '',
          countryCode: '+91'
        }}
        validationSchema={validationMentee}
        onSubmit={({ parentName, email, countryCode, parentPhone, childName }) => {
          const { hasLaptopOrDesktop } = this.state
          if (hasLaptopOrDesktop === true || hasLaptopOrDesktop === false) {
            this.signUp({
              parentName, email, countryCode: '+' + countryCode, parentPhone: parentPhone.replace(countryCode, ''), childName
            })
          } else {
            this.setState({
              shouldLaptopError: true
            })
          }
        }}
      >
        {({ errors, touched, isValidating, handleSubmit, values, handleChange, setValues, validateForm }) => (
          <Form style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className={'signup-page-inputColumn'}>
              <Field
                name="parentName"
                placeholder="Parent Name*"
                className={cx('signup-page-input', errors.parentName && touched.parentName && 'signup-page-inputError')}
              />
              <div className={'signup-page-error'}>
                {errors.parentName && touched.parentName && errors.parentName}
              </div>
            </div>
            <div className={'signup-page-inputColumn'}>
              <Field
                placeholder="Parent Email ID*"
                name="email"
                className={cx('signup-page-input', errors.email && touched.email && 'signup-page-inputError')}
              />
              <div className={'signup-page-error'}>
                {errors.email && touched.email && errors.email}
              </div>
            </div>
            <div className={'signup-page-inputColumn'}>
              <div className={'signup-page-phoneInputContainer'}>
                <PhoneInput
                  country={getCountryCode().toLowerCase()}
                  onlyCountries={countriesAllowed}
                  onChange={(phone, data, e, formattedNumber) => {
                    setValues({
                      ...values,
                      parentPhone: phone,
                      countryCode: data.dialCode
                    })
                  }}
                  countryCodeEditable={false}
                  masks={{
                    in: '..........'
                  }}
                  copyNumbersOnly
                  inputClass={cx(
                    'signup-page-phoneInput',
                    (
                      errors.parentPhone && touched.parentPhone ||
                      errors.countryCode && touched.countryCode
                    ) && 'signup-page-inputError'
                  )}
                  buttonClass={cx('signup-page-dropdownButtonClass', 'dropdown-phone-number-light')}
                />
              </div>
              <div className={'signup-page-error'}>
                {errors.parentPhone && touched.parentPhone
                  ? errors.parentPhone
                  : errors.countryCode && touched.countryCode
                    ? errors.countryCode
                    : ''
                }
              </div>
            </div>
            <div className={'signup-page-inputColumn'}>
              <Field
                placeholder="Student Name*"
                className={cx('signup-page-input', errors.childName && touched.childName && 'signup-page-inputError')}
                name="childName"
              />
              <div className={'signup-page-error'}>
                {errors.childName && touched.childName && errors.childName}
              </div>
            </div>

            <div className={'signup-page-label'}>
              Student Grade*
            </div>
            <div className={'signup-page-gradesContainer'}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((grade) => (
                <>
                  <motion.div
                    whileTap={{
                      scale: 1
                    }}
                    onClick={() => {
                      this.setState({ grade: grade })
                    }}
                    className={cx(
                      'signup-page-gradesWrapperSignupForm',
                      this.state.grade === grade && 'signup-page-gradeActive')
                    }>
                    {getGradeLabel(grade)}
                  </motion.div>
                  {/* {this.shouldShowSep(grade) && (
                    <div className={'signup-page-gradeSep'}></div>
                  )} */}
                </>
              ))}
            </div>
            <div className={'signup-page-privacytext'} style={{ display: 'flex', alignItems: 'center' }}>
              <span>Do you have a Laptop or Desktop?</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }} className={'signup-page-hasLaptopOrDesktop'}>
              <div style={{ display: 'flex', flexDirection: 'row' }}><CheckBox value={this.state.hasLaptopOrDesktop === true} onChange={() => { this.setState({ hasLaptopOrDesktop: true, shouldLaptopError: false }) }} container='signup-page-checkbox-container' />  Yes</div>
              <div style={{ display: 'flex', flexDirection: 'row' }}><CheckBox value={this.state.hasLaptopOrDesktop === false} onChange={() => { this.setState({ hasLaptopOrDesktop: false, shouldLaptopError: false }) }} container='signup-page-checkbox-container' />  No</div>
            </div>
            <div className={'signup-page-error'}>
              {this.state.shouldLaptopError && '*Please confirm your laptop/PC availability'}
            </div>
            <div className={'signup-page-privacytext'}>
              By continuing, you agree to our{' '}
              <Link
                to="/terms"
                style={{ color: '#00ADE5' }}
              >
                <span>Terms & Conditions</span>
              </Link> and{' '}
              <Link
                to="/privacy"
                style={{ color: '#00ADE5' }}
              >
                <span>Privacy Policy.</span>
              </Link>
            </div>
            <motion.div
              whileTap={{
                scale: 1
              }}
              className={`signup-page-signupButton ${this.props.userStatus.get('loading') && 'disabled'}`}
              onClick={
                !this.props.userStatus.get('loading') ?
                  () => {
                    validateForm()
                    handleSubmit()
                  } : null
              }>
              <div className={!isModal && 'signup-page-calendarIcon'}>
                {!this.props.userStatus.get('loading') && (
                  !isModal ? <CalendarIcon /> : null
                )}
                {this.props.userStatus.get('loading') && (
                  <SimpleButtonLoader
                    showLoader
                    style={{
                      backgroundImage: 'linear-gradient(to bottom, transparent, transparent)',
                      marginRight: `${isModal ? '8px' : '0px'}`,
                    }}
                    customClassName={'signup-page-loadingIcon'}
                  />
                )}
              </div>
              <span>{isModal ? 'Sign Up Now' : 'Schedule your Free class'}</span>
            </motion.div>
          </Form>
        )
        }
      </Formik>
    )
  }

  renderShowcaseContainer = () => {
    return (
      <div className={'signup-page-showcaseContainer'}>
        <div className={'signup-page-slideContainer'}>
          <motion.div
            className={'signup-page-slideWrapper'}
            style={{
              zIndex: this.state.slide === 0 ? 1 : 0,
              pointerEvents: 'none'
            }}
            animate={{
              opacity: this.state.slide === 0 ? 1 : 0
            }}
            initial={{ opacity: 0 }}
          >
            {this.renderGCI(this.state.slide)}
          </motion.div>
          <motion.div
            className={'signup-page-slideWrapper'}
            animate={{
              opacity: this.state.slide === 1 ? 1 : 0
            }}
            style={{
              zIndex: this.state.slide === 1 ? 1 : 0,
              pointerEvents: this.state.slide === 1 ? 'auto' : 'none'
            }}
            initial={{ opacity: 0 }}
          >
            {this.renderTekieFeature(this.state.slide)}
          </motion.div>
          <motion.div
            className={'signup-page-slideWrapper'}
            style={{
              zIndex: this.state.slide === 0 ? 1 : 0,
              pointerEvents: 'none'
            }}
            animate={{
              opacity: this.state.slide === 2 ? 1 : 0
            }}
            initial={{ opacity: 1 }}
          >
            {this.renderTestimonial()}
          </motion.div>
        </div>
        <div className={'signup-page-indicatorRow'}>
          <motion.div
            className={'signup-page-indicator'}
            animate={{
              background: this.state.slide === 0 ? '#70F0FF' : '#CBF7FC'
            }}
            initial={{ background: '#70F0FF' }}
            style={{
              marginLeft: 0,
              zIndex: this.state.slide === 0 ? 1 : 0
            }}
            onClick={() => this.setState({ slide: 0 })}
          ></motion.div>
          <motion.div
            className={'signup-page-indicator'}
            animate={{
              background: this.state.slide === 1 ? '#70F0FF' : '#CBF7FC'
            }}
            initial={{ background: '#CBF7FC' }}
            onClick={() => this.setState({ slide: 1 })}
          ></motion.div>
          <motion.div
            className={'signup-page-indicator'}
            animate={{
              background: this.state.slide === 2 ? '#70F0FF' : '#CBF7FC'
            }}
            initial={{ background: '#CBF7FC' }}
            onClick={() => this.setState({ slide: 2 })}
          ></motion.div>
        </div>
      </div>
    )
  }

  render() {
    const { isModal } = this.props
    return (
      <>
        {!isModal ? (
          this.renderShowcaseContainer()
        ) : (
          <DesktopOnly>
            {this.renderShowcaseContainer()}
          </DesktopOnly>
        )}
        <div className={'signup-page-signupLine'}>
        </div>
        <div
          className={'signup-page-signupFormBody'}
          style={{
            boxShadow: `${isModal ? 'unset' : ''}`,
            padding: `${isModal ? '0px' : ''}`
          }}
        >
          {this.renderSignupForm(isModal)}
        </div>
      </>
    )
  }
}

export default connect((state) => ({
  isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
    state.data.getIn(['userChildren', 'data']).size,
  userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
  userSource: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'parent', 'source'], ''),
  error: state.data.getIn([
    'errors', 'user/fetch', -1, 'error', 'errors', 0, 'message']),
  ...signUpMentee().mapStateToProps()
}))(withRouter(Signup))