import { connect } from 'react-redux'
import {Map} from 'immutable'
import PaymentSuccessModal from './PaymentSuccessModal'
import { filterKey } from '../../utils/data-utils'

const mapStateToProps = (state, { match }) => {
    return {
        loggedInUser: filterKey(state.data.getIn([
            'user',
            'data'
        ]), 'loggedinUser').get(0) || Map({}),
        loggedInUserSchoolInfo: filterKey(state.data.getIn([
            'user',
            'data'
        ]), 'sessionHomepage') || Map({}),
        studentProfile: filterKey(
            state.data.getIn([
                'studentProfile',
                'data'
            ]), 'sessionHomepage'
        ),
        userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
    }
}

export default connect(mapStateToProps)(PaymentSuccessModal)
