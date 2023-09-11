import get from "lodash/get";
import duck from "../../duck";
import store from "../../store";

const UserAlreadyLoggedInIntoAnotherSystemHandler = (user, errorData) => {
  user = (user && user.toJS()) || []
  if (user.length && get(errorData, 'userId')) {
    const buddyDetailsFromState = get(user, '[0].buddyDetails', [])
    const newBuddyDetails = buddyDetailsFromState.filter(buddy => get(buddy, 'id') !== get(errorData, 'userId'))
    if (!newBuddyDetails.length) {
      return store.dispatch({ type: 'LOGOUT' })
    }
    const newSecondaryBuddies = buddyDetailsFromState.filter(buddy => !get(buddy, 'isPrimaryUser') && get(buddy, 'id') !== get(errorData, 'userId'))
    if (buddyDetailsFromState.length !== newSecondaryBuddies.length) {
        duck.merge(
        () => ({
            user: {
            ...user[0],
            buddyDetails: newBuddyDetails
            },
        }),
        {
          key: "loggedinUser",
        }
        );
        return true;
    }
  }
  return true;
}

export default UserAlreadyLoggedInIntoAnotherSystemHandler;
