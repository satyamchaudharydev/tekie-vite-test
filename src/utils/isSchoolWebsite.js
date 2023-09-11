import { IS_SCHOOL_WEBSITE } from "../config";

const isSchoolWebsite = () => {
  if (typeof window !== 'undefined') {
    if (IS_SCHOOL_WEBSITE) return true
    const url = new URL(window.origin);
    if (url.hostname.includes('school.tekie')) {
      return true
    }
    return false
  }
  return false
}

export default isSchoolWebsite
