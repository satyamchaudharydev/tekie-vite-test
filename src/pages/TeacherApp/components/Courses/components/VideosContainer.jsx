import React,{useState, useEffect} from "react"
import "./VideosContainer.scss"
import getPath from "../../../../../utils/getPath"
import getSlotLabel from "../../../../../utils/slots/slot-label"
import clock from '../../../../../assets/teacherApp/classDetail/Time.svg'
import Check from '../../../../../assets/checkBlue.svg.svg'
import live from '../../../../../assets/live.png'
import {get} from 'lodash'
import moment from "moment"

function VideosContainer({sessions, setSelectedSession, setSessionIndex,
        sessionIndex,selectedSession}){
    const[isLive, setIsLive] = useState(false)
    useEffect(() => {
        let startT = ''
        let endT = ''
        let live = false
        const options = { appendMinutes: true }
        for(let i=0;i<24;i++){
            if(selectedSession && selectedSession[`slot${i}`] === true){
                const time = getSlotLabel(i, options)
                startT = time.startTime
                endT= time.endTime
            }
            if(selectedSession && selectedSession.sessionStatus === 'started'){
                const today = new Date()
                live =  moment(today).isBetween(startT, endT)
                setIsLive(live)
            } 
        }
    }, [])
    const sessionTime = (session) => {
        if(session){
            const options = { appendMinutes: true }
            for(let i=0;i<24;i++){
                if(session[`slot${i}`] === true){
                    const time = getSlotLabel(i, options)
                    let startTime = time.startTime
                    // if(startTime && startTime.length> 0){
                    //     startTime = startTime.substring(0,5)
                    // }
                    const endTime = time.endTime
                    return `${startTime} - ${endTime} `
                }
            }
        }
        return "-"
    }
    const handleClick = (session, index) => {
        if(session.documentType !== "notYetBooked"){
            setSelectedSession(session)
            setSessionIndex(index)
        }
    }
    const getClassName = (session) => {
        if(session.documentType === "notYetBooked"){
            return "videos_containers1"
        }else{
            return "videos_containers"
        }
    }
    const getClassNameActive = (session) => {
        if(session.documentType !== "notYetBooked"){
            return "videos_containers_active"
        }else{
            return "videos_containers1_active"
        }
    }
    return <>
    {sessions && sessions.map((session, key) => <>
        <section class={key === sessionIndex ? getClassNameActive(session):getClassName(session)} onClick={() => handleClick(session, key)}>
            <div class="video_container_image_section">
                {get(session, 'topic.thumbnailSmall.uri', '') !== '' ? (
                    <img src={getPath(get(session, 'topic.thumbnailSmall.uri', ''))} alt='img' style={{width: '50px', height: '50px'}} />
                ):(
                    <img src={getPath('python/clasroomThumbnail_1.png')} alt='img' style={{width: '50px', height: '50px'}} />
                )}
                {session.sessionStatus === 'completed' && (
                    <>
                        <div className="video_container_image_completed"/>
                        <img className="tick_mark" src={Check} alt='tick' style={{width: '50px', height: '50px'}} />
                    </>
                )}
            </div>
            <div class="video_container_desc_section" style={{width: '100%'}}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                    <div class="desc_heading" >Session {' '}<span style={{fontWeight: '500', color: '#424242',paddingLeft: '3px'}}>{key+1}</span></div>
                    {key === sessionIndex && isLive && (
                        <div className='live-tag'><img src={live} alt='live'/>Live</div>
                    )}
                </div>
                {session.documentType === 'adhocSession' ? (
                    <div class="desc_description">{get(session, 'previousTopic.title', '')}</div>
                ):(
                    <div class="desc_description">{get(session, 'topic.title', '')}</div>
                )}
                {session && session.documentType !== 'notYetBooked' && (
                    <div class="time_and_date_section">
                        <img style={{marginRight:"6px",color:"gray"}} src={clock} alt='img' />
                        <div class="desc_time">{sessionTime(session)}</div>
                            <div className="video_detail_dot"/>
                        <div class="desc_date">{moment(session.bookingDate).format("ddd, DD MMM")}</div>
                    </div>
                )}
            </div>
        </section>
    </>)}
    </>
}


export default VideosContainer