import { countriesAllowed } from "../config"

const getCountryCode = () => {
  if (typeof localStorage !== 'undefined') {
    if (localStorage.getItem('country_code')) {
      if (countriesAllowed.includes(localStorage.getItem('country_code').toLowerCase())) {
        return localStorage.getItem('country_code').toLowerCase()
      }
    }
    return 'in'
  }
  return 'in'
}

export default getCountryCode
