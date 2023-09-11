import { get } from "lodash"
import { practiceAttachmentVariables } from "../../../../constants/practiceAttechment"
import buddyQueriesCaller from "../../../../queries/utils/buddyQueriesCaller"
import addPracticeFile from "../addPracticeFile"
import removeFromUserBlockBasedPracticeAttachment from "../removeFromUserBlockBased"


const practiceAttachmentQueries = async (queryType,args = {fileId: '', userBlockBasedId: '', file: {}, props: {},activeQuestionIndex:''}) => {
    let attachmentId = ''
    switch(queryType){
        case practiceAttachmentVariables.ADD_PRACTICE_FILE: {
            const {file,userBlockBasedId,fileId,props,activeQuestionIndex} = args
            const res = await addPracticeFile(file,userBlockBasedId,fileId)
            attachmentId = get(res,'id')
            buddyQueriesCaller(practiceAttachmentVariables.ADD_PRACTICE_FILE,{file,userBlockBasedId,fileId,props,activeQuestionIndex,attachmentsConnectIds:get(res,'id')})
            return res
        }
        case practiceAttachmentVariables.REMOVE_FROM_USER_BLOCK_BASED_PRACTICE_ATTACHMENT: {
            const {file,userBlockBasedId,fileId,props,activeQuestionIndex} = args
            buddyQueriesCaller(practiceAttachmentVariables.REMOVE_FROM_USER_BLOCK_BASED_PRACTICE_ATTACHMENT,{file,userBlockBasedId,fileId,props,activeQuestionIndex})
            return removeFromUserBlockBasedPracticeAttachment({fileId: fileId,userBlockBasedPracticeId: userBlockBasedId}) 
        }
        default:{
            throw new Error('Unhandled type of query for file upload!')
        }
    }
}

export default practiceAttachmentQueries