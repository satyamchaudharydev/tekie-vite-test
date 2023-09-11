import { connect } from 'react-redux'
import HomePage from './HomePage'
import fetchHomePage from '../../queries/fetchHomePage'

export default connect(fetchHomePage().mapStateToProps)(HomePage)
