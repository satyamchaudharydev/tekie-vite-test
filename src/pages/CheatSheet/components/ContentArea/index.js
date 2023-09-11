import ContentArea from './ContentArea'
import { connect } from 'react-redux'
import { filterKey } from '../../../../utils/data-utils'

const mapStateToProps = (state, props) => ({
    state: state,
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
        state.data.getIn(['userChildren', 'data']).size,
    cheatSheets: state.data.getIn(['cheatSheetConcepts', 'data']),
    isCheatSheetFetching: state.data.getIn([
        'cheatSheetConcepts', 'fetchStatus', `${props.selectedTopic ? `cheatSheetConcepts/${props.selectedTopic}` : 'cheatSheetConcepts'}`, 'loading'
    ]),
    isCheatSheetFetched: state.data.getIn(['cheatSheetConcepts', 'fetchStatus', `cheatSheetConcepts/${props.selectedTopic}`, 'success']),
    isBGCheatSheetFetching: state.data.getIn([
        'cheatSheetConcepts', 'fetchStatus', 'preventLoading', 'loading'
    ]),
    isBGCheatSheetFetched: state.data.getIn([
        'cheatSheetConcepts', 'fetchStatus', 'preventLoading', 'success'
    ]),
    cheatSheetBookmarkAddStatus: state.data.getIn(['cheatSheetConcepts', 'addStatus', 'addUserCheatSheet']),
    cheatSheetBookmarkAddFailure: state.data.getIn(['errors', 'cheatSheetConcepts/add']),
    cheatSheetBookmarkUpdateStatus: state.data.getIn(['cheatSheetConcepts', 'updateStatus', 'updateUserCheatSheet']),
    cheatSheetBookmarkUpdateFailure: state.data.getIn(['errors', 'cheatSheetConcepts/update']),
    favouritesCheats: state.data.getIn(['favouriteCheats', 'data']),
    isFavouriteCheatsFetching: state.data.getIn(['favouriteCheats', 'fetchStatus', 'favouriteCheats', 'loading']),
    isFavouriteCheatsFetched: state.data.getIn(['favouriteCheats', 'fetchStatus', 'favouriteCheats', 'success']),
})

export default connect(mapStateToProps)(ContentArea)
