import React from 'react'
import { get } from 'lodash'
import moment from 'moment'
import updateBatchSession from '../../../../../queries/teacherApp/updateBatchSession'
import fetchBatchSession from '../../../../../queries/teacherApp/fetchBatchSession'
import { getSlotTime } from '../../../constants/report/getSlotTime'
import { getToasterBasedOnType, Toaster } from '../../../../../components/Toaster'
import { ClockSvg,DotSvg } from '../../../components/svg'
import LoadingSpinner from '../../../components/Loader/LoadingSpinner'
import getPath from '../../../../../utils/getPath'
import '../styles.scss'
import './feedbackForm.scss'
import { Link } from 'react-router-dom'

class FeedbackForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isFetching: true,
      isLoading: false,
      aboutStudentsB2B: [
        {
          label: 'How many students were attentive ?',
          key: 'attentionCount',
          inputType: 'button',
          values: [
            { toShow: 'All of them', toSend: 'all' },
            { toShow: 'Most of them', toSend: 'most' },
            { toShow: 'Half of them', toSend: 'half' },
            { toShow: 'Few of them', toSend: 'few' },
            { toShow: 'None', toSend: 'none' },
          ]
        },
        {
          label: 'How attentive were the students ?',
          key: 'attentionAmount',
          inputType: 'radio',
          values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        },
        {
          label: 'How many students were interactive ?',
          key: 'interactionCount',
          inputType: 'button',
          values: [
            { toShow: 'All of them', toSend: 'all' },
            { toShow: 'Most of them', toSend: 'most' },
            { toShow: 'Half of them', toSend: 'half' },
            { toShow: 'Few fo them', toSend: 'few' },
            { toShow: 'None', toSend: 'none' },
          ]
        },
        {
          label: 'How interactive were the students ?',
          key: 'interactionAmount',
          inputType: 'radio',
          values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        },
        {
          label: "Tell us about the student's behaviour",
          inputType: 'textArea',
          key: 'studentBehaviour',
        }
      ],
      tellMoreAboutContent: [
        {
          label: 'How was the length of content ?',
          key: 'lengthOfContent',
          inputType: 'button',
          values: [
            { toShow: 'Brief', toSend: 'brief' },
            { toShow: 'Concise', toSend: 'concise' },
            { toShow: 'Long', toSend: 'long' },
          ]
        },
        {
          label: "Which part of session student's enjoyed ?",
          key: 'learningObjectiveComponent',
          inputType: 'button',
          values: [
            { toShow: 'Chat', toSend: 'chatbot' },
            { toShow: 'Code', toSend: 'practice' },
            { toShow: 'Comic Strip', toSend: 'comicStrip' },
            { toShow: 'Quiz', toSend: 'project' },
            { toShow: 'Video', toSend: 'video' },
          ]
        },
        {
          label: "Is there anything we can improve from the content perspective ?",
          key: 'contentImprovementSuggestion',
          inputType: 'textArea',
        }
      ],
      commentsB2B: [
        {
          label: 'Is there any functionality we can provide to have taken this class better and effective ?',
          key: 'functionalitySuggestion',
        },
        {
          label: 'Is there anything in general you want to let us know ?',
          key: 'generalSuggestion',
        }
      ],
    }
  }

  async componentDidMount() {
    const { sessionId } = this.props.match.params
    await fetchBatchSession(sessionId)
    const batchSessionData = this.props.batchSessionData && this.props.batchSessionData.toJS()
    this.setDefaultValues(batchSessionData)
    this.setState({
      batchSessionData,
      isFetching: false
    })
  }

  componentDidUpdate(prevProps) {
    const updateBatchSessionStatus = this.props.updateBatchSessionStatus
      && this.props.updateBatchSessionStatus.toJS()
    const prevUpdateBatchSessionStatus = prevProps.updateBatchSessionStatus
      && prevProps.updateBatchSessionStatus.toJS()

    if (get(updateBatchSessionStatus, 'success', false) && !get(prevUpdateBatchSessionStatus, 'success', false)) {
      this.props.history.push('/classroom/session')
    }
    if (get(updateBatchSessionStatus, 'failure', false) && !get(prevUpdateBatchSessionStatus, 'failure', false)) {
      getToasterBasedOnType({
        type: 'failure',
        message: 'something went wrong',
        autoClose: 4000,
        className: 'teacher-app-theme'
      })
      this.setState({ isLoading: false })
    }
  }

  setDefaultValues = (batchSessionData) => {
    if (batchSessionData) {
      const b2bStates = {}
      b2bStates.readOnly = batchSessionData.isFeedbackSubmitted
      const { aboutStudentsB2B, tellMoreAboutContent, commentsB2B } = this.state
      if (batchSessionData.isFeedbackSubmitted) {
        aboutStudentsB2B.forEach(item => {
          if(batchSessionData[item.key]) {
            b2bStates[item.key] = batchSessionData[item.key]
          }
        })
        tellMoreAboutContent.forEach(item => {
          if(batchSessionData[item.key]) {
            b2bStates[item.key] = batchSessionData[item.key]
          }
        })
        commentsB2B.forEach(item => {
          if(batchSessionData[item.key]) {
            b2bStates[item.key] = batchSessionData[item.key]
          }
        })
      }
      this.setState({ ...b2bStates })
    }
  }

  checkIfFieldValueNotExists = (value) => {
    if (value === ''
      || value === null
      || value === undefined
      || value.trim() === '') {
      return true
    }
    return false
  }

  validateFields = () => {
    const showError = {}
    this.state.commentsB2B.forEach(item => {
      if(this.checkIfFieldValueNotExists(this.state[item.key])) {
        showError[item.key] = true
      }
    })
    this.setState({
      showError
    })
    if (Object.keys(showError).length > 0) {
      return true
    }
    return false
  }

  onSubmit = async () => {
    const err = this.validateFields()
    if (err) {
      const errorElement = document.querySelectorAll('.feedback_error')
      if (errorElement.length > 0 && errorElement[0].parentElement
        && errorElement[0].parentElement.parentElement) {
        errorElement[0].parentElement.parentElement.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      this.setState({ isLoading: true })
      const { aboutStudentsB2B, tellMoreAboutContent, commentsB2B, batchSessionData } = this.state
      const feedbackData = {
        isFeedbackSubmitted: true,
      }
      aboutStudentsB2B.forEach(item => {
        if(this.state[item.key]) {
          feedbackData[item.key] = this.state[item.key]
        }
      })
      tellMoreAboutContent.forEach(item => {
        if(this.state[item.key]) {
          feedbackData[item.key] = this.state[item.key]
        }
      })
      commentsB2B.forEach(item => {
        if(this.state[item.key]) {
          feedbackData[item.key] = this.state[item.key]
        }
      })
      const batchSessionId = get(batchSessionData, 'id', null)
      await updateBatchSession(batchSessionId, { ...feedbackData })
    }
  }

  renderHeader = () => (
    <>
      <div className='class-heading'>
        Class Feedback: {get(this.state.batchSessionData, 'topic.title', '')}
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
      sessionDateAndDurationString = <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>{getSlotTime(batchSessionData).startTime} - {getSlotTime(batchSessionData).endTime}, IST <span style={{fontSize:"7px",margin:"0px 6px"}}>&bull;</span>  {moment(get(batchSessionData, 'bookingDate')).format('ddd, DD MMM')}
      </div>
    }
    return (
      <>
        <div className='image-container'
          style={{
            backgroundImage: `url("${thumbnailUrl && getPath(thumbnailUrl)}")`,
            backgroundSize: '90%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        ></div>
        <div className='details-container'>
          <p className='class-name'>Class <span>{get(batchSessionData, 'topic.order', '')}</span></p>
          <h3 className='class-heading'>{get(batchSessionData, 'topic.title', '')}</h3>
          <div className='class-time-container'>
            <ClockSvg />
            <p className='class-time'>{sessionDateAndDurationString}</p>
          </div>
        </div>
      </>
    )
  }

  renderFormB2B = () => (
    <>
      <div className='feedback-title'>About the Students</div>
      {this.state.aboutStudentsB2B && this.state.aboutStudentsB2B.map(student => (
        <>
        {(student.inputType !== 'textArea') ? ( 
          <>
          <div className='row-container'>
          <div className='feedback-layout-left'>
            <div className='feedback-description'>
              {student.label}
            </div>
          </div>
          
          <div className='feedback-layout-right'>
            {(student.inputType === 'button') && (
              <>
                {student.values.map(value => (
                  <button
                    value={value.toSend}
                    style={{ cursor: this.state.readOnly ? 'not-allowed' : 'pointer'}}
                    disabled={this.state.readOnly}
                    onClick={e => {
                      this.setState({ [student.key]: e.target.value })
                    }}
                    className={this.state[student.key] === value.toSend ? 'field-button-select' : 'field-button'}
                  >
                    {value.toShow}
                  </button>
                 
                ))}
              </>
            )}
            {(student.inputType === 'radio') && (
              <>
                {student.values.map(value => (
                  <button
                    value={value}
                    disabled={this.state.readOnly}
                    style={{cursor: this.state.readOnly ? 'not-allowed' : 'pointer'}}
                    onClick={() => {
                      this.setState({ [student.key]: value })
                    }}
                    className={this.state[student.key] === value ? 'custom-rate-select' : 'custom-rate'}
                  >
                    {value}
                  </button>
                ))}
              </>
            )}
            </div>
          </div>
          {(student.inputType === 'radio') && <div className='divide-form'></div> }
          </>
        ) : (
          <>
          <div className='feedback-title' style={{ marginBottom: '20px' }}>
            {student.label}
          </div>
          <div className='row-container' style={{ paddingBottom: '28px' }}>
            <div className='feedback-layout-left'>
              <div className='feedback-description'>
                Comments
              </div>
            </div>
            <div className='feedback-layout-right'>
              <textarea
                allowClear
                autoSize={{ minRows: 4, maxRows: 6 }}
                rows='4'
                value={this.state[student.key]}
                disabled={this.state.readOnly}
                placeholder='Add response here'
                onChange={(e) => {
                  this.setState({ [student.key]: e.target.value })
                }}
                className='form-textarea'
              />
              </div>
            </div>
          </>
        )}
        </>
      ))}
    </>
  )

  renderTellMoreAboutContent = () => (
    <>
    <div className='feedback-title'>
      Tell us something about the content of session
    </div>
    {this.state.tellMoreAboutContent && this.state.tellMoreAboutContent.map(content => (
      <div className='row-container' style={{ paddingBottom: '20px' }}>
      <div className='feedback-layout-left'>
        <div className='feedback-description'>
          {content.label}
        </div>
      </div>
      <div className='feedback-layout-right'>
        {(content.inputType === 'button') && (
          <>
            {content.values.map(value => (
              <button
                value={value.toSend}
                disabled={this.state.readOnly}
                style={{ cursor: this.state.readOnly ? 'not-allowed' : 'pointer'}}
                onClick={e => {
                  this.setState({ [content.key]: e.target.value })
                }}
                className={this.state[content.key] === value.toSend ? 'field-button-select' : 'field-button'}
              >
                {value.toShow}
              </button>
            ))}
          </>
        )}
        {(content.inputType === 'textArea') && (
          <textarea
            allowClear
            autoSize={{ minRows: 4, maxRows: 6 }}
            rows='4'
            disabled={this.state.readOnly}
            value={this.state[content.key]}
            placeholder='Add response here'
            onChange={(e) => {
              this.setState({
                [content.key]: e.target.value,
              })
            }}
            className='form-textarea'
          />
        )}
        </div>
      </div>
    ))}
    </>
  )

  renderAdditionalCommentsB2B = () => (
    <>
    {this.state.commentsB2B && this.state.commentsB2B.map(comment => (
      <>
        <div className='feedback-title'>
          {comment.label}
        </div>
        <div className='row-container' style={{ paddingBottom: '28px' }}>
          <div className='feedback-layout-left'>
            <div className='feedback-description' style={{ display: 'flex', width: '100%' }}>
              Comments / Suggestions
              <div className='feedback_error'>*</div>
            </div>
          </div>
          <div className='feedback-layout-right'>
            <textarea
              allowClear
              autoSize={{ minRows: 2, maxRows: 6 }}
              rows='4'
              value={this.state[comment.key]}
              disabled={this.state.readOnly}
              placeholder='Add response here'
              onChange={e => {
                this.setState({
                  [comment.key]: e.target.value
                })
              }}
              className='form-textarea'
            />
            {(this.state.showError && get(this.state, `showError.${comment.key}`)) && (
              <div className='feedback_error'>
                Fill this field before going further*
              </div>
            )}
            </div>
          </div>
        <div className='divide-form'></div>
      </>
    ))}
    </>
  )

  renderFooter = () => (
    <div className='form-footer-container'>
      <div className='footer-text'>Please check the responses before submitting the feedback</div>
      <div className='footer-button-container'>
        <button
          onClick={() => {
            this.props.history.push('/classroom/session')
          }}
          className='secondary-button'
        >Cancel</button>
        <span className='space'></span>
        <button
          onClick={() => {
            this.onSubmit()
          }}
          disabled={this.state.readOnly}
          style={{cursor: this.state.readOnly ? 'not-allowed' : 'pointer'}}
          className='primary-button'
        >
          {this.state.isLoading && <LoadingSpinner height='14px' width='14px' color='white' />}
          {this.state.isLoading && <span className='loader-margin'></span>}
          Submit Feedback
        </button>
      </div>
    </div>
  )

  render() {
    const { batchSessionData } = this.state
    const batchId = get(batchSessionData, 'batch.id', null)
    const classroomTitle = get(batchSessionData, 'batch.classroomTitle', '')
    const courseTitle = get(batchSessionData, 'course.title', '')
    const topicTitle = `${get(batchSessionData, 'topic.order', '')}. ${get(batchSessionData, 'topic.title', '')}`
    return (
    <>
    <div style={{marginBottom:"20px"}}>
      {this.state.isFetching ? (
       <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh"}}> <LoadingSpinner /></div>
      ) : (
      <div className='report-container'>
        
        <div className='report-pagination'>
          <Link to='/teacher/classrooms' >Home &gt; </Link>
           {(batchId && classroomTitle) ? <Link to={`/classroom/?id=${batchId}`} >{classroomTitle} &gt; </Link> : ''}
          {(batchId && courseTitle) ?<Link to={`/classroom/course/?id=${batchId}`} >{courseTitle} &gt;</Link>  : ''}
          {(batchId && topicTitle) ? <Link style={{cursor:"auto"}}> Session {topicTitle} &gt; </Link> : ''}
          <span style={{cursor:"auto"}}>Give Feedback</span>
        </div>
        <div className='heading-container'>
          {this.renderHeader()}
        </div>
        <div className='class-details-container'>
          {this.renderClasssDetails()}
        </div>
        <div className='feedback-container'>
          {this.renderFormB2B()}
          <div className='divide-form'></div>
          {this.renderTellMoreAboutContent()}
          <div className='divide-form'></div>
          {this.renderAdditionalCommentsB2B()}
          {this.renderFooter()}
        </div>
      </div>
      )}
      </div>
      </>
    )
  }
}

export default FeedbackForm
