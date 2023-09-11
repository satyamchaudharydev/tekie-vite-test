import { connect } from 'react-redux'
import CodePlayground from './CodePlayground'
import {Map} from 'immutable'
// import fetchMenteeCourseSyllabus from '../../queries/sessions/fetchMenteeCourseSyllabus'
import { filterKey } from '../../utils/data-utils'

const mapStateToProps = (state) => ({
    loggedInUser: filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0) || Map({}),
    savedCode: state.data.getIn([
        'savedCode',
        'data'
    ]),
    savedCodeStatus: state.data.getIn([
        'savedCode',
        'fetchStatus'
    ]),
    savedCodeDeleteStatus: state.data.getIn([
        'savedCode',
        'deleteStatus',
        'deleteSavedCode'
    ]),
    savedCodeUpdateStatus: state.data.getIn([
        'savedCode',
        'updateStatus',
        'updateSavedCode'
    ]),
    totalSavedCodes: state.data.getIn([
        'totalSavedCodes',
        'data'
    ])
})

export default connect(mapStateToProps)(CodePlayground)
