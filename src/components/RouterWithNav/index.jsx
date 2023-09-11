import Route from './Route'
import { connect } from 'react-redux'
import Switch from './Switch'
import {filterKey} from '../../utils/data-utils'
import {Map} from 'immutable'

const mapStateToProps = (state) => ({
  user: filterKey(state.data.getIn([
    'user',
    'data'
  ]), 'loggedinUser').get(0) || Map({}),
  mentorMenteeSession: state.data.getIn([
    'mentorMenteeSession',
    'data'
  ])
})

export {
  Route
}

export default connect(mapStateToProps)(Switch)
