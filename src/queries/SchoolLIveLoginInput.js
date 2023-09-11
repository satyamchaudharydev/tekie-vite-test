import gql from "graphql-tag"
import { get } from "lodash"
import { getToasterBasedOnType } from "../components/Toaster"
import config from "../config"
import duck from "../duck"
import { getUserForStateLoginWithEmailOrUsername } from "../pages/Signup/schoolLiveClassLogin/utils"
import store from "../store"
import { fireGtmEvent } from "../utils/analytics/gtmActions"
import { gtmEvents } from "../utils/analytics/gtmEvents"
import { SIGNUP_RESPONSE_SCHEMA } from "./utils/signupLoginUser"

const verifyOTP = async (userId, key, setIsLoading, buddyLoginInputArray = []) => {
  let buddyLoginInput = ''
  buddyLoginInputArray.forEach(buddy => {
    buddyLoginInput += `{userId: "${get(buddy, 'userId')}", isPrimaryUser: ${get(buddy, 'isPrimaryUser')}}`
  })
  if (buddyLoginInput) buddyLoginInput = `buddyLoginInput: [${buddyLoginInput}]`
  return duck.query({
    query: gql`
        mutation{
            schoolLiveClassLoginViaOtp(input:{
              ${userId ? `userId: "${userId}"` : ''}
              ${buddyLoginInput || ''}
            }){
              ${SIGNUP_RESPONSE_SCHEMA(true)}
      }
    }
    `,
    type: 'user/fetch',
    key: key || 'loggedinUser',
    variables: {
      tokenType: 'appTokenOnly'
    },
    changeExtractedData: (_, originalData) => {
      let shouldLogin = true
      if (!originalData || !originalData.schoolLiveClassLoginViaOtp) {
        getToasterBasedOnType({
          type: 'error',
          message: 'Unauthorized access'
        })
        fireGtmEvent(gtmEvents.otpLoginFailed)
        setIsLoading(false)
        return {}
      }
      if (get(originalData, 'schoolLiveClassLoginViaOtp.role') !== config.PARENT && get(originalData, 'schoolLiveClassLoginViaOtp.role') !== config.MENTEE) {
        getToasterBasedOnType({
          type: 'error',
          message: 'Unauthorized access'
        })
        fireGtmEvent(gtmEvents.otpLoginFailed)
        setIsLoading(false)
        return {}
      }
      localStorage.setItem('appVersion', import.meta.env.REACT_APP_VERSION)
      const timezone = get(originalData, 'schoolLiveClassLoginViaOtp.timezone')
      if (timezone && timezone !== 'null') {
        localStorage.setItem('timezone', get(originalData, 'schoolLiveClassLoginViaOtp.timezone'))
      }
      if (originalData.schoolLiveClassLoginViaOtp.role === 'selfLearner' || ((originalData.schoolLiveClassLoginViaOtp.role === 'mentor') && !get(originalData, 'schoolLiveClassLoginViaOtp.children[0]'))) {
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
              ...originalData.schoolLiveClassLoginViaOtp
            }
          }
        }
      }
      return getUserForStateLoginWithEmailOrUsername({
        ...originalData.schoolLiveClassLoginViaOtp
      }, true);
    }
  })
}


export default verifyOTP