import { Map } from 'immutable';
import { connect } from 'react-redux'
import { filterKey } from '../../utils/data-utils'
import SplitScreen from './SplitScreen'

const mapStateToProps = (state) => {
    return {
        loggedInUser: filterKey(state.data.getIn([
            'user',
            'data'
        ]), 'loggedinUser').get(0) || Map({}),
        mentorChild: state.data.getIn(['mentorChild', 'data']),
    };
}


export default connect(mapStateToProps)(SplitScreen)
