import React from 'react'
import fetchClassroomDetail from '../../../../../queries/teacherApp/classDetailPage/fetchClassroomDetail'
import fetchNotices from '../../../../../queries/teacherApp/classDetailPage/fetchNotices'
import fetchUpcomingSessions from '../../../../../queries/teacherApp/classDetailPage/fetchUpcomingSessions'
import ClassDetail from './components/ClassDetail/ClassDetail'
import Updates from './components/Updates/Updates'
import NoticeBoard from './components/NoticeBoard/NoticeBoard'
import CourseDetail from './components/CourseDetail/CourseDetail'
import Students from './components/Students/Students'
import styles from './ClassroomDetail.module.scss'
import {Link} from 'react-router-dom'
import {get} from 'lodash'

class ClassroomDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentView: 'Updates',
            upcomingSessions: [],
            notices: [],
            classroomDetail: {},
            studentReviews: [],
            students: 0,
            studentsArr: [],
            batchId: '',
            loggedInUser: '',
            upcomingSessionStatus: {},
            schoolId: '',
            mentorName: '',
            noticeStatus:{},
            reviewStatus:{},
            grade: ''
        }
    }
    async componentDidMount() {
        const queryParams = new URLSearchParams(window.location.search);
        const id = queryParams.get('id');
        this.setState({batchId: id})
        await fetchClassroomDetail(id)
        await fetchUpcomingSessions(id).then(res => {
            const obj = res.getNextOrPrevClassroomSessions
            if(obj){
                const sessions = obj[0].sessions
                this.setState({ upcomingSessions: sessions })
            }
        })
        await fetchNotices(id)
    }
    componentDidUpdate(prevProps) {
        if (prevProps.notices !== this.props.notices) {
            const notices = this.props.notices && this.props.notices.toJS()
            this.setState({ notices: notices })
        }
        if (prevProps.classroomDetail !== this.props.classroomDetail) {
            const classroomDetail = this.props.classroomDetail && this.props.classroomDetail.toJS()
            this.setState({ classroomDetail: classroomDetail, students: classroomDetail.classroomData.students.length, studentsArr: classroomDetail.classroomData.students, grade: classroomDetail.classroomData.classroomTitle })  
        }
        if (prevProps.upcomingSessionsStatus !== this.props.upcomingSessionsStatus) {
            const upcomingSessionsStatus = this.props.upcomingSessionsStatus && this.props.upcomingSessionsStatus.toJS()
            this.setState({upcomingSessionStatus: upcomingSessionsStatus})
        }
        if (prevProps.noticeStatus !== this.props.noticeStatus) {
            const noticeStatus = this.props.noticeStatus && this.props.noticeStatus.toJS()
            this.setState({noticeStatus: noticeStatus})
        }
        if (prevProps.reviewStatus !== this.props.reviewStatus) {
            const reviewStatus = this.props.reviewStatus && this.props.reviewStatus.toJS()
            this.setState({reviewStatus: reviewStatus})
        }
        if (prevProps.upcomingSessions !== this.props.upcomingSessions) {
            const upcomingSessions = this.props.upcomingSessions && this.props.upcomingSessions.toJS()
        }
        if (prevProps.studentReviews !== this.props.studentReviews) {
            const studentReviews = this.props.studentReviews && this.props.studentReviews.toJS()
            this.setState({ studentReviews: studentReviews })
        }
        if (prevProps.loggedInUser !== this.props.loggedInUser) {
            const loggedInUser = this.props.loggedInUser && this.props.loggedInUser.toJS()
            this.setState({ loggedInUser: get(loggedInUser, '[0].id'), mentorName: get(loggedInUser, '[0].name', '')})
            if(loggedInUser && loggedInUser.length > 0){
                this.setState({schoolId: get(loggedInUser,'[0].mentorProfile.schools[0].id', '')})
            }
        }
    }
    setCurrentView = (view) => {
        this.setState({ currentView: view })
    }
    render() {
        const { currentView, upcomingSessions, notices, classroomDetail,upcomingSessionStatus,grade,
            students, studentsArr, batchId, loggedInUser, schoolId,noticeStatus, mentorName,reviewStatus } = this.state
        return (
            <div className={styles.main}>
                <div className={styles.home}><Link className={styles.link} to={'/teacher/classrooms'} style={{cursor: 'pointer'}}>Home</Link> {'>'} {grade}</div>
                <ClassDetail upcomingSession={upcomingSessions[0]} classroomDetail={classroomDetail} batchId={batchId} />
                <div className={styles.flexBox1}>
                    <div>
                        <div className={currentView === 'Updates' ? styles.tab : styles.tabInactive} onClick={() => this.setCurrentView('Updates')}>
                            Updates
                        </div>
                        {currentView === 'Updates' && <div className={styles.underline} />}
                    </div>
                    <div>
                        <div className={currentView === 'Courses' ? styles.tab : styles.tabInactive} onClick={() => this.setCurrentView('Courses')}>
                            Courses<span style={{paddingLeft: '4px'}}>(1)</span>
                        </div>
                        {currentView === 'Courses' && <div className={styles.underline} />}
                    </div>
                    <div>
                        <div className={currentView === 'Students' ? styles.tab : styles.tabInactive} onClick={() => this.setCurrentView('Students')}>
                            Students<span style={{paddingLeft: '4px'}}>({students})</span>
                        </div>
                        {currentView === 'Students' && <div className={styles.underline} />}
                    </div>
                </div>
                {currentView === 'Updates' &&
                    <div>
                        <Updates upcomingSessions={upcomingSessions} upcomingSessionStatus={upcomingSessionStatus} />
                        <div className={styles.notice}>
                            <NoticeBoard noticeStatus={noticeStatus} mentorName={mentorName} students={studentsArr} notices={notices} batchId={batchId} loggedInUser={loggedInUser} />
                            {/* <div className={styles.divider}></div>
                            <StudentFeed /> */}
                        </div>
                    </div>
                }
                {currentView === 'Courses' && <CourseDetail classroomDetail={classroomDetail} batchId={batchId} />}
                {currentView === 'Students' && <Students reviewStatus={reviewStatus} mentorName={mentorName} classroomDetail={classroomDetail} loggedInUser={loggedInUser} batchId={batchId} schoolId={schoolId} />}
            </div>
        )
    }
}

export default ClassroomDetail