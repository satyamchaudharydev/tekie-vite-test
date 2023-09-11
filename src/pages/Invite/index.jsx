import React from 'react'
import { connect } from 'react-redux'
import Invite from './Invite'
import config from "../../config";
import {filterKey} from "../../utils/data-utils";
import {Map} from "immutable";
import fetchUserInvitesMeta from '../../queries/fetchUserInvitesMeta';
import InviteLoggedOut from './InviteLoggedOut';

const renderInvite = (props) => {
    if (props.loggedInUser.size) {
        return <Invite {...props} />
    }
    return <InviteLoggedOut />
}
const mapStateToProps = (state) => {
    const users = state.data.getIn(['user','data'])
    const menteeRole = users.find((userObj)=>userObj.get('role') === config.MENTEE)
    const selfLearnerRole = users.find((userObj)=>userObj.get('role') === config.SELF_LEARNER)
    return {
        loggedInUser: filterKey(state.data.getIn([
            'user',
            'data'
        ]), 'loggedinUser').get(0) || Map({}),
        profile: menteeRole || selfLearnerRole,
        accountProfileSuccess: state.data.getIn(['user','fetchStatus','accountProfile','success']),
        userInvitesCount: state.data.getIn(['userInvitesMeta', 'data', 'count'], 0)
    }}

export default connect(mapStateToProps)(renderInvite)
