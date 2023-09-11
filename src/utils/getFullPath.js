import config from '../config'

const getPath = file => {
  if (file) {
    /** if the file already has the fileBaseUrl information i.e,
     * in the case of a updated file simply return the uri else add the fileBaseUrl */
    if (file.includes(config.fileBaseUrl) || file.includes(config.cloudFrontBaseUrl)) {
      return file
    }
    const baseURL = config.cloudFrontBaseUrl || config.fileBaseUrl
    return `${baseURL}/${file}`
  }
  return null
}

export default getPath
