import qs from 'query-string'
export const utmDetailKeys = ['utm_term', 'utm_campaign', 'utm_content', 'utm_medium', 'utm_source']

const utmParamsAction = () => {
    const query = qs.parse(window.location.search)
    const queryKeys = Object.keys(query)
    if (queryKeys && queryKeys.length > 0) {
      utmDetailKeys.forEach(key => {
        if (localStorage.hasOwnProperty(key) && localStorage.getItem(key)) {
            localStorage.removeItem(key)
        }
      })
      for (const key of queryKeys) {
        localStorage.setItem(key, query[key])
      }
    }
}

export default utmParamsAction