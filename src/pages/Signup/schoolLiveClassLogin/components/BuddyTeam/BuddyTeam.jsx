import { get } from 'lodash'
import React from 'react'
import { useState } from 'react'
import Lottie from 'react-lottie'
import { CloseCircle } from '../../../../../constants/icons'
import { avatarsRelativePath } from '../../../../../utils/constants/studentProfileAvatars'
import getSystemId from '../../../../../utils/getOrGenerateSystemId'
import requestToGraphql from '../../../../../utils/requestToGraphql'
import { hs } from '../../../../../utils/size'
import styles from './BuddyTeam.module.scss'
import whiteSpinner from '../../../../../assets/animations/whiteSpinner.json'

const BuddyCard = (props) => {
    const [isRemovingBuddy,setIsRemovingBuddy]=useState(false)
    const { data: { avatar, name, rollNo, userId },number,buddyTeamList, setBuddyTeamList,setStep ,batchDetails,setIsStudentSelected,selectedStudentDetails,setSelectedStudentDetails, isRollNoAutoGenerated} = props

    const removeBuddyFromTeam = async (userId) => {
        try{
            setIsRemovingBuddy(true)
            await requestToGraphql(`{
                getBuddyStatus(sessionId:"${get(batchDetails, 'sessionId')}", userId:"${userId}", systemId:"${getSystemId()}",action:"delete"){
                  error
                  result
                }
              }`)
            setIsRemovingBuddy(false)
              setBuddyTeamList(prev => prev.filter(buddy => get(buddy, 'userId') !== userId))
              const idxOfRemovedUser=buddyTeamList.findIndex(buddy=>get(buddy,'userId')===userId)
              let lastSelectedUser;
              if(idxOfRemovedUser===0 && buddyTeamList.length===1){
                  setIsStudentSelected(false)
                  setStep(1)
                  return
              }
              if(idxOfRemovedUser===buddyTeamList.length-1){
                lastSelectedUser=buddyTeamList[buddyTeamList.length-2]
                setSelectedStudentDetails({ avatar:get(lastSelectedUser,'avatar'), name:get(lastSelectedUser,'name'), rollNo:get(lastSelectedUser,'rollNo'), userId:get(lastSelectedUser,'userId') })
                setIsStudentSelected(true)
              }
              else{
                lastSelectedUser=buddyTeamList[buddyTeamList.length-1]
                setSelectedStudentDetails({ avatar:get(lastSelectedUser,'avatar'), name:get(lastSelectedUser,'name'), rollNo:get(lastSelectedUser,'rollNo'), userId:get(lastSelectedUser,'userId') })
                setIsStudentSelected(true)
              }
              setStep(1)
        }catch(err){
            setIsRemovingBuddy(false)
                console.log(err)
            }
        
    }

    return <div className={styles.buddyCardContainer}>
        <span className={styles.studentNos}>#{number}</span>
        <div className={styles.avatarAndNameContainer}>
            <img className={styles.avatar} src={avatarsRelativePath[avatar]} alt='student-avatar' />
            <p className={styles.studentName}>{!isRollNoAutoGenerated ? `${rollNo} - ` : ''} {name}</p>
        </div>
        <div className={styles.removeBuddyIconContainer} onClick={() => removeBuddyFromTeam(userId)}>
            {!isRemovingBuddy && <CloseCircle height={hs(24)} width={hs(24)} />}
        </div>
        {isRemovingBuddy &&<div className={styles.loaderContainer}>
            <Lottie
                isClickToPauseDisabled
                options={{
                autoplay: true,
                animationData:whiteSpinner,
                loop: true,
                }}
                style={{height:'28px',width:'42px'}}
            />
        </div>}
    </div>
}

const BuddyTeam = ({ students = [], buddyTeamList, setBuddyTeamList,setStep,batchDetails,setIsStudentSelected,selectedStudentDetails,setSelectedStudentDetails, isRollNoAutoGenerated}) => {
    return <ul className={styles.buddyTeamListContainer}>
        {
            students.map((student,idx) => <BuddyCard key={get(student, 'userId')} number={idx+1}setIsStudentSelected={setIsStudentSelected} batchDetails={batchDetails} setStep={setStep} buddyTeamList={buddyTeamList} setBuddyTeamList={setBuddyTeamList} data={{ avatar: get(student, 'avatar'), name: get(student, 'name'), grade: get(student, 'grade'), section: get(student, 'section'), rollNo: get(student, 'rollNo'), userId: get(student, 'userId') }} selectedStudentDetails={selectedStudentDetails}setSelectedStudentDetails={setSelectedStudentDetails} isRollNoAutoGenerated={isRollNoAutoGenerated} />)
        }
    </ul>
}


export default BuddyTeam
// [{name:'Danish',rollNo:12,avatar:''},{name:'Tony stark',rollNo:13,avatar:''}]