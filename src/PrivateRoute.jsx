import React from 'react'
import { Redirect } from 'react-router-dom'
import { Route } from './components/RouterWithNav'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import qs from 'query-string'
import { get } from 'lodash'
import { filterKey } from './utils/data-utils'
import extractSubdomain, { isSubDomainActive } from './utils/extractSubdomain'
import { teacherAppSubDomains } from './constants'

const PrivateRoute = ({ component: Component, hasLogin, privateRoute = true, ...rest }) => {
  const isTeacherApp = isSubDomainActive && teacherAppSubDomains.includes(extractSubdomain())
  const excludedRoutePaths = ['/', '/code-playground']
  const isAccessingStudentApp = (isTeacherApp && !get(rest, 'managementApp') && !excludedRoutePaths.includes(get(rest, 'path')))
  return (
    <Route
      {...rest}
      component={isAccessingStudentApp ? Component : null}
      render={props => {
        if (((rest.user.get('id') && (rest.user.get('name') || rest.user.get('fname'))) || !privateRoute)) {
          return <Component {...rest} {...props} key={rest.keyPath ? get(rest, `computedMatch.params.${rest.keyPath}`, 'root') : 'root'} />
        }

        if (rest.hasMultipleChildrenButUserNotSelected) {
          return <Redirect
            to={{
              pathname: '/switch-account',
              state: { from: props.location }
            }}
          />
        }

        const params = qs.parse(window.location.search)
        if (!!Object.keys(params).length && params.redirect) {
          return (
            <Redirect
              to={{
                pathname: params.redirect,
                state: { from: props.location },
                search: qs.stringify({ ...params, redirect: rest.path })
              }}
            />
          )
        }
        if (!!Object.keys(params).length) {
          return (
            <Redirect
              to={{
                pathname: '/',
                state: { from: props.location },
                search: qs.stringify({ redirect: rest.path, ...params })
              }}
            />
          )
        }

        return (
          <Redirect
            to={{
              pathname: '/',
              state: { from: props.location },
            }}
          />
        )

      }}
    />
  )
}


export default connect(state => ({
  hasMultipleChildrenButUserNotSelected:
    state.data.getIn(['userChildren', 'data']).size,
  user: (filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').get(0) || Map({}))
}))(PrivateRoute)
