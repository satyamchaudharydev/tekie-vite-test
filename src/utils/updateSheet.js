import queryString from 'query-string'

const updateSheet = async (params) => {
  if (import.meta.env.REACT_APP_NODE_ENV === 'production') {
    await fetch(import.meta.env.REACT_APP_SHEET_URL + '?' + queryString.stringify(params))
  }
}

export default updateSheet
