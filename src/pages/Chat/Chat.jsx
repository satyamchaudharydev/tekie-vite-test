import React, { Component } from 'react'
import { get } from 'lodash'
import SyntaxHighlighter from 'react-syntax-highlighter';
import { motion } from 'framer-motion'
import ContentLoader from 'react-content-loader'
import PressButton from './PressButton'
import styles from './Chat.module.scss'
import fetchChatPractice from '../../queries/fetchChatPractice'
import parseChatMessage from './parseChatMessage'
import getPath from '../../utils/getPath'
import {minCap } from '../../utils/data-utils'
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import dumpChat from "../../queries/dumpChat";
import { sort } from '../../utils/immutable'
import getCourseId, { getCourseName } from '../../utils/getCourseId'
import duck from '../../duck'
import BadgeModal from '../Achievements/BadgeModal'
import PreserveState from '../../components/PreserveState'
import withArrowScroll from '../../components/withArrowScroll'
import isMobile from '../../utils/isMobile'
import UpdatedSideNavBar from '../../components/UpdatedSideNavBar'
import mentorMenteeSessionAddOrDelete from '../../utils/mmSessionAddOrDelete';

class Chat extends Component {
  state = {
    messages: [],
    step: 1,
    buttonText: 'PRESS',
    isBadgeModalVisible: this.props.location.state && this.props.location.state.unlockBadge
  }

  async componentDidMount() {
    const { path } = this.props.match
    const { topicId } = this.props.match.params
    if (path === '/sessions/chat/:topicId/:loId') {
      await fetchChatPractice(this.props.userId, this.props.loId, 'withMenteeMentorToken', true, '', topicId).call()
    } else {
      await fetchChatPractice(this.props.userId, this.props.loId, '', false, '', topicId).call()
    }
    mentorMenteeSessionAddOrDelete(this.props.userId, topicId, '', 'started', 'other', null, false)
    if (!this.state.messages.length) {
      this.setMessages()
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const body = document.getElementById('chat-body')
    if (prevProps.match.params.loId !== this.props.match.params.loId) {
      this.setState({ messages: [] }, async () => {
        const { topicId } = this.props.match.params
        await fetchChatPractice(this.props.userId, this.props.loId, '', false, '', topicId).call()
        this.setMessages()
      })
    }
    if (prevState.step !== this.state.step) {
      body && body.scrollTo(0, body.scrollHeight)
    }
  }

  setMessages() {
    const messages = sort.ascend(this.props.message, ['order'])
      .toJS().map(message => {
      if (message.type === 'text') {
        return { ...message, parsedMessage: parseChatMessage({
            statement: message.statement,
            emojis: message.emoji,
            alignment: message.alignment
          })}
      }
      if (message.type === 'terminal') {
        return { ...message }
      }
      return message
    })
    this.setState({ messages: messages })
  }

  renderMessages = step => (message, i) => {
    if (!message) return <></>
    let messageComponent = <></>
    const { type } = message

    const hiddenStyles = !(this.state.step >= (i + 1)) ? {
      height: 0,
      overflow: 'hidden',
      padding: 0,
      lineHeight: 0,
      width: 0,
      margin: 0
    } : {}


    if (type === 'text') {
      if (message.alignment === 'left') {
        messageComponent = (
          <div className={styles.text} style={hiddenStyles}>{message.parsedMessage}</div>
        )
      } else {
        messageComponent = <div className={styles.textRight} style={hiddenStyles}>{message.parsedMessage}</div>
      }
    }

    if (type === 'image') {
      messageComponent = (
        <div className={styles[`message${message.alignment}`]} style={hiddenStyles}>
          <div className={styles[`imageContainer${message.alignment}`]}>
            <img src={getPath(message.image.uri)} className={styles.image} alt="Chat" />
          </div>
        </div>
      )
    }

    if (type === 'terminal') {
      messageComponent = (
        <div className={styles[`message${message.alignment}`]} style={hiddenStyles}>
          <div className={styles.terminalInputContainer}>
            <SyntaxHighlighter
                language="python"
                style={darcula}
                customStyle={{
                  padding: 0,
                  margin: 0,
                  backgroundColor: 'transparent'
                }}
            >
              {message.terminalInput ? message.terminalInput : ''}
            </SyntaxHighlighter>
          </div>
          {message.terminalOutput && (
              <div className={styles.terminalOutputContainer}>
                <div className={styles.terminalOutputText}>{message.terminalOutput.split('\n').map((outputLine) => <div>{outputLine}</div>)}</div>
                <div className={styles.terminalPlayButton} onClick={() => {
                  window.open('/code-playground?chat=' + message.id, '_blank')
                }} />
              </div>
          )}
        </div>
      )
    }

    if (type === 'sticker') {
      messageComponent = (
          <div className={styles[`message${message.alignment}`]} style={hiddenStyles}>
            <img src={getPath(get(message, 'sticker.image.uri'))} alt="Sticker" />
          </div>
      )
    }
    return messageComponent
  }

  updateComponentDetail = () => {
    const { loId } = this.props.match.params
    const order = sort.ascend(this.props.learningObjective, ['order'])
        .findIndex((learningObjective, i) =>
            learningObjective.get('id') === loId
        )
    duck.merge(() => ({
      currentTopicComponent: 'practiceQuestion',
      currentTopicComponentDetail: {
        percentageCovered: (((order + 1) * 2) / ((this.props.learningObjective.size * 2) + 2)) * 100
      },
      learningObjective: {
        id: loId,
        chatStatus: 'complete'
      }
    }))
  }

  openMessage = async (isTriggeredByTimer = false) => {
    const { topicId, loId } = this.props.match.params
    if (!(this.state.step < this.state.messages.length)) {
      dumpChat(
          this.props.userId,
          loId,
          { chatAction: 'next' },
        '',
          false, '', topicId
      ).call()
      if (this.props.userLearningObjective.getIn([0, 'chatStatus']) === 'incomplete') {
        this.updateComponentDetail()
      }
      if (
        this.props.match.path === '/sessions/chat/:topicId/:loId'
      ) {
        this.props.history.push(`/sessions/practice/${topicId}/${loId}`)
      } else if (
        this.props.match.path === '/sessions/chat/:courseId/:topicId/:loId'
      ) {
          this.props.history.push(`/sessions/practice-quiz/${getCourseId(topicId)}/${topicId}/${loId}`)
      } else if (  
        this.props.match.path === '/revisit/sessions/chat/:courseId/:topicId/:loId'
      ) {
        this.props.history.push(`/revisit/sessions/practice-quiz/${getCourseId(topicId)}/${topicId}/${loId}`)
      } else if (
        this.props.match.path === '/revisit/sessions/chat/:topicId/:loId'
      ) {
        this.props.history.push(`/revisit/sessions/practice/${topicId}/${loId}`)
      } else {
        this.props.history.push(`/practice/${this.props.match.params.topicId}/${this.props.match.params.loId}`)
      }
      return
    }

    if (this.state.step < this.state.messages.length) {
      this.setState(prev => ({ step: prev.step + 1 }))
    }
  }

  closeBadgeModal = () => {
    const { history } = this.props
    if (history.location && history.location.state) {
      const state = {};
      history.replace({ ...history.location, state });
    }
    this.setState({
      isBadgeModalVisible : false
    })
  }

  handleButtonClick = async () => {
    if (!this.props.chatPracticeStatus.getIn(['success'])) return
    this.openMessage()
  }
  render() {
    const isLoading = this.props.chatPracticeStatus.get('loading')
    const {isBadgeModalVisible} = this.state
    if(isMobile()){
      return(
        <>
          <div style={{marginBottom: '60px'}}>
            {/* <UpdatedSideNavBar
              mobileNav
              parent='sessions'
              revisitRoute={this.props.match.path.includes('/revisit')}
              computedMatch={this.props.computedMatch || this.props.match}
              pageTitle="Chat"  
            /> */}
            {isBadgeModalVisible &&
            <BadgeModal
              closeModal={this.closeBadgeModal}
              shouldAnimate
              unlockBadge={this.props.location.state.unlockBadge}
            />
          }
          <div className={styles.container}>
            {(this.state.messages.length && !this.props.match.path.includes('revisit')) ? (
                <PreserveState
                  state={this.state}
                  setState={(state, callback = () => {}) => {
                    this.setState({
                      ...state,
                      /*added here because initially preservestate is setting isBadgeModal to null in its
                      componentDidMount*/
                      isBadgeModalVisible: this.props.location.state && this.props.location.state.unlockBadge
                    },
                    callback)
                  }}
                  persistIf={id => {
                    return id === `chat${this.props.loId}`
                  }}
                  saveIf={this.state.step}
                  id={`chat${this.props.loId}`}
                  preserveScroll={['chat-body']}
                />
              ) : <></>}
              <div className={styles.frameMobile}>
              <div className={styles.frameBGMobile}></div>
              <div className={styles.body} id="chat-body">
                {isLoading && (
                  <>
                    <ContentLoader
                      className={styles.contentLoader}
                      speed={4}
                      backgroundColor={'rgba(0, 173, 229,  0.4)'}
                      foregroundColor={'#a5ddf3'}
                    >
                      <rect x="0" y="0" rx="5" ry="5" width="300" height="40"/>
                    </ContentLoader>
                  </>
                )}
                {!isLoading && this.state.messages.map(this.renderMessages(this.state.step))}
                <div>
                  <div className={styles.emptyElement}></div>
                </div>
              </div>
              <div className={styles.tapContainer}>
                <div className={styles.buttonsContainer}>
                  <div className={styles.leftDrop}></div>
                  <motion.div
                      style={{
                        originX: 0.5,
                        originY: 1,
                        cursor: isLoading ? 'auto' : 'pointer'
                      }}
                      className={styles.tapButton}
                      onMouseDown={this.handleButtonClick}
                      onMouseUp={this.stopHoldingPressButton}
                      whileHover={isLoading ? {} :{
                        scale: 1.02,
                        opacity: 0.8
                      }}
                      whileTap={isLoading ? {} :{
                        scale: 0.95,
                        opacity: 1
                      }}
                  >
                    <PressButton
                        progress={(this.state.step / this.state.messages.length) * 100}
                    />
                    <div className={styles.tapButtonBody}>
                      {(this.state.step < minCap(this.state.messages.length, 2))
                          ? <span>{this.state.buttonText}</span>
                          : <span>Start<br/>Practice</span>
                      }
                    </div>
                  </motion.div>
                  <div className={styles.rightDrop}></div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </>
      )
    }
    return (
      <>
        {isBadgeModalVisible &&
          <BadgeModal
            closeModal={this.closeBadgeModal}
            shouldAnimate
            unlockBadge={this.props.location.state.unlockBadge}
          />
        }
          <div className={styles.container}>
            {(this.state.messages.length && !this.props.match.path.includes('revisit')) ? (
              <PreserveState
                state={this.state}
                setState={(state, callback = () => {}) => {
                  this.setState({
                    ...state,
                    /*added here because initially preservestate is setting isBadgeModal to null in its
                    componentDidMount*/
                    isBadgeModalVisible: this.props.location.state && this.props.location.state.unlockBadge
                  },
                  callback)
                }}
                persistIf={id => {
                  return id === `chat${this.props.loId}`
                }}
                saveIf={this.state.step}
                id={`chat${this.props.loId}`}
                preserveScroll={['chat-body']}
              />
            ) : <></>}
            <div className={styles.frame}>
              <div className={styles.frameBG}></div>
              <div className={styles.body} id="chat-body">
                {isLoading && (
                  <>
                    <ContentLoader
                      className={styles.contentLoader}
                      speed={4}
                      backgroundColor={'rgba(0, 173, 229,  0.4)'}
                      foregroundColor={'#a5ddf3'}
                    >
                      <rect x="0" y="0" rx="5" ry="5" width="300" height="40"/>
                    </ContentLoader>
                  </>
                )}
                {!isLoading && this.state.messages.map(this.renderMessages(this.state.step))}
                <div>
                  <div className={styles.emptyElement}></div>
                </div>
              </div>
              <div className={styles.tapContainer}>
                <div className={styles.buttonsContainer}>
                  <div className={styles.leftDrop}></div>
                  <motion.div
                      style={{
                        originX: 0.5,
                        originY: 1,
                        cursor: isLoading ? 'auto' : 'pointer'
                      }}
                      className={styles.tapButton}
                      onMouseDown={this.handleButtonClick}
                      onMouseUp={this.stopHoldingPressButton}
                      whileHover={isLoading ? {} :{
                        scale: 1.02,
                        opacity: 0.8
                      }}
                      whileTap={isLoading ? {} :{
                        scale: 0.95,
                        opacity: 1
                      }}
                  >
                    <PressButton
                        progress={(this.state.step / this.state.messages.length) * 100}
                    />
                    <div className={styles.tapButtonBody}>
                      {(this.state.step < minCap(this.state.messages.length, 2))
                          ? <span>{this.state.buttonText}</span>
                          : <span>Start<br/>Practice</span>
                      }
                    </div>
                  </motion.div>
                  <div className={styles.rightDrop}></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )
  }
}


export default withArrowScroll(Chat, 'chat-body')
