import Account from './account'
import { connect } from 'react-redux'
import { Map } from 'immutable'

const mapStateToProps = state => {
  const users = state.data.getIn(['user', 'data'])
  const menteeRole = users.find((userObj) => userObj.get('role') === 'mentee')
  const selfLearnerRole = users.find((userObj) => userObj.get('role') === 'selfLearner')
  const studentProfile = state.data.getIn(['studentProfile', 'data']).find((studentData) => {
    return studentData.get('id') === (menteeRole || selfLearnerRole).getIn(['studentProfile', 'id'])
  })

  return {
    user: menteeRole || selfLearnerRole || Map(),
    accountProfileLoading: state.data.getIn(['user', 'fetchStatus', 'accountProfile', 'loading']),
    accountProfileSuccess: state.data.getIn(['user', 'fetchStatus', 'accountProfile', 'success']),
    studentProfile: studentProfile || Map(),
    parentDetails: (studentProfile || Map()).getIn(['parents', 0, 'user']),
    studentProfileLoading: state.data.getIn(['studentProfile', 'fetchStatus', 'accountProfile', 'loading']),
    studentProfileSuccess: state.data.getIn(['studentProfile', 'fetchStatus', 'accountProfile', 'success']),
    userError: state.data.getIn(['errors', 'user/fetch']),
  }
}
export default connect(mapStateToProps)(Account)