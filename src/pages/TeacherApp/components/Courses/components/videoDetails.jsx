import React,{useState, useEffect} from "react"
import "./videoDetails.scss"
import VideoDetailsTitle from "./VideoDetailsComponent/VideoDetailsTitle"
import SessionProgress from "./VideoDetailsComponent/SessionProgress"
import InviteLink from "./VideoDetailsComponent/InviteLink"
import SessionsDetails from "./VideoDetailsComponent/SessionDetails"

const VideoDetails = ({selectedSession, sessionIndex, batchId, getUpdatedBatchSession, sessions, students, tags, customSessionLink, setCustomSessionLink, setRoute,clicker,getClasroomDetail, setIsRescheduleModalVisible}) => {

    const [start , setStart] = useState(true)
    const [started , setStarted] = useState(false)
    const [ended , setEnded] = useState(false)
    const[sessionStatus,setSessionStatus] = useState('')
    useEffect(() => {
        if(selectedSession){
            setSessionStatus(selectedSession.sessionStatus)
        }
    }, [selectedSession, sessionIndex, sessions])
    return <>
    <VideoDetailsTitle setIsRescheduleModalVisible={setIsRescheduleModalVisible} getClasroomDetail={getClasroomDetail} customSessionLink={customSessionLink} sessions={sessions} session={selectedSession} sessionIndex={sessionIndex} getUpdatedBatchSession={getUpdatedBatchSession} setEnded={setEnded} sessionStatus={sessionStatus}/>
    {selectedSession && selectedSession.sessionStatus === 'allotted' && <>
        <InviteLink selectedSession={selectedSession} customSessionLink={customSessionLink} batchId={batchId} setCustomSessionLink={setCustomSessionLink} />
        <SessionsDetails getUpdatedBatchSession={getUpdatedBatchSession} session={selectedSession} students={students} tags={tags} />
    </>}

    {selectedSession && selectedSession.sessionStatus === 'started' && <>
    <SessionProgress sessions={sessions} session={selectedSession} start={start} setStart={setStart} started={started} setStarted={setStarted} ended={ended} setEnded={setEnded} batchId={batchId} sessionStatus={sessionStatus} clicker={clicker}/>
        <InviteLink selectedSession={selectedSession} customSessionLink={customSessionLink} batchId={batchId} setCustomSessionLink={setCustomSessionLink}/>
        <SessionsDetails getUpdatedBatchSession={getUpdatedBatchSession} session={selectedSession} students={students} tags={tags} />
    </>}
    {selectedSession && selectedSession.sessionStatus === 'completed' && <>
        <SessionsDetails getUpdatedBatchSession={getUpdatedBatchSession} session={selectedSession} students={students} tags={tags} />   
        <SessionProgress sessions={sessions} setRoute={setRoute} session={selectedSession} start={start} setStart={setStart} started={started} setStarted={setStarted} ended={ended} setEnded={setEnded} batchId={batchId} sessionStatus={sessionStatus} clicker={clicker}/>
    </>}
    </>
}

export default VideoDetails