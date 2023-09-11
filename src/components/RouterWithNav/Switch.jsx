import React, { Component } from 'react'
import { Switch, withRouter } from 'react-router-dom'

class SwitchWithNav extends Component {
  /**
   * @param {string} path
   */
  replaceParameters = path => {
    return path.replace(new RegExp(':','g'),'')
  }

  shouldShowSessionsItems = (child, userRole) => {
    if (child.props.sessionsOnly && userRole !== 'mentee') {
      return false
    } else if (child.props.hideInSession && userRole === 'mentee') {
      return false
    }

    return true
  }

  render() {
    const { children, ...props } = this.props
    const navItems = children
      .filter(child => child && child.props)
      .filter(child => (child.props.navItem || child.props.sideNavItem) && this.shouldShowSessionsItems(child, this.props.user.getIn(['role'])))
      .map(child => ({
        route: this.replaceParameters(child.props.path),
        navItem: child.props.navItem,
        sideNavItem: child.props.sideNavItem,
        name: child.props.name,
        showInHamMenu: child.props.showInHamMenu
      }))
    const manipulatedChildren = children
      .filter(child => child && child.props)
      .map(child => ({
        ...child,
        props: {
          ...child.props,
          navItems,
          nav: child.props.navItem,
          sideNav: child.props.sideNavItem
        }
    }))
    return (
      <>
        <Switch {...props} children={manipulatedChildren} />
      </>
    )
  }
}

export default withRouter(SwitchWithNav)
