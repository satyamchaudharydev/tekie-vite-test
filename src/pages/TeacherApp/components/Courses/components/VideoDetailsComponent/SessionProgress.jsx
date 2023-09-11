import React,{useState, useEffect} from "react"
import "./SessionProgress.scss"
import { get } from 'lodash'
import RatioIcon from "../../../../../../assets/teacherApp/classroom/Ratio.svg"
import i from "../../../../../../assets/i.svg"
import TimerIcon from "../../../../../../assets/teacherApp/classroom/Timer.svg"
import BookIcon from "../../../../../../assets/teacherApp/classroom/book-outline.svg"
import { getDuration } from "../../../../../../utils/time/getDuration"
import fetchPrevSessions from "../../../../../../queries/teacherApp/classDetailPage/fetchPrevSessions"


const SessionProgress = ({start , setStart ,started , setStarted , ended,setEnded, session,batchId,setRoute,clicker}) =>{
    const[totalStudents, setTotalStudents] = useState(0)
    const[stuentsPresent, setStudentsPresent] = useState(0)
    const[otp,setOtp] = useState('')
    const[homework, setHomework] = useState(0)
    const[duration, setDuration] = useState({
        hour: '00',
        min: '00',
        sec: '00'
    })

    useEffect(() => {
        setOtp(get(session, 'sessionOtp[0].otp', ''))
        if(session !== undefined && session.attendance) {
            setTotalStudents(session.attendance.length)
            if(session.sessionStatus === 'completed'){
                let obj = getDuration(session.sessionStartDate, new Date().toISOString())
                if(obj.hour <= 9){
                    obj.hour = `0${obj.hour}`
                }
                if(obj.min <= 9){
                    obj.min = `0${obj.min}`
                }
                if(obj.sec <= 9){
                    obj.sec = `0${obj.sec}`
                }
                setDuration(obj)
            }else if(session.sessionStatus === 'started'){
                let obj = getDuration(session.sessionStartDate, new Date().toISOString())
                if(obj.hour <= 9){
                    obj.hour = `0${obj.hour}`
                }
                if(obj.min <= 9){
                    obj.min = `0${obj.min}`
                }
                if(obj.sec <= 9){
                    obj.sec = `0${obj.sec}`
                }
                setDuration(obj)
            }
            let present = 0
            for(let i=0;i<session.attendance.length;i++){
                if(session.attendance[i].isPresent === true){
                    present += 1
                }
            }
            setStudentsPresent(present)
             fetchPrevSessions(batchId,session.bookingDate).then(res => {
                const obj = res.getNextOrPrevClassroomSessions
                if(get( res.getNextOrPrevClassroomSessions, 'obj[0].sessions.length',0) > 0){
                    const prevSession = obj[0].sessions
                    setHomework(prevSession.completedHomeworkMeta)
                }else{
                    setHomework(0)
                }
            })
        }
    },[session])

    // const
    // useEffect(async() => {
    //     await fetchPrevSessions(batchId,session.bookingDate).then(res => {
    //         const obj = res.getNextOrPrevClassroomSessions
    //         if(obj[0].sessions.length > 0){
    //             const prevSession = obj[0].sessions
    //             console.log('prevSession', prevSession)
    //             setHomework(prevSession.completedHomeworkMeta)
    //         }else{
    //             setHomework(0)
    //         }
    //     })
    // },[])
    return <>
        <section class="session_progress_container">
            <div class="session_progress_heading">Session Progress:</div>
            <div style={{display: 'flex'}}>
               <div style={{display: 'flex',marginRight: session.sessionStatus === 'started' ? '31px' : '61px'}}>
                    <img className="session_icon" style={{marginRight:"10px"}}src={TimerIcon} />
                    <div>
                        <div className="sessions_heading1">Duration</div>
                        <div className="sessions_heading2">{`${duration.hour}:${duration.min}:${duration.sec}`}</div>
                    </div>
               </div>
               <div style={{display: 'flex', marginRight: session.sessionStatus === 'started' ? '31px' : '61px' }}>
                    <img className="session_icon"  style={{marginRight:"10px"}}src={RatioIcon} />
                    <div>
                        <div className="sessions_heading1">Attendance</div>
                        <div className="sessions_heading2">
                        {stuentsPresent} /{totalStudents}
                        </div>
                    </div>
               </div>
               <div style={{display: 'flex', marginRight: session.sessionStatus === 'started' ? '31px' : '61px'}}>
                    <img className="session_icon"  style={{marginRight:"10px"}}src={BookIcon} />
                    <div>
                        {session.sessionStatus === 'completed' ? (
                            <>
                            <div  className="sessions_heading1">Homework Status</div>
                        <div className="sessions_recording" onClick={() => {
                            setRoute("Homework")
                            clicker(2)}}>
                            View Details
                        </div></>
                        ): (
                            <><div className="sessions_heading1">Prev. Homework done</div>
                            <div className="sessions_heading2">
                                {homework} /{totalStudents}
                            </div></>
                        )}
                    </div>
               </div>
               {session.sessionStatus === 'started' && otp !== '' && (
                   <div style={{display: 'flex', marginRight: '0px'}}>
                        <div className="sessions_star">***</div>
                        <div>
                            <div className="sessions_heading1">OTP</div>
                            <div className="sessions_heading2" style={{display: 'flex'}}>{otp}<img  className="sessions_otpImg" src={i} alt='i'/>
                            </div>
                        </div>
                    </div>
               )}
           </div>
        </section>
    
    </>
}
export default SessionProgress