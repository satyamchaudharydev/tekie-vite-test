import React from 'react'
import cx from 'classnames'
import { withRouter, Link } from 'react-router-dom'
import fetchSchoolProfile from '../../../../queries/schoolDashboard/fetchSchoolProfile'
import { get } from 'lodash'
import { ReactComponent as SettingsIcon } from "../../../../assets/settings.svg";
import { ReactComponent as LogoutIcon } from "../../../../assets/logout.svg";
import { ImageBackground } from '../../../../image'
import { connect } from 'react-redux'
import { motion } from 'framer-motion'
import { filterKey } from '../../../../utils/data-utils'
import getPath from '../../../../utils/getPath'
import slugifyContent from '../../../../utils/slugifyContent'
import './Header.scss'
import { getSchoolId } from '../../utils'

const dropdownSubMenuAnimVariant = {
  enter: {
    opacity: 1,
    rotateX: 0,
    translateY: '10%',
    translateX: '-8%',
    transition: {
      duration: 0.3,
    },
    display: "block"
  },
  exit: {
    opacity: 0,
    rotateX: -15,
    translateY: '18%',
    translateX: '-8%',
    transition: {
      duration: 0.3,
    },
    transitionEnd: {
      display: "none"
    }
  }
};

const Header = props => {
  const [isDropdownMenuVisible, setDropdownMenuVisibility] = React.useState(false);

  React.useEffect(() => {
    const schoolId = getSchoolId(props.loggedInUser)
    fetchSchoolProfile(schoolId)
  }, [])
  const positionFixed = get(props, 'positionFixed', true)
  const schoolProfile = props.schoolProfile && props.schoolProfile.toJS()
  const schoolName = props.loggedInUser && props.loggedInUser.getIn(['schools', 0, 'name'])
  const schoolLogoUri = props.loggedInUser && props.loggedInUser.getIn(['schools', 0, 'logo', 'uri'])
  const loggedInUserName = props.loggedInUser && props.loggedInUser.getIn(['schoolAdmin', 'name'])
  const loggedInUserProfilePic = props.loggedInUser && props.loggedInUser.getIn(['schoolAdmin', 'profilePic.uri'])
  return (
    <>
    <div>
    <motion.div className={cx('header-container')} id="tk-landing-header"
      style={{ position: props.position || `${positionFixed ? 'fixed' : 'relative'}`}}
      >
        <div className={'header-row'}>
          <div style={{ flexDirection: 'row', display: 'flex',flex: 1, justifyContent : 'space-between', alignItems: 'center' }}>
            <div style={{ flexDirection: 'row', display: 'flex', alignItems: 'center' }}>
              <ImageBackground
                className={cx('header-schoolLogo', 'sr-200-35-600')}
                src={getPath(get(schoolProfile, 'logo.uri', schoolLogoUri))}
                srcLegacy={getPath(get(schoolProfile, 'logo.uri', schoolLogoUri))}
                style={{ marginLeft: '10px' }}
              />
              <div className='header-school-name'>{schoolName}</div>
            </div>
            <div style={{ flexDirection: 'row', display: 'flex', justifyContent: 'flex-end' }}>
              <motion.div
                onMouseEnter={() => setDropdownMenuVisibility(true)}
                onMouseLeave={() => setDropdownMenuVisibility(false)}
                >
                <motion.div 
                  whileTap={{
                    scale: 0.98
                  }}
                  className='header-loggedIn-username'
                >
                  <ImageBackground
                    className='header-user-profilePic' 
                    src={loggedInUserProfilePic ? getPath(loggedInUserProfilePic) : require('../../../../assets/SchoolDashboard/drop.svg')}
                    srcLegacy={loggedInUserProfilePic ? getPath(loggedInUserProfilePic) : require('../../../../assets/SchoolDashboard/drop.svg')}
                  />
                  {loggedInUserName}
                  <div className='header-profile-dropDownArrow' />
                </motion.div>
                  {/* <span className={cx('b2b-landing-page-header-dropdown-icon-closed', isDropdownMenuVisible ? 'b2b-landing-page-header-dropdown-icon-open' : '')} /> */}
                <motion.div
                  className="header-profile-sub-menu"
                  initial="exit"
                  animate={isDropdownMenuVisible ? "enter" : "exit"}
                  variants={dropdownSubMenuAnimVariant}
                >
                  <div className="header-profile-sub-menu-item" onClick={() => {
                    props.history.push(`/dashboard/${slugifyContent(schoolName)}/profile`)
                  }}>
                    <SettingsIcon className="header-profile-sub-menu-icon" />
                    Profile
                  </div>
                  <div className="header-profile-sub-menu-item" onClick={() => {props.dispatch({ type: 'LOGOUT' })}}>
                    <LogoutIcon className="header-profile-sub-menu-icon" />
                    Logout
                  </div>
                </motion.div>
              </motion.div>
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
  loggedInUser: filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser').get(0) || Map({}),
  schoolProfile: state.data.getIn(['schoolProfile','data']),
})

export default connect(mapStateToProps)(withRouter(Header))
