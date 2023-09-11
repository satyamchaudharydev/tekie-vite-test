import React, { Component } from 'react'
import { sortBy, get, orderBy } from 'lodash'
import styles from './Homework.module.scss'
import CurrentHomework from './components/CurrentHomework'
import PastHomework from './components/PastHomework'
import fetchMenteeHomeworkSyllabus from '../../queries/sessions/fetchMenteeHomeworkSyllabus'
import fetchMenteeCourseSyllabus from '../../queries/sessions/fetchMenteeCourseSyllabus'
import fetchUserQuizDetails from '../../queries/sessions/fetchUserQuizDetails'
import { uhohMessage, takeSessionMsg } from '../../constants/homework/messages'
import ChatWidget from '../../components/ChatWidget'
import fetchCourseDetails from '../../queries/sessions/fetchCourseDetails'
import fetchStudentCurrentStatus from '../../queries/fetchStudentCurrentStatus'
import renderChats from '../../utils/getChatTags'
import CourseNav from '../../components/CourseNav'
import getCourseId, { getCourseName } from '../../utils/getCourseId'
import { PYTHON_COURSE } from '../../config'
import isMobile from "../../utils/isMobile.js"
import { Toaster } from '../../components/Toaster'
import TekieLoader from '../../components/Loading/TekieLoader'
import { HOMEWORK_URL } from '../../constants/routes/routesPaths'

const homeworkComponents = ['quiz', 'homeworkAssignment', 'homeworkPractice']


class Homework extends Component {

    state = {
        currentTab: "linear-gradient(356.11deg, #FAFAFA 4.63%, #E6F7FD 115.51%)",
        isNavigationLoading: false,
    }

    async componentDidMount() {
        const { userId } = this.props
        fetchMenteeCourseSyllabus()
        fetchStudentCurrentStatus(userId)
        fetchCourseDetails(getCourseId()).call()
        fetchMenteeHomeworkSyllabus(
            null,
            null,
            userId,
            'menteeCompletedFilter',
            'withMenteeToken',
            true
        )
        fetchUserQuizDetails(userId)
        if (window && window.fcWidget) {
            window.fcWidget.show()
        }
    }

    componentDidUpdate = () => {
        const { isLoggedIn, studentCurrentStatus, loggedInUserChat } = this.props
        if (window && window.fcWidget) {
            window.fcWidget.on("widget:opened", () => {
                renderChats({
                    isLoggedIn,
                    studentCurrentStatus,
                    loggedInUser: loggedInUserChat
                })
            })
        }
    }

    componentWillUnmount = () => {
        if (window && window.fcWidget) {
            window.fcWidget.setFaqTags({
                tags: ['unregistered'],
                filterType: 'article'
            })
            window.fcWidget.hide()
        }
    }

    getTopicChapterMapping = () => {
        const { topics } = this.props
        const chapters = {}
        if (topics) {
            topics.toJS().forEach((topic) => {
                chapters[topic.id] = {
                    chapterId: get(topic, 'chapter.id')
                }
            })
        }
        return chapters
    }

    getHomeworkComponents = (sessionTopicId) => {
        if (getCourseName() !== PYTHON_COURSE) {
            let { topics } = this.props
            topics = (topics && topics.toJS()) || []
            const filteredTopic = topics.filter(topic => get(topic, 'id') === sessionTopicId)
            if (filteredTopic && filteredTopic.length) {
                const topicComponentRuleDoc = get(filteredTopic[0], 'topicComponentRule', [])
                return topicComponentRuleDoc.filter(el => homeworkComponents.includes(get(el, 'componentName')))
            }
            return []
        } else {
            return [{ componentName: 'quiz', order: 1 }, { componentName: 'homeworkAssignment', order: 2 }]
        }
    }

    isHomeworkIncluded = (sessionTopicId) => {
        if (getCourseName() !== PYTHON_COURSE) {
            const topicComponentRuleDoc = this.getHomeworkComponents(sessionTopicId)
            let isHomeworkVisible = false
            if (topicComponentRuleDoc && topicComponentRuleDoc.length) {
                topicComponentRuleDoc.forEach(rule => {
                    if (rule && (homeworkComponents.includes(get(rule, 'componentName')))) {
                        isHomeworkVisible = true
                    }
                })
            }
            return isHomeworkVisible
        }
        return true
    }

    getCompletedSessions = () => {
        const { mentorMenteeSession } = this.props
        const completedSessions = []
        if (mentorMenteeSession) {
            mentorMenteeSession.toJS().forEach((session) => {
                if (session && this.isHomeworkIncluded(get(session, 'topic.id'))) {
                    completedSessions.push(session)
                }
            })
        }

        return completedSessions
    }

    getCurrentHomework = () => {
        const completedSessions = this.getCompletedSessions()
        if (completedSessions) {
            const sortedCompletedSessions = sortBy(completedSessions, 'order')
            
            return sortedCompletedSessions[sortedCompletedSessions.length - 1] || {}
        }
        return {}
    }

    getPastHomeWorks = () => {
        const completedSessions = this.getCompletedSessions()
        const pastHomeWorks = {}
        if (completedSessions) {
            const sortedCompletedSessions = sortBy(completedSessions, 'order').map((session, i) => ({ ...session, i: i + 1 }))
            sortedCompletedSessions.forEach((session, index) => {
                const topicChapterMapping = this.getTopicChapterMapping()
                if (index !== sortedCompletedSessions.length - 1 && session.sessionStatus === 'completed') {
                    const chapterId = topicChapterMapping[session.topic.id].chapterId
                    if (pastHomeWorks[chapterId]) {
                        const currentList = pastHomeWorks[chapterId]
                        currentList.push(session)
                        pastHomeWorks[chapterId] = currentList
                    } else {
                        pastHomeWorks[chapterId] = [session]
                    }
                }
            })
        }
        return pastHomeWorks
    }

    handleSolve = (topicId) => {
        if (topicId) {
            if (getCourseName() === PYTHON_COURSE) {
                this.props.history.push(`${HOMEWORK_URL}/${topicId}/quiz`)
            } else {
                const topicComponentRule = this.getHomeworkComponents(topicId)
                if (topicComponentRule && topicComponentRule.length) {
                    if (get(topicComponentRule[0], 'componentName') === 'homeworkAssignment') {
                        this.props.history.push(`${HOMEWORK_URL}/${getCourseId(topicId)}/${topicId}/codingAssignment`)
                        return
                    } else if (get(topicComponentRule[0], 'componentName') === 'homeworkPractice') {
                        const projectId = get(topicComponentRule[0], 'blockBasedProject.id')
                        this.props.history.push(`${HOMEWORK_URL}/${getCourseId(topicId)}/${topicId}/${projectId}/practice`)
                        return
                    }
                }
                this.props.history.push(`${HOMEWORK_URL}/${getCourseId(topicId)}/${topicId}/quiz`)
            }
        }
    }

    shouldShowHomework = () => {
        const { mentorMenteeSession } = this.props
        return this.getCompletedSessions(mentorMenteeSession)
            ? this.getCompletedSessions(mentorMenteeSession).length > 0
            : false
    }

    isPageLoading = () => {
       return false
    }

    sortAscending = (data, path) => {
        return data.sort((a, b) => {
            return a[path] - b[path]
        })
    }

    getSessionData = () => {
        const { menteeCourseSyllabus } = this.props
        const sessions = menteeCourseSyllabus && menteeCourseSyllabus.toJS()[0]
        let bookedSession = []
        if (sessions) {
            bookedSession = get(sessions, 'bookedSession', null) ? this.sortAscending(sessions.bookedSession, ['topicOrder']) : []
        }
        return { bookedSession }
    }

    getTopicQuestionsMeta = (topicId) => {
        if (getCourseName() !== PYTHON_COURSE) {
            let { topics } = this.props
            topics = topics && topics.toJS()
            if (topics && topics.length && topicId) {
                const filteredTopic = topics.filter(topic => topic.id === topicId)[0]
                if (filteredTopic) {
                    const topicQuestionsLength = get(filteredTopic, 'topicQuestions', []).map(el => ({ ...el.question })).filter(el => get(el, 'status') === 'published').length
                    const topicAssignmentLength = get(filteredTopic, 'topicHomeworkAssignmentQuestion', []).map(el => ({ ...el.assignmentQuestion })).length
                    const practiceQuestionsLength = get(filteredTopic, 'topicComponentRule', []).filter(el => get(el, 'componentName') === 'homeworkPractice').length;
                    return {
                        questionsLength: topicQuestionsLength, assignmentsLength: topicAssignmentLength, practiceLength: practiceQuestionsLength
                    }
                }
            }
        }
        return { questionsLength: null, assignmentsLength: null }
    }

    getFirstOrLatestQuizReports = (sortKey = 'asc') => {
        const userQuizDetails = this.props.userQuizDetails && this.props.userQuizDetails.toJS()
        if (userQuizDetails && userQuizDetails.length) {
            const reportByTopicId = {}
            const quizReports = []
            userQuizDetails.forEach(el => {
                if (reportByTopicId[el.topic.id]) {
                    reportByTopicId[el.topic.id].push(el)
                } else {
                    reportByTopicId[el.topic.id] = [el]
                }
            })
            if (reportByTopicId) {
                Object.keys(reportByTopicId).forEach(topicId => {
                    if (reportByTopicId[topicId] && reportByTopicId[topicId].length > 1) {
                        const sortedQuizs = orderBy(reportByTopicId[topicId], (a) => new Date(a.createdAt), [sortKey]) || []
                        quizReports.push(sortedQuizs[0])
                        return
                    }
                    quizReports.push(...reportByTopicId[topicId])
                })
            }
            return quizReports
        }
        return []
    }

    changeTab = (t) => {
        if(t){
            this.setState({currentTab:"linear-gradient(356.11deg, #FAFAFA 4.63%, #E6F7FD 115.51%)"})
        }
        else{
            this.setState({currentTab:"white"})
        }
    }

    render() {
        const newFlow = true
        const userQuizDetails = this.props.userQuizDetails && this.props.userQuizDetails.toJS()
        const userHomeworkStreaks = this.props.userHomeworkStreaks && this.props.userHomeworkStreaks.toJS()
        const userProfiles = this.props.userProfile && this.props.userProfile.toJS()
        const { bookedSession } = this.getSessionData()

        if (this.isPageLoading()) {
            return <TekieLoader />
        }
        if (
            !this.isPageLoading() && false
        ) {
            console.log(this.isPageLoading(),"pageLloadin")
            return (
                <div className={styles.messageContainer}>
                    <CourseNav
                        hasMultipleChildren={this.props.hasMultipleChildren}
                        bookSessionProps={{
                            mentorMenteeSession: this.props.allMentorMenteeSession,
                            batchSession: this.props.batchSession,
                        }}
                        topics={this.props.topics}
                        menteeCourseSyllabus={this.props.menteeCourseSyllabus}
                        courseDetails={this.props.course && this.props.course.toJS()}
                    />
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div className={styles.uhohMsgContainer}>
                            {uhohMessage}
                        </div>
                        <div className={styles.emptyMsgContainer}>
                            {takeSessionMsg}
                        </div>
                    </div>
                </div>
            )
        }

        if (newFlow) {
            if (!isMobile()) {
                return (
                    <div style={{width: "100%", overflow: "hidden", background: '#FAFAFA'}}>
                        <CourseNav
                            hasMultipleChildren={this.props.hasMultipleChildren}
                            bookSessionProps={{
                                mentorMenteeSession: this.props.allMentorMenteeSession,
                                batchSession: this.props.batchSession,
                            }}
                            topics={this.props.topics}
                            menteeCourseSyllabus={this.props.menteeCourseSyllabus}
                            courseDetails={this.props.course && this.props.course.toJS()}
                        />
                        <ChatWidget />
                        {!this.isPageLoading() ? <span className='homework-page-mixpanel-identifier' /> : ''}
                        <div className={styles.currentHomeworkContainer}>
                            <CurrentHomework
                                newFlow={newFlow}
                                {...this.getCurrentHomework()}
                                loggedInUser={this.props.loggedInUser}
                                topics={this.props.topics}
                                userQuizDetails={userQuizDetails}
                                userHomeworkStreaks={userHomeworkStreaks}
                                userProfiles={userProfiles}
                                handleSolve={(topicId) => this.handleSolve(topicId)}
                                allSessions={this.getCompletedSessions()}
                                history={this.props.history}
                                getFirstOrLatestQuizReports={this.getFirstOrLatestQuizReports}
                                isLoading={this.isPageLoading()}
                                getHomeworkComponents={(topicId) => this.getHomeworkComponents(topicId)}
                                getTopicQuestionsMeta={(topicId) => this.getTopicQuestionsMeta(topicId)}
                                bookedSession={bookedSession}
                                bookSessionProps={{
                                    mentorMenteeSession: this.props.allMentorMenteeSession,
                                    batchSession: this.props.batchSession,
                                }}
                                menteeCourseSyllabus={this.props.menteeCourseSyllabus}
                                courseDetails={this.props.course && this.props.course.toJS()}
                            />
                            <div className={styles.pastHomeworkContainer} >
                                <PastHomework
                                    newFlow={newFlow}
                                    startNavigationLoading={() => { this.setState({ isNavigationLoading: true }) }}
                                    stopNavigationLoading={() => { this.setState({ isNavigationLoading: false }) }}
                                    currentHomework={this.getCurrentHomework()}
                                    chapterWisePastHomework={this.getPastHomeWorks()}
                                    topics={this.props.topics}
                                    topicChapterMapping={this.getTopicChapterMapping()}
                                    isLoading={this.isPageLoading()}
                                    loggedInUser={this.props.loggedInUser}
                                    getTopicQuestionsMeta={(topicId) => this.getTopicQuestionsMeta(topicId)}
                                    getHomeworkComponents={(topicId) => this.getHomeworkComponents(topicId)}
                                    handleSolve={(topicId) => this.handleSolve(topicId)}
                                    getFirstOrLatestQuizReports={this.getFirstOrLatestQuizReports}
                                    allSessions={this.getCompletedSessions()}
                                />
                            </div>
                        </div>
                    </div>
                )
            }
            else {
                return (
                    <>
                        
                        <CourseNav
                            hasMultipleChildren={this.props.hasMultipleChildren}
                            bookSessionProps={{
                                mentorMenteeSession: this.props.allMentorMenteeSession,
                                batchSession: this.props.batchSession,
                            }}
                            topics={this.props.topics}
                            menteeCourseSyllabus={this.props.menteeCourseSyllabus}
                            courseDetails={this.props.course && this.props.course.toJS()}
                        />
                        <div>
                        <div className={styles.pastHomeworkContainer}  style={{background:this.state.currentTab}}>
                            <PastHomework
                                newFlow={newFlow}
                                currentHomework={this.getCurrentHomework()}
                                chapterWisePastHomework={this.getPastHomeWorks()}
                                topics={this.props.topics}
                                topicChapterMapping={this.getTopicChapterMapping()}
                                isLoading={this.isPageLoading()}
                                loggedInUser={this.props.loggedInUser}
                                getTopicQuestionsMeta={(topicId) =>
                                    this.getTopicQuestionsMeta(topicId)
                                }
                                getHomeworkComponents={(topicId) =>
                                    this.getHomeworkComponents(topicId)
                                }
                                handleSolve={(topicId) => this.handleSolve(topicId)}
                                getFirstOrLatestQuizReports={
                                    this.getFirstOrLatestQuizReports
                                }
                                allSessions={this.getCompletedSessions()}
                                currentHomeworkProps={{
                                    newFlow: newFlow,
                                    ...this.getCurrentHomework(),
                                    topics: this.props.topics,
                                    userQuizDetails: userQuizDetails,
                                    userHomeworkStreaks: userHomeworkStreaks,
                                    userProfiles: userProfiles,
                                    handleSolve: (topicId) => (
                                    this.handleSolve(topicId)
                                    ),
                                    allSessions: this.getCompletedSessions(),
                                    history: this.props.history,
                                    getFirstOrLatestQuizReports: this
                                    .getFirstOrLatestQuizReports,
                                    isLoading: this.isPageLoading(),
                                    getTopicQuestionsMeta: (topicId) => (
                                    this.getTopicQuestionsMeta(topicId)
                                    ),
                                    bookedSession: bookedSession,
                                    bookSessionProps: {
                                    mentorMenteeSession: this.props
                                        .allMentorMenteeSession,
                                    batchSession: this.props.batchSession,
                                    },
                                }}
                                changeTab={(t)=>{this.changeTab(t)}}
                            />
                        </div>
                        </div>
                    </>
                );
            }
        }
        return (
            <div style={{ width: "100vw", overflow: "hidden" }}>
                <CourseNav
                    hasMultipleChildren={this.props.hasMultipleChildren}
                    bookSessionProps={{
                        mentorMenteeSession: this.props.allMentorMenteeSession,
                        batchSession: this.props.batchSession,
                    }}
                    topics={this.props.topics}
                    menteeCourseSyllabus={this.props.menteeCourseSyllabus}
                    courseDetails={this.props.course && this.props.course.toJS()}
                />
                <ChatWidget />
                {!this.isPageLoading() ? <span className='homework-page-mixpanel-identifier' /> : ''}
                <div className={styles.currentHomeworkContainer}>
                    <CurrentHomework
                        {...this.getCurrentHomework()}
                        loggedInUser={this.props.loggedInUser}
                        topics={this.props.topics}
                        handleSolve={(topicId) => this.handleSolve(topicId)}
                        isLoading={this.isPageLoading()}
                        history={this.props.history}
                    />
                </div>
                <div className={styles.pastHomeworkContainer}>
                    <PastHomework
                        chapterWisePastHomework={this.getPastHomeWorks()}
                        topics={this.props.topics}
                        topicChapterMapping={this.getTopicChapterMapping()}
                        isLoading={this.isPageLoading()}
                        history={this.props.history}
                        loggedInUser={this.props.loggedInUser}
                    />
                </div>
            </div>
        )
    }
}

export default Homework
