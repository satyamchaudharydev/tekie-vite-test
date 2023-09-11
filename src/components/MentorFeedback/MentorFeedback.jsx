import React, { Component } from 'react'
import cx from 'classnames'
import { Map } from 'immutable'
import { range, get } from 'lodash'
import withScale from '../../utils/withScale'
import { hs } from '../../utils/size'
import { ReactComponent as StarActive } from './starActive.svg'
import { ReactComponent as StarInActive } from './starInActive.svg'
import classNames from './MentorFeedback.module.scss'
import { motion } from 'framer-motion'
import { connect } from 'react-redux'
import fetchMentorFeedback from '../../queries/fetchMentorFeedback'
import updateMentorFeedback from '../../queries/updateMentorFeedback'
import { Toaster, getToasterBasedOnType } from '../Toaster'
import { filterKey } from '../../utils/data-utils'
import moment from 'moment'
import { ActionButton } from '../Buttons'
import { Button3DMentor } from '../../photon'
import isMobile from '../../utils/isMobile'
import { getActiveBatchDetail } from '../../utils/multipleBatch-utils'

const tags = {
  positive: [
    {
      label: "Friendly",
      value: "friendly",
      tagSelected: false,
    },
    {
      label: "Engaging",
      value: "engaging",
      tagSelected: false,
    },
    {
      label: "Motivating",
      value: "motivating",
      tagSelected: false,
    },
    {
      label: "Enthusiastic",
      value: "enthusiastic",
      tagSelected: false,
    },
    {
      label: "Helping",
      value: "helping",
      tagSelected: false,
    },
    {
      label: "Patient",
      value: "patient",
      tagSelected: false,
    },
    {
      label: "Concepts perfectly explained",
      value: "conceptsPerfectlyExplained",
      tagSelected: false,
    },
  ],
  negative: [
    {
      label: "Not Punctual",
      value: "notPunctual",
      tagSelected: false,
    },
    {
      label: "Rude",
      value: "rude",
      tagSelected: false,
    },
    {
      label: "Fast Paced",
      value: "fastPaced",
      tagSelected: false,
    },
    {
      label: "Boring",
      value: "boring",
      tagSelected: false,
    },
    {
      label: "Distracted",
      value: "distracted",
      tagSelected: false,
    },
    {
      label: "Slow Paced",
      value: "slowPaced",
      tagSelected: false,
    },
    {
      label: "Poor explanation",
      value: "poorExplanation",
      tagSelected: false,
    },
    {
      label: "Average explanation",
      value: "averageExplanation",
      tagSelected: false,
    },
  ],
};
const mobileTags = {
  positive: [
    {
      label: 'Friendly',
      value: 'friendly',
      tagSelected: false
    },
    {
      label: 'Engaging',
      value: 'engaging',
      tagSelected: false
    },
    {
      label: 'Motivating',
      value: 'motivating',
      tagSelected: false
    },
    {
      label: 'Enthusiastic',
      value: 'enthusiastic',
      tagSelected: false
    },
    {
      label: 'Helping',
      value: 'helping',
      tagSelected: false
    },
    {
      label: 'Patient',
      value: 'patient',
      tagSelected: false
    },
    {
      label: 'Concepts perfectly explained',
      value: 'conceptsPerfectlyExplained',
      tagSelected: false
    },
  ],
  negative: [
    {
      label: 'Poor explanation',
      value: 'poorExplanation',
      tagSelected: false
    },
    {
      label: 'Not Punctual',
      value: 'notPunctual',
      tagSelected: false
    },
    {
      label: 'Distracted',
      value: 'distracted',
      tagSelected: false
    },
    {
      label: 'Average explanation',
      value: 'averageExplanation',
      tagSelected: false
    },
    {
      label: 'Fast Paced',
      value: 'fastPaced',
      tagSelected: false
    },
    {
      label: 'Slow Paced',
      value: 'slowPaced',
      tagSelected: false
    },
    {
      label: 'Rude',
      value: 'rude',
      tagSelected: false
    },
    {
      label: 'Boring',
      value: 'boring',
      tagSelected: false
    },
  ]
}

class MentorFeeback extends Component {
  state = {
    rating: 0,
    hoveredRating: 0,
    tags: isMobile() ? mobileTags : tags,
    comment: '',
    visible: false,
    clicked: false
  }

  renderStar = (rating) => {
    if (this.state.rating >= rating) {
      return <StarActive />
    }
    if (this.state.hoveredRating >= rating) {
      return (
        <div style={{ opacity: 0.5 }}>
          <StarActive />
        </div>
      )
    }
    return <StarInActive />
  }

  alreadyOpened = false

  componentDidUpdate(prevProps) {
    const loggedInUser = this.props.loggedInUser && this.props.loggedInUser.toJS();
    const studentProfile = this.props.studentProfile && this.props.studentProfile.toJS();
    const isMentorLoggedIn = get(loggedInUser, 'isMentorLoggedIn', false)
    const batchDetail = getActiveBatchDetail(get(studentProfile, 'batch'))
    const isClassroomStudent = get(batchDetail, 'documentType') === "classroom"

    // if(isMentorLoggedIn) {
    //   this.props.postSubmit();
    //   return
    // }
    const NPSIsNotEmpty =
      this.props.netPromoterScore.size !== 0

    if (
      this.props.mentorFeedbackStatus.get('success') &&
      !this.props.mentorMenteeSession.getIn([0, 'rating']) &&
      this.state.visible === false &&
      !this.alreadyOpened
    ) {
      if (isMentorLoggedIn || isClassroomStudent) {
        this.props.postSubmit()
        this.alreadyOpened = true
      } else {
        this.setState({ visible: true })
        this.alreadyOpened = true
      }
    }

    if (this.props.hasFeedbackAdded && !prevProps.hasFeedbackAdded) {
      getToasterBasedOnType({
        type: 'success',
        message: 'Thanks for the feedback!'
      })
      this.setState({
        visible: false,
      })
    }
  }

  toggleTag = (tagIndex) => {
    if (this.state.rating < 5) {
      const negative = this.state.tags.negative.map((tag, i) => {
        if (tagIndex === i) {
          return {
            ...tag,
            tagSelected: !tag.tagSelected
          }
        }
        return tag
      })
      this.setState(prev => ({
        tags: {
          ...prev.tags,
          negative
        }
      }))
    } else {
      const positive = this.state.tags.positive.map((tag, i) => {
        if (tagIndex === i) {
          return {
            ...tag,
            tagSelected: !tag.tagSelected
          }
        }
        return tag
      })
      this.setState(prev => ({
        tags: {
          ...prev.tags,
          positive
        }
      }))
    }
  }

  close = () => {
    this.setState({ visible: false })
  }

  submitFeedback = async () => {
    const { tags } = this.state
    const keywords = this.state.rating === 5
      ? tags.positive
        .filter(tag => tag.tagSelected)
        .reduce((acc = {}, keyword) => {
          return { ...acc, [keyword['value']]: true }
        }, {})
      : tags.negative
        .filter(tag => tag.tagSelected)
        .reduce((acc = {}, keyword) => {
          return { ...acc, [keyword['value']]: true }
        }, {})

    await updateMentorFeedback(
      this.props.sessionId, {
      rating: this.state.rating,
      comment: this.state.comment,
      ...keywords
    }
    ).call()
    this.props.postSubmit()
  }

  render() {
    const { rating, tags, visible } = this.state
    const suggestedTags = rating === 0
      ? []
      : rating === 5 ? tags.positive : tags.negative
    return (
      <motion.div
        className={classNames.container}
        style={{
          pointerEvents: visible ? 'auto' : 'none'
        }}
        initial={{ opacity: 0 }}
        animate={visible ? {
          opacity: 1
        } : { opacity: 0 }}
      >
        <div className={classNames.popup} onClick={e => {
          e.stopPropagation()
        }}>
          {/* <div className={cx(classNames.title,classNames.titleLine1Margin)}>Stop screen share</div>
          <div className={cx(classNames.title,classNames.titleLine2Margin)}>&</div> */}
          <div className={cx(classNames.title, classNames.titleLine3Margin)}>Rate your mentor!</div>
          <div className={classNames.mentorAvatar}></div>
          <div className={classNames.name}>
            {this.props.user.getIn([0, 'name'])}
          </div>
          <div className={classNames.createdBy}>
            Session : {this.props.topic.getIn([0, 'title'])}
          </div>
          <div className={classNames.createdBy}>
            Session : {
              moment(
                this.props.mentorMenteeSession.getIn([0, 'sessionStartDate'])
              ).format('DD-MM-YYYY')
            } | {
              moment(
                this.props.mentorMenteeSession.getIn([0, 'sessionStartDate'])
              ).format('hh A')
            }
          </div>
          <div className={classNames.row} style={{ marginTop: hs(15) }}>
            {!this.state.clicked && range(1, 6).map(rating => (
              <div
                className={classNames.star}
                onClick={() => this.setState({ rating })}
                onMouseOver={() => {
                  this.setState({
                    hoveredRating: rating,
                  })
                }}
                onMouseOut={() => {
                  this.setState({
                    hoveredRating: 0,
                  })
                }}
              >
                {this.renderStar(rating, this.state.hoveredRating)}
              </div>
            ))}
          </div>
          <div className={classNames.tagsContainer}>
            {!this.state.clicked && suggestedTags.map((tag, i) => (
              <div
                className={cx(rating === 5 ? classNames.tag : '', tag.tagSelected ? classNames.tagActive : classNames.tagHover, classNames.tagText)}
                onClick={() => this.toggleTag(i)}
              >{tag.label}</div>
            ))}
          </div>
          {!!suggestedTags.length && !this.state.clicked && (<div className={classNames.firstPageButtons}>
            {
              <Button3DMentor
                title='Next'
                onClick={() => this.setState({
                  clicked: true
                })}
                innerTextContainerStyle={{ justifyContent: 'center' }}
                style={{ height: '40px' }}
              />}
          </div>)}
          {this.state.clicked && <div className={classNames.commentOnMobile}>
            <div className={classNames.footer}>
              <div className={classNames.comments}>Comments:</div>
              <textarea
                rows={this.state.comment.split('\n').length}
                value={this.state.comment}
                onChange={(e => this.setState({ comment: e.target.value }))}
                className={classNames.textArea}
                placeholder="Anything else you would like us to know? (optional)"
              />
            </div>
            <div className={classNames.secondPageButtons}>
              <Button3DMentor
                title='Back'
                onClick={() => this.setState({
                  clicked: false
                })}
                className={classNames.backButton}
                innerTextContainerStyle={{
                  boxShadow: 'none', padding: '0px 23px',
                  justifyContent: 'center', background: 'white', color: '#00ADE6', height: '48px', textShadow: 'none', fontweight: 'bold', border: '0.5mm solid #00ADE6'
                }}
              />
              <Button3DMentor
                title='Submit'
                onClick={this.submitFeedback}
                innerTextContainerStyle={{ justifyContent: 'center' }}
                loading={this.props.isFeedbackLoading}
                style={{ height: '40px' }}
              />
            </div>
          </div>}
          {!!suggestedTags.length && (
            <div className={classNames.comment}>
              <div className={classNames.footer}>
                <div className={classNames.comments}>Comments:</div>
                <textarea
                  rows={this.state.comment.split('\n').length}
                  value={this.state.comment}
                  onChange={(e => this.setState({ comment: e.target.value }))}
                  className={classNames.textArea}
                  placeholder="Anything else you would like us to know? (optional)"
                />
              </div>
              <ActionButton
                title="Submit"
                hideIconContainer
                textStyle={{
                  marginLeft: 0,
                  marginRight: 0,
                  fontSize: 15,
                  padding: `${hs(25)}px ${hs(102)}px`
                }}
                onClick={this.submitFeedback}
                showLoader={this.props.isFeedbackLoading}
                // loaderStyle={styles.loader}
                buttonContainer={classNames.button}
              />
            </div>
          )}
        </div>
      </motion.div>
    )
  }
}

const mapStateToProps = (state, props) => ({
  ...fetchMentorFeedback(props.sessionId)
    .mapStateToProps(state),
  netPromoterScore: state.data.getIn(['netPromoterScore', 'data']),
  isFeedbackLoading: state.data.getIn(['mentorFeedback', 'updateStatus', 'mentorFeedback', 'loading']),
  hasFeedbackAdded: state.data.getIn(['mentorFeedback', 'updateStatus', 'mentorFeedback', 'success']),
  loggedInUser: filterKey(state.data.getIn([
    'user',
    'data'
  ]), 'loggedinUser').get(0) || Map({}),
  studentProfile: filterKey(state.data.getIn(['studentProfile', 'data']), 'accountProfile').get(0) || Map({})
})

export default connect(mapStateToProps)(MentorFeeback)
