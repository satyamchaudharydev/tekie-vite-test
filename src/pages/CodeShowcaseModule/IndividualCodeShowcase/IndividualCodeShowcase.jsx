import React, { Component } from 'react'
import '../../../scss/photon.scss'
import './IndividualCodeShowcase.scss'
import 'react-phone-input-2/lib/style.css'
import moment from 'moment'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { debounce, get } from 'lodash'
import { StudentCommunityPageEventsGA } from '../../../utils/analytics/ga'
import { Toaster } from '../../../components/Toaster'
import { uhohMessage } from '../../../constants/sessions/messages';
import { reactions, trendingPostDuration, debounceWaitTimeInMS } from '../constants'
import { avatarsRelativePath } from '../../../utils/constants/studentProfileAvatars'
import fetchApprovedCodes from '../../../queries/approvedCodes/fetchApprovedCodes'
import fetchApprovedCodeReactionLogs from '../../../queries/approvedCodes/fetchApprovedCodeReactionLogs'
import updateVisitorReactionOnUserApprovedCode from '../../../queries/approvedCodes/updateVisitorReactionOnUserApprovedCode';
import CodeShowcaseSkeleton from '../components/Skeleton'
import ShareOverlay from '../../Invite/component/ShareOverlay/ShareOverlay'
import Header from '../components/Header/Header'
import AuthModalContainer from '../components/AuthModalContainer'
import isMobile from '../../../utils/isMobile'
import { PRIMARY_BUTTON_DEFAULT_TEXT, WAITINGMODAL_ROUTE } from '../../../config'

const getString = string => {
  try {
    return decodeURIComponent(
      string
    )
  } catch (e) {
    try {
      return decodeURIComponent(string.replace('%', '~~~~percent~~~~')).replace('~~~~percent~~~~', '%')
    } catch (e) {
      return string
    }
  }
}

const getDateRangeFilter = () => {
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

let Editor = () => <div />
export default class IndividualCodeShowcase extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isSignInModalVisible: false,
      isSignUpModalVisible: false,
      reactionLogs: [],
      approvedCodes: this.props.approvedCodes.toJS(),
      updateApprovedCodeIDsQueue: [],
      editorKey: 0,
      fade: false,
      shareCodeDetails: {
        id: null,
        approvedFileName: null,
        studentName: null,
      }
    }
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
    const { isLoggedIn } = this.props;
    const orderBy = 'createdAt_DESC'
    let tokenType = isLoggedIn ? null : 'appTokenOnly'
    let fetchTrendingPostFilter = this.getDateRangeFilter()
    if (this.props.match.params.id) {
      filterQuery += `{id: "${this.props.match.params.id}"}`
    }
    fetchApprovedCodes(filterQuery, orderBy, 10, 0, tokenType, fetchTrendingPostFilter).call()
    this.setApprovedCodeReactionLogs()
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
    this.setState({ fade: true })
    this.fetchUserApprovedCodesBasedOnTypes()
    if (typeof window !== 'undefined') {
      import('../../Editor/EditorPage')
        .then(EditorModule => {
          Editor = EditorModule.default
          this.setState({ editorKey: 1 })
        })
    }
  }

  componentDidUpdate(prevProps) {
    const { approvedCodesStatus } = this.props
    if (approvedCodesStatus && !get(approvedCodesStatus.toJS(), 'loading')
      && get(approvedCodesStatus.toJS(), 'success') &&
      (prevProps.approvedCodesStatus !== approvedCodesStatus)) {
      const approvedCodes = this.props.approvedCodes && this.props.approvedCodes.toJS()
      this.setState({
        approvedCodes
      }, () => {
        if (this.state.approvedCodes &&
          this.state.approvedCodes.length &&
          this.props.location.search.split('?').includes('share')
        ) {
          this.onShareButtonClick(this.state.approvedCodes[0])
        }
      })
    }
  }

  reactOnApprovedCode = async (reaction, userApprovedCode) => {
    const { isLoggedIn } = this.props
    const reactionString = `${reaction}ReactionCount`
    let { reactionLogs } = this.state
    if (!isLoggedIn) {
      // this.props.history.push('/login')
      return
    }
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
          if (get(approvedCode, 'id') === userApprovedCode.id) {
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
     * Every Reaction Event has an individual debounce of 500ms 
     * and Overall @debounceWaitTimeInMS is set as 2500ms for this debounced Method
     * */
  }, debounceWaitTimeInMS)

  getTrendingCodeLabel = (approvedCodeIndex, approvedCodeID, trendingUserApprovedCode) => {
    if (trendingUserApprovedCode && trendingUserApprovedCode.id === approvedCodeID) {
      return (
        <div className='ind-code-showcase-trending-text'>
          <span className='ind-code-showcase-trendingIcon'></span>
          <div>Trending <br /><span>This {trendingPostDuration.label}</span></div>
        </div>
      )
    }
    return ''
  }

  checkIfMulitpleChildrenExists = () => {
    const { hasMultipleChildren, history } = this.props
    if (hasMultipleChildren) {
      this.props.history.push({
        pathname: '/switch-account',
        state: {
          redirectURL: history.location.pathname
        }
      })
    }
  }

  closeLoginModal = () => {
    const { isLoggedIn } = this.props;
    if (isLoggedIn) {
      this.checkIfMulitpleChildrenExists()
      this.fetchUserApprovedCodesBasedOnTypes()
    }
    this.setState({
      isSignInModalVisible: false
    })
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

  closeShareOverlay = () => {
    this.setState({ visibleShareOverlay: false })
  }

  getStudentProfileAvatar = (approvedCode) => {
    if (approvedCode) {
      const avatar = get(approvedCode, 'studentAvatar', 'theo') || 'theo';
      return avatarsRelativePath[avatar]
    }
    return avatarsRelativePath.theo
  }

  isCustomHeaderVisible = () => {
    const { isLoggedIn, match } = this.props
    if ((!isLoggedIn || isMobile()) && match.path.split('/').includes('student-community')) {
      return true
    }
    return false
  }
  getShareLink = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.host}/student-community/${this.state.shareCodeDetails.id}`
    }
    return `${import.meta.env.REACT_APP_TEKIE_WEB_URL}/student-community/${this.state.shareCodeDetails.id}`
  }
  render() {
    const { approvedCodes } = this.state
    const totalApprovedCodes = this.props.totalApprovedCodes && this.props.totalApprovedCodes.toJS()[0]
    const trendingUserApprovedCode = this.props.trendingUserApprovedCode && this.props.trendingUserApprovedCode.toJS()[0]
    const approvedCodesStatus = this.props.approvedCodesStatus && this.props.approvedCodesStatus.toJS()
    const { isLoggedIn } = this.props
    return (
      <div>
        <>
          <div>
            {this.isCustomHeaderVisible() && (
              <Header
                logoClickable
                position='sticky'
                openEnrollmentForm={() => {
                  this.setState({
                    isSignUpModalVisible: true,
                  })
                }}
                openLogin={() => {
                  this.props.history.push('/login')
                }}
              />
            )}
          </div>

          <div>

            <div className='ind-code-showcase-container'>
              <div className='ind-code-showcase-row'>
                <Link
                  onClick={() => { this.props.history.goBack() }}
                  className='ind-code-showcase-row ind-code-showcase-leftArrow'>
                </Link>
                <div className='ind-code-showcase-m-rxl'>
                  <div>
                    <div className='ind-code-showcase-ph-card ind-code-showcase-card-container'>
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
                            <motion.div
                              key={approvedCodeData.id}
                              initial={{
                                opacity: this.state.fade ? 0 : 1
                              }}
                              animate={{
                                opacity: 1
                              }}
                              className='ind-code-showcase-code-block'>
                              <div className='ind-code-showcase-row' itemScope itemType='https://schema.org/Article'>
                                <div itemScope itemType='https://schema.org/Organization' itemProp='publisher' style={{ display: 'none' }}>
                                  <p itemProp='name'>Tekie.in</p>
                                </div>
                                {this.getTrendingCodeLabel(index, approvedCodeData.id, trendingUserApprovedCode)}
                                <div className='ind-code-showcase-author-details m-rs' itemProp='author' itemScope itemType='http://schema.org/Person'>
                                  <div className='ind-code-showcase-author-profile-img-container'>
                                    <span
                                      className='ind-code-showcase-profile-img'
                                      style={{ background: `url('${this.getStudentProfileAvatar(approvedCodeData)}')` }}
                                    ></span>
                                  </div>
                                  <div className='ind-code-showcase-author-name' itemProp='name'>{approvedCodeData.studentName}</div>
                                  <div className='ind-code-showcase-author-grade'>{approvedCodeData.studentGrade}</div>
                                </div>
                                <div className='ind-code-showcase-details-container'>
                                  <div className='ind-code-showcase-details'>
                                    <h1 className='ind-code-showcase-file-name' itemProp='name headline'>{approvedCodeData.approvedFileName}</h1>
                                    <h2 className='ind-code-showcase-timestamp' itemProp='dateCreated datePublished'>posted {moment.utc(approvedCodeData.createdAt).fromNow()}</h2>
                                    <div className='ind-code-showcase-tags-container ind-code-showcase-row' style={{ flexWrap: 'wrap', flex: '1 1 50%', justifyContent: 'flex-start' }}>
                                      {approvedCodeData.userApprovedCodeTagMappingsMeta.count ? approvedCodeData.userApprovedCodeTagMappings.map(tagsMapping => (
                                        <div
                                          key={tagsMapping.id}
                                          // onClick={() => this.filterApprovedCodeBasedOnTags(tagsMapping.userApprovedCodeTag.id)}
                                          className='ind-code-showcase-tags'>
                                          {tagsMapping.userApprovedCodeTag.title}
                                        </div>
                                      )) : <></>}
                                    </div>
                                    <p className='ind-code-showcase-description'>{approvedCodeData.approvedDescription}</p>
                                  </div>
                                </div>
                              </div>
                              <div id='ind-code-showcase-editor-view'>
                                <Editor
                                  titleClass='ind-code-showcase-editorq-titleClass'
                                  outputTitleBg='ind-code-showcase-editorq-titleClass ind-code-showcase-editorq-OutputClass'
                                  runButton='ind-code-showcase-editorRunButton'
                                  customLoadingIcon='ind-code-showcase-editor-CustomLoadingIcon'
                                  type='code'
                                  source='ind-code-showcase'
                                  key={this.state.editorKey}
                                  editorMode={get(approvedCodeData, 'languageType') === 'markup' ? 'markup' : 'python'}
                                  hideEditorHeaderActions={true}
                                  updatedSaveCode={() => { }}
                                  readOnly={true}
                                  arrowStyle={{
                                    top: 15,
                                    marginRight: 10
                                  }}
                                  interpretorStyle={{
                                    marginLeft: 16,
                                  }}
                                  codeFileName={approvedCodeData.approvedFileName}
                                  answerCodeSnippet={approvedCodeData.approvedCode && approvedCodeData.approvedCode !== 'null'
                                    ? getString(approvedCodeData.approvedCode)
                                    : ''}
                                  initialCodeString={
                                    approvedCodeData.approvedCode && approvedCodeData.approvedCode !== 'null'
                                      ? getString(approvedCodeData.approvedCode)
                                      : ''
                                  }
                                  fromCodeShowCasePage={true}
                                />
                              </div>
                              <div className='ind-code-showcase-details-footer'>
                                <div className='ind-code-showcase-row'>
                                  {reactions.map(reaction => (
                                    <motion.div
                                      key={reaction.label}
                                      whileTap={{
                                        scale: 0.85
                                      }}
                                      onClick={debounce(() => {
                                        StudentCommunityPageEventsGA({
                                          action: 'Reaction Clicks',
                                          label: `${reaction.label.charAt(0).toUpperCase() + reaction.label.slice(1)} Reaction Click For '${approvedCodeData.approvedFileName}' Code`,
                                        })
                                        this.reactOnApprovedCode(reaction.label, approvedCodeData)
                                      }, 500)
                                      }
                                      className={`ind-code-showcase-reactions ${reaction.label}
                                      ${(approvedCodeData.userReactionLog && approvedCodeData.userReactionLog[reaction.label]) && 'active'}`}>
                                      <span role='img' aria-label={reaction.label}>{reaction.icon} {approvedCodeData[`${reaction.label}ReactionCount`]}</span>
                                    </motion.div>
                                  ))}
                                </div>
                                <div
                                  onClick={() => this.onShareButtonClick(approvedCodeData)}
                                  className='ind-code-showcase-row ind-code-showcase-share-container'
                                >
                                  <span className='ind-code-showcase-shareIcon'></span> Share
                                </div>
                              </div>
                            </motion.div>
                          ))
                        ) : approvedCodesStatus && approvedCodesStatus.loading ? (
                          <>
                            <CodeShowcaseSkeleton
                              isDetailedView
                            />
                          </>
                        ) : (
                          <div className='ind-code-showcase-empty-container'>
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column'
                              }}
                            >
                              <div className='ind-code-showcase-uhohMsgContainer'>{uhohMessage}</div>
                              <div className='ind-code-showcase-emptyMsgContainer'>
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
                </div>
              </div>
            </div>
          </div>
          <div>
            <ShareOverlay
              visible={this.state.visibleShareOverlay}
              closeOverlay={this.closeShareOverlay}
              shareUrl={this.getShareLink()}
              title={`Hey buddy, check out my latest program published in the Tekie Community! \n\n${this.state.shareCodeDetails.approvedFileName} - By ${this.state.shareCodeDetails.studentName}`}
            />
            <AuthModalContainer
              isSignInModalVisible={this.state.isSignInModalVisible}
              isSignUpModalVisible={this.state.isSignUpModalVisible}
              closeLoginModal={this.closeLoginModal}
              openEnrollmentForm={() => {
                this.setState({
                  isSignUpModalVisible: true
                })
              }}
              closeSignupModal={(status) => {
                this.setState({
                  isSignUpModalVisible: false
                })
                if (status) {
                  this.fetchUserApprovedCodesBasedOnTypes()
                }
              }}
            />
          </div>
        </>
      </div>
    )
  }
}

IndividualCodeShowcase.serverFetch = async (params = {}) => {
  let fetchTrendingPostFilter = getDateRangeFilter()
  let filterQuery = `{id: "${params.id}"}`
  await fetchApprovedCodes(filterQuery, 'createdAt_DESC', 10, 0, 'appTokenOnly', fetchTrendingPostFilter).call()
}