import gql from 'graphql-tag'
import { get } from 'lodash'
import requestToGraphql from '../../utils/requestToGraphql'
import getPath from '../../utils/getPath'

const UPLOAD_FILE = () =>  gql`
mutation($fileInput: FileInput!, $connectInput: FileConnectInput!,) {
  uploadFile(fileInput: $fileInput,
  connectInput: $connectInput,
  ){
    name,
    uri,
    id,
    type,
  createdAt,
  }
}
`

const uploadFile = async (file, fileInfo, mappingInfo,fileName) => {
  const res = await requestToGraphql(UPLOAD_FILE(fileName),
    { file, fileInput: fileInfo, connectInput: mappingInfo,fileName  })
  const uploadedFileInfo = get(res, 'data.uploadFile', null)
  /** When a file is updated,Appending the uri with Date.now() prevents browser to
   show the image with the same uri */
  const fileUri = `${getPath(
    uploadedFileInfo.signedUri ||
      uploadedFileInfo.uri
  )}?${Date.now()}`
  return { ...uploadedFileInfo, uri: fileUri, rawUri: uploadedFileInfo.uri }
}

export default uploadFile
