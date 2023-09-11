import React from 'react'
import { CompletedSessionIcon, DummySessionDetailsThumbnail, IncompleteWarning, LiveSessionButton, UpcomingClassCalender } from '../../../../../../../constants/icons'
import styles from '../SessionModal.module.scss'
import getPath from '../../../../../../../utils/getFullPath'
import OtpBox from './OtpBox'
import hs from '../../../../../../../utils/scale'
import { useState } from 'react'
import { useEffect } from 'react'
import moment from 'moment'
import { PUBLISHED_STATUS } from '../../../../../utils'

const Heading = ({sessionId, title, order, time, day, topicThumbnail, documentType, sessionType, previousTopic,sessionStatus,isCurrentTimeBetweenSessionStartAndEndTime,isMoreDetailsHidden, updateSessionLocally,topicComponentRuleLength, isBatchSessionPresent = true, fromClassroomCoursePage = false, isStartingSession = false, classroom, setSessionStatusInState, setIsStartingSessionInState, setRetakeSessionsRecord, retakeSessionsRecord, isRetakeSession, sessionStatusInState, topicComponentRule, sessionStartTime, sessionStartDay, startSessionTimeFull, sessionEndDay, sessionEndTime, liveAttendance, isRetakeClassButtonClicked, setIsRetakeClassButtonClicked, fromTeacherTrainingBatch = false, contentStatus, isCmsAdmin }) => {
    const isRetakeSessionFlag = (sessionStatus === 'completed' && fromClassroomCoursePage) || isRetakeSession
    const [isRetakeSessionBool, setIsRetakeSessionBool] = useState(isRetakeSessionFlag)

    useEffect(() => {
        if (isRetakeSessionFlag) {
            setIsRetakeSessionBool(true)
        }
    }, [sessionId])

    const renderOtp = () => {
        if (fromTeacherTrainingBatch) return null
        if (fromClassroomCoursePage) {
            if ((isStartingSession && (sessionStatus === "yetToBegin" && (contentStatus === PUBLISHED_STATUS || isCmsAdmin))) || sessionStatus === 'inProgress') {
                return (
                    <OtpBox
                        sessionId={sessionId}
                        updateSessionLocally={updateSessionLocally}
                        sessionStatus={sessionStatus}
                        isRetakeSession={isRetakeSessionBool}
                        retakeSessionsRecord={retakeSessionsRecord}
                        liveAttendance={liveAttendance}
                    />
                )
            }
        } else {
            if (((isCurrentTimeBetweenSessionStartAndEndTime || sessionStatus==='inProgress' || sessionStatus==='unAttended') && !checkIfUnpublished({ sessionStatus })) && sessionStatus !== 'completed') {
                return (
                    <OtpBox
                        sessionId={sessionId}
                        updateSessionLocally={updateSessionLocally}
                        sessionStatus={sessionStatus}
                        isRetakeSession={isRetakeSessionBool}
                        retakeSessionsRecord={retakeSessionsRecord}
                        liveAttendance={liveAttendance}
                    />
                )
            }
        }
        if (sessionStatus === 'completed' && fromClassroomCoursePage) {
            return (
                <OtpBox
                    isRetakeClassButtonClicked={isRetakeClassButtonClicked}
                    setIsRetakeClassButtonClicked={setIsRetakeClassButtonClicked}
                    sessionId={sessionId}
                    updateSessionLocally={updateSessionLocally}
                    sessionStatus={sessionStatus}
                    isRetakeSession={isRetakeSessionBool}
                    retakeSessionsRecord={retakeSessionsRecord}
                    liveAttendance={liveAttendance}
                />
            )
        }
        return null
    }

    const getSessionDate = (dateObj) => {
        const dateObjArr = moment(dateObj).format('llll').split(',')
        return dateObjArr && dateObjArr.length > 1 ? dateObjArr[1] : null
    }

    const renderDateTime = () => {
        if (fromClassroomCoursePage) {
            if (isBatchSessionPresent) {
                 return <div className={styles.timeAndDayContainer}>
                    {sessionStartDay === sessionEndDay ? (
                        <p className={styles.timeAndDay}>{sessionStartDay}<span className={styles.timeDaySeparator}></span>{sessionStartTime} - {sessionEndTime} </p>
                    ) : (
                        <p className={styles.timeAndDay}>{getSessionDate(sessionStartDay)} - {getSessionDate(sessionEndDay)}</p>
                    )}
                </div>
            }
            return null
        }
        if (!fromClassroomCoursePage) {
            return <div className={styles.timeAndDayContainer}>
                <p className={styles.timeAndDay}>{day}<span className={styles.timeDaySeparator}></span>{time}</p>
            </div>
        }
        return null
    }

    const renderLastStartedTime = () => {
        return (
            <div className={styles.timeAndDayContainer}>
                <p className={styles.timeAndDay}><span style={{ color: '#808080' }}>Last started on </span>{sessionStartDay}<span className={styles.timeDaySeparator}></span>{sessionStartTime}</p>
            </div>
        )
    }

    const getTitle=(docType='batchSession',fromClassroomCoursePage=false)=>{
        if(docType==='adhocSession'){
            return fromClassroomCoursePage?`Lab ${previousTopic.order}`:previousTopic.order
        }
        return fromClassroomCoursePage?`Lab ${order}`:order
    }

    const renderSessionIconBasedOnType = () => {
        const SESSION_ICON_HEIGHT = 20
        let msec = (new Date()).getTime() - (new Date(startSessionTimeFull)).getTime()
        const hh = Math.floor(msec / 1000 / 60 / 60)
        switch (sessionStatus) {
            case 'inProgress':
                return (
                    hh > 3 ? (
                        <div className={styles.sessionHeadIconTextBackGround} style={{ background: '#faad141f' }}>
                            <IncompleteWarning width={hs(SESSION_ICON_HEIGHT)} height={hs(SESSION_ICON_HEIGHT)} />
                            <span className={styles.sessionHeadIconText} style={{ color: '#8E5F00' }}>Incomplete</span>
                        </div>
                    ) : (
                        <div className={styles.sessionHeadIconTextBackGround} style={{ background: '#ff574414' }}>
                            <LiveSessionButton width={hs(SESSION_ICON_HEIGHT)} height={hs(SESSION_ICON_HEIGHT)} />
                            <span className={styles.sessionHeadIconText} style={{ color: '#FF5744' }}>LIVE</span>
                        </div>
                    )
                )
            case 'completed':
                return (
                    <div className={styles.sessionHeadIconTextBackGround} style={{ background: '#01aa930a' }}>
                        <CompletedSessionIcon width={hs(SESSION_ICON_HEIGHT)} height={hs(SESSION_ICON_HEIGHT)} />
                        <span className={styles.sessionHeadIconText} style={{ color: '#01AA93' }}>Completed</span>
                    </div>
                )
            case 'yetToBegin':
                return (
                    <div className={styles.sessionHeadIconTextBackGround} style={{ background: '#F8F8F8' }}>
                        <UpcomingClassCalender width={hs(SESSION_ICON_HEIGHT)} height={hs(SESSION_ICON_HEIGHT)} className={styles.upcomingIconStyle} />
                        <span className={styles.sessionHeadIconText} style={{ color: '#666666' }}>Upcoming</span>
                    </div>
                )
            default: return <></>
        }
    }

    const isContentEmpty=({sessionStatus,topicComponentRule=[]})=>{
        if((sessionStatus === 'allotted')){
            if(topicComponentRule && topicComponentRule.length) return false
            return true
        }
    }

    const checkIfUnpublished = ({ sessionStatus }) => {
        if((sessionStatus === 'allotted')){
            if(contentStatus === PUBLISHED_STATUS || isCmsAdmin) return false
            return true
        }
    }

    const renderHeadingDateTime = () => {
        if (sessionStatus === 'completed') {
            return renderDateTime()   
        }
        if (sessionStatus === 'inProgress') {
            return renderLastStartedTime()
        }
        return null
    }

    return <div className={styles.headingContainer} style={{ borderBottom: (isContentEmpty({sessionStatus: sessionStatusInState, topicComponentRule}) || checkIfUnpublished({ sessionStatus: sessionStatusInState })) ? 'none' : 'auto' }}>
        <div className={styles.topicThumbnail} style={{ backgroundColor: sessionStatus === 'completed' ? '#65da7a33' : '#dcdcdc4d' }}>
            <div
            className={styles.thumbnailWrapper}
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: `url(${topicThumbnail ? getPath(topicThumbnail) : ''})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
            }}
            >
                {
                    !topicThumbnail && <DummySessionDetailsThumbnail />
                }
            </div>
        </div>
        <div className={styles.sessionDetails}>
            <div className={styles.timeAndOtpContainer}>
                {renderSessionIconBasedOnType()}
            </div>
            <h3 className={styles.title}><span>{documentType === 'adhocSession' ? getTitle('adhocSession',fromClassroomCoursePage) : getTitle('batchSession',fromClassroomCoursePage)}.</span>{documentType === 'adhocSession' ? `${previousTopic.title} (${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)})` : title}</h3>
            {renderHeadingDateTime()}
        </div>
        {renderOtp()}
    </div>
}

export default Heading