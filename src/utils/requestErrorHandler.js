import { List } from "immutable";
import get from "lodash/get";
import { filterKey } from "./data-utils";
import UserAlreadyLoggedInIntoAnotherSystemError from "./errorHandlerFunctions/UserAlreadyLoggedInIntoAnotherSystemHandler";

const requestErrorHandler = (error) => {
  let errorFromApi = (get(error, 'errors', []) || [])
  if (errorFromApi && errorFromApi.length) {
    const errorObject = errorFromApi[errorFromApi.length - 1];
    if (!errorObject || !get(errorObject, 'code')) return true;
    const { code: errorCode, message: errorMessage } = errorObject;
    const errorData = get(errorObject, 'extensions.exception.data', '');
    if (!errorCode) return true;
    if (typeof window === 'undefined') return false
    const user = filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser') || List([])
    switch (errorCode) {
      case "UserAlreadyLoggedInIntoAnotherSystemError":
        UserAlreadyLoggedInIntoAnotherSystemError(user, errorData)
        break;
      default:
        break;
    }
  }
  return true;
}

export default requestErrorHandler;