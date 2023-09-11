import React from 'react'
import Helmet from 'react-helmet'
import { debounce, get, sortBy, mixin, memoize } from 'lodash'
import 'react-phone-input-2/lib/style.css'
import { fetchTopics, addUserCheatSheet, updateUserCheatSheet, fetchCheatSheets } from '../../queries/cheatSheet'
import ContentArea from './components/ContentArea'
import Footer from './components/Footer/Footer'
import TopicContainer from './components/TopicContainer'
import { getToasterBasedOnType, Toaster } from '../../components/Toaster'
import './CheatSheet.scss'
import fetchCurrentCourse from '../../queries/cheatSheet/fetchCurrentCourse'
import fetchFavouriteCheats from '../../queries/cheatSheet/fetchFavouriteCheats'
import { withRouter } from 'react-router'
import Header from '../CodeShowcaseModule/components/Header'
import AuthModalContainer from '../CodeShowcaseModule/components/AuthModalContainer'
import ChatWidget from '../../components/ChatWidget'
import fetchStudentCurrentStatus from '../../queries/fetchStudentCurrentStatus'
import renderChats from '../../utils/getChatTags'
import isMobile from '../../utils/isMobile'
import { checkIfEmbedEnabled } from '../../utils/teacherApp/checkForEmbed'

const memoDebounce = function(func, wait=0, options={}) {
  var mem = memoize(function(param) {
    return debounce(func, wait, options)
  });
  return function(param){mem(param)(param)}
}

const failureToasterProps = e => ({
  type: 'error',
  message: e,
  autoClose: 2000
})
class CheatSheet extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      topics: this.getTopics(),
      selectedTopic: this.getSelectedTopic(),
      cheatSheets: [],
      isSignInModalVisible: false,
      isFavourite: false,
      isSignUpModalVisible: false,
      selectedCheatSheet: this.props.match.params.cheatsheetId,
    }
  }

  getSelectedTopic = () => {
    if (this.props.match.params.topicId) {
      return this.props.match.params.topicId
    } else {
      const topics = this.getTopics()
      if (topics.length === 0) {
        return ''
      } else {
        return get(sortBy(topics, 'order'), '[1].id')
      }
    }
  }

  getTopics = () => {
    if (this.props.cheatSheetTopics && this.props.cheatSheetTopics.toJS) {
      if (this.props.cheatSheetTopics.toJS().length > 0) {
        if (this.props.match.params.topicId) {
          if (this.props.match.params.topicId === 'favourites') {
            return [
              { title: 'Favourites', isSelected: true, id: 'favourites', tId: 0, order: 0 },
              ...sortBy(this.props.cheatSheetTopics.toJS(), 'order').map(cheatSheet => ({ ...cheatSheet, isSelected: false }))
            ]
          }
          const cheatSheetConcepts = this.props.cheatSheets.toJS()
          if (cheatSheetConcepts.length > 0) {
            const cheatSheetConceptsRelatedToTopic = cheatSheetConcepts.filter(concept => {
              return get(concept, 'topic.id') === this.props.match.params.topicId
            })
            if (cheatSheetConceptsRelatedToTopic.length > 0) {
              return [
                { title: 'Favourites', isSelected: false, id: 'favourites', tId: 0, order: 0 }, 
                ...sortBy(this.props.cheatSheetTopics.toJS(), 'order').map(cheatSheet =>
                  cheatSheet.id === this.props.match.params.topicId
                    ? { ...cheatSheet, isSelected: true }
                    : { ...cheatSheet, isSelected: false } 
                  )
              ]
            }
          } else {
            return []
          }
        } else {
          return [{ title: 'Favourites', isSelected: false, id: 'favourites', tId: 0, order: 0 }, ...sortBy(this.props.cheatSheetTopics.toJS(), 'order')]
        }
      }
    }
    return []
  }

  componentDidMount = async () => {
    const { isLoggedIn, match: { params } } = this.props
    if (this.state.topics.length > 0) {
      this.selectTopic({ id: this.state.selectedTopic }, this.state.selectedTopic)
    }
    if (isLoggedIn) {
      await fetchCurrentCourse()
    }
    if (params.topicId === 'favourites') {
      if (this.state.topics.length === 0) {
        await fetchTopics()
      }
      await fetchFavouriteCheats()
      return
    }
    if (!params.cheatsheetId) {
      if (this.state.topics.length === 0) {
        if (params.topicId) {
          // await fetchTopics()
          await fetchCheatSheets({ topicId: params.topicId, key: 'cheatSheetConcepts/' + params.topicId })
        } else {
          await fetchTopics()
        }
      }  else {
        if (isLoggedIn) {
          fetchCheatSheets({topicId: params.topicId, key: 'preventLoading' })
        }
          
      }
    } else if (params.cheatsheetId) {
      if (this.state.topics.length === 0) {
        await this.handleCheatSheetIdInput(params.cheatsheetId)
      } else {
        if (isLoggedIn) {
          fetchCheatSheets({topicId: params.topicId, key: 'preventLoading' })
        }
      }
    }
    if (isLoggedIn) {
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

  handleCheatSheetIdInput = async (id, data) => {
    this.setState({ selectedTopic: '' })
    if (data) {
      this.selectTopic(data, id)
    } else {
      await fetchTopics(id)
    }
    const conceptId = document.querySelector(`#${id}`)
    if (conceptId) {
      conceptId.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  componentDidUpdate = async (prevProps) => {
    const { fetchgetCheatSheetFailure, fetchFailureStatus, match: { params } } = this.props
    if (get(prevProps, 'cheatSheetTopics') !== get(this.props, 'cheatSheetTopics')) {
      this.setState({
        topics:
          this.props.cheatSheetTopics && this.props.cheatSheetTopics.toJS()
      },
        () => {
        this.setState({
          topics: sortBy([{ title: 'Favourites', isSelected: false, id: 'favourites', tId: 0, order: 0 },
            ...this.state.topics.map((topic, i) => ({ ...topic, tId: i + 1 }))], 'order')
        }, () => {
          if (params.cheatsheetId && this.state.topics.length > 0) {
            const { topics } = this.state
            const cards = document.querySelector('.scrollToCard')
            const order = get(topics.find(({ isSelected }) => isSelected), 'order', 0)
            if (cards) {
              this.navButton(null, (order * cards.offsetWidth))
            }
          }
          if (params.topicId && params.topicId !== "favourites" && !params.cheatsheetId) {
            this.selectTopic({ id: params.topicId })
          } else if (params.topicId && params.topicId === "favourites" && !params.cheatsheetId) {
            this.selectTopic({ title: 'Favourites', id: "favourites" })
          }
        })
      })
    }
    if (fetchgetCheatSheetFailure && !get(fetchgetCheatSheetFailure.toJS(), 'loading')
      && get(fetchgetCheatSheetFailure.toJS(), 'failure') &&
      (prevProps.fetchFailureStatus !== fetchFailureStatus)) {
      if (fetchFailureStatus && fetchFailureStatus.toJS().length > 0) {
        getToasterBasedOnType(failureToasterProps(get(get(fetchFailureStatus.toJS()[0], 'error').errors[0], 'message', ''), true))
      }
    }

    const { isLoggedIn, studentCurrentStatus, loggedInUser } = this.props
    if (window && window.fcWidget) {
      window.fcWidget.on("widget:opened",() => {
        renderChats({
          isLoggedIn,
          studentCurrentStatus,
          loggedInUser
        })
      })
    }
  }
  selectTopic = async (data, id) => {
    const topics = this.state.topics.map((topic, i) => get(topic, 'id') === get(data, 'id') ?
      ({ ...topic, isSelected: true }) : ({ ...topic, isSelected: false }))
    const { isLoggedIn } = this.props
    if (!id) {
      this.setState({ selectedCheatSheet: '' })
    }
    if (get(data, 'title') === 'Favourites' && isLoggedIn) {
      this.setState({
        selectedTopic: get(data, 'id'),
        topics
      }, () => {
        const { topics } = this.state
        const cards = document.querySelector('.scrollToCard')
        const order = get(topics.find(({ isSelected }) => isSelected), 'order', 0)
        this.navButton(null, (order * cards.offsetWidth))
      })
    } else if (get(data, 'title') === 'Favourites' && !isLoggedIn) {
      this.props.history.push('/login')
    } else {
      this.setState({
        selectedTopic: get(data, 'id'),
        topics,
      }, () => {
        const { topics } = this.state
        const cards = document.querySelector('.scrollToCard')
        if (cards) {
          const order = get(topics.find(({ isSelected }) => isSelected), 'order', 0)
          this.navButton(null, (order * cards.offsetWidth))
        }
      })
    }
  }
  navButton = (direction, position) => {
    const sliderHolder = document.querySelector('#sliderHolder')
    if (position) {
      sliderHolder.scrollTo({ left: position, behavior: 'smooth' })
    } else {
      let far = sliderHolder.clientWidth / 2*direction;
      let pos = sliderHolder.scrollLeft + far;
      sliderHolder.scrollTo({ left: pos, behavior: 'smooth' })
    }
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
  closeLoginModal = async () => {
    const { isLoggedIn, match: { params } } = this.props;
    if (isLoggedIn) {
      this.checkIfMulitpleChildrenExists()
      fetchCurrentCourse()
      if (!params.cheatsheetId) {
        if (this.state.topics.length === 0) {
          if (params.topicId) {
            await fetchCheatSheets({ topicId: params.topicId, key: 'cheatSheetConcepts/' + params.topicId })
          } else {
            await fetchTopics()
          }
        }  else {
          if (isLoggedIn) {
            fetchCheatSheets({topicId: params.topicId, key: 'preventLoading' })
          }
        }
      } else if (params.cheatsheetId) {
        await fetchTopics(params.cheatsheetId)
      } else {
        await fetchTopics()
      }
      const cards = document.querySelector('.scrollToCard')
      if (cards) {
        cards.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    this.setState({
      isSignInModalVisible: false
    })
  }
  addBookmark = memoDebounce(async (data) => {
    const { isLoggedIn, userId, courses } = this.props
    const courseId = courses && courses.toJS().length > 0 && get(courses.toJS()[0], 'id')
    if (!isLoggedIn) {
      this.props.history.push('/login')
    } else {
      let input = {
        isBookmarked: true
      }
      if (get(data, 'isBookmarked', false) === true) {
        input = {
          isBookmarked: false
        }
      }
      if (get(data, 'userCheatSheetId')) {
        await updateUserCheatSheet({
          input,
          id: get(data, 'userCheatSheetId'),
          cheatsheetConnectId: get(data, 'id'),
          userConnectId: userId,
          courseConnectId: courseId || ''
        })
      } else {
          await addUserCheatSheet({
            input,
            cheatsheetConnectId: get(data, 'id'),
            userConnectId: userId,
            courseConnectId: courseId || ''
          })
      }
    }
  }, 200)

  isCustomHeaderVisible = () => {
    const { isLoggedIn, match } = this.props
    if ((!isLoggedIn || isMobile()) && match.path.split('/').includes('cheatsheet')) {
      return true
    }
    return false
  }
  
  openEnrollmentForm = () => {
  this.setState({
    selectedCheatSheet: '',
    isSignUpModalVisible: true
  })
  }
  closeSignupModal = () => {
    this.setState({
      isSignUpModalVisible: false
    })
  }
  render() {
    const {
      topics, selectedTopic, isSignInModalVisible,
      isSignUpModalVisible, selectedCheatSheet
    } = this.state
    const { ischeatSheetTopicsFetching } = this.props
    return (
      <>
      <Helmet>
        <link rel="canonical" href="https://www.tekie.in" />
        <title>Tekie - Coding cheat-sheet for quick help</title>
        <meta name="description"  content="We summarise the most commonly used python basics when you need to get quick help while coding."></meta>
        <meta name="keywords" content="tekie,tekie coding,tekie in,tekie app,tekie coding classes,tekie review,tekie classes,tekie india,tekie online coding,tekie online class,tekie online demo,python for kids,coding for kids,best python course for kids,python coding for kids, online coding platform for python, python online course for kids,best coding classes for kids,live online coding classes for kids, best coding classes for kids, best programming courses for kids,online coding programs for kids,programming classes for kids" />
      </Helmet>
      <div>
          <div>
            {this.isCustomHeaderVisible() && (
              <Header
                logoClickable
                pageLink='cheatsheet'
                position={'sticky'}
                openLogin={() => {
                  // this.setState({
                  //   selectedCheatSheet: '',
                  //   isSignInModalVisible: true
                  // })
                  this.props.history.push('/login')
                }}
                openEnrollmentForm={this.openEnrollmentForm}
              />
            )}
          </div>
          <ChatWidget />
        <div className={'cheatsheet-cheatSheetsContainer'}>
          <div>
            <TopicContainer
              topics={topics}
              selectedTopic={selectedTopic}
              selectTopic={this.selectTopic}
              navButton={this.navButton}
              handleCheatSheetIdInput={this.handleCheatSheetIdInput}
              addBookmark={this.addBookmark}
              selectedCheatSheet={selectedCheatSheet}
              selectCheatSheet={(value) => this.setState({ selectedCheatSheet: value })}
              {...this.props}
            />
          </div>
          <div>
            <ContentArea
              selectedTopic={selectedTopic}
              topics={topics}
              addBookmark={this.addBookmark}
              isSignUpModalVisible={isSignUpModalVisible}
                isSignInModalVisible={isSignInModalVisible}
                selectedCheatSheet={selectedCheatSheet}
              selectCheatSheet={(value) => this.setState({ selectedCheatSheet: value })}
              {...this.props}
            />
          </div>
          {(!ischeatSheetTopicsFetching && topics.length > 0) ? <span className='cheatsheet-page-mixpanel-identifier' /> : null}
          {
            ischeatSheetTopicsFetching && topics.length > 0 ? <div /> : (
              <div>
                <Footer
                  selectTopic={this.selectTopic}
                  totalTopic={topics.length}
                    topics={topics}
                    selectedTopic={selectedTopic}
                  ischeatSheetTopicsFetching={ischeatSheetTopicsFetching}
                />
              </div>
            )
          }
          
          <div>
            <AuthModalContainer
              isSignInModalVisible={isSignInModalVisible}
              isSignUpModalVisible={isSignUpModalVisible}
              closeLoginModal={this.closeLoginModal}
              openEnrollmentForm={() => this.openEnrollmentForm('noScroll')}
              closeSignupModal={this.closeSignupModal}
            />
          </div>
          </div>
      </div>
      </>
    ) 
  }
}

CheatSheet.serverFetch = async (params = {}) => {
  if (params.topicId) {
    await fetchCheatSheets({ topicId: params.topicId, key: 'cheatSheetConcepts/' + params.topicId })
  } else {
    await fetchTopics(params.cheatsheetId)
  }
}
export default withRouter(CheatSheet)
