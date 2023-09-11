import MyReferrals from './MyReferrals'
import {connect} from "react-redux";
import {filterKey} from "../../utils/data-utils";
import {Map} from "immutable";
import fetchUserInvites from '../../queries/fetchInvitedUsers';

const mapStateToProps = (state) => {
    const invitedUsers = state.data.getIn(['userInvite','data'])
    return {
        ...fetchUserInvites().mapStateToProps(),
        loggedInUser: filterKey(state.data.getIn([
            'user',
            'data'
        ]), 'loggedinUser').get(0) || Map({}),
        invitedUsers,
        userCredit: state.data.getIn(['userCredit','data']),
        invitedUsersStatus: state.data.getIn([
            'userInvite',
            'fetchStatus'
        ]),
    }}

export default connect(mapStateToProps)(MyReferrals)
