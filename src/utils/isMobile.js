import { getToasterBasedOnType } from "../components/Toaster";
import { CRT_SCREEN_BREAKPOINT, MOBILE_BREAKPOINT, PYTHON_COURSE } from "../config";
import { getCourseName } from "./getCourseId";

const isMobile = () => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
        return true
    }
    return false
  }
  return false
}

export const withPageRedirectDisabledOnMobile = (callback = () => { }, allowMobile = false, bypass = false) => {
  if ((!allowMobile && isMobile()) || (isMobile() && (getCourseName() === PYTHON_COURSE))) {
    return getToasterBasedOnType({
      type: "loading",
      message: "Please open in desktop...",
    });
  }
  callback()
}
 
export const isCRTScreen = () => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth <= CRT_SCREEN_BREAKPOINT.start && window.innerWidth >= CRT_SCREEN_BREAKPOINT.end) {
      return true;
    }
    return false;
  }
  return false;
}
export default isMobile
