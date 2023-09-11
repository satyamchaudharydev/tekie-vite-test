import React from 'react'
import cx from 'classnames'
import { withRouter, Link } from 'react-router-dom'
import { ImageBackground } from '../../../image'
import { connect } from 'react-redux'
import { motion } from 'framer-motion'
import { filterKey } from '../../../utils/data-utils'
import isSchoolWebsite from '../../../utils/isSchoolWebsite'
// import { LinksClicksGA } from '../../../utils/analytics/ga'
import './Header.scss'
import slugifyContent from '../../../utils/slugifyContent'
import config from '../../../config'

const dropdownSubMenuAnimVariant = {
  enter: {
    opacity: 1,
    rotateX: 0,
    translateY: '4%',
    translateX: '5%',
    transition: {
      duration: 0.3,
    },
    display: "block"
  },
  exit: {
    opacity: 0,
    rotateX: -15,
    translateY: '12%',
    translateX: '5%',
    transition: {
      duration: 0.3,
    },
    transitionEnd: {
      display: "none"
    }
  }
};
const SideBarAnimVariant = {
  open: {
    left: 0,
    transition: {
      duration: .4
    }
  },
  closed: {
    left: '-100vw',
    transition: {
      delay: 0.1,
      duration: 0.4
    }
  }
};
const backdropAnimVariant = {
  open: {
    opacity: 1,
    transition: {
      delay: .3,
      duration: .2,
    }
  },
  closed: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};
const dropdownSubMenuMobileAnimVariant = {
  visible: {
    height: 'fit-content',
    transition: {
      duration: 0.2,
    }
  },
  hidden: {
    height: 0,
    transition: {
      duration: 0.2,
    }
  }
};

const Header = props => {
  const [mobileNavbarOpened, setMobileNavbarOpened] = React.useState(false)
  const [isMobileOfferingSubMenuVisible, setMobileOfferingSubMenuVisibility] = React.useState(false)
  const [isOfferingSubMenuVisible, setOfferingSubMenuVisibility] = React.useState(false);
  const toggleOfferingSubMenu = () => {
    setOfferingSubMenuVisibility(!isOfferingSubMenuVisible);
  };

  const scrollToRef = (section) => {
    setMobileNavbarOpened(false)
    const sectionView = document.querySelector(`#${section}`);
    if (sectionView) {
      sectionView.scrollIntoView({ 
        behavior: "smooth", 
        block: "start",
      })
    }
  }

  const toggleOpen = () => {
    setMobileNavbarOpened(!mobileNavbarOpened)
  }

  return (
    <motion.div className={cx('b2b-landing-page-header-container')} id='tk-landing-header'>
      <div className={'b2b-landing-page-header-row'}>
        <MenuToggle toggle={() => toggleOpen()} mobileNavbarOpened={mobileNavbarOpened} />
        <ImageBackground
          className={cx('b2b-landing-page-header-tekieLogo', 'sr-200-35-600')}
          src={require('../../../assets/tekieLogo_lossless.webp')}
          srcLegacy={require('../../../assets/tekieLogo.png')}
          style={{ cursor: 'pointer' }}
        />
        <div className='b2b-landing-page-header-nav-container'> 
          <div className='b2b-landing-page-header-nav-menu-container'>
            <div
              className='b2b-landing-page-header-menu-items'
              onClick={() => { scrollToRef('testimonialSection') }}
            >
              <div className={cx('b2b-landing-page-header-menu-item-text')}>Testimonials</div>
            </div>
            <motion.div
              className='b2b-landing-page-header-menu-items'
              onMouseEnter={toggleOfferingSubMenu}
              onMouseLeave={toggleOfferingSubMenu}
            >
              <div
                className={cx('b2b-landing-page-header-menu-item-text', isOfferingSubMenuVisible ? 'b2b-landing-page-header-menu-active' : '')}>
                Offerings
                <span className={cx('b2b-landing-page-header-dropdown-icon-closed', isOfferingSubMenuVisible ? 'b2b-landing-page-header-dropdown-icon-open' : '')} />
              </div>
              <motion.div
                className="b2b-landing-page-header-sub-menu"
                initial="exit"
                animate={isOfferingSubMenuVisible ? "enter" : "exit"}
                variants={dropdownSubMenuAnimVariant}
              >
                <div className="b2b-landing-page-header-sub-menu-item" onClick={() => { scrollToRef('immersivePedogogySection') }}>
                  Immersive Pedagogy
                </div>
                <div className="b2b-landing-page-header-sub-menu-item" onClick={() => { scrollToRef('LMSSection') }}>
                  Learning Management System
                </div>
                <div className="b2b-landing-page-header-sub-menu-item" onClick={() => { scrollToRef('tekieMentorForceSection') }}>
                  Tekie Mentor Force
                </div>
              </motion.div>
            </motion.div>
            <div className='b2b-landing-page-header-menu-items'>
              <div className={cx('b2b-landing-page-header-menu-item-text')} onClick={() => { scrollToRef('codersJourneySection') }}>
                Curriculum
              </div>
            </div>
          </div>
          <div className='b2b-landing-page-header-nav-action-container'>
            <div className='sr-300-50-600'>
              <Link
                className={'b2b-landing-page-header-getStarted-btn'}
                to={'/signup-school'}
              >
                Get Started
              </Link>
            </div>
            <div className='sr-200-35-600'>
              <div className={'b2b-landing-page-header-login-btn'}
                onClick={() => {
                  if (props.isLoggedIn && props.userRole === config.SCHOOL_ADMIN) {
                    if (isSchoolWebsite() && props.loggedInUser.getIn([0, 'schoolAdmin', 'role']) === config.SCHOOL_ADMIN) {
                      const schoolSlug =  slugifyContent(props.loggedInUser.getIn([0, 'schools', 0, 'name']))
                      props.history.push(`/dashboard/${schoolSlug}`)
                    } else if (props.userRole !== 'mentee') {
                      props.history.push('/learn')
                    } else {
                      props.history.push('/sessions')
                    }
                  } else {
                    props.setSignInStatus()
                  }
                }}>
                  {(props.isLoggedIn && props.userRole === config.SCHOOL_ADMIN) ? 'Go to App' : 'Login'}
                </div>
            </div>
          </div>
        </div>
        <motion.nav
          initial={false}
          variants={SideBarAnimVariant}
          animate={mobileNavbarOpened ? "open" : "closed"}
          className={cx('b2b-landing-page-header-overlayNavbar',
          )}
          >
          <motion.div
            initial={false}
            variants={backdropAnimVariant}
            animate={mobileNavbarOpened ? "open" : "closed"}
            onClick={() => setMobileNavbarOpened(false)}
            className={cx('b2b-landing-page-header-backdrop')}
          ></motion.div>
          <motion.div
            className={cx('b2b-landing-page-header-overlayNavbarWrapper',
            )}>
            <ImageBackground
              className={cx('b2b-landing-page-header-tekieLogo', 'sr-200-35-600')}
              src={require('../../../assets/tekieLogo_lossless.webp')}
              srcLegacy={require('../../../assets/tekieLogo.png')}
              style={{ cursor: 'pointer', marginLeft: '36px' }}
            />
            <div className='b2b-landing-page-header-overlayNavItem' style={{ marginTop: '12px' }}
              onClick={() => {
                scrollToRef('testimonialSection')
              }}
            >
              Testimonials
            </div>
            <div className={'b2b-landing-page-header-overlayNav-divider'} />
            <div className={cx('b2b-landing-page-header-overlayNavItem', 'b2b-landing-page-header-overlay-flex-container')}
              style={{ color: `${isMobileOfferingSubMenuVisible ? '#000': ''}`}}
              onClick={() => {
                setMobileOfferingSubMenuVisibility(!isMobileOfferingSubMenuVisible)
              }}  
            >
                Offerings
                <span className={cx('b2b-landing-page-header-dropdown-icon-closed', 'b2b-landing-page-header-dropdown-icon-submenu-closed', isMobileOfferingSubMenuVisible ? 'b2b-landing-page-header-dropdown-icon-submenu-open' : '')} />
            </div>
            <motion.div
              initial="visible"
              animate={isMobileOfferingSubMenuVisible ? "visible" : "hidden"}
              variants={dropdownSubMenuMobileAnimVariant}
              className="b2b-landing-page-header-overlayNavSubMenu"
            >
              <div className="b2b-landing-page-header-overlayNavSubItem" onClick={() => {
                scrollToRef('immersivePedogogySection')
              }}>
                Immersive Pedagogy
              </div>
              <div className="b2b-landing-page-header-overlayNavSubItem" onClick={() => {
                scrollToRef('LMSSection')
              }}>
                Learning Management System
              </div>
              <div className="b2b-landing-page-header-overlayNavSubItem" onClick={() => {
                scrollToRef('tekieMentorForceSection')
              }}>
                Tekie Mentor Force
              </div>
            </motion.div>
            <div className={'b2b-landing-page-header-overlayNav-divider'} />
            <div className='b2b-landing-page-header-overlayNavItem'
              onClick={() => {
                scrollToRef('codersJourneySection')
              }}
            >
                Curriculum
            </div>
          </motion.div>
          <div className={'b2b-landing-page-header-overlayNavbarClose'} onClick={() => setMobileNavbarOpened(false)}>
          </div>
        </motion.nav>
      </div>
    </motion.div>
  )
}

const mapStateToProps = (state) => ({
  isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
    state.data.getIn(['userChildren', 'data']).size,
  userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
  userRole: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'role'], false),
  loggedInUser: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser')
})

export default connect(mapStateToProps)(withRouter(Header))


const Path = props => (
  <motion.path
    fill="transparent"
    strokeWidth="3"
    stroke="hsl(0, 0%, 18%)"
    strokeLinecap="round"
    {...props}
  />
);

export const MenuToggle = ({ toggle, mobileNavbarOpened }) => (
  <button className={'b2b-landing-page-header-hamburgerContainer'} onClick={toggle}>
    <svg width="23" height="23" viewBox="0 0 23 23">
      <Path
        animate={mobileNavbarOpened ? "open" : "closed"}
        initial={!mobileNavbarOpened ? "open" : "closed"}
        variants={{
          closed: { d: "M 2 2.5 L 20 2.5" },
          open: { d: "M 3 16.5 L 17 2.5" }
        }}
      />
      <Path
        d="M 2 9.423 L 20 9.423"
        initial={!mobileNavbarOpened ? "open" : "closed"}
        variants={{
          closed: { opacity: 1 },
          open: { opacity: 0 }
        }}
        animate={mobileNavbarOpened ? "open" : "closed"}
        transition={{ duration: 0.1 }}
      />
      <Path
        d="M 2 16.346 L 20 16.346"
        initial={!mobileNavbarOpened ? "open" : "closed"}
        variants={{
          closed: { d: "M 2 16.346 L 20 16.346" },
          open: { d: "M 3 2.5 L 17 16.346" }
        }}
        animate={mobileNavbarOpened ? "open" : "closed"}
      />
    </svg>
  </button>
);
