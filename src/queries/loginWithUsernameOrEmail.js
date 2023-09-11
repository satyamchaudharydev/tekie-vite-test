import gql from 'graphql-tag'
import { get } from 'lodash'
import { getToasterBasedOnType } from '../components/Toaster'
import config from '../config'
import duck from '../duck'
import { getUserForStateLoginWithEmailOrUsername } from '../pages/Signup/schoolLiveClassLogin/utils'
import store from '../store'
import { failureToasterProps } from './loginViaPassword'
import getUserForState, { SIGNUP_RESPONSE_SCHEMA } from './utils/signupLoginUser'

const loginWithUsernameOrEmail = async (firstField = '', password = '', key, history, setIsLoading) => {
  let inputProperty = firstField.includes('@') ? 'email' : 'username'
  return duck.query({
    query: gql`
      mutation {
        loginViaPassword(input: {
          ${inputProperty}: "${firstField.trim()}"
        password: "${password.trim()}"
        }) {
          ${SIGNUP_RESPONSE_SCHEMA()}
      }
    }
    `,
    variables: {
      tokenType: 'appTokenOnly'
    },
    type: 'user/fetch',
    key: key || 'loggedinUser',
    changeExtractedData: (_, originalData) => {
      let shouldLogin = true
      if (!originalData || !originalData.loginViaPassword) {
        getToasterBasedOnType({
          type: 'error',
          message: 'Unauthorized access'
        })
        setIsLoading(false)
        return {}
      }
      if (get(originalData, 'loginViaPassword.role') !== config.PARENT && get(originalData, 'loginViaPassword.role') !== config.MENTEE
        && get(originalData, 'loginViaPassword.role') !== config.MENTOR) {
        getToasterBasedOnType({
          type: 'error',
          message: 'Unauthorized access'
        })
        setIsLoading(false)
        return {}
      }
      localStorage.setItem('appVersion', import.meta.env.REACT_APP_VERSION)
      const timezone = get(originalData, 'login.timezone')
      if (timezone && timezone !== 'null') {
        localStorage.setItem('timezone', get(originalData, 'loginViaPassword.timezone'))
      }
      if (originalData.loginViaPassword.role === 'selfLearner' || ((originalData.loginViaPassword.role === 'mentor') && !get(originalData, 'loginViaPassword.children[0]'))) {
        if (!shouldLogin && originalData.login.role !== 'mentor') {
          store.dispatch({
            type: 'user/fetch/failure',
            error: {
              status: 'UnexpectedError',
              errors: [{
                message: "Thank you for logging in, we'll get back to you shortly."
              }],
              data: {
                login: null
              }
            },
            autoReducer: true,
            key: 'loggedinUser',
            uniqId: null
          })
          return {}
        } else {
          return {
            user: {
              ...originalData.loginViaPassword
            }
          }
        }
      }
      const { ...parent } = originalData.loginViaPassword
      if (get(originalData, 'loginViaPassword.role') === 'mentor') {
        return getToasterBasedOnType(failureToasterProps('Oops! You need to use the Teacher app to login.'))
        // return {
        //   user: {
        //     ...get(originalData, 'loginViaPassword.children[0]'),
        //     isMentorLoggedIn: true,
        //     parent: { ...parent, parentProfile: { children: [get(originalData, 'loginViaPassword.mentorProfile.studentProfile.user')] } },
        //     email: originalData.loginViaPassword.email,
        //     createdAt: originalData.loginViaPassword.createdAt,
        //     rawData: originalData.loginViaPassword
        //   }
        // }
      }
      if (get(originalData, 'loginViaPassword.role') === 'mentor') {
        return getUserForState(originalData.loginViaPassword, () => {
          history.push('/switch-account')
        });
      } else {
        return getUserForStateLoginWithEmailOrUsername({ ...originalData.loginViaPassword }, false, () => {
          history.push('/switch-account')
        });
      }
    }
  })
}

export default loginWithUsernameOrEmail