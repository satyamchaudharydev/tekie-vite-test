/* eslint-disable no-empty-pattern */
import extractSubdomain, { isSubDomainActive } from '../extractSubdomain';
import { eventParamsVariables, gtmModule, gtmPlatform, gtmVariables, userParamsVariables } from './gtmConstants';

const pushToGTMDataLayer = (customGTMEventProp) => {
    console.log('pushing events to GTM dataLayer', customGTMEventProp)
    if (window && window.dataLayer) {
        window.dataLayer.push(customGTMEventProp);
    } else {
        console.error('error in pushing events to GTM dataLayer');
    }
}
const fireGtmEvent = (eventData , additionalProps = {}) => {
    // this is done to avoid mutation of the eventData object
    eventData = {
        ...eventData
    }
    let { eventParams } = eventData;
    let {userParams} = additionalProps
    eventParams = {
        ...eventParams
    }
    if (eventParams) {
      const pageLoadTime = window.pageLoad
      let platform = extractSubdomain()
      if(extractSubdomain() !== "student" && extractSubdomain() !== 'teacher' ){
        platform = gtmPlatform.website
      }
      if (pageLoadTime) {
        eventParams[eventParamsVariables.pageLoadTime] = pageLoadTime;
      }
      eventData[eventParamsVariables.platform] = platform;
      // Assign the modified params to the eventData object
      eventData[gtmVariables.eventParamsSecondary.variableName] = paramsFormat(eventParams);
      eventData[gtmVariables.eventParams.variableName] = JSON.stringify(eventParams);
    }
    if(userParams){
        additionalProps[gtmVariables.userParams.variableName] = JSON.stringify(userParamsMapper(userParams).userParams);
        additionalProps[gtmVariables.userParamsSecondary.variableName] = userParamsMapper(userParams).userParamsSecondary;
        
    }
    // Merge additional props with the eventData object
    eventData = {
      ...eventData,
      ...additionalProps
    }
  
    pushToGTMDataLayer(eventData);
  }
  
const userParamsMapper = ({
    userId,
    role,
    schoolId,
    grade,
    rollNo,
    section,
    userName,
    coursePackageName,
    batchId,
    batchCode,
    classroomTitle,
    courseId,
    schoolName,
    topicId,
    sessionId,
    videoTitle,
    loTitle,
    loId,
}) => {
    let userParams = {
        [userParamsVariables.userId]: userId,
        [userParamsVariables.role]: role,
        [userParamsVariables.schoolId]: schoolId,
        [userParamsVariables.schoolName]: schoolName,
        [userParamsVariables.grade]: grade ,
        [userParamsVariables.rollNo]: rollNo,
        [userParamsVariables.section]: section,
        [userParamsVariables.userName]: userName,
        [userParamsVariables.coursePackageName]: coursePackageName,
        [userParamsVariables.batchId]: batchId,
        [userParamsVariables.classroomTitle]: classroomTitle,
        [userParamsVariables.topicId]: topicId,
        [userParamsVariables.courseId]: courseId,
        [userParamsVariables.sessionId]: sessionId,
        [userParamsVariables.videoTitle]: videoTitle,
        [userParamsVariables.loTitle]: loTitle,
        [userParamsVariables.loId]: loId,
    }
    // filter out the undefined values
    userParams = Object.keys(userParams).reduce((acc, key) => {
        if (userParams[key]) {
            acc[key] = userParams[key];
        }
        return acc;
    }
    , {});
    // format the userParams
    const userParamsSecondary = paramsFormat(userParams);
    return {
        userParams,
        userParamsSecondary
    }
}

const paramsFormat = (obj= {}) => {
    const format = Object.entries(obj)
              .map(([key, value]) => `${key}=<${value}>`)
              .join(',');
   return format           
}


export { fireGtmEvent,userParamsMapper };