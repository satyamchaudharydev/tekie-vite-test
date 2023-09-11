import React from 'react'
import { Redirect } from 'react-router-dom'
import fetchBatchSession from '../../../../queries/teacherApp/fetchBatchSession'
import fetchInfo from '../../../../queries/DetailedOverview/fetchInfo'
import { get } from 'lodash'
import moment from 'moment'
import Button from '../../components/Button/Button'
import { ChatSvg, ClockSvg, StarFeedbackSvg, StarSvg,ShareSvg,DownloadSvg,Infosvg } from '../../components/svg'
import LoadingSpinner from '../../components/Loader/LoadingSpinner'
import './styles.scss'
import { getSlotTime } from '../../constants/report/getSlotTime'
import getPath from '../../../../utils/getPath'
import Overview from '../../DetailedOverview'

import { Link } from 'react-router-dom'

class Report extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      giveFeedback: null,
      isFetching: true,
      detailedOverview: true,
      batchSessionData:{},
      batchReports:{},
      averageRating:0,
      reportNavigation: [
        {
          label: 'Detailed Overview',
          key: 'detailedOverview',
        },
        // {
        //   label: 'Student Progress',
        //   key: 'studentProgress',
        // },
        {
          label: 'Class Feedback',
          key: 'classFeedback',
        },
      ],
    }
  }

  async componentDidMount() {
    const queryParams = new URLSearchParams(window.location.search);
    const id = queryParams.get('id');
    // const sessionId = 'ckxq5ceao009l0xvn6j44gk4w'
    await fetchBatchSession(id)
    const batchSessionData = this.props.batchSessionData && this.props.batchSessionData.toJS()

    const userIds=[]
    const attendanceArray=get(batchSessionData,'attendance')
    if(attendanceArray) {
      attendanceArray.forEach((obj)=> {
        if(get(obj,'student.user.id')) {
          userIds.push(get(obj,'student.user.id'))
        }
      })

    }
    const topicId=get(batchSessionData,'topic.id')
    const batchCode=get(batchSessionData,'batch.code')
    const loggedInId=get(this.props.loggedInUser.toJS(),'id')

    await fetchInfo(topicId,batchCode,userIds,loggedInId)

    const batchReports = this.props.batchReports && this.props.batchReports.toJS()
    const studentArray=get(batchReports,'studentRatings')
    let sum=0
    if(studentArray) {
      studentArray.forEach((obj)=> {
        if(get(obj,'rating')) {
         sum=sum+obj.rating
        }
      })

    }
    this.setState({
      batchSessionData,
      batchReports,
      averageRating: sum>0 ? sum/studentArray.length : 0,
      isFetching: false
    })
  }
  renderHeader = () => (
    <>
      <div className='class-heading'>
        Report: {get(this.state.batchSessionData, 'topic.title', '')}
      </div>
      <div className='heading-buttons-container'>
        {/* <Button text='Download Report' type={'secondary'} leftIcon font12
          onBtnClick={() => {
            
          }}
        >
          <DownloadSvg />
        </Button>
        <span className='space'></span>
        <Button text='Share Report' type={'primary'} leftIcon font12
          onBtnClick={() => {
            
          }}
        >
          <ShareSvg />
        </Button> */}
      </div>
    </>
  )
  renderClasssDetails = () => {
    const { batchSessionData } = this.state
    let thumbnailUrl = get(batchSessionData, 'topic.thumbnailSmall.uri', '')
    if(thumbnailUrl === '') {
      thumbnailUrl='python/topic/thumbnailSmall_cjx2czgja00001h2xt7fjlh04_1623573994711.png'
    }
    let sessionDateAndDurationString = ''
    if (batchSessionData && get(batchSessionData, 'id', '')) {
      sessionDateAndDurationString = `${getSlotTime(batchSessionData).startTime} - ${getSlotTime(batchSessionData).endTime}, IST • ${moment(get(batchSessionData, 'bookingDate')).format('ddd, DD MMM')}`
    }
    return (
      <>
        <div className='image-container'
          style={{
            backgroundImage: `url("${thumbnailUrl && getPath(thumbnailUrl)}")`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        ></div>
        <div className='details-container'>
          <div className='class-name'>Class <span>{get(batchSessionData, 'topic.order', '')}</span></div>
          <div className='class-heading'>{get(batchSessionData, 'topic.title', '')}</div>
          <div className='class-time-container'>
            <ClockSvg />
            <p className='class-time'>{sessionDateAndDurationString}</p>
          </div>
        </div>
      </>
    )
  }

  renderReportNavigation = () => (
    <>
      {this.state.reportNavigation.map(navItem => (
        <div>
          <button
          onClick={() => {
            const temp = this.state.reportNavigation
            temp.forEach(item => {
              if (item.key !== this.state[navItem.key]) {
                this.setState({
                  [item.key]: null
                })
              }
            })
            this.setState({
              [navItem.key]: true
            })
          }}
          className={this.state[navItem.key] ? 'selected-nav-button' : 'nav-button'}
        >
          {navItem.label}
        </button>
        {this.state[navItem.key] ?<div className='underline'></div>: '' }
        </div>
      ))}
    </>
  )

  renderClassFeedback = () => {
    const batchSessionId = get(this.state.batchSessionData, 'id', null)
    return (
    <>
      <div className='feedback-stats-container'>
        <div className='feedback-star'><StarFeedbackSvg/></div>
        <div className='stats-head-container'>
          <h3 className='stats-head'>Your class feedback</h3>
          <div>
            
          </div>
        </div>
        {/* <p className='view-feedback-link'>View Given Feedbacks</p> */}
      </div>
      <div className='feedback-stats-container-two'>
        <div className='feedback-star-two'><StarFeedbackSvg/></div>
        <div className='stats-head-container'>
          <h3 className='stats-head-student'>Student Avg. Rating</h3>
          <div className='rating-text'>{this.state.averageRating}<StarSvg style={{marginLeft: '4%'}}/></div>
        </div>
        {/* <p className='view-feedback-link-two'>View Details</p> */}
      </div>
      {/* <div className='feedback-stats-container'>
      <div className='feedback-star'><StarFeedbackSvg/></div>
        <div className='stats-head-container'>
          <h3 className='stats-head'>Student Avg. Rating</h3>
          <h3 className='feedback-rating'>{this.state.averageRating}<StarSvg className='star-svg'/></h3>
        </div>
        <p className='view-feedback-link'>View Details</p>
      </div> */}
    </>  
    )  
  }
  redirectPath = (title, batchId) => {
    if(title === 'home') {
      this.props.history.push(`/teacher/classrooms`)
    } else if (title === 'classroomTitle') {
      this.props.history.push(`/classroom?Id=${batchId}`)
    } else  if (title === 'courseTitle') {
      this.props.history.push(`/classroom/course?id=${batchId}`)
    }
  }

  render() {
    const { batchSessionData } = this.state
    const batchId = get(batchSessionData, 'batch.id', null)
    const classroomTitle = get(batchSessionData, 'batch.classroomTitle', '')
    const courseTitle = get(batchSessionData, 'course.title', '')
    const topicTitle = `${get(batchSessionData, 'topic.order', '')}: ${get(batchSessionData, 'topic.title', '')}`
    return (
      <>
      {this.state.isFetching ? (
        <div className='loader-container'>
                    <LoadingSpinner/>
        </div>
      ) : (
        Object.keys(this.state.batchSessionData).length !== 0 ? <div className='report-container'>
        <div className='report-pagination'>
          <span className='pagination' onClick={()=>{this.redirectPath('home')}}>Home  </span> 
          { (batchId && classroomTitle ) ?<span className='pagination' onClick={()=>{this.redirectPath('classroomTitle',batchId)}}>&gt; {classroomTitle} &gt; </span> : '' }
          {( batchId && courseTitle ) ?<span className='pagination' onClick={()=>{this.redirectPath('courseTitle',batchId)}}>{courseTitle} &gt; </span> : '' }
          { ( batchId && topicTitle ) ?<span style={{cursor:"auto"}} className='pagination'>Session {topicTitle}</span> : ''}
        </div>
        <div className='heading-container'>
          {this.renderHeader()}
        </div>
        <div className='class-details-container'>
          {this.renderClasssDetails()}
        </div>
        <div className='nav-buttons-container'>
          {this.renderReportNavigation()}
        </div>
        {this.state.classFeedback && (
          <div className='feedback-tab-container'>
            {this.renderClassFeedback()}
          </div>
        )}
        {this.state.detailedOverview && (
          <div className='feedback-tab-container'>
            {<Overview batchSessionData={this.state.batchSessionData}/>}
          </div>
        )}
      </div> : <div className='Nosession-container '>No session found</div>
      )}
      </>
    )
  }
}

export default Report