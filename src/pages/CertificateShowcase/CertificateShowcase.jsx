import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import ReactToolTip from 'react-tooltip'
import { motion } from 'framer-motion'
import { get, capitalize } from 'lodash'
import { ImageBackground } from '../../image'
// import { Toaster } from '../../components/Toaster'
import getPath from '../../utils/getPath'
import fetchUserCourseCertificate from '../../queries/fetchUserCourseCertificate'
import { COURSES, PYTHON_COURSE, PYTHON_COURSE_BACKEND } from '../../config'
import AuthModalContainer from '../CodeShowcaseModule/components/AuthModalContainer'
import { decodeSlugID } from '../../utils/slugifyContent'

import '../../scss/photon.scss'
import './CertificateShowcase.scss'
import { filterKey } from '../../utils/data-utils'
import { List } from 'immutable'
import classNames from 'classnames'
import ShareOverlay from '../Invite/component/ShareOverlay/ShareOverlay'

const getUserCourseCertificate = (userCourseCertificate) => {
  if (userCourseCertificate && userCourseCertificate.toJS) {
    return userCourseCertificate.toJS()
  }
  return {}
}

export default class CertificateShowcase extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isSignInModalVisible: false,
      isSignUpModalVisible: false,
      userCourseCertificate: getUserCourseCertificate(this.props.userCourseCertificate),
      shareCodeDetails: {
        id: null,
        approvedFileName: null,
        studentName: null,
      }
    }
  }

  async componentDidMount() {
    if (this.props.match.params.code) {
      if (!get(this.state.userCourseCertificate, 'userId')) {
        await fetchUserCourseCertificate(decodeSlugID(this.props.match.params.code)).call()
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userCourseCertificate !== this.props.userCourseCertificate) {
      const userCourseCertificate = this.props.userCourseCertificate && this.props.userCourseCertificate.toJS()
      this.setState({
        userCourseCertificate
      })
    }
  }

  renderHeader = () => (
    <motion.div className='cert-showcase-header-container'>
      <ImageBackground
        className='cert-showcase-header-tekieLogo'
        src={require('../../assets/tekieLogo_lossless.webp')}
        srcLegacy={require('../../assets/tekieLogo.png')}
        onClick={() => {
          this.props.history.push('/')
        }}
        style={{ cursor: 'pointer', marginLeft: '10px' }}
      />
      <div style={{ display: 'flex' }}>
        <a
          href="/"
          className='cert-showcase-exploreTekieBtn'
        >
          Explore Tekie
        </a>
        <div className='cert-showcase-header-login-btn' onClick={() => {
          if (this.props.isLoggedIn) {
            if (this.props.userRole !== 'mentee') {
              this.props.history.push('/learn')
            } else {
              this.props.history.push('/sessions')
            }
          } else {
            // this.setState({
            //   isSignInModalVisible: true
            // })
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

  renderCourseSnapShotDetails = ({ title, description }) => (
    <div className='cert-showcase-courseSnapshot-column'>
      <div className='cert-showcase-courseSnapshot-title'>{title}</div>
      <div
        className={`cert-showcase-courseSnapshot-description ${title === 'Proficiency' ? 'cert-showcase-courseSnapshot-tag' : ''}`}
      >
        {description}
      </div>
    </div>
  )

  renderCourseSnapShotAndCourseDetails = (userCourseCertificate, mentors) => (
    <>
      <div>
        <div className='cert-showcase-courseSnapshot-header'>Course Snapshot</div>
        <div className='cert-showcase-courseSnapshot-row'>
          {/* {get(userCourseCertificate, 'projectsCount') && (
            this.renderCourseSnapShotDetails({ title: 'Projects', description: get(userCourseCertificate, 'projectsCount') })
          )} */}
          {this.renderCourseSnapShotDetails({ title: 'Duration', description: get(userCourseCertificate, 'courseDuration') })}
        </div>
        <div className='cert-showcase-courseSnapshot-row'>
          {mentors && (
            this.renderCourseSnapShotDetails({ title: 'Mentors', description: mentors })
          )}
          {this.renderCourseSnapShotDetails({ title: 'Proficiency', description: get(userCourseCertificate, 'proficiency') })}
        </div>
      </div>
      <span className='cert-showcase-divider' />
      <div>
        <div className='cert-showcase-courseDetails-header'> About the Course </div>
        <div className='cert-showcase-courseDetails-container'>
          <span
            style={{
              background: this.getCourseBackdrop()
            }}
            className='cert-showcase-courseDetails-bgBlur'
          />
          <ImageBackground
            src={`${getPath(get(userCourseCertificate, 'courseThumbnail.uri'))}?${Date.now()}`}
            srcLegacy={`${getPath(get(userCourseCertificate, 'courseThumbnail.uri'))}?${Date.now()}`}
            className='cert-showcase-courseImage'
          />
          <div className='cert-showcase-courseDetails'>
            <span className='cert-showcase-subHead'>{get(this.getCourseDetails(), 'course.secondaryCategory')}</span>
            <span className='cert-showcase-details-header'>
              {this.getCourseNameMapping()}
            </span>
            <span className='cert-showcase-grade-details'>
              {this.getCourseGradeString()}
            </span>
            <div
              onClick={this.openLoginModal}
              className='cert-showcase-details-viewBtn'>
              VIEW COURSE
              <span className='cert-showcase-externalIcon' />
            </div>
          </div>
          <div
            onClick={this.openLoginModal}
            className='cert-showcase-details-viewBtn-mobileOnly'>
            VIEW COURSE
            <span className='cert-showcase-externalIcon' />
          </div>
        </div>
      </div>
    </>
  )

  renderMentorsName = () => {
    const { userCourseCertificate } = this.state
    if (get(userCourseCertificate, 'mentors', []).length) {
      return (
        <>
          <span>
            {get(userCourseCertificate, 'mentors', [])[0]}
          </span>
          {get(userCourseCertificate, 'mentors', []).length > 1 ? (
            <>
              <span
                data-for='mentors'
                data-tip={get(userCourseCertificate, 'mentors', []).slice(1).map(name => `${name}\n`)}
                data-iscapture='true'
                className='cert-showcase-moreTag'>
                +{get(userCourseCertificate, 'mentors', []).length - 1}
              </span>
              <ReactToolTip
                id='mentors'
                place='right'
                effect='float'
                multiline={false}
                className='photon-input-tooltip cn-tooltip'
                arrowColor='#00ADE6'
                backgroundColor='#00ADE6'
                textColor='#FFF'
              />
            </>
          ) : null}
        </>
      )
    }
    return null
  }

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
          redirectURL: `/course-completion/${this.props.match.params.code}`
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
    // this.setState({
    //   isSignInModalVisible: true
    // })
  }

  onShareButtonClick = () => {
    this.setState({
      shareCodeDetails: {
        id: decodeSlugID(this.props.match.params.code),
        courseName: capitalize(this.getCourseNameMapping()),
        studentName: get(this.state.userCourseCertificate, 'name'),
      },
      visibleShareOverlay: true
    })
  }

  closeShareOverlay = () => {
    this.setState({
      visibleShareOverlay: false
    })
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

  checkIfDownloadAndShareEnabled = () => {
    if (typeof window !== 'undefined') {
      const user = filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser') || List({})
      if (!user || !user.getIn([0, 'parent', 'parentProfile', 'children'])) {
        return true
      }
      const userId = user.getIn([0, 'id'])
      const certificateUserId = get(this.state, 'userCourseCertificate.userId')
      if (this.props.isLoggedIn) {
        if (certificateUserId === userId) {
          return true
        }
        return false
      }
    }
    return true
  }

  render() {
    const { userCourseCertificate } = this.state
    if (get(this.props, 'userCourseCertificateNotFound', false)) {
      this.props.history.push('/')
    }
    return (
      <div>
        <Helmet>
          <link rel="canonical" href="https://www.tekie.in" />
          <title>Proof of Completion - Tekie</title>
          <meta name="description" content={`This certificate verifies my successful completion of ${this.getCourseNameMapping()}. Tekie is the world’s first educational series for coding that provides one of the best live online coding classes for kids.`} />
          <meta name="image" content={getPath(get(userCourseCertificate, 'certificate.uri'))} />
          <meta property="og:title" content={`Completion Certificate for ${this.getCourseNameMapping()}`} />
          <meta property="og:description" content={`This certificate verifies my successful completion of ${this.getCourseNameMapping()}.  Tekie is the world’s first educational series for coding that provides one of the best live online coding classes for kids.`} />
          <meta property="og:image" content={getPath(get(userCourseCertificate, 'certificate.uri'))} />
          <meta property="twitter:title" content={`Completion Certificate for ${this.getCourseNameMapping()}`} />
          <meta property="twitter:description" content={`This certificate verifies my successful completion of ${this.getCourseNameMapping()}. Tekie is the world’s first educational series for coding that provides one of the best live online coding classes for kids.`} />
          <meta property="twitter:image:src" content={getPath(get(userCourseCertificate, 'certificate.uri'))} />
          <meta property="twitter:image" content={getPath(get(userCourseCertificate, 'certificate.uri'))} />
          <meta property="twitter:card" content="summary" />
        </Helmet>
        {this.renderHeader()}

        <div className='cert-showcase-container'>
          {get(this.props, 'isUserCourseCertificateLoading', true) ? (
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
                    <span>{capitalize(get(userCourseCertificate, 'name'))}'s</span> account is verified. Tekie certifies their successful completion of <span>{this.getCourseNameMapping()}.</span> course on <span>{get(userCourseCertificate, 'courseEndingDate')}</span>
                    {this.checkIfDownloadAndShareEnabled() && (
                      <div className='cert-showcase-component-buttons-container'>
                        <motion.div
                          whileTap={{
                            scale: 0.95
                          }}
                          className={classNames({
                            'cert-showcase-btnDisabled': !this.props.isLoggedIn
                          })}
                          onClick={() => {
                            if (!this.props.isLoggedIn) {
                              this.props.history.push('/login')
                            }
                          }}
                        >
                          <a
                            href={getPath(get(userCourseCertificate, 'certificate.uri'))}
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
                            'cert-showcase-btnDisabled': !this.props.isLoggedIn
                          })}
                          onClick={() => {
                            if (this.props.isLoggedIn) {
                              this.onShareButtonClick();
                            } else {
                              if (navigator && navigator.share) {
                                navigator
                                  .share({
                                    title: `${capitalize(
                                      this.getCourseNameMapping()
                                    )} Completion Certificate.`,
                                    text: `Hi, check out my course completion certificate from Tekie.\nCourse: ${capitalize(
                                      this.getCourseNameMapping()
                                    )}`,
                                    url: `${import.meta.env.REACT_APP_TEKIE_WEB_URL}/course-completion/${this.props.match.params.code}`,
                                  })
                                  .then(() => console.log("Successful share"))
                                  .catch((error) =>
                                    console.log("Error sharing", error)
                                  );
                              } else {
                                this.props.history.push('/login')
                              }
                            }
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          SHARE <span className='cert-showcase-component-shareIcon' />
                        </motion.div>
                      </div>
                    )}
                  </p>
                  <div className='cert-showcase-desktopOnly'>
                    {this.renderCourseSnapShotAndCourseDetails(userCourseCertificate, this.renderMentorsName())}
                  </div>
                </div>
              </div>
              <div className='cert-showcase-innerContainer'>
                <img
                  style={{ maxWidth: '100%' }}
                  src={getPath(get(userCourseCertificate, 'certificate.uri'))} alt="Proof of Completion"></img>
              </div>
              <div className='cert-showcase-mobileOnly cert-showcase-details-container'>
                {this.renderCourseSnapShotAndCourseDetails(userCourseCertificate, this.renderMentorsName())}
              </div>
              <div
                onClick={() => {
                  this.props.history.push('/')
                }}
                className='cert-showcase-exploreTekieBtn-mobile'
              >
                Explore Tekie
                <span className='cert-showcase-Arrowicon' />
              </div>
            </>
          )}
        </div>
        {this.renderFooter()}
        <AuthModalContainer
          isSignInModalVisible={this.state.isSignInModalVisible}
          isSignUpModalVisible={this.state.isSignUpModalVisible}
          closeLoginModal={this.closeLoginModal}
          openEnrollmentForm={() => {
            this.setState({
              isSignUpModalVisible: true
            })
          }}
          closeSignupModal={() => {
            this.setState({
              isSignUpModalVisible: false
            })
          }}
        />
        <ShareOverlay
          visible={this.state.visibleShareOverlay}
          closeOverlay={this.closeShareOverlay}
          shareUrl={`${import.meta.env.REACT_APP_TEKIE_WEB_URL}/course-completion/${this.props.match.params.code}`}
          title={`Hi, check out my course completion certificate from Tekie.\nCourse: ${this.state.shareCodeDetails.courseName} successfully completed by ${capitalize(this.state.shareCodeDetails.studentName)}\n`}
        />
      </div>
    )
  }
}

CertificateShowcase.serverFetch = async (params = {}) => {
  if (params.code) {
    const completionId = decodeSlugID(params.code)
    await fetchUserCourseCertificate(completionId).call()
  }
}