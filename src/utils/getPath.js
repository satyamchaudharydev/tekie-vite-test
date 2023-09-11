import config from '../config'

const getPath = (file, pathConfig) => {
  if (file && file.includes) {
    /** if the file already has the fileBaseUrl information i.e,
     * in the case of a updated file simply return the uri else add the fileBaseUrl */
    let filePath = file;
    if (pathConfig && pathConfig.replaceRootFolderPath) {
      filePath = filePath.replace(pathConfig.replaceRootFolderPath.where, pathConfig.replaceRootFolderPath.with);
    }
    if (filePath.includes(config.fileBaseUrl) || filePath.includes(config.cloudFrontBaseUrl)) {
      return filePath;
    }
    /** Not appending Date here helps in caching of files */
    return `${config.cloudFrontBaseUrl}/${filePath}`
  }
  return ''
}

export default getPath
