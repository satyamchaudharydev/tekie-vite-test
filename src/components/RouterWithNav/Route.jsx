import React, { Component } from 'react'
import { withRouter, Route, Link } from 'react-router-dom'
import * as Sentry from "@sentry/react";
import { connect } from 'react-redux'
import { capitalize, get } from 'lodash'
import cx from 'classnames'
import qs from 'query-string'
import isMobile from '../../utils/isMobile'
import NavBar from '../NavBar'
import SideNavBar from '../SideNavBar'
import UpdatedSideNavBar from '../UpdatedSideNavBar'
import './Route.scss'
import PopUp from '../PopUp/PopUp'
import { filterKey, getDataFromLocalStorage } from '../../utils/data-utils'
import { Map } from 'immutable'
import SplitScreen from '../TeachersAppSideNav'
import { STUDENT_APP, getTeacherAppRoute, getTrainingDashboardRoute } from '../../navItems'
import classNames from 'classnames'
import { isIPad } from '../../utils/is32BitArch'
import { checkIfEmbedEnabled } from '../../utils/teacherApp/checkForEmbed'
import { subscribeToGraphql } from '../../utils/requestToGraphql'
import fetchBatchSessionSubscription from '../../queries/subscriptionQuery/fetchBatchSessionSubscriptionConfig'
import { sessionStatus } from '../../pages/TeacherApp/pages/TimeTable/constants'
import extractSubdomain, { isSubDomainActive } from '../../utils/extractSubdomain'
import mixPanelRoutesToElementMap, { appNames, mixPanelEvents } from '../../constants/mixpanel/mixPanelConst'
import { getCodePlayground } from '../../utils/getCourseId'
import mixpanelTrack from '../../utils/mixpanel-actions'
import { studentAppSubDomains, teacherAppSubDomains } from '../../constants'
import { Helmet } from 'react-helmet'
import config from '../../config'
import getRole from '../../constants/roleGroup';
import { CHEATSHEET_URL, CODE_PLAYGROUND, SELECTED_CODE_STATS_URL, STUDENT_COMMUNITY_URL } from '../../constants/routes/routesPaths';

class RouteWithNav extends Component {
  constructor(props) {
    super(props);
    const _this = this;
    this.state = {
      width: typeof window === 'undefined' ? 1920 : window.innerWidth,
      showHamMenu: false,
      startTime: new Date(),
      endTime: null,
      isMixPanelEventTriggered: false,
    }
    this.mutationObserver = typeof window !== 'undefined' && new MutationObserver((mutations) => {
      mutations.forEach((mutation) => _this.mutationObserverCallback(mutation));
    });
    this.subscription = null;
  }

  /**m
   * @param {string} path
   */
  replaceParameters = path => {
    return path.replace(new RegExp(':', 'g'), '')
  }
  getActiveParent = (activeParent) => {
    if (this.props.revisitRoute) {
      return '/sessions'
    }
    return activeParent && activeParent.route
  }

  componentDidMount = async () => {
    window.addEventListener('resize', () => {
      const { innerWidth } = window
      if (this.state.width !== innerWidth) {
        this.setState({
          width: innerWidth
        })
      }
    })
    const isStudentApp = studentAppSubDomains.includes(extractSubdomain())
    if (isStudentApp) {
      const currRoute = get(this.props, 'location.pathname')
      if (currRoute) {
        const user = this.props.user && this.props.user.toJS()
        const activeClassroomId = getDataFromLocalStorage("activeClassroom")
        if (activeClassroomId && get(user, 'id')) {
          const subscriptionConfig = fetchBatchSessionSubscription()
          this.subscription = await subscribeToGraphql({
            ...subscriptionConfig,
            onDataReceived: (data) => this.logoutHandler(data)
          })
        }
      }
      const favicon = document.getElementById("favicon");
      if (favicon) {
        favicon.href = "student-favicon.ico";
      }
    }
    const sessionDivIndentifier = document.querySelector("#root")
    if (this.mutationObserver) {
      this.mutationObserver.observe(sessionDivIndentifier, {
        subtree: true,
        childList: true
      })
    }
  }

  mutationObserverCallback = (mutation) => {
    if (get(mutation, 'target') && !this.state.isMixPanelEventTriggered) {
      let routeLink = this.getRouteLink()
      const element = routeLink && mixPanelRoutesToElementMap[routeLink]
      if (element && get(element, 'pageTitle') && get(element, 'pageIdentifier')) {
        let { pageTitle, pageIdentifier } = element
        const mixPanelDiv = get(mutation, 'target').querySelector(`.${pageIdentifier}`)
        if (mixPanelDiv) {
          const endTime = new Date();
          let timeTakenInSec = (new Date(endTime).getTime() - new Date(this.state.startTime).getTime()) / 1000
          timeTakenInSec = Number(timeTakenInSec).toFixed(2)
          // add page Load to window object
          window.pageLoad = timeTakenInSec
          this.setState({ endTime: new Date(), isMixPanelEventTriggered: true }, () => {
            const { loggedInUser, studentProfile } = this.props
            const user = loggedInUser && loggedInUser.toJS()
            if (get(user, 'id', '')) {
              const { startTime, endTime } = this.state
              if (routeLink === 'code-playground') {
                let language = ''
                if (get(qs.parse(window.location.search), 'language')) {
                  language = get(qs.parse(window.location.search), 'language');
                }
                if (!language) language = getCodePlayground()
                if (language) pageTitle = `${capitalize(language)} Code Playground`
              }
              const appName = teacherAppSubDomains.includes(extractSubdomain()) ? appNames.TEACHER_APP : appNames.STUDENT_APP;
              mixpanelTrack(mixPanelEvents.PAGE_VIEWED, {
                loggedInUser: loggedInUser && loggedInUser.toJS(),
                studentProfile: studentProfile && get(studentProfile.toJS(), '[0]'),
                startTime,
                endTime,
                pageTitle: pageTitle || routeLink
              }, appName)
            }
          })
        }
      }
    }
  }

  componentWillUnmount = () => {
    if (this.mutationObserver) this.mutationObserver.disconnect()
    this.unSubscribeFetch()
  }

  checkIfNotReview = () => {
    const currRoute = get(this.props, 'location.pathname')
    if (currRoute && (currRoute.includes('sessions/quiz-report-latest') || currRoute.includes('/quiz') || currRoute.includes('/codingAssignment') || (currRoute.includes('/practice') && !currRoute.includes('sessions/practice')))) {
      return false
    }
    return true
  }

  componentDidUpdate = async (prevProps) => {
    const prevRoute = get(prevProps, 'location.pathname')
    const currRoute = get(this.props, 'location.pathname')
    if ((prevRoute !== currRoute) && (currRoute && currRoute.startsWith('/sessions/')) && this.checkIfNotReview()) {
      localStorage.setItem('prevRoute', currRoute)
    }
    if (!this.checkIfNotReview()) {
      localStorage.setItem('prevRoute', '')
    }
    const isStudentApp = studentAppSubDomains.includes(extractSubdomain())
    // if (isStudentApp){
    //   if ((prevRoute !== currRoute) && currRoute) {
    //     const activeClassroomId = getDataFromLocalStorage("activeClassroom")
    //     const user = this.props.user && this.props.user.toJS()
    //     if (activeClassroomId && get(user, 'id') && !this.subscription) {
    //       const subscriptionConfig = fetchBatchSessionSubscription()
    //       this.subscription = await subscribeToGraphql({
    //           ...subscriptionConfig,
    //           onDataReceived: (data) => this.logoutHandler(data)
    //       })
    //     }
    //   }
    // }
    if (prevRoute !== currRoute) {
      this.setState({
        isMixPanelEventTriggered: false,
        startTime: new Date(),
        endTime: null
      })
    }
  }

  getRouteLink = () => {
    let routeLink = get(this.props, 'computedMatch.path', '')
    let routeParams = Object.keys(get(this.props, 'computedMatch.params', {}) || {}).map(routeParams => `/:${routeParams}`)
    let isHomework = false
    if (routeLink && routeLink !== '/sessions' && routeLink !== '/homework') {
      if (routeLink.includes('/revisit')) routeParams.push('/revisit')
      if (routeLink.includes('/sessions')) routeParams.push('/sessions')
      if (routeLink.includes('/homework')) {
        const isHomeworkRoute = typeof window !== 'undefined' && get(window, 'location.pathname', '').includes('/homework')
        if (isHomeworkRoute) isHomework = true
        routeParams.push('/homework')
      }
    }
    routeParams.forEach(route => {
      routeLink = routeLink.replace(route, '')
    })
    routeLink = routeLink.replace('/', '')
    if (isHomework) {
      routeLink = `homework-${routeLink}`
    }
    if (teacherAppSubDomains.includes(extractSubdomain())) {
      if (routeLink.includes('student-level') && routeParams.includes('/:userId')) {
        routeLink = `${routeLink}/individual-student`
      }
      if (routeLink === 'classrooms' && routeParams.includes('/:batchId')) routeLink = `individual-${routeLink}`
    }
    if (routeLink === '') {
      routeLink = 'login'
    }
    return routeLink
  }
  unSubscribeFetch = () => {
    if (this.subscription && this.subscription.unSubscribe) this.subscription.unSubscribe()
  }

  logoutHandler = (sessionDetail) => {
    if (get(sessionDetail, 'batchSession', []).length) {
      const session = get(sessionDetail, 'batchSession[0]')
      if (get(session, 'logoutAllStudents', false)
        && (get(session, 'sessionStatus') === sessionStatus.completed || get(session, 'retakeSessions', []).length)) {
        this.props.dispatch({ type: 'LOGOUT' })
        if (isSubDomainActive) {
          if (studentAppSubDomains.includes(extractSubdomain())) this.props.history.push('/')
          else this.props.history.push('/login')
        }
      }
    }
  }


  toggleHamMenu = () => {
    if (this.state.showHamMenu) {
      this.setState({
        showHamMenu: false
      })
    } else {
      this.setState({
        showHamMenu: true
      })
    }
  }

  renderMenuItems = (menu, path, activeItem) => {
    return (
      <div style={{ height: '100%' }}>
        {menu.map(item => {
          if (item.onClick) {
            return (
              <div
                className={cx('route-menuItems', (path === item.route || activeItem === item.route) ? 'route-activeBackground' : '')}
                onClick={() => {
                  this.setState({ showHamMenu: false })
                  item.onClick()
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className={'route-text'}>
                  {item.name}
                </div>
              </div>
            )
          }
          if (item.showInHamMenu) {
            return (
              <Link
                className={cx('route-menuItems', (path === item.route || activeItem === item.route) ? 'route-activeBackground' : '')}
                to={item.route}
                onClick={() => {
                  this.setState({
                    showHamMenu: false
                  })
                }}>
                <div className={'route-text'}>
                  {item.name}
                </div>
              </Link>
            )
          }
          return <></>
        })}
      </div>

    )
  }

  isSSR = () => {
    if (typeof window === 'undefined') return true
    if (window.__SSR__) return true
    return false
  }

  renderRoute = ({ props, withUpdatedSideNav, navConfigMobile, path, activeParent, navConfig, noMobileHeader, isAccessingStudentApp }) => {
    const isAccessingLearningResources = ((path === '/code-playground' || path === '/cheatsheet' || path === '/cheatsheet/:topicId' || path === '/cheatsheet/:topicId/:cheatsheetId') && checkIfEmbedEnabled()) || false
    const user = props.loggedInUser && props.loggedInUser.toJS()
    const isLoggedIn = get(user, 'id')
    return (
      <>
        {(!isAccessingStudentApp && path !== '/') ?
          <Helmet>
            <meta
              name="description"
              content="We bring the art of storytelling to make learning a movie-like experience.
          Starting with first of it’s kind animated sitcom series to teach basics of
          programming, live 1:1 to students of age 12+. We are on a mission to train innovators and entrepreneurs of next-generation on the right skills they need for the future."
            />
            <title>Tekie - Online Coding Courses for Kids | World's 1st Education Series on Coding</title>
          </Helmet> : null
        }
        <div>
          {(!props.noNav && (props.outSideNav || props.topRootNav || props.sideNav)) && isLoggedIn &&
            <NavBar
              navConfig={navConfig} path={this.replaceParameters(path)}
              activeParentRoute={this.getActiveParent(activeParent)}
              toggleHamMenu={this.toggleHamMenu}
              noMobileHeader={noMobileHeader || false}
            />
          }
          <div className={classNames({
            'route-container': !isMobile(),
            '__IPad__': isIPad(),
            'route_container_forTeacherApp': checkIfEmbedEnabled()
          })}>
            {isIPad() && (
              <div className='rotateDevice'>
                <span className='rotateDeviceIcon' />
                OH! no! Rotate your Device to <br />Landscape mode!
              </div>
            )}
            {withUpdatedSideNav && !isMobile() && !isAccessingLearningResources && isLoggedIn &&
              <UpdatedSideNavBar
                computedMatch={this.props.computedMatch || this.props.match}
                parent={this.props.parent}
                key="sideNav"
                withUpdatedSideNav={withUpdatedSideNav}
                outSideNav={this.props.outSideNav}
                revisitRoute={this.props.revisitRoute}
              />
            }
            {props.sideNav && !withUpdatedSideNav &&
              <SideNavBar
                computedMatch={this.props.computedMatch || this.props.match}
                parent={this.props.parent}
                revisitRoute={this.props.revisitRoute}
              />
            }
            <div className={
              cx(
                props.noNav ? 'route-bodyContainerFull' : 'route-bodyContainer',
                props.noNav && props.noOverflow ? '' : 'route-bodyOverflowOverlay',
                withUpdatedSideNav ? 'route-bodyPositionUnset' : '',
                this.props.className,
                (withUpdatedSideNav && this.props.outSideNav && isLoggedIn) ? isAccessingLearningResources ? 'session-embed-code-playground' : 'route-page-with-outside-nav' : '',
                (checkIfEmbedEnabled() && !props.fullHeight) ? 'session-embed-full' : '',
              )
            }
              style={{
                background: `${props.background ? props.background : ''}`
              }}
              id="tk-route-container"
            >
              {
                this.state.width < 1000
                  ? (
                    <div>
                      <PopUp
                        showPopup={this.state.showHamMenu}
                        closePopUp={() => this.setState({ showHamMenu: false })}
                        ref={this.props.ref}
                        leftAlignedChildren
                      >
                        <div style={{ height: '100%' }}>
                          <div className={'route-sideBar'}>
                            {this.renderMenuItems(navConfigMobile, path, this.getActiveParent(activeParent))}
                          </div>
                        </div>
                      </PopUp>
                    </div>
                  ) : <div />
              }
              <Route {...props} component={props.component} />
            </div>
          </div>
        </div>
      </>
    )
  }

  render() {
    const { navItem, sideNavItem, withUpdatedSideNav, noMobileHeader, ...props } = this.props
    const loggedInUser = props.loggedInUser && props.loggedInUser.toJS();
    if (loggedInUser && loggedInUser.id) {
      Sentry.setUser(loggedInUser);
    }
    let subDomain = extractSubdomain();
    if (subDomain !== 'student' && subDomain !== 'teacher') {
      subDomain = `website${subDomain ? `:${subDomain}` : ''}`
    }
    Sentry.setTag('app', subDomain);
    const { path } = props.computedMatch || props.match
    const navConfig = props.navItems.filter(navItem => navItem.navItem)
    const navConfigMobile = [
      ...props.navItems.filter(navItem => navItem.showInHamMenu),
      { name: 'Published Code', route: SELECTED_CODE_STATS_URL, showInHamMenu: true },
      { name: 'Student Community', route: STUDENT_COMMUNITY_URL, showInHamMenu: true },
      { name: 'Code Playground', route: CODE_PLAYGROUND, showInHamMenu: true },
      { name: 'Cheat Sheet', route: CHEATSHEET_URL, showInHamMenu: true },
      { showInHamMenu: true, onClick: () => { this.props.dispatch({ type: 'LOGOUT' }) }, name: 'Logout' }
    ]
    const activeParent = props.navItems.find(navItem => {
      if (navItem.name === props.parent) {
        return true
      }
      return false
    })
    if ((props.hideNavLoggedOut && props.loggedInUser.size === 0)) {
      if (props.bodyContainerFull) {
        return (
          <div>
            <div className={'route-bodyContainerFull'}>
              <Route {...props} component={props.component} />
            </div>
          </div>
        )
      }
      return (
        <Route {...props} component={props.component} />
      )
    }
    const user = this.props.user && this.props.user.toJS()
    const isTeacherApp = isSubDomainActive && teacherAppSubDomains.includes(extractSubdomain())
    const excludedRoutePaths = ['/', '/code-playground', '/cheatsheet', '/cheatsheet/:topicId', '/cheatsheet/:topicId/:cheatsheetId', '/s/:redirectId', '/teacher', 'student']
    // let isSchoolTrainer = get(user, 'roles', []).includes(config.SCHOOL_TRAINER)
    const isAccessingStudentApp = props.path.includes('sessions')
    let isQuestionPaperGeneratorEnabled = get(user, 'mentorProfile.schools[0].isQuestionPaperGeneratorEnabled')
    if (props.managementApp) {
      let { mentorChild } = props
      mentorChild = mentorChild && mentorChild.toJS()
      const mentorBatches = get(mentorChild, 'batches', [])
      if (props.noTeacherAppSideNav) {
        return <Route {...props} path={props.path} component={props.component} />
      }
      let isSchoolTeacher = getRole(get(user, 'roleid')) === config.TEACHER
      // if (!isSchoolTrainer) {
      //   isSchoolTrainer = get(user, 'rawData.roles', []).includes(config.SCHOOL_TRAINER)
      // }
      if (!isSchoolTeacher) {
        isSchoolTeacher = get(user, 'rawData.secondaryRole') === config.SCHOOL_TEACHER
      }
      if (!isQuestionPaperGeneratorEnabled) {
        isQuestionPaperGeneratorEnabled = get(user, 'rawData.mentorProfile.schools[0].isQuestionPaperGeneratorEnabled')
      }
      return <SplitScreen
        {...props}
        component={isAccessingStudentApp ? this.renderRoute({
          props,
          withUpdatedSideNav,
          navConfigMobile,
          path,
          activeParent,
          navConfig,
          noMobileHeader
        }) : props.component}
        navItems={props.studentAppNavItems ? STUDENT_APP : getTeacherAppRoute({
          isSchoolTeacher, isSchoolTrainer: false, isQuestionPaperGeneratorEnabled
        })}
        trainingNavItems={getTrainingDashboardRoute({
          isSchoolTrainer: false, isTeacherAddedInBatch: mentorBatches.length,
        })}
        isAccessingStudentApp={isAccessingStudentApp}
      />
    }
    return this.renderRoute({
      props,
      withUpdatedSideNav,
      navConfigMobile,
      path,
      activeParent,
      navConfig,
      noMobileHeader
    })
  }
}

const mapStateToProps = state => ({
  loggedInUser: filterKey(state.data.getIn([
    'user',
    'data'
  ]), 'loggedinUser').get(0) || Map({}),
  topics: state.data.getIn(['topic', 'data']),
  studentProfile: state.data.getIn(['studentProfile', 'data']),
  mentorChild: state.data.getIn(['mentorChild', 'data'])
})
export default connect(mapStateToProps)(withRouter(RouteWithNav))
