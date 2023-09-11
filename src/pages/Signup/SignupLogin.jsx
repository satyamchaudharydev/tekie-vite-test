/* eslint-disable */
import React, { Component } from 'react'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import Helmet from 'react-helmet'
import { List, fromJS, Map } from 'immutable'
import gql from 'graphql-tag'
import { get, sortBy, uniq, uniqBy } from 'lodash'
import cx from 'classnames'
import qs from 'query-string'
import duck from '../../duck'
import { Redirect } from 'react-router-dom'
import BOOK_CAMPAIGN_SESSION from './bookCampaignSession'
import getSlotLabel from '../../utils/slots/slot-label'
import { connect } from 'react-redux'
import { Button, Input, OTPInput, PhoneInput, PasswordInput } from '../../photon'
import './SignupLogin.scss'
import '../../photon/photon.scss'
import { getToasterBasedOnType, Toaster } from '../../components/Toaster'
import CloseIcon from '../../assets/SchoolDashboard/icons/CloseIcon'
import GoogleIcon from './svg/google.js'
import IntelIcon from './svg/intel.js'
import MicrosoftIcon from './svg/microsoft.js'
import AmazonIcon from './svg/amazon.js'
import HarvardIcon from './svg/harvard'
import requestToGraphql from '../../utils/requestToGraphql'
import validateUserOTP from '../../queries/validateUserOTP'
import { filterKey, pickOne } from '../../utils/data-utils'
import { motion } from 'framer-motion'
import { withRouter } from 'react-router'
import getCountryCode from '../../utils/getCountryCode'
import getCountry, { getCity } from '../../utils/getCountry'
import signUpMentee from '../../queries/signUpMentee'
import updateMentee from '../../queries/updateMentee'
import getPath from '../../utils/getPath'
import extractSubdomain from '../../utils/extractSubdomain'
import Select from 'react-select'
import { Link } from 'react-router-dom'
import moment from 'moment'
import store from '../../store'
import getAuthToken from '../../utils/getAuthToken'
import { getCourseString } from '../../utils/getCourseId'
import loginViaPassword from '../../queries/loginViaPassword'
import isSchoolWebsite from '../../utils/isSchoolWebsite'
import slugifyContent from '../../utils/slugifyContent'
import { isSubDomainActive } from '../../utils/extractSubdomain'
import config from '../../config'
import SimpleButtonLoader from '../../components/SimpleButtonLoader'
import { hs } from '../../utils/size'
import Lottie from 'react-lottie'
import loginLoader from '../../assets/animations/loginLoader.json'
import ChatWidget from '../../components/ChatWidget/ChatWidget'
import renderChats from '../../utils/getChatTags'
import utmParamsAction from '../../utils/utmParameterAction'
import getDeviceInfo from '../../utils/getDeviceInfo'
import classNames from '../SwitchAccount/SwitchAccount.module.scss'
import isMobile from '../../utils/isMobile'
import registerUserForEvent from '../../queries/registerUserForEvent'
import CarouselBtns from './components/CarouselBtns'
import { SignupCarousel, SignupCarouselItem } from './components/SignupCarousel'
import { eventSchoolList } from '../../config'
import getSelectColorStyles from './components/schoolsStyles'
import UserWaitListModal from '../../components/UserWaitListModal/UserWaitListModal'
import fetchSchoolDetails from '../../queries/fetchSchoolDetails'
import SchoolLiveClassLogin from './schoolLiveClassLogin/SchoolLiveClassLogin'
import LoadingSpinner from '../TeacherApp/components/Loader/LoadingSpinner'
import Footer from './schoolLiveClassLogin/components/Footer/Footer';
import bgImage from '../../assets/wizard-background.png';
import spinnerLoader from '../../pages/TeacherApp/constants/lottie/spinnerLoader.json'
import { appSubdomains } from '../../constants';
import redirectByUserType from '../../utils/redirectByUserType'

const avatars = [
  require('../../assets/avatarsSVG/coolDrop.svg'),
  require('../../assets/avatarsSVG/oldDrop.svg'),
  require('../../assets/avatarsSVG/capDrop.svg'),
  require('../../assets/avatarsSVG/normalDrop.svg'),
]
const variants = {
  profile: {
    rest: {
      boxShadow: '0px 6px 10px 0px rgba(0,173,230,0.49)',
    },
    hover: {
      boxShadow: '0px 10px 15px 0px rgba(0,173,230,0.6)',
    }
  },
  avatar: {
    rest: {
      y: 9
    },
    hover: {
      y: 10
    }
  }
}

const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
const emailRegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const otpValidation = Yup.object().shape({
  otp: Yup.string()
    .trim()
    .required('OTP is Required')
    .max(4, 'OTP cannot be more than 4 digits ')
    .min(4, 'OTP cannot be less than 4 digits '),
})
const passwordValidation = Yup.object().shape({
  password: Yup.string()
    .trim()
    .required('Password is required')
})

const studentAndParentName = {
  studentName: Yup.string()
    .trim()
    .min(3, 'Name cannot be less than 3 letters')
    .max(30, 'Name cannot be more than 30 letters')
    .required('Student Name is required'),
  parentName: Yup.string()
    .trim()
    .min(3, 'Name cannot be less than 3 letters')
    .max(30, 'Name cannot be more than 30 letters')
    .required('Parent Name is required'),
}

const formValidation = {
  b2CFormEmail: {
    ...studentAndParentName,
    email: Yup.string()
      .email('Invalid email')
      .trim()
      .required('Email is required'),
  },
  b2CFormPhone: {
    ...studentAndParentName,
    phone: Yup.string()
      .trim()
      .required('Phone Number is required')
      .matches(phoneRegExp, 'Phone number is not valid')
  },
  b2bFormPartA: {
    studentName: Yup.string()
      .trim()
      .min(3, 'Name cannot be less than 3 letters')
      .max(30, 'Name cannot be more than 30 letters')
      .required('Student Name is required'),
    section: Yup.string('Section is required')
      .required()
  },
  b2bFormEmailPartB: {
    parentName: Yup.string()
      .trim()
      .min(3, 'Name cannot be less than 3 letters')
      .max(30, 'Name cannot be more than 30 letters')
      .required('Name Name* is required'),
    email: Yup.string()
      .email('Invalid email')
      .trim()
      .required('Email* is required'),
  },
  b2bFormPhonePartB: {
    parentName: Yup.string()
      .trim()
      .min(3, 'Name cannot be less than 3 letters')
      .max(30, 'Name cannot be more than 30 letters')
      .required('Name Name* is required'),
    phone: Yup.string()
      .trim()
      .required('Phone Number is required')
      .matches(phoneRegExp, 'Phone number is not valid')
  },
}

const failureToasterProps = e => {
  if (e && e.includes('Daily OTP limit exceeded, please contact support.')) {
    if (window.fcWidget) {
      window.fcWidget.open({ name: "Inbox" })
    }
  }
  if (e && e.includes('One or more records sent in Connect are not present in db')) {
    return {
      type: 'info',
      message: 'Please select a child to register',
      autoClose: 4000
    }
  }
  if (e && e.includes('Child is already registered for event')) {
    return {
      type: 'info',
      message: e,
      autoClose: 4000
    }
  }
  return {
    type: 'error',
    message: e,
    autoClose: 4000
  }
}

const getPageLoading = () => {
  if (typeof window !== 'undefined') {
    const params = qs.parse(window.location.search)
    if (params.code || params.schoolCode) {
      return {
        pageLoading: true
      }
    }
    return {
      pageLoading: false
    }
  }
  return {
    pageLoading: false
  }
}


const getTimeLabel = (slot, data) => {
  const slotArray = slot.split(' ')
  if (slotArray.length === 2) {
    return `${slotArray[0]}:00 ${slotArray[1].toUpperCase()}`
  }
}

class SignupLogin extends Component {
  state = {
    loading: false,
    otp: '',
    phone: '',
    countryCode: '91',
    password: '',
    email: '',
    studentName: '',
    parentName: '',
    grades: ['Grade1', 'Grade2', 'Grade3', 'Grade4', 'Grade5', 'Grade6', 'Grade7', 'Grade8', 'Grade9'],
    gradesSectionObject: {},
    grade: 'Grade1',
    loginUsing: 'email', // ['email', 'phone']
    campaign: {},
    sections: [],
    courseString: '',
    slots: [],
    selectedDate: '',
    firstMount: true,
    selectedTime: '',
    isEmailDisabled: false,
    isPhoneDisabled: false,
    schoolCampaignFlow: false,
    showBuddyLoginLoader: false,
    introSlide: true,
    totalCalenderPages: 1,
    currentPage: 1,
    section: '',
    initGrade: false,
    allCampaigns: [],
    progressBar: [
      { id: 0, title: 'Setup Account', active: true },
      { id: 1, title: 'Enter Details', active: false }
    ],
    currentFlow: 'b2c',
    currentScreen: 'loginSignup',
    // currentScreen: 'multipleChild',
    shouldProgressBar: false,
    batchId: null,
    schoolId: null,
    screenPosition: {
      'loginSignup': '0%',
      'otpScreen': '100%',
      'studentDetail': '100%',
      'multipleChild': '100%',
      'postOTPScreen': '100%',
      'postStudentDetail': '100%',
      'slotBooking': '100%',
    },
    user: {},
    ...getPageLoading(),
    loginViaLinkLoader: false,
    count: 0,
    'studentDetail': '0%',
    school: {
      value: '',
      label: ''
    },
    schoolName: '',
    schoolNameError: '',
    redirectTo: '',
    openWaitListModal: false
  }

  screens = {
    b2c: {
      phone: [
        'loginSignup',
        'otpScreen',
        'studentDetail',
      ],
      email: [
        'loginSignup',
        'otpScreen',
        'studentDetail',
        'postOTPScreen'
      ],
    },
    b2b: {
      phone: [
        'loginSignup',
        'otpScreen',
        'studentDetail',
        'postStudentDetail',
        'slotBooking'
      ],
      email: [
        'loginSignup',
        'otpScreen',
        'studentDetail',
        'postStudentDetail',
        'postOTPScreen',
        'slotBooking'
      ]
    },
    b2b2c: {
      phone: [
        'loginSignup',
        'otpScreen',
        'studentDetail',
        'slotBooking'
      ],
      email: [
        'loginSignup',
        'otpScreen',
        'studentDetail',
        'postOTPScreen',
        'slotBooking'
      ]
    }
  }

  getScreenPosition = (screen, currentScreen = this.state.currentScreen) => {
    const { currentFlow, loginUsing } = this.state
    const screens = this.screens[currentFlow][loginUsing]
    const screenPosition = screens.indexOf(screen)
    const currentScreenPosition = screens.indexOf(currentScreen)
    if (currentScreenPosition === screenPosition) {
      return '0%'
    }
    if (currentScreenPosition > screenPosition) {
      return '-100%'
    }
    return '100%'
  }

  async componentDidMount() {
    const params = qs.parse(window.location.search)
    if (params.code) {
      this.fetchCampaign(params.code)
    } else if (params.schoolCode) {
      this.fetchSchoolCampaign(params.schoolCode)
    } else {
      this.setState({ grade: 'Grade6' })
    }

    const query = qs.parse(window.location.search)
    const linkToken = get(query, 'authToken')
    const isLeadLogin = get(query, 'isLeadLogin')
    const loginDate = get(query, 'date')
    const batchId = get(query, 'batchId')
    const schoolId = get(query, 'schoolId')
    const schoolCode = extractSubdomain()
    if (schoolCode && isSubDomainActive && !appSubdomains.includes(schoolCode)) {
      try {
        this.setState({ showBuddyLoginLoader: true })
        await fetchSchoolDetails(schoolCode)
        this.setState({ showBuddyLoginLoader: false })
      } catch (err) {
        console.log(err)
        this.setState({ showBuddyLoginLoader: false })
      }
    }
    if (batchId || schoolId) {
      if (!batchId) {
        this.props.history.push('/login')
      }
      if (!schoolId) {
        this.props.history.push('/login')
      }
      if (batchId && schoolId) this.fetchSchoolDetails(schoolId, batchId)
    }
    if (linkToken) {
      this.setState({
        loginViaLinkLoader: true,
      })
      await validateUserOTP({
        linkToken,
        validateMagicLink: true,
      }, import.meta.env.REACT_APP_NODE_ENV === 'staging', 'validateOTP', () => {
        this.props.history.push('/switch-account')
      }).call()
      this.setState({
        loginViaLinkLoader: false
      })
      if (isLeadLogin) {
        localStorage.setItem('isLeadLogin', isLeadLogin)
      }
      if (loginDate) {
        localStorage.setItem('date', loginDate)
      }
      if (get(query, 'redirectTo')) {
        const routesToredirect = get(query, 'redirectTo').split(window.location.host)
        if (routesToredirect.length) {
          this.setState({
            redirectTo: routesToredirect[1]
          })
        }
      }
      this.actionAfterOtpValidation()
    }
    utmParamsAction()
    if (window && window.fcWidget) {
      window.fcWidget.show()
    }
  }

  fetchSchoolDetails = async (schoolId, batchId) => {
    try {
      const res = await requestToGraphql(gql`
        {
          getSchoolAndBatchDetail(
            schoolId: "${schoolId}",
            batchId: "${batchId}"
          ) {
            batchId
            schoolId
            batchClasses {
              grade
              section
            }
          }
        }
      `)
      const fetchedBatchId = get(res, 'data.getSchoolAndBatchDetail.batchId')
      const fetchedSchoolId = get(res, 'data.getSchoolAndBatchDetail.schoolId')
      const batchClasses = get(res, 'data.getSchoolAndBatchDetail.batchClasses')
      const gradesSectionObject = {}
      batchClasses.forEach(o => {
        if (gradesSectionObject.hasOwnProperty(o.grade)) {
          gradesSectionObject[o.grade].push(o.section)
        } else {
          gradesSectionObject[o.grade] = [o.section]
        }
      })
      if (Object.keys(gradesSectionObject).length) {
        this.setState({
          batchId: fetchedBatchId,
          schoolId: fetchedSchoolId,
          gradesSectionObject: gradesSectionObject,
          grade: Object.keys(gradesSectionObject)[0],
          section: {
            value: gradesSectionObject[Object.keys(gradesSectionObject)[0]][0],
            label: gradesSectionObject[Object.keys(gradesSectionObject)[0]][0]
          }
        })
      } else {
        getToasterBasedOnType(failureToasterProps('No Grade available', true))
        this.props.history.push('/login')
      }
    } catch (e) {
      if (get(e, 'errors[0].message') === 'Database record not found') {
        getToasterBasedOnType(failureToasterProps('No school and batch exist with given ID`s', true))
      } else {
        getToasterBasedOnType(failureToasterProps(get(e, 'errors[0].message'), true))
      }
      this.props.history.push('/login')
      this.setState({
        pageLoading: false
      })
    }

  }
  async componentDidUpdate(prevProps, prevState) {
    let { studentProfileIdConnect } = this.props

    studentProfileIdConnect = studentProfileIdConnect && studentProfileIdConnect.toJS()

    let { studentProfileIdConnect: prevStudentProfileIdConnect } = prevProps

    prevStudentProfileIdConnect = prevStudentProfileIdConnect && prevStudentProfileIdConnect.toJS()
    if ((get(studentProfileIdConnect, 'studentProfile.id') !== get(prevStudentProfileIdConnect, 'studentProfile.id')
      && this.props.registerationForEvent && get(studentProfileIdConnect, 'studentProfile.id'))) {
      const { eventId } = this.props.match.params
      const childConnectId = studentProfileIdConnect && get(studentProfileIdConnect, 'studentProfile.id')
      await registerUserForEvent(eventId || this.props.eventId, childConnectId)
    }
    if (this.props.hasUpdatedEvent && this.props.hasUpdatedEvent !== prevProps.hasUpdatedEvent) {
      this.props.showCongrat()
    }
    const params = qs.parse(window.location.search)
    if (this.state.currentScreen !== prevState.currentScreen) {
      this.setState({
        screenPosition: {
          ...this.state.screenPosition,
          [this.state.currentScreen]: '0%',
          [prevState.currentScreen]: this.getScreenPosition(prevState.currentScreen)
        },
        firstMount: false
      })
      if (this.state.currentScreen === 'slotBooking' || this.state.currentScreen === 'otpScreen' || this.state.currentScreen === 'postOTPScreen') {
        this.setState({ user: this.props.loggedInUser.toJS(), courseString: getCourseString() })
        store.dispatch({
          type: `user/delete/success`,
          autoReducer: true,
          payload: fromJS({
            extractedData: {
              user: {
                id: this.props.userId
              }
            }
          }),
          key: 'loggedinUser'
        })
      }
    }
    if (this.state.grade !== prevState.grade) {
      this.setSection()
    }

    if (
      (prevState.phone !== this.state.phone) ||
      (prevState.email !== this.state.email)
    ) {
      const { phone: phoneWithCountryCode, countryCode } = this.state
      const phone = phoneWithCountryCode.trim().replace(countryCode, '')
      if (phone.length === 0 && this.state.email.length === 0) {
        this.setState({
          isEmailDisabled: false,
          isPhoneDisabled: false,
        })
      } else if (phone.length === 0) {
        this.setState({
          isPhoneDisabled: true,
        })
      } else if (this.state.email.length === 0) {
        this.setState({
          isEmailDisabled: true,
        })
      }
    }

    if (this.props.otpFailure && !prevProps.otpFailure) {
      if (this.props.error) {
        if (this.props.error.includes('Database record not found')) {
          getToasterBasedOnType(failureToasterProps('User not found', true))
        } else {
          getToasterBasedOnType(failureToasterProps(this.props.error, true))
        }
        const query = qs.parse(window.location.search)
        const linkToken = get(query, 'authToken')
        if (linkToken) {
          if (get(this.props, 'isSubDomainActive', false) || isSchoolWebsite()) {
            this.props.history.push('/')
          } else {
            this.props.history.push('/login')
          }
        }
      }
      this.setState({ loading: false })
    }

    if (this.props.userStatus.get('failure') && !prevProps.userStatus.get('failure')) {
      if (this.props.error) {
        if (this.props.error.includes('Database record not found')) {
          getToasterBasedOnType(failureToasterProps('User not found', true))
        } else {
          getToasterBasedOnType(failureToasterProps(this.props.error, true))
        }
      }
      this.setState({ loading: false })
    }

    if (this.state.grade !== prevState.grade) {
      this.setSection()
    }

    if (window && window.fcWidget) {
      window.fcWidget.on("widget:opened", () => {
        renderChats({
          isLoggedIn: false,
        })
      })
    }
  }

  getGrade() {
    if (this.state.grade && this.state.grade.value) {
      return this.state.grade.value
    }
    return this.state.grade
  }


  setSection() {
    const params = qs.parse(window.location.search)
    const classes = get(this.state.campaign, 'classes', []).filter(classRoom => classRoom.grade === this.getGrade())
    const sections = sortBy(uniq(classes.map(classRoom => get(classRoom, 'section'))), [])
    let section = ''


    if (sections.includes(section) && !this.state.initGrade && params.section) {
      section = ''
    }
    const { batchId, schoolId, gradesSectionObject } = this.state
    if (batchId && schoolId && Object.keys(gradesSectionObject).length) {
      section = {
        value: gradesSectionObject[Object.keys(gradesSectionObject)[0]][0],
        label: gradesSectionObject[Object.keys(gradesSectionObject)[0]][0]
      }
    }
    this.setState({ sections: sections, section })
  }

  nextScreen() {
    const { currentFlow, currentScreen, loginUsing } = this.state
    const screens = this.screens[currentFlow][loginUsing]
    const nextScreen = screens[screens.indexOf(currentScreen) + 1]
    if (nextScreen === 'studentDetail' || nextScreen === 'postStudentDetail') {
      this.setState({ currentScreen: 'loginSignup', openWaitListModal: true })
      getToasterBasedOnType(failureToasterProps('User not found', true))
    } else this.setState({ currentScreen: nextScreen })
  }

  fetchCampaign = async (code) => {
    try {
      const res = await requestToGraphql(gql`
        {
          getCampaignSlots(input:{
            code: "${code}"
          }){
            id
            title
            whiteLabel
            slots{
              bookingDate
              slot0
              slot1
              slot2
              slot3
              slot4
              slot5
              slot6
              slot7
              slot8
              slot9
              slot10
              slot11
              slot12
              slot13
              slot14
              slot15
              slot16
              slot17
              slot18
              slot19
              slot20
              slot21
              slot22
              slot23
              showSlot
            }
            schoolName
            schoolLogo{
              uri
            }
            classes {
              section
              grade
            }
            schoolId
            poster {
              uri
            }
            posterMobile {
              uri
            }
            type: campaignType
          }
        }
      `)
      this.setCampaign(get(res, 'data.getCampaignSlots', {}))
    } catch (e) {
      this.setState({
        pageLoading: false
      })
    }
  }

  setCampaign = (campaign, callback = () => { }, classesArg, shouldSetOnlyCampaign) => {
    const classes = classesArg ? classesArg : get(campaign, 'classes', [])
    const grades = sortBy(uniq(classes.map(classRoom => get(classRoom, 'grade'))), (grade) => {
      return Number(grade.replace('Grade', ''))
    })
    if (classes.length === 0) return;
    this.setSlots(get(campaign, 'slots', []))

    let grade = grades[0]
    const params = qs.parse(window.location.search)
    if (params.grade && grades.includes(params.grade)) {
      grade = params.grade
    }
    if (campaign.type === 'b2b2cEvent') {
      if (shouldSetOnlyCampaign) {
        this.setState({
          campaign,
          currentFlow: 'b2b2c',
          progressBar: [
            { id: 0, title: 'Setup Account', active: true },
            { id: 1, title: 'Enter Details', active: true },
            { id: 2, title: 'Schedule Session', active: false },
          ]
        }, callback)
      } else {
        this.setState({
          campaign,
          pageLoading: false,
          currentFlow: 'b2b2c',
          grades: grades,
          grade,
          progressBar: [
            { id: 0, title: 'Setup Account', active: true },
            { id: 1, title: 'Enter Details', active: true },
            { id: 2, title: 'Schedule Session', active: false },
          ]
        }, callback)
      }
    } else {
      if (shouldSetOnlyCampaign) {
        this.setState({
          campaign,
          currentFlow: 'b2b',
        }, callback)
      } else {
        this.setState({
          campaign,
          currentFlow: 'b2b',
          pageLoading: false,
          grades: grades,
          grade,
        }, callback)
      }
    }
  }

  fetchSchoolCampaign = async (schoolCode) => {
    try {
      const res = await requestToGraphql(gql`
        {
          getSchoolCampaignSlots(input:{
            schoolCode: "${schoolCode}"
          }){
            id
            title
            whiteLabel
            slots{
              bookingDate
              slot0
              slot1
              slot2
              slot3
              slot4
              slot5
              slot6
              slot7
              slot8
              slot9
              slot10
              slot11
              slot12
              slot13
              slot14
              slot15
              slot16
              slot17
              slot18
              slot19
              slot20
              slot21
              slot22
              slot23
              showSlot
            }
            schoolName
            schoolLogo{
              uri
            }
            classes {
              section
              grade
            }
            schoolId
            poster {
              uri
            }
            posterMobile {
              uri
            }
            type: campaignType
          }
        }
      `)
      const schoolCampaigns = get(res, 'data.getSchoolCampaignSlots', [])
      let campaign = get(schoolCampaigns, '[0]', {})

      // Merge Classes of all Schools
      const schoolClasses = [].concat(...schoolCampaigns.map(campaign => {
        return get(campaign, 'classes', [])
      }))

      const classes = uniqBy(schoolClasses, schoolClass => [schoolClass.section, schoolClass.grade].join());

      campaign = { ...campaign, classes }
      const grades = sortBy(uniq(classes.map(classRoom => get(classRoom, 'grade'))), (grade) => {
        return Number(grade.replace('Grade', ''))
      })
      if (classes.length === 0) return;
      this.setSlots(get(res, 'data.getCampaignSlots.slots', []))

      let grade = grades[0]
      const params = qs.parse(window.location.search)
      if (params.grade && grades.includes(params.grade)) {
        grade = params.grade
      }
      if (campaign.type === 'b2b2cEvent') {
        this.setState({
          campaign,
          allCampaigns: schoolCampaigns,
          schoolCampaignFlow: true,
          pageLoading: false,
          currentFlow: 'b2b2c',
          grades: grades,
          grade,
          progressBar: [
            { id: 0, title: 'Setup Account', active: true },
            { id: 1, title: 'Enter Details', active: false },
            { id: 2, title: 'Schedule Session', active: false },
          ]
        })
      } else {
        this.setState({
          campaign,
          currentFlow: 'b2b',
          allCampaigns: schoolCampaigns,
          schoolCampaignFlow: true,
          pageLoading: false,
          grades: grades,
          grade,
        })
      }
    } catch (e) {
      this.setState({
        pageLoading: false
      })
    }
  }

  setSlots = (slots, postCallback = () => { }) => {
    // TODO ADD MONTH AND YEAR CHECK
    // It will break if two same days of different month are there
    let openSlots = []
    for (const slot of slots) {
      const {
        bookingDate,
        showSlot,
        ...slotList
      } = slot
      const date = moment(get(slot, 'bookingDate')).date()
      const day = moment(get(slot, 'bookingDate')).calendar().split(" at")[0]
      const openSlot = Object.keys(slotList).find(s => slotList[s])
      const slotTime = Number(openSlot.replace('slot', ''));
      const time = getSlotLabel(Number(slotTime))

      const bookingDateMilliSecond = new Date(get(slot, 'bookingDate')).setHours(0, 0, 0, 0)
      const currentDateMilliSecond = new Date().setHours(0, 0, 0, 0)
      const currentHour = new Date().getHours()
      const isFutureSlot = (bookingDateMilliSecond === currentDateMilliSecond && currentHour < slotTime) || bookingDateMilliSecond > currentDateMilliSecond
      const isSlotLessThan2Hours = (bookingDateMilliSecond === currentDateMilliSecond && currentHour + 2 < slotTime) || bookingDateMilliSecond !== currentDateMilliSecond
      if (isFutureSlot && isSlotLessThan2Hours) {
        if (!openSlots.find(s => s.date === date)) {
          openSlots.push({
            date,
            day,
            bookingDate,
            slots: [
              {
                slotTime,
                time,
                showSlot
              }
            ],
          })
        } else {
          const dateToBePushed = openSlots.find(s => s.date === date)
          const doesSlotTimeExist = get(dateToBePushed, 'slots', []).find(slot => slot.slotTime === slotTime)
          if (!doesSlotTimeExist) {
            openSlots = openSlots.map(s => s.date === date ? ({
              ...s,
              slots: [
                ...s.slots,
                {
                  slotTime,
                  time,
                  showSlot
                }
              ]
            }) : s)
          }
        }
      }
    }
    this.setState({
      slots: sortBy(openSlots, ['date']).map(s => ({ ...s, slots: sortBy(s.slots, ['slotTime']) })),
      selectedDate: get(openSlots, '0.date', ''),
      totalCalenderPages: Math.floor(openSlots.length / 4) + 1,
      currentPage: 1
    }, () => {
      postCallback()
    })
  }
  componentWillUnmount = () => {
    if (window && window.fcWidget) {
      window.fcWidget.setFaqTags({
        tags: ['unregistered'],
        filterType: 'article'
      })
      window.fcWidget.hide()
    }
  }

  login = async (phone, countryCode, email = false, resend = false, callback = () => { }) => {
    try {
      this.setState({ loading: !resend, phone: phone, countryCode })
      let timezone = localStorage.getItem('timezone')
      let input = '';
      if (!phone && !emailRegExp.test(email.trim())) {
        input = `username: "${email.trim()}"`;
      } else {
        input = phone
          ? `phone: {
              countryCode: "+${countryCode}"
              number: "${phone.trim().replace(countryCode, '')}"
            }`
          : `email: "${email.trim()}"`
      }
      input += `\ncountry: "${getCountry()}"`
      input += `\ncity: "${getCity()}"`
      if (timezone) {
        input += `\ntimezone: "${timezone}"`
      }
      if (get(this.state.campaign, 'id')) {
        input += `\n`
        input += `campaignId: "${get(this.state.campaign, 'id')}"`
      }
      if ((['b2b2cEvent', 'b2b']).includes(get(this.state.campaign, 'type'), '') || isSchoolWebsite()) {
        input += `source: school\n`
      }
      if (localStorage.getItem('utm_source')) {
        input += `\nutmSource: "${localStorage.getItem('utm_source')}"`
      }
      if (localStorage.getItem('utm_campaign')) {
        input += `\nutmCampaign: "${localStorage.getItem('utm_campaign')}"`
      }
      if (localStorage.getItem('utm_term')) {
        input += `\nutmTerm: "${localStorage.getItem('utm_term')}"`
      }
      if (localStorage.getItem('utm_content')) {
        input += `\nutmContent: "${localStorage.getItem('utm_content')}"`
      }
      if (localStorage.getItem('utm_medium')) {
        input += `\nutmMedium: "${localStorage.getItem('utm_medium')}"`
      }
      const { eventId } = this.props.match.params
      if (this.props.registerationForEvent && eventId) {
        input += `\neventId: "${eventId}"`
      }
      if (isSchoolWebsite()) {
        input += `role: schoolAdmin\n`
        if (import.meta.env.REACT_APP_NODE_ENV === 'production') {
          let emailInput = email || ''
          let phoneInput = phone || ''
          fetch(`https://script.google.com/macros/s/AKfycbxcJLDIkZ4_J2G74R9pDnTCSUYXLU6hD4hYt6fQcjPweYWuYpeXzwft/exec?email=${emailInput}&phone=${phoneInput}`)
        }
      }
      const res = await requestToGraphql(gql`
        mutation {
          signupOrLoginViaOtp(input: {
            ${input}
          }) {
            result
          }
        }`, {}, null, 'appTokenOnly')
      if (resend) return;
      if (res) {
        callback()
        const result = get(res, 'data.signupOrLoginViaOtp.result')
        if (result) {
          if (email) {
            this.setState({ currentScreen: 'passwordScreen' })
          } else {
            this.nextScreen()
          }
        }
      }
      this.setState({ loading: false })
    } catch (e) {
      if (resend) return;
      if (e.errors && e.errors[0]) {
        if (e.errors[0].message.includes('Database record not found')) {
          if (get(this.props, 'isSubDomainActive', false)) {
            getToasterBasedOnType(failureToasterProps('User not found!', true))
            this.setState({ loading: false })
          } else if (isSchoolWebsite()) {
            this.props.history.push({
              pathname: `/signup-school`,
              state: {
                mailId: email.trim(),
                phone: {
                  number: phone.trim(),
                  countryCode: countryCode
                }
              },
            })
          } else {
            this.setState({
              shouldProgressBar: true,
            })
            this.setState({ currentScreen: 'loginSignup', openWaitListModal: true })
            getToasterBasedOnType(failureToasterProps('User not found', true))
            if (this.state.currentFlow === 'b2b2c') {
              this.setState({
                progressBar: [
                  { id: 0, title: 'Setup Account', active: true },
                  { id: 1, title: 'Enter Details', active: true },
                  { id: 2, title: 'Schedule Session', active: false },
                ]
              })
            } else {
              // this.setState({
              //   progressBar: [
              //     { id: 0, title: 'Setup Account', active: true },
              //     { id: 1, title: 'Enter Details', active: true }
              //   ]
              // })
            }
          }
        } else {
          getToasterBasedOnType(failureToasterProps(e.errors[0].message, true))
        }
        this.setState({ loading: false })
      }
    }
  }
  actionAfterOtpValidation = () => {
    if (get(this.props, 'isSubDomainActive', false) || isSchoolWebsite()) {
      this.afterOTPValidation()
    } else {
      const campaign = get(this.props.loggedInUser.toJS(), 'parent.parentProfile.user.campaign', {})
      const campaignType = get(campaign, 'type')
      if (campaignType === 'b2b2cEvent' || campaignType === 'b2b') {
        const classes = get(campaign, 'classes', [])
        const grades = sortBy(uniq(classes.map(classRoom => get(classRoom, 'grade'))), (grade) => {
          return Number(grade.replace('Grade', ''))
        })
        let grade = grades[0]
        const params = qs.parse(window.location.search)
        if (params.grade && grades.includes(Number(params.grade.replace('Grade', '')))) {
          grade = params.grade
        }
        this.setState({
          campaign: {
            id: get(campaign, 'id'),
            title: get(campaign, 'title'),
            slots: get(campaign, 'timeTableRules', []).map(fields => ({ ...fields, showSlot: true })),
            schoolName: get(campaign, 'school.name', ''),
            schoolId: get(campaign, 'school.id', ''),
            schoolLogo: get(campaign, 'school.logo', {}),
            classes: get(campaign, 'classes', []),
            poster: get(campaign, 'poster', {}),
            type: campaignType
          },
          currentFlow: campaignType.replace('Event', ''),
          grades: grades,
          grade,
          progressBar: [
            { id: 0, title: 'Setup Account', active: true },
            { id: 1, title: 'Enter Details', active: false },
            { id: 2, title: 'Schedule Session', active: false },
          ]
        }, () => {
          if (campaignType === 'b2b2cEvent') {
            this.setSlots(get(this.state.campaign, 'slots', []), () => {
              this.afterOTPValidation()
            })
          } else {
            this.afterOTPValidation()
          }
        })
      } else if (
        ['b2b2c', 'b2b'].includes(this.state.currentFlow) &&
        !(['b2b2cEvent', 'b2b'].includes(campaignType)) &&
        this.props.name && this.props.userId
      ) {
        this.setState({ currentFlow: 'b2c' }, () => {
          this.afterOTPValidation()
        })
      } else {
        this.afterOTPValidation()
      }
    }
  }
  validateOTP = async (otp) => {

    const { phone, countryCode, loginUsing, currentScreen, currentFlow } = this.state
    const { registerationForEvent } = this.props
    this.setState({ loading: true })
    const user = get(this.props.user.toJS(), '[0]', {})
    await validateUserOTP({
      phone: phone.replace(countryCode, '').trim(),
      otp: parseInt(otp.trim()),
      countryCode: '+' + countryCode.trim()
    }, import.meta.env.REACT_APP_NODE_ENV === 'staging', 'validateOTP', () => {
      if (!get(this.props, 'registerationForEvent')) {
        this.props.history.push('/switch-account')
      }
    }).call()
    this.actionAfterOtpValidation()
  }

  afterOTPValidation = async () => {
    if (this.props.otpSuccess) {
      if (this.props.name && this.state.currentFlow !== 'b2b2c') {
        if (this.props.userId) {

          duck.merge(() => ({
            user: {
              id: this.props.userId
            }
          }), { key: 'loggedinUser' })
        }
        if (this.props.registerationForEvent) {
          return
        }
        this.moveToSession()
      } else {
        if (get(this.props, 'isSubDomainActive', false)) {
          getToasterBasedOnType(failureToasterProps('No user found!', true))
          this.setState({ loading: false })
        } else if (isSchoolWebsite()) {
          const { phone, countryCode } = this.state
          if (import.meta.env.REACT_APP_NODE_ENV === 'production') {
            fetch(`https://script.google.com/macros/s/AKfycbxcJLDIkZ4_J2G74R9pDnTCSUYXLU6hD4hYt6fQcjPweYWuYpeXzwft/exec?phone=${phone}&phoneVerified=${true}`)
          }
          this.props.history.push({
            pathname: `/signup-school`,
            state: {
              phone: {
                number: phone.trim().replace(countryCode, ''),
                countryCode: countryCode
              }
            },
          })
        } else {
          if (this.state.currentFlow === 'b2b2c') {
            if (this.props.name && this.props.userId) {

              const batchId = get(this.props.loggedInUser, 'parentProfile.children[0].batch.id', {})
              if (batchId) {

                duck.merge(() => ({
                  user: {
                    id: this.props.userId
                  }
                }), { key: 'loggedinUser' })
                this.moveToSession()
              } else {

                this.setState({
                  progressBar: [
                    { id: 0, title: 'Setup Account', active: true },
                    { id: 1, title: 'Enter Details', active: true },
                    { id: 2, title: 'Schedule Session', active: true },
                  ],
                  shouldProgressBar: true
                })
                this.setState({ currentScreen: 'slotBooking' })
              }
            } else {

              this.setState({
                progressBar: [
                  { id: 0, title: 'Setup Account', active: true },
                  { id: 1, title: 'Enter Details', active: true },
                  { id: 2, title: 'Schedule Session', active: false },
                ],
                shouldProgressBar: true
              })
              this.nextScreen()
            }
          } else {
            this.setState({
              progressBar: [
                { id: 0, title: 'Setup Account', active: true },
                { id: 1, title: 'Enter Details', active: true }
              ],
              shouldProgressBar: true
            })
            if (this.props.registerationForEvent && get(this.props, 'userChildren', []).toJS().length >= 2) {
              this.setState({ currentScreen: 'multipleChild' })
            } else {
              this.nextScreen()
            }
          }
        }
      }
    }
    this.setState({ loading: false })
  }

  moveToSession = async (override = false) => {
    if (
      this.props.userRole === config.MENTOR &&
      this.props.userData.getIn([0, "secondaryRole"]) === config.SCHOOL_TEACHER &&
      !!this.props.userData.getIn([0, "schoolTeacher", "id"])) {
      this.props.history.push('/teacher/classrooms');
      return
    }
    if (get(this.props, "isSubDomainActive", false)) {
      if (
        this.props.userRole === config.SCHOOL_ADMIN &&
        !!this.props.userData.getIn([0, "schoolAdmin", "id"])
      ) {
        const schoolId =
          this.props.userData.getIn([0, "schools", 0, "id"]) || null;
        const schoolName =
          this.props.userData.getIn([0, "schools", 0, "name"]) || null;
        if (
          schoolName &&
          schoolId === get(this.props, "customAuthMethod.schoolDetails.id")
        ) {
          this.props.history.push(`/dashboard/${slugifyContent(schoolName)}`);
          window.location.reload();
        } else if (
          schoolId !== get(this.props, "customAuthMethod.schoolDetails.id")
        ) {
          getToasterBasedOnType(
            failureToasterProps("Unauthorized access", true)
          );
        } else {
          getToasterBasedOnType(failureToasterProps('No School Found', true));
        }
        this.setState({ loading: false });
        return null;
      } else if (this.props.userRole === config.MENTEE) {
        const user = this.props.loggedInUser.toJS();
        const currentChild = get(
          user,
          'parent.parentProfile.children',
          []
        ).find(
          (child) =>
            get(child, 'user.id') === this.props.loggedInUser.get('id')
        );
        const schoolId = get(currentChild, 'school.id');
        if (
          get(this.props, 'customAuthMethod.schoolDetails.id') !== schoolId
        ) {
          getToasterBasedOnType(
            failureToasterProps('Unauthorized access', true)
          );
          return null;
        }
      }
    }
    if (isSchoolWebsite()) {
      if (!!this.props.userData.getIn([0, 'schoolAdmin', 'id'])) {
        const schoolName = this.props.userData.getIn([0, 'schools', 0, 'name']) || null
        this.props.history.push(`/dashboard/${slugifyContent(schoolName)}`)
        window.location.reload();
      } else {
        this.setState({
          loading: false
        })
        getToasterBasedOnType(failureToasterProps('Unauthorized access', true))
      }
      return null
    } else {
      const user = this.props.loggedInUser.toJS()
      if (override) {

        if (get(user, 'id')) {
          duck.merge(() => ({
            user: {
              ...user,
              hasVerifiedOTP: true
            },
          }), { key: 'loggedinUser' })
        }
        if (this.props.userRole === 'mentee') {
          if (this.state.redirectTo) {
            return this.props.history.push(this.state.redirectTo)
          }
          const shouldRedirect = await redirectByUserType(user)
          if (!shouldRedirect) this.props.history.push('/sessions', { fromLogin: 'true' })
        } else {
          this.props.history.push('/learn')
        }
        return null
      }
      if (this.props.name) {
        if (this.props.userRole === 'mentee') {
          if (this.state.redirectTo) {
            return this.props.history.push(this.state.redirectTo)
          }
          const shouldRedirect = await redirectByUserType(user)
          if (!shouldRedirect) this.props.history.push('/sessions', { fromLogin: 'true' })
        } else {
          this.props.history.push('/learn')
        }
      }
    }
  }

  signUp = async ({
    parentName, email: parentEmail, countryCode, parentPhone, studentName
  }) => {
    const {
      section
    } = this.state
    const grade = this.state.grade.value ? this.state.grade.value : this.state.grade

    const prevUserId = this.props.userId
    const referralCode = sessionStorage.getItem('referralCode')
    const schoolName = sessionStorage.getItem('schoolName')
    const timezone = localStorage.getItem('timezone')
    const schoolId = this.state.currentFlow !== 'b2c' && get(this.state.campaign, 'schoolId')
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
    try {
      await signUpMentee({
        parentName: this.state.parentName.trim(),
        childName: this.state.studentName.trim(),
        parentEmail: this.state.email.trim(),
        parentPhone: {
          number: parentPhone.trim(),
          countryCode,
        },
        grade,
        ...(referralCode ? { referralCode } : {}),
        ...(section.value ? { section: section.value } : {}),
        ...(schoolName ? { schoolName } : {}),
        country: getCountry(),
        city: getCity(),
        ...((timezone !== 'undefined') ? { timezone } : {}),
        ...campaignInput,
        ...getDeviceInfo()
      }, schoolId, get(this.state.campaign, 'id')).call()
      if (this.props.name) {
        await this.login(this.state.phone, this.state.countryCode, this.state.email, true)
        this.setState({ loading: false })
        this.nextScreen()
      }
    } catch (e) {
      if (e.errors && e.errors[0]) {
        getToasterBasedOnType(failureToasterProps(get(e, 'errors[0].message'), true))
        this.setState({ loading: false })
      }
    }
  }

  updateUser = async ({
    parentName, email: parentEmail, countryCode, parentPhone, studentName
  }) => {
    parentPhone = parentPhone.replace(countryCode.replace('+', ''), '')
    let { userChildren } = this.props
    userChildren = userChildren && userChildren.toJS()
    const {
      section
    } = this.state
    const referralCode = sessionStorage.getItem('referralCode')
    const schoolName = sessionStorage.getItem('schoolName')
    const timezone = localStorage.getItem('timezone')
    let schoolId = this.state.currentFlow !== 'b2c' && get(this.state.campaign, 'schoolId')
    const grade = this.state.grade.value ? this.state.grade.value : this.state.grade
    const utminputs = {};
    if (localStorage.getItem('utm_source')) {
      utminputs.utmSource = localStorage.getItem('utm_source')
    }
    if (localStorage.getItem('utm_campaign')) {
      utminputs.utmCampaign = localStorage.getItem('utm_campaign')
    }
    if (localStorage.getItem('utm_term')) {
      utminputs.utmTerm = localStorage.getItem('utm_term')
    }
    if (localStorage.getItem('utm_content')) {
      utminputs.utmContent = localStorage.getItem('utm_content')
    }
    if (localStorage.getItem('utm_medium')) {
      utminputs.utmMedium = localStorage.getItem('utm_medium')
    }
    try {
      const input = {
        parentName: this.state.parentName.trim(),
        childName: this.state.studentName.trim(),
        parentEmail: this.state.email.trim(),
        grade: grade,
        country: getCountry(),
        city: getCity(),
        ...utminputs,
        ...(section.value ? { section: section.value } : {}),
        ...(referralCode ? { referralCode } : {}),
        ...(schoolName ? { schoolName } : {}),
        ...((timezone !== 'undefined') ? { timezone } : {}),
        ...getDeviceInfo()
      }
      if (this.isSourceRadioStreet()) {
        const schoolName = this.state.schoolName || this.state.school.value
        input.schoolName = schoolName
      }
      const { eventId } = this.props.match.params
      if (this.props.registerationForEvent && eventId) {
        input.eventId = eventId
      }
      if (userChildren.length >= 2) {
        await signUpMentee({
          parentName: this.state.parentName.trim(),
          childName: this.state.studentName.trim(),
          parentEmail: this.state.email.trim(),
          parentPhone: {
            number: parentPhone.trim(),
            countryCode,
          },
          grade,
          country: getCountry(),
          city: getCity(),
        }).call()
      } else {
        if (this.state.batchId && this.state.schoolId) {
          schoolId = this.state.schoolId
        }
        await updateMentee(input, this.props.parentId, schoolId, get(this.state.campaign, 'id'), this.state.batchId).call()
      }
      this.setState({ loading: false })
      if (this.props.name) {
        if (this.state.currentFlow === 'b2b2c') {
          this.setState({
            currentScreen: 'slotBooking',
            progressBar: [
              { id: 0, title: 'Setup Account', active: true },
              { id: 1, title: 'Enter Details', active: true },
              { id: 2, title: 'Schedule Session', active: true },
            ]
          })
        } else if (this.state.currentFlow === 'b2b') {
          this.setState({
            currentScreen: 'b2bRegistrationConfirmation',
            shouldProgressBar: false,
            campaign: {}
          })
        } else if (this.props.registerationForEvent) {
          return
        }
        else {
          this.moveToSession()
        }
      } else {
        if (this.props.registerationForEvent) {
          return
        }
      }
    } catch (e) {
      if (e.errors && e.errors[0]) {
        getToasterBasedOnType(failureToasterProps(get(e, 'errors[0].message'), true))
        this.setState({ loading: false })
      }
    }
  }

  renderTeamFrom = (isUpdated = true) => {
    const breakPoint = 900
    const isDesktop = typeof window === 'undefined' ? true : window.innerWidth > breakPoint
    if (isUpdated) {
      return (
        <div class="signup-alumni-section">
          <div class="signup-alumni-container">
            <p class="signup-alumni-title">Brought to you by alumnus of IIT, IIM having worked with</p>
            <ul class="signup-company-or-college-container">

              <li class="signup-company-or-college">
                <img class="Google signup-alumni-letter" src="https://dsd4auyo4ifts.cloudfront.net/landingPage/googleLogo_ckz373dhv012y0yz16ub8e4ot_1643663976979.png" alt="Google" loading="lazy" />
              </li>

              <li class="signup-company-or-college">
                <img class="uber signup-alumni-letter" src="https://dsd4auyo4ifts.cloudfront.net/landingPage/uberLogo_ckz373ot101320yz1fvws612b_1643663991637.png" alt="uber" loading="lazy" />
              </li>

              <li class="signup-company-or-college">
                <img class="intel signup-alumni-letter" src="https://dsd4auyo4ifts.cloudfront.net/landingPage/intel_ckz373j1301300yz12wqaeye3_1643663984151.png" alt="intel" loading="lazy" />
              </li>
              <p class="signup-company-or-college signup-alumni-text">IIT D</p>

            </ul>
          </div>
        </div>
      )
    }
    return (
      <div className={'signup-or-login-teamBanner'}>
        <div className={'signup-or-login-teamTitle'}>Brought to you by a team from</div>
        <div className={'signup-or-login-teamRowWrapper'}>
          <div className={'signup-or-login-teamRow'}>
            <div className={'signup-or-login-googleIcon'}>
              <GoogleIcon />
            </div>
            <div className={'signup-or-login-intelIcon'}>
              <IntelIcon />
            </div>
            <div className={'signup-or-login-microsoftIcon'}>
              <MicrosoftIcon dark={isDesktop} />
            </div>
            <div className={'signup-or-login-amazonIcon signup-or-login-noMarginRightMobile'}>
              <AmazonIcon dark={isDesktop} />
            </div>
          </div>
          <div className={'signup-or-login-teamRow secondRow'}>
            <div className={'signup-or-login-harvardIcon'}>
              <HarvardIcon dark={isDesktop} />
            </div>
            <div className={'signup-or-login-textIcon'}>
              IIT Delhi
            </div>
            <div className={'signup-or-login-textIcon'}>
              IIM Ahmedabad
            </div>
            <div className={'signup-or-login-textIcon'} style={{ marginRight: 0 }}>
              NITs
            </div>
          </div>
        </div>
      </div>
    )
  }

  getLoginSignUpText = () => {
    let { eventDetails, registerationForEvent } = this.props
    eventDetails = eventDetails && eventDetails.toJS()
    const customAuthMethod = get(this.props, 'customAuthMethod', null)
    if (isSchoolWebsite()) {
      return 'Management Login'
    }
    if (customAuthMethod) {
      return get(customAuthMethod, 'label', 'Login')
    }
    if (registerationForEvent) {
      return (get(this.props, 'eventData.name', '') && `Register for ${get(this.props, 'eventData.name', '')}`) || 'Login'
    }
    return get(customAuthMethod, 'label', 'Login')
  }

  renderLoginOrSignup = () => {
    const breakPoint = 900
    const shouldWhiteLabel = get(this.state.campaign, 'type') === 'b2b' && get(this.state.campaign, 'whiteLabel')
    const isDesktop = typeof window === 'undefined' ? true : window.innerWidth > breakPoint
    let buttonText = 'Login'
    if (!this.state.isPhoneDisabled && !this.state.isEmailDisabled) {
      buttonText = 'Login'
    } else if (this.state.isPhoneDisabled) {
      buttonText = 'Login with Password'
    } else if (this.state.isEmailDisabled) {
      buttonText = 'Login with OTP'
    }
    return (
      <>
        <div className='signup-or-login-absolute-form' style={{ left: this.state.screenPosition.loginSignup, margin: (isMobile() && get(this.props, 'registerationForEvent')) && '5px' }}>
          {(!isDesktop && this.state.shouldProgressBar) ? this.renderNavigation() : <></>}
          <Formik
            initialValues={{ phone: '91', countryCode: this.state.countryCode, email: '' }}
            validate={(values) => {
              const errors = {}
              const phone = values.phone.replace('91', '')
              if (phone.trim().length === 0 && values.email.trim().length === 0) {
                errors.email = 'Either Phone or Email is required'
                errors.phone = 'Either Phone or Email is required'
              } else {
                const isPhoneValid = phoneRegExp.test(phone)
                const isEmailValid = emailRegExp.test(values.email)
                if (isPhoneValid || isEmailValid) {
                } else {
                  if (phone) {
                    errors.phone = 'Phone Number is not Valid'
                  }
                  if (!values.email) {
                    errors.email = 'Username Or Email Address is not Valid'
                  }
                }
              }
              return errors
            }}
            onSubmit={async (values, formik) => {
              if (this.state.pageLoading) return true
              const isPhoneValid = phoneRegExp.test(values.phone)
              if (isPhoneValid && this.state.phone) {
                this.setState({ loginUsing: 'phone', loading: true })
                await this.login(this.state.phone, this.state.countryCode)
              } else if (this.state.email) {
                this.setState({ loginUsing: 'email', loading: true })
                await this.login(this.state.phone = '', this.state.countryCode = '', this.state.email)
              }
            }}>
            {({ handleSubmit, setValues, values, errors, touched }) => (
              <Form className='signup-or-login-formik-container' style={{ display: 'flex', flexDirection: 'column' }} onSubmit={handleSubmit}>
                {!isDesktop && this.renderHeader()}
                <div className='signup-or-login-title' style={{ position: 'relative' }}>
                  {this.getLoginSignUpText()}
                  {!isDesktop && (<div className={cx('signup-or-login-school-logo', shouldWhiteLabel && 'signup-login-none')} style={{ backgroundImage: `url(${getPath(get(this.state.campaign, 'schoolLogo.uri', ''))})` }}></div>)}
                </div>
                <PhoneInput
                  name='phone'
                  id="Login/signup-phone-number"
                  onEnterKeyPress={() => {
                    handleSubmit()
                  }}
                  label='Enter Phone Number'
                  isDisabled={this.state.isPhoneDisabled}
                  value={this.state.phone}
                  disabledTooltip='Clear Email Address to enable Phone'
                  error={touched.phone ? errors.phone : ''}
                  onChange={(phone, data, e, formattedNumber) => {
                    this.setState({ phone: phone, countryCode: data.dialCode })
                    setValues({
                      ...values,
                      phone: phone,
                      countryCode: data.dialCode
                    })
                  }}
                />
                <div className='signup-or-login-or-row'>
                  <div></div>
                  <div className='signup-or-login-or-text'>or</div>
                  <div></div>
                </div>
                <Input
                  name='email'
                  label='Enter Username Or Email Address'
                  id="Login/signup-phone-number"
                  isDisabled={this.state.isEmailDisabled}
                  disabledTooltip='Clear Phone to enable Username Or Email Address'
                  placeholder=''
                  error={touched.email ? errors.email : ''}
                  value={this.state.email || ''}
                  onChangeText={(email) => {
                    this.setState({ email: email })
                    setValues({
                      ...values,
                      email: email,
                      phone: ''
                    })
                  }}
                />
                <div className={this.props.registerationForEvent ? 'signup-or-login-privacy-text mBottom' : 'signup-or-login-privacy-text'}>By logging in, you agree to our <a href='/terms'>Terms<br /> of Service</a> and <a href='/privacy'>Privacy Policy</a></div>
                <Button id="success-submit-phonenumber" style={{ alignSelf: 'center' }} disabled={this.state.pageLoading} onClick={() => {
                  handleSubmit()
                }} title={buttonText} />
                <input style={{ display: 'none' }} type='submit' />
              </Form>
            )}
          </Formik>
        </div>
      </>
    )
  }

  renderOTP = (screen) => {
    const breakPoint = 900
    const isDesktop = typeof window === 'undefined' ? true : window.innerWidth > breakPoint
    return (
      <>
        <div className='signup-or-login-absolute-form' style={{ left: this.state.screenPosition[screen] }}>
          {(!isDesktop && this.state.shouldProgressBar) ? this.renderNavigation() : <></>}
          <Formik
            initialValues={{
              otp: ''
            }}
            validationSchema={otpValidation}
            onSubmit={async (values, formik) => {
              this.setState({ loading: true })
              await this.validateOTP(this.state.otp)
              formik.resetForm({ otp: '' })
            }}>
            {({ handleSubmit, setValues, values, errors, touched, setTouched }) => (
              <>
                <Form className='signup-or-login-formik-container' style={{ display: 'flex', flexDirection: 'column' }} onSubmit={handleSubmit}>
                  {!isDesktop && this.renderHeader()}
                  <div className='signup-or-login-title' style={{ position: 'relative' }}>
                    Verify your mobile number
                    {/* {!isDesktop && (<div className={cx('signup-or-login-school-logo', get(this.state.campaign, 'type') === 'b2b' && 'signup-login-none')} style={{ backgroundImage: `url(${getPath(get(this.state.campaign, 'schoolLogo.uri', ''))})` }}></div>)} */}
                  </div>
                  <OTPInput
                    label='Enter OTP'
                    id='submit-otp'
                    phone={`+${this.state.countryCode} ${this.state.phone.replace(this.state.countryCode, '')}`}
                    value={this.state.otp}
                    error={touched.otp ? errors.otp : ''}
                    onResend={() => {
                      this.login(this.state.phone, this.state.countryCode, this.state.email, true)
                    }}
                    onChange={(otp) => {
                      setValues({
                        ...values,
                        otp
                      })
                      this.setState({ otp })
                    }}
                  />
                  <div className='signup-or-login-otp-sent-text'>
                    <div>OTP sent to +{this.state.phone}</div>
                    <a href="" className='photon-link' onClick={(e) => {
                      e.preventDefault()
                      this.setState({ otp: '', phone: '', email: '' })
                      setTouched({ otp: false }, false)
                      this.setState({ currentScreen: 'loginSignup' })
                    }}>Change Number</a>
                  </div>
                  <Button id='success-submit-otp' style={{ alignSelf: 'center' }} onClick={handleSubmit} title='Verify OTP' />
                  <input style={{ display: 'none' }} type='submit' />
                </Form>
              </>
            )}
          </Formik>
        </div>
      </>
    )
  }

  renderPassword = (screen) => {
    const breakPoint = 900
    const isDesktop = typeof window === 'undefined' ? true : window.innerWidth > breakPoint
    return (
      <>
        <div className='signup-or-login-absolute-form' style={{ left: this.state.screenPosition[screen] }}>
          {(!isDesktop && this.state.shouldProgressBar) ? this.renderNavigation() : <></>}
          <Formik
            initialValues={{
              password: ''
            }}
            validationSchema={passwordValidation}
            onSubmit={(values, formik) => {
              this.setState({ loading: true })
              this.loginUsingPassword()
            }}>
            {({ handleSubmit, setValues, values, errors, touched, setTouched }) => (
              <>
                <Form className='signup-or-login-formik-container' style={{ display: 'flex', flexDirection: 'column' }} onSubmit={handleSubmit}>
                  {!isDesktop && this.renderHeader()}
                  <div className='signup-or-login-title' style={{ position: 'relative' }}>
                    Enter your password
                    {/* {!isDesktop && (<div className={cx('signup-or-login-school-logo', get(this.state.campaign, 'type') === 'b2b' && 'signup-login-none')} style={{ backgroundImage: `url(${getPath(get(this.state.campaign, 'schoolLogo.uri', ''))})` }}></div>)} */}
                  </div>
                  <PasswordInput
                    label='Enter Password'
                    value={this.state.password}
                    error={touched.password ? errors.password : ''}
                    onChangeText={(password) => {
                      setValues({
                        ...values,
                        password
                      })
                      this.setState({ password })
                    }}
                  />
                  <Button style={{ alignSelf: 'center' }} className='signup-password-button' onClick={handleSubmit} title='Submit' />
                  <input style={{ display: 'none' }} type='submit' />
                </Form>
              </>
            )}
          </Formik>
        </div>
      </>
    )
  }

  renderLoading = () => {
    return (
      <div className={cx('signup-or-login-loading-container', this.state.loading && 'show')}>
        <div className='signup-or-login-loading-bar-container'>
          <div />
        </div>
      </div>
    )
  }

  shouldShowSep = grade => {
    if (grade === this.state.grades[this.state.grades.length - 1]) {
      return false
    }
    if (grade === this.state.grade) {
      return false
    }
    if (grade === this.state.grades[this.state.grades.indexOf(this.state.grade) - 1]) {
      return false
    }
    return true
  }

  renderGrade = () => {
    const { batchId, schoolId } = this.state
    return (
      <>
        <div className='photon-label'>Student Grade</div>
        {this.state.grades.length > 8 ? (
          <Select
            options={
              (batchId && schoolId) ?
                Object.keys(this.state.gradesSectionObject).map(grade => ({ value: grade, label: `${grade.replace('Grade', 'Grade ')}` })) :
                this.state.grades.map(grade => ({ value: grade, label: `${grade.replace('Grade', 'Grade ')}` }))
            }
            value={{ value: this.state.grade, label: this.state.grade.replace('Grade', 'Grade ') }}
            onChange={(value) => {
              const prevGrade = this.state.grade
              if (value.value) {
                this.setState({ grade: value.value })
              } else {
                this.setState({ grade: value })
              }
              const { batchId, schoolId, gradesSectionObject } = this.state
              if (batchId && schoolId && Object.keys(gradesSectionObject).length) {
                let section = ''
                let newGrade = ''
                if (value.value) newGrade = value.value
                else newGrade = value
                if (newGrade !== prevGrade) {
                  section = gradesSectionObject[newGrade]
                  if (section.length) {
                    this.setState({
                      section: {
                        value: section[0],
                        label: section[0]
                      }
                    })
                  }
                }
              }
            }}
            defaultValue={{ value: this.state.grade, label: this.state.grade.replace('Grade', 'Grade ') }}
            isSearchable
            theme={theme => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary: '#00ADE6'
              },
            })}
            className='signup-or-login-grade-select'
            placeholder='Choose Grade'
            classNamePrefix='signup-or-login'
          />
        ) : (
          <div className={'signup-or-login-gradesContainer'}>
            {this.state.grades.map((grade) => (
              <>
                <motion.div
                  whileTap={{
                    scale: 1
                  }}
                  onClick={() => {
                    this.setState({ grade: grade })
                  }}
                  id='registration-grade-selection'
                  className={cx(
                    'signup-or-login-grade',
                    this.state.grade === grade && 'signup-or-login-gradeActive')
                  }>
                  {grade.replace('Grade', '')}
                </motion.div>
                {this.shouldShowSep(grade) && (
                  <div className={'signup-or-login-gradeSep'}></div>
                )}
              </>
            ))}
          </div>
        )}
      </>
    )
  }
  renderSchoolList = ({ touched, errors }) => {
    return <>
      <div className={`photon-label`} style={this.state.schoolNameError ? {
        color: '#FF5744',
        opacity: 1
      } : {}}>{this.state.schoolNameError || 'School Name'}</div>
      <div className={'signup-page-inputColumn'}>
        <Select
          options={[
            ...eventSchoolList.map(school => ({ value: school, label: school })),
            {
              value: 'other',
              label: 'Other'
            }
          ]}
          theme={theme => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: '#00ADE6'
            },
          })}
          placeholder='Choose Your School*'
          value={{ ...this.state.school }}
          className={`signup-or-login-grade-select ${this.state.schoolNameError && 'error'}`}
          classNamePrefix='signup-or-login'
          onBlur={this.onSchoolBlur}
          error={touched.schoolName ? errors.schoolName : ''}
          onChange={(schoolName) => {
            if (schoolName && schoolName.value === 'other') {
              this.setState({
                school: {
                  value: 'other',
                  label: 'other'
                },
                schoolNameError: ''
              })
            } else {
              this.setState({
                school: schoolName,
                schoolNameError: ''
              })
            }
          }}
          isSearchable
        />
      </div>
      {this.state.school.value === 'other' && (
        <div className={'signup-page-inputColumn'}>
          <Input
            name="schoolName"
            placeholder="School Name*"
            fromRadioStreetInput
            value={this.state.schoolName}
            error={this.state.schoolNameError}
            onChangeText={e => this.setState({ schoolName: e, })}
            onBlur={this.onSchoolBlur}
          />
        </div>
      )}
    </>
  }

  onSchoolBlur = () => {
    const { school, schoolName } = this.state
    let schoolNameError = ''
    if (!school.value && !schoolName) schoolNameError = 'School Name is required'
    else if (school.value && school.value === 'other' && !schoolName) schoolNameError = 'School Name is required'
    else schoolNameError = ''
    this.setState({
      schoolName: this.state.schoolName.trim(),
      schoolNameError
    })
    if (schoolNameError) return true;
  }
  getStudentDetailValidation = () => {
    if (this.state.currentFlow !== 'b2b') {
      return Yup.object().shape(this.state.loginUsing === 'phone' ? formValidation.b2CFormEmail : formValidation.b2CFormPhone)
    } else if (this.state.currentScreen === 'studentDetail') {
      return Yup.object().shape(formValidation.b2bFormPartA)
    } else {
      return Yup.object().shape(this.state.loginUsing === 'phone' ? formValidation.b2bFormEmailPartB : formValidation.b2bFormPhonePartB)
    }
  }

  setCorrectCampaign = (callback = () => { }) => {
    const grade = this.state.grade.value ? this.state.grade.value : this.state.grade
    if (this.state.schoolCampaignFlow) {
      const campaign = this.state.allCampaigns.find((campaign) =>
        !!get(campaign, 'classes', []).find((schoolClass) =>
          get(schoolClass, 'grade') === grade
        )
      )
      if (campaign) {
        this.setCampaign(campaign, callback, get(this.state.campaign, 'classes'), true)
      } else {
        callback()
      }
    } else {
      callback()
    }
  }

  isSourceRadioStreet = () => {
    const query = qs.parse(window.location.search)
    const queryKeys = Object.keys(query)
    let isRadioStreet = false;
    if (queryKeys && queryKeys.length > 0) {
      for (const key of queryKeys) {
        if (query[key] && query[key].trim().length && query[key].trim().toLowerCase() === 'radiostreet') {
          isRadioStreet = true;
        }
        if (isRadioStreet) break;
      }
    }
    if (isRadioStreet
      && get(this.props, 'registerationForEvent') && document.querySelector(".signup-or-login-body")) {
      document.querySelector(".signup-or-login-body").classList.add('radio-street');
      return true
    }
    return false
  }
  renderStudentDetailsForm = (screen) => {
    const breakPoint = 900
    const isDesktop = typeof window === 'undefined' ? true : window.innerWidth > breakPoint
    const shouldWhiteLabel = get(this.state.campaign, 'type') === 'b2b' && get(this.state.campaign, 'whiteLabel')
    return (
      <>
        <div className={this.props.registerationForEvent ? `signup-or-login-absolute-form opacity-zero fade-in` : 'signup-or-login-absolute-form'}
          style={{ left: this.state.screenPosition[screen] }}>
          {(!isDesktop && this.state.shouldProgressBar) ? this.renderNavigation() : <></>}
          <Formik
            initialValues={{
              studentName: '',
              parentName: '',
              email: '',
              phone: '',
              section: '',
              grade: '',
            }}
            validationSchema={this.getStudentDetailValidation()}
            onSubmit={({ studentName, parentName, phone, countryCode }, formik) => {
              if (!(this.state.currentFlow === 'b2b' && this.state.currentScreen === 'studentDetail')) {
                if (this.isSourceRadioStreet() && this.onSchoolBlur()) {
                  return true;
                }
                this.setState({ loading: true })
                this.setCorrectCampaign(() => {
                  if (this.state.loginUsing === 'email') {
                    this.signUp({
                      studentName,
                      parentName,
                      email: this.state.email,
                      parentPhone: phone.replace(countryCode, ''),
                      countryCode: '+' + countryCode,
                    })
                  } else {
                    this.updateUser({
                      studentName,
                      parentName,
                      email: this.state.email,
                      parentPhone: phone.replace(countryCode, '') || this.state.phone.replace(countryCode, ''),
                      countryCode: (countryCode && '+' + countryCode) || ('+' + this.state.countryCode),
                    })
                  }
                })
              } else {
                this.nextScreen()
              }
            }}>
            {({ handleSubmit, setValues, values, errors, touched, setTouched }) => {
              return (<>
                <Form className='signup-or-login-formik-container signup-or-login-form-wrapper' style={{ display: 'flex', flexDirection: 'column' }} onSubmit={handleSubmit}>
                  {!isDesktop && this.renderHeader()}
                  <div className='signup-or-login-student-title' style={{ position: 'relative' }}>
                    Student Details
                    {!isDesktop && (<div className={cx('signup-or-login-school-logo', shouldWhiteLabel && 'signup-login-none')} style={{ backgroundImage: `url(${getPath(get(this.state.campaign, 'schoolLogo.uri', ''))})` }}></div>)}
                  </div>
                  {this.state.currentFlow !== 'b2b' && (
                    <Input
                      name='parentName'
                      label='Parent Name'
                      id="registration-parent-name"
                      error={touched.parentName ? errors.parentName : ''}
                      onChangeText={(parentName) => {
                        this.setState({ parentName: parentName })
                        setValues({
                          ...values,
                          parentName: parentName
                        })
                      }}
                    />
                  )}
                  {(this.state.currentFlow === 'b2b' && screen === 'postStudentDetail') && (
                    <Input
                      name='parentName'
                      label='Parent Name'
                      id="registration-parent-name"
                      error={touched.parentName ? errors.parentName : ''}
                      onChangeText={(parentName) => {
                        this.setState({ parentName: parentName })
                        setValues({
                          ...values,
                          parentName: parentName
                        })
                      }}
                    />
                  )}
                  {(this.state.currentFlow !== 'b2b' || screen === 'postStudentDetail') && (
                    this.state.loginUsing === 'phone' ? (
                      <Input
                        id="registration-parent-email"
                        name='email'
                        label='Parent Email Address'
                        placeholder=''
                        error={touched.email ? errors.email : ''}
                        onChangeText={(email) => {
                          this.setState({ email: email })
                          setValues({
                            ...values,
                            email: email
                          })
                        }}
                      />
                    ) : (
                      <PhoneInput
                        name='phone'
                        onEnterKeyPress={() => {
                          handleSubmit()
                        }}
                        label='Parent Phone Number'
                        error={touched.phone ? errors.phone : ''}
                        onChange={(phone, data, e, formattedNumber) => {
                          this.setState({ phone: phone, countryCode: data.dialCode })
                          setValues({
                            ...values,
                            phone: phone,
                            countryCode: data.dialCode
                          })
                        }}
                      />
                    ))}
                  {screen !== 'postStudentDetail' && (
                    <Input
                      name='studentName'
                      id='registration-student-name'
                      label='Student Name'
                      error={touched.studentName ? errors.studentName : ''}
                      onChangeText={(studentName) => {
                        this.setState({ studentName: studentName })
                        setValues({
                          ...values,
                          studentName: studentName
                        })
                      }}
                    />
                  )}
                  {screen !== 'postStudentDetail' && this.renderGrade()}
                  {screen !== 'postStudentDetail' && this.isSourceRadioStreet() && this.renderSchoolList({ touched, errors })}
                  {this.state.currentFlow === 'b2b' && screen !== 'postStudentDetail' && (
                    <>
                      <div className={cx('photon-label', touched.section && errors.section && 'error')}>{touched.section && errors.section ? errors.section : 'Student Section'}</div>
                      <Select
                        options={this.state.sections.map(section => ({ value: section, label: `Section ${section}` }))}
                        value={this.state.section}
                        onChange={(value) => {
                          this.setState({ section: value })
                          setValues({
                            ...values,
                            section: value
                          })
                        }}
                        isSearchable
                        theme={theme => ({
                          ...theme,
                          colors: {
                            ...theme.colors,
                            primary: '#00ADE6'
                          },
                        })}
                        placeholder='Choose Section'
                        classNamePrefix='signup-or-login'
                      />
                    </>
                  )}
                  {this.state.batchId && this.state.schoolId && (
                    <>
                      <div className={cx('photon-label', touched.section && errors.section && 'error')}>{touched.section && errors.section ? errors.section : 'Student Section'}</div>
                      <Select
                        options={
                          get(this.state, `gradesSectionObject[${this.state.grade}]`, []).map(section => ({ value: section, label: section }))
                        }
                        onChange={(value) => {
                          this.setState({ section: value })
                        }}
                        value={this.state.section}
                        isSearchable
                        theme={theme => ({
                          ...theme,
                          colors: {
                            ...theme.colors,
                            primary: '#00ADE6'
                          },
                        })}
                        placeholder='Choose Section'
                        classNamePrefix='signup-or-login'
                      />
                    </>
                  )}
                  <Button id='success-submit-registration' style={{ alignSelf: 'center' }} onClick={() => {
                    if (this.isSourceRadioStreet()) {
                      this.onSchoolBlur()
                    }
                    handleSubmit()
                  }} title='Proceed' className='signup-or-login-student-details-button' />
                  <input style={{ display: 'none' }} type='submit' />
                </Form>
              </>
              )
            }}
          </Formik>
        </div>
      </>
    )
  }

  setCount = (val) => {
    this.setState({ count: val })
  }
  renderMultipleChildScreen = (screen) => {

    let { styles, userChildren, eventDetails } = this.props
    eventDetails = eventDetails && eventDetails.toJS()
    userChildren = userChildren && userChildren.toJS()
    const breakPoint = 900
    const isDesktop = typeof window === 'undefined' ? true : window.innerWidth > breakPoint
    const shouldWhiteLabel = get(this.state.campaign, 'type') === 'b2b' && get(this.state.campaign, 'whiteLabel')

    const setUser = (userChild) => async () => {

      const { userChildren } = this.props
      const parent = this.props.userParent.toJS()
      const user = {
        ...userChild,
        parent: parent,
        email: parent.email,
        createdAt: parent.createdAt
      }

      const child = parent.parentProfile.children.find(child => child.user.id === userChild.id)
      const { eventId } = this.props.match.params
      await requestToGraphql(gql`mutation {
        updateEvent(id: "${eventId}", registeredUsersConnectIds: ["${get(child, 'id')}"]) {
          id
        }
      }
      `, {}, getAuthToken('', get(userChild, 'token'))).then(res => {
        this.props.dispatch({ type: 'LOGOUT' })
        duck.merge(() => ({ user, userChildren: userChildren.toJS(), userParent: parent }), {
          key: 'loggedinUser'
        })
        store.dispatch({
          type: 'events/update/success',
          autoReducer: true,
          payload: fromJS({
            extractedData: {
              events: {
                id: get(res, 'data.updateEvent.id')
              }
            }
          }),
          key: 'events'
        })
      }).catch(err => {
        if (get(err, 'errors[0].message') === 'Child is already registered for event') {
          getToasterBasedOnType(failureToasterProps(get(err, 'errors[0].message')))
        } else {
          this.props.dispatch({ type: 'LOGOUT' })
          duck.merge(() => ({ user, userChildren: userChildren.toJS(), userParent: parent }), {
            key: 'loggedinUser'
          })
        }
      })
      return
    }
    let interval = 5;
    const nestedList = [];
    for (let i = 0; i < get(userChildren, 'length', 5); i = i + 5) {
      const splitted = userChildren && userChildren.slice(i, interval);
      nestedList.push(splitted);
      interval += 5;
    }
    return (
      <>
        {/* <div className='signup-or-login-absolute-form' style={{ left: this.state.screenPosition[screen] }}> */}
        <div className={this.props.registerationForEvent ? 'signup-or-login-absolute-form-event-registration' : 'signup-or-login-absolute-form'} style={{ left: this.state.screenPosition[screen] }}>
          <h3 style={isMobile() ? { paddingLeft: '0.5rem', paddingRight: '1rem' } : { margin: '0px', marginTop: '10px' }}>Whose registering for {get(this.props, 'eventData.name', '')}?</h3>
          {(!isDesktop && this.state.shouldProgressBar) ? this.renderNavigation() : <></>}
          <div>
            <div className={(get(nestedList, `[${this.state.count}]`, []).length === 3 || get(nestedList, `[${this.state.count}]`, []).length === 5) ? classNames.profilesContainerForEventRegisteration : classNames.profilesContainerForEventRegisterationFlexStart}>
              <SignupCarousel limitShow={1} childNums={nestedList.length} >
                {nestedList.map((childs, i) => (
                  <SignupCarouselItem >
                    <div className='multi-child-signup-carousel'>
                      {childs.map((userChild, ind) => (
                        <motion.div className={(get(nestedList, `[${this.state.count}]`, []).length === 3 || get(nestedList, `[${this.state.count}]`, []).length === 5) ? classNames.profileContainerForEventRegisteration : classNames.profileContainerForEventRegisterationMinWidth} whileHover="hover" onClick={() => setUser(userChild)()}>
                          <motion.div className={classNames.profileForEventRegisteration} style={{
                            ...this.props.userId === get(userChild, 'id') ? styles.selectedProfile : {}
                          }} variants={variants.profile}>
                            <motion.div
                              className={classNames.profileAvatarForEventRegisteration}
                              style={{
                                backgroundImage: `url(${avatars[ind % 4]})`
                              }}
                              variants={variants.avatar}
                            >
                            </motion.div>
                            {isMobile() && (
                              <div className={cx(classNames.accountName, classNames.eventAccountName)}>{get(userChild, 'name')}</div>
                            )}
                          </motion.div>
                          {!isMobile() && (
                            <div className={cx(classNames.accountName, classNames.eventAccountName)}>{get(userChild, 'name')}</div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </SignupCarouselItem>
                ))}
              </SignupCarousel>
            </div>
            {/* {get(userChildren, 'length') > 5 && <CarouselBtns setCount={this.setCount} count={this.state.count}
              nestedListLength={nestedList.length} />} */}
          </div>
          {/* {!isMobile() && <p onClick={() => this.setState({ currentScreen: 'loginSignup', openWaitListModal: true })} className='extraChildText'>Want to register someone else?</p>}
          {
            isMobile() && <p style={{ marginLeft: '1rem' }} onClick={() => this.setState({ currentScreen: 'loginSignup', openWaitListModal: true })} className='extraChildText'>Want to register someone else?</p>
          } */}
        </div>
      </>
    )
  }

  bookB2BCSession = async () => {
    const bookingDate = get(this.state.slots.find(slot => slot.date === this.state.selectedDate), 'bookingDate')
    try {
      this.setState({ loading: true })
      const res = await requestToGraphql(BOOK_CAMPAIGN_SESSION(get(this.state.campaign, 'id'), this.state.user.id, `slot${this.state.selectedTime}`, bookingDate, this.state.courseString), {}, getAuthToken('', this.state.user.token), false)
      const result = get(res, 'data.bookB2B2CSlots.result')
      if (result) {
        duck.merge(() => ({
          user: this.state.user
        }), { key: 'loggedinUser' })
        setTimeout(() => {
          this.moveToSession(true)
          this.setState({ loading: false })
        }, 1000)
      }
    } catch (e) {
      if (e.errors && e.errors[0]) {
        getToasterBasedOnType(failureToasterProps(get(e, 'errors[0].message'), true))
        this.setState({ loading: false })
      }
    }
  }

  loginUsingPassword = async () => {
    try {
      await loginViaPassword({
        email: emailRegExp.test(this.state.email) ? this.state.email.trim() : null,
        username: !emailRegExp.test(this.state.email) ? this.state.email.trim() : null,
        password: this.state.password
      }, false, null, () => {
        this.props.history.push('/switch-account')
      }).call()
      if (this.props.loggedInUserId) {
        this.moveToSession(true)
      }
    } catch (e) {
      if (e.errors && e.errors[0]) {
        getToasterBasedOnType(failureToasterProps(get(e, 'errors[0].message'), true))
        this.setState({ loading: false })
      }
    }
  }

  renderSlot = () => {
    const calenderDates =
      this.state.slots.slice(0 + (4 * (this.state.currentPage - 1)), (4 * (this.state.currentPage)))
    const slots = get(this.state.slots.find(slot => get(slot, 'date') === this.state.selectedDate), 'slots', []) || []
    const morningSlots = slots.filter(s => s.slotTime < 12) || []
    const noonSlots = slots.filter(s => s.slotTime > 11 && s.slotTime < 19) || []
    const nightSlots = slots.filter(s => s.slotTime > 18) || []
    const shouldArrows = this.state.slots.length > 4
    const shouldLeftArrowDisable = this.state.currentPage === 1
    const shouldRightArrowDisable = this.state.currentPage === this.state.totalCalenderPages
    const shouldWhiteLabel = get(this.state.campaign, 'type') === 'b2b' && get(this.state.campaign, 'whiteLabel')

    const breakPoint = 900
    const isDesktop = typeof window === 'undefined' ? true : window.innerWidth > breakPoint

    return (
      <div className='signup-or-login-absolute-form relative'>
        {(!isDesktop && this.state.shouldProgressBar) ? this.renderNavigation() : <></>}
        <div className='demo-slot-container'>
          {!isDesktop && this.renderHeader()}
          <div className='signup-or-login-student-title' style={{ position: 'relative' }}>
            Choose your demo slot
            {!isDesktop && (<div className={cx('signup-or-login-school-logo', shouldWhiteLabel && 'signup-login-none')} style={{ backgroundImage: `url(${getPath(get(this.state.campaign, 'schoolLogo.uri', ''))})` }}></div>)}
          </div>

          <div className='signup-or-login-calender-date-container'>
            {shouldArrows && (
              <div className={cx('signup-or-login-calender-arrow-wrapper', shouldLeftArrowDisable && 'disable')} onClick={() => {
                if (!shouldLeftArrowDisable) {
                  this.setState({ currentPage: this.state.currentPage - 1 })
                }
              }}>
                <div className='signup-or-login-calender-arrow-container'></div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'row', flex: 1, alignItems: 'center' }}>
              {calenderDates.map((calenderDate, i) => (
                <>
                  <div className='signup-or-login-calender-date-wrapper' onClick={() => {
                    this.setState({ selectedDate: get(calenderDate, 'date'), selectedTime: '' })
                  }}>
                    <div className={cx('signup-or-login-calender-date-text', get(calenderDate, 'date') === this.state.selectedDate && 'active-login')}>
                      {get(calenderDate, 'date')}
                    </div>
                    <div className={cx('signup-or-login-calender-day-text', get(calenderDate, 'date') === this.state.selectedDate && 'active-login')}>
                      {isDesktop
                        ? get(calenderDate, 'day')
                        : ['Today', 'Tomorrow'].includes(get(calenderDate, 'day'))
                          ? get(calenderDate, 'day')
                          : get(calenderDate, 'day').slice(0, 3)
                      }
                    </div>
                  </div>
                  {calenderDates.length - 1 !== i && (
                    <div className='signup-or-login-calender-date-line'></div>
                  )}
                </>
              ))}
            </div>
            {shouldArrows && (
              <div className={cx('signup-or-login-calender-arrow-wrapper reverse', shouldRightArrowDisable && 'disable')} onClick={() => {
                if (!shouldRightArrowDisable) {
                  this.setState({ currentPage: this.state.currentPage + 1 })
                }
              }}>
                <div className='signup-or-login-calender-arrow-container' style={{ transform: 'scale(-1)' }}></div>
              </div>
            )}
          </div>
          {morningSlots.length > 0 && (
            <div className='signup-or-login-slots-container'>
              <div className='signup-or-login-icon-container morning-icon'></div>
              <div className='signup-or-login-slot-time-container'>
                {morningSlots.map(slot => (
                  <div onClick={() => { this.setState({ selectedTime: get(slot, 'slotTime') }) }} className={cx('signup-or-login-slot-time-button', (get(slot, 'slotTime') === this.state.selectedTime) && 'active-login', !get(slot, 'showSlot') && 'disabled')}>
                    {(get(slot, 'slotTime') === this.state.selectedTime)
                      ? <div className='signup-or-login-slot-time-check'></div>
                      : <div className='signup-or-login-slot-hole'></div>
                    }
                    <div className={cx('signup-or-login-slot-time-text', get(slot, 'slotTime') === this.state.selectedTime && 'active-login')}>{getTimeLabel(get(slot, 'time.startTime', ''), slot)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {noonSlots.length > 0 && (
            <div className='signup-or-login-slots-container'>
              <div className='signup-or-login-icon-container afternoon-icon'></div>
              <div className='signup-or-login-slot-time-container'>
                {noonSlots.map(slot => (
                  <div onClick={() => { this.setState({ selectedTime: get(slot, 'slotTime') }) }} className={cx('signup-or-login-slot-time-button', (get(slot, 'slotTime') === this.state.selectedTime) && 'active-login', !get(slot, 'showSlot') && 'disabled')}>
                    {(get(slot, 'slotTime') === this.state.selectedTime)
                      ? <div className='signup-or-login-slot-time-check'></div>
                      : <div className='signup-or-login-slot-hole'></div>
                    }
                    <div className={cx('signup-or-login-slot-time-text', get(slot, 'slotTime') === this.state.selectedTime && 'active-login')}>{getTimeLabel(get(slot, 'time.startTime', ''), slot)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {nightSlots.length > 0 && (
            <div className='signup-or-login-slots-container'>
              <div className='signup-or-login-icon-container night-icon'></div>
              <div className='signup-or-login-slot-time-container'>
                {nightSlots.map(slot => (
                  <div onClick={() => { this.setState({ selectedTime: get(slot, 'slotTime') }) }} className={cx('signup-or-login-slot-time-button', (get(slot, 'slotTime') === this.state.selectedTime) && 'active-login', !get(slot, 'showSlot') && 'disabled')}>
                    {(get(slot, 'slotTime') === this.state.selectedTime)
                      ? <div className='signup-or-login-slot-time-check'></div>
                      : <div className='signup-or-login-slot-hole'></div>
                    }
                    <div className={cx('signup-or-login-slot-time-text', get(slot, 'slotTime') === this.state.selectedTime && 'active-login')}>{getTimeLabel(get(slot, 'time.startTime', ''), slot)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* <div className='signup-or-login-slot-hr'></div> */}
          <Button title='Confirm Slots' className={cx('confirm-slot-button', (!(this.state.selectedTime) && this.state.selectedTime !== 0) && 'disabled')} onClick={this.bookB2BCSession} />
        </div>
      </div>
    )
  }

  renderEditIcon = () => {
    return (
      <svg width="100%" height="100%" viewBox="0 0 37 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.5002 2.99988L27.4999 8.9996L11.0007 25.4988H5.00098V19.4991L21.5002 2.99988Z" stroke="#01AA93" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M5.00098 32.9984H31.9997" stroke="#01AA93" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    )
  }

  renderNavigation = () => {
    const breakPoint = 900
    const isDesktop = typeof window === 'undefined' ? true : window.innerWidth > breakPoint
    const inActiveScreen = this.state.progressBar.findIndex(progress => !progress.active)
    const editingScreen = inActiveScreen > -1 ? inActiveScreen - 1 : this.state.progressBar.length - 1
    const isB2B2C = get(this.state.campaign, 'type') === 'b2b2cEvent'
    if (isB2B2C) {
      return <></>
    }
    return (
      <>
        <div className={cx('signup-or-login-navigationContainer', (this.state.shouldProgressBar && !this.state.openWaitListModal) && 'show')}>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
            {this.state.progressBar.map((progress, i) => (
              <div className='signup-or-login-navigationLinkContainer'>
                {i === editingScreen ? (
                  <div className='signup-or-login-checkmark'>
                    {this.renderEditIcon()}
                  </div>
                ) : (
                  <div className='signup-or-login-checkmark'>
                    {this.renderCheckmark(progress.active)}
                  </div>
                )}
                <div className={cx('signup-or-login-navigationLinkText', progress.active && 'active-login')}>{progress.title}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={cx('signup-or-login-navigationProgressGrey', (this.state.shouldProgressBar && !this.state.openWaitListModal) && 'show')} style={{ position: 'relative' }}>
          <div style={{
            width: `${(
              this.state.progressBar.filter(
                ({ active }) => active)
                .length / this.state.progressBar.length) * 100}%`,
            height: '100%',
            background: '#00ADE6'
          }} />
          {!isDesktop && (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'row',
              position: 'absolute',
              top: 0,
              left: 0,
            }}>
              <div style={{ flex: 1 }}></div>
              <div style={{ width: 2, height: '100%', backgroundColor: 'white' }}></div>
              <div style={{ flex: 1 }}></div>
              <div style={{ width: 2, height: '100%', backgroundColor: 'white' }}></div>
              <div style={{ flex: 1 }}></div>
            </div>
          )}
        </div>
      </>
    )
  }

  renderCheckmark = (active) => {
    return (
      <svg width="100%" height="100%" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M28.7574 15.0033C28.7574 7.5505 22.7108 1.50391 15.258 1.50391C7.80526 1.50391 1.75867 7.5505 1.75867 15.0033C1.75867 22.4561 7.80526 28.5026 15.258 28.5026C22.7108 28.5026 28.7574 22.4561 28.7574 15.0033Z" stroke={active ? "#01AA93" : '#CBCACA'} stroke-width="2.24989" stroke-miterlimit="10" />
        <path d="M22.0071 9.37537L12.5576 20.6248L8.50775 16.125" stroke={active ? "#01AA93" : '#CBCACA'} stroke-width="2.24989" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    )
  }

  renderHeader = () => {
    // if (this.state.pageLoading) {
    //   return <></>
    // }
    if (!this.state.shouldProgressBar) {
      return <></>
    }
    const campaignTitle = get(this.state.campaign, 'title', '')
    if (!campaignTitle) {
      return (
        <div className='signup-or-login-header'>{this.state.openWaitListModal ? '' : 'Book Your Free Class!'}</div>
      )
    }
    return (
      <div className='signup-or-login-header'>Book Your Spot At the {campaignTitle}!</div>
    )
  }

  closeModal = () => {
    this.setState({
      progressBar: [
        { id: 0, title: 'Setup Account', active: true },
        { id: 1, title: 'Enter Details', active: false }
      ],
      currentScreen: 'loginSignup',
      email: '',
      phone: '',
      loading: false,
      otp: '',
      countryCode: '91',
      password: '',
      currentFlow: 'b2c',
    })
    if (get(this.props, 'registerationForEvent') && this.state.currentScreen === 'multipleChild'
      && this.props.hasMultipleChildren) {
      this.props.dispatch({ type: 'LOGOUT' })
    }
    this.props.closeLoginModal(false)
  }

  closeWaitListModal = () => {
    let isUpdating = false
    if (this.state.email) {
      this.setState({ currentScreen: 'passwordScreen' })
      isUpdating = true
    }
    this.setState({
      openWaitListModal: false,
      shouldProgressBar: false,
      phone: '91',
      countryCode: '91',
      password: '',
      isPhoneDisabled: false,
      isEmailDisabled: false,
      pageLoading: false,
      loading: false,
      otp: '',
      email: '',
    }, () => {
      if (isUpdating) {
        this.setState({
          currentScreen: 'loginSignup'
        })
      }
    })
  }
  getSlideContainerBgImage = () => {
    const campaignPoster = get(this.state.campaign, 'poster.uri', '')
    const customAuthMethod = get(this.props, 'customAuthMethod')
    if (campaignPoster) {
      return { backgroundImage: `url(${getPath(campaignPoster)})` }
    }
    if (get(customAuthMethod, 'bgImage', null)) {
      return { backgroundImage: `url(${get(customAuthMethod, 'bgImage')})` }
    }
    return {}
  }

  getSchoolLogoIfExists = () => {
    const campaignSchoolLogo = get(this.state.campaign, 'schoolLogo.uri', '')
    const customAuthMethod = get(this.props, 'customAuthMethod')
    if (campaignSchoolLogo) {
      return { backgroundImage: `url(${getPath(campaignSchoolLogo)})` }
    }
    if (get(customAuthMethod, 'schoolDetails.logo.uri', null)) {
      return { backgroundImage: `url(${getPath(get(customAuthMethod, 'schoolDetails.logo.uri'))})` }
    }
    return {}
  }

  renderRegistrationConfirmation() {
    return (
      <div className='signup-or-login-absolute-form relative' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, overflow: 'visible', overflowY: 'visible' }}>
        <div className='signup-or-login-drop'></div>
        <div className='signup-or-login-congrats-text'>Congratulations!</div>
        <div className='signup-or-login-text'>You have successfully registered with Tekie!<br /><br /></div>
        <div className='signup-or-login-text'>
          We’ll reach out to you with more details about the session soon.<br /><br />
          In the meantime, find out how learning to code can help kids
        </div>
        <Button
          className='signup-explore-button'
          onClick={() => {
            window.open('https://blog.tekie.in/', '_blank');
          }}
          hideArrow
          title='Explore Our Blog'
        />
      </div>
    )
  }

  render() {
    const { currentScreen, loginViaLinkLoader } = this.state
    const { currentSchoolDetails, loggedInUser } = this.props
    const campaignPoster = get(this.state.campaign, 'poster.uri', '')
    const campaignPosterMobile = get(this.state.campaign, 'posterMobile.uri', '')
    const isComponentModal = get(this.props, 'modalComponent', false)
    const isRegisterationAllowed = get(this.props, 'registerationForEvent', false)
    const breakPoint = 900
    const isDesktop = typeof window === 'undefined' ? true : window.innerWidth > breakPoint
    const isB2B2C = get(this.state.campaign, 'type') === 'b2b2cEvent'
    const isB2B = get(this.state.campaign, 'type') === 'b2b'
    const isWhiteLabel = get(this.state.campaign, 'whiteLabel')
    const shouldWhiteLabel = isB2B && isWhiteLabel
    const isSchoolNotWhiteLabeled = isB2B2C || (isB2B && !isWhiteLabel)
    const currentSchoolData = currentSchoolDetails && currentSchoolDetails.toJS()
    if (this.props.isLoggedIn && this.state.firstMount && !isSchoolWebsite() && !isSubDomainActive && !this.props.registerationForEvent) {
      const query = qs.parse(window.location.search)
      const linkToken = get(query, 'authToken')
      const isLeadLogin = get(query, 'isLeadLogin')
      const loginDate = get(query, 'date')
      if (linkToken) {
        if (isLeadLogin) {
          localStorage.setItem('isLeadLogin', isLeadLogin)
        }
        if (loginDate) {
          localStorage.setItem('date', loginDate)
        }
      }
      if (this.state.redirectTo) {
        return <Redirect to={this.state.redirectTo} />
      }
      return <Redirect to='/sessions' />
    }
    if (!isDesktop && this.state.introSlide && this.state.pageLoading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh', backgroundImage: `url("${getPath(campaignPosterMobile)}")`, backgroundSize: '100%', backgroundColor: '#084baa' }}>
          <SimpleButtonLoader showLoader style={{ background: 'transparent', width: hs(150), height: hs(150) }} />
        </div>
      )
    }
    if (!isDesktop && this.state.introSlide && campaignPosterMobile) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', width: '100vw', height: '100vh', backgroundImage: `url("${getPath(campaignPosterMobile)}")`, backgroundSize: '100%' }}>
          <Button
            title='Continue'
            className='signup-or-login-campaign-continue'
            onClick={() => {
              this.setState({ introSlide: false })
            }}
          />
        </div>
      )
    }
    if (this.state.showBuddyLoginLoader) {
      return <>
        <div className='landing-page-bg-container' >
          <LoadingSpinner
            height='10vh'
            position='absolute'
            top='50%'
            left='50%'
            transform='translate(-50%,-50%)'
            borderWidth='6px'
            lottieType={spinnerLoader}
            showLottie
            flexDirection={'column'}
          >
            <span className='timetable-loading-text'></span>
          </LoadingSpinner>
        </div>
        <Footer />
      </>
    }
    if (extractSubdomain() && get(currentSchoolData, 'isOtpLoginEnabled')) {
      return <SchoolLiveClassLogin schoolDetails={{ logo: get(currentSchoolData, 'logo.uri'), code: get(currentSchoolData, 'code') }} batchDetails={currentSchoolData} isBuddyLoginEnabled={get(currentSchoolData, 'isBuddyLoginEnabled')} buddyLoginLimit={get(currentSchoolData, 'buddyLoginLimit')} />
    }
    if (isComponentModal) {
      let { registerationForEvent, userChildren } = this.props
      userChildren = userChildren && userChildren.toJS()
      return (
        <div className='signup-or-login-container'
          style={{
            zIndex: 9999,
            background: 'rgb(125, 138, 143, 0.7)',
            position: 'fixed',
            top: 0, left: 0,
          }}
        >

          <UserWaitListModal
            visible={false}
            closeWaitListModal={this.closeWaitListModal}
            phone={
              {
                phoneNumber: this.state.phone,
                countryCode: this.state.countryCode
              }
            }
            email={this.state.email}
          />
          <div className='signup-or-login-wrapper' style={{ justifyContent: 'center' }}>
            <div>
              <div className={cx([(this.state.grade && this.state.currentScreen === 'studentDetail' && this.state.schoolId && this.state.batchId) ? 'signup-or-login-body-with-section' : 'signup-or-login-body'], registerationForEvent && (userChildren || []).length >= 5 && 'radio-street')}>
                {isDesktop && (<div className={cx('signup-or-login-school-logo', shouldWhiteLabel && 'signup-login-none')} style={this.getSchoolLogoIfExists()}></div>)}
                {this.state.currentScreen !== 'slotBooking' && (
                  <div
                    className='signup-or-login-slideContainer'
                    style={this.getSlideContainerBgImage()}
                  ></div>
                )}
                <CloseIcon className='signup-or-login-modal-closeIcon' onClick={this.closeModal} />
                <div className='signup-or-login-form'>
                  {this.state.currentScreen === 'loginSignup' && this.renderLoginOrSignup()}
                  {this.state.currentScreen === 'multipleChild' && this.renderMultipleChildScreen('multipleChild')}
                  {(this.state.currentScreen === 'otpScreen') && this.renderOTP('otpScreen')}
                  {(this.state.currentScreen === 'passwordScreen') && this.renderPassword('passwordScreen')}
                  {this.state.currentScreen === 'studentDetail' && isRegisterationAllowed && this.renderStudentDetailsForm('studentDetail')}
                  {this.state.currentScreen === 'postOTPScreen' && this.renderOTP('postOTPScreen')}
                  {this.renderLoading()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
    const lottieWidth = window.innerWidth > 720 ? 260 : 460
    return (
      <div className='signup-or-login-container'>
        <Helmet>
          <link rel="canonical" href="https://www.tekie.in" />
          <title>Tekie - #1 Online coding platform for Kids - Get started for free.</title>
          <meta name="description" content="Engage Your Child in Coding on Python. Interactive Online Learning for Kids. No Previous Experience Needed."></meta>
          <meta name="keywords" content="tekie,tekie coding,tekie in,tekie app,tekie coding classes,tekie review,tekie classes,tekie india,tekie online coding,tekie online class,tekie online demo,python for kids,coding for kids,best python course for kids,python coding for kids, online coding platform for python, python online course for kids,best coding classes for kids,live online coding classes for kids, best coding classes for kids, best programming courses for kids,online coding programs for kids,programming classes for kids" />
        </Helmet>

        <ChatWidget />
        <UserWaitListModal
          visible={false}
          closeWaitListModal={this.closeWaitListModal}
          phone={
            {
              phoneNumber: this.state.phone,
              countryCode: this.state.countryCode
            }
          }
          email={this.state.email}
        />
        <div className='signup-or-login-wrapper'>
          <div className='signup-or-login-bg'></div>
          <div style={{ position: 'relative', width: '100%' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {isDesktop && !isSchoolNotWhiteLabeled && this.renderHeader()}
            </div>
            <div className={cx('signup-or-login-logo-container', isSchoolNotWhiteLabeled && 'signup-or-login-logo-container-column')}>
              {/* <div style={{
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                position: 'absolute',
                background: 'linear-gradient(180deg, #1E2F4F 0%, rgba(29, 52, 86, 0.63) 100%)',
              }}></div> */}
              {this.state.pageLoading && (
                <div
                  className={cx(
                    'signup-or-login-tekieLogo',
                    'signup-or-login-top-school-logo',
                    isSchoolNotWhiteLabeled && 'signup-or-login-tekieLogo-center',
                  )}
                  style={{ background: 'none', borderColor: 'transparent' }}
                ></div>
              )}
              {!this.state.pageLoading && (
                shouldWhiteLabel
                  ? (
                    <div
                      className={cx(
                        'signup-or-login-tekieLogo',
                        shouldWhiteLabel && 'signup-or-login-top-school-logo'
                      )}
                      style={
                        shouldWhiteLabel ? {
                          backgroundImage: `url(${getPath(get(this.state.campaign, 'schoolLogo.uri', ''))})`,
                        } : {}
                      }
                    ></div>
                  ) : (
                    <>
                      <a href='/' className={cx('signup-or-login-tekieLogo', isSchoolNotWhiteLabeled && 'signup-or-login-tekieLogo-center')} style={{ backgroundImage: 'none', border: 'none', textDecoration: 'none' }}>
                        <div
                          className={cx(
                            'signup-or-login-tekieLogo',
                            isSchoolNotWhiteLabeled && 'signup-or-login-tekieLogo-center',
                            shouldWhiteLabel && 'signup-or-login-top-school-logo'
                          )}
                          style={
                            shouldWhiteLabel ? {
                              backgroundImage: `url(${getPath(get(this.state.campaign, 'schoolLogo.uri', ''))})`,
                            } : {}
                          }
                        ></div>
                      </a>
                      {isSchoolNotWhiteLabeled && (
                        <>
                          <div className='signup-or-login-in-association'>in association with</div>
                          <div className='signup-or-login-school-name'>{get(this.state.campaign, 'schoolName', '')}</div>
                        </>
                      )}
                    </>
                  )
              )}
            </div>
          </div>
          <div>
            {isDesktop && !isSchoolNotWhiteLabeled && this.renderNavigation()}
            {
              loginViaLinkLoader ? (
                <Lottie
                  options={{
                    autoplay: true,
                    animationData: loginLoader,
                    loop: true,
                    rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
                  }}
                  style={{ height: `${hs(lottieWidth)}px`, marginBottom: '20px', opacity: '0.6' }}
                />
              ) : (
                <div className={cx([(this.state.grade && this.state.currentScreen === 'studentDetail' && this.state.schoolId && this.state.batchId) ? 'signup-or-login-body-with-section' : 'signup-or-login-body'], (this.state.currentScreen === 'slotBooking' || this.state.currentScreen === 'b2bRegistrationConfirmation') && 'auto')}>
                  {isDesktop && (<div className={cx('signup-or-login-school-logo', shouldWhiteLabel && 'signup-login-none')} style={{ backgroundImage: `url(${getPath(get(this.state.campaign, 'schoolLogo.uri', ''))})` }}></div>)}
                  {this.state.currentScreen !== 'slotBooking' && this.state.currentScreen !== 'b2bRegistrationConfirmation' && (
                    <div
                      className='signup-or-login-slideContainer'
                      style={campaignPoster ? { backgroundImage: `url(${getPath(campaignPoster)})` } : {}}
                    ></div>
                  )}
                  {this.state.currentScreen !== 'slotBooking' ? (
                    <div className='signup-or-login-form' style={currentScreen && { overflow: 'visible' }}>

                      {this.state.currentScreen === 'loginSignup' && this.renderLoginOrSignup()}
                      {(this.state.currentScreen === 'otpScreen') && this.renderOTP('otpScreen')}
                      {(this.state.currentScreen === 'passwordScreen') && this.renderPassword('passwordScreen')}
                      {this.state.currentScreen === 'studentDetail' && this.renderStudentDetailsForm('studentDetail')}
                      {this.state.currentScreen === 'postStudentDetail' && this.renderStudentDetailsForm('postStudentDetail')}
                      {this.state.currentScreen === 'postOTPScreen' && this.renderOTP('postOTPScreen')}
                      {this.state.currentScreen === 'b2bRegistrationConfirmation' && this.renderRegistrationConfirmation()}
                      {this.renderLoading()}
                    </div>
                  ) : (
                    <div className='signup-or-login-form'>
                      {this.renderSlot()}
                      {this.renderLoading()}
                    </div>
                  )}
                </div>
              )
            }
            {/* {isB2B2C && (
              <div className='signup-or-login-book-now-banner'>
                  <div className='signup-or-login-medal'></div>
                  <div>Book Now and Get Certified!</div>
              </div>
            )} */}

          </div>
        </div>
        {this.renderTeamFrom()}
      </div>
    )
  }
}

export default connect((state) => ({
  parentId: filterKey(state.data.getIn(['user', 'data']), 'validateOTP').getIn([0, 'parent', 'id'], false) || filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
  userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) || filterKey(state.data.getIn(['user', 'data']), 'validateOTP').getIn([0, 'id'], false),
  loggedInUserId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id']),
  loggedInUser: pickOne(
    filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0], Map({})),
    filterKey(state.data.getIn(['user', 'data']), 'validateOTP').getIn([0], Map({}))
  ),
  studentProfileId: filterKey(state.data.getIn(['studentProfile', 'data']), 'loggedinUser').getIn([0, 'id'], false),
  ...validateUserOTP({ phone: 'a', countryCode: 'a', otp: 'a' }).mapStateToProps(state),
  // ...signUpMentee().mapStateToProps(),
  currentSchoolDetails: state.data.getIn(['schoolDetails', 'data']),
  error: state.data.getIn(['errors', 'user/fetch', state.data.getIn(['errors', 'user/fetch'], List([])).size - 1, 'error', 'errors', 0, 'message']),
  otpSuccess: state.data.getIn(['user', 'fetchStatus', 'validateOTP', 'success']),
  otpFailure: state.data.getIn(['user', 'fetchStatus', 'validateOTP', 'failure']),
  name: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'name'], '') || filterKey(state.data.getIn(['user', 'data']), 'validateOTP').getIn([0, 'name'], ''),
  userData: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser'),
  userRole: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'role'], false) || filterKey(state.data.getIn(['user', 'data']), 'validateOTP').getIn([0, 'role'], false),
  isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
    state.data.getIn(['userChildren', 'data']).size,
  userSource: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'parent', 'source'], ''),
  userChildren: state.data.getIn(['userChildren', 'data']),
  userParent: state.data.getIn(['userParent', 'data', 0], Map({})),
  studentProfileIdConnect: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0], false) || filterKey(state.data.getIn(['user', 'data']), 'validateOTP').getIn([0], false),
  isUpdatingEvent: state.data.getIn(['events', 'updateStatus', 'events', 'loading']),
  hasUpdatedEvent: state.data.getIn(['events', 'updateStatus', 'events', 'success']),
  hasUpdatingEventFailed: state.data.getIn(['events', 'updateStatus', 'events', 'failure']),
  updateEventFailedMessage: state.data.getIn(['errors', 'events/update', 0]),
  eventDetails: state.data.getIn(['events', 'data', 0]),
  hasMultipleChildren: state.data.getIn(['userChildren', 'data']).size > 1,
}))(withRouter(SignupLogin))