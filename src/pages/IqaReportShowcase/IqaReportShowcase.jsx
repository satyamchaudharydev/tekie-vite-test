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
import './IqaReportShowcase.scss'
import fetchUserCourse from '../../queries/fetchUserCourse.js'
import { Document, Page, pdfjs } from 'react-pdf'
import ShareOverlay from '../Invite/component/ShareOverlay/ShareOverlay'
import { filterKey } from 'duck-state/lib/State'
import { List } from 'immutable'
import classNames from 'classnames'
import rightb from '../../assets/rightb.png';
import right from '../../assets/right.png';
import left from '../../assets/left.png';

export default class IqaReportShowcase extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isSignInModalVisible: false,
      isSignUpModalVisible: false,
      visibleShareOverlay: false,
      shareCodeDetails: {
        id: null,
        approvedFileName: null,
        studentName: null,
      },
      userCourse: null
    }
    this.pdfDocument1 = React.createRef()
    this.pdfDocument2 = React.createRef()
  }

  async componentDidMount() {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
    if (this.props.match.params.code) {
      await fetchUserCourse(decodeSlugID(this.props.match.params.code)).call()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userCourse !== this.props.userCourse) {
      const userCourse = this.props.userCourse && this.props.userCourse.toJS()
      this.setState({
        userCourse
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

  checkIfMulitpleChildrenExists = () => {
    const { hasMultipleChildren } = this.props
    if (hasMultipleChildren) {
      this.props.history.push({
        pathname: '/switch-account',
        state: {
          redirectURL: `/iqa-report/${this.props.match.params.code}`
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

  getPdfLoader = () => (
    <span className='cert-showcase-loader' />
  )

  onShareButtonClick = () => {
    this.setState({
      shareCodeDetails: {
        id: decodeSlugID(this.props.match.params.code),
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
    const certificateUserId = get(this.state.userCourse, '[0].user.id')
    if (this.props.isLoggedIn) {
      if (certificateUserId === userId) {
        return true
      }
      return false
    }
    return true
  }

  render() {
    const { userCourse } = this.state
    const studentName = capitalize(get(userCourse, '[0].user.name', '-'));
    const parentName = capitalize(get(userCourse, '[0].user.studentProfile.parents[0].user.name', '-'));
    const iqaScore = get(userCourse, '[0].iqaReport[0].iqaScore', 70);
    const maxScore = get(userCourse, '[0].iqaReport[0].maximumScore', 100);
    const iqaReport = get(userCourse, '[0].iqaReport', []);
    // console.log('studentName', studentName);
    // console.log('parentName', parentName);
    // console.log('userCourse', userCourse);
    // if (get(this.props, 'userCourseeNotFound', false)) {
    //   this.props.history.push('/')
    // }
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

        <AuthModalContainer
          isSignInModalVisible={this.state.isSignInModalVisible}
          isSignUpModalVisible={false}
          closeLoginModal={this.closeLoginModal}
          openEnrollmentForm={() => {
            // this.props.history.push('/signup')
            if (window) window.location.replace(WAITINGMODAL_ROUTE)
          }}
          closeSignupModal={() => { }}
        />
        <ShareOverlay
          visible={this.state.visibleShareOverlay}
          closeOverlay={this.closeShareOverlay}
          shareUrl={`${import.meta.env.REACT_APP_TEKIE_WEB_URL}/iqa-report/${this.props.match.params.code}`}
          title={`Hi, Checkout my performance report in Tekie's assessment!`}
        />
        <div className="cert-showcase-container"  >
          <img src={rightb} className="rightb" alt="" />
          <div className="my-container" >
            <img src={right} className="image-right" alt="" />
            {/* <img src={left} className="image-left" alt="" /> */}
            {
              (iqaReport && iqaReport.length) ?
                <>
                  <div className="title" >
                    {studentName}'s IQA Report and Certificate
                  </div>
                  <p className="p" >
                    Dear {parentName},
                  </p>
                  <p className="p" >
                    Thank you for taking the <b>IQ assessment for {studentName}.</b>
                  </p>
                  <p className="p" >
                    <b>Tekie's IQ Assessment</b> is an expert-assisted assessment that tracks student's skill development and
                    gives actionable insights to plan their academic path. The student is assessed on key skills that are
                    essential to succeed in future careers. You will be able to check their progress through a personalized
                    report.
                  </p>
                  <p className="p" >
                    First, we would like to <b>congratulate you for the job well done on student name's logical thinking skills
                      and flair for technology</b>. We found {studentName}'s performance remarkable with a score of <b style={{ color: "#00ADE6" }} >
                      {iqaScore < 70 ? 70 : iqaScore} of {maxScore}</b> and are confident that he/she will thrive with the right guidance and a positive learning
                    environment.
                  </p>
                  <p className="link" >
                    You can download student name IQA and certificate of merit here.
                  </p>
                </> : <>
                  <div className="title" >
                    {studentName}'s Demo Certificate
                  </div>
                  <p className="p" >
                    Dear {parentName}
                  </p>
                  <p className="p" >
                    Thank you for taking the <b>Demo class for {studentName}</b>
                  </p>
                  <p className="p" >
                    <b>Tekie's Free Coding Session</b> gives students an opportunity to explore Coding through storytelling with personal guidance from a computer-science expert. Our mentor closely examines the student's logical thinking skills and problem-solving aptitude during the session.
                  </p>
                  <p className="p" >
                    First, we would like to <b>congratulate  you on the bright potential shown by {studentName}</b>. Your child has a flair for technology and an innovative mindset that can thrive with the right guidance and future-ready skills.
                  </p>
                  <p className="link" >
                    You can download their Certificate of Merit here.
                  </p>
                </>
            }
            <div className='blue-container'>
              <div className='cert-showcase-innerContainer' ref={this.pdfDocument1}>
                <div className='cert-showcase-desktopOnly'>
                  <Document
                    file={import.meta.env.REACT_APP_FILE_BASE_URL + '/' + get(this.state.userCourse, '[0].demoCompletion[0].assetUrl')}
                    loading={this.getPdfLoader()}
                  >
                    <Page
                      width={get(this.pdfDocument1, 'current.offsetWidth', 1000) - 200}
                      pageNumber={1}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                </div>
                <div className='cert-showcase-mobileOnly'>
                  <Document
                    file={import.meta.env.REACT_APP_FILE_BASE_URL + '/' + get(this.state.userCourse, '[0].demoCompletion[0].assetUrl')}
                    loading={this.getPdfLoader()}
                  >
                    <Page
                      width={get(this.pdfDocument1, 'current.offsetWidth', 1000)}
                      pageNumber={1}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                </div>
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
                        href={import.meta.env.REACT_APP_FILE_BASE_URL + '/' + get(this.state.userCourse, '[0].demoCompletion[0].assetUrl')}
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
                      SHARE
                    </motion.div>
                  </div>
                )}
              </div>
              {
                (iqaReport && iqaReport.length) ?
                  <div className='cert-showcase-innerContainer' ref={this.pdfDocument2}>
                    <div className='cert-showcase-desktopOnly'>
                      <Document
                        file={import.meta.env.REACT_APP_FILE_BASE_URL + '/' + get(this.state.userCourse, '[0].iqaReport[0].assetUrl')}
                        loading={this.getPdfLoader()}
                      >
                        <Page
                          width={get(this.pdfDocument2, 'current.offsetWidth', 1000) / 4}
                          pageNumber={1}
                          renderAnnotationLayer={false}
                        />
                      </Document>
                    </div>
                    <div className='cert-showcase-mobileOnly'>
                      <Document
                        file={import.meta.env.REACT_APP_FILE_BASE_URL + '/' + get(this.state.userCourse, '[0].iqaReport[0].assetUrl')}
                        loading={this.getPdfLoader()}
                      >
                        <Page
                          width={get(this.pdfDocument2, 'current.offsetWidth', 1000)}
                          pageNumber={1}
                          renderAnnotationLayer={false}
                        />
                      </Document>
                    </div>
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
                            href={import.meta.env.REACT_APP_FILE_BASE_URL + '/' + get(this.state.userCourse, '[0].iqaReport[0].assetUrl')}
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
                          SHARE
                        </motion.div>
                      </div>
                    )}
                  </div> : null
              }
              <div></div>
            </div>
          </div>
        </div>
        {this.renderFooter()}
      </div>
    )
  }
}
