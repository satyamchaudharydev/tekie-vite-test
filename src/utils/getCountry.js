import { get } from "lodash"
import { countriesAllowed, countriesMap } from "../config"

const getCountry = () => {
  if (typeof localStorage !== 'undefined') {
    if (localStorage.getItem('country_code')) {
      if (countriesAllowed.includes(localStorage.getItem('country_code').toLowerCase())) {
        return countriesMap[localStorage.getItem('country_code').toLowerCase()]
      }
    }
    return 'india'
  }
  return 'india'
}

export const getCity = () => {
  if (typeof localStorage !== 'undefined') {
    const locationData = localStorage.getItem('ipapi')
    if (locationData) {
      const city = get(JSON.parse(locationData), 'city', '')
      if (city) return city
    }
  }
  return ''
}

export default getCountry
