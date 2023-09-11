import React, {useEffect, useState} from 'react'
import './DetailedOverview.scss'
import {get} from 'lodash'
import AttnLeader from './components/AttnLeader'
import Sectionbreakdown from './components/Sectionbreakdown'
import fetchInfo from '../../../queries/DetailedOverview/fetchInfo'
import fetchQuizReport from '../../../../src/queries/fetchQuizReport'

const Overview = (props) => {
  useEffect(() => {
    const userIds=[]
    const attendanceArray=get(props.batchSessionData,'attendance')
    if(attendanceArray) {

      attendanceArray.forEach((obj)=> {
        if(get(obj,'student.user.id')) {
          userIds.push(get(obj,'student.user.id'))
        }
      })

    }
    const topicId=get(props.batchSessionData,'topic.id')
    const batchCode=get(props.batchSessionData,'batch.code')
    const courseId=get(props.batchSessionData,'course.id')
    fetchInfo(topicId,batchCode,userIds)
    fetchQuizReport(topicId,courseId,userIds).call()
  },[])
  return (
      <div className='header'>
          {/* <AttnLeader></AttnLeader> */}
          <Sectionbreakdown SectionInfo={props.batchReports.toJS()} TableInfo={props.userQuizReport.toJS()} batchSessionData={props.batchSessionData}></Sectionbreakdown>
      </div>
      
  )
}
export default Overview