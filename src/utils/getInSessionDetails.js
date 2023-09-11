import { List } from 'immutable'
import store from '../store'
import { filterKey } from "./data-utils"

const getInSessionDetails = () => {
    const users = filterKey(store.getState().data.getIn(['user', 'data']), 'loggedinUser') || List([])
    if (users && users.toJS() && users.toJS().length) {
        const userDetails = users.toJS()[0]
    }
}

export default getInSessionDetails;
