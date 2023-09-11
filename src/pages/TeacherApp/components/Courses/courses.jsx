import React,{useState, useEffect} from "react"
import CoursesHeading from "./components/CourseHeading"
import VideosContainer from "./components/VideosContainer"
import VideoDetails from "./components/videoDetails"
import LoadingSpinner from "../Loader/LoadingSpinner"
import ContentLoader from "react-content-loader"
// import LiveStudentTable from "./components/LiveStudentTable"
import "./courses.scss"
import { get } from "lodash"

const  CoursesPage = ({sessions, batchId, getUpdatedBatchSession,selectedSession,
        setSelectedSession,setCustomSessionLink,sessionIndex, classroomDetailStatus,loading,
        setRoute, setSessionIndex,students,tags,customSessionLink,clicker,getClasroomDetail, setIsRescheduleModalVisible}) => {
    const[totalSessions, setTotalSessions] = useState(0)

    useEffect(() => {
        setTotalSessions(sessions.length)
    }, [sessions])
    return <>
    
     <div class="session_container_main">
         {get(classroomDetailStatus,'loading') === true ? (
             <div>
                 <LoadingSpinner left={'5%'} top={'2%'} height={'30px'} width={'30px'}/>
                <ContentLoader
                    speed={2}
                    width={1340}
                    height={394}
                    viewBox="0 0 340 84"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                    >
                    <rect x="10" y="0" rx="3" ry="3" width="97" height="25" />
                    <rect x="135" y="0" rx="3" ry="3" width="25" height="25" />
                    <rect x="165" y="0" rx="3" ry="3" width="20" height="6" />
                    <rect x="165" y="10" rx="3" ry="3" width="30" height="6" />
                    <rect x="165" y="20" rx="3" ry="3" width="40" height="6" />
                    <rect x="135" y="40" rx="3" ry="3" width="30" height="9" />
                    <rect x="185" y="40" rx="3" ry="3" width="30" height="9" />
                    <rect x="235" y="40" rx="3" ry="3" width="30" height="9" />
                    <rect x="10" y="35" rx="3" ry="3" width="97" height="25" />
                    <rect x="10" y="70" rx="3" ry="3" width="97" height="25" />
                </ContentLoader>
             </div>
         ): (
            <>
            <CoursesHeading totalSessions={totalSessions} />
                <div style={{marginBottom:"50px"}} className="display_grid">
                <div class="video_container_scroll"><VideosContainer sessions={sessions} setSelectedSession={setSelectedSession} setSessionIndex={setSessionIndex} sessionIndex={sessionIndex} selectedSession={selectedSession} /></div> 
                {sessionIndex !== -1 && (
                    <>
                        {
                            loading ? (
                                <ContentLoader
                                    speed={2}
                                    width={1340}
                                    height={394}
                                    viewBox="0 0 340 84"
                                    backgroundColor="#f3f3f3"
                                    foregroundColor="#ecebeb"
                                    >
                                    <rect x="135" y="0" rx="3" ry="3" width="25" height="25" />
                                    <rect x="165" y="0" rx="3" ry="3" width="20" height="6" />
                                    <rect x="165" y="10" rx="3" ry="3" width="30" height="6" />
                                    <rect x="165" y="20" rx="3" ry="3" width="40" height="6" />
                                    <rect x="135" y="40" rx="3" ry="3" width="30" height="9" />
                                    <rect x="185" y="40" rx="3" ry="3" width="30" height="9" />
                                    <rect x="235" y="40" rx="3" ry="3" width="30" height="9" />
                                </ContentLoader>
                            ): (
                                <div class="video_container_scroll1"><VideoDetails setIsRescheduleModalVisible={setIsRescheduleModalVisible} getClasroomDetail={getClasroomDetail} setRoute={setRoute} setCustomSessionLink={setCustomSessionLink} customSessionLink={customSessionLink} tags={tags} students={students} sessions={sessions} selectedSession={selectedSession} sessionIndex={sessionIndex} batchId={batchId} getUpdatedBatchSession={getUpdatedBatchSession} clicker={clicker}/></div>
                            )
                        }
                    </>
                )}
            </div>
            </>
         )}
     {/* <LiveStudentTable /> */}
     </div>
    </>
}


export default CoursesPage