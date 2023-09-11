import gql from 'graphql-tag'
import { get } from 'lodash'
import duck from '../duck'
import store from '../store'
import updateSheet from '../utils/updateSheet'
import { registeredGA } from '../utils/analytics/ga'
import {registeredFBP} from "../utils/analytics/fbPixel";
import successfulRegistrationGAFBP from '../utils/analytics/successfulRegistrationGAFBP'
import addUserLocationLog from './addUserLocationLog'
import getAuthToken from '../utils/getAuthToken'
import addUserDeviceLog from './addUserDeviceLog'

const batchSlots = `
batch {
  id
  b2b2ctimeTable {
    ${new Array(24).fill('').map((_, i) => `slot${i}`).join('\n')}
  }
}
`

const signUpMentee = (input, schoolId, campaignId, onSuccess = () => {}, key) =>
  duck.createQuery({
    query: gql`
      mutation parentChildSignUp($input: ParentChildSignUpInput) {
        parentChildSignUp(
          input: $input
          ${schoolId ? `schoolId: "${schoolId}"` : ''}
          ${campaignId ? `campaignId: "${campaignId}"` : ''}
        ) {
          id
          name
          token
          role
          email
          source
          country
          phone {
            countryCode
            number
          }
          campaign {
            type
          }
          createdAt
          children {
            id
            name
            token
            role
          }
          parentProfile {
            children {
              id
              grade
              section
              profileAvatarCode
              ${batchSlots}
              user {
                id
                timezone
              }
              batch {
                type
              }
              school {
                id
                name
                whiteLabel
                logo {
                  uri
                }
              }
            }
          }
        }
      }
    `,

    variables: {
      input,
      tokenType: 'appTokenOnly'
    },
    changeExtractedData: (_, originalData) => {
      if (originalData && originalData.parentChildSignUp) {
        store.dispatch({ type: 'LOGOUT' })
        localStorage.setItem('appVersion', import.meta.env.REACT_APP_VERSION)
        const sheetInput = {
          "Phone": input.parentPhone.number,
          Parent_name: originalData.parentChildSignUp.name,
          Student_name: input.childName,
          Grade: input.grade.replace('Grade', ''),
          Email: originalData.parentChildSignUp.email,
          "Lead generated on": '',
          "Lead Source": "WEBSITE",
        }
        const leadSquaredInput = {
          "Phone": input.parentPhone.number,
          mx_Student_Name: input.childName,
          mx_Student_Grade: input.grade.replace('Grade', ''),
          FirstName: originalData.parentChildSignUp.name,
          EmailAddress: originalData.parentChildSignUp.email,
          Source: "WEBSITE"
        }
        
        if (input.referralCode) {
          sheetInput["Referral Code"] = input.referralCode
          leadSquaredInput.mx_Referral_Code = input.referralCode
        }

        const phoneNumber = get(originalData, 'parentChildSignUp.phone.number')
        const userId = get(
          get(originalData, 'parentChildSignUp.children', [])
            .find(child => child.name === input.childName),
          'id'
        )
        const token = get(
          get(originalData, 'parentChildSignUp.children', [])
            .find(child => child.name === input.childName),
          'token'
        )
        const authToken = getAuthToken('', token)
        // add userLocationLog
        if (localStorage.getItem('ipapi') && authToken !== undefined) {
          addUserLocationLog(JSON.parse(localStorage.getItem('ipapi')), userId, authToken)
        }
        // add userDeviceLog
        if (localStorage.getItem('deviceInfo') && authToken !== undefined) {
          addUserDeviceLog(JSON.parse(localStorage.getItem('deviceInfo')), userId, authToken)
        }
        updateSheet(sheetInput, {}, true)
        sessionStorage.removeItem('referralCode')
        onSuccess()
        registeredGA("Mentee")
        registeredFBP({leadId: phoneNumber})
        successfulRegistrationGAFBP()
        // update affiliate TP

        if (import.meta.env.REACT_APP_NODE_ENV === 'production') {
          // track apoxy
          if (
              input.utmMedium && input.utmMedium.includes('affiliate') && 
              input.utmSource && input.utmSource.includes('TP_SVG')
            ) {
              let newElem = document.createElement("div");
              newElem.innerHTML = `
                <img height="0" width="0" src="https://www.s2d6.com/x/?x=sp&h=71986&o=${phoneNumber}&g=&s=0.00&q=1" />
              `
              document.querySelector('#global-div').append(newElem)
            }
          // track linkedin
          let newElem = document.createElement("div");
          newElem.innerHTML = `
            <img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=2848756&conversionId=3334644&fmt=gif" />
            <img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=3261433&conversionId=4175097&fmt=gif" />
          `
          newElem.innerHTML += `
              <iframe src="https://ttrk.ringocount.com/pixel?adid=618b66b3bfb52d559a442ff2&txn_id=${userId}" scrolling="no" frameborder="0" width="1" height="1"></iframe>
            `
          document.querySelector('#global-div').append(newElem)
        }
        const { children, ...parent } = originalData.parentChildSignUp
        let res = {}
        if (children.length > 1) {
          res = {
            userChildren: originalData.parentChildSignUp.children,
            userParent: originalData.parentChildSignUp
          }
        }

        return {
          ...res,
          user: {
            ...originalData.parentChildSignUp.children[children.length - 1],
            campaign: get(originalData, 'parentChildSignUp.campaign.type'),
            email: originalData.parentChildSignUp.email,
            parent: parent,
            createdAt: originalData.parentChildSignUp.createdAt
          }
        }
      }
    },
    type: 'user/fetch',
    key: 'loggedinUser'
  })

export default signUpMentee
