
import gql from 'graphql-tag'
import duck from '../duck'
import store from '../store'
import { registeredGA } from '../utils/analytics/ga'

const signUpSelfLearner = (input, prompt = () => {}, shouldLogin = false) =>
  duck.createQuery({
    query: gql`
    mutation{
      signUp(input:{
        phone:{
          countryCode:"${input.countryCode}"
          number:"${input.phone}"
        }
        name: "${input.name}"
        email: "${input.email}"
        }){
          id
          name
          phone {
            countryCode
            number
          }
          token
          role
          email
        }
      }
    `,

    variables: {
      tokenType: 'appTokenOnly'
    },
    changeExtractedData: (_, originalData) => {
      if (originalData.signUp) {
        store.dispatch({ type: 'LOGOUT' })
        registeredGA("Self Learner")
        if (shouldLogin) {
          return {
            user: originalData.signUp
          }
        } else {
          store.dispatch({
            type: 'user/fetch/failure',
            error: {
              status: 'UnexpectedError',
              errors: [{
                message: "Thank you for signing up, we'll get back to you shortly."
              }],
              data: {
                validateUserOTP: null
              }
            },
            autoReducer: true,
            key: 'loggedinUser',
            uniqId: null
          })
        }
      }
      return {
        user: {}
      }
    },
    type: 'user/fetch',
    key: 'loggedinUser'
  })

export default signUpSelfLearner
