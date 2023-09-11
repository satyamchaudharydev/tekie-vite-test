import React, { Component } from 'react'
import '../../../scss/photon.scss'
import './Stats.scss'
import 'react-phone-input-2/lib/style.css';
import moment from 'moment'
import { Link } from 'react-router-dom'
import { debounce, get } from 'lodash'
import { uhohMessage } from '../../../constants/sessions/messages';
import { getToasterBasedOnType } from '../../../components/Toaster'
import { reactions, trendingPostDuration, debounceWaitTimeInMS, statsViewOptions } from '../constants';
import getIdArrForQuery from '../../../utils/getIdArrForQuery';
import { motion } from 'framer-motion'
import { avatarsRelativePath } from '../../../utils/constants/studentProfileAvatars'
import fetchApprovedCodes from '../../../queries/approvedCodes/fetchApprovedCodes'
import fetchApprovedCodeReactionLogs from '../../../queries/approvedCodes/fetchApprovedCodeReactionLogs'
import fetchStudentProfile from "../../../queries/fetchStudentProfile";
import updateVisitorReactionOnUserApprovedCode from '../../../queries/approvedCodes/updateVisitorReactionOnUserApprovedCode';
import CodeShowcaseSkeleton from '../components/Skeleton'
import ShareOverlay from '../../Invite/component/ShareOverlay/ShareOverlay'
import SinglePost from '../components/SinglePost'
import AvatarModal from '../components/AvatarModal/AvatarModal';
// import { PRIMARY_BUTTON_DEFAULT_TEXT, WAITINGMODAL_ROUTE } from '../../../config';

const failureToasterProps = e => ({
  type: 'error',
  message: e,
  autoClose: 4000
})
export default class Stats extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeView: 'compact',
      selectedTags: [],
      reactionLogs: null,
      approvedCodes: null,
      updateApprovedCodeIDsQueue: [],
      isAvatarModalVisible: false,
      updatedUserAvatar: null,
      shareCodeDetails: {
        id: null,
        approvedFileName: null,
        studentName: null,
      },
    };
  }

  getDateRangeFilter = () => {
    let filterQuery = ``
    const fromDate = moment().subtract(trendingPostDuration.duration, trendingPostDuration.unit)
    filterQuery += `{createdAt_gte:"${moment(fromDate)
      .startOf('day')
      .toDate()
      .toISOString()}"}`
    filterQuery += `{createdAt_lte:"${moment()
      .endOf('day')
      .toDate()
      .toISOString()}"}`
    return filterQuery
  }

  fetchUserApprovedCodesBasedOnTypes = async (filterQuery = ``) => {
    const { userId } = this.props;
    let tokenType = null
    let fetchTrendingPostFilter = this.getDateRangeFilter()

    filterQuery += `{user_some:{id:"${userId}"}},`;
    if (this.state.selectedTags.length > 0) {
      filterQuery += `{userApprovedCodeTagMappings_some:{
        userApprovedCodeTag_some:{title_in:[${getIdArrForQuery(this.state.selectedTags)}]}
      }},`;
    }
    fetchApprovedCodes(filterQuery, 'createdAt_DESC', 100, 0, tokenType, fetchTrendingPostFilter).call()
    fetchStudentProfile(this.props.userId)
    await this.setApprovedCodeReactionLogs()
  }

  setApprovedCodeReactionLogs = async () => {
    const { isLoggedIn, userId } = this.props;
    if (isLoggedIn) {
      await fetchApprovedCodeReactionLogs(userId, null).call();
      const approvedCodeReactionLogs = this.props.approvedCodeReactionLogs && this.props.approvedCodeReactionLogs.toJS()
      this.setState({
        reactionLogs: approvedCodeReactionLogs
      })
    }
  }

  async componentDidMount() {
    await this.fetchUserApprovedCodesBasedOnTypes()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.approvedCodes !== this.props.approvedCodes) {
      const approvedCodes = this.props.approvedCodes && this.props.approvedCodes.toJS()
      this.setState({
        approvedCodes
      })
    }
  }


  changeCodeView = (item) => {
    this.setState({
      activeView: item
    })
  }

  reactOnApprovedCode = async (reaction, userApprovedCode) => {
    const reactionString = `${reaction}ReactionCount`
    let { reactionLogs } = this.state
    /** Get Current ReactionLog Object */
    let reactionLog = reactionLogs.filter(log => get(log, 'userApprovedCode.id', false) === userApprovedCode.id)[0]
    /** If log not present then add new object with selected userApprovedCode ID */
    if (!reactionLog) {
      reactionLog = {
        [reaction]: false,
        userApprovedCode: {
          id: userApprovedCode.id
        }
      }
      this.setState((prevState) => {
        return {
          reactionLogs: [...prevState.reactionLogs, reactionLog],
        };
      })
    }
    /** Get Current Reaction Value && Update State with Inverted Reaction and Also Update Count */
    const reactionInput = (reactionLog && reactionLog[reaction]) ? !!reactionLog[reaction] : false
    this.setState(prevState => {
      return {
        reactionLogs: prevState.reactionLogs.map(reactionLog => {
          if (get(reactionLog, 'userApprovedCode.id', false) === userApprovedCode.id) {
            return { ...reactionLog, [reaction]: !reactionInput }
          }
          return reactionLog
        }),
        approvedCodes: prevState.approvedCodes.map(approvedCode => {
          if (get(approvedCode, 'id', false) === userApprovedCode.id) {
            if (reactionInput) {
              return Object.assign(approvedCode, {
                [reactionString]: approvedCode[`${reaction}ReactionCount`] - 1,
              });
            }
            return Object.assign(approvedCode, { [reactionString]: approvedCode[`${reaction}ReactionCount`] + 1 })
          }
          return approvedCode
        })
      }
    })

    /** Update ApprovedCodeIDs Queue 
     * A Queue is maintained for @debounceWaitTimeInMS duration so as to avoid sending multiple requests at once.
     */
    this.setState((prevState) => {
      return { updateApprovedCodeIDsQueue: new Set([...prevState.updateApprovedCodeIDsQueue, userApprovedCode.id]) }
    }, () => {
      this.debouncedUpdateVisitorReactionCallback()
    }
    )
  }


  debouncedUpdateVisitorReactionCallback = debounce(async () => {
    const { userId } = this.props
    /** For All ApprovedCode ID's in Queue Fetch and Update ReactionLog */
    await this.state.updateApprovedCodeIDsQueue.forEach(userApprovedCodeID => {
      const existingLog = this.state.reactionLogs.filter(el => get(el, 'userApprovedCode.id') === userApprovedCodeID)[0]
      let updateObj = ``
      reactions.forEach(({ label }) => {
        if (typeof existingLog[label] === 'boolean') {
          updateObj += `${label} : ${existingLog[label]},`;
        }
      })
      updateVisitorReactionOnUserApprovedCode(userId, userApprovedCodeID, updateObj).call()
    })
    this.setState({
      updateApprovedCodeIDsQueue: []
    })
    /** Note: 
     * Every Reaction Event has an individual debounce 
     * and also an overall @debounceWaitTimeInMS is set for this method
     * */
  }, debounceWaitTimeInMS)

  filterApprovedCodeBasedOnTags = (tag) => {
    const { selectedTags } = this.state
    let filteredTags = [...selectedTags, tag]
    if (selectedTags.includes(tag)) {
      filteredTags = selectedTags.filter(el => el !== tag)
    }
    this.setState({
      selectedTags: filteredTags
    }, () => {
      this.fetchUserApprovedCodesBasedOnTypes()
    })
  }

  getTrendingCodeLabel = (_, approvedCodeID, trendingUserApprovedCode) => {
    if (trendingUserApprovedCode && trendingUserApprovedCode.id === approvedCodeID) {
      return (
        <div className='t-code-trending'>
          <span className='trendingIcon'></span>
          <div>Trending <br /><span>This {trendingPostDuration.label}</span></div>
        </div>
      )
    }
    return ''
  }

  onShareButtonClick = ({ id, approvedFileName, studentName }) => {
    this.setState({
      shareCodeDetails: {
        id,
        approvedFileName,
        studentName,
      },
      visibleShareOverlay: true
    })
  }

  getTotalReactionCount = (userApprovedCodes) => {
    if (userApprovedCodes) {
      return userApprovedCodes.reduce((totalCount, approovedCode) => {
        return totalCount + parseInt(approovedCode.totalReactionCount)
      }, 0).toString().padStart(2, '0')
    }
    return '00'
  }

  closeShareOverlay = () => {
    this.setState({ visibleShareOverlay: false })
  }

  closeAvatarModal = () => {
    this.setState({ isAvatarModalVisible: false })
  }

  getStudentProfileAvatar = (studentProfile) => {
    if (studentProfile) {
      const avatar = studentProfile.profileAvatarCode || 'theo';
      return avatarsRelativePath[avatar]
    }
    return avatarsRelativePath.theo
  }

  render() {
    const { approvedCodes, isAvatarModalVisible } = this.state
    const totalApprovedCodes = this.props.totalApprovedCodes && this.props.totalApprovedCodes.toJS()[0]
    const trendingUserApprovedCode = this.props.trendingUserApprovedCode && this.props.trendingUserApprovedCode.toJS()[0]
    const studentProfile = this.props.studentProfile && this.props.studentProfile.toJS()[0]
    const approvedCodesStatus = this.props.approvedCodesStatus && this.props.approvedCodesStatus.toJS()
    const { isLoggedIn, userName } = this.props
    return (
      <>
        <div className='code-showcase-stats'>
          <div className='row code-author-container'>
            <div className='code-author-details-top m-rs' itemProp='author' itemScope itemType='http://schema.org/Person'>
              <div className='author-profile-img-container'>
                <span className='profile-img'
                  style={{ background: `url('${this.getStudentProfileAvatar(studentProfile)}')` }}></span>
                <motion.div
                  whileTap={{
                    scale: 0.95
                  }}
                  onClick={() => {
                    this.setState({
                      isAvatarModalVisible: true
                    })
                  }}
                  className='author-profile-edit-container'>
                  <span className='editIcon'></span>
                </motion.div>
              </div>
              <div className='code-author-detail'>
                {userName && (
                  <div className='code-author-name' itemProp='name'>{userName}</div>
                )}
                {studentProfile && (
                  <div className='code-author-grade cl-emperor'>{studentProfile.grade}</div>
                )}
              </div>
            </div>
            {/* <div className='code-author-description cl-emperor'>
                Error dolorem voluptas quas commodi. Odit officia ipsum. Quos minus earum soluta recusandae
            </div> */}
          </div>
          <div className='row'>
            <div className='m-rxl'>
              <div className='ph-card stats-container'>
                <div className='t-bdy-strong cl-deep-sky-blue stats-header'>Your Stats</div>
                <div className='divider'></div>
                <div className='stats-details'>
                  <div className='code-shared-details'>
                    <span>{totalApprovedCodes ? totalApprovedCodes.count.toString().padStart(2, '0') : '00'}</span> code published
                  </div>
                  <div className='code-shared-details'>
                    <span>{this.getTotalReactionCount(approvedCodes)}</span> reactions
                  </div>
                </div>
              </div>
            </div>
            <div className='m-rxl code-list-container'>
              <div>
                <div className='code-view-options'>
                  <div className='row'>
                    {statsViewOptions.map(option => (
                      <div
                        onClick={() => this.changeCodeView(option.view)}
                        className={`t-bdy-strong cl-emperor op-50 stats-code-s-section-link grid
                            ${this.state.activeView === option.view && 'active'}`
                        }
                      >
                        {option.icon}
                      </div>
                    ))}
                  </div>
                </div>
                {(approvedCodes && totalApprovedCodes && totalApprovedCodes.count > 0 && !approvedCodesStatus.loading) ?
                  (approvedCodes
                    .map(approvedCodeData => {
                      if (this.state.reactionLogs && this.state.reactionLogs.length && isLoggedIn) {
                        return {
                          ...approvedCodeData,
                          userReactionLog: this.state.reactionLogs
                            .filter(reactionLog =>
                              get(reactionLog, 'userApprovedCode.id', false) === approvedCodeData.id)[0]
                        }
                      }
                      return { ...approvedCodeData }
                    })
                    .map((approvedCodeData, index) => (
                      <div className='ph-card stats-code-container'>
                        <SinglePost
                          isStatsPage
                          isDetailedView={this.state.activeView === 'detailed'}
                          approvedCodeData={approvedCodeData}
                          approvedCodeDataIndex={index}
                          trendingUserApprovedCode={trendingUserApprovedCode}
                          reactions={reactions}
                          selectedTags={this.state.selectedTags}
                          getTrendingCodeLabel={this.getTrendingCodeLabel}
                          filterApprovedCodeBasedOnTags={this.filterApprovedCodeBasedOnTags}
                          reactOnApprovedCode={this.reactOnApprovedCode}
                          onShareButtonClick={this.onShareButtonClick}
                        />
                      </div>
                    ))
                  ) : approvedCodesStatus && approvedCodesStatus.loading ? (
                    <>
                      <div className='ph-card stats-code-container p-hm'>
                        <CodeShowcaseSkeleton
                          isDetailedView={this.state.activeView === 'detailed'}
                        />
                      </div>
                      <div className='ph-card stats-code-container p-hm'>
                        <CodeShowcaseSkeleton
                          isDetailedView={this.state.activeView === 'detailed'}
                        />
                      </div>
                    </>
                  ) : (
                    <div className='mainContainer'>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <div className='uhohMsgContainer'>{uhohMessage}</div>
                        <div className='emptyMsgContainer'>
                          {isLoggedIn ? (
                            <Link to='/code-playground'>
                              Lets Get Started By Saving Your Code
                            </Link>
                          ) : (
                            null
                            // <a href={WAITINGMODAL_ROUTE}>{PRIMARY_BUTTON_DEFAULT_TEXT}</a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
            <ShareOverlay
              visible={this.state.visibleShareOverlay}
              closeOverlay={this.closeShareOverlay}
              shareUrl={`${import.meta.env.REACT_APP_TEKIE_WEB_URL}/student-community/${this.state.shareCodeDetails.id}`}
              title={`Hey buddy, check out my latest program published in the Tekie Community! \n\n${this.state.shareCodeDetails.approvedFileName} - By ${this.state.shareCodeDetails.studentName}`}
            />
          </div>

          <motion.div
            initial={{
              opacity: isAvatarModalVisible ? 1 : 0
            }}
            animate={{
              opacity: isAvatarModalVisible ? 1 : 0
            }}
            style={{
              pointerEvents: isAvatarModalVisible ? 'auto' : 'none'
            }}
          >
            <AvatarModal
              visible={isAvatarModalVisible}
              studentProfile={studentProfile}
              shouldRedirect={false}
              closeAvatarModal={() => this.closeAvatarModal()}
              prompt={e => {
                getToasterBasedOnType(failureToasterProps(e, true))
              }}
            />
          </motion.div>
        </div>
      </>
    )
  }
}
