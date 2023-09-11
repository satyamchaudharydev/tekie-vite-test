/* eslint-disable */
import React, { Component, useState } from 'react'
import cx from 'classnames'
import { withRouter, Link } from 'react-router-dom'
import Lottie from 'react-lottie'
import { get } from 'lodash'
import { ImageBackground } from '../../../image'
import { connect } from 'react-redux'
import { motion, useViewportScroll, useTransform } from 'framer-motion'
import { filterKey, isME } from '../../../utils/data-utils'
import { LinksClicksGA } from '../../../utils/analytics/ga'
import fetchStudentProfile from '../../../queries/fetchStudentProfile';
import newYear from '../newYear.json'
import landingDrop from '../../../assets/landingDrop.svg'
import downLight from '../../../assets/downLight.svg'
import { avatarsRelativePath } from '../../../utils/constants/studentProfileAvatars'
// import isFeatureEnabled from '../../../utils/isFeatureEnabled'
import './Header.scss'

const snowOptions = {
  loop: true,
  autoplay: true,
  animationData: newYear,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
}


const Header = props => {
  const [mobileNavbarOpened, setMobileNavbarOpened] = React.useState(false)
  const { scrollYProgress } = useViewportScroll()
  const backgroundColor = useTransform(scrollYProgress, [0, 0.02], ['rgba(0, 13, 17, 0)', 'rgba(0, 13, 17, 1)'])

  // const buyNowButton = isFeatureEnabled('buyNowButton')
  // const becomeMentorButton = isFeatureEnabled('becomeMentorButton')
  const loggedInUserDetails = props.loggedInUser && props.loggedInUser.toJS()[0]
  const studentProfile = props.studentProfile && props.studentProfile.toJS()[0]
  const [isResourceVisible, setResourceVisible] = useState(false)
  React.useEffect(() => {
    if (props.userId) {
      fetchStudentProfile(props.userId)
    }
  }, [props.userId, props.isLoggedIn])

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
    <motion.div className={cx('landing-page-header-container', props.banner && 'landing-page-header-noPaddingContainer')} style={
    props.headerButton ? { backgroundColor: 'rgb(0, 24, 31)' } : { backgroundColor }} id="tk-landing-header">
      {props.banner && (
        <ImageBackground
          className={cx('landing-page-header-bannerSpecialContainer', 'sr-0-10-600')}
          src={require('../../../assets/usBanner.webp')}
          srcLegacy={require('../../../assets/usBanner.jpg')}
        >
          {isME() ? (
            <>
              <div className={cx('landing-page-header-bannerText', 'sr-0-10-600')}>Grab the early bird offer. <span className={'landing-page-header-gradientText'}>$100</span> off on our course!</div>
              <div className={cx('landing-page-header-limitedText', 'sr-200-15-600')}>*only for first 50 users</div>
            </>
          ) : (
            <>
              <div className={cx('landing-page-header-bannerText', 'sr-0-10-600')}>Kudos to early birds! <span className={'landing-page-header-gradientText'}>25%</span> just for you!</div>
              <div className={cx('landing-page-header-limitedText', 'sr-200-15-600')}>*for the first 100 students</div>
            </>
          )}
        </ImageBackground>
      )}
      {/* <div className={'landing-page-header-bannerSpecialContainer'}>
        <div className={'landing-page-header-lottieAbsoluteContainer'}>
          <39 
            options={snowOptions}
          />
        </div>
      </div> */}
      <div className={'landing-page-header-row'}>
        <div className={'landing-page-header-hamburgerContainer'} onClick={() => setMobileNavbarOpened(true)}>
          <div></div>
          <div></div>
          <div></div>
        </div>
        {props.match.path !== '/' ? (
          <a href="/" style={{ textDecoration: 'none' }}>
            <ImageBackground
              className={cx('landing-page-header-tekieLogo', 'sr-200-35-600')}
              src={require('../../../assets/tekieLogo_lossless.webp')}
              srcLegacy={require('../../../assets/tekieLogo.png')}
              onClick={() => {
                LinksClicksGA(`Top Tekie Logo Click: From ${props.match.path}`)
              }}
              style={{ cursor: 'pointer' }}
            />
          </a>
        ) : (
          <ImageBackground
            className={cx('landing-page-header-tekieLogo', 'sr-200-35-600')}
            src={require('../../../assets/tekieLogo_lossless.webp')}
            srcLegacy={require('../../../assets/tekieLogo.png')}
          />
        )}
        <div style={{ flexDirection: 'row', display: 'flex',flex: 1, justifyContent : 'space-between' }}>
          {/*<div className={'landing-page-header-buyNow'} onClick={() => props.history.push(`/pre-checkout`)}></div>*/}
          {/* <div className={'landing-page-header-navLinkDesktop'}>Buy Course</div> */}
          <div style={{ flexDirection: 'row', display: 'flex' }}>
            {/* {buyNowButton && (
              <Link style={{ textDecoration: 'none'}} to={props.isLoggedIn ? "/checkout" : "/pre-checkout"}>
                <div className={cx('landing-page-header-headerButton', 'landing-page-header-buyNowButton')}>Buy Now</div>
              </Link>
            )} */}
            <Link style={{ textDecoration: 'none', marginRight: 0 }}
              onClick={() => {
                LinksClicksGA(`Code Playground Click: From ${props.match.path}`)
              }}
              to={'/student-community'}
            >
              <div className={cx('landing-page-header-headerButton','landing-page-header-buyNowButton')}>Student Community</div>
            </Link>
            <div className={cx('landing-page-header-menu', 'landing-page-header-dropdown')}
              onMouseEnter={() => {
                clearTimeout(cancelClosing)
                clearTimeout(cancelClosingDropdown)
                setResourceVisible(true)
              }}
              onMouseLeave={() => {
                cancelClosing = setTimeout(() => setResourceVisible(false), 500);
              }}
              style={{ cursor: "pointer" }}>
              <div
                className={cx('landing-page-header-headerButton')}
                style={{ color: isResourceVisible ? ' #1290a8' : 'white', position: 'relative' }}>
                <span style={{ display: 'flex' }}>Resources
                 <img alt='Arrow Icon' src={isResourceVisible ? landingDrop : downLight} style={{ marginLeft: '8px', width: '12px' }} />
                </span>
                </div>
              <div className={cx('landing-page-header-drop', isResourceVisible && 'landing-page-header-droShow')}>
                <span><Link to={'/code-playground'}>Code Playground</Link></span>
                <span><Link to={'/cheatsheet'}>Cheat Sheet</Link></span>
              </div>
            </div>
            {/* {becomeMentorButton && (
              <a style={{ textDecoration: 'none', marginRight: 0}} href="https://forms.gle/gdxtjgrAc4rEKr137" target="_blank">
                <div className={'landing-page-header-headerButton'}>Become a Mentor</div>
              </a>
            )} */}
            <a style={{ textDecoration: 'none' }}
              href={'https://tekie-hr.freshteam.com/jobs'}
              target='_blank'
            >
              <div className={cx('landing-page-header-headerButton')}>Careers</div>
            </a>
            <a style={{ textDecoration: 'none', marginRight: 0 }}
              href={'https://blog.tekie.in/'}
            >
              <div className={cx('landing-page-header-headerButton')}>Blog</div>
            </a>
          </div>
          {props.headerButton ? props.headerButton : (
            <div style={{ flexDirection: 'row', display: 'flex' }}>
              {!props.isLoggedIn && (
                <div className='sr-200-35-600'>
                  <a href="/signup" style={{ textDecoration: 'none' }}>
                    <div className={'landing-page-header-bookFreeSession'} id="landing-login/signup"></div>
                  </a>
                </div>
              )}
              <div className='sr-300-50-600'>
                <div className={'landing-page-header-login'} id="landing-page-header-login" onClick={() => {
                  /*if (window.innerWidth < 600) {
                    if (props.openClaimedLogin) {
                      props.openClaimedLogin()
                    }
                    return
                  }*/
                  if (props.isLoggedIn) {
                    if (props.userRole !== 'mentee') {
                      props.history.push('/learn')
                    } else {
                      props.history.push('/sessions')
                    }
                  } else {
                    props.openLogin()
                  }
                }}>{props.isLoggedIn ? 'Go to App' : 'Login'}</div>
              </div>
            </div>
          )}
        </div>
        <div className={cx('landing-page-header-overlayNavbar', !mobileNavbarOpened && 'landing-page-header-overlayNavbarHide')}>
          <div className={cx('landing-page-header-overlayNavbarWrapper', !mobileNavbarOpened && 'landing-page-header-overlayNavbarWrapperHide')}>
            {props.isLoggedIn && loggedInUserDetails ? (
              <div className={cx('landing-page-header-profile-container')}>
                <div className={cx('landing-page-header-profile-img')}
                  style={{ backgroundImage: `url('${getStudentProfileAvatar(studentProfile)}')`}} 
                  >
                </div>
                <div className={cx('landing-page-header-profile-text')}>
                  {get(loggedInUserDetails, 'name')}
                </div>
              </div>
            ) : null }
            <div id='landing-page-header-login' className={cx('landing-page-header-bookFreeSession', 'landing-page-header-bookFreeSessionMobile', 'landing-page-header-contentNone')} onClick={() => {
              setMobileNavbarOpened(false)
              if (props.isLoggedIn) {
                if (props.userRole !== 'mentee') {
                  props.history.push('/learn')
                } else {
                  props.history.push('/sessions')
                }
              } else {
                props.openLogin()
              }
            }} style={{
              display: 'flex'
            }}>{props.isLoggedIn ? 'Go to App' : 'Login'}</div>
            {/* {buyNowButton && (
              <Link to={props.isLoggedIn ? "/checkout" : "/pre-checkout"} style={{ textDecoration: 'none', width: '100%' }}>
                <div className={'landing-page-header-overlayNavItem'} onClick={() => setMobileNavbarOpened(false)}>Buy a Course</div>
              </Link>
            )} */}
            <Link style={{ textDecoration: 'none', marginRight: 0}} to={"/student-community"}>
              <div className={'landing-page-header-overlayNavItem'} onClick={() => setMobileNavbarOpened(false)}>Student Community</div>
            </Link>
            <Link style={{ textDecoration: 'none', marginRight: 0}} to={"/code-playground"}>
              <div className={'landing-page-header-overlayNavItem'} onClick={() => setMobileNavbarOpened(false)}>Code Playground</div>
            </Link>
            <Link style={{ textDecoration: 'none', marginRight: 0 }} to={"/cheatsheet"}>
              <div className={'landing-page-header-overlayNavItem'} onClick={() => setMobileNavbarOpened(false)}>Cheat Sheet</div>
            </Link>
            <a style={{ textDecoration: 'none', marginRight: 0 }}
              href={'https://tekie-hr.freshteam.com/jobs'}
              target='_blank'
            >
              <div className={cx('landing-page-header-overlayNavItem')}>Careers</div>
            </a>
            <a style={{ textDecoration: 'none', marginRight: 0 }}
              href={'https://blog.tekie.in/'}
            >
              <div className={cx('landing-page-header-overlayNavItem')}>Blog</div>
            </a>
            {/* {becomeMentorButton && (
              <a target="_blank" style={{ textDecoration: 'none', width: '100%' }} href="https://forms.gle/gdxtjgrAc4rEKr137">
                <div className={'landing-page-header-overlayNavItem'} onClick={() => setMobileNavbarOpened(false)}>Become a Mentor</div>
              </a>
            )} */}
            {/* <div className={'landing-page-header-overlayNavItem'} onClick={() => setMobileNavbarOpened(false)}>Buy Course</div> */}
 
          </div>
          <div className={'landing-page-header-overlayNavbarClose'} onClick={() => setMobileNavbarOpened(false)}>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const mapStateToProps = (state) => ({
  isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
    state.data.getIn(['userChildren', 'data']).size,
  loggedInUser: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser'),
  studentProfile:  state.data.getIn([
    'studentProfile',
    'data'
  ]),
  userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
  userRole: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'role'], false)
})

export default connect(mapStateToProps)(withRouter(Header))
