import TopicContainer from './TopicContainer'
import { connect } from 'react-redux'
import { filterKey } from '../../../../utils/data-utils'

const mapStateToProps = (state, props) => ({
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
        state.data.getIn(['userChildren', 'data']).size,
    cheatSheetsBySearch: state.data.getIn(['cheatSheetsBySearch', 'data']),
    isSearchFetching: state.data.getIn(['cheatSheetsBySearch', 'fetchStatus', 'cheatSheetsBySearch', 'loading']),
    isSearchFetched: state.data.getIn(['cheatSheetsBySearch', 'fetchStatus', 'cheatSheetsBySearch', 'success']),
    isCheatSheetFetching: state.data.getIn([
        'cheatSheetConcepts', 'fetchStatus', `${props.selectedTopic ? `cheatSheetConcepts/${props.selectedTopic}` : 'cheatSheetConcepts'}`, 'loading'
    ]),
})

export default connect(mapStateToProps)(TopicContainer)
