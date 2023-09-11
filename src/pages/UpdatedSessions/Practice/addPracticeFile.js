import uploadFile from "../../../queries/utils/uploadFile"
import removeFromUserBlockBasedPracticeAttachment from "./removeFromUserBlockBased"
const removeFileExtension = (filename) => {
  return filename.substring(0, filename.lastIndexOf('.')) || filename;
};
const addPracticeFile = async (
  file,
  id,
  prevFileId,
) => {
  if (id) {
    if (file) {
      const mappingInfo = file && {
        typeId: id,
        type: 'UserBlockBasedPractice',
        typeField: 'attachments'
      }
      const fileInfo = {
        fileBucket: 'python'
      }
      if(prevFileId){        
       const res = await removeFromUserBlockBasedPracticeAttachment({fileId:prevFileId,userBlockBasedPracticeId:id})
        if(res){

          return res 
        }
      }
      else{
        const res = await uploadFile(file, fileInfo, mappingInfo,removeFileExtension(file.name)).then(res => {
          if (res) {
              return res
          }
        })
        return res
      }
      
  }
  }
  return {}
}

export default addPracticeFile
