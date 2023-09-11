import React from 'react'
import cx from 'classnames'
import { withRouter, Link } from 'react-router-dom'
import { ImageBackground } from '../../../../image'
import { motion } from 'framer-motion'
import { connect } from 'react-redux'
import { filterKey } from '../../../../utils/data-utils'
import CalendarIcon from '../../../../assets/SchoolDashboard/icons/Calendar'
import GradesIcon from '../../../../assets/SchoolDashboard/icons/Grade'
import StudentsIcon from '../../../../assets/SchoolDashboard/icons/Students'
import MentorIcon from '../../../../assets/SchoolDashboard/icons/Mentor'
import ReportIcon from '../../../../assets/SchoolDashboard/icons/Report'
import slugifyContent from '../../../../utils/slugifyContent'

import './withNav.scss'

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

const navItems = [
    { name: 'Calendar', path: '', icon: <CalendarIcon />},
    { name: 'Grades', path: '/grades', icon: <GradesIcon />},
    { name: 'Students', path: '/students', icon: <StudentsIcon />},
    { name: 'Mentors', path: '/mentors', icon: <MentorIcon />},
    // { name: 'Reports', path: '/school-dashboard/teacher/reports', icon: <ReportIcon />},
]
const SideNav = props => {
  const [mobileNavbarOpened, setMobileNavbarOpened] = React.useState(false)
  const schoolName = props.loggedInUser && props.loggedInUser.getIn(['schools', 0, 'name'])
  const toggleOpen = () => {
    setMobileNavbarOpened(!mobileNavbarOpened)
  }

  const renderNavItems = (customClass) => (
    <div className='sideNav-header-nav-container'> 
      <div className={cx('sideNav-header-nav-menu-container', customClass )}>
        {navItems.map(navItem => (    
          <Link
            to={`/dashboard/${slugifyContent(schoolName)}${navItem.path}`}
            key={navItem.name}
            className={`sideNav-header-menu-items ${navItem.name === props.activeNav && 'sideNav-header-menu-active'}`}
          >
              <span className={'sideNav-menu-icon'}>
                {navItem.icon}
              </span>
              <div className={cx('sideNav-header-menu-item-text')}>{navItem.name}</div>
            </Link>
        ))}
      </div>
    </div>
  )

  const renderTekieLogo = (customClass) => (
    <div className={customClass}>
      <ImageBackground
        className={cx('sideNav-header-tekieBgLogo', 'sr-200-35-600' )}
        src={require('../../../../assets/SchoolDashboard/TekieBgLogo.svg')}
        srcLegacy={require('../../../../assets/SchoolDashboard/TekieBgLogo.svg')}
      >
        <ImageBackground
          className={cx('sideNav-header-tekieLogo', 'sr-200-35-600')}
          src={require('../../../../assets/SchoolDashboard/TekieLogoMuted.png')}
          srcLegacy={require('../../../../assets/SchoolDashboard/TekieLogoMuted.png')}
        />
        <span className='sideNav-header-tekieLogo-subtext'>© Tekie 2022. All rights Reserved</span>
      </ImageBackground>
    </div>
  )

  return (
    <motion.div className={cx('sidebar-container')} id='tk-landing-header'>
      <div className={'sideNav-header-row'}>
        <MenuToggle toggle={() => toggleOpen()} mobileNavbarOpened={mobileNavbarOpened} />
        {renderNavItems('sideNav-header-nav-menu-desktopOnly')}
        {renderTekieLogo('sideNav-header-nav-menu-desktopOnly')}
        <motion.nav
          initial={false}
          variants={SideBarAnimVariant}
          animate={mobileNavbarOpened ? "open" : "closed"}
          className={cx('sideNav-header-overlayNavbar',
          )}
          >
          <motion.div
            initial={false}
            variants={backdropAnimVariant}
            animate={mobileNavbarOpened ? "open" : "closed"}
            onClick={() => setMobileNavbarOpened(false)}
            className={cx('sideNav-header-backdrop')}
          ></motion.div>
          <motion.div
            className={cx('sideNav-header-overlayNavbarWrapper',
            )}>
            {renderNavItems()}
            {renderTekieLogo()}
          </motion.div>
          <div className={'sideNav-header-overlayNavbarClose'} onClick={() => setMobileNavbarOpened(false)}>
          </div>
        </motion.nav>
      </div>
    </motion.div>
  )
}
const mapStateToProps = (state) => ({
  loggedInUser: filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser').get(0) || Map({})
})

export default connect(mapStateToProps)(withRouter(SideNav))


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
  <button className={'sideNav-header-hamburgerContainer'} onClick={toggle}>
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
