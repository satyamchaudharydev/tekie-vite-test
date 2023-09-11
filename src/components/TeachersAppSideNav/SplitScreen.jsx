import React, { useState, useEffect } from "react";
import { get } from "lodash";
import { Link, Route } from "react-router-dom";
import { List } from "immutable";
import { useHistory, useLocation, withRouter } from "react-router";
import isMobile, { isCRTScreen } from "../../utils/isMobile";
import getPath from "./../../utils/getPath";
import FlexContainer from "./components/FlexContainer";
import Nav from "./components/Nav";
import NavItem from "./components/NavItem";
import ProfileContainer from "./components/ProfileContainer";
import Role from "./components/Role";
import UserDetails from "./components/UserDetails";
import UserImage from "./components/UserImage";
import "./SplitScreen.scss";
import LogoutModal from "./components/logoutConfirmationModal";
import LogoutIcon from "../../assets/teacherApp/classroom/log-out-outline.svg";
import { filterKey } from "../../utils/data-utils";
import duck from "../../duck";
import getThemeColor from "../../utils/teacherApp/getThemeColor";
import config, { MOBILE_BREAKPOINT } from "../../config";
import { Helmet } from "react-helmet";
import SessionEmbed from "../../pages/TeacherApp/pages/SessionEmbed";
import switchToStudentApp from "../../utils/teacherApp/switchToStudentApp";
import fetchMentorChild from "../../queries/teacherApp/fetchMentorChild";
import { motion, AnimatePresence } from 'framer-motion'
import { isAccessingTeacherTraining } from "../../utils/teacherApp/checkForEmbed";
import Select from 'react-select'
import { customStyles } from "../../pages/TeacherApp/components/Dropdowns/Dropdown";
import hs, { hsFor1280 } from "../../utils/scale";
import getMe from "../../utils/getMe";
import { fireGtmEvent } from "../../utils/analytics/gtmActions";
import { gtmEvents } from "../../utils/analytics/gtmEvents";
import { getUserParams } from "../../utils/getUserParams";
import GarageIcon  from "../../assets/codeGarage/newGarage.svg";
import cx from 'classnames';


const newStyles = {
  ...customStyles,
  option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      cursor: 'pointer',
      fontWeight: '500',
      color: isSelected ? '#8C61CB' : '#333',
      fontSize: `${hs(20)} !important`,
      backgroundColor: isSelected ? '#F4F0FA' : 'white',
      '&:hover': {
          backgroundColor: isSelected ? '#F4F0FA' : '#F4F0FA',
      },
      display: 'block',
      overflowY: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
  }),
  control: (styles) => ({
      ...styles,
      cursor: "pointer",
      fontFamily: "Inter",
      width: '100%',
      minHeight: hsFor1280(36),
      maxHeight: hsFor1280(36),
      border: "1px solid #C6B3F7",
      outline: 'none',
      fontSize: `${hs(20)} !important`,
      borderRadius: "8px 8px 0 0",
      background: '#F8F5FE',
      boxShadow: "0 0 0 0px black",
      '&:hover': {
        border: `1px solid #C6B3F7`,
      },
      '&:disabled': {
        border: `1px solid #C6B3F7`,
      },
  }),
  placeholder: (styles) => ({
      ...styles,
      fontSize: `${hs(20)} !important`,
      color: "#333333 !important",
      fontWeight: "400",
  }),
  dropdownIndicator: (styles) => ({
      ...styles,
      position: 'relative',
      bottom: '2px',
      color: "#8C61CB",
      "&:hover": {
          color: "#8C61CB",
      },
  }),
  indicatorSeparator: (styles) => ({
      ...styles,
      backgroundColor: 'transparent'
  }),
  singleValue: (styles) => ({
      ...styles,
      color: '#8C61CB',
      fontWeight: '700',
      fontSize: `${hs(20)} !important`,
      top: '50%',
      justifyContent: 'flex-start!important'
  }),
  input: (styles) => ({
      ...styles,
      color: "transparent",
  }),
  valueContainer: (styles) => ({
      ...styles,
  }),
};

const isStudentProfilePresent = () => {
  if (window !== undefined) {
    const user =
      filterKey(
        window && window.store.getState().data.getIn(["user", "data"]),
        "loggedinUser"
      ) || List([]);
    const loginData = get(user.toJS()[0], "rawData");
    if (get(loginData, "mentorProfile.studentProfile")) {
      return true;
    }
    return false;
  }
  return false;
};

function SideNavIconVersion({ setVisibleSideNav, visibleSideNav }) {
  return (
    <>
      <div
        className={`menu__icon__container ${visibleSideNav ? 'open' : 'close'} `}
        onClick={() => setVisibleSideNav()}
      >
        <svg focusable="false" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path></svg>
      </div>
    </>
  );
}

const SplitScreen = (props) => {
  const user = getMe()
  const profilePic = get(props.loggedInUser.toJS(), "profilePic.uri");
  const userName = get(user, "name");
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [visibleSideNav, setVisibleSideNav] = useState(true);
  const [isAllowed, setIsAllowed] = useState(true)
  const [isNavItemsOpened, setIsNavItemsOpened] = useState(false)
  const [academicYears, setAcademicYears] = useState([])
  const [seeAllAcademicYear, setSeeAllAcademicYear] = useState(false)
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('')
  const [currentAcademicYear, setCurrentAcademicYear] = useState('')
  const routePath = useLocation()
  const history = useHistory()

  const currentPath = get(props, "path", "");
  const handleStateChange = () => {
    if (window !== undefined && !get(props, 'isAccessingStudentApp')) {
      const user =
        filterKey(
          window && window.store.getState().data.getIn(["user", "data"]),
          "loggedinUser"
        ) || List([]);
      // window.store.dispatch({ type: 'LOGOUT' })
        let loginData;
        const usersData = user && get(user.toJS(), '[0]')
        if (get(usersData, 'role') !== config.MENTOR || get(usersData, 'role') !== config.SCHOOL_ADMIN) {
          if (get(usersData, "role") === "schoolAdmin") {
            loginData = get(usersData, "schoolAdmin");
          } else {
            loginData = get(usersData, "rawData");
          }
          if (get(usersData, 'id') !== get(usersData, 'rawData.id')) {
            const { ...parent } = loginData;
            duck.merge(
              () => ({
                user: {
                  ...parent,
                  schoolTeacher: parent,
                  rawData: parent,
                  routedFromTeacherApp: false,
                },
                userParent: parent,
              }),
              {
                key: "loggedinUser",
              }
            ); 
          }
        }
      // if (!visibleSideNav && get(props, "path") === '/time-table') {
      //   setVisibleSideNav(true)
      // }
    } else if (get(props, 'isAccessingStudentApp')){
      switchToStudentApp(false)
    }
  }
  useEffect(() => {
    window.addEventListener("popstate", handleStateChange)
    handleStateChange()
    return () => window.removeEventListener("popstate", handleStateChange)
  }, [get(props, "path")]);
  useEffect(() => {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      setIsAllowed(false)
    }
    if (isCRTScreen()) {
      setVisibleSideNav(false)
    }
    const resizeOperation = () => {
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        setIsAllowed(false)
      } else setIsAllowed(true)
      if (isCRTScreen()) {
        setVisibleSideNav(false)
      }
    }
    window.addEventListener("resize", resizeOperation)
    return () => window.removeEventListener("resize", resizeOperation)
  }, [])
  useEffect(() => {
    getThemeColor();
  }, []);
  useEffect(() => {
    // fetchMentorChild()
  }, [])
  useEffect(() => {
    let academicYears = get(props.loggedInUser.toJS(), "academicYears") || get(props.loggedInUser.toJS(), "rawData.academicYears", []);
    if (academicYears && academicYears.length) {
      academicYears = academicYears.sort((a, b) => get(a, 'startDate') > get(b, 'startDate') ? 1 : -1)
    }
    let academicYear = localStorage.getItem('academicYear') || ''
    let alreadyExistAY = localStorage.getItem('academicYear') || ''
    const selectOptions = []
    const currentYear = new Date()

    // Added academicYears check as we are getting null value from backend if no academicYear exist
    academicYears && academicYears.length && academicYears.forEach(data => {
      if (new Date(get(data, 'startDate')) <= currentYear && new Date(get(data, 'endDate')) >= currentYear) {
        if (get(academicYear, 'id') !== get(data, 'id')) {
          academicYear = get(data, 'id')
        }
      }
    })
    // Added academicYears check as we are getting null value from backend if no academicYear exist
    if (!academicYear && academicYears && academicYears.length) {
      academicYears.length && academicYears.forEach(data => {
        if (new Date(get(data, 'startDate')).getFullYear() === currentYear.getFullYear()) {
          if (get(academicYear, 'id') !== get(data, 'id')) {
            academicYear = get(data, 'id')
          }
        }
      })
    }
    // Added academicYears check as we are getting null value from backend if no academicYear exist
    academicYears && academicYears.length && academicYears.forEach(item => {
      const obj = {
        value: get(item, 'id'),
        label: getYearFormat(get(item, 'startDate'), get(item, 'endDate')),
      }
      selectOptions.push(obj)
    })
    const defaultValue = selectOptions.find(item => get(item, 'value') === academicYear)
    if (alreadyExistAY) {
      const selectedOne = selectOptions.find(item => get(item, 'value') === alreadyExistAY)
      setSelectedAcademicYear(selectedOne)
    } else {
      localStorage.setItem('academicYear', academicYear)
      setSelectedAcademicYear(defaultValue)
    }
    setCurrentAcademicYear(defaultValue)
    setAcademicYears(selectOptions)
  }, [props.academicYears])

  const getYearFormat = (start, end) => {
    const startDateFormat = new Date(start).getFullYear()
    const endDateFormat = new Date(end).getFullYear()
    return `AY ${startDateFormat}-${endDateFormat}`
  }

  if (!isAllowed) {
    return (
      <div className="splitScreen notAllowedScreen">
        <h1>Please Open App in Desktop</h1>
      </div>
    )
  }
  const isNavAction = (props, name, childrens = []) => {
    const childElem = childrens.find(child => get(child, 'name') === name)
    if (childElem) {
      return get(props, 'name') === get(childElem, 'name')
    }
    return false
  }
  const getFirstTrainingBatchId = () => {
    const { mentorChild } = props
    const mentorBatches = (mentorChild && get(mentorChild.toJS(), 'batches', [])) || []
    let firstBatchId = get(mentorBatches, '0.id')
    return firstBatchId || ''
  }

  const checkIfShowSwitch = () => {
    if (academicYears.length > 1) {
      let count = 0
      for(let i=0; i<academicYears.length; i++) {
        if (get(academicYears[i], 'value') === get(currentAcademicYear, 'value')) {
          if (count) {
            return true
          }
        }
        count += 1
      }
    }
    return false
  }

  const renderAcademicYears = () => {
    return (
      <div className="academicYearContainer" style={{ width: '100%' }}>
      {seeAllAcademicYear ? (
        <Select
          className='testtest'
          components={{ IndicatorSeparator: () => null }}
          value={selectedAcademicYear}
          controlShouldRenderValue={true}
          placeholder='All Classrooms'
          styles={newStyles}
          isSearchable={false}
          options={academicYears}
          onChange={(value) => {
            const id = get(value, 'value')
            setSelectedAcademicYear(value)
            localStorage.setItem('academicYear', id)
            setSeeAllAcademicYear(false)
            history.push('/teacher/classrooms')
          }}
        />
      ) : (
        <>
        <div className="academicViewing">
          <p>VIEWING</p>
          <h4>{get(selectedAcademicYear, 'label')}</h4>
        </div>
        {checkIfShowSwitch() ? (
          <h3 onClick={() => setSeeAllAcademicYear(true)}>Switch</h3>
        ) : null}
        </>
      )}
      </div>
    )
  }
  return (
    <>
      <Helmet>
        <title>Teacher App - Tekie</title>
      </Helmet>
      {isCRTScreen() && <div onClick={() => setVisibleSideNav(!visibleSideNav)} className={`splitScreen-withCRT-overlay ${visibleSideNav && 'open'}`}></div>}
      <div className="splitScreen">
        {!get(props, 'isAccessingStudentApp') ? (
            <div
            id='splitScreen-sidenav-Id'
            className={`splitScreen-sidenav ${(isMobile() || !visibleSideNav) && 'hamburger'} ${isCRTScreen() && 'splitScreen-sidenav-withCRT'}`
            }
          >
            <Nav>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <Link to={props.to} className="logo-link">
                  <img src="../../tekieLogo.png" alt="tekie logo" />
                </Link>
              </div>

              <ProfileContainer>
                <FlexContainer>
                  <UserImage>
                    {profilePic ? (
                      <img src={getPath(profilePic)} alt="user" />
                    ) : userName ? (
                      userName[0].toUpperCase()
                    ) : (
                      ""
                    )}
                  </UserImage>
                  <UserDetails>
                    <span className="user-name">{userName}</span>
                    <Role>CS Teacher</Role>
                  </UserDetails>
                </FlexContainer>
                {/* <ArrowUpDown /> */}
              </ProfileContainer>
              {academicYears.length > 1 ? (
                renderAcademicYears()
              ) : null}
              {props.navItems &&
                props.navItems.map(({ title, isActive, iconType, route }) => {
                  return (
                    <NavItem
                      props={props}
                      title={title}
                      isActive={route.includes(props.activeRoute) && !route.includes('training')}
                      iconType={iconType}
                      route={route}
                    />
                  );
                })}
              {/* <div className="divider"></div> */}
              {props.trainingNavItems && props.trainingNavItems.map(({
                title, isActive, iconType, route, childrens, name
              }) => {
                if (childrens && childrens.length) {
                  const firstBatchId = getFirstTrainingBatchId()
                  return (
                    <>
                      <NavItem
                        props={props}
                        title={title}
                        isActive={isNavAction(props, name, childrens)}
                        iconType={iconType}
                        route={route}
                        isLink={false}
                        onNavClick={() => {
                          if (firstBatchId) {
                            return history.push(`${childrens[0].route}/${firstBatchId}`)
                          }
                          history.push(childrens[0].route)
                        }}
                      />
                      <AnimatePresence>
                    {isNavAction(props, name, childrens) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="childrens-nav-items">
                          {childrens.map((nav) => <NavItem
                              props={props}
                              title={nav.title}
                              isActive={`${get(nav, 'route')}/:batchId` === get(props, 'path')}
                              iconType={nav.iconType}
                              route={`${nav.route}/${firstBatchId}`}
                            />)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </>
                  )
                }
                return (
                  <NavItem
                    props={props}
                    title={title}
                    isActive={title.includes(props.name)}
                    iconType={iconType}
                    route={route}
                  />
                )
              })}
              {/* {isStudentProfilePresent() ? (
                  <span
                    className="switch-btn navitem-link navitem-link-secondary"
                    onClick={() => {
                      switchToStudentApp(props);
                    }}
                  >
                    Switch To Learning App
                  </span>
                ) : null} */}
                <Link to={'/code'} style={{color: window.location.href.includes('/code')?getThemeColor():'#333333'}} className={cx('navitem-link navitem-link-title', window.location.href.includes('/code') ? `navitem-link-active` : '')}>
                  <img src={GarageIcon} alt="tekie logo" /> <span style={{paddingLeft: '6px'}}>Code Garage</span>
                </Link>
            </Nav>
            <span
                className="logout-btn navitem-link"
                onClick={() => {
                  setIsLogoutModalVisible(true)
                  const me = getMe()
                  const userParams =  getUserParams()
                  fireGtmEvent(gtmEvents.logoutButtonClicked,{userParams})
                }}
              >
                <img src={LogoutIcon} alt={"Logout icon"} /> Logout
              </span>
          </div>
        ) : null}
        <div style={{overflow:get(routePath,'pathname').includes('time-table')?'hidden':'scroll'}} id='splitScreen-main-container' className={`splitScreen-main-component ${!visibleSideNav && 'hamburger'} ${isCRTScreen() && 'splitScreen-main-component-withCRT'} ${isAccessingTeacherTraining() && 'splitScreen-main-component-trainingApp'} ${!get(props,'leftPadding',true) && 'left-padding'} `}>
          {!get(props, 'isAccessingStudentApp') ?
            <SideNavIconVersion setVisibleSideNav={() => setVisibleSideNav(!visibleSideNav)} visibleSideNav={visibleSideNav} /> :
            null}
          {get(props, 'isAccessingStudentApp') ?
            <SessionEmbed {...props}>{props.component}</SessionEmbed>
            : <Route {...props} component={props.component} />}
        </div>
        {isLogoutModalVisible && (
          <LogoutModal setIsLogoutModalVisible={setIsLogoutModalVisible} />
        )}
      </div>
    </>
  );
};

export default withRouter(SplitScreen);
