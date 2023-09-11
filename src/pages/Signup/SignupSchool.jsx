/* eslint-disable */
import { Field, Form, Formik } from 'formik'
import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { get } from 'lodash'
import PhoneInput from 'react-phone-input-2'
import { motion } from 'framer-motion'
import * as Yup from 'yup'
import Select from 'react-select'
import qs from 'query-string'
import UserIcon from './user.js'
import cx from 'classnames'
import { getToasterBasedOnType, Toaster } from '../../components/Toaster'
import { LinksClicksGA, registrationFailedGA } from '../../utils/analytics/ga'
import { countriesAllowed } from '../../config'
import SimpleButtonLoader from '../../components/SimpleButtonLoader'
import signUpMentee from '../../queries/signUpMentee'
import { connect } from 'react-redux'
import { filterKey } from '../../utils/data-utils'
import getCountryCode from '../../utils/getCountryCode'
import CalendarIcon from './CalendarIcon.jsx'
import TestimonialDrop from './TestimonialDrop.jsx'
import GoogleIcon from './svg/google.js'
import IntelIcon from './svg/intel.js'
import MicrosoftIcon from './svg/microsoft.js'
import AmazonIcon from './svg/amazon.js'
import CoolDrop from '../../assets/avatarsSVG/CoolDrop.js'
import Login from './Login'
import './phoneNumberOverrideStyles.scss'
import 'react-phone-input-2/lib/style.css'
import './Signup.scss'
import utmParamsAction from '../../utils/utmParameterAction.js'

const mainStyles = {}
const heroStyles = {}
const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/


const failureToasterProps = e => ({
  type: 'error',
  message: e,
  autoClose: 4000
})

const validationMentee = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(3, 'Name cannot be less than 3 letters')
    .max(30, 'Name cannot be more than 30 letters')
    .required('Required*'),
  school: Yup.string()
    .trim()
    .required('Required*'),
  role: Yup.string()
    .trim()
    .required('Required*'),
  city: Yup.string()
    .trim()
    .required('Required*'),
  email: Yup.string()
    .email('Invalid email')
    .trim()
    .required('Required*'),
  phone: Yup.string()
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
});
class Signup extends Component {
  state = {
    grade: 6,
    name: '',
    childName: '',
    parentEmail: '',
    countryCode: '+91',
    phone: '',
    role: '',
    slide: 0,
    hasSubmitted: false,
    isLoading: false
  }

  componentDidMount() {
    this.startAutoPlay()

    const query = qs.parse(window.location.search)
    const queryKeys = Object.keys(query)

    // if (queryKeys && queryKeys.length > 0) {
    //   for (const key of queryKeys) {
    //     localStorage.setItem(key, query[key])
    //   }
    // }
    utmParamsAction()
    const refferalCode = sessionStorage.getItem('referralCode')
    const schoolName = sessionStorage.getItem('schoolName')
    if (refferalCode) {
      this.props.history.push('/signup?referralCode=' + refferalCode)
    }
    if (schoolName) {
      this.props.history.push('/signup?schoolName=' + schoolName)
    }
    if (get(this.props, 'location.state')) {
      this.setState({
        phone: `${get(this.props, 'location.state.phone.countryCode', '91')}${get(this.props, 'location.state.phone.number', '')}`,
        countryCode: get(this.props, 'location.state.phone.countryCode', '91')
      })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.userStatus.get('failure') && this.props.userStatus.get('failure')) {
      getToasterBasedOnType(failureToasterProps(this.props.error, true))
      registrationFailedGA(this.props.error)
    }
  }

  signUp = async ({
    name, email, role, school, city
  }) => {
    this.setState({ isLoading: true })
    const { phone } = this.state
    if (import.meta.env.NODE_ENV === 'production') {
      fetch(`https://script.google.com/macros/s/AKfycbxcJLDIkZ4_J2G74R9pDnTCSUYXLU6hD4hYt6fQcjPweYWuYpeXzwft/exec?name=${name}&school=${school}&role=${role}&city=${city}&email=${email}&phone=${phone}`)
    }
    setTimeout(() => {
      this.setState({ isLoading: false, hasSubmitted: true })
    }, 1000)
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
            <a href="https://inc42.com/startups/tekie-bets-on-animation-to-take-on-whitehat-jr-co-in-edtechs-coding-for-kids-race/" target='_blank' rel="noopener noreferrer">
              <div className={'signup-page-inc42Icon'}></div>
            </a>
            <div className={'signup-page-featureText'}>
              “While most competing platforms are teaching students block-based programming, Tekie is attempting to teach young students the fundamentals of text-based programming, which is to write actual coding language syntax.”
            </div>
          </div>
          <div className={cx('signup-page-TFrow', 'signup-page-yourStoryContainer')}>
            <div className={'signup-page-featureText'} style={{ marginLeft: 0 }}>
              “Tekie has been designed to give students tangible coding abilities that will prepare them for a career while being genuinely fun and engaging. Kids partake in we at GSV refer to as <span>Invisible Learning.</span>”
            </div>
            <a href="https://medium.com/gsv-ventures/tekie-where-coding-meets-storytelling-d8a63d224b6d" target='_blank' rel="noopener noreferrer">
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

  renderhasSubmitted = () => {
    return (
      <div className={'signup-page-hasSubmitted'}>
        <div className={'signup-page-hasSubmittedContainer'}>
          <div className={'signup-page-coolDrop'}>
            <CoolDrop />
          </div>
          <div className={'signup-page-dropTitle'}>Great! <div className={'signup-page-thumbsupEmoji'}></div></div>
          <div className={'signup-page-dropText'}>Our team will get in touch with you shortly!</div>
        </div>
      </div>
    )
  }

  getSelectColorStyles = () => {
    return {
      input: styles => ({
        ...styles,
        fontFamily: 'Nunito',
      }),
      indicatorSeparator: styles => ({
        ...styles,
        display: 'none',
        padding: '0px'
      }),
      control: (styles, { isFocused }) => ({
        ...styles, backgroundColor: 'white',
        borderColor: 'rgba(0, 173, 229, 0.6)',
        boxShadow: isFocused ? '0 0 0 2px rgba(0, 173, 229, 0.6)' : 'none',
        color: 'rgba(0, 0, 0, 0.6)',
      }),
      singleValue: (provided) => ({
        ...provided,
        color: 'rgba(0, 0, 0, 0.6)',
      }),
      option: (styles, { isDisabled, isFocused, isSelected }) => {
        return {
          ...styles,
          backgroundColor: isDisabled
            ? null
            : isSelected
              ? 'rgba(0, 173, 229, 0.6)'
              : isFocused
                ? '#e7fbfd'
                : '#ffffff',
          color: isDisabled
            ? '#ccc'
            : isSelected
              ? 'white'
              : 'rgba(0, 0, 0, 0.6)',
          cursor: isDisabled ? 'not-allowed' : 'default',
          '&:hover': {
            backgroundColor: !isDisabled && '#e7fbfd',
          },
          ':active': {
            ...styles[':active'],
            backgroundColor: !isDisabled && (isSelected ? '#e7fbfd' : '#504f4f'),
          },
        };
      },
    };
  }

  renderSignupForm = () => {
    return (
      <Formik
        initialValues={{
          name: '',
          email: get(this.props, 'location.state.mailId', ''),
          phone: `${get(this.props, 'location.state.phone.countryCode', '91')}${get(this.props, 'location.state.phone.number', '')}`,
          role: '',
          school: '',
          city: '',
          countryCode: get(this.props, 'location.state.phone.countryCode', '+91')
        }}
        validationSchema={validationMentee}
        onSubmit={({ name, email, countryCode, phone, school, role, city }) => {
          this.signUp({
            name, email, countryCode: '+' + countryCode, phone: phone.replace(countryCode, ''), school, role, city
          })
        }}
      >
        {({ errors, touched, isValidating, handleSubmit, values, handleChange, setValues, validateForm }) => (
          <Form style={{ width: '100%', display: 'flex', flexDirection: 'column' }} errors={errors}>
            <div className={'signup-page-inputColumn'}>
              <Field
                name="name"
                placeholder="Name*"
                className={cx('signup-page-input', errors.name && touched.name && 'signup-page-inputError')}
                style={{ marginTop: 0 }}
              />
              <div className={'signup-page-error'}>
                {errors.name && touched.name && errors.name}
              </div>
            </div>
            <div className={'signup-page-inputColumn'}>
              <Field
                name="school"
                placeholder="School*"
                className={cx('signup-page-input', errors.school && touched.school && 'signup-page-inputError')}
              />
              <div className={'signup-page-error'}>
                {errors.school && touched.school && errors.school}
              </div>
            </div>
            <div className={'signup-page-inputColumn'}>
              <Select
                options={[{
                  value: 'principal',
                  label: 'Principal'
                }, {
                  value: 'dean',
                  label: 'Dean',
                }, {
                  value: 'vicePrincipal',
                  label: 'Vice Prinicipal'
                }, {
                  value: 'hod',
                  label: 'HOD'
                }, {
                  value: 'teacher',
                  label: 'Teacher'
                }, {
                  value: 'owner',
                  label: 'Owner'
                }, {
                  value: 'trustee',
                  label: 'Trustee'
                }, {
                  value: 'other',
                  label: 'Other'
                }]}
                styles={this.getSelectColorStyles()}
                placeholder='Choose Role/Position*'
                value={this.state.role}
                className={'signup-page-inputSelectable'}
                onChange={(role) => {
                  this.setState({ role })
                  if (role.value === 'other') {
                    setValues({
                      ...values,
                      role: '',
                    })
                  } else {
                    setValues({
                      ...values,
                      role: role.value,
                    })
                  }
                }}
                isSearchable={false}
              />
              {this.state.role.value !== 'other' && (
                <div className={'signup-page-error'}>
                  {errors.role && touched.role && errors.role}
                </div>
              )}
            </div>
            {this.state.role.value === 'other' && (
              <div className={'signup-page-inputColumn'}>
                <Field
                  name="role"
                  placeholder="Specify your role*"
                  className={cx('signup-page-input', errors.role && touched.role && 'signup-page-inputError')}
                />
                <div className={'signup-page-error'}>
                  {errors.role && touched.role && errors.role}
                </div>
              </div>
            )}
            <div className={'signup-page-inputColumn'}>
              <Field
                name="city"
                placeholder="City*"
                className={cx('signup-page-input', errors.city && touched.city && 'signup-page-inputError')}
              />
              <div className={'signup-page-error'}>
                {errors.city && touched.city && errors.city}
              </div>
            </div>
            <div className={'signup-page-inputColumn'}>
              <Field
                placeholder="Email Address*"
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
                      phone: phone,
                      countryCode: data.dialCode
                    })
                    this.setState({
                      phone: phone,
                      countryCode: data.dialCode
                    })
                  }}
                  value={this.state.phone}
                  countryCodeEditable={false}
                  masks={{
                    in: '..........'
                  }}
                  copyNumbersOnly
                  inputClass={cx(
                    'signup-page-phoneInput',
                    (
                      errors.phone && touched.phone ||
                      errors.countryCode && touched.countryCode
                    ) && 'signup-page-inputError'
                  )}
                  buttonClass={cx('signup-page-dropdownButtonClass', 'dropdown-phone-number-light')}
                />
              </div>
              <div className={'signup-page-error'}>
                {errors.phone && touched.phone
                  ? errors.phone
                  : errors.countryCode && touched.countryCode
                    ? errors.countryCode
                    : ''
                }
              </div>
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
                scale: 0.95
              }}
              className={'signup-page-signupButton'}
              onClick={() => {
                validateForm()
                handleSubmit()
              }}
            >
              <div className={'signup-page-calendarIcon'}>
                {!this.state.isLoading &&
                  <UserIcon />
                }
                {this.state.isLoading && (
                  <SimpleButtonLoader
                    showLoader
                    style={{
                      backgroundImage: 'linear-gradient(to bottom, transparent, transparent)'
                    }}
                    customClassName={'signup-page-loadingIcon'}
                  />
                )}
              </div>
              <span>Get in Touch</span>
            </motion.div>
          </Form>
        )}
      </Formik>
    )
  }

  renderLoginText = () => {
    if (this.props.isLoggedIn) {
      let link = ''
      if (this.props.userRole !== 'mentee') {
        link = '/learn'
      } else {
        link = '/sessions'
      }
      return (
        <Link to='/sessions' style={{ color: '#06B3E6' }}>Go to app</Link>
      )
    }
    return (
      <span>Already have an account? <Link to='/signin' style={{ color: '#06B3E6' }}>Login</Link></span>
    )
  }

  render() {
    const { props } = this
    const isSignin = this.props.history.location.pathname === '/signin'
    return (
      <>
        <div className={'signup-page-container'}>
          <div className={'signup-page-triangleBG'}></div>
          <div className={'signup-page-body'}>
            <div className={'signup-page-banner-row'}>
              <div className={'signup-page-GSVLogo'} />
              <a href="https://www.asugsvsummit.com/gsv-cup-elite-200" target="_blank" className={'signup-page-GSV-link'}>Tekie is part of the GSV Cup Elite 200:</a>
              <span className={'signup-page-headerText'}> World’s most innovative education startups </span>
            </div>
            <div className={'signup-page-headerRow'}>
              <a href="/" style={{ textDecoration: 'none' }}>
                <div className={'signup-page-tekieLogo'} style={{ cursor: 'pointer' }} onClick={() => {
                  LinksClicksGA(`Top Tekie Logo Click: From ${props.match.path}`)
                }}></div>
              </a>
            </div>
            <div className={'signup-page-headingBookSession'}>Get Tekie to Your School!</div>
            <div className={'signup-page-laptopText'}>Live online coding platform for kids</div>
            <div className={'signup-page-signupBodyWrapper'}>
              {!this.state.hasSubmitted ? (
                <>
                  <div className={'signup-page-signupBodySchool'}>
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
                            marginLeft: 0
                          }}
                          style={{
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
                    <div className={'signup-page-signupLine'}>
                    </div>
                    <div className={'signup-page-signupFormBody'}>
                      {this.renderSignupForm()}
                    </div>
                  </div>
                </>
              ) : (
                this.renderhasSubmitted()
              )}
            </div>
            <div className={'signup-page-teamBanner'}>
              <div className={'signup-page-teamTitle'}>Brought to you by a team from</div>
              <div className={'signup-page-teamRowWrapper'}>
                <div className={'signup-page-teamRow'}>
                  <div className={'signup-page-googleIcon'}>
                    <GoogleIcon />
                  </div>
                  <div className={'signup-page-intelIcon'}>
                    <IntelIcon />
                  </div>
                  <div className={'signup-page-microsoftIcon'}>
                    <MicrosoftIcon />
                  </div>
                  <div className={cx('signup-page-amazonIcon', 'signup-page-noMarginRightMobile')}>
                    <AmazonIcon />
                  </div>
                </div>
                <div className={'signup-page-teamRow'}>
                  <div className={'signup-page-textIcon'}>
                    IIT Delhi
                  </div>
                  <div className={'signup-page-textIcon'}>
                    IIM Ahmedabad
                  </div>
                  <div className={'signup-page-textIcon'} style={{ marginRight: 0 }}>
                    NITs
                  </div>
                </div>
              </div>
            </div>

            <div className={'signup-page-footer'}>
              <div className={'signup-page-socialMediaRow'}>
                <a target="_blank" href="https://www.facebook.com/Tekie.in" className={'signup-page-socialMediaIcon'}>
                  <svg width="100%" height="100%" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.8" fill-rule="evenodd" clip-rule="evenodd" d="M26.309 54.9229H26.347H26.302H26.309ZM28.6151 54.9229H28.5851H28.6231H28.6151ZM26.1991 54.9179H26.2401H26.2301H26.1991ZM28.6991 54.9179H28.6891H28.7301H28.6991ZM28.7861 54.9129H28.7661H28.8081H28.7861ZM28.8741 54.9079H28.844H28.8871H28.8741ZM28.962 54.9079H28.923H28.9571H28.9981H28.962ZM25.962 54.9079H25.996H25.9571H25.9211H25.962ZM29.045 54.9029H29.028H29.0721H29.045ZM25.7681 54.9029H25.8111H25.7721H25.7681ZM29.1341 54.9029H29.1121H29.1551H29.1341ZM25.694 54.8969H25.7331H25.6971H25.6601H25.694ZM29.222 54.8969H29.1861H29.225H29.2591H29.222ZM29.309 54.8909H29.302H29.344H29.316H29.309ZM25.5811 54.8909H25.6231H25.6101H25.5811ZM25.5041 54.8859H25.545H25.5231H25.5041ZM29.3971 54.8859H29.375H29.416H29.3971ZM25.427 54.8789H25.4641H25.4351H25.427ZM29.4841 54.8789H29.455H29.4921H29.4841ZM25.323 54.8709H25.3561H25.3521H25.323ZM29.5711 54.8709H29.5631H29.5961H29.5711ZM29.6581 54.8639H29.642H29.6751H29.6581ZM25.243 54.8639H25.2761H25.26H25.243ZM25.1651 54.8579H25.1931H25.173H25.1651ZM29.7451 54.8579H29.725H29.753H29.7451ZM29.9191 54.8419H29.9111H29.93H29.9191ZM24.9881 54.8419H25.007H24.9921H24.9881ZM23.1711 54.6179C16.3451 53.5381 10.1772 49.9244 5.89803 44.4978C1.61883 39.0712 -0.457074 32.2307 0.0845082 25.3411C0.62609 18.4516 3.74533 12.0195 8.81989 7.32814C13.8945 2.63683 20.5512 0.03125 27.462 0.03125C34.3729 0.03125 41.0296 2.63683 46.1042 7.32814C51.1788 12.0195 54.298 18.4516 54.8396 25.3411C55.3812 32.2307 53.3053 39.0712 49.0261 44.4978C44.7469 49.9244 38.579 53.5381 31.753 54.6179V35.3999H38.1531L39.3711 27.4619H31.7551V22.3099C31.7551 20.1379 32.8191 18.0209 36.2301 18.0209H39.6931V11.2639C37.6599 10.9356 35.6054 10.7565 33.5461 10.7279C27.2731 10.7279 23.173 14.5279 23.173 21.4119V27.4619H16.2021V35.3999H23.1751L23.1711 54.6179Z" fill="#01AEE6" />
                  </svg>
                </a>
                <a target="_blank" href="https://www.instagram.com/tekie.in" className={'signup-page-socialMediaIcon'}>
                  <svg width="100%" height="100%" viewBox="0 0 56 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.8" fill-rule="evenodd" clip-rule="evenodd" d="M28.3878 0C33.8193 0 39.1287 1.61062 43.6449 4.62818C48.161 7.64574 51.6808 11.9347 53.7594 16.9527C55.8379 21.9708 56.3817 27.4925 55.3221 32.8196C54.2625 38.1467 51.647 43.0399 47.8063 46.8806C43.9657 50.7212 39.0725 53.3367 33.7453 54.3963C28.4182 55.456 22.8966 54.9121 17.8785 52.8336C12.8605 50.755 8.57153 47.2352 5.55396 42.7191C2.5364 38.203 0.925781 32.8935 0.925781 27.462C0.929226 20.1797 3.82364 13.1966 8.97302 8.04724C14.1224 2.89786 21.1055 0.00344487 28.3878 0V0ZM28.3878 10.3C23.7268 10.3 23.1418 10.32 21.3108 10.4C19.8869 10.4293 18.4783 10.6998 17.1448 11.2C16.0046 11.641 14.969 12.3153 14.1046 13.1798C13.2401 14.0443 12.5658 15.0798 12.1248 16.22C11.6246 17.5535 11.3541 18.9621 11.3248 20.386C11.2418 22.217 11.2248 22.801 11.2248 27.463C11.2248 32.125 11.2448 32.709 11.3248 34.54C11.3541 35.9639 11.6246 37.3725 12.1248 38.706C12.5658 39.8462 13.2401 40.8817 14.1046 41.7462C14.969 42.6107 16.0046 43.285 17.1448 43.726C18.4783 44.2262 19.8869 44.4967 21.3108 44.526C23.1418 44.61 23.7258 44.626 28.3878 44.626C33.0498 44.626 33.6338 44.606 35.4648 44.526C36.8887 44.4967 38.2973 44.2262 39.6308 43.726C40.771 43.285 41.8065 42.6107 42.671 41.7462C43.5354 40.8817 44.2098 39.8462 44.6508 38.706C45.151 37.3725 45.4215 35.9639 45.4508 34.54C45.5348 32.709 45.5508 32.125 45.5508 27.463C45.5508 22.801 45.5308 22.217 45.4508 20.386C45.4215 18.9621 45.151 17.5535 44.6508 16.22C44.2092 15.0793 43.5341 14.0435 42.6688 13.179C41.8034 12.3145 40.7669 11.6404 39.6258 11.2C38.2923 10.6998 36.8837 10.4293 35.4598 10.4C33.6338 10.318 33.0488 10.3 28.3878 10.3ZM28.3878 13.393C32.9708 13.393 33.5138 13.41 35.3238 13.493C36.4121 13.506 37.4901 13.7059 38.5108 14.084C39.2509 14.3695 39.923 14.8069 40.484 15.3678C41.0449 15.9287 41.4822 16.6009 41.7678 17.341C42.146 18.3616 42.3459 19.4396 42.3588 20.528C42.4418 22.338 42.4588 22.881 42.4588 27.464C42.4588 32.047 42.4418 32.59 42.3588 34.4C42.3459 35.4884 42.146 36.5664 41.7678 37.587C41.4822 38.3271 41.0449 38.9993 40.484 39.5602C39.923 40.1211 39.2509 40.5585 38.5108 40.844C37.4902 41.2222 36.4121 41.4221 35.3238 41.435C33.5138 41.518 32.9718 41.535 28.3878 41.535C23.8038 41.535 23.2618 41.518 21.4518 41.435C20.3634 41.4221 19.2854 41.2222 18.2648 40.844C17.5247 40.5585 16.8525 40.1211 16.2916 39.5602C15.7306 38.9993 15.2933 38.3271 15.0078 37.587C14.6297 36.5664 14.4298 35.4883 14.4168 34.4C14.3338 32.59 14.3168 32.047 14.3168 27.464C14.3168 22.881 14.3338 22.338 14.4168 20.528C14.4298 19.4397 14.6297 18.3616 15.0078 17.341C15.2933 16.6009 15.7306 15.9287 16.2916 15.3678C16.8525 14.8069 17.5247 14.3695 18.2648 14.084C19.2854 13.7059 20.3634 13.506 21.4518 13.493C23.2618 13.408 23.8048 13.391 28.3878 13.391V13.393ZM28.3878 18.65C26.6445 18.65 24.9404 19.1669 23.491 20.1354C22.0415 21.1039 20.9118 22.4805 20.2447 24.091C19.5776 25.7016 19.403 27.4738 19.7431 29.1835C20.0832 30.8933 20.9227 32.4638 22.1553 33.6964C23.388 34.9291 24.9585 35.7686 26.6683 36.1086C28.378 36.4487 30.1502 36.2742 31.7608 35.6071C33.3713 34.94 34.7479 33.8103 35.7164 32.3608C36.6848 30.9113 37.2018 29.2072 37.2018 27.464C37.2018 25.1264 36.2732 22.8845 34.6202 21.2316C32.9673 19.5786 30.7254 18.65 28.3878 18.65ZM28.3878 33.185C26.8705 33.185 25.4153 32.5823 24.3424 31.5094C23.2695 30.4365 22.6668 28.9813 22.6668 27.464C22.6668 25.9467 23.2695 24.4915 24.3424 23.4186C25.4153 22.3457 26.8705 21.743 28.3878 21.743C29.7618 21.7535 31.088 22.2493 32.1318 23.143C32.758 23.6753 33.2597 24.3386 33.6013 25.0862C33.943 25.8337 34.1162 26.6471 34.1088 27.469C34.1069 28.9851 33.5034 30.4385 32.4307 31.5098C31.358 32.5812 29.9039 33.183 28.3878 33.183V33.185ZM39.6088 18.3C39.6088 18.7074 39.488 19.1057 39.2616 19.4445C39.0353 19.7832 38.7135 20.0473 38.3371 20.2032C37.9607 20.3591 37.5465 20.3999 37.1469 20.3204C36.7473 20.2409 36.3802 20.0447 36.0921 19.7566C35.804 19.4685 35.6078 19.1015 35.5284 18.7019C35.4489 18.3023 35.4897 17.8881 35.6456 17.5117C35.8015 17.1353 36.0655 16.8135 36.4043 16.5872C36.7431 16.3608 37.1414 16.24 37.5488 16.24C38.0951 16.24 38.6191 16.457 39.0054 16.8434C39.3917 17.2297 39.6088 17.7537 39.6088 18.3Z" fill="#01AEE6" />
                  </svg>
                </a>
                <a target="_blank" href="https://www.linkedin.com/company/tekie/" className={'signup-page-socialMediaIcon'}>
                  <svg width="100%" height="100%" viewBox="0 0 56 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.8" fill-rule="evenodd" clip-rule="evenodd" d="M28.3097 0C33.7411 0 39.0506 1.61062 43.5667 4.62818C48.0828 7.64574 51.6027 11.9347 53.6812 16.9527C55.7598 21.9708 56.3036 27.4925 55.244 32.8196C54.1844 38.1467 51.5689 43.0399 47.7282 46.8806C43.8876 50.7212 38.9943 53.3367 33.6672 54.3963C28.3401 55.456 22.8184 54.9121 17.8004 52.8336C12.7824 50.755 8.4934 47.2352 5.47584 42.7191C2.45827 38.203 0.847656 32.8935 0.847656 27.462C0.851101 20.1797 3.74552 13.1966 8.89489 8.04724C14.0443 2.89786 21.0273 0.00344487 28.3097 0ZM19.7237 42.9V21.449H12.5937V42.9H19.7237ZM45.4237 42.9V30.6C45.4237 24.013 41.9067 20.948 37.2167 20.948C35.9246 20.8953 34.6428 21.1975 33.5103 21.8217C32.3778 22.4459 31.438 23.3684 30.7927 24.489V21.449H23.6687C23.7637 23.461 23.6687 42.895 23.6687 42.895H30.7967V30.918C30.769 30.3286 30.8486 29.739 31.0317 29.178C31.2982 28.4195 31.7926 27.7619 32.4472 27.2953C33.1019 26.8286 33.8847 26.5756 34.6887 26.571C37.2667 26.571 38.2997 28.538 38.2997 31.42V42.9H45.4237ZM16.2067 11.108C15.6974 11.0637 15.1845 11.1249 14.7 11.2879C14.2155 11.4508 13.7698 11.712 13.3908 12.055C13.0118 12.398 12.7077 12.8156 12.4974 13.2815C12.2872 13.7474 12.1753 14.2517 12.1688 14.7629C12.1623 15.274 12.2614 15.781 12.4597 16.2521C12.6581 16.7232 12.9516 17.1483 13.3217 17.5009C13.6919 17.8534 14.1308 18.1258 14.611 18.301C15.0912 18.4762 15.6024 18.5504 16.1127 18.519H16.1587C16.6695 18.5625 17.1838 18.4998 17.6692 18.3349C18.1546 18.1701 18.6007 17.9066 18.9794 17.561C19.358 17.2154 19.6612 16.7952 19.8696 16.3269C20.0781 15.8585 20.1874 15.3521 20.1907 14.8395C20.1941 14.3268 20.0913 13.819 19.8889 13.348C19.6865 12.877 19.3889 12.4529 19.0147 12.1025C18.6405 11.752 18.1979 11.4828 17.7147 11.3116C17.2314 11.1405 16.718 11.0712 16.2067 11.108Z" fill="#01AEE6" />
                  </svg>
                </a>
                <a target="_blank" href="https://www.youtube.com/channel/UCCr7GPlTdZRXFEfveeuKcbg" className={'signup-page-socialMediaIcon'} style={{ marginRight: 0 }}>
                  <svg width="100%" height="100%" viewBox="0 0 56 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.8" fill-rule="evenodd" clip-rule="evenodd" d="M28.2354 0C33.6669 0 38.9764 1.61062 43.4925 4.62818C48.0086 7.64574 51.5285 11.9347 53.607 16.9527C55.6856 21.9708 56.2294 27.4925 55.1698 32.8196C54.1101 38.1467 51.4946 43.0399 47.654 46.8806C43.8134 50.7212 38.9201 53.3367 33.593 54.3963C28.2659 55.456 22.7442 54.9121 17.7262 52.8336C12.7082 50.755 8.41918 47.2352 5.40162 42.7191C2.38406 38.203 0.773438 32.8935 0.773438 27.462C0.776882 20.1797 3.6713 13.1966 8.82068 8.04724C13.9701 2.89786 20.9531 0.00344487 28.2354 0V0ZM44.6814 19.2C44.4857 18.4726 44.1023 17.8094 43.5697 17.2767C43.037 16.7441 42.3738 16.3607 41.6464 16.165C38.9694 15.448 28.2344 15.448 28.2344 15.448C28.2344 15.448 17.5004 15.448 14.8224 16.165C14.0952 16.3609 13.4322 16.7443 12.8998 17.277C12.3673 17.8096 11.9841 18.4727 11.7884 19.2C11.2938 21.9261 11.0538 24.6924 11.0714 27.463C11.0538 30.2333 11.2938 32.9992 11.7884 35.725C11.9842 36.4524 12.3675 37.1156 12.9002 37.6483C13.4328 38.1809 14.096 38.5643 14.8234 38.76C17.5004 39.477 28.2354 39.477 28.2354 39.477C28.2354 39.477 38.9694 39.477 41.6474 38.76C42.3748 38.5643 43.0381 38.1809 43.5707 37.6483C44.1033 37.1156 44.4867 36.4524 44.6824 35.725C45.1771 32.9992 45.4171 30.2333 45.3994 27.463C45.4171 24.6924 45.1771 21.9261 44.6824 19.2H44.6814ZM24.8024 32.611V22.311L33.7204 27.46L24.8024 32.611Z" fill="#01AEE6" />
                  </svg>
                </a>
              </div>
              <div className={'signup-page-footerText'}>© 2020, Kiwhode Learning Pvt Ltd. All Rights Reserved.</div>
            </div>
          </div>

          <motion.div
            initial={{
              opacity: isSignin ? 1 : 0
            }}
            animate={{
              opacity: isSignin ? 1 : 0
            }}
            style={{
              pointerEvents: isSignin ? 'auto' : 'none'
            }}
          >
            <Login
              shouldRedirect
              visible={isSignin}
              prompt={e => {
                getToasterBasedOnType(failureToasterProps(e, true))
              }}
            />
          </motion.div>
        </div>
      </>
    )
  }
}

export default connect((state) => ({
  isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
    state.data.getIn(['userChildren', 'data']).size,
  userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
  userRole: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'role'], false),
  userSource: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'parent', 'source'], ''),
  error: state.data.getIn([
    'errors', 'user/fetch', -1, 'error', 'errors', 0, 'message']),
  ...signUpMentee().mapStateToProps()
}))(withRouter(Signup))
