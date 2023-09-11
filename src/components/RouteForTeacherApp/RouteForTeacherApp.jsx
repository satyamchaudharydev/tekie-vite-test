import React from 'react'
import { Route, withRouter } from 'react-router'
import SplitScreen from '../TeachersAppSideNav'
import { getTeacherAppRoute, STUDENT_APP } from '../../navItems'

const RouteForTeacherApp = ({ component: Component, ...props }) => {
    if (props.noTeacherAppSideNav) {
        return <Route path={props.path} component={Component} />
    }
    return <Route path={props.path} render={(routeProps) => <SplitScreen  {...props} navItems={props.studentAppNavItems ? STUDENT_APP : getTeacherAppRoute({ isTimeTableEnabled: false, isClassroomEnabled: false })} component={Component} />} />
}


export default withRouter(RouteForTeacherApp)