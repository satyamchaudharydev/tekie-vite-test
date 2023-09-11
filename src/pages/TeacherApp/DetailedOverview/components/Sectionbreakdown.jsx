
import React, {useState, useEffect} from "react"
import {get} from 'lodash'
import './Sectionbreakdown.scss'
import {VideoCam, BarOutline,Info, PersonOutline} from '../assets/icons'
import {CodeImg} from '../../../../assets/CodeImg.png'
import getFullPath from "../../../../utils/getFullPath"
import { getDuration } from "../../../../utils/time/getDuration"

const Sectionbreakdown = ({SectionInfo,TableInfo,batchSessionData}) => {
   const showsec = true
   const CountOBj= {
      Proficient:0,
      Master:0,
      Familiar:0,
      None:0
   }
   const helper=[
      { 
         video:{
      videoStartTime:'2022-02-27T09:09:43.811Z',
      videoEndTime: '2022-02-27T09:10:43.811Z'
      }
   },
   ]
   const timeFormat= (obj) => {
      let ans=''
      if(obj.hour>0) {
         ans=ans+obj.hour+'hr '
      } 
      if(obj.min > 0) {
         ans=ans+obj.min+'m '
      } 
      if(obj.sec > 0) {
         ans=ans+obj.sec+'s '
      }
      return ans
   }
   const sortarray=(a,b)=> {
      if(a.latestQuizReport.quizReport.masteryLevel === b.latestQuizReport.quizReport.masteryLevel) {
         if(a.latestQuizReport.quizReport.correctQuestionCount === b.latestQuizReport.quizReport.correctQuestionCount) {
            if(a.latestQuizReport.quizReport.unansweredQuestionCount === b.latestQuizReport.quizReport.unansweredQuestionCount) {
               if(a.latestQuizReport.quizReport.inCorrectQuestionCount === b.latestQuizReport.quizReport.inCorrectQuestionCount) {
                  return a.latestQuizReport.quizReport.inCorrectQuestionCount - b.latestQuizReport.quizReport.inCorrectQuestionCount
               }
            } else {
               return a.latestQuizReport.quizReport.unansweredQuestionCount - b.latestQuizReport.quizReport.unansweredQuestionCount
            }
         } else {
            return b.latestQuizReport.quizReport.correctQuestionCount - a.latestQuizReport.quizReport.correctQuestionCount
         }
      }
      else {
         return b.latestQuizReport.quizReport.Score-a.latestQuizReport.quizReport.Score
      }
   } 
   let num=0
   const[thumbnailVal,setThumbnailval] = useState([])
   const[videoOption,setvideoOption] = useState(false)
   const[quizOption,setquizOption] = useState(false)
   const[assignmentOption,setassignmentOption] = useState(false)
   const[item, setItem] = useState({})
   const[watchDuration, setwatchDuration] = useState([])
   const[avgLevel, setavgLevel] = useState('')
   const[componentArray,setComponentArray]=useState([])
   useEffect (() => {
      setItem(SectionInfo.topic)
      setComponentArray(SectionInfo.topic.topicComponentRule)
      if(SectionInfo.video) {
         setwatchDuration(SectionInfo.video)
      }
   },[SectionInfo])
   useEffect (() => {
     if(TableInfo && TableInfo.length>0) {
        TableInfo.forEach((obj) => {
          if(get(obj,'latestQuizReport')!==null) {
            if(get(obj,'latestQuizReport.quizReport.masteryLevel','') === 'proficient') {
               obj.latestQuizReport.quizReport['Score']=3
               CountOBj['Proficient'] = CountOBj['Proficient']+1
            } else if (get(obj,'latestQuizReport.quizReport.masteryLevel','') === 'master') {
               obj.latestQuizReport.quizReport['Score']=2
               CountOBj['Master'] = CountOBj['Master']+1
            } else if (get(obj,'latestQuizReport.quizReport.masteryLevel','') === 'familiar') {
               obj.latestQuizReport.quizReport['Score']=1
               CountOBj['Familiar'] = CountOBj['Familiar']+1
            } else if(get(obj,'latestQuizReport.quizReport.masteryLevel','') === 'none') {
               obj.latestQuizReport.quizReport['Score']=1
               CountOBj['None'] = CountOBj['None']+1
            }
         }
         // if(get(obj,'latestQuizReport.quizReport.masteryLevel','') === 'proficient') {
         //    obj.latestQuizReport.quizReport['Score']=3
         //    CountOBj['Proficient'] = CountOBj['Proficient']+1
         // } else if (get(obj,'latestQuizReport.quizReport.masteryLevel','') === 'master') {
         //    obj.latestQuizReport.quizReport['Score']=2
         //    CountOBj['Master'] = CountOBj['Master']+1
         // } else if (get(obj,'latestQuizReport.quizReport.masteryLevel','') === 'familiar') {
         //    obj.latestQuizReport.quizReport['Score']=1
         //    CountOBj['Familiar'] = CountOBj['Familiar']+1
         // } else if(get(obj,'latestQuizReport.quizReport.masteryLevel','') === 'none') {
         //    obj.latestQuizReport.quizReport['Score']=1
         //    CountOBj['None'] = CountOBj['None']+1
         // }
      })
      let max=0;
      let ans=''
      for (const key in CountOBj) {
         if(CountOBj[key]>max) {
            max=CountOBj[key]
            ans=key
         }
      }
      if(ans=== 'None') {
         setavgLevel('Familiar')
      } else {
         setavgLevel(ans)
      }
     }
   },[TableInfo])
   useEffect (() => {
      const videoLinks = []
       if(get(item,'videoThumbnail')) {
         videoLinks.push(get(item,'videoThumbnail').uri)
       } else if(get(item,'videoContent')){
          const links=get(item,'videoContent')
         links.forEach((obj) => {
            if(obj.thumbnail) {
               videoLinks.push(obj.thumbnail.uri +'')
            }
         })
       }
       if(get(item,'topicComponentRule')) {
          const ruleArr = get(item,'topicComponentRule')
          ruleArr.forEach((obj) => {
             if(obj.componentName === 'video') {
                setvideoOption(true)
             } else if (obj.componentName === 'quiz') {
                setquizOption(true)
             } else if (obj.componentName === 'assignment') {
                setassignmentOption(true)
             }
          })
       }
       setThumbnailval(videoLinks)
   },[item])
    return <>
       <div className='section-breakdown'>
             <div className='section-card'>
                <div className='section-inner-card'>
                <div className='section-card-heading'>
                  <div className='section-card-title'>
                  Section-wise Breakdown
                  </div>
                </div>
               <div className='section-card-info'>
                <div className='section-headingdiv' >
                   {videoOption && videoOption ===true ?<div className="video-detail-holder">
                   <div className='header-text-div'>
                      <div className='Videocam-holder'>
                        <VideoCam />
                      </div> 
                     <div className='section-card-title-heading'>
                      Video ({get(SectionInfo,'userVideosMeta.count','0')}/{get(batchSessionData,'attendance').length} Students Completed)
                     </div>
                   </div> 
                   {quizOption === true || assignmentOption === true ?<div className='video-info-container'>
                        <div className="separator-div"/>
                        <div className='video-thumbnail-container'>
                        {
                           thumbnailVal && thumbnailVal.map((val) => 
                           <div className='videoimg-container'>
                           <img className='section-card-videoimg' src={getFullPath(val)} alt=''></img>
                           </div>
                           )
}
                        {watchDuration.length!== 0 ?<div className='watchtime-descriptiondiv'>
                           <div className='watchtime-description'>
                           {timeFormat(getDuration(watchDuration[0].video.videoStartTime,watchDuration[0].video.videoEndTime,showsec))}
                           </div>
                           <div className='watchtime-duration'>
                             Video watch duration
                           </div>
                        </div> : ''}
                     </div>
                   </div> : <></>}
                   </div> : '' }
                  {quizOption && quizOption ===true ? <div className="quiz-detail-holder">
                   <div className='header-text-div'> 
                      <div className='BarOutline-holder'>
                      <BarOutline />
                      </div> 
                      <div className="quiz-heading-holder">
                        <div className='quiz-title-heading'>
                        Quiz ({get(SectionInfo,'userQuizReportsMeta.count','0')}/{get(batchSessionData,'attendance').length} Students Completed)
                        </div>
                        {/* <button className= 'sectioninfo-card-view-detail-button'>
                           <p className= 'sectioninfo-card-detail-text'>View Details</p>
                        </button> */}
                     </div>
                   </div>
                   { assignmentOption === true ?<div className="quiz-info-container">
                     <div className="separator-div"/>
                     <div className="quiz-info-holder">
                        {/* <button className= 'sectioninfo-card-view-detail-button'>
                           <p className= 'sectioninfo-card-detail-text'>View Details</p>
                        </button> */}
                        <div className="quiz-info-div">
                        {avgLevel!== '' ?<div className='Button-holder'>
                              <button className='Button-style'>
                                 <div className='section-card-buttontext'>{avgLevel.toUpperCase()}</div>
                              </button>
                              <div className='proficiency-holder'>
                                 <div className='proficiency-level'>
                                Average Proficiency Level
                                 </div>
                              <div className='icon-holder'>
                              <Info/>
                              </div>
                              </div>
                        </div> : '' }
                        { avgLevel!== '' ?<div className='quiz-seperator-div' /> : '' }
                        {TableInfo && TableInfo.length !== 0 ?<div className='Quizinfo-table'>
                           <div className='Quizinfo-Heading'>
                              <div className='PersonOutline-holder'>
                                 <PersonOutline/>
                                 </div>
                              <p className='Quizinfo-text'>Top Students in the class</p>
                           </div>
                           <div className='studentinfo-holder'>
                               {
                                 TableInfo && TableInfo.length>0 && TableInfo.sort(sortarray).slice(0,5).map((obj) => 
                                    <div className='topstudent-info'>
                                       {get(obj,'latestQuizReport') !==null ?<div className='NumnName'>{++num +". " + get(obj,'StudentName.name')}</div>:<></>}
                                       {/* <div className='NumnName'>{++num +"."+ " " + get(obj,'StudentName.name')}</div> */}
                                        {get(obj,'latestQuizReport') !==null ?<div className='role'>
                                          {get(obj,'latestQuizReport.quizReport.masteryLevel','').charAt(0).toUpperCase() + get(obj,'latestQuizReport.quizReport.masteryLevel','').slice(1) === 'None' ? 'Familiar' :
                                           get(obj,'latestQuizReport.quizReport.masteryLevel','').charAt(0).toUpperCase() + get(obj,'latestQuizReport.quizReport.masteryLevel','').slice(1)
                                          }
                                       </div>:<></>}
                                       {/* <div className='role'>
                                          {get(obj,'latestQuizReport.quizReport.masteryLevel','').charAt(0).toUpperCase() + get(obj,'latestQuizReport.quizReport.masteryLevel','').slice(1) === 'None' ? 'Familiar' :
                                           get(obj,'latestQuizReport.quizReport.masteryLevel','').charAt(0).toUpperCase() + get(obj,'latestQuizReport.quizReport.masteryLevel','').slice(1)
                                          }
                                          </div> */}
                                    </div>
                               )
                               }
                           </div>
                        </div> : '' }
                        </div>
                     </div>
                   </div>: <></>}
                   </div> : '' }
                   { assignmentOption && assignmentOption ===true ? <div className='header-text-div'> 
                      <div className='Codeimg-holder'>
                         <img  src='https://tekie-backend.s3.amazonaws.com/temp/Frame%2017061_ckzxzyv7g02kk0w10h4ff3b9q_1645526460796.png' alt='' style={{width: '100%'}}/>
                      </div>
                      <div className="assignment-heading-holder">
                        <div className='assignment-title-heading'>
                        Coding Assignment ({get(SectionInfo,'userAssignmentsMeta.count','0')}/{get(batchSessionData,'attendance').length} Students Completed)
                        </div>
                        {/* <button className= 'sectioninfo-card-detail-button'>
                           <p className= 'sectioninfo-card-detail-text'>View Outputs</p>
                        </button> */}
                     </div>
                   </div> : '' }
                </div>
               </div>
                </div>
             </div>
          </div>
   </>
}

export default Sectionbreakdown