import React, { lazy } from 'react'
import withSuspense from './components/Loading/withSuspense'
import { get } from 'lodash'
import Switch, { Route } from './components/RouterWithNav'
import PrivateRoute from './PrivateRoute'
import { routeType } from './constants';
import { getRoutesList } from './routesConfig';
import extractSubdomain, { isSubDomainActive } from './utils/extractSubdomain'
import { STUDENT_BASE_URL, TEACHER_BASE_URL } from './constants/routes/routesPaths'

const GlobalOverlay = typeof window !== 'undefined'
  ? withSuspense(lazy(() => import(/* webpackChunkName: "overlay" */`./components/GlobalOverlay`)))
  : () => <div />

// ⚠️ Note: All new routes should also be added to ./serverRoutes.js
//  else server side rendering will break
const routes = (props) => {
  const { PRIVATE } = routeType
  return (
    <>

      {
        (props.location && props.location.pathname && !props.location.pathname.startsWith('/sessions/'))
          ? (
            <GlobalOverlay {...props} />
          ) :
          (
            <div />
          )
      }
      <Switch>
        {[...getRoutesList(props).map((route, key) => {
          const { config: routeConfig, path, name = '', Component } = route
          if (Component) {
            let basePath = ""
            const isTeacherApp = get(routeConfig, 'managementApp', false)
            const isStudentApp = get(routeConfig, 'studentApp', false)

            if (isTeacherApp) basePath = TEACHER_BASE_URL
            if (isStudentApp) basePath = STUDENT_BASE_URL

            const path = `${basePath}${route.path}`
            if (get(routeConfig, 'routeType') === PRIVATE) {
              return <PrivateRoute exact path={path} name={name} component={Component} {...routeConfig} />
            }
            return <Route exact path={path} name={name} component={Component} {...routeConfig} />
          }
          return null
        }), <Route path='/not-found' noNav component={() => <div>Not Found</div>} />, <Route path='/' component={() => <div>Not Found</div>} />, <Route path='*' component={() => <div>Not Found</div>} />]}

      </Switch>
    </>
  )
}
export default routes