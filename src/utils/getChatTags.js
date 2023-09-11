import { get } from "lodash"
import moment from "moment"
import { getActiveBatchDetail } from "./multipleBatch-utils"

const getChatTags = (studentCurrentStatus, forB2b = false) => {
    const tags = ['registered']
    if (studentCurrentStatus === 'preDemo') tags.push('pre-demo')
    if (studentCurrentStatus === 'postDemo') tags.push('post-demo')
    if (studentCurrentStatus === 'onBoarding') tags.push('onboarding')
    if (studentCurrentStatus === 'paidUser') tags.push('paid user')
    if (studentCurrentStatus === 'churned') tags.push('churned')
    if (forB2b) tags.push(...['b2b_Student', 'Scheduling_related'])
    return tags
}

const getLoggedOutTags = (forB2b = false) => {
  const tags = ['unregistered']
  if (forB2b) tags.push(...['b2b_Student', 'Login_related'])
  return tags
}

const renderChats = ({ isLoggedIn, studentCurrentStatus, loggedInUser, studentProfile, b2BLandingPage = false }) => {
  if (window && window.fcWidget && window.fcWidget.isLoaded()) {
    window.fcWidget.show()
    if (isLoggedIn) {
      const loggedInUserDetails = loggedInUser && loggedInUser.toJS().length > 0 ? loggedInUser.toJS()[0] : {}
      const studentDetails = (studentProfile && studentProfile.toJS()) || []
      const batchDetail = getActiveBatchDetail(studentDetails.length && get(studentDetails, '[0].batch'))
      const isB2bBatch = get(batchDetail, 'type', 'normal') === 'b2b' || b2BLandingPage
      const userRole = get(loggedInUserDetails, 'role', 'mentee')
      let userEmail = ''
      let userName = ''
      if (userRole === 'schoolAdmin') {
        userEmail = get(loggedInUserDetails, 'email')
        userName = get(loggedInUserDetails, 'name')
      } else {
        userEmail = get(loggedInUserDetails, 'parent.email')
        userName = get(loggedInUserDetails, 'name')
      }
      const tags = getChatTags(studentCurrentStatus, isB2bBatch)
      window.fcWidget.setFaqTags({
        tags,
        filterType: 'article'
      })
      window.fcWidget.user.isExists().then(res => {
        if (res && !res.data) {
          window.fcWidget.user.setProperties({
            firstName: userName,
            email: userEmail || ''
          })
        } else {
          window.fcWidget.user.setEmail(userEmail).then(re => {
            window.fcWidget.user.setFirstName(userName)
          })
        }
      })
    } else {
      window.fcWidget.setFaqTags({
        tags: getLoggedOutTags(b2BLandingPage),
        filterType: 'article'
      })
      window.fcWidget.user.isExists().then(res => {
        if (res && !res.data) {
          const currentDate = moment().format('MM-DD-YYYY/HH-MM-SS')
          window.fcWidget.user.setProperties({
            firstName: `User${currentDate}`,
            email: `User${currentDate}`
          });
        }
      })
    }
  } else {
    if (window && window.fcWidget) {
      window.fcWidget.hide()
    }
  }
}

export default renderChats