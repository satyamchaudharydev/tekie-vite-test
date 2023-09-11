import React, { Component } from 'react'
import qs from 'query-string'
import 'react-phone-input-2/lib/style.css'
import { Link } from 'react-router-dom'
import Helmet from 'react-helmet'
import { capitalize, debounce, get, sortBy } from 'lodash'
import moment from 'moment'
import '../../../scss/photon.scss'
import './CodeShowcase.scss'
import '../../Editor/editor.scss';
import { uhohMessage } from '../../../constants/sessions/messages';
import { approvedCodefilterOptions, reactions, trendingPostDuration, debounceWaitTimeInMS } from '../constants';
import { getToasterBasedOnType, Toaster } from '../../../components/Toaster'
import { StudentCommunityPageEventsGA } from '../../../utils/analytics/ga'
import getIdArrForQuery from '../../../utils/getIdArrForQuery';
import fetchApprovedCodes from '../../../queries/approvedCodes/fetchApprovedCodes'
import fetchApprovedCodeReactionLogs from '../../../queries/approvedCodes/fetchApprovedCodeReactionLogs'
import updateVisitorReactionOnUserApprovedCode from '../../../queries/approvedCodes/updateVisitorReactionOnUserApprovedCode';
import CodeShowcaseSkeleton from '../components/Skeleton'
import ShareOverlay from '../../Invite/component/ShareOverlay/ShareOverlay'
import Header from '../components/Header/Header'
import SinglePost from '../components/SinglePost'
import Pagination from '../../../components/Pagination'
import AuthModalContainer from '../components/AuthModalContainer'
import ChatWidget from '../../../components/ChatWidget'
import fetchStudentCurrentStatus from '../../../queries/fetchStudentCurrentStatus'
import renderChats from '../../../utils/getChatTags'
import isMobile from '../../../utils/isMobile'
import { PRIMARY_BUTTON_DEFAULT_TEXT, WAITINGMODAL_ROUTE } from '../../../config'

const failureToasterProps = e => ({
  type: 'error',
  message: e,
  autoClose: 2000
})

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

const getApprovedCodes = (approvedCodesTrending, approvedCodes, type) => {
  if (type === 'trending') {
    if (approvedCodesTrending && approvedCodesTrending.toJS) {
      return approvedCodesTrending.toJS()
    }
  } else {
    if (approvedCodes && approvedCodes.toJS) {
      return approvedCodes.toJS()
    }
  }
  return []
}

const getType = (route) => {
  const type = route.replace('/student-community', '')
  if (type.length < 2) {
    return 'best'
  }
  return type.slice(1)
}

const getCurrentPage = (search, url = false) => {
  if (search) {
    const query = url ? qs.parseUrl(search) : qs.parse(search)
    const page = url ? get(query, 'query.page') : query.page
    if (page) {
      return Number(page)
    }
  }
  return 1
}

export default class CodeShowcase extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeTab: capitalize(getType(this.props.match.path)),
      isSignInModalVisible: false,
      isSignUpModalVisible: false,
      selectedTags: [],
      reactionLogs: [],
      approvedCodes: getApprovedCodes(this.props.approvedCodesTrending, this.props.approvedCodes, getType(this.props.match.path)),
      updateApprovedCodeIDsQueue: [],
      perPage: 10,
      singlePostFade: false,
      currentPage: getCurrentPage(this.props.location.search),
      loading: true,
      shareCodeDetails: {
        id: null,
        approvedFileName: null,
        studentName: null,
      }
    }
    this.codePlaygroundBtn = React.createRef()
  }

  getOrderByStringBasedOnSelectedTab = () => {
    const { activeTab } = this.state
    if (activeTab === 'Best' || activeTab === 'Trending') return 'totalReactionCount_DESC'
    if (activeTab === 'New') return 'createdAt_DESC'
    return ''
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
    const { activeTab, perPage } = this.state
    this.setState({
      loading: true
    })
    const orderBy = this.getOrderByStringBasedOnSelectedTab()
    let tokenType = isLoggedIn ? null : 'appTokenOnly'
    let fetchTrendingPostFilter = null
    if (this.state.selectedTags.length > 0) {
      filterQuery += `{userApprovedCodeTagMappings_some:{
        userApprovedCodeTag_some:{title_in:[${getIdArrForQuery(this.state.selectedTags)}]}
      }}`;
    }
    if (activeTab === 'Trending') {
      filterQuery += this.getDateRangeFilter()
    } else {
      fetchTrendingPostFilter = this.getDateRangeFilter()
    }
    await fetchApprovedCodes(filterQuery, orderBy, perPage, this.state.currentPage - 1, tokenType, fetchTrendingPostFilter, this.state.activeTab === 'Trending' ? '/trending' : '').call()
    this.setState({
      loading: false
    })
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
    this.setState({ singlePostFade: true })
    this.setApprovedCodeReactionLogs()
    if (!this.state.approvedCodes) {
      await this.fetchUserApprovedCodesBasedOnTypes()
    }
    if (!this.state.approvedCodes.length) {
      await this.fetchUserApprovedCodesBasedOnTypes()
    } else {
      if (this.state.approvedCodes.length <= 1) {
        await this.fetchUserApprovedCodesBasedOnTypes()
      }
    }
    if (this.props.isLoggedIn) {
      await fetchStudentCurrentStatus(this.props.userId)
    }
    if (window && window.fcWidget) {
      window.fcWidget.show()
    }
  }

  componentWillUnmount = () => {
    if (window && window.fcWidget) {
      const { isLoggedIn } = this.props
      if (isLoggedIn) {
        window.fcWidget.setFaqTags({
          tags: ['unregistered'],
          filterType: 'article'
        })
      }
      window.fcWidget.hide()
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.activeTab === 'Trending') {
      const approvedCodesStatusTrending = this.props.approvedCodesStatusTrending && this.props.approvedCodesStatusTrending.toJS()
      const prevApprovedCodesStatusTrending = prevProps.approvedCodesStatusTrending && prevProps.approvedCodesStatusTrending.toJS()
      if (!get(approvedCodesStatusTrending, 'loading') && get(prevApprovedCodesStatusTrending, 'loading')) {
        const approvedCodesTrending = this.props.approvedCodesTrending && this.props.approvedCodesTrending.toJS()
        this.setState({
          approvedCodes: approvedCodesTrending
        })
      }
    } else {
      const { approvedCodesStatus } = this.props
      if (approvedCodesStatus && !get(approvedCodesStatus.toJS(), 'loading')
        && get(approvedCodesStatus.toJS(), 'success') &&
        (prevProps.approvedCodesStatus !== approvedCodesStatus)) {
        const approvedCodes = this.props.approvedCodes && this.props.approvedCodes.toJS()
        this.setState({
          approvedCodes
        })
      }
    }
    if (!get(prevProps, 'approvedCodesFailure') && get(this.props, 'approvedCodesFailure')) {
      getToasterBasedOnType(failureToasterProps(this.props.error, true))
    }
    const { isLoggedIn, studentCurrentStatus, loggedInUser } = this.props
    if (window && window.fcWidget) {
      window.fcWidget.on("widget:opened", () => {
        renderChats({
          isLoggedIn,
          studentCurrentStatus,
          loggedInUser
        })
      })
    }
  }


  changeFilterOption = (item) => {
    this.setState({
      activeTab: item,
      currentPage: 1
    }, () => {
      this.fetchUserApprovedCodesBasedOnTypes()
    })
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
          if (get(reactionLog, 'userApprovedCode.id') === get(userApprovedCode, 'id')) {
            return { ...reactionLog, [reaction]: !reactionInput }
          }
          return reactionLog
        }),
        approvedCodes: prevState.approvedCodes.map(approvedCode => {
          if (get(approvedCode, 'id') === get(userApprovedCode, 'id')) {
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

  filterApprovedCodeBasedOnTags = (tag) => {
    const { selectedTags } = this.state
    let filteredTags = [...selectedTags, tag]
    if (selectedTags.includes(tag)) {
      filteredTags = selectedTags.filter(el => el !== tag)
    }
    this.setState({
      selectedTags: filteredTags,
      currentPage: 1
    }, () => {
      this.fetchUserApprovedCodesBasedOnTypes()
    })
  }

  getTrendingCodeLabel = (approvedCodeIndex, approvedCodeID, trendingUserApprovedCode) => {
    const { activeTab } = this.state
    if ((activeTab === 'Trending' && approvedCodeIndex === 0) ||
      (trendingUserApprovedCode && trendingUserApprovedCode.id === approvedCodeID)) {
      return (
        <div className='code-showcase-trending-text'>
          <span className='code-showcase-trendingIcon'></span>
          <div>Trending <br /><span>This {trendingPostDuration.label}</span></div>
        </div>
      )
    }
    return ''
  }

  checkIfMulitpleChildrenExists = () => {
    const { hasMultipleChildren } = this.props
    if (hasMultipleChildren) {
      this.props.history.push({
        pathname: '/switch-account',
        state: {
          redirectURL: '/student-community'
        }
      })
    }
  }

  closeLoginModal = () => {
    const { isLoggedIn } = this.props;
    if (isLoggedIn) {
      this.checkIfMulitpleChildrenExists()
      this.setApprovedCodeReactionLogs()
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

  pageChange = ({ currentPage: page }) => {
    if (page === this.state.currentPage || page < 0) {
      return
    }
    this.setState({
      currentPage: page
    }, () => {
      this.fetchUserApprovedCodesBasedOnTypes()
      if (this.codePlaygroundBtn.current) {
        this.codePlaygroundBtn.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  }

  renderHeroSection = () => {
    return (
      <div className='code-showcase-hero-master'>
        <div className='code-showcase-hero-container'>
          <div className='code-showcase-hero-header'>
            Showcase your coding talent
          </div>
          <div className='code-showcase-hero-description'>
            Join the most intelligent community of young coders. Browse, save & play with codes to understand how they work, and code your own ideas to earn badges & scholarships.
          </div>
          <div className='code-showcase-hero-btn'>
            <Link to={'/code-playground'}
              ref={this.codePlaygroundBtn}
              onClick={() => {
                StudentCommunityPageEventsGA({
                  action: 'Link Clicks',
                  label: 'Code Playground Button Click',
                })
              }}
              className='code-showcase-playground-buttonContainer'>
              <span className='code-showcase-buttonText'>Start Coding</span>
            </Link>
          </div>
        </div>
        <div className='code-showcase-hero-img-container'>
          <div className='code-showcase-hero-img'>
          </div>
        </div>
      </div>
    )
  }

  renderCategories = () => {
    return (
      <div className='code-showcase-row'>
        {approvedCodefilterOptions.map(options => (
          <Link
            to={`/student-community/${options.label.toLowerCase()}`}
            key={options.label}
            style={{ textDecoration: 'none' }}
            onClick={() => {
              StudentCommunityPageEventsGA({
                action: 'Link Clicks',
                label: `${options.label} Filter Click`,
              })
              this.changeFilterOption(options.label)
            }}
            className={`code-showcase-section-link
            ${this.state.activeTab === options.label && 'code-showcase-option-active'}`
            }
          >
            <span role='img' aria-label={options.label}>{options.icon} &nbsp; {options.label}</span>
          </Link>
        ))}
      </div>
    )
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
    const userApprovedCodeTags = this.props.userApprovedCodeTagMappingsCount && this.props.userApprovedCodeTagMappingsCount.toJS()
    const approvedCodesStatus = this.props.approvedCodesStatus && this.props.approvedCodesStatus.toJS()
    const approvedCodesStatusTrending = this.props.approvedCodesStatusTrending && this.props.approvedCodesStatusTrending.toJS()
    const { isLoggedIn } = this.props
    const isApprovedCodeLoading = this.state.activeTab === 'Trending'
      ? get(approvedCodesStatusTrending, 'loading')
      : get(approvedCodesStatus, 'loading')
    return (
      <div>
        <>
          <Helmet>
            <link rel="canonical" href="https://www.tekie.in" />
            <title>Tekie - Join Tekie's student community of young coders and showcase your talent</title>
            <meta name="description" content="Join our Interactive student community, connect with like-minded young coding wizards, and share your work with the community."></meta>
            <meta name="keywords" content="tekie,tekie coding,tekie in,tekie app,tekie coding classes,tekie review,tekie classes,tekie india,tekie online coding,tekie online class,tekie online demo,python for kids,coding for kids,best python course for kids,python coding for kids, online coding platform for python, python online course for kids,best coding classes for kids,live online coding classes for kids, best coding classes for kids, best programming courses for kids,online coding programs for kids,programming classes for kids" />
          </Helmet>
          <div>
            {this.isCustomHeaderVisible() && (
              <Header
                logoClickable
                positionFixed={true}
                openEnrollmentForm={() => {
                  this.setState({
                    isSignUpModalVisible: true,
                    isSignInModalVisible: false
                  })
                }}
                openLogin={() => {
                  this.props.history.push('/login')
                  // this.setState({
                  //   isSignInModalVisible: true,
                  //   isSignUpModalVisible: false
                  // })
                }}
              />
            )}
          </div>
          <ChatWidget />

          <div className='code-showcase-master-container'>
            {this.renderHeroSection()}
            {(!isApprovedCodeLoading && !get(this.state, 'loading')) ? <span className='student-community-page-mixpanel-identifier' /> : null}
            <div className='code-showcase-row'>
              <div className='code-showcase-m-rxl'>
                <div>
                  <div className='code-showcase-filter-options'>
                    {this.renderCategories()}
                  </div>
                  <div className='code-showcase-ph-card code-showcase-card-container'>
                    {approvedCodes && approvedCodes.length > 0 && (!isApprovedCodeLoading || !get(this.state, 'loading')) ?
                      ((this.state.activeTab === 'Trending' ? sortBy(approvedCodes, 'trendingOrder') : sortBy(approvedCodes, 'approvedCodeOrder'))
                        .map(approvedCodeData => {
                          /** Mapping UserReactionLogs with ApprovedCode */
                          if (this.state.reactionLogs && this.state.reactionLogs.length && isLoggedIn) {
                            return {
                              ...approvedCodeData,
                              userReactionLog: this.state.reactionLogs
                                .filter(reactionLog =>
                                  get(reactionLog, 'userApprovedCode.id', false) === get(approvedCodeData, 'id'))[0]
                            }
                          }
                          return { ...approvedCodeData }
                        })
                        .map((approvedCodeData, index) => (
                          <SinglePost
                            key={approvedCodeData && approvedCodeData.id}
                            fade={this.state.singlePostFade}
                            isDetailedView
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
                        ))
                      ) : (get(this.state, 'loading') || (approvedCodesStatus && approvedCodesStatus.loading)) ? (
                        <>
                          <CodeShowcaseSkeleton
                            isDetailedView
                          />
                          <CodeShowcaseSkeleton
                            isDetailedView
                          />
                        </>
                      ) : (
                        <div className='code-showcase-mainContainer'>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                          >
                            <div className='code-showcase-uhohMsgContainer'>{uhohMessage}</div>
                            <div className='code-showcase-emptyMsgContainer'>
                              {isLoggedIn ? (
                                <Link to='/code-playground'>
                                  Lets Get Started By Saving Your Code
                                </Link>
                              ) : (
                                null
                                //  <a href={WAITINGMODAL_ROUTE}>{PRIMARY_BUTTON_DEFAULT_TEXT}</a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
                {get(totalApprovedCodes, 'count', 1) > this.state.perPage && (
                  <>
                    <Pagination
                      totalRecords={get(totalApprovedCodes, 'count', 0)}
                      currentPage={this.state.currentPage}
                      path={this.props.match.path}
                      pageLimit={this.state.perPage}
                      pageNeighbours={1}
                      onPageChanged={this.pageChange}
                    />
                  </>
                )}
              </div>
              <div className='code-showcase-trending-tag-card'>
                <div className='code-showcase-ph-card code-showcase-trending-tag-container'>
                  <div className='code-showcase-trending-header'>Trending Tags</div>
                  <div className='code-showcase-divider'></div>
                  <div className='code-showcase-tags-body'>
                    {userApprovedCodeTags && userApprovedCodeTags.groupByData && userApprovedCodeTags.groupByData.length > 0 ?
                      (userApprovedCodeTags.groupByData.map(tags => (
                        tags && tags.groupByFieldValue ? (
                          <div
                            key={tags.groupByFieldValue}
                            onClick={() =>
                              this.filterApprovedCodeBasedOnTags(tags.groupByFieldValue)
                            }
                            className={`code-showcase-tags ${this.state.selectedTags.includes(
                              tags.groupByFieldValue
                            ) && 'code-showcase-tags-active'}`}
                          >
                            {tags.groupByFieldValue}
                            <span> x {tags.count}</span>
                          </div>
                        ) : null
                      ))
                      ) : approvedCodesStatus && approvedCodesStatus.loading ? (
                        <CodeShowcaseSkeleton isTagSkeleton />
                      ) : (
                        <div className='code-showcase-mainContainer'>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                          >
                            <div className='code-showcase-uhohMsgContainer'>No Tags Found</div>
                          </div>
                        </div>
                      )}
                  </div>
                  {this.state.selectedTags.length > 0 && (
                    <>
                      <div className='code-showcase-divider'></div>
                      <div
                        onClick={() => {
                          this.setState({
                            selectedTags: [],
                            currentPage: 1
                          }, () => {
                            this.fetchUserApprovedCodesBasedOnTypes()
                          }
                          )
                        }}
                        className='code-showcase-clearTags'
                      >
                        X Clear Tags
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
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
        </>
      </div>
    )
  }
}

CodeShowcase.serverFetch = async (params = {}, path, url) => {
  const type = getType(path)
  const page = getCurrentPage(url, true)
  if (type && type !== 'trending') {
    if (type === 'new') {
      await fetchApprovedCodes('', 'createdAt_DESC', 10, page - 1, 'appTokenOnly', null, '').call()
    } else {
      await fetchApprovedCodes('', 'totalReactionCount_DESC', 10, page - 1, 'appTokenOnly', null, '').call()
    }
  } else {
    await fetchApprovedCodes(getDateRangeFilter(), 'totalReactionCount_DESC', 10, page - 1, 'appTokenOnly', null, '/trending').call()
  }
}
