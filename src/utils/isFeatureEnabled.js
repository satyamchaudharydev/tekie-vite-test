import { featuresByCountries } from '../config'
import { isME } from './data-utils'
import getCountryCode from './getCountryCode'

const isFeatureEnabled = (featureKey) => {
  const countryCode = getCountryCode()
  const featureCountryMap = featuresByCountries[featureKey]
  if (featureCountryMap) {
    if (Object.keys(featureCountryMap).includes(countryCode)) {
      return featureCountryMap[countryCode]
    } else if (Object.keys(featureCountryMap).includes('middleEast') || isME(countryCode)) {
      return featureCountryMap.middleEast
    } else {
      return featureCountryMap.default
    }
  }
  return true
}

export default isFeatureEnabled
