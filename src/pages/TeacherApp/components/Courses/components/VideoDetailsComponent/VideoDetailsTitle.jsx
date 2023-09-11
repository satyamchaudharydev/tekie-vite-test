import React,{useState, useEffect} from "react"
import "./VideoDetailsTitle.scss"
import getPath from "../../../../../../utils/getPath"
import moment from "moment"
import getSlotLabel from "../../../../../../utils/slots/slot-label"
import updateBatchSessionStatus from '../../../../../../queries/teacherApp/courseDetailPage/updateSessionStatus'
import updateAdhocSession from '../../../../../../queries/teacherApp/courseDetailPage/updateAdhocSession'
import ImageVideo from "../../../../../../assets/teacherApp/classroom/videoImage.svg"
import i from "../../../../../../assets/i.svg"
import clock from '../../../../../../assets/teacherApp/classDetail/Time.svg'
import CloseIcon from "../../../../../../assets/teacherApp/classroom/close.svg"
import PlayIcon from "../../../../../../assets/teacherApp/classroom/play-outline.svg"
import ClockIcon from "../../../../../../assets/teacherApp/classroom/time-outline (1).svg"
import FeedbackIcon from "../../../../../../assets/teacherApp/classroom/Feedback.svg"
import live from '../../../../../../assets/live.png'
import { Link } from "react-router-dom"
import {get} from 'lodash'
import ReScheduleSessionModal from '../../../../pages/TimeTable/components/ReScheduleSessionModal/ReScheduleSessionModal'
import { withHttps } from "../../../../../EventLandingPage/constants"
import { connect } from "react-redux"

const  VideoDetailsTitle = ({ session, sessionIndex, getUpdatedBatchSession,sessions, customSessionLink,getClasroomDetail,setIsRescheduleModalVisible, ...props}) =>{
    const[title,setTitle] = useState('')
    const[sessionDate,setSessionDate] = useState('')
    const[otp,setOtp] = useState('')
    const[topicImg,setTopicImg] = useState('')
    const[startTime, setStartTime] = useState('')
    const[endTime, setEndTime] = useState('')
    const [isLive, setIsLive] = useState(false)
    const [sessionStatus, setSessionStatus] = useState(get(session, 'sessionStatus'))

    
    useEffect(() => {
        if(session !== undefined && session ) {
            const options = { appendMinutes: true }
            let startT = ''
            let endT = ''
            for(let i=0;i<24;i++){
                if(session[`slot${i}`] === true){
                    const time = getSlotLabel(i, options)
                    startT = time.startTime
                    endT= time.endTime
                    setStartTime(startT)
                    setEndTime(endT)
                }
            }
            // setSessionTime(moment(session.bookingDate).format("ddd DD MMM"))
            // setSessionTime(moment(session.bookingDate).format("ddd DD MMM"))
            setSessionDate(moment(session.bookingDate).format("ddd, DD MMM"))
            if(session.documentType === "adhocSession"){
                setTitle(get(session,'previousTopic.title'))
            }else if(session.documentType === "batchSession"){
                setTitle(get(session,'topic.title'))
            }
            if(getPath(get(session, 'topic.thumbnailSmall.uri', '')) !== ''){
                setTopicImg(getPath(get(session, 'topic.thumbnailSmall.uri', '')))
            }else{
                setTopicImg(getPath('python/clasroomThumbnail_1.png'))
            }
            if(session.sessionStatus === 'started'){
                const today = new Date()
                const live =  moment(today).isBetween(startT, endT)
                setIsLive(live)
            } 
        }
        setSessionStatus(get(session, 'sessionStatus'))
        setOtp(get(session, 'sessionOtp[0].otp', ''))
    },[session, sessionIndex, sessions])


    useEffect(() => {
        if(session !== undefined && session && session.topic) {
            const options = { appendMinutes: true }
            let startT = ''
            let endT = ''
            for(let i=0;i<24;i++){
                if(session[`slot${i}`] === true){
                    const time = getSlotLabel(i, options)
                    startT = time.startTime
                    endT= time.endTime
                    setStartTime(startT)
                    setEndTime(endT)
                }
            }
            setSessionDate(moment(session.bookingDate).format("ddd, DD MMM"))            
        }
    }, [])

    const startSession = () => {
        const input = {
            sessionStatus: "started",
            sessionStartDate: new Date().toISOString()
        }
        if(get(session, 'documentType','') === 'batchSession' ){
            updateBatchSessionStatus(session.id,input).then(res => {
                getUpdatedBatchSession(res.updateBatchSession)
                setSessionStatus('started')
            })
        }else if(get(session, 'documentType','') === 'adhocSession' ){
            updateAdhocSession(session.id,input).then(res => {
                getUpdatedBatchSession(res.updateBatchSession)
                setSessionStatus('started')
            })
        }
    }
    const endSession = () => {
        const input = {
            sessionStatus: "completed",
            sessionEndDate: new Date().toISOString()
        }
        if(get(session, 'documentType','') === 'batchSession' ){
            updateBatchSessionStatus(session.id,input).then(res => {
                getUpdatedBatchSession(res.updateBatchSession)
                setSessionStatus('completed')
            })
        }
        else if(get(session, 'documentType','') === 'adhocSession' ){
            updateAdhocSession(session.id,input).then(res => {
                getUpdatedBatchSession(res.updateBatchSession)
                setSessionStatus('completed')
            })
        }
    }
    const getSessionTime = () => {
        if(session){
            return `${startTime} - ${endTime}, IST `
        }
        return "-"
    }
    const joinSession = () => {
        window.open(withHttps(customSessionLink), '_blank')
    }
    return <>
        <section className="video_detail_heading_container">
            <div className="video_detail_image_section">
                <img src={topicImg} alt='img' />
            </div>
            <div className="video_detail_desc_section">
                <div style={{display: 'flex',alignItems: 'center',marginBottom: get(session,'documentType') === 'adhocSession' ? '12px' : '12px'}}>
                    <div className="video_detail_heading_section">Session {sessionIndex+1}</div>
                    {get(session,'documentType') === 'adhocSession' && <div className="video_detail_tag2">{get(session,'sessionType','').charAt(0).toUpperCase() + get(session,'sessionType','').slice(1)}</div>}
                </div>
                <div className="video_detail_description_section">
                    <span class="Intro_to_coding">{title}</span>
                    {isLive && (
                        <div className='live-tag'><img src={live} alt='live'/>Live</div>
                    )}
                </div>
                <div className="video_detail_date_and_time_section">
                    <img src={clock} style={{paddingRight: '12px', paddingBottom: '2px'}} alt='clock'/>
                    <div className="video_detail_date_section">{getSessionTime()}</div>
                    <div className="video_detail_dot"/>
                    <div className="video_detail_time_section">{sessionDate}</div>
                </div>
            </div>
        </section>

        {sessionStatus === 'started' && (
            <section className="video_detail_button_section_started">
                {customSessionLink !== '' && (
                    <button onClick={() => joinSession()} className="video_detail_buttons_join_now"><span><img src={PlayIcon}/></span> <span className="video_detail_button_text">Join now</span></button>
                )}
                <button className="video_detail_buttons_reschedule_session" onClick={() => {setIsRescheduleModalVisible(true)}}><span><img src={ClockIcon}/></span> <span className="video_detail_button_text">Re-Schedule Session</span></button>
                <button className="video_detail_buttons_end_session" onClick={() => endSession()}>
                    <span><img src={CloseIcon}/></span> <span className="video_detail_button_text">End Session</span>
                </button>
            </section>
        )}
        {
            sessionStatus === 'allotted' && (
            <section className="video_detail_button_section_about_to_start">
                <button className="video_detail_buttons_start_session" onClick={() => startSession()}>
                    <span><img src={PlayIcon}/></span> <span className="video_detail_button_text">Start Session</span>
                </button>
                <button className="video_detail_buttons_reschedule_session" onClick={() => {setIsRescheduleModalVisible(true)}}><span><img src={ClockIcon}/></span> <span className="video_detail_button_text">Re-Schedule Session</span></button>
                {otp !== '' && (
                      <div className="video_detail_otp"><span  className="video_detail_OTP">OTP:</span><span  className="video_detail_otpNumber">{otp === '' ? '-' : otp}</span>{otp !== '' && <img  className="video_detail_otpImg" src={i} alt='i'/>}</div>
                )}
            </section>
            )
        }
        {
            sessionStatus === 'completed' && (
             <section className="video_detail_button_section_finished">
                <Link to={`/classroom/feedback/${get(session, 'id', '')}`} className="video_detail_buttons_feedback"><span><img src={FeedbackIcon} style={{height:'24px', width: '17px',marginRight: '5px'}}/></span> <span className="video_detail_button_text">Give Feedback</span></Link>
                <Link to={`/classroom/session?id=${get(session, 'id', '')}`} className="video_detail_buttons_explore_details"> <span className="video_detail_button_text">Explore Details</span></Link>  
            </section>
            )
        }
        
    </>
}

const mapStateToProps = (state, props) => {
    return {
        isCreatingSession: state.data.getIn(['addClassroomSession', 'addStatus', 'addClassroomSession', 'loading']),
        hasCreatedSession: state.data.getIn(['addClassroomSession', 'addStatus', 'addClassroomSession', 'success']),
        addClassRoomSessionErrorMessage: state.data.getIn(['errors','addClassroomSession/add']),
        addClassroomSessionErrorList:state.data.getIn(['errors','addClassroomSession/add']),
    }
}

export default connect(mapStateToProps)(VideoDetailsTitle)