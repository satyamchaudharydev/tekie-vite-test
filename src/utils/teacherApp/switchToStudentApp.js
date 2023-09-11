import { filterKey } from "../data-utils";
import { List } from "immutable";
import { get } from "lodash";
import duck from "../../duck";

const switchToStudentApp = (shouldRedirect = true) => {
  if (window !== undefined) {
    const user =
      filterKey(
        window && window.store.getState().data.getIn(["user", "data"]),
        "loggedinUser"
      ) || List([]);
     
    const userData = user && user.toJS()[0]
    const loginData = get(userData, "rawData");
    const { ...parent } = loginData;
    if (get(userData, 'id') !== get(loginData, 'mentorProfile.studentProfile.user.id')) {
      duck.merge(
        () => ({
          user: {
            ...userData,
            routedFromTeacherApp: true,
            fromTeachersAppEmbed: !shouldRedirect,
          },
          userParent: parent,
        }),
        {
          key: "loggedinUser",
        }
      );
    }
    if (shouldRedirect) window.open("/sessions");
  }
};

export default switchToStudentApp
