import store from "../../store"
import gql from 'graphql-tag'
import { fromJS } from 'immutable'
import { get } from 'lodash'
import { Map } from "immutable";
import { filterKey, getDataFromLocalStorage, waitFor } from "../../utils/data-utils";
import updateMentorMenteeSession from '../../queries/sessions/updateMentorMenteeSession'
import { getInSessionSideBarRule } from '../UpdatedSideNavBar/utils'
import requestToGraphql from '../../utils/requestToGraphql'
import goBackToTeacherApp from "../../utils/teacherApp/goBackToTeacherApp";
import { checkIfEmbedEnabled, getEmbedData } from "../../utils/teacherApp/checkForEmbed";
import getMe from "../../utils/getMe";
import getNumFromString from "../../utils/getNumFromString";
import fetchQuizReport from "../../queries/fetchQuizReport";
import { HOMEWORK_COMPONENTS_CONFIG, TOPIC_COMPONENTS } from "../../constants/topicComponentConstants";
import fetchComponents from "../../queries/fetchComponents";
import duck from "../../duck";
import fetchQuizAnswers from "../../queries/fetchQuizAnswers";
import fetchQuizQuestions from "../../queries/fetchQuizQuestions"
import getCourseId from "../../utils/getCourseId";
import { backToPageConst } from "../../pages/TeacherApp/constants";
import { getProgressFromHomework } from "../UpdatedSideNavBar/HomeworkProgress";
import { HOMEWORK_URL, SESSIONS_URL } from "../../constants/routes/routesPaths";

export const BUTTON_TEXT = {
    'NEXT': 'Next',
    "NEXT_UP": 'Next Up',
    'END_SESSION': 'End Session',
    'BACK_TO_SESSION': 'Back to Sessions',
    'SAVE_AND_NEXT': 'Save & Next',
    'SAVE_AND_SUBMIT': 'Submit Homework',
    'BACK_TO_HOMEWORK': 'Back to Homework',
}
const totalHomeworkProgress = () => get(getProgressFromHomework(store.getState().data.getIn(['homeWorkMeta', 'data']).toJS()), 'totalHomework', 0)

// get button details for next footer 
export const getButtonDetails = ({lastItem,topicId,isRevisit = false,url,classwork = true,isSubmittedForReview }) => {
    const {getLastComponent} = filteredComponentsLink({topicId,isRevisit,url,classwork})
    let label;
    let type = 'primary';
    let dir = 'right';
    if(totalHomeworkProgress() === 0 && !classwork){
        isRevisit = true
    }
    if (isRevisit || (isSubmittedForReview && !classwork)) {
        
        if (lastItem && getLastComponent) {
            label = classwork ? BUTTON_TEXT.BACK_TO_SESSION : BUTTON_TEXT.BACK_TO_HOMEWORK
        } else {
            label = BUTTON_TEXT.NEXT
        }
    } else {

        if (lastItem && getLastComponent) {
            type = classwork ? 'danger' : 'primary'
            dir = classwork ? 'left'  : 'right'
            label = classwork ? BUTTON_TEXT.END_SESSION : BUTTON_TEXT.SAVE_AND_SUBMIT
        } else {
            label = BUTTON_TEXT.NEXT
        }
    }
    
    return {
        label,
        type,
        dir,
    }
}
// ther here calls when end session button is clicked
export const endSession = async ({
    topicId,
    history,
    handleEndSessionModal,
    isRevisit,
    handleLoading,
    getComponents,
    grade
}) => {

    const { userId, mentorMenteeSessionEndSession, mentor } = getDataFromStore(topicId)
    const course = getCourse()
    const courseId = get(course, 'id')
    const menteeId = userId
    const topic = getFilterTopicFromMenteeCourse(topicId)
    const isFirstTopic = topicId === get(topic, 'topicId', '')
    const {shouldShowCredentialModal} = getCredentialModalDetails(topicId)
    if (checkIfEmbedEnabled()) {
            const backToPage = getEmbedData('backToPage')
            if (backToPage !== backToPageConst.trainingResourcesClasswork) return goBackToTeacherApp('endSession')
        }
   // if topic Session staus is not completed, then only update the session status to completed
        if(get(topic, 'sessionStatus') !== 'completed'){
            const thisMentorMeteeSession = await requestToGraphql(
                gql`
                    query {
                        mentorMenteeSessions(filter:{
                            and:[
                                    {menteeSession_some: {user_some: {id: "${menteeId}"}}}
                                    {topic_some: {id: "${topicId}"}}
                                ]
                            }) {
                                id
                                sessionStatus
                            }
                        }   
                    `
                )
            if (thisMentorMeteeSession) {
                // setState({
                //     fetchingMentorMenteeSession: false
                // })
                if (
                    get(thisMentorMeteeSession, 'data.mentorMenteeSessions') &&
                    get(thisMentorMeteeSession, 'data.mentorMenteeSessions').length
                ) {
                    const res = await updateMentorMenteeSession(
                        get(thisMentorMeteeSession, 'data.mentorMenteeSessions.0.id'),
                        { sessionStatus: 'completed', endSessionByMentee: new Date() },
                        topicId,
                        true,
                        courseId
                    ).call()
                    if (res) {                       
                        if (mentor && mentor.getIn(['id'])) {
                            history.push(`/sessions`)
                            store.dispatch({
                                type: 'user/delete/success',
                                payload: fromJS({
                                    extractedData: {
                                        user: {
                                            id: mentor && mentor.getIn(['id'])
                                        }
                                    }
                                }),
                                autoReducer: true
                            })
                        }
                    }
                }
            }
        }
        if(shouldShowCredentialModal){
            handleEndSessionModal(true)
        } else{
            if (!checkIfEmbedEnabled()) {
                getLogout()
            } else {
                goBackToTeacherApp('backToTraining')
            }
            // handleEndSessionModal(true,getComponents,topicId)
        }
        // isFeedback && get(isFeedback, 'data.sessionFeedbacks', []).length > 0 && history.push(`/sessions`)
      
}

export const filteredComponentsLink = ({topicId,isRevisit = false,url, classwork=true,component}) => { 
    // get the topic from the store
    const course = getCourse()
    const courseDefaultLoComponentRule = get(course, 'defaultLoComponentRule', [])
    const topics = store.getState().data.getIn(['topic', 'data'])
    const topic = topics.toJS().find((topic)=> topic.id === topicId)
    // get the course from the topic
    const componentRules = getInSessionSideBarRule(
        get(topic,'topicComponentRule'),
        courseDefaultLoComponentRule,
        getCourseId(topicId),
        topicId,
        isRevisit ? '/revisit' : '',
        classwork
    )
    const getFirstComponentRule = componentRules[0]
    // we are getting the route links from the each component, 
    // so that we can easily navigate to the next component
    const getLinksFromComponent = []
    let getComponents = []
    const filteredComponentLink = []
    componentRules.forEach((componentRule)=> {    
            const blockBasedProjects = get(componentRule,'blockBasedProjects',[])
            if(blockBasedProjects.length){
                getComponents.push(get(componentRule,'type'))
                blockBasedProjects.forEach((blockBasedProject) => {
                    const getLink = get(blockBasedProject,'link', null)
                    if(getLink){
                        getLinksFromComponent.push(getLink)
                        if(component && get(componentRule,'type') === component){
                            filteredComponentLink.push(getLink)
                        }
                    }
                })
            }
            else{
                if(get(componentRule,'navType') === 'root'){ 
                    getLinksFromComponent.push(get(componentRule,'link'))
                    getComponents.push(get(componentRule,'type'))
                     if(component && get(componentRule,'type') === component){
                        filteredComponentLink.push(get(componentRule,'link'))
                    }
                }
            else if(componentRule.childComponents.length > 0){
                componentRule.childComponents.forEach((childComponent)=> {
                  getLinksFromComponent.push(childComponent.link)
                  getComponents.push(childComponent.type)
                   if(component && get(componentRule,'type') === component){
                        filteredComponentLink.push(get(componentRule,'link'))
                    }
                })
            }
            }
        
    })
    const getLastComponent = url && getLinksFromComponent.length !== 0 && getLinksFromComponent[getLinksFromComponent.length - 1] === url
    return {
        getLinksFromComponent,
        getLastComponent,
        getComponents,
        getFirstComponentRule,
        filteredComponentLink,
        } 
}
export const checkIfQuizExits = ({topicId,isRevisit}) => {
    const course = getCourse()
    const courseDefaultLoComponentRule = get(course, 'defaultLoComponentRule', [])
    const topics = store.getState().data.getIn(['topic', 'data'])
    const topic = topics.toJS().find((topic)=> topic.id === topicId)
    const componentRules = getInSessionSideBarRule(
        get(topic,'topicComponentRule'),
        courseDefaultLoComponentRule,
        get(course,'id'),
        topicId,
        isRevisit ? '/revisit' : '',
        false
    )
    const checkIfQuizExists = !!componentRules.find(item => item.type === 'quiz')
    return checkIfQuizExists


}

const nextComponent = async ({getLinksFromComponent,url,history}) => {
    // getting current component route link index from all the component route's links
    const index = getLinksFromComponent.indexOf(url)
    const nextUrl = getLinksFromComponent[index + 1]
    // navigate to the next component route link
    history.push(nextUrl)
}
// this is the main function which is called when next button is clicked
export const handleNext = async (
    {
        topicId,
        isRevisit,
        url,
        lastItem,
        history,
        nextItem = () => {},
        handleEndSessionModal = () => {},
        dumpSession = () => {},
        handleLoading = () => {},
        footerFrom,
        classwork=true,
        setShouldHomeworkSubmitModal,
        isSubmittedForReview
    }
    ) => {
    const {getLastComponent,getLinksFromComponent,getComponents} = filteredComponentsLink({topicId,isRevisit,url,classwork })
    if(totalHomeworkProgress === 0 && !classwork) {
        isRevisit = true
    }
    // if isRevisit and  End Session button is showing then redirect to session page - revisit
    const backToPage = getEmbedData('backToPage')
    if (lastItem && checkIfEmbedEnabled() && backToPage === backToPageConst.trainingClassrooms) {
        dumpComponent(classwork, dumpSession)
    }
    if (footerFrom === 'codingAssignment' && !checkIfEmbedEnabled()) {
        handleLoading(true)
        await dumpComponent(classwork, dumpSession)
        handleLoading(false)
    }
    if (isRevisit && getLastComponent && lastItem) {

        if(checkIfEmbedEnabled()){
            return goBackToTeacherApp('backToSession')
        }
        return history.push(SESSIONS_URL)
    }
    // if lastItem in component and last component then end session - end session
    if(lastItem && getLastComponent){
        if (!checkIfEmbedEnabled()) handleLoading(true)
        if (classwork) {
             if(checkIfEmbedEnabled()){
                const backToPage = getEmbedData('backToPage')
                 if (backToPage !== backToPageConst.trainingResourcesClasswork) return goBackToTeacherApp('endSession')
                 else dumpComponent(classwork, dumpSession)
            }
            if (!checkIfEmbedEnabled()) dumpComponent(classwork, dumpSession)
                await endSession({
                        topicId,
                        history,
                        handleEndSessionModal,
                        isRevisit,
                        handleLoading,
                        dumpSession,
                        getComponents
                    })
                handleLoading(false)
                    
        } else {
            if (checkIfEmbedEnabled()) {
                const backToPage = getEmbedData('backToPage')
                if (backToPage !== backToPageConst.trainingResourcesAssessment) return goBackToTeacherApp('backToSession')
                else if (backToPage === backToPageConst.trainingResourcesAssessment) dumpComponent(classwork,dumpSession)
            }
            if (isSubmittedForReview || totalHomeworkProgress() === 0) {
                if (checkIfEmbedEnabled()) {
                    const backToPage = getEmbedData('backToPage')
                    if (backToPage === backToPageConst.trainingResourcesAssessment) return goBackToTeacherApp('backToTraining')
                }
                return history.push(HOMEWORK_URL)
            }
            if(!checkIfEmbedEnabled()) dumpComponent(classwork,dumpSession)
            if (!isSubmittedForReview) {
                //  await saveHomeWork()
                setShouldHomeworkSubmitModal(true)
            }
            handleLoading(false)
        }
    }
    // if lastItem in component and not last component then go to next component - next component
    else if(lastItem && !getLastComponent){
       
        // if currentComponent is video then don't show loading and  call dump in background
        if (footerFrom === 'video') {
            if (checkIfEmbedEnabled()) {
                const backToPage = getEmbedData('backToPage')
                if (backToPage === backToPageConst.trainingResourcesClasswork) dumpSession()
            }
            !checkIfEmbedEnabled() && dumpSession()
        }
        else{
            if (!checkIfEmbedEnabled()){
                handleLoading(true)
                const res = await dumpComponent(classwork,dumpSession)
                handleLoading(false)
            }
            if (checkIfEmbedEnabled()) {
                const backToPage = getEmbedData('backToPage')
                if (backToPage === backToPageConst.trainingResourcesClasswork) {
                    handleLoading(true)
                    dumpComponent(classwork, dumpSession)
                    handleLoading(false)
                }
            }
        }
        nextComponent({getLinksFromComponent,url,history})
    }
    // else just call nextItem function which is passed as a prop to each component - next item
    else{
        nextItem()
    }
  }
const dumpComponent = async (isClasswork,dumpSession) => {
    if(!isClasswork) return
    return await dumpSession()
}
const getCourse = () => {
    return store.getState().data.getIn(['course','data']).toJS()
}
// getting firstLabTopic and lab topics from all topics
export const getTopicsFromMenteeCourse = () => {
    const getMenteeCourseFromStore = store.getState().data.getIn(['menteeCourseSyllabus','data']).toJS()[0]
    const completedSession = get(getMenteeCourseFromStore, 'completedSession', [])
    const upComingSession = get( getMenteeCourseFromStore,'upComingSession', [])
    const bookedSession = get( getMenteeCourseFromStore,'bookedSession', [])
    const topics = [...completedSession, ...upComingSession, ...bookedSession]
    const getLabTopics = topics.filter((topic) => topic.classType === 'lab')
    const getLabsTopicsByOrder = getLabTopics.sort((a, b) => a.order - b.order)
    const getFirstLabTopic = getLabsTopicsByOrder[0]
    return {getLabsTopicsByOrder,getFirstLabTopic}
}
export const getFilterTopicFromMenteeCourse = (topicId) => {
    const {getLabsTopicsByOrder} = getTopicsFromMenteeCourse()
    const getTopic = getLabsTopicsByOrder.find((topic) => topic.topicId === topicId)
    return getTopic
}

// getting credential modal details from the topic
export const getCredentialModalDetails = (topicId) => {
    const getLoggedInUser = filterKey(store.getState().data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0) || Map({})
    const isFirstLabTopic = topicId === get(getTopicsFromMenteeCourse().getFirstLabTopic , 'topicId', '')
    const loggedInUser = getLoggedInUser && getLoggedInUser.toJS()
    const shouldShowCredentialModal = get(loggedInUser, 'fromOtpScreen', false) && isFirstLabTopic
    const getEmail = get(loggedInUser, 'email')
    const getPassword = get(loggedInUser, 'savedPassword')
     
    return {
        shouldShowCredentialModal,
        getEmail,
        getPassword
    }
}

// logout the user
export const getLogout = () => {
  return store.dispatch({
      type: 'LOGOUT',
  })
}
// store
export const getDataFromStore = (topicId) => {
    const getMentorMenteeSession = (state, props = {}) => {
    const loggedInUser = filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0) || Map({})
    const loggedInUserId = (loggedInUser && loggedInUser.toJS)
        ? get(loggedInUser.toJS(), 'id')
        : ''
    let mentorMenteeSession = filterKey(
        state.data.getIn([
            'mentorMenteeSession',
            'data'
        ]),
        `mentorMenteeSession/${topicId}`
    )
    if (!(mentorMenteeSession && mentorMenteeSession.toJS && mentorMenteeSession.toJS().length)) {
        mentorMenteeSession = filterKey(
            state.data.getIn([
                'mentorMenteeSession',
                'data'
            ]),
            `mentorMenteeSession/${loggedInUserId}/${topicId}`
        )
    }

    return mentorMenteeSession
    }
    const state = store.getState()
    const userId =  filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').get(0).getIn(['id']) 
    const mentorMenteeSessionEndSession = getMentorMenteeSession(state)
    const mentor = state.data.getIn(['mentor', 'data'])
    return {
        userId,
        mentorMenteeSessionEndSession,
        mentor
    }
}   
export const getProfileInfo = () => {
    const user = getMe()
    const userId = get(user, 'id')
    const children = get(user, 'children', [])
    const batchId = children && get(children, '[0].studentProfile.batch.id')
    
    const coursePackageId = get(user, 'coursePackageId')
    const grade = get(user, 'grade')
    return {userId,batchId,coursePackageId,grade}

}

export const feedbackTypes = {
    CLASS: 'postClasswork',
    HOMEWORK: 'postHomework'
}

export const getFilteredFeedbackTags = ({feedbackType = 'postClasswork',components = ['video'],rating}) => {
    const {grade} = getProfileInfo()
    const feedbackTags = store.getState().data.getIn(['sessionFeedbackTags', 'data']).toJS()
    // filter feedback tags based on feedback type and component if component is include and also if component is empty
    let getFeedbackTags = [];
    const filterFeedbackTagsByComponent = feedbackTags.map((feedbackTag,index) => {
        const getFeedbackType = get(feedbackTag, 'feedbackType')
        const getComponent = get(feedbackTag, 'components' , [])
        const getGrade = get(feedbackTag, 'grades',[])
        const getRating = get(feedbackTag, 'rating',[])
        
        const isGrade = getGrade > 1 ? checkIfGradeisBetween(grade,getGrade[0],getGrade[1]) : grade === getGrade
        const tofilterTags = (getFeedbackType === feedbackType  
            && (checkIfInclude(getComponent, components) 
            || getComponent.length === 0)) && (rating && checkIfInclude(getRating,rating))
          
        const filterTagsWithoutRating =  getFeedbackType === feedbackType
            && (checkIfInclude(getComponent, components)
            || getComponent.length === 0)
      
        return filterTagsWithoutRating ? {
            id: `${get(feedbackTag, 'id')}`,
            name: get(feedbackTag, 'label'),
            rating: get(feedbackTag, 'rating',[]),
            components: getComponent,
            feedbackType: getFeedbackType,
            selected: false,
        } : null

        }).filter((feedbackTag) => feedbackTag !== null)
        const filterFeedbackTagsByRating = filterFeedbackTagsByComponent.filter((item,index) => {
            const getRating = get(item, 'rating',[])
            return rating && checkIfInclude(getRating,rating)
        })
    return {
        filterFeedbackTagsByComponent,
        filterFeedbackTagsByRating: filterFeedbackTagsByRating.splice(0,4)
    }
    
}


const checkIfInclude = (checkArray, array) => {
    if(checkArray.length === 0) return
    return checkArray.some((item) => array.includes(item))
}

const checkIfGradeisBetween = (grade, minGrade, maxGrade) => {
    const gradeNumber = getNumFromString(grade)
    const minGradeNumber = getNumFromString(minGrade)
    const maxGradeNumber = getNumFromString(maxGrade)
                
    return gradeNumber >= minGradeNumber && gradeNumber <= maxGradeNumber
}

const getFeedbackTagsByRating = (rating, feedbackTags) => {
        return feedbackTags.filter((feedbackTag) => {
            const getRatings = get(feedbackTag, 'rating', [])
            return checkIfInclude(getRatings, rating)
        })
}
// 
export const fetchHomeworkDetails = async (
    {
        topicId,
        courseId,
        isRevisit,
     // userBlockBasedPractice,
        // userFirstAndLatestQuizReport,
        // userAssignment,
       
    }
) => {
    const {userId} = getProfileInfo()
    const fetchQuiz = () => fetchQuizReport(topicId).call()
    const fetchPractice = () => fetchComponents(topicId, courseId).components([
                                { type: TOPIC_COMPONENTS.homeworkPractice }
                            ])
    const fetchAssignMent = () => fetchComponents(topicId, courseId).components([
                                { type: TOPIC_COMPONENTS.assignment }
            ])
    
     const getComponents = filteredComponentsLink({
        topicId,
        isRevisit,
        classwork: false,
        }).getComponents.filter(item => !item.includes("quizReport"))
    const fetchByComponents = {
        [HOMEWORK_COMPONENTS_CONFIG.quiz]: fetchQuiz,
        [HOMEWORK_COMPONENTS_CONFIG.homeworkAssignment]: fetchAssignMent,
        [HOMEWORK_COMPONENTS_CONFIG.homeworkPractice]: fetchPractice,
    }
    // fetch the homework details based on the components
    const metaTags = {
        [HOMEWORK_COMPONENTS_CONFIG.quiz]: {
            total: 0,
            attempted: 0,
            attemptedIds: [],
        },
        [HOMEWORK_COMPONENTS_CONFIG.homeworkAssignment]: {
            total: 0,
            attempted: 0,
            attemptedIds: [],

        },
        
        [HOMEWORK_COMPONENTS_CONFIG.homeworkPractice]: {
            total: 0,
            attempted: 0,
            attemptedIds: [],
        }
        
        
    }        

    
   await Promise.all(getComponents.map((component) => 
                    fetchByComponents[component]()
                    ))
     
    if(getComponents.includes(HOMEWORK_COMPONENTS_CONFIG.homeworkAssignment))
     {
        let userAssignment = await waitFor(() => filterKey(store.getState().data.getIn([
        'userAssignment',
        'data',
        ]),`${topicId}`).toJS(),100,false)
        const getAssignments = get(userAssignment, "[0].assignment", []).filter((assignment) =>
                                get(assignment, 'assignmentQuestion.isHomework', false)
                            )   
        const totalAssignments = getAssignments.length
        const getAttemptedAssignments = getAssignments.filter((assignment) => 
                                            get(assignment, 'assignmentQuestion.isHomework', false) 
                                            && get(assignment, 'isAttempted', false))
        if(totalAssignments > 0){

            metaTags[HOMEWORK_COMPONENTS_CONFIG.homeworkAssignment].total = totalAssignments
            metaTags[HOMEWORK_COMPONENTS_CONFIG.homeworkAssignment].attempted = getAttemptedAssignments.length
            metaTags[HOMEWORK_COMPONENTS_CONFIG.homeworkAssignment].attemptedIds = getAttemptedAssignments.map((assignment) => get(assignment, 'assignmentQuestion.id'))
               
              
            }
        }
    if(getComponents.includes(HOMEWORK_COMPONENTS_CONFIG.quiz) ){       
        let userFirstAndLatestQuizReport =   filterKey(store.getState().data.getIn([
        'userFirstAndLatestQuizReport',
        'data',
        ]), `userQuizReport/${topicId}`).toJS()
        let getTotalQuizes = get(userFirstAndLatestQuizReport,'[0].latestQuizReport.quizReport.totalQuestionCount', 0)
        const getAttemptedQuizes  = getTotalQuizes - get(userFirstAndLatestQuizReport,'[0].latestQuizReport.quizReport.unansweredQuestionCount', 0)
        const quizReportId = get(userFirstAndLatestQuizReport,'[0].latestQuizReport.quizReportId', null)
        const attemptedIds = []      
        if(quizReportId){
            const res =  await fetchQuizAnswers(quizReportId, null, true, courseId).call()
            if (res && res.userQuizAnswers) {
            if (
                res.userQuizAnswers.quizAnswers &&
                res.userQuizAnswers.quizAnswers.length
            ) {
                const quizAnswers = get(res,'userQuizAnswers.quizAnswers');
                quizAnswers.forEach((quiz => {
                const isQuestionAttempted = get(quiz, 'isAttempted', false)
                const attemptedQuestionId = get(quiz, 'question.id', null)
                isQuestionAttempted && attemptedIds.push(attemptedQuestionId)
                })
                )

            }
            }
        }
        else{
            try {

                const res =  await fetchQuizQuestions(userId, topicId, courseId).call()
                const totalQuizes = get(res, 'query.userQuizs[0].quiz',[]).length
                getTotalQuizes = totalQuizes
            } catch (error) {
                const userQuizAnswers = await waitFor(() => 
                    filterKey(store.getState().data.getIn(['userQuiz', 'data']), `userQuiz/${topicId}`).toJS()
                )
                const totalQuizes = get(userQuizAnswers, '[0].quiz',[]).length
                getTotalQuizes = totalQuizes    
            }
           
        }
        

        if(getTotalQuizes > 0){
            metaTags[HOMEWORK_COMPONENTS_CONFIG.quiz].total = getTotalQuizes
            metaTags[HOMEWORK_COMPONENTS_CONFIG.quiz].attempted = getAttemptedQuizes
            metaTags[HOMEWORK_COMPONENTS_CONFIG.quiz].attemptedIds = attemptedIds
            
        }
    }
    
    
    if( getComponents.includes(HOMEWORK_COMPONENTS_CONFIG.homeworkPractice) ){
        const userId = get(getMe(),'id')
        let userBlockBasedPractice = await waitFor(() => filterKey(store.getState().data.getIn([
        'userBlockBasedPractices',
        'data',
        ]) , 
        `${topicId}/${HOMEWORK_COMPONENTS_CONFIG.homeworkPractice}/${userId}`
        ).toJS())
        
        const getPractices =  userBlockBasedPractice.filter((practice) =>
                                    get(practice, 'blockBasedPractice.isHomework', false) && get(practice, 'blockBasedPractice.isSubmitAnswer', false)
                                )
        const totalPractices = getPractices.length
        let totalAttempted = 0
        let totalAttemptedIds = []

        if(
            getPractices.length
        ){
            getPractices.forEach((practice,index) => {
                if ((get(practice, 'blockBasedPractice.layout') === 'playground') && get(practice, 'savedBlocks')) {
                totalAttempted += 1
                totalAttemptedIds.push(get(practice, 'blockBasedPractice.id'))
            }
                else if ((get(practice, 'blockBasedPractice.layout') === 'fileUpload') && get(practice, 'attachments', []).length) {
                totalAttempted += 1
                totalAttemptedIds.push(get(practice, 'blockBasedPractice.id'))
            }
      
            else if ((get(practice, 'blockBasedPractice.layout') === 'externalPlatform') && get(practice, 'answerLink')) {
                totalAttempted += 1
                totalAttemptedIds.push(get(practice, 'blockBasedPractice.id'))
            }
            else if ((get(practice, 'blockBasedPractice.layout') === 'gsuite') && get(practice, 'isGsuiteFileVisited', false)) {
                totalAttempted += 1
                totalAttemptedIds.push(get(practice, 'blockBasedPractice.id'))
            }
      
        })
        metaTags[HOMEWORK_COMPONENTS_CONFIG.homeworkPractice].total = totalPractices
        metaTags[HOMEWORK_COMPONENTS_CONFIG.homeworkPractice].attempted = totalAttempted
        metaTags[HOMEWORK_COMPONENTS_CONFIG.homeworkPractice].attemptedIds = totalAttemptedIds

    }    
    }  
    return metaTags
}
export const updateHomeworkAttempted = (attemptedId,component,isDelete = false) => {
    const getMetaTags = store.getState().data.getIn(['homeWorkMeta', 'data']).toJS()
    // checking if the attempted id is already present in the attemptedIds array
    const isAttempted = (attemptedId && get(getMetaTags, `${[component]}.attemptedIds`)) && getMetaTags[component].attemptedIds.includes(attemptedId)    
    const attempted = isDelete ? get(getMetaTags, `${[component]}.attempted`) - 1 : get(getMetaTags, `${[component]}.attempted`) + 1
    const attemptedIds = isDelete ? get(getMetaTags, `${[component]}.attemptedIds`).filter((id) => id !== attemptedId) : [...get(getMetaTags, `${[component]}.attemptedIds`, []), attemptedId]
        if(((!isAttempted || isDelete) && get(getMetaTags, `${[component]}.attemptedIds`)) && attemptedId){
            const updatedHomework = {
                [component]: {
                    ...getMetaTags[component],
                    attempted:  Math.max(attempted, 0), 
                    attemptedIds: attemptedIds
                }
            }
            duck.merge(() => ({
                    homeWorkMeta: updatedHomework,
                    }),
                    {
                        key : 'homeWorkMeta'
                    }
                )
        }
    

}
