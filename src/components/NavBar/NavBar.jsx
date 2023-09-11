import React, { Component } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { connect } from 'react-redux'
import cx from 'classnames'
import { get } from 'lodash'
import { Link, withRouter } from 'react-router-dom'
import { ReactComponent as CourseIcon } from './courseIcon.svg'
import { ReactComponent as CommunityIcon } from './communityIcon.svg'
import './NavBar.scss'
import ProfileIcon from './ProfileIcon'
import arrowBlue from '../../assets/arrowBlue.svg'
import downLight from '../../assets/downLight.svg'
import { getCodePlayground, getCourseName } from '../../utils/getCourseId'
import { PYTHON_COURSE } from '../../config'
import getPath from '../../utils/getPath'
import { filterKey } from '../../utils/data-utils'
import store from '../../store'
import { List } from 'immutable'
import duck from '../../duck'
import { checkIfEmbedEnabled } from '../../utils/teacherApp/checkForEmbed'
import { isSessionOrHomeworkPage } from '../../utils/buddyUtils'
import { CHEATSHEET_URL, CODE_PLAYGROUND, SESSIONS_URL, STUDENT_BASE_URL } from '../../constants/routes/routesPaths'


export const RightArrow = (props) => (
  <svg className={cx('main_navbar_course_arrow', props.active && 'active')} viewBox="0 0 14 25" fill="none" {...props}>
  <path
    d="M1.938 1.883l10.124 10.124L1.938 22.132"
    stroke="#00ADE6"
    strokeWidth={3.375}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>
)

const navItems = [
  {
    name: 'sessions',
    title: 'Course',
    icon: CourseIcon,
    link: '/sessions'
  },
  {
    name: 'community',
    title: 'Community',
    icon: CommunityIcon,
    link: '/student-community'
  }
]
class NavBar extends Component {
  state = {
    isDropDownVisible: false,
    width: typeof window === 'undefined' ? 0 : window.innerWidth,
    isResource: false,
    isResourceActive: false,
    isCourse: false
  }

  componentDidMount() {
    // fetchUserCredit(this.props.user.get('id')).call()
    window.addEventListener('resize', () => {
      const { innerWidth } = window
      if (this.state.width !== innerWidth) {
        this.setState({
          width: innerWidth
        })
      }
    })
    const { location } = this.props
    if (location.pathname.split('/').includes('cheatsheet') || location.pathname.split('/').includes('code-playground')) {
      this.setState({ isResourceActive: true })
    }
  }
  componentDidUpdate(prevProps) {
    const { location } = this.props
    if (get(prevProps, 'location.pathname') !== get(location, 'pathname')) {
      if (location.pathname.split('/').includes('cheatsheet') || location.pathname.split('/').includes('code-playground')) {
        this.setState({ isResourceActive: true })
      } else {
        this.setState({ isResourceActive: false })
      }
    }
  }

  openDropDown = () => {
    this.setState({
      isDropDownVisible: true
    })
  }

  closeDropDown = () => {
    this.setState({
      isDropDownVisible: false
    })
  }

  toggleDropDown = () => {
    this.setState(prevState => {
      return { isDropDownVisible: !prevState.isDropDownVisible }
    })
  }

  getRelativeMouse = (event) => {
    return {
      x: event.pageX - this.coords.x,
      y: event.pageY - this.coords.y
    }
  }
  toggleResourceDropDown = () => {
    this.setState(prevState => {
      return { isResource: !prevState.isResource }
    })
  }

  checkIfResourcesEnabled = () => {
    return false
    // const { location: { pathname } } = this.props
    // const isPythonCourse = getCourseName() === PYTHON_COURSE || getCodePlayground(false) === 'python'
    // const notAllowedRoutes = (pathname !== '/sessions' && pathname !== '/homework')
    // if (notAllowedRoutes && isPythonCourse) {
    //   return true
    // }
    // return false
  }

  renderSessionNavItem = (title, Icon, userCourse, isActive) => {
    let cancelClosing = null;
    let cancelClosingDropdown = null;
    let selectedCourse = localStorage.getItem('selectedCourse')
    return (
      <div className={cx('main_navbar_noMargin', 'main_navbar_menus', 'main_navbar_dropdown')}
        onMouseEnter={() => {
          clearTimeout(cancelClosing)
          clearTimeout(cancelClosingDropdown)
          this.setState({ isCourse: true })
        }}
        onMouseLeave={() => {
          cancelClosing = setTimeout(() => this.setState({ isCourse: false }), 200);
        }}
        style={{ cursor: "pointer" }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center'
        }}>
          <div className='main_navbar_navItemIcon'>
            <Icon />
          </div>
          {title}
          <svg width="100%" height="100%" className='down_Arrow' viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5.34113 6.2475L1.14463 1.45075C0.649385 0.886375 1.05188 3.21743e-07 1.80351 3.21743e-07H10.1965C10.3647 -0.000143902 10.5294 0.0482019 10.6709 0.139248C10.8123 0.230295 10.9245 0.360182 10.994 0.513357C11.0636 0.666531 11.0875 0.836498 11.0629 1.00291C11.0383 1.16931 10.9662 1.3251 10.8554 1.45163L6.65888 6.24663C6.57676 6.34061 6.47547 6.41593 6.36183 6.46755C6.24819 6.51916 6.12482 6.54586 6.00001 6.54586C5.8752 6.54586 5.75183 6.51916 5.63819 6.46755C5.52455 6.41593 5.42326 6.34061 5.34113 6.24663V6.2475Z"
              fill={isActive ? "#00ADE6" : "#A8A7A7"}
              style={{ transition: 'all 0.3s ease-in-out' }}
            />
          </svg>

          {/* Down Arrow */}
        </div>
        <div
          className={cx('main_navbar_drop_course', this.state.isCourse && 'main_navbar_dropShowCourse')}
        >
          {userCourse.map(
            (course, i) => this.renderCourseNav(course, selectedCourse, userCourse, i === userCourse.length - 1)
          )}
        </div>
      </div>
    )
  }

  renderNavItem = (
    navItems,
    navItem,
    shouldShowMultipleCourses,
    userCourse,
    isCourseActive
  ) => {
    const thisNavItem = navItems.find(item => item.name === navItem.name)
    if (!thisNavItem) {
      return navItem.name
    }

    if (shouldShowMultipleCourses && navItem.name === 'sessions') {
      return this.renderSessionNavItem(thisNavItem.title, thisNavItem.icon, userCourse, isCourseActive)
    }
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className='main_navbar_navItemIcon'>
          <thisNavItem.icon />
        </div>
        {thisNavItem.title}
      </div>
    )
  }

  renderCourseNav = (course, selectedCourse, userCourse, isLastItem) => {
    const activeBatchId = localStorage.getItem("activeClassroom")
    const isMultipleBatch = get(course, 'classroom.id')
    const handleCourseChange = () => {
      if (selectedCourse !== get(course, 'courseId') || (isMultipleBatch && activeBatchId && activeBatchId !== get(course, 'classroom.id'))) {
        const users = store.getState().data.getIn(['user', 'data']).toJS();
        const userParent = store.getState().data.getIn(['userParent', 'data'], List([]))
        const userChildren = store.getState().data.getIn(['userChildren', 'data'], List([]))

        const loggedInUser = users.filter(user => get(user, '__keys').includes('loggedinUser') && get(user, 'token'))
        this.props.dispatch({ type: 'LOGOUT' })
        let newUserCourse = [...userCourse]
        if (isMultipleBatch) {
          newUserCourse = newUserCourse.map(userCourseBatch =>
            get(userCourseBatch, 'classroom.id') === get(course, 'classroom.id') ?
              { ...userCourseBatch, activeClassroom: true } : { ...userCourseBatch, activeClassroom: false })
          localStorage.setItem("activeClassroom", get(course, 'classroom.id'))
        }
        duck.merge(() => ({
          userCourse: newUserCourse,
        }), {
          key: 'userCourse'
        })
        localStorage.setItem('selectedCourse', get(course, 'courseId'))
        duck.merge(() => ({
          user: loggedInUser,
          userChildren: userChildren.toJS(), userParent: userParent.toJS() }), {
          key: 'loggedinUser'
        })
      }
    }
    const isCardActive = isMultipleBatch ? activeBatchId === get(course, 'classroom.id') : selectedCourse === get(course, 'courseId')
    return <>
      {course && get(course, 'title') ? (
        <div
          className={cx(
            'main_navbar_active_drop_item',
            isCardActive
            && 'main_navbar_activeNav'
          )}
          style={isCardActive ? { cursor: 'unset' } : { cursor: 'pointer' }}
          onClick={() => {
            handleCourseChange()
            if (this.props.path !== '/sessions') {
              this.props.history.push('/sessions')
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', padding: 0 }}>
            {get(course, 'thumbnail.uri') ? (
              <div
                className='main_navbar_thumbnail'
                style={{ backgroundImage: `url("${getPath(get(course, 'thumbnail.uri'))}")` }}
              >
              </div>
            ) : null}
            <div>
              <div className={`main_navbar_course_title ${get(course, 'thumbnail.uri') ? '' : 'main_navbar_noThumbnailText'}`}>
                {get(course, 'title')}
              </div>
              {get(course, 'isCourseCompleted') ? (
                <div className='main_navbar_course_completed_tag'>COMPLETED</div>
              ) : (
                <>
                 {(get(course, 'currentTopic.title') && !isMultipleBatch) && (
                    <div className='main_navbar_up_next'>
                      <span>UP NEXT</span>
                      <div className='main_navbar_up_next_arrow'>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.30839 10.3572L10.7555 7.89102L8.30839 5.4248M10.4155 7.89102H5.45312" stroke="#A8A7A7" stroke-width="1.18378" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M8.10642 13.8105C11.3742 13.8105 14.0253 11.1593 14.0253 7.89158C14.0253 4.62384 11.3742 1.97266 8.10642 1.97266C4.83868 1.97266 2.1875 4.62384 2.1875 7.89158C2.1875 11.1593 4.83868 13.8105 8.10642 13.8105Z" stroke="#A8A7A7" stroke-width="1.18378" stroke-miterlimit="10"/>
                        </svg>
                      </div>
                    </div>
                  )}
                  <div className='main_navbar_topic_title'>{isMultipleBatch ? <span className='main_navbar_allottedMentor'>{`Teacher: ${get(course, 'allottedMentor.displayName') ? get(course, 'allottedMentor.displayName') : get(course, 'allottedMentor.name')}`}</span> : get(course, 'currentTopic.title')}</div>
                </>
              )}
            </div>
          </div>
          <RightArrow active={isCardActive}  />
        </div>

      ) : null}
      {!isLastItem && <div className={'main_navbar_hrLineCourse'}></div>}
    </>
  }

  render() {
    const { navConfig, path, location, noMobileHeader } = this.props
    let cancelClosing = null;
    let cancelClosingDropdown = null;
    const { isResource, isResourceActive } = this.state
    const newNavs = navConfig.filter(({ name }) => name !== 'Resources' && name !== 'code playground')
    const user = (this.props.user && this.props.user.toJS) ? this.props.user.toJS() : {}
    const children = get(user, 'parent.parentProfile.children', [])
    const child = children.find(c => get(c, 'user.id') === get(user, 'id'))
    const loggedInUser = child ? child : {}
    const isB2B = get(loggedInUser, 'batch.type') === 'b2b'
    const schoolLogo = getPath(get(loggedInUser, 'school.logo.uri'))
    const logo = (isB2B && get(loggedInUser, 'school.whiteLabel', true) && schoolLogo) ? schoolLogo : false
    let userCourse = (filterKey(store.getState().data.getIn(['userCourse', 'data']), 'userCourse') || List([])).toJS()
    if (checkIfEmbedEnabled() && isSessionOrHomeworkPage()) {
      return <></>
    }
    if (checkIfEmbedEnabled() && (path === '/code-playground' || path.includes('/cheatsheet'))) return <></>
    userCourse = userCourse.filter(course => get(course, 'title'))
    const courseRoutes = ['/sessions', '/homework', '/code-playground']
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
        {/* {!breakPoint ? */}
          <div className={`main_navbar_container ${noMobileHeader ? 'main_navbar_session_hide_mobile' : 'main_navbar_session_hide_mobile'}`}>
            <div className={'main_navbar_hamburgerWrapper'} onClick={() => this.props.toggleHamMenu()}/>
            {logo ? (
              <div
                className={'main_navbar_tekie_school_logo'}
                style={{ backgroundImage: `url("${logo}")`}}
              ></div>
            ) : (
              <a href={SESSIONS_URL} style={{ textDecoration: 'none' }}>
                <div className={'main_navbar_tekieLogo'} onClick={() => {
                }}></div>
              </a>
            )}
            <div className={'main_navbar_navContainer'}>
              {newNavs.map((navItem, i) => (
                <Link to={navItem.route} className={
                  cx(
                    'main_navbar_navItem',
                    (i === newNavs.length - 1),
                    (((path === navItem.route) ||
                      (this.props.activeParentRoute === navItem.route)) ||
                      (navItem.route === '/sessions' && courseRoutes.includes(path))
                    ) && 'main_navbar_activeNav',
                  )}
                >
                  {this.renderNavItem(
                    navItems,
                    navItem,
                    navItem.name === 'sessions' && userCourse && userCourse.length > 1,
                    userCourse,
                    path === navItem.route ||
                    this.props.activeParentRoute === navItem.route ||
                    courseRoutes.includes(path)
                  )}
                </Link>
              ))}
              <Link to='/student-community' className={
                  cx(
                    'main_navbar_navItem',
                      (path.includes('/student-community')) && 'main_navbar_activeNav',
                  ) }
              >{this.renderNavItem(navItems, { name: 'community' })}</Link>
              {/* {this.checkIfResourcesEnabled() && (
                <Link to='/code-playground' className={
                    cx(
                      'main_navbar_navItem',
                        (path === '/code-playground') && 'main_navbar_activeNav',
                    ) }
                >Code Playground</Link>
              )} */}
              {this.checkIfResourcesEnabled() && (
                <div className={cx('main_navbar_noMargin', 'main_navbar_menus', 'main_navbar_dropdown')}
                  onMouseEnter={() => {
                    clearTimeout(cancelClosing)
                    clearTimeout(cancelClosingDropdown)
                    this.setState({ isResource: true })
                  }}
                  onMouseLeave={() => {
                    cancelClosing = setTimeout(() => this.setState({ isResource: false }), 500);
                  }}
                  style={{ cursor: "pointer" }}>
                  <div
                    className={cx('main_navbar_navItem', 'main_navbar_noMargin')}
                    style={{ display: 'flex', color: isResource || isResourceActive ? '#00ade6' : '#aaacae', padding: '10px' }}>Resources
                      <img alt='Arrow Icon' src={isResource || isResourceActive ? arrowBlue : downLight} style={{ marginLeft: '8px' }} />
                    </div>
                  <div
                    className={cx('main_navbar_drop', isResource && 'main_navbar_dropShow')}>
                    <div className={cx(location.pathname.split('/').includes('code-playground') && 'main_navbar_activeNav')}>
                      <Link to={CODE_PLAYGROUND}>Code Playground</Link>
                    </div>
                    <div className={cx(location.pathname.split('/').includes('cheatsheet') && 'main_navbar_activeNav')}><Link to={CHEATSHEET_URL}>Cheat Sheet</Link></div>
                  </div>
                </div>
              )}
            </div>
            {!checkIfEmbedEnabled() && (
              <ProfileIcon
                openDropdown={this.openDropDown}
                closeDropdown={this.closeDropDown}
                isDropDownVisible={this.state.isDropDownVisible}
                hasMultipleChildren={this.props.hasMultipleChildren}
                credits={this.props.userCredit.getIn([0, 'credits'], 0)}
                logout={() => {
                  this.props.dispatch({ type: 'LOGOUT' })
                }}
                width={this.state.width}
              />
            )}
          </div>
        {/* : '' } */}
        </motion.div>
      </AnimatePresence>
    )
  }
}

export default connect()(withRouter(NavBar))
