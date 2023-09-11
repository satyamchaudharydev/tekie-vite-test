import React, { Component, useState } from 'react'
import cx from 'classnames'
import { withRouter, Link } from 'react-router-dom'
import './Header.scss'
// import Lottie from 'react-lottie'
import { enrollNowGA, LinksClicksGA } from '../../../../utils/analytics/ga'
import { get } from 'lodash'
import { ImageBackground } from '../../../../image'
import { connect } from 'react-redux'
import { motion, useViewportScroll, useTransform } from 'framer-motion'
import fetchStudentProfile from '../../../../queries/fetchStudentProfile';
import { filterKey } from '../../../../utils/data-utils'
import arrowBlue from '../../../../assets/arrowBlue.svg'
import downLight from '../../../../assets/downLight.svg'
import { avatarsRelativePath } from '../../../../utils/constants/studentProfileAvatars'
import { WAITINGMODAL_ROUTE } from '../../../../config'
import { isSubDomainActive } from '../../../../utils/extractSubdomain'
// import isFeatureEnabled from '../../../../utils/isFeatureEnabled'

const Header = props => {
  const [mobileNavbarOpened, setMobileNavbarOpened] = React.useState(false)
  const { scrollYProgress } = useViewportScroll()
  const backgroundColor = useTransform(scrollYProgress, [0, 0.02], ['rgba(0, 13, 17, 0)', 'rgba(0, 13, 17, 1)'])
  const positionFixed = get(props, 'positionFixed', true)
  // const buyNowButton = isFeatureEnabled('buyNowButton')
  const loggedInUserDetails = props.loggedInUser && props.loggedInUser.toJS()[0]
  const studentProfile = props.studentProfile && props.studentProfile.toJS()[0]
  // const becomeMentorButton = isFeatureEnabled('becomeMentorButton')

  const [isResourceVisible, setResourceVisible] = useState(false)
  const [isResourceActive, setResourceActive] = useState(false)
  React.useEffect(() => {
    if (props.userId) {
      fetchStudentProfile(props.userId)
    }
  }, [props.userId, props.isLoggedIn])

  React.useEffect(() => {
    const { match } = props
    if (match.path.split('/').includes('cheatsheet') || match.path.split('/').includes('code-playground')) {
      setResourceActive(true)
    }
  }, [])
  const isActiveNavItem = () => {
    if (props.match.path.split('/').includes('student-community')) {
      return true
    }
    return false
  }

  const getStudentProfileAvatar = (studentProfile) => {
    if (studentProfile) {
      const avatar = studentProfile.profileAvatarCode || 'theo';
      return avatarsRelativePath[avatar]
    }
    return avatarsRelativePath.theo
  }
  let cancelClosingDropdown = null
  let cancelClosing = null
  return (
    <>
      <div>
        <motion.div className={cx('code-showcase-header-container', props.banner && 'code-showcase-header-noPaddingContainer')} id="tk-landing-header"
          style={{ position: props.position || `${positionFixed ? 'fixed' : 'relative'}` }}
        >
          {props.banner && (
            <ImageBackground
              className={cx('code-showcase-header-bannerSpecialContainer', 'sr-0-10-600')}
              src={require('../../../../assets/usBanner.webp')}
              srcLegacy={require('../../../../assets/usBanner.jpg')}
            >
              <div className={cx('code-showcase-header-bannerText', 'sr-0-10-600')}>Kudos to early birds! <span className={'code-showcase-header-gradientText'}>25%</span> just for you!</div>
              <div className={cx('code-showcase-header-limitedText', 'sr-200-15-600')}>*for the first 100 students</div>
            </ImageBackground>
          )}
          <div className={'code-showcase-header-row'}>
            <div className={'code-showcase-header-hamburgerContainer'} onClick={() => setMobileNavbarOpened(true)}>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <a href="/" style={{ textDecoration: 'none' }}>
              <ImageBackground
                className={cx('code-showcase-header-tekieLogo', 'sr-200-35-600')}
                src={require('../../../../assets/tekieLogo_lossless.webp')}
                srcLegacy={require('../../../../assets/tekieLogo.png')}
                onClick={() => {
                  LinksClicksGA(`Top Tekie Logo Click: From ${props.match.path}`)
                }}
                style={{ cursor: 'pointer', marginLeft: '10px' }}
              />
            </a>
            <div style={{ flexDirection: 'row', display: 'flex', flex: 1, justifyContent: 'space-between' }}>
              {/*<div className={'code-showcase-header-buyNow'} onClick={() => props.history.push(`/pre-checkout`)}></div>*/}
              {/* <div className={'code-showcase-header-navLinkDesktop'}>Buy Course</div> */}
              <div style={{ flexDirection: 'row', display: 'flex' }}>
                <Link style={{ textDecoration: 'none', marginRight: 0 }}
                  onClick={() => {
                    LinksClicksGA(`Student Community Click: From ${props.match.path}`)
                  }}
                  to={'/student-community'}
                >
                  <div className={cx('code-showcase-header-headerButton', 'code-showcase-header-buyNowButton',
                    props.match.path.includes('/student-community') && 'code-showcase-header-active')}>Student Community</div>
                </Link>
                <div className={cx('code-showcase-header-menu', 'code-showcase-header-dropdown')}
                  onMouseEnter={() => {
                    clearTimeout(cancelClosing)
                    clearTimeout(cancelClosingDropdown)
                    setResourceVisible(true)
                  }}
                  onMouseLeave={() => {
                    cancelClosing = setTimeout(() => setResourceVisible(false), 500);
                  }}
                  style={{ cursor: "pointer" }}>
                  <div className={cx('code-showcase-header-headerButton')}
                    style={{ color: isResourceVisible || isResourceActive ? '#00ade6' : '#aaacae', position: 'relative' }}>
                    <span style={{ display: 'flex' }}>Resources
                      <img
                        alt='Resources'
                        src={isResourceVisible || isResourceActive ? arrowBlue : downLight}
                        style={{ marginLeft: '8px' }}
                      />
                    </span>
                  </div>
                  <div className={cx('code-showcase-header-drop', isResourceVisible && 'code-showcase-header-droShow')}>
                    <span
                      className={cx(props.match.path.split('/').includes('code-playground') && 'activeNav')}
                    ><Link to={"/code-playground"}>Code Playground</Link></span>
                    <span
                      className={cx(props.match.path.split('/').includes('cheatsheet') && 'activeNav')}><Link to={'/cheatsheet'}>Cheat Sheet</Link></span>
                  </div>
                </div>
                {/* <Link style={{ textDecoration: 'none', marginRight: 0}}
                to={"/cheatsheet"}
              >
                  <div className={cx('code-showcase-header-headerButton', 'code-showcase-header-buyNowButton', 'code-showcase-header-active')}>Resources
                    <img src={arrowBlue} style={{ marginLeft: '8px' }} />
                  </div>
              </Link> */}
              </div>
              <div style={{ flexDirection: 'row', display: 'flex', justifyContent: 'flex-end' }}>
                {/* {!props.isLoggedIn && (
                <div className='sr-200-35-600'>
                  <div className={'code-showcase-header-bookFreeSession'} onClick={() => {
                      enrollNowGA(`Book a free class : from ${props.match.path}`)
                      // props.openEnrollmentForm()
                      // props.history.push('/signup')
                      if (window) {
                        window.location.replace(WAITINGMODAL_ROUTE)
                      }
                    }
                  }>
                    <span className='code-showcase-calender-icon'></span>
                  </div>
                </div>
              )} */}
                <div className='sr-300-50-600'>
                  <div className={'code-showcase-header-login'} onClick={() => {
                    if (props.isLoggedIn) {
                      if (props.userRole !== 'mentee') {
                        props.history.push('/learn')
                      } else {
                        props.history.push('/sessions')
                      }
                    } else {
                      if (isSubDomainActive) {
                        props.history.push('/')
                      } else props.openLogin()
                    }
                  }}>{props.isLoggedIn ? 'Go to App' : 'Login'}</div>
                </div>
              </div>
            </div>
            <div className={cx('code-showcase-header-overlayNavbar', !mobileNavbarOpened && 'code-showcase-header-overlayNavbarHide')}>
              <div className={cx('code-showcase-header-overlayNavbarWrapper', !mobileNavbarOpened && 'code-showcase-header-overlayNavbarWrapperHide')}>
                {props.isLoggedIn && loggedInUserDetails ? (
                  <div className={cx('code-showcase-header-profile-container')}>
                    <div className={cx('code-showcase-header-profile-img')}
                      style={{ backgroundImage: `url('${getStudentProfileAvatar(studentProfile)}')` }}
                    >
                    </div>
                    <div className={cx('code-showcase-header-profile-text')}>
                      {get(loggedInUserDetails, 'name')}
                    </div>
                  </div>
                ) : null}
                <div className={cx('code-showcase-header-mobile-login-btn', 'code-showcase-header-bookFreeSessionMobile', 'code-showcase-header-contentNone')} onClick={() => {
                  setMobileNavbarOpened(false)
                  if (props.isLoggedIn) {
                    if (props.userRole !== 'mentee') {
                      props.history.push('/learn')
                    } else {
                      props.history.push('/sessions')
                    }
                  } else {
                    if (isSubDomainActive) {
                      props.history.push('/')
                    } else props.openLogin()
                  }
                }} style={{
                  display: 'flex'
                }}>{props.isLoggedIn ? 'Go to App' : 'Login'}</div>
                <Link style={{ textDecoration: 'none', marginRight: 0 }}
                  onClick={() => {
                    LinksClicksGA(`Student Community Click: From ${props.match.path}`)
                  }}
                  to={"/student-community"}
                >
                  <div className={'code-showcase-header-overlayNavItem'} onClick={() => setMobileNavbarOpened(false)}>Student Community</div>
                </Link>
                <Link style={{ textDecoration: 'none', marginRight: 0 }} to={"/code-playground"}>
                  <div className={'code-showcase-header-overlayNavItem'} onClick={() => setMobileNavbarOpened(false)}>Code Playground</div>
                </Link>
                <Link style={{ textDecoration: 'none', marginRight: 0 }} to={"/cheatsheet"}>
                  <div className={'code-showcase-header-overlayNavItem'} onClick={() => setMobileNavbarOpened(false)}>Cheat Sheet</div>
                </Link>
              </div>
              <div className={'code-showcase-header-overlayNavbarClose'} onClick={() => setMobileNavbarOpened(false)}>
              </div>
            </div>
            <div className={cx('code-showcase-header-overlayNavbar', !mobileNavbarOpened && 'code-showcase-header-overlayNavbarHide')}>
              <div className={cx('code-showcase-header-overlayNavbarWrapper', !mobileNavbarOpened && 'code-showcase-header-overlayNavbarWrapperHide')}>
                {props.isLoggedIn && loggedInUserDetails ? (
                  <div className={cx('code-showcase-header-profile-container')}>
                    <div className={cx('code-showcase-header-profile-img')}
                      style={{ backgroundImage: `url('${getStudentProfileAvatar(studentProfile)}')` }}
                    >
                    </div>
                    <div className={cx('code-showcase-header-profile-text')}>
                      {get(loggedInUserDetails, 'name')}
                    </div>
                  </div>
                ) : null}
                <div className={cx('code-showcase-header-mobile-login-btn', 'code-showcase-header-bookFreeSessionMobile', 'code-showcase-header-contentNone')} onClick={() => {
                  setMobileNavbarOpened(false)
                  if (props.isLoggedIn) {
                    if (props.userRole !== 'mentee') {
                      props.history.push('/learn')
                    } else {
                      props.history.push('/sessions')
                    }
                  } else {
                    if (isSubDomainActive) {
                      props.history.push('/')
                    } else props.openLogin()
                  }
                }} style={{
                  display: 'flex'
                }}>{props.isLoggedIn ? 'Go to App' : 'Login'}</div>
                <Link style={{ textDecoration: 'none', marginRight: 0 }}
                  onClick={() => {
                    LinksClicksGA(`Student Community Click: From ${props.match.path}`)
                  }}
                  to={"/student-community"}
                >
                  <div className={'code-showcase-header-overlayNavItem'} onClick={() => setMobileNavbarOpened(false)}>Student Community</div>
                </Link>
                <Link style={{ textDecoration: 'none', marginRight: 0 }} to={"/code-playground"}>
                  <div className={'code-showcase-header-overlayNavItem'} onClick={() => setMobileNavbarOpened(false)}>Code Playground</div>
                </Link>
                <Link style={{ textDecoration: 'none', marginRight: 0 }} to={"/cheatsheet"}>
                  <div className={'code-showcase-header-overlayNavItem'} onClick={() => setMobileNavbarOpened(false)}>Cheat Sheet</div>
                </Link>
              </div>
              <div className={'code-showcase-header-overlayNavbarClose'} onClick={() => setMobileNavbarOpened(false)}>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}

const mapStateToProps = (state) => ({
  isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
    state.data.getIn(['userChildren', 'data']).size,
  loggedInUser: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser'),
  studentProfile: state.data.getIn([
    'studentProfile',
    'data'
  ]),
  userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
  userRole: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'role'], false)
})

export default connect(mapStateToProps)(withRouter(Header))
