import uploadFile from '../utils/uploadFile'
import removeFromSchoolLogo from './removeFromSchoolLogo'

const addSchoolLogo = async (
  file,
  schoolId,
  prevFileId
) => {
  if (schoolId) {
    if (file) {
      const mappingInfo = file && {
        typeId: schoolId,
        type: 'School',
        typeField: 'logo'
      }
      const fileInfo = {
        fileBucket: 'python'
      }
      if (prevFileId) {
        const res = removeFromSchoolLogo({ fileId: prevFileId, schoolId }).then(() => {
          return uploadFile(file, fileInfo, mappingInfo).then(res => {
            if (res.id) {
                return res
            }
          })
        })
        return res
      } else {
        const res = uploadFile(file, fileInfo, mappingInfo).then(res => {
          if (res.id) {
              return res
          }
        })
        return res
      }
    }
  }
  return {}
}

export default addSchoolLogo
