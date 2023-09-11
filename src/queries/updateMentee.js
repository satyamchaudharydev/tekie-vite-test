import gql from 'graphql-tag'
import { get } from 'lodash'
import duck from '../duck'
import store from '../store'
import updateSheet from '../utils/updateSheet'
import { registeredGA } from '../utils/analytics/ga'
import { registeredFBP } from "../utils/analytics/fbPixel";
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
const updateMentee = (input, userId, schoolId,campaingId,batchId) =>
  duck.createQuery({
    query: gql`
      mutation updateParentChildDetail(
        $input: UpdateParentChildDetailInput
      ) {
        updateParentChildDetail(
          input: $input
          userId: "${userId}"
          ${schoolId ? `schoolId: "${schoolId}"` : ''}
          ${batchId ? `batchId: "${batchId}"` : ''}
        ) {
          id
          name
          role
          email
          source
          campaign {
            type
          }
          country
          phone {
            countryCode
            number
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
      tokenType: 'withParentToken'

    },
    changeExtractedData: (_, originalData) => {
      if (originalData && originalData.updateParentChildDetail) {
        // store.dispatch({ type: 'LOGOUT' })
        const phoneNumber = get(originalData, 'updateParentChildDetail.phone.number')
        const userId = get(
          get(originalData, 'updateParentChildDetail.children', [])
            .find(child => child.name === input.childName),
          'id'
        )
        const token = get(
          get(originalData, 'updateParentChildDetail.children', [])
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
        sessionStorage.removeItem('referralCode')
        registeredGA("Mentee")
        registeredFBP({ leadId: phoneNumber })
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
        localStorage.setItem('appVersion', import.meta.env.REACT_APP_VERSION)
        const { children, ...parent } = originalData.updateParentChildDetail
        let res = {}
        if (children.length > 1) {
          res = {
            userChildren: originalData.updateParentChildDetail.children,
            userParent: originalData.updateParentChildDetail
          }
        }

        return {
          ...res,
          user: {
            ...originalData.updateParentChildDetail.children[children.length - 1],
            campaign: get(originalData, 'updateParentChildDetail.campaign.type'),
            email: originalData.updateParentChildDetail.email,
            parent: parent,
            createdAt: originalData.updateParentChildDetail.createdAt
          }
        }
      }
    },
    type: 'user/fetch',
    key: 'loggedinUser'
  })

export default updateMentee
