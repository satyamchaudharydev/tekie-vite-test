/* eslint-disable array-callback-return */
import { filterKey } from "duck-state/lib/State.js"
import gql from "graphql-tag"
import { get } from "lodash"
import FETCH_SESSION_COMPONENT_TRACKER from "../../queries/componentQueries/FETCH_SESSION_COMPONENT_TRACKER.js"
import updateSessionComponentTracker from "../../queries/updateSessionComponentTracker.js"
import { getBuddies } from "../../utils/data-utils.js"
import getMe from "../../utils/getMe"
import requestToGraphql from "../../utils/requestToGraphql.js"
import { checkIfEmbedEnabled } from "../../utils/teacherApp/checkForEmbed.js"
import { Map } from "immutable"
import { gtmUserParams } from "./utils.js"
import { fireGtmEvent } from "../../utils/analytics/gtmActions.js"
import { gtmEvents } from "../../utils/analytics/gtmEvents.js"

const updateVisitedComponent = async(componentId, input = {}) => {
    componentId && await requestToGraphql(gql`mutation updateSessionComponentTracker($input: SessionComponentTrackerUpdate){
        updateSessionComponentTracker(id:"${componentId}",input: $input) {
        id
        }
    }`,
    {
        input
    }
    )
}

const sessionComponentTracker = async(componentData,isInLiveSession) => {
    const batchConnectId = localStorage.getItem('currentSessionId')
    const componentTrackerData = await FETCH_SESSION_COMPONENT_TRACKER({batchConnectId})
    const componentConnectId = get(componentTrackerData, 'sessionComponentTrackers.[0].id')
    localStorage.setItem('componentTrackerId',componentConnectId)
    const userId = getMe()
    const user = filterKey(
        window && window.store.getState().data.getIn(["user", "data"]),
        "loggedinUser"
    ).get(0) || new Map({});
    const userBuddies = getBuddies(get(user.toJS(), 'buddyDetails', []))
    if(get(componentData,'[0].type') === 'learningSlide' &&  get(componentData,'[0].childComponents')){
        delete componentData[0].type;
        componentData[0].type = 'learningObjective'
    }

    const isComponentVisited = (type) => {
        let isVisited = false
        // eslint-disable-next-line array-callback-return
        get(componentTrackerData,'sessionComponentTrackers.[0].componentStatus') && get(componentTrackerData,'sessionComponentTrackers.[0].componentStatus').map((component)=>{
            if(component.componentName === type){
                isVisited = true
            }
        })
        return isVisited
    }
    // const checkIfDataExist = (assignmentData,userId) => {
    //     let resSent = false
    //     assignmentData && assignmentData.map(data => {
    //         if(data.user.id === userId){
    //             resSent = true
    //             return true
    //         }
    //         return false
    //     })
    //     return resSent
    // }

    switch(get(componentData,'[0].type')||componentData){
        case "assignment": {
            const userParams =  {
                ...gtmUserParams(),
            }
            fireGtmEvent(gtmEvents.blockAssignmentCTAClickedInSessionSidebar,{userParams})
            if(!isComponentVisited(get(componentData,'[0].type')) && checkIfEmbedEnabled() && isInLiveSession){
                let input = {
                    componentStatus:{
                        push:{
                            componentName: 'assignment',
                            componentStatus: true
                        }  
                    }
                }
                updateVisitedComponent(componentConnectId,input)
            }
            let input = {}
            input = {
                assignments:{
                    updateWhere:{
                      userReferenceId: get(userId,'id'),
                    },
                    updateWith:{
                        visited: true,
                    }
                  }
            }
            await updateSessionComponentTracker(componentConnectId,input)
            if(userBuddies && userBuddies.length > 0){
                for (let i = 0; i < userBuddies.length; i++) {
                    const buddy = userBuddies[i];
                    delete input.assignments.updateWhere.userReferenceId;
                    input.assignments.updateWhere.userReferenceId = buddy.id;
                    await updateSessionComponentTracker(componentConnectId, input);
                }
            }
            break
        }
        case 'video': {
            const userParams =  {
                ...gtmUserParams(),
                videoTitle: get(componentData,'[0].topicTitle')
            }
            fireGtmEvent(gtmEvents.videoCTAClickedInSessionSidebar,{userParams})
            if(!isComponentVisited(get(componentData,'[0].type')) && checkIfEmbedEnabled() && isInLiveSession){
                let input = {
                    componentStatus:{
                        push:{
                            componentName: get(componentData,'[0].type'),
                            componentStatus: true
                        }  
                    }
                }
                await updateVisitedComponent(componentConnectId,input)
            }
            let input = {}
            const componentId = get(componentData,'[0].link').split('/').pop()
            input = {
                video:{
                    push:{
                        componentId: componentId,
                        visited: true,
                        userConnectId: get(userId,'id'),
                    }
                }
            }
            input = {
                video:{
                    updateWhere:{
                      userReferenceId: get(userId,'id'),
                    },
                    updateWith:{
                        visited: true,
                        componentId: componentId,
                    }
                  }
            }
            await updateSessionComponentTracker(componentConnectId,input)
            if(userBuddies && userBuddies.length > 0){
                for (let i = 0; i < userBuddies.length; i++) {
                    const buddy = userBuddies[i];
                    delete input.video.updateWhere.userReferenceId;
                    input.video.updateWhere.userReferenceId = buddy.id;
                    await updateSessionComponentTracker(componentConnectId, input);
                }
            }
            break
        }
        case 'learningObjective': {
            if(!isComponentVisited(get(componentData,'[0].type')) && checkIfEmbedEnabled() && isInLiveSession){
                let input = {
                    componentStatus:{
                        push:{
                            componentName: get(componentData,'[0].type'),
                            componentStatus: true
                        }  
                    }
                }
                await updateVisitedComponent(componentConnectId,input)
            }
            let input = {}
            const componentId = get(componentData,'[0].loId')
            input = {
                learningObjective:{
                    updateWhere:{
                      userReferenceId: get(userId,'id'),
                    },
                    updateWith:{
                        visited: true,
                        componentId: componentId,
                    }
                  }
            }
            await updateSessionComponentTracker(componentConnectId,input)
            if(userBuddies && userBuddies.length > 0){
                for (let i = 0; i < userBuddies.length; i++) {
                    const buddy = userBuddies[i];
                    delete input.learningObjective.updateWhere.userReferenceId;
                    input.learningObjective.updateWhere.userReferenceId = buddy.id;
                    await updateSessionComponentTracker(componentConnectId, input);
                }
            }
            break
        }
        case 'blockBasedPractice': {
            const userParams =  {
                ...gtmUserParams(),
                blockBasedTitle: get(componentData,'[0].topicTitle')
            }
            fireGtmEvent(gtmEvents.blockAssignmentCTAClickedInSessionSidebar,{userParams})
            if(!isComponentVisited(get(componentData,'[0].type')) && checkIfEmbedEnabled() && isInLiveSession){
                let input = {
                    componentStatus:{
                        push:{
                            componentName: get(componentData,'[0].type'),
                            componentStatus: true
                        }  
                    }
                }
                await updateVisitedComponent(componentConnectId,input)
            }
            let input = {}
            const componentId = get(componentData,'[0].link').split('/').pop()
            input = {
                practice:{
                    updateWhere:{
                      userReferenceId: get(userId,'id'),
                    },
                    updateWith:{
                        visited: true,
                        componentId: componentId,
                    }
                  }
            }
            await updateSessionComponentTracker(componentConnectId,input)
            if(userBuddies && userBuddies.length > 0){
                for (let i = 0; i < userBuddies.length; i++) {
                    const buddy = userBuddies[i];
                    delete input.practice.updateWhere.userReferenceId;
                    input.practice.updateWhere.userReferenceId = buddy.id;
                    await updateSessionComponentTracker(componentConnectId, input);
                }
            }
            break
        }
        case 'learningSlide':{
            const userParams =  {
                ...gtmUserParams(),
                loTitle: get(componentData,'[0].loTitle'),
                loId: get(componentData,'[0].loId'),
            }
            fireGtmEvent(gtmEvents.learningSlidesCTAClickedInSessionSidebar,{userParams})
            if(!isComponentVisited(get(componentData,'[0].type')) && checkIfEmbedEnabled() && isInLiveSession){
                let input = {
                    componentStatus:{
                        push:{
                            componentName: 'learningSlide',
                            componentStatus: true
                        }  
                    }
                }
                await updateVisitedComponent(componentConnectId,input)
            }
            break
        }
        case 'practiceReport':{
            const userParams =  {
                ...gtmUserParams(),
                loTitle: get(componentData,'[0].loTitle'),
                loId: get(componentData,'[0].loId'),
            }
            fireGtmEvent(gtmEvents.practiceQuizReportCTAClickedInSessionSidebar,{userParams})
            if(!isComponentVisited(get(componentData,'[0].type')) && checkIfEmbedEnabled() && isInLiveSession){
                let input = {
                    componentStatus:{
                        push:{
                            componentName: 'practiceReport',
                            componentStatus: true
                        }  
                    }
                }
                await updateVisitedComponent(componentConnectId,input)
            }
            break
        }
        case 'homeworkDiscussion' :{
            const userParams = gtmUserParams()
            fireGtmEvent(gtmEvents.homeworkDiscussionCTAClickedInSessionSidebar,{userParams})
            if(!isComponentVisited(get(componentData,'[0].type')) && checkIfEmbedEnabled() && isInLiveSession){
                let input = {
                    componentStatus:{
                        push:{
                            componentName: 'homeworkDiscussion',
                            componentStatus: true
                        }  
                    }
                }
                await updateVisitedComponent(componentConnectId,input)
            }
            break
        }
        default:{
            break
        }
    }

}

export default sessionComponentTracker