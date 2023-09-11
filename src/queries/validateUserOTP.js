import gql from 'graphql-tag'
import { get } from 'lodash'
import { getToasterBasedOnType } from '../components/Toaster'
import config from '../config'
import duck from '../duck'
import { getUserForStateLoginWithEmailOrUsername } from '../pages/Signup/schoolLiveClassLogin/utils'
import store from '../store'
import { isSubDomainActive } from '../utils/extractSubdomain'
import isSchoolWebsite from '../utils/isSchoolWebsite'
import { utmDetailKeys } from '../utils/utmParameterAction'
import { failureToasterProps } from './loginViaPassword'
import { SIGNUP_RESPONSE_SCHEMA } from './utils/signupLoginUser'

const batchSlots = `
batch {
  id
  type
  documentType
  coursePackage{
    id
    title
  }
  b2b2ctimeTable {
    ${new Array(24).fill('').map((_, i) => `slot${i}`).join('\n')}
  }
}
`

const getValidationQuery = (input, validateMagicLink = false, loginViaOtp = false) => {
  let query = gql`mutation{
      validateUserOTP(input:{
        phone:{
          countryCode:"${input.countryCode}"
          number:"${input.phone}"
        }
          phoneOtp: ${input.otp}
        }){
          ${SIGNUP_RESPONSE_SCHEMA()}
        }
      }`
  if (validateMagicLink) {
    query = gql`mutation{
      validateUserOTP: validateMagicLink(input: { linkToken: "${input.linkToken}", ${loginViaOtp ? `loginViaOtp: true` : ''} }){
        ${SIGNUP_RESPONSE_SCHEMA()}
        }
      }`
  }
  return query
}

//SCHOOLADMIN prop is mandatory!
const validateUserOTP = (input, shouldLogin, key, callbackIfMultipleChildren = () => { }, onSuccess = () => { }, teacherApp) =>
  duck.createQuery({
    query: getValidationQuery(input, input.validateMagicLink, get(input, 'loginViaOtp', false)),
    variables: {
      tokenType: 'appTokenOnly'
    },
    changeExtractedData: (_, originalData) => {
      if (originalData && originalData.validateUserOTP && originalData.validateUserOTP) {
        if (originalData.validateUserOTP.children && originalData.validateUserOTP.children.length) {
          utmDetailKeys.forEach(key => {
            // removing UTM from localStorage when successfully LoggedIn
            if (localStorage.hasOwnProperty(key) && localStorage.getItem(key)) {
              localStorage.removeItem(key)
            }
          })
        }
        onSuccess()
        // if ((get(originalData, 'validateUserOTP.role') === config.MENTOR) && (get(originalData, 'validateUserOTP.secondaryRole') === config.SCHOOL_TEACHER)) {
        //   return {
        //     user: {
        //       ...originalData.validateUserOTP,
        //       schoolTeacher: originalData.validateUserOTP,
        //     },
        //   };
        // }
        if (teacherApp) {
          if (
            get(originalData, "validateUserOTP.role") === config.MENTOR &&
            get(originalData, "validateUserOTP.secondaryRole") === config.SCHOOL_TEACHER
          ) {
            if (get(originalData, 'validateUserOTP.mentorProfile.schools') && get(originalData, 'validateUserOTP.mentorProfile.schools').length === 0) {
              return getToasterBasedOnType(failureToasterProps('Not Authorized'))
            }
            return {
              user: {
                ...originalData.validateUserOTP,
                schoolTeacher: originalData.validateUserOTP,
                rawData: originalData.validateUserOTP
              },
            };
          }
          if (get(originalData, "validateUserOTP.role") === config.MENTOR) {
            const isSchoolTrainer = get(originalData, "validateUserOTP.roles", []).includes(config.SCHOOL_TRAINER) 
            if (isSchoolTrainer) {
              return {
                user: {
                  ...originalData.validateUserOTP,
                  schoolTeacher: originalData.validateUserOTP,
                  rawData: originalData.validateUserOTP
                },
              };
            }
          }
          return getToasterBasedOnType(failureToasterProps('Oops! You need to use the Student app to login.'))
        }
        localStorage.setItem('appVersion', import.meta.env.REACT_APP_VERSION)
        localStorage.setItem('timezone', get(originalData, 'validateUserOTP.timezone'))
        if (originalData.validateUserOTP.role === 'selfLearner' || ((originalData.validateUserOTP.role === 'mentor') && !get(originalData, 'validateUserOTP.children[0]'))) {
          if (!shouldLogin && originalData.validateUserOTP.role !== 'mentor') {
            store.dispatch({
              type: 'user/fetch/failure',
              error: {
                status: 'UnexpectedError',
                errors: [{
                  message: "Thank you for logging in, we'll get back to you shortly."
                }],
                data: {
                  validateUserOTP: null
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
                ...originalData.validateUserOTP
              }
            }
          }
        }
        const { children, schools, ...parent } = originalData.validateUserOTP
        if(get(originalData, 'validateUserOTP.role') === 'mentor') {
          return {
            user: {
                ...get(originalData, 'validateUserOTP.children[0]'),
                isMentorLoggedIn: true,
                parent: { ...parent, parentProfile: { children: [get(originalData ,'validateUserOTP.mentorProfile.studentProfile')] } },
                email: get(originalData, 'validateUserOTP.email'),
                createdAt: get(originalData, 'validateUserOTP.createdAt')
              }
          }
        }
        // before user loggingIn reset the redux store to default values
        // store.dispatch({
        //   type: 'LOGOUT'
        // })
        if (isSchoolWebsite() || isSubDomainActive) {
          if (originalData.validateUserOTP.role === config.SCHOOL_ADMIN) {
            return {
              user: {
                ...originalData.validateUserOTP,
                schoolAdmin: originalData.validateUserOTP
              }
            }
          }
        }
        if (children && children.length > 1 && !isSchoolWebsite()) {
          callbackIfMultipleChildren()
          return {
            userChildren: originalData.validateUserOTP.children,
            userParent: originalData.validateUserOTP,
          }
        }
        if (import.meta.env.REACT_APP_NODE_ENV === 'production') {
          if (!children) {
            var newElem = document.createElement("div");
            newElem.innerHTML = `<img src="https://track.omguk.com/e/si/?APPID=${get(originalData, 'validateUserOTP.id')}&MID=2299448&PID=51777&Status=" style="display:none;" border="0" height="1" width="1">`
            newElem.innerHTML += `<iframe src='https://tracking.icubeswire.co/aff_a?offer_id=2612&adv_sub1=${get(originalData, 'validateUserOTP.id')}&adv_sub2=${get(input, 'countryCode')}${get(input, 'phone')}' width='1' height='1' id='pixelcodeurl' /></iframe>`
            document.querySelector('#global-div').append(newElem)
          }
        }
        return getUserForStateLoginWithEmailOrUsername({
        ...originalData.validateUserOTP
      }, true);
        // return {
        //   user: {
        //     ...get(originalData, 'validateUserOTP.children[0]'),
        //     campaign: get(originalData, 'validateUserOTP.campaign.type'),
        //     email: originalData.validateUserOTP.email,
        //     parent: parent,
        //     createdAt: get(originalData, 'validateUserOTP.createdAt'),
        //     studentProfile: get(originalData, 'validateUserOTP.parentProfile.children[0]')
        //   },
        //   studentProfile: get(originalData, 'validateUserOTP.parentProfile.children[0]')
        // }
      }
    },
    type: 'user/fetch',
    key: key || 'loggedinUser'
  })

export default validateUserOTP