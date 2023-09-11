import gql from "graphql-tag";
import get from "lodash/get";
import { useEffect, useState } from "react";
import {Map} from 'immutable'
import { buddyQueries } from "../../constants/buddyLogin";
import { gsuiteQueriesVariables } from "../../constants/gsuite";
import { practiceAttachmentVariables } from "../../constants/practiceAttechment";
import { TOPIC_COMPONENTS } from "../../constants/topicComponentConstants";
import { fetchUserAssignment } from "../../pages/TeacherApp/utils";
import addPracticeFile from "../../pages/UpdatedSessions/Practice/addPracticeFile";
import removeFromUserBlockBasedPracticeAttachment from "../../pages/UpdatedSessions/Practice/removeFromUserBlockBased";
import { removeFromUserBlockBasedAuthor, updateAnswerLinkAndIsGsuiteVisited, updateAuthorsData, updateGsuiteLastRevision, updateGsuiteLastRevisionReattempt, updateGsuiteNewFile, updatingAnswerLink, updatingIsGsuiteFileVisitedQuery } from "../../pages/UpdatedSessions/Practice/utils/gsuiteQueries";
import { filterKey, getBuddies, waitFor } from "../../utils/data-utils";
import requestToGraphql from "../../utils/requestToGraphql";
import dumpBlockBasedPracticeForBuddies from "../buddyLogin/dumpBlockBasedPracticeForBuddies";
import dumpBlockBasedProjectForBuddies from "../buddyLogin/dumpBlockBasedProjectForBuddies";
import dumpChatForBuddies from "../buddyLogin/dumpChatForBuddies";
import dumpCodingAssignmentForBuddies from "../buddyLogin/dumpCodingAssignmentForBuddies";
import dumpComicStripForBuddies from "../buddyLogin/dumpComicStripForBuddies";
import dumpLearningSlideForBuddies from "../buddyLogin/dumpLearningSlideForBuddies";
import dumpPracticeQuestionForBuddies from "../buddyLogin/dumpPracticeQuestionForBuddies";
import dumpVideoForBuddies from "../buddyLogin/dumpVideoForBuddies";
import fetchBlockBasedPracticeForBuddies from "../buddyLogin/fetchBlockBasedPracticeForBuddies";
import fetchBlockBasedProjectsForBuddies from "../buddyLogin/fetchBlockBasedProjectsForBuddies";
import fetchChatPracticeForBuddies from "../buddyLogin/fetchChatPracticeForBuddies";
import fetchUserAssignmentForBuddies from "../buddyLogin/fetchUserAssignmentForBuddies";
import fetchUserVideosForBuddies from "../buddyLogin/fetchUserVideosForBuddies";
import updateUserAssignment from "../teacherApp/updateUserAssignment";

const getUserBlockBasedIdOfBuddy = async (props, userId) => {
    const isHomework = ((props.match.path = '/homework/:courseId/:topicId/:projectId/practice') || (props.match.path = '/sessions/:courseId/:topicId/:projectId/practice')) &&
    !props.match.url.includes('/sessions/practice/')
    const key = props.match.params.topicId + '/' + (isHomework ? TOPIC_COMPONENTS.homeworkPractice : TOPIC_COMPONENTS.blockBasedPractice) + '/' + userId
    let userBlockBasedPractices = await waitFor(() => filterKey(window && window.store.getState().data.getIn([
        'userBlockBasedPractices',
        'data'
    ]),key))
    userBlockBasedPractices = userBlockBasedPractices && userBlockBasedPractices.toJS()
    // return get(userBlockBasedPractices,`[${activeQuestionIndex}].id`)
    return userBlockBasedPractices
}

const uploadFileForBuddies = (userBlockBasedId,attachmentsConnectIds) => gql`
mutation {
    updateUserBlockBasedPractice(
      id: "${userBlockBasedId}"
      attachmentsConnectIds: ["${attachmentsConnectIds}"]
    ) {
      id
        attachments{
            id
        }
    }
  }
`

const buddyQueriesCaller = async(typeOfQuery, args = { learningObjectiveId: '', courseId: '', topicId: '', pqDumpInput: {}, projectId: '', blockBasedPracticeId: '', blockBasedProjectId: '', learningSlideConnectId: '', courseConnectId: '', topicConnectId: '', learningObjectiveConnectId: '', blockBasedProjectInput: {}, codingAssignmentInput: {}, blockBasedPracticeInput: {}, comicStripInput: {}, learningSlideInput: {}, inputvideoAction: { videoAction: 'skip' }, chatAction: { chatAction: "next" }, tokenType: '', userBlockBasedId:'',visitedBool:false,url:'',gsuiteTempleteUrlOrFile:'',gsuiteFileType:'',studentFileCreationName:'',schoolName:'',classroomTitle:'',gsuiteFile:{},reAttemptGsuiteFile:{},gsuiteFileId:'',newFile:{}, props: {}, fileId: '', file: {},input: {},attachmentsConnectIds: '',removeQuery: () =>{} }) => {
    const fileId = []
    const user = filterKey(
        window && window.store.getState().data.getIn(["user", "data"]),
        "loggedinUser"
    ).get(0) || new Map({});
    const userBuddies = getBuddies(get(user.toJS(), 'buddyDetails', []))

    if (!userBuddies.length) return
    const buddyQueriesTracker = JSON.parse(localStorage.getItem('buddyQueriesTracker'))
    switch (typeOfQuery) {
        case buddyQueries.USER_LEARNING_OBJECTIVES: {
            const { learningObjectiveId, tokenType, courseId, topicId } = args
            return fetchChatPracticeForBuddies({ userBuddies, learningObjectiveId, tokenType, courseId, topicId, buddyQueriesTracker })
        }
        case buddyQueries.ADD_USER_ACTIVITY_VIDEO_DUMP: {
            const { topicId, courseId, videoId, videoAction, tokenType } = args
            return dumpVideoForBuddies({ userBuddies, topicId, courseId, videoId, videoAction, tokenType,buddyQueriesTracker })
        }
        case buddyQueries.ADD_USER_ACTIVITY_CHAT_DUMP: {
            const { topicId, learningObjectiveId, courseId, chatAction } = args
            return dumpChatForBuddies({ userBuddies, topicId, learningObjectiveId, courseId, chatAction,buddyQueriesTracker })
        }
        case buddyQueries.ADD_USER_ACTIVITY_PQ_DUMP: {
            const { topicId, courseId, learningObjectiveId, pqDumpInput, tokenType } = args
            return dumpPracticeQuestionForBuddies({ userBuddies, topicId, courseId, learningObjectiveId, pqDumpInput, tokenType,buddyQueriesTracker })
        }
        case buddyQueries.ADD_USER_ACTIVITY_BLOCKBASEDPROJECT_DUMP: {
            const { topicId, projectId, courseId, blockBasedProjectInput } = args
            return dumpBlockBasedProjectForBuddies({ userBuddies, topicId, projectId, courseId, blockBasedProjectInput,buddyQueriesTracker })
        }
        case buddyQueries.ADD_USER_ACTIVITY_BLOCKBASEDPRACTICE_DUMP: {
            const { topicId, projectId, courseId, blockBasedPracticeInput } = args
            return dumpBlockBasedPracticeForBuddies({ userBuddies, topicId, projectId, courseId, blockBasedPracticeInput,buddyQueriesTracker })
        }
        case buddyQueries.ADD_USER_ACTIVITY_ASSIGNMENT_DUMP: {
            const { topicId, courseId, codingAssignmentInput, tokenType } = args
            return dumpCodingAssignmentForBuddies({ userBuddies, topicId, courseId, codingAssignmentInput, tokenType,buddyQueriesTracker })
        }
        case buddyQueries.ADD_USER_ACTIVITY_COMICSTRIP_DUMP: {
            const { learningObjectiveId, courseId, comicStripInput } = args
            return dumpComicStripForBuddies({ userBuddies, learningObjectiveId, courseId, comicStripInput,buddyQueriesTracker })
        }
        case buddyQueries.USER_VIDEOS: {
            const { topicId, courseId, videoId, tokenType } = args
            return fetchUserVideosForBuddies({ userBuddies, topicId, courseId, videoId, tokenType, buddyQueriesTracker})
        }
        case buddyQueries.USER_ASSIGNMENTS: {
            const { topicId, tokenType } = args
            return fetchUserAssignmentForBuddies({ userBuddies, topicId, tokenType,buddyQueriesTracker })
        }
        case buddyQueries.ADD_USER_ACTIVITY_LEARNINGSLIDE_DUMP: {
            const { learningSlideConnectId, courseConnectId, topicConnectId, learningObjectiveConnectId, learningSlideInput } = args
            return dumpLearningSlideForBuddies({ userBuddies, learningSlideConnectId, courseConnectId, topicConnectId, learningObjectiveConnectId, learningSlideInput,buddyQueriesTracker })
        }
        case buddyQueries.USER_BLOCKBASED_PRACTICES: {
            const { topicId, blockBasedPracticeId, courseId, tokenType } = args
            return fetchBlockBasedPracticeForBuddies({ userBuddies, topicId, courseId, blockBasedPracticeId, tokenType,buddyQueriesTracker})
        }
        case buddyQueries.USER_BLOCKBASED_PROJECTS: {
            const { topicId, blockBasedProjectId, courseId, tokenType } = args
            return fetchBlockBasedProjectsForBuddies({ userBuddies, topicId, courseId, blockBasedProjectId, tokenType,buddyQueriesTracker })
        }
        case gsuiteQueriesVariables.UPDATE_IS_GSUITE_FILE_VISITED: {
            const {visitedBool,props,activeQuestionIndex} = args
            for(let i=0;i<userBuddies.length;i++){
                const userBlockBasedPractices = await getUserBlockBasedIdOfBuddy(props,get(userBuddies[i],'id'),activeQuestionIndex)
                const userBlockBasedId = get(userBlockBasedPractices,`[${activeQuestionIndex}].id`)
                updatingIsGsuiteFileVisitedQuery(userBlockBasedId,visitedBool)
            }
            break
        }
        case gsuiteQueriesVariables.UPDATE_ANSWER_LINK: {
            const {url,props,activeQuestionIndex} = args
            for(let i=0;i<userBuddies.length;i++){
                const userBlockBasedPractices = await getUserBlockBasedIdOfBuddy(props,get(userBuddies[i],'id'),activeQuestionIndex)
                const userBlockBasedId = get(userBlockBasedPractices,`[${activeQuestionIndex}].id`)
                updatingAnswerLink(userBlockBasedId,url)
            }
            break
        }
        case gsuiteQueriesVariables.UPDATE_GSUITE_NEW_FILE: {
            const {newFile,props,activeQuestionIndex} = args
            for(let i=0;i<userBuddies.length;i++){
                const userBlockBasedPractices = await getUserBlockBasedIdOfBuddy(props,get(userBuddies[i],'id'),activeQuestionIndex)
                const userBlockBasedId = get(userBlockBasedPractices,`[${activeQuestionIndex}].id`)
                updateGsuiteNewFile(userBlockBasedId,newFile)
            }
            break
        }
        case gsuiteQueriesVariables.UPDATE_GSUITE_LAST_REVISION_REATTEMPT: {
            const {gsuiteFile,reAttemptGsuiteFile,props,activeQuestionIndex} = args
            for(let i=0;i<userBuddies.length;i++){
                const userBlockBasedPractices = await getUserBlockBasedIdOfBuddy(props,get(userBuddies[i],'id'),activeQuestionIndex)
                const userBlockBasedId = get(userBlockBasedPractices,`[${activeQuestionIndex}].id`)
                updateGsuiteLastRevisionReattempt(userBlockBasedId,gsuiteFile,reAttemptGsuiteFile)
            }
            break
        }
        case gsuiteQueriesVariables.UPDATE_GSUITE_LAST_REVISION: {
            const {gsuiteFile,props,activeQuestionIndex} = args
            for(let i=0;i<userBuddies.length;i++){
                const userBlockBasedPractices = await getUserBlockBasedIdOfBuddy(props,get(userBuddies[i],'id'),activeQuestionIndex)
                const userBlockBasedId = get(userBlockBasedPractices,`[${activeQuestionIndex}].id`)
                updateGsuiteLastRevision(userBlockBasedId,gsuiteFile)
            }
            break
        }
        case gsuiteQueriesVariables.UPDATE_AUTHORS_DATA: {
            const {buddyStudentsIDs,props,activeQuestionIndex} = args
            for(let i=0;i<userBuddies.length;i++){
                const userBlockBasedPractices = await getUserBlockBasedIdOfBuddy(props,get(userBuddies[i],'id'),activeQuestionIndex)
                const userBlockBasedId = get(userBlockBasedPractices,`[${activeQuestionIndex}].id`)
                updateAuthorsData(userBlockBasedId,buddyStudentsIDs)
            }
            break
        }
        case gsuiteQueriesVariables.REMOVE_FROM_USER_BLOCK_BASED_AUTHOR: {
            const {userId,props,activeQuestionIndex} = args
            for(let i=0;i<userBuddies.length;i++){
                const userBlockBasedPractices = await getUserBlockBasedIdOfBuddy(props,get(userBuddies[i],'id'),activeQuestionIndex)
                const userBlockBasedId = get(userBlockBasedPractices,`[${activeQuestionIndex}].id`)
                removeFromUserBlockBasedAuthor(userBlockBasedId,userId)
            }
            break
        }
        case gsuiteQueriesVariables.UPDATE_ANSWER_LINK_AND_ISGSUITEVISITED: {
            const {url,visitedBool,props,activeQuestionIndex} = args
            for(let i=0;i<userBuddies.length;i++){
                const userBlockBasedPractices = await getUserBlockBasedIdOfBuddy(props,get(userBuddies[i],'id'),activeQuestionIndex)
                const userBlockBasedId = get(userBlockBasedPractices,`[${activeQuestionIndex}].id`)
                updateAnswerLinkAndIsGsuiteVisited(userBlockBasedId,visitedBool,url)
            }
            break
        }
        case practiceAttachmentVariables.ADD_PRACTICE_FILE: {
            const {attachmentsConnectIds,activeQuestionIndex,props} = args
            for(let i=0;i<userBuddies.length;i++){
                const userBlockBasedPractices = await getUserBlockBasedIdOfBuddy(props,get(userBuddies[i],'id'))
                const currentFileId = get(userBlockBasedPractices,`[${activeQuestionIndex}].attachments[0].id`)
                fileId.push(currentFileId)
                const userBlockBasedId = get(userBlockBasedPractices,`[${activeQuestionIndex}].id`)
                if(currentFileId) removeFromUserBlockBasedPracticeAttachment({fileId: currentFileId,userBlockBasedPracticeId: userBlockBasedId}) 
                requestToGraphql(uploadFileForBuddies(userBlockBasedId,attachmentsConnectIds))
            }
            break
        }
        case practiceAttachmentVariables.REMOVE_FROM_USER_BLOCK_BASED_PRACTICE_ATTACHMENT: {
            const {attachmentsConnectIds,fileId,activeQuestionIndex,props} = args
            for(let i=0;i<userBuddies.length;i++){
                const userBlockBasedPractices = await getUserBlockBasedIdOfBuddy(props,get(userBuddies[i],'id'))
                const currentFileId = get(fileId,`[${i}]`) || get(userBlockBasedPractices,`[${activeQuestionIndex}].attachments[0].id`)
                const userBlockBasedId = get(userBlockBasedPractices,`[${activeQuestionIndex}].id`)
                removeFromUserBlockBasedPracticeAttachment({fileId: attachmentsConnectIds ? attachmentsConnectIds : fileId,userBlockBasedPracticeId: userBlockBasedId}) 
            }
            break
        }
        case 'removeSubmittedLink': {
            const {removeQuery,activeQuestionIndex,props} = args
            for(let i=0;i<userBuddies.length;i++){
                const userBlockBasedPractices = await getUserBlockBasedIdOfBuddy(props,get(userBuddies[i],'id'),activeQuestionIndex)
                const userBlockBasedId = get(userBlockBasedPractices,`[${activeQuestionIndex}].id`)
                requestToGraphql(removeQuery(userBlockBasedId))
            }
            break
        }
        case 'updateUserAssignment': {
            const {courseId,topicId,input} = args
            for(let i=0;i<userBuddies.length;i++){
                const userAssignments = await fetchUserAssignment(get(userBuddies[i],'id'),topicId,courseId)
                updateUserAssignment({assignmentId: get(userAssignments,'[0].id'), input,fromStudentApp: true,updateOne: true}).call()
            }
            break
        }
        default: {
            throw new Error('Unhandled type of query for buddy!')
        }
    }
}

export default buddyQueriesCaller