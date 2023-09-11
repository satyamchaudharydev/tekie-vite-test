import React, { Component } from 'react'
import { withRouter, Link } from 'react-router-dom'
import qs from 'query-string'
import Style from 'style-it'
import { get } from 'lodash'
import { ImageBackground } from '../../image'
import ContentLoader from 'react-content-loader'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import { motion } from 'framer-motion'
import SignupLoginModal from '../Signup/SignupLogin'
import { filterKey } from '../../utils/data-utils'
import extractSubdomain from '../../utils/extractSubdomain'
import RightArrow from '../../assets/rightArrow.js'
import slugifyContent from '../../utils/slugifyContent'
import getPath from '../../utils/getPath'
import config from '../../config'
import LoadingSpinner from '../TeacherApp/components/Loader/LoadingSpinner';
import { Redirect } from 'react-router-dom'
import './styles.scss'
import fetchStudentCurrentStatus from '../../queries/fetchStudentCurrentStatus'
import renderChats from '../../utils/getChatTags'
import ChatWidget from '../../components/ChatWidget'
import { hs } from '../../utils/size'
import Lottie from 'react-lottie'
import loginLoader from '../../assets/animations/loginLoader.json'
import { getToasterBasedOnType, Toaster } from '../../components/Toaster'
import LoginModal from '../TeacherApp/components/LoginModal/LoginModal'
import fetchSchoolDetails from '../../queries/fetchSchoolDetails'
import { Helmet } from 'react-helmet'
import { getTeacherAppRoute, getTrainingDashboardRoute } from '../../navItems'
import { teacherAppSubDomains } from '../../constants'
import serverPageLinks from '../../constants/serverPageLinks';
import TekieLogo from '../../assets/tekieLogo.png';
import getMe from '../../utils/getMe'

const breakPoint = 900
class SubDomainLandingPage extends Component {

  constructor(props) {
    super(props)
    this.state = {
      isSignin: false,
      isTeacherAppLogin: false,
      isDesktop: typeof window === 'undefined' ? true : window.innerWidth > breakPoint,
      schoolDetails: this.props.schoolDetails && this.props.schoolDetails.toJS(),
      schoolCode: null,
      pageLoading: true,
      signUpLoginMethods: [],
      loginViaLinkLoader: false,
      isRootTeacherDomainActive: (teacherAppSubDomains.includes(extractSubdomain())) || false,
    }
  }

  async componentDidMount() {
    this.setUTMParametersToLocalStorage()
    let schoolCode = extractSubdomain()
    const { schoolDetails, isRootTeacherDomainActive } = this.state
    if (schoolCode && !isRootTeacherDomainActive) {
      const query = qs.parse(window.location.search)
      const linkToken = get(query, 'authToken')
      if (linkToken) {
        this.setState({
          loginViaLinkLoader: true
        })
      }
      if (schoolDetails && schoolDetails.length > 0 && schoolDetails !== null && schoolDetails !== undefined) {
        this.setTeacherAppData(schoolCode)
      } else {
        this.getSchoolDetails(schoolCode)
      }
      if (linkToken && this.state.schoolDetails) {
        this.setState({
          selectedMethod: {
            schoolDetails: this.state.schoolDetails
          }
        })
      }
    }
    if (isRootTeacherDomainActive) {
      this.setTeacherAppData(schoolCode);
    }
    if (this.props.isLoggedIn) {
      fetchStudentCurrentStatus(this.props.userId)
    }
    if (window && window.fcWidget) {
      window.fcWidget.show()
    }
  }

  componentDidUpdate = async (prevProps) => {
    const { isLoggedIn, studentCurrentStatus, loggedInUserArray, error } = this.props
    let { loginStatus } = this.props
    const { isRootTeacherDomainActive } = this.state;
    if (loginStatus && !get(loginStatus.toJS(), 'loading') && get(loginStatus.toJS(), 'failure') && (
      prevProps.loginStatus !== loginStatus
    )) {
      if (isRootTeacherDomainActive) {
        const errorData = (error && error.toJS().pop()) || {}
        if ((get(errorData, 'error.errors', []) || []).length) {
          getToasterBasedOnType({
            type: "error",
            message: "Either username or password is incorrect",
          });
        }
      }
    }
    if (window && window.fcWidget) {
      window.fcWidget.on("widget:opened", () => {
        renderChats({
          isLoggedIn,
          studentCurrentStatus,
          loggedInUser: loggedInUserArray,
          b2BLandingPage: true
        })
      })
    }
  }


  getSchoolDetails = async (code) => {
    let schoolDetails = {};
    try {
      await fetchSchoolDetails(code)
      schoolDetails = this.props.schoolDetails && this.props.schoolDetails.toJS()
      this.setState({ schoolDetails, pageLoading: false })
      this.setTeacherAppData(code)
    } catch (e) {
      this.setState({
        pageLoading: false
      })
    }
  }

  setTeacherAppData = (code) => {
    const { schoolDetails, isRootTeacherDomainActive } = this.state
    const updateObj = {}
    if (get(schoolDetails, 'bgImage.uri')) {
      updateObj.signUpLoginMethods = this.state.signUpLoginMethods.map(el => {
        if (el.key === 'management') {
          return { ...el, bgImage: getPath(get(schoolDetails, 'bgImage.uri')) }
        }
        return el
      })
    }

    if (get(schoolDetails, 'isTeachersAppEnabled') || isRootTeacherDomainActive) {
      updateObj.isTeacherAppLogin = true
    } else {
      const HomePageCards = [
        {
          key: 'students',
          label: 'Students',
          description: 'Attend live classes. Visit Code Community. Explore more on our learning platform',
          bgImage: require('../../assets/signupPageSlide1.png'),
        },
        {
          key: 'management',
          label: 'Management',
          description: 'Keep a tab on your school\'s class schedule. Manage student profiles. Check updates.',
          bgImage: require('../../assets/mangementLoginBg.png'),
        }
      ]
      updateObj.signUpLoginMethods = HomePageCards
    }
    this.setState({
      schoolCode: code,
      pageLoading: false,
      ...updateObj
    })
  }

  setUTMParametersToLocalStorage = () => {
    const params = qs.parse(window.location.search)
    if (params.utm_source) {
      localStorage.setItem('utm_source', params.utm_source)
    }
    if (params.utm_campaign) {
      localStorage.setItem('utm_campaign', params.utm_campaign)
    }
    if (params.utm_term) {
      localStorage.setItem('utm_term', params.utm_term)
    }
    if (params.utm_content) {
      localStorage.setItem('utm_content', params.utm_content)
    }
    if (params.utm_medium) {
      localStorage.setItem('utm_medium', params.utm_medium)
    }
  }

  renderFooter = () => (
    <div className={'subDomain-landing-page-footer-container'}>
      <div className={'subDomain-landing-page-footer-leftContainer'}>
        <ImageBackground
          src={require('../../assets/tekieDropLogo.png')}
          srcLegacy={require('../../assets/tekieDropLogo.png')}
          className={'subDomain-landing-page-footer-TekieLogo'}
        />
        <span>© 2022, Kiwhode Learning Pvt Ltd. All Rights Reserved.</span>
      </div>
      <div className={'subDomain-landing-page-footer-rightContainer'}>
        <a href={serverPageLinks.privacy} className='subDomain-landing-page-footer-privacyAndTerms' target={'_blank'}>
          <span>Privacy</span>
        </a>
        <a href={serverPageLinks.terms} className='subDomain-landing-page-footer-privacyAndTerms' target={'_blank'}>
          <span>Terms</span>
        </a>
      </div>
    </div>
  )

  renderSignUpLoginBlock = ({ key, label, description, bgImage }) => {
    const getHeadingForLoginModal = (label) => {
      if (label === 'Students') return 'Student Login'
      if (label === 'Management') return 'Management Login'
      if (label === 'Teachers') return 'Teachers Login'
    }
    return (
      <div
        onClick={() => {
          if (label === 'Teachers') {
            return this.setState({
              isTeacherAppLogin: true, selectedMethod: {
                label: getHeadingForLoginModal(label),
                bgImage,
                key,
                schoolDetails: this.state.schoolDetails
              }
            })
          }
          if (this.state.schoolDetails) {
            this.setState({
              selectedMethod: {
                label: getHeadingForLoginModal(label),
                bgImage,
                key,
                schoolDetails: this.state.schoolDetails
              },
              isSignin: true,
            })
          }
        }}
        className='subDomain-landing-page-block-container'
      >
        <div className='subDomain-landing-page-block-slideImageContainer'>
          <ImageBackground
            src={bgImage}
            srcLegacy={bgImage}
            style={{ backgroundPosition: `${key === 'management' ? 'center' : ''}` }}
          />
        </div>
        <div className='subDomain-landing-page-block-detailsContainer'>
          <div>
            <span className='subDomain-landing-page-block-label'>{label}</span>
            <span className='subDomain-landing-page-block-description'>{description}</span>
          </div>
          <div className='subDomain-landing-page-block-enterbtn'>
            ENTER <RightArrow className='subDomain-landing-page-block-arrow' />
          </div>
        </div>
      </div>
    )
  }

  closeLoginModal = () => {
    this.setState({ isTeacherAppLogin: false })
  }
  checkForRoles = () => {
    let loggedInUserData = getMe()
    return { isSchoolTeacher: get(loggedInUserData, 'role') === config.TEACHER, isSchoolTrainer: false }
  }
  render() {
    const { isSignin, schoolDetails, signUpLoginMethods, loginViaLinkLoader, isTeacherAppLogin, isRootTeacherDomainActive } = this.state
    const lottieWidth = window.innerWidth > 720 ? 260 : 460
    const { isSchoolTeacher, isSchoolTrainer } = this.checkForRoles()
    const teacherAppRoutes = getTeacherAppRoute({ isSchoolTeacher, isSchoolTrainer })
    const trainerRoutes = getTrainingDashboardRoute({ isSchoolTrainer })
    const search = new URLSearchParams(window.location.search)
    const bookId = search.get("ebookId");

    if (bookId && bookId !== 'undefined') {
      return <Redirect to={`/s/${bookId}`} />
    }
    if (teacherAppRoutes.length) {
      return <Redirect to={teacherAppRoutes[0].route} />
    }
    return (
      <>
        <Helmet>
          <title>Teacher App - Tekie</title>
        </Helmet>
        <div style={{ background: '#FAFDFF' }}>
          <Style>
            {`
              ::-webkit-scrollbar-thumb {
                background-color: rgba(52, 228, 234, 0.3);
                border-radius: 0px;
              }
            `}
          </Style>
          <div className={'subDomain-landing-page-body'}>
            {(!schoolDetails && !isRootTeacherDomainActive) ? (
              <div className={'subDomain-landing-page-header'}>
                <div className={'subDomain-landing-page-school-details'}>
                  <ContentLoader
                    className='sp-loader-card'
                    speed={3}
                    interval={0.1}
                    backgroundColor={'#ffffff'}
                    foregroundColor={'#cce7e9'}
                  >
                    <rect x="80" y="0" rx="100" ry="100" className='sp-loader-1' />
                  </ContentLoader>
                </div>
              </div>
            ) : (
              <div className={'subDomain-landing-page-header'}>
                <div className={'subDomain-landing-page-school-details'}>
                  <div className={'subDomain-landing-page-header-logo-container'}>
                    {/* <ImageBackground
                      className={cx('subDomain-landing-page-header-SchoolLogo')}
                      src={isRootTeacherDomainActive ? require('../../assets/tekieLogo.png') : getPath(get(schoolDetails, 'logo.uri'))}
                      srcLegacy={isRootTeacherDomainActive ? require('../../assets/tekieLogo.png') : getPath(get(schoolDetails, 'logo.uri'))}
                    /> */}
                    {/* <img src={TekieLogo} alt="logo" className="subdomain_page_tekie_logo" /> */}
                  </div>
                  {/* <div className={'subDomain-landing-page-school-details-text'}>
                    {get(schoolDetails, 'name')}
                    <span>
                      {get(schoolDetails, 'city')}
                      {get(schoolDetails, 'country') ? `, ${get(schoolDetails, 'country')}` : null}
                    </span>
                  </div> */}
                </div>
              </div>
            )}
            {loginViaLinkLoader ? (
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
              <div className='subDomain-landing-page-SignUpLoginContainer'>
                {signUpLoginMethods && signUpLoginMethods.map(methods => (
                  this.renderSignUpLoginBlock(methods)
                ))}
              </div>
            )}
            {this.renderFooter()}
          </div>
          <ChatWidget />
          {!isTeacherAppLogin && <motion.div
            initial={{
              opacity: isSignin ? 1 : 0,
              visibility: isSignin ? 'visible' : 'hidden'
            }}
            animate={{
              opacity: isSignin ? 1 : 0,
              visibility: isSignin ? 'visible' : 'hidden'
            }}
            style={{
              pointerEvents: isSignin ? 'auto' : 'none'
            }}
          >
            <SignupLoginModal
              isSubDomainActive
              modalComponent
              customAuthMethod={this.state.selectedMethod}
              shouldRedirect={false}
              visible={isSignin}
              closeLoginModal={() => {
                this.setState({
                  isSignin: false
                })
              }}
            />

          </motion.div>}
          <motion.div
            initial={{
              opacity: isTeacherAppLogin ? 1 : 0,
              visibility: isTeacherAppLogin ? 'visible' : 'hidden'
            }}
            animate={{
              opacity: isTeacherAppLogin ? 1 : 0,
              visibility: isTeacherAppLogin ? 'visible' : 'hidden'
            }}
            style={{
              pointerEvents: isTeacherAppLogin ? 'auto' : 'none'
            }}
          >
            <LoginModal error={this.props.error} visible={isTeacherAppLogin} closeModal={this.closeLoginModal} userFetchStatus={this.props.userFetchStatus} userId={get(this.props, 'userId')} />
          </motion.div>
          {!isTeacherAppLogin && this.state.pageLoading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 999,
              width: '100vw',
              height: '100vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <LoadingSpinner />
            </div>
          )}
        </div>
      </>
    )
  }
}


SubDomainLandingPage.serverFetch = async (params = {}, path, url) => {
  const code = extractSubdomain()
  await fetchSchoolDetails(code)
}

export default connect((state) => ({
  loggedInUser: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0], Map({})),
  loggedInUserArray: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser'),
  userRole: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'role'], false) || filterKey(state.data.getIn(['user', 'data']), 'validateOTP').getIn([0, 'role'], false),
  isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
    state.data.getIn(['userChildren', 'data']).size,
  studentCurrentStatus: state.data.getIn(['getStudentCurrentStatus', 'data', 'status']),
  userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
  loginStatus: state.data.getIn(['user', 'fetchStatus', 'loggedinUser']),
  schoolDetails: state.data.getIn(['schoolDetails', 'data']),
  error: state.data.getIn([
    "errors",
    "user/fetch",
  ]),
  userFetchStatus: state.data.getIn([
    "user",
    "fetchStatus",
    "loggedinUser",
    "loading",
  ]),
}))(withRouter(SubDomainLandingPage))
