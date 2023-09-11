import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import ReactToolTip from 'react-tooltip'
import { motion } from 'framer-motion'
import { get, capitalize } from 'lodash'
import { ImageBackground } from '../../image'
import { Toaster } from '../../components/Toaster'
import getPath from '../../utils/getPath'
import fetchUserCourseCertificate from '../../queries/fetchUserCourseCertificate'
import { COURSES, PRIMARY_BUTTON_DEFAULT_TEXT, PYTHON_COURSE, PYTHON_COURSE_BACKEND, WAITINGMODAL_ROUTE } from '../../config'
import AuthModalContainer from '../CodeShowcaseModule/components/AuthModalContainer'
import { decodeSlugID } from '../../utils/slugifyContent'

import '../../scss/photon.scss'
import './EventCertificateShowcase.scss'
import fetchEventCertificate from '../../queries/fetchEventCertificate'
import { Document, Page, pdfjs } from 'react-pdf'
import ShareOverlay from '../Invite/component/ShareOverlay/ShareOverlay'
import { filterKey } from 'duck-state/lib/State'
import { List } from 'immutable'
import classNames from 'classnames'

const getUserCourseCertificate = (userCourseCertificate) => {
  if (userCourseCertificate && userCourseCertificate.toJS) {
    return userCourseCertificate.toJS()
  }
  return {}
}

export default class EventCertificateShowcase extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isSignInModalVisible: false,
      isSignUpModalVisible: false,
      userCourseCertificate: getUserCourseCertificate(this.props.userCourseCertificate),
      eventCertificate: null,
      visibleShareOverlay: false,
      shareCodeDetails: {
        id: null,
        approvedFileName: null,
        studentName: null,
      },
    }
    this.pdfDocument = React.createRef()
  }

  async componentDidMount() {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
    if (this.props.match.params.code) {
      await fetchEventCertificate(decodeSlugID(this.props.match.params.code)).call()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userCourseCertificate !== this.props.userCourseCertificate) {
      const userCourseCertificate = this.props.userCourseCertificate && this.props.userCourseCertificate.toJS()
      this.setState({
        userCourseCertificate
      })
    }
    if ((prevProps.eventCertificate !== this.props.eventCertificate) || !this.state.eventCertificate) {
      const eventCertificate = this.props.eventCertificate && this.props.eventCertificate.toJS()
      this.setState({
        eventCertificate
      })
    }
  }

  renderHeader = () => (
    <motion.div className='cert-showcase-header-container'>
      <a href="/">
        <ImageBackground
          className='cert-showcase-header-tekieLogo'
          src={require('../../assets/tekieLogo_lossless.webp')}
          srcLegacy={require('../../assets/tekieLogo.png')}
          style={{ cursor: 'pointer', marginLeft: '10px' }}
        />
      </a>
      <div style={{ display: 'flex' }}>
        {/* {!this.props.isLoggedIn && (
          <a
            className='cert-showcase-exploreTekieBtn'
            href={WAITINGMODAL_ROUTE}
          >
            {PRIMARY_BUTTON_DEFAULT_TEXT}
          </a>
        )} */}
        <div className='cert-showcase-header-login-btn' onClick={() => {
          if (this.props.isLoggedIn) {
            if (this.props.userRole !== 'mentee') {
              this.props.history.push('/learn')
            } else {
              this.props.history.push('/sessions')
            }
          } else {
            this.props.history.push('/login')
          }
        }} style={{
          display: 'flex'
        }}>{this.props.isLoggedIn ? 'Go to App' : 'Login'}</div>
      </div>
    </motion.div>
  )

  renderFooter = () => (
    <div className={'cert-showcase-footer-container'}>
      <div className={'cert-showcase-footer-leftContainer'}>
        <ImageBackground
          src={require('../../assets/tekieDropLogo.png')}
          srcLegacy={require('../../assets/tekieDropLogo.png')}
          className={'cert-showcase-footer-TekieLogo'}
        />
        <span>© 2020, Kiwhode Learning Pvt Ltd. All Rights Reserved.</span>
      </div>
      <div className={'cert-showcase-footer-rightContainer'}>
        <Link to="/privacy" className='cert-showcase-footer-privacyAndTerms'>
          <span>Privacy</span>
        </Link>
        <Link to="/terms" className='cert-showcase-footer-privacyAndTerms'>
          <span>Terms</span>
        </Link>
      </div>
    </div>
  )

  getCourseNameMapping = () => {
    const { userCourseCertificate } = this.state
    if (get(userCourseCertificate, 'courseName') === PYTHON_COURSE_BACKEND) {
      return PYTHON_COURSE
    }
    return capitalize(get(userCourseCertificate, 'courseName'))
  }

  checkIfMulitpleChildrenExists = () => {
    const { hasMultipleChildren } = this.props
    if (hasMultipleChildren) {
      this.props.history.push({
        pathname: '/switch-account',
        state: {
          redirectURL: `/event-certificate/${this.props.match.params.code}`
        }
      })
    }
  }

  closeLoginModal = () => {
    const { isLoggedIn } = this.props;
    if (isLoggedIn) {
      this.checkIfMulitpleChildrenExists()
    }
    this.setState({
      isSignInModalVisible: false
    })
  }

  openLoginModal = () => {
    const { isLoggedIn } = this.props;
    if (isLoggedIn) {
      return null
    }
    this.props.history.push('/login')
  }

  getCourseDetails = () => {
    let { userCourseCertificate } = this.state
    const courseDetails = COURSES.filter(el => get(userCourseCertificate, 'courseId') === get(el, 'course.id'))[0]
    return courseDetails || null
  }

  getCourseGradeString = () => {
    const courseDetails = this.getCourseDetails()
    if (courseDetails && get(courseDetails, 'grade')) {
      return `Class ${get(courseDetails, 'grade')[0]} - ${get(courseDetails, 'grade')[get(courseDetails, 'grade').length - 1]}`
    }
    return null
  }

  getCourseBackdrop = () => {
    const courseDetails = this.getCourseDetails()
    if (courseDetails && get(courseDetails, 'course.color.backdrop')) {
      return get(courseDetails, 'course.color.backdrop')
    }
    return ''
  }

  getPdfLoader = () => (
    <span className='cert-showcase-loader' />
  )

  onShareButtonClick = () => {
    this.setState({
      shareCodeDetails: {
        id: decodeSlugID(this.props.match.params.code),
        eventName: get(this.state.eventCertificate, 'eventName'),
        studentName: get(this.state.eventCertificate, 'name'),
      },
      visibleShareOverlay: true
    })
  }

  closeShareOverlay = () => {
    this.setState({
      visibleShareOverlay: false
    })
  }

  checkIfDownloadAndShareEnabled = () => {
    const user = filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser') || List({})
    if (!user || !user.getIn([0, 'parent', 'parentProfile', 'children'])) {
      return true
    }
    const userId = user.getIn([0, 'id'])
    const certificateUserId = get(this.state.eventCertificate, 'userId')
    if (this.props.isLoggedIn) {
      if (get(this.state.eventCertificate, 'assetUrl') && (certificateUserId === userId)) {
        return true
      }
      return false
    }
    return true
  }

  render() {
    const { userCourseCertificate } = this.state
    if (get(this.props, 'eventCertificateNotFound', false)) {
      this.props.history.push('/')
    }
    return (
      <div>
        <Helmet>
          <link rel="canonical" href="https://www.tekie.in" />
          <title>Proof of Completion - Tekie</title>
          <meta name="description" content={`This certificate verifies my successful completion of ${get(this.state.eventCertificate, 'eventName')}. Tekie is the world’s first educational series for coding that provides one of the best live online coding classes for kids.`} />
          <meta name="image" content={getPath(get(this.state.eventCertificate, 'assetUrl'))} />
          <meta property="og:title" content={`Completion Certificate for ${get(this.state.eventCertificate, 'eventName')}`} />
          <meta property="og:description" content={`This certificate verifies my successful completion of ${get(this.state.eventCertificate, 'eventName')}.  Tekie is the world’s first educational series for coding that provides one of the best live online coding classes for kids.`} />
          <meta property="og:image" content={getPath(get(this.state.eventCertificate, 'assetUrl'))} />
          <meta property="twitter:title" content={`Completion Certificate for ${get(this.state.eventCertificate, 'eventName')}`} />
          <meta property="twitter:description" content={`This certificate verifies my successful completion of ${get(this.state.eventCertificate, 'eventName')}. Tekie is the world’s first educational series for coding that provides one of the best live online coding classes for kids.`} />
          <meta property="twitter:image:src" content={getPath(get(this.state.eventCertificate, 'assetUrl'))} />
          <meta property="twitter:image" content={getPath(get(this.state.eventCertificate, 'assetUrl'))} />
          <meta property="twitter:card" content="summary" />
        </Helmet>
        {this.renderHeader()}

        <div className='cert-showcase-container'>
          {get(this.props, 'isEventCertificateLoading', true) ? (
            <span className='cert-showcase-loader' />
          ) : (
            <>
              <div className='cert-showcase-innerContainer'>
                <div className='cert-showcase-details-container'>
                  <div className="cert-showcase-verified">
                    <span className='cert-showcase-checkmark-icon' />
                    Certificate Verified
                  </div>
                  <p className="cert-showcase-text">
                    <span>{capitalize(get(this.state.eventCertificate, 'name'))}</span><div style={{ display: 'inline', fontWeight: 'bold' }}>'s</div> account is verified. Tekie certifies their successful completion of <span>{get(this.state.eventCertificate, 'eventName')}.</span>
                  </p>
                  {this.checkIfDownloadAndShareEnabled() && (
                    <div className='cert-showcase-component-buttons-container'>
                      <motion.div
                        whileTap={{
                          scale: 0.95
                        }}
                        className={classNames({
                          btnDisabled: !this.props.isLoggedIn
                        })}
                        onClick={() => {
                          if (!this.props.isLoggedIn) {
                            this.props.history.push('/login')
                          }
                        }}
                      >
                        <a
                          href={import.meta.env.REACT_APP_FILE_BASE_URL + '/' + get(this.state.eventCertificate, 'assetUrl')}
                          download={`${this.props.match.params.code}-certificate.pdf`}
                          id='courseCompletionCertificateDownloadBtn'
                          className='cert-showcase-component-download-button'
                        >
                          DOWNLOAD
                        </a>
                      </motion.div>
                      <motion.div
                        className={classNames({
                          'cert-showcase-component-share-button': true,
                          btnDisabled: !this.props.isLoggedIn
                        })}
                        onClick={() => {
                          if (this.props.isLoggedIn) {
                            this.onShareButtonClick()
                          } else {
                            this.props.history.push('/login')
                          }
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        SHARE <span className='cert-showcase-component-shareIcon' />
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>
              <div className='cert-showcase-innerContainer' ref={this.pdfDocument}>
                <div className='cert-showcase-desktopOnly'>
                  <Document
                    file={import.meta.env.REACT_APP_FILE_BASE_URL + '/' + get(this.state.eventCertificate, 'assetUrl')}
                    loading={this.getPdfLoader()}
                  >
                    <Page
                      width={get(this.pdfDocument, 'current.offsetWidth', 1000) - 100}
                      pageNumber={1}
                    />
                  </Document>
                </div>
                <div className='cert-showcase-mobileOnly cert-showcase-details-container'>
                  <Document
                    file={import.meta.env.REACT_APP_FILE_BASE_URL + '/' + get(this.state.eventCertificate, 'assetUrl')}
                    loading={this.getPdfLoader()}
                  >
                    <Page
                      width={get(this.pdfDocument, 'current.offsetWidth', 1000)}
                      pageNumber={1}
                    />
                  </Document>
                </div>
              </div>
              {/* <div
                onClick={() => {
                  if (window) window.location.replace(WAITINGMODAL_ROUTE)
                }}
                className='cert-showcase-exploreTekieBtn-mobile'
              >
                {PRIMARY_BUTTON_DEFAULT_TEXT}
                <span className='cert-showcase-Arrowicon' />
              </div> */}
            </>
          )}
        </div>
        {this.renderFooter()}
        <AuthModalContainer
          isSignInModalVisible={this.state.isSignInModalVisible}
          isSignUpModalVisible={false}
          closeLoginModal={this.closeLoginModal}
          openEnrollmentForm={() => {
            this.props.history.push('/signup')
          }}
          closeSignupModal={() => { }}
        />
        <ShareOverlay
          visible={this.state.visibleShareOverlay}
          closeOverlay={this.closeShareOverlay}
          shareUrl={`${import.meta.env.REACT_APP_TEKIE_WEB_URL}/event-certificate/${this.props.match.params.code}`}
          title={`Hi, check out my certificate from Tekie.\n ${this.state.shareCodeDetails.eventName} successfully completed by ${capitalize(this.state.shareCodeDetails.studentName)}\n`}
        />
      </div>
    )
  }
}

// EventCertificateShowcase.serverFetch = async (params = {}) => {
//   if (params.code) {
//     const completionId = decodeSlugID(params.code)
//     await fetchUserCourseCertificate(completionId).call()
//   }
// }