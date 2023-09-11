import { get } from 'lodash'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import fetchTopicJourney from '../../queries/fetchTopicJourney'
import MainSideBar from './MainSideBar'
import UpdatedSideNavBar from './updatedSideNavBar'
import { filterKey } from '../../utils/data-utils'
import fetchTopics from '../../queries/sessions/fetchTopic'
import config from "../../config";
import fetchMenteeCourseSyllabus from '../../queries/sessions/fetchMenteeCourseSyllabus'
import {Map} from "immutable";
import { TOPIC_COMPONENTS } from '../../constants/topicComponentConstants'

const mapStateToProps = (state, { computedMatch, revisitRoute, course, ...props }) => {
    const users = state.data.getIn(['user','data'])
    const menteeRole = users.find((userObj)=>userObj.get('role') === config.MENTEE)
    const courses = state.data.getIn([
        'courses',
        'data'
    ]).toJS()
    const selfLearnerRole = users.find((userObj) => userObj.get('role') === config.SELF_LEARNER)
    const menteeRoleOrLearnerProfileId = (menteeRole || selfLearnerRole) ? (menteeRole || selfLearnerRole).getIn(['studentProfile', 'id']) : '';
    const studentProfile = state.data.getIn(['studentProfile','data']).find((studentData)=>{
        return studentData.get("id") === menteeRoleOrLearnerProfileId;
    })
    let thisCourse = courses.find((courseObj)=> courseObj.id === get(computedMatch, 'params.courseId'))
    const courseData = state.data.getIn([
        'course',
        'data'
    ])
    const batchSessionData = state.data.getIn(['batchSessionData', 'data']).toJS()
    if (!thisCourse){
        thisCourse = (courseData && courseData.toJS()) || {}
    }

    const isHomework =  ((computedMatch.path = '/homework/:courseId/:topicId/:projectId/practice') || (computedMatch.path = '/sessions/:courseId/:topicId/:projectId/practice')) &&
    !computedMatch.url.includes('/sessions/practice/')
    const userId = filterKey(state.data.getIn([
        'user',
        'data'
    ]), 'loggedinUser').getIn([0, 'id']) || Map({})
    const userBlockBasedPractices = filterKey(state.data.getIn([
        'userBlockBasedPractices',
        'data'
    ]), computedMatch.params.topicId + '/' + (isHomework ? TOPIC_COMPONENTS.homeworkPractice : TOPIC_COMPONENTS.blockBasedPractice) + '/' + userId)
    
    return {
        ...props,
        computedMatch,
        profile: menteeRole || selfLearnerRole,
        accountProfileSuccess: state.data.getIn(['user','fetchStatus','accountProfile','success']),
        batchSessionFetchStatus: state.data.getIn(['batchSessionData','fetchStatus','batchSessionData']),
        ...(fetchTopicJourney(computedMatch.params.topicId, true, computedMatch.params.courseId).mapStateToProps(state)),
        userVideo: filterKey(state.data.getIn(['userVideo', 'data']), `blockVideo/${computedMatch.params.topicId}`),
        userRole: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'role'], false),
        mentorMenteeSession: state.data.getIn([
            'mentorMenteeSession',
            'data'
        ]),
        homeWorkMeta: state.data.getIn([
            'homeWorkMeta',
            'data'
        ]),
        menteeCourseSyllabus: state.data.getIn(['menteeCourseSyllabus','data']),
        topicId: get(computedMatch, 'params.topicId'),
        courseId: get(computedMatch, 'params.courseId'),
        revisitString:  revisitRoute ? '/revisit' : '',
        currentRoute: computedMatch.url,
        courseDefaultLoComponentRule: get(thisCourse, 'defaultLoComponentRule', []),
        mentorMenteeSessionUpdateStatus: state.data.getIn([
            'mentorMenteeSession',
            'updateStatus'
        ]),
        ...fetchTopics().mapStateToProps(state),
        unlockBadge: state.data.getIn(['unlockBadge', 'data']),
        loggedInUser: filterKey(state.data.getIn([
            'user',
            'data'
        ]), 'loggedinUser').get(0) || Map({}),
        userId,
        userQuiz: state.data.getIn([
            'userQuiz',
            'data'
        ]),
        topic: state.data.getIn([
            'topic',
            'data'
        ]),
        course: state.data.getIn([
            'course',
            'data'
        ]),
        coursePackages: state.data.getIn([
            'coursePackages',
            'data'
        ]),
        userBlockBasedPractices,
        userBlockBasedProjects: state.data.getIn([
            'userBlockBasedProjects',
            'data'
        ]),
        studentProfile: studentProfile||Map({}),
        unlockBadgeStatus: state.data.getIn([
            'unlockBadge',
            'fetchStatus'
        ]),
        userFirstAndLatestQuizReport: state.data.getIn([
            'userFirstAndLatestQuizReport',
            'data'
        ]),
        userAssignment: state.data.getIn([
        'userAssignment',
        'data'
        ]),
        batchSessionData,
    }}

export default connect(mapStateToProps)(withRouter(MainSideBar))
