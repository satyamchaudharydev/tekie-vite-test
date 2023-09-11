import gql from "graphql-tag"
import { get } from "lodash"
import buddyQueriesCaller from "../../../../queries/utils/buddyQueriesCaller"
import requestToGraphql from "../../../../utils/requestToGraphql"
import { gsuiteQueriesVariables } from "../../../../constants/gsuite"
import getIdArrForQuery from "../../../../utils/getIdArrForQuery"

export const updatingIsGsuiteFileVisitedQuery = (userBlockBasedId,visitedBool) => {
    return requestToGraphql(gql`
    mutation {
        updateUserBlockBasedPractice(id: "${userBlockBasedId}", input: { isGsuiteFileVisited: ${visitedBool}}) {
            id
            isGsuiteFileVisited
        }
    }
    `)
}

export const createGsuiteFile = (gsuiteTempleteUrlOrFile,gsuiteFileType,studentFileCreationName,schoolName,classroomTitle) => {
    return requestToGraphql(gql`
    query {
        createGsuiteLastRevisionFile(gsuiteTempleteUrlOrFile: "${gsuiteTempleteUrlOrFile}", gsuiteFileType: "${gsuiteFileType}", studentFileCreationName: "${studentFileCreationName}", schoolName: "${schoolName}", classroomTitle:"${classroomTitle}"){
          id
          name
          createdTime
          parentFolderIDs
          iconLink
          thumbnailLink
          mimeType
          webViewLink
        }
      }
`)
}

export const updatingAnswerLink = (userBlockBasedId,url) => {
    return requestToGraphql(gql`
    mutation {
        updateUserBlockBasedPractice(id: "${userBlockBasedId}", input: { answerLink: "${url}" }) {
            id
            answerLink
        }
    }
    `)
}

export const updateGsuiteNewFile = (userBlockBasedId,newFile) => {
    return requestToGraphql( gql`
    mutation {
    updateUserBlockBasedPractice(
        id: "${userBlockBasedId}"
        input: {
        gsuiteFile: {
            fileId: "${get(newFile,'id')||get(newFile,'fileId')}"
            name: "${get(newFile,'name')}"
            url: "${get(newFile,'webViewLink')||get(newFile,'url')}"
            ${get(newFile,'thumbnailUrl') ? `thumbnailUrl: "${newFile.fileId}"`: ''}
            mimeType: "${get(newFile,'mimeType')}"
            iconLink: "${get(newFile,'iconLink')}"
            createdTime: "${get(newFile,'createdTime')}"
        }
        }
    ) {
        gsuiteFile {
            fileId
            name
            mimeType
            url
            thumbnailUrl
            parentFolderIDs
            iconLink
            createdTime
        }
        gsuiteLastRevision {
            fileId
            name
            mimeType
            url
            thumbnailUrl
            parentFolderIDs
            iconLink
            createdTime
        }
    }
    }
    `)
}

export const updateGsuiteLastRevisionReattempt = (userBlockBasedId,gsuiteFile,reAttemptGsuiteFile) => {
    return requestToGraphql(gql`
    mutation {
    updateUserBlockBasedPractice(
        id: "${userBlockBasedId}"
        input: {
        gsuiteFile: {
            fileId: "${get(reAttemptGsuiteFile,'fileId') ? get(reAttemptGsuiteFile,'fileId') : get(reAttemptGsuiteFile,'id')}"
            name: "${get(reAttemptGsuiteFile,'name')}"
            url: "${get(reAttemptGsuiteFile,'webViewLink') ? get(reAttemptGsuiteFile,'webViewLink') : get(reAttemptGsuiteFile,'url')}"
            ${get(reAttemptGsuiteFile,'thumbnailUrl') ? `thumbnailUrl: "${reAttemptGsuiteFile.thumbnailUrl}"`: ''}
            mimeType: "${get(reAttemptGsuiteFile,'mimeType')}"
            iconLink: "${get(reAttemptGsuiteFile,'iconLink')}"
            createdTime: "${get(reAttemptGsuiteFile,'createdTime')}"
        }
        gsuiteLastRevision: {
            fileId: "${get(gsuiteFile,'fileId') ? get(gsuiteFile,'fileId') : get(gsuiteFile,'id')}"
            name: "${get(gsuiteFile,'name')}"
            url: "${get(gsuiteFile,'webViewLink') ? get(gsuiteFile,'webViewLink') : get(gsuiteFile,'url')}"
            ${get(gsuiteFile,'thumbnailUrl') ? `thumbnailUrl: "${gsuiteFile.thumbnailUrl}"`: ''}
            mimeType: "${get(gsuiteFile,'mimeType')}"
            iconLink: "${get(gsuiteFile,'iconLink')}"
            createdTime: "${get(gsuiteFile,'createdTime')}"
        }
        }
    ) {
        gsuiteFile {
        name
        mimeType
        fileId
        }
        gsuiteLastRevision {
        name
        mimeType
        fileId
        }
        isGsuiteFileVisited
    }
    }
    `)
}

export const updateGsuiteLastRevision = (userBlockBasedId,gsuiteFile) => {
    return requestToGraphql(gql`
    mutation {
      updateUserBlockBasedPractice(
        id: "${userBlockBasedId}"
        input: {
          answerLink: ""
          gsuiteLastRevision: {
            fileId: "${get(gsuiteFile,'fileId')}"
            name: "${get(gsuiteFile,'name')}"
            url: "${get(gsuiteFile,'url')}"
            thumbnailUrl: "${get(gsuiteFile,'thumbnailUrl')}"
            mimeType: "${get(gsuiteFile,'mimeType')}"
            iconLink: "${get(gsuiteFile,'iconLink')}"
            createdTime: "${get(gsuiteFile,'createdTime')}"
          }
          gsuiteFile: {
            fileId: null
            name: null
            url: null
            thumbnailUrl: null
            mimeType: null
            iconLink: null
            createdTime: null
          }
        }
      ) {
        gsuiteFile {
          name
          mimeType
        }
        gsuiteLastRevision {
          name
          mimeType
          fileId
          url
        }
        isGsuiteFileVisited
        answerLink
      }
    }`)
}

export const updateAuthorsData = (userBlockBasedId,buddyStudentsIDs) => {
    return requestToGraphql(gql`
    mutation {
        updateUserBlockBasedPractice(
            id: "${userBlockBasedId}", 
            ${(buddyStudentsIDs && buddyStudentsIDs.length > 1) ? `authorsConnectIds: [${getIdArrForQuery(buddyStudentsIDs)}]` : `authorsConnectIds: []`}
    ) {
            authors{
                id
                name
                username
                studentProfile {
                branch
                section
                grade
                schoolName
                }
            }
        }
    }
`)
}

export const removeFromUserBlockBasedAuthor = (userBlockBasedId,userId) => {
    return requestToGraphql(gql`
    mutation {
        removeFromUserBlockBasedAuthor(userBlockBasedPracticeId: "${userBlockBasedId}", userId: "${userId}") {
          userBlockBasedPractice {
            authors{
                id
                name
            }
          }
        }
      }
    `)
}

export const updateAnswerLinkAndIsGsuiteVisited = (userBlockBasedId,visitedBool,url) => {
    return requestToGraphql(gql`
        mutation{
            updateUserBlockBasedPractice(id: "${userBlockBasedId}", input: { 
                isGsuiteFileVisited: ${visitedBool}, 
                answerLink: "${url}"
            }){
                id
                isGsuiteFileVisited
                answerLink
            }
        }
    `)
}

const gsuiteQueries = async (queryType, args = {userBlockBasedId:'',activeQuestionIndex:'',visitedBool:false,url:'',gsuiteTempleteUrlOrFile:'',gsuiteFileType:'',studentFileCreationName:'',schoolName:'',classroomTitle:'',gsuiteFile:{},reAttemptGsuiteFile:{},gsuiteFileId:'',newFile:{},userId:'', buddyStudentsIDs: [], props:{}}) => {
    switch(queryType){
        case gsuiteQueriesVariables.UPDATE_IS_GSUITE_FILE_VISITED:{
            const {userBlockBasedId,visitedBool,props,activeQuestionIndex} = args
            buddyQueriesCaller(gsuiteQueriesVariables.UPDATE_IS_GSUITE_FILE_VISITED,{visitedBool,props,activeQuestionIndex})
            return await updatingIsGsuiteFileVisitedQuery(userBlockBasedId,visitedBool)
        }
        case gsuiteQueriesVariables.CREATE_GSUITE_FILE: {
            const {gsuiteTempleteUrlOrFile,gsuiteFileType,studentFileCreationName,schoolName,classroomTitle,activeQuestionIndex} = args
            buddyQueriesCaller(gsuiteQueriesVariables.CREATE_GSUITE_FILE,{gsuiteTempleteUrlOrFile,gsuiteFileType,studentFileCreationName,schoolName,classroomTitle,activeQuestionIndex})
            return await createGsuiteFile(gsuiteTempleteUrlOrFile,gsuiteFileType,studentFileCreationName,schoolName,classroomTitle)
        }
        case gsuiteQueriesVariables.UPDATE_ANSWER_LINK: {
            const {userBlockBasedId,url,props,activeQuestionIndex} = args
            buddyQueriesCaller(gsuiteQueriesVariables.UPDATE_ANSWER_LINK,{url,props,activeQuestionIndex})
            return await updatingAnswerLink(userBlockBasedId,url)
        }
        case gsuiteQueriesVariables.UPDATE_GSUITE_NEW_FILE: {
            const {userBlockBasedId,newFile,props,activeQuestionIndex} = args
            buddyQueriesCaller(gsuiteQueriesVariables.UPDATE_GSUITE_NEW_FILE,{newFile,props,activeQuestionIndex})
            return await updateGsuiteNewFile(userBlockBasedId,newFile)
        }
        case gsuiteQueriesVariables.UPDATE_GSUITE_LAST_REVISION_REATTEMPT: {
            const {userBlockBasedId,gsuiteFile,reAttemptGsuiteFile,props,activeQuestionIndex} = args
            buddyQueriesCaller(gsuiteQueriesVariables.UPDATE_GSUITE_LAST_REVISION_REATTEMPT,{gsuiteFile,reAttemptGsuiteFile,props,activeQuestionIndex})
            return await updateGsuiteLastRevisionReattempt(userBlockBasedId,gsuiteFile,reAttemptGsuiteFile)
        }
        case gsuiteQueriesVariables.UPDATE_GSUITE_LAST_REVISION: {
            const {userBlockBasedId,gsuiteFile,props,activeQuestionIndex} = args
            buddyQueriesCaller(gsuiteQueriesVariables.UPDATE_GSUITE_LAST_REVISION,{gsuiteFile,props,activeQuestionIndex})
            return await updateGsuiteLastRevision(userBlockBasedId,gsuiteFile)
        }
        case gsuiteQueriesVariables.UPDATE_AUTHORS_DATA: {
            const {userBlockBasedId, buddyStudentsIDs, props,activeQuestionIndex} = args
            buddyQueriesCaller(gsuiteQueriesVariables.UPDATE_AUTHORS_DATA,{buddyStudentsIDs,props,activeQuestionIndex})
            return await updateAuthorsData(userBlockBasedId,buddyStudentsIDs)
        }
        case gsuiteQueriesVariables.UPDATE_ANSWER_LINK_AND_ISGSUITEVISITED: {
            const {userBlockBasedId,visitedBool,props,url,activeQuestionIndex} = args
            buddyQueriesCaller(gsuiteQueriesVariables.UPDATE_ANSWER_LINK_AND_ISGSUITEVISITED,{visitedBool,url,props,activeQuestionIndex})
            return await updateAnswerLinkAndIsGsuiteVisited(userBlockBasedId,visitedBool,url)
        }
        default: {
            throw new Error('Unhandled type of query for gsuite!')
        }
    }
}

export default gsuiteQueries
