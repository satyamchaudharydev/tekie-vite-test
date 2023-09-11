import { get } from "lodash"
import React, { useEffect, useRef, useState } from "react"
import { AbsentUserBlock, InformationCircle } from "../../constants/icons"
import Tooltip from "../../library/Tooltip"
import store from "../../store"
import hs from "../../utils/scale"
import getColorBasedOnPercentage from "../../utils/teacherApp/getColorBasedOnPercentage"
import styles from  './MainSideBar.module.scss'

const getAbsentUserNameAndRoll = (totalUsers,presentUsers) => {
    let absentStudents = []
    absentStudents = presentUsers && totalUsers.filter(obj1 => !presentUsers.some(obj2 => get(obj2,'user.id') === get(obj1,'student.user.id')))
    return absentStudents
}

const getSubmittedAssignmentStudents = (totalUsers,presentUsers) => {
    let absentStudents = []
    absentStudents = presentUsers && totalUsers.filter(obj1 => !presentUsers.some(obj2 => get(obj2,'user.id') === get(obj1,'student.user.id') && get(obj2,'submitted') === true))
    return absentStudents
}

const getPracticeSubmittedStudents = (presentUsers) => {
    let submittedUsers = []
    submittedUsers = presentUsers && presentUsers.filter(obj1 => obj1.submitted === true)
    return submittedUsers
}

const getUserOnIds = (totalStudents,userId) => {
    let absentStudents = []
    absentStudents = userId && totalStudents.filter(obj1 => !userId.some(obj2 => obj2 === get(obj1,'student.user.id')))
    return absentStudents
}

const getPracticeReportStudents = (totalStudents,submissionsData) => {
    if(submissionsData && !submissionsData.length > 0 ) return totalStudents
    const userIds = get(submissionsData,'[0]') && get(submissionsData,'[0].submissions').map(submission => get(submission,'userId'));

    // Filter out the userIds that are not present in all submissions
    const commonUserIds = userIds && userIds.filter(userId => {
      return submissionsData.every(student => {
        return student.submissions.some(submission => submission.userId === userId);
      });
    });
    const absentStudents = getUserOnIds(totalStudents,commonUserIds)
    return absentStudents
}

const Information = ({type,navType}) => {
    const codeGarageButtonRef = useRef(null)
    // const [absentStudents,setAbsentStudents] = useState()
    const className = {
        color: '#4A336C',
    }
    if(navType==='learningSlide') navType = 'learningObjective'
    const state = store.getState()
    const [showTooltip,setShowTooltip] = useState(false)
    let batchSessionData = state.data.getIn(['batchSessionData', 'data']).toJS()
    const users = get(batchSessionData,'attendance', [])
    let getPracticeQuestionReport = state.data.getIn(['getPracticeQuestionReport', 'data']).toJS()
    getPracticeQuestionReport = get(getPracticeQuestionReport,'practiceQuestionOverallReport.[0]')
    let sessionComponentTrackers = get(batchSessionData,'sessionComponentTracker')
    let presentUsers = get(sessionComponentTrackers,`${navType}`, [])
    presentUsers = presentUsers && presentUsers.filter(user => get(user, 'visited') === true)
    const absentStudents = getAbsentUserNameAndRoll(users,presentUsers)
    const averageTriesOverall = get(getPracticeQuestionReport, "avgTriesPerQuestion", 0);
    const absentStudentsInReport = type === 'submissionWithScore' && getPracticeReportStudents(users,get(getPracticeQuestionReport,'pqIndividualQuestionReport'))
    const absentStudentsInAssignment = getSubmittedAssignmentStudents(users,presentUsers)

    const renderTooltipUser = (absentStudents) => {
       return <>
        <Tooltip
            anchorOrigin={{
            vertical: "top",
            horizontal: "left",
            }}
            transformOrigin={{
            vertical: "top",
            horizontal: "left",
            }}
            center={true}
            handleMouseEnter={
                () => setShowTooltip(true)
            }
            handleMouseLeave={
                () => setShowTooltip(false)
            }
            leftCenter={true}
            open={showTooltip}
            anchorEl={codeGarageButtonRef.current}
            orientation='middleLeft'
            beakType='tiltedBeak'
            containerColor='#4A336C'
            type="tertiary"
        >
        <div style={{width: hs(273),marginLeft:hs(16)}}>
                <div style={{display:'flex',alignItems:'center',borderBottom: '1.42502px solid rgba(255, 255, 255, 0.2)'}}> 
                    <span style={{marginRight: hs(6)}}><AbsentUserBlock/> </span> 
                    <p style={{fontWeight:'600',fontSize:hs(17),color:'#FFFFFF'}}>{type === 'visited' ? 'Not visited' : 'Not Submitted'} </p>
                </div>
                <div style={{maxHeight: hs(190),overflowY:'scroll',marginTop: hs(11.4)}}>
                    {(absentStudents && absentStudents.map(user => 
                    <p style={{color:'#FFFFFF',fontWeight:'400',fontSize:hs(15),lineHeight:hs(22.8)}}>{get(user,'student.rollNo')}  {get(user,'student.user.name')}</p>
                    ))}
                </div>
            </div>
            </Tooltip>
        </>
    }
    
    if(type === 'visited'){
        return(
            <>
                <div className={styles.visitedCount}>  <p><span><span
                    style={{color: getColorBasedOnPercentage((((presentUsers && presentUsers.length) /(users && users.length))*100))}}
                > {presentUsers ? presentUsers.length : 0}</span>/{users.length} </span> visited {""} </p>
                <span className={styles.informationIcon} ref={codeGarageButtonRef} style={{marginLeft: hs(6),alignSelf:'center'}} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
                {absentStudents && absentStudents.length > 0 &&<InformationCircle width={hs(16)} height={hs(16)} color='#403F3F' /> }
                </span> 
                </div>
                    {absentStudents && absentStudents.length > 0 && renderTooltipUser(absentStudents)}
            </>
        )
    }
    else if(type === 'submissionWithScore'){
        return(
            <div style={{display:'flex',flexDirection:'row',alignItems:'flex-start'}}
                className={styles.detailsContainer}
            >
                <div className={styles.submitted}>
                <div style={{display:'flex',justifyContent:'center',marginBottom: hs(8)}}>
                <p style={{margin:0,marginRight:hs(6),alignItems:'center'}}>SUBMITTED </p> <span className={styles.informationIcon} ref={codeGarageButtonRef} style={{fill:'#403F3F'}} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
                    {absentStudentsInReport && absentStudentsInReport.length > 0 &&<InformationCircle height={hs(16)} width={hs(16)} color='#403F3F' /> }
                </span>
                </div>
                <span><span style={{color: getColorBasedOnPercentage((1-(absentStudentsInReport && absentStudentsInReport.length) /(users && users.length))*100)}} >
                    {absentStudentsInReport ?(users && users.length) - (absentStudentsInReport && absentStudentsInReport.length) : 0}
                </span>/{users && users.length}</span>
                </div>
                <div className={styles.score}>
                <p>AVG. SCORE</p>
                <span>{averageTriesOverall} Tries</span>
                </div>
                    {absentStudentsInReport && absentStudentsInReport.length > 0 && renderTooltipUser(absentStudentsInReport)}
            </div>
        )
    }else{
        return(
            <div style={{display:'flex',flexDirection:'row',marginTop: 0}}
                className={styles.detailsContainer}
            >
                <div className={styles.submitted} style={{marginRight: hs(74)}}>
                <div style={{display:'flex'}}>
                <p style={{margin:0,marginRight:hs(6)}}>SUBMITTED </p> <span className={styles.informationIcon} ref={codeGarageButtonRef} style={{alignSelf:'center'}} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
                {(absentStudentsInAssignment && absentStudentsInAssignment.length > 0 ) && <InformationCircle height={hs(16)} width={hs(16)} /> }
                </span>
                </div>
                <span><span
                style={{color: getColorBasedOnPercentage((1-(absentStudentsInAssignment && absentStudentsInAssignment.length) /(users && users.length))*100)}}
                >{absentStudentsInAssignment ?(users && users.length) - (absentStudentsInAssignment && absentStudentsInAssignment.length) : 0}</span>/{users.length}</span>
                </div>
                {(absentStudentsInAssignment && absentStudentsInAssignment.length > 0 )  && renderTooltipUser(absentStudentsInAssignment)}
            </div>
        )
    }
    
}

export default Information