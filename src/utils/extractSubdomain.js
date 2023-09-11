import { FORCE_ACTIVE_SUB_DOMAIN } from '../config'
import { rootDomains } from '../constants';

const extractSubdomain = () => {
  if (FORCE_ACTIVE_SUB_DOMAIN) return FORCE_ACTIVE_SUB_DOMAIN

  if (typeof window === 'undefined') return ''

  if (window.native) return 'student'
  const URL_PARTS = window.location.pathname.split('/');
  let last_index = -2;
  const second = URL_PARTS.length > 1 ? URL_PARTS[1] : '';
  const IS_LOCALHOST = second === 'localhost';
  if (IS_LOCALHOST) {
    last_index = -1;
  }

  const IS_LOCALHOST_STUDENT = second === 'student';
  const IS_LOCALHOST_TEACHER = second === 'teacher';
  
  if (IS_LOCALHOST_STUDENT) return 'student'
  if (IS_LOCALHOST_TEACHER) return 'teacher'

  return URL_PARTS.slice(0, last_index).join('.');
}
export const isLocalHost = () => {
  const location = window.location.hostname.split('.')
  const last = location[location.length - 1];
  if(last === 'localhost' || last === 'student' || last === 'teacher') {
    return true
  }
  return false
}

const ignoreRootSubdomains = rootDomains.indexOf(extractSubdomain()) === -1;

export const isSubDomainActive = ((extractSubdomain() !== '') && ignoreRootSubdomains);

export default extractSubdomain