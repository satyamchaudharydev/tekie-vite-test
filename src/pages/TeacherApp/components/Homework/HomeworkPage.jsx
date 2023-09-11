import React from "react"
import "./HomeworkPage.scss"
import fetchClassroomDetail from "../../../../queries/teacherApp/classDetailPage/fetchClassroomDetail"
import fetchClassroomBatchesWithId from '../../../../queries/teacherApp/getClassroomBatchesWithId'
import HomeworkGraph from "./components/HomeworkGraph"
// import HomeworkSelectStudent from "./components/HomeworkSelectStudent"
// import HomeworkTable from "./components/HomeworkSelectTable"
import QuizComponent from "./components/HomeworkCollapsible"
import Course from "../Classroom/ClasroomDetail/components/CourseDetail/Course"
import TabSwitch from "./components/TabSwitch.js"
import CoursesPage from "../Courses/courses"
import RecordingPage from "../Recordings"
import {get} from 'lodash'
import {Link} from 'react-router-dom'
import LoadingSpinner from "../Loader/LoadingSpinner"
import getHomework from "../../../../queries/teacherApp/fetchHomeworkData"
import Homes from "./Qss"
import ReScheduleSessionModal from "../../pages/TimeTable/components/ReScheduleSessionModal/ReScheduleSessionModal"
import CreateSessionModal from '../../pages/TimeTable/components/CreateSessionModal/CreateSessionModal'

class HomeworkPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            clicked: false,
            route: "Courses",
            classroomDetail: {},
            courseDetail: {},
            sessions: [],
            batchId: "",
            prevSessions: [],
            updatedbatchSession: {},
            selectedSession: {},
            sessionIndex: 0,
            students: 0,
            tags: [],
            customSessionLink: '',
            classroomDetailStatus: {},
            idTopic:"",
            userArray:[],
            topicComponentRule:[],
            selectStudent:{},
            loggedInUser: '',
            loading: false,
            reviewStatus: {},
            classroomTitle: '',
            mentorName: '',
            grade: '',
            courseTitle: '',
            showAddSessionModal: false,
            classroomCourseId: false,
            currentCourseTopics: 0,
            queryValue: '',
            isRescheduleModalVisible: false
        }
    }
 
    async componentDidMount() {
        const queryParams = new URLSearchParams(window.location.search);
        const id = queryParams.get('id');
        this.setState({batchId: id})
        await fetchClassroomDetail(id)
    }
    showAddSessionModalHandler = () => {
        const current = this.state.showAddSessionModal
        this.setState({showAddSessionModal: true})
    }

    setIsRescheduleModalVisible = (status) => {
        this.setState({isRescheduleModalVisible: status})
    }
    setClassRoomCourseId = (id) => {
        this.setState({classRoomCourseId: id})
    }
    getUpdatedBatchSession = (session) => {
        this.setState({updatedbatchSession: session})
    }
    setSelectedSession = (session) => {
        this.setState({selectedSession: session})
    }
    setCustomSessionLink = (link) => {
        this.setState({customSessionLink: link})
    }
    setSessionIndex = (index) => {
        this.setState({sessionIndex: index})
    }

    getClasroomDetail = async() => {
        const queryParams = new URLSearchParams(window.location.search);
        const id = queryParams.get('id');
        this.setState({batchId: id})
        await fetchClassroomDetail(id)
    }

    setCurrentCourseTopics = (topics) => {
        this.setState({currentCourseTopics: topics})
    }

    // fetchTopicHandler = async () => {
    //     const { location } = this.props.history
    //     const query = new URLSearchParams(location.search)
    //     let currentOrder = await fetchClassroomBatchesWithId(query)
    //     currentOrder = get(currentOrder, 'classrooms[0].currentComponent.currentTopic.order', 1)
    //     let { topics } = await getCourseTopics(this.state.classroomCourseId, currentOrder)
    //     this.setCurrentCourseTopics(topics)
    // }

    setShowAddSessionsModal = (status) => {
        this.setState({showAddSessionModal: status})
    }
 
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.classroomDetail !== this.props.classroomDetail) {
            const classroomDetail = this.props.classroomDetail && this.props.classroomDetail.toJS()
            this.setState({classroomTitle: get(classroomDetail, 'classroomData.classroomTitle')})
            this.setState({ classroomDetail: classroomDetail, sessions:classroomDetail.sessions, selectedSession: classroomDetail.sessions[0],
                students: classroomDetail.classroomData.students.length,customSessionLink:classroomDetail.customSessionLink,
                courseTitle: classroomDetail.classroomCourse.title, classroomCourseId: classroomDetail.classroomCourse.id })
            const loggedInUser = this.props.loggedInUser && this.props.loggedInUser.toJS()
            this.setState({mentorName: get(loggedInUser[0], 'name', '')})
            const tags = []
            if(classroomDetail.classroomCourse){
                if(get(classroomDetail, 'classroomCourse.theory.length', 0) > 0){
                    tags.push('theory')
                }if(get(classroomDetail, 'classroomCourse.tools.length', 0) > 0){
                    tags.push('tools')
                }if(get(classroomDetail, 'classroomCourse.programming.length', 0) > 0){
                    tags.push('programming')
                }
                this.setState({tags: tags})
            }
            if(classroomDetail && classroomDetail.sessions){
                let selectedSession = {}
                let index = -1
                const sessions = classroomDetail.sessions
                for(let i=0;i<sessions.length;i++){
                    const session = sessions[i]
                    if(session.sessionStatus === 'started'){
                        index = i
                        selectedSession = session
                        
                        break;
                    }else if(session.sessionStatus === 'completed'){
                        index = i
                        selectedSession = session
                    }else if(session.sessionStatus === 'allotted'){
                        break
                    }
                }
                this.setSessionIndex(index)
                this.setSelectedSession(selectedSession)
            }
        }
        if (prevProps.prevSessions !== this.props.prevSessions) {
            const prevSessions = this.props.prevSessions && this.props.prevSessions.toJS()
            this.setState({ prevSessions: prevSessions })
           
        }
        if (prevProps.sessionLink !== this.props.sessionLink) {
            const sessionLink = this.props.sessionLink && this.props.sessionLink.toJS()
            this.setState({ customSessionLink: sessionLink })
           
        }
        if (prevProps.reviewStatus !== this.props.reviewStatus) {
            const reviewStatus = this.props.reviewStatus && this.props.reviewStatus.toJS()
            this.setState({reviewStatus: reviewStatus})
        }
        if (prevProps.loggedInUser !== this.props.loggedInUser) {
            const loggedInUser = this.props.loggedInUser && this.props.loggedInUser.toJS()
            this.setState({ loggedInUser: loggedInUser[0].id })
        }
        if (prevProps.batchSessions !== this.props.batchSessions) {
            const batchSessions = this.props.batchSessions && this.props.batchSessions.toJS()
            this.setState({ batchSessions: batchSessions })
            
        }
        if (prevProps.classroomDetailStatus !== this.props.classroomDetailStatus) {
            const classroomDetailStatus = this.props.classroomDetailStatus && this.props.classroomDetailStatus.toJS()
            this.setState({ classroomDetailStatus: classroomDetailStatus })
        }
        if(prevState.updatedbatchSession !== this.state.updatedbatchSession){
            this.setState({loading: true})
            if(this.state.updatedbatchSession && this.state.updatedbatchSession.sessionRecordingLink){
                for(let i=0;i<this.state.sessions.length;i++){
                    let session = this.state.sessions[i]
                    if(session.id === this.state.updatedbatchSession.id){
                        if(this.state.updatedbatchSession.sessionRecordingLink !== null){
                            session.sessionRecordingLink = this.state.updatedbatchSession.sessionRecordingLink
                            let sessions = this.state.sessions
                            sessions[i] = session
                            this.setState({sessions: sessions, selectedSession : session, sessionIndex: i})
                            
                            break
                        }
                    }
                }
            }else{
                for(let i=0;i<this.state.sessions.length;i++){
                    let session = this.state.sessions[i]
                    if(get(session, 'id') === get(this.state.updatedbatchSession, 'id')){
                        session.sessionStatus = this.state.updatedbatchSession.sessionStatus
                        if(this.state.updatedbatchSession.sessionStartDate !== null){
                            session.sessionStartDate = this.state.updatedbatchSession.sessionStartDate
                        }
                        if(this.state.updatedbatchSession.sessionEndDate !== null){
                            session.sessionEndDate = this.state.updatedbatchSession.sessionEndDate
                        }
                        if(this.state.updatedbatchSession.sessionEndDate !== null){
                            session.sessionEndDate = this.state.updatedbatchSession.sessionEndDate
                        }
                        let sessions = this.state.sessions
                        sessions[i] = session
                        this.setState({sessions: sessions, selectedSession : session, sessionIndex: i})
                        
                    }
                }
            }
            this.setState({loading: false})
        }
    }
    setRoute = (route) => {
        
        this.setState({route: route})
    }
    setClicked = (clicked) => {
        this.setState({clicked: clicked})
    }

    clicker(value,route){
        let tabIndicator = document.querySelector(".animation");
        let tabsPane= document.querySelectorAll(".tab_switch_individual_container");
        
        
        if(route){this.setRoute(route)}
        
        
        for(let i=0; i<tabsPane.length;i++){
            
    
            if(tabsPane[i].classList.contains("active")){
                tabsPane[i].classList.remove("active")
            } 
            if(value === i){
                tabsPane[i].classList.add("active")
            }
            if(value === i){
                
                if(i===0){
                    tabIndicator.style.width = "32%"
                    tabIndicator.style.left = "0px"
                }
                if(i===1){
                    tabIndicator.style.width = "23%"
                    tabIndicator.style.left = "39.3%"
    
                }
                if(i===2){
                    tabIndicator.style.width = "23%"
                    tabIndicator.style.left = "69.2%"
                }
            }
        }
    }


    
    render(){
        const { clicked, route, classroomDetail, sessions,batchId,selectedSession,
                sessionIndex,students, tags,customSessionLink,classroomDetailStatus,
                loggedInUser,loading,reviewStatus,mentorName,classroomTitle,courseTitle
            } = this.state
            let tabIndicator = document.querySelector(".animation");
            let tabsPane= document.querySelectorAll(".tab_switch_individual_container");
        return(
            <>
                {this.state.showAddSessionModal && <CreateSessionModal src="classDetail"
                getClasroomDetail={this.getClasroomDetail}
                classroomCourseId={this.state.classroomCourseId}
                // currentCourseTopics={this.state.currentCourseTopics}
                classroomId={batchId}
                fromCoursePage
                setIsCreateSessionModalVisible={this.setShowAddSessionsModal}
                isCreatingSession={this.props.isCreatingSession}
                hasCreatedSession={this.props.hasCreatedSession}
                addClassRoomSessionErrorMessage={this.props.addClassRoomSessionErrorMessage}
                addClassroomSessionErrorList={this.props.addClassroomSessionErrorList} />} 

                {this.state.isRescheduleModalVisible && <ReScheduleSessionModal getClasroomDetail={this.getClasroomDetail} src="classDetail" classroomId={get(selectedSession, 'id', '')} documentType={get(selectedSession, 'documentType', '')} setIsRescheduleModalVisible={this.setIsRescheduleModalVisible} 
                isCreatingSession={get(this.props, 'isCreatingSession')} hasCreatedSession={get(this.props, 'hasCreatedSession')} addClassRoomSessionErrorMessage={get(this.props, 'addClassRoomSessionErrorMessage')} addClassroomSessionErrorList={get(this.props, 'addClassroomSessionErrorList')} />}

<div className="homework_main"> 
                <div className='home'>
                    <Link className='link' to={'/teacher/classrooms'} style={{cursor: 'pointer'}}>Home</Link> 
                    {'>'}
                    <Link className='link1' to={`/classroom/?id=${batchId}`} style={{cursor: 'pointer'}}>{classroomTitle}</Link>
                    {'>'}
                    <span className='link1' style={{cursor: 'pointer'}}>{courseTitle}</span>
                </div>
                <Course getClasroomDetail={this.getClasroomDetail} classroomDetail={classroomDetail} showAddSessionModalHandler={this.showAddSessionModalHandler} />

<section class="tab_switch">
            <div onClick={()=>this.clicker(0,"Courses")} class="tab_switch_individual_container active"> Course Progress</div>
            <div onClick={()=>this.clicker(1,"Recording")} class="tab_switch_individual_container">Recordings</div>
            <div onClick={()=>this.clicker(2,"Homework")} class="tab_switch_individual_container"> Homework</div>
            <div class="animation"></div>
        </section>
                {
                            route === "Homework" ? 
                        <Homes sessions={sessions} loggedInUser={loggedInUser} props={this.props} reviewStatus={reviewStatus} mentorName={mentorName} classroomTitle={classroomTitle} route={route}/>   :"" 
                
                }
                

                {<div style={route === "Courses" ? {display:"block"} : {display:"none"}}>
                    <CoursesPage sessions={sessions} batchId={batchId} getUpdatedBatchSession={this.getUpdatedBatchSession}
                    selectedSession={selectedSession} sessionIndex={sessionIndex}
                    tags={tags}
                    loading={loading}
                    setSessionIndex={this.setSessionIndex}
                    students={students}
                    customSessionLink={customSessionLink}
                    classroomDetailStatus={classroomDetailStatus}
                    setCustomSessionLink={this.setCustomSessionLink}
                    setRoute={this.setRoute}
                    clicker={this.clicker}
                    setSelectedSession={this.setSelectedSession}
                    getClasroomDetail={this.getClasroomDetail}
                    setIsRescheduleModalVisible={this.setIsRescheduleModalVisible}
                    />
                    </div>}
                    {route === "Recording" ? <RecordingPage /> : ""}
                
               
            </div>
            </>
        )
    }
}

export default HomeworkPage