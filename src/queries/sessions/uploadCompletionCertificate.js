import uploadFile from '../utils/uploadFile'

const uploadCompletionCertificate = async (
  file,
  courseCompletionId,
) => {
  if (courseCompletionId) {
    if (file) {
      const mappingInfo = file && {
        typeId: courseCompletionId,
        type: 'UserCourseCompletion',
        typeField: 'certificate'
      }
      const fileInfo = {
        fileBucket: 'python'
      }
      const res = uploadFile(file, fileInfo, mappingInfo).then(res => {
        if (res.id) {
            return res
        }
      })
      return res
    }
  }
  return {}
}

export default uploadCompletionCertificate
