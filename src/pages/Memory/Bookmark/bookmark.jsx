import React from 'react'
import Sidebar from '../components/sidebar'
import styles from './bookmark.module.scss'
import Searchbar from '../components/MainContent/Searchbar'
import { LEARNING_VIDEOS, CHATS, STORYBITS, OVERVIEW_VIDEOS, PRACTICE_QUESTIONS, BOOKMARK_SECTION, LEARNING_OBJECTIVES } from '../../../utils/constants'
import PracticeComponent from '../components/MainContent/PracticeComponent'
import ChatComponent from '../components/MainContent/ChatComponent'
import MultiDeleteBar from '../components/MultiDeleteBar'
import VideoComponent from '../components/MainContent/VideoComponent'
import deleteBookmarkVideos from '../../../queries/deleteVideosBookmark'
import deleteuserLO from '../../../queries/deleteLearningObjectivesBookmark'
import UndoBanner from '../components/snackbar'
import CardSkeleton from '../components/cardskeleton'
import {ReactComponent as TriangleBG} from '../../../assets/triangleBG.svg'
import {
  emptyBookmarkVideo,
  emptyBookmarkChat,
  uhohMessage
} from '../../../constants/memory/messages'

class Bookmark extends React.Component {
  tobeDeletedItems = []
  activeTimers = []
  state ={
    data : [],
    multipleDeleteEnabled : false,
    selectType : 0,
    restoreList: [],
    lastBulkDeletedItems: [],
    isSnackBarVisible: false,
    totalItemsCount: 0
  }
  async componentDidMount(){
    const { isGuestMode } = this.props
    if (!isGuestMode) {
      this.setBookmarkData()
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.location.pathname !== this.props.location.pathname ||
      !prevProps.userLearningObjective.equals(
        this.props.userLearningObjective
      ) ||
      !prevProps.userVideo.equals(this.props.userVideo)
    ) {
      this.setBookmarkData()
    }
  }

  componentWillUnmount() {
    if (this.deleteTimeout) {
      clearTimeout(this.deleteTimeout)
    }
    if (this.deleteMultipleTimeout) {
      clearTimeout(this.deleteMultipleTimeout)
    }
  }

  // set the bookmark data to state
  setBookmarkData = (searchItems = null) => {
    let totalItemsCount = 0
    let totalCheckedItemsCount = 0
    let dataObjects = []
    if (searchItems) {
      dataObjects = searchItems
      searchItems.forEach(dataItem => {
        if (dataItem.isCardVisible) {
          totalItemsCount += 1
          if (dataItem.clicked) {
            totalCheckedItemsCount += 1
          }
        }
      })
    } else {
      const {data,location} = this.props
      const currentSection = location.pathname.replace('/memory/bookmarks/','');
      const keyPresentInData = currentSection === 'Video' ? 'Learning Videos' : 'Chats'
      data[keyPresentInData].body
        .filter(card => {
          return !(
            this.tobeDeletedItems.length &&
            this.tobeDeletedItems.some(
              item => card.itemId === item.itemId && keyPresentInData === item.type
            )
          )
        })
        .forEach(card => {
          dataObjects.push({
            ...card,
            type: keyPresentInData,
            clicked: false,
            key: `${card.itemId}.${card.type}`,
            isCardVisible: true
          })
          totalItemsCount += 1
        })
    }
    this.setState({
      data: dataObjects,
      totalItemsCount,
      selectType: totalCheckedItemsCount < totalItemsCount ? 0 : 1
    })
  }

  setData = data => {
    this.setBookmarkData(data)
  }
  setMultipleSelection = value => {
    this.setState({
      multipleDeleteEnabled : value
    })
  }
  setSelectType = selectType => {
    this.setState({
      selectType
    })
  }

  deleteMultipleItems = () => {
    let data = [...this.state.data]
    let isDeleteCountZero = true
    data.forEach(dataItem => {
      if (dataItem.clicked) {
        if (dataItem.isCardVisible) {
          isDeleteCountZero = false
        }
      }
    })
    if (isDeleteCountZero) {
      return
    }
    this.setState(prevState => ({
      restoreList: prevState.data,
      multipleDeleteEnabled: false,
      isSnackBarVisible: true,
      selectType: 0
    }))
    const itemsDelete = {
      [LEARNING_VIDEOS]: [],
      [CHATS]: [],
      [PRACTICE_QUESTIONS]: [],
      [LEARNING_OBJECTIVES]: []
    }
    const lastBulkDeletedItems = []
    data = data.filter(dataItem => {
      if (!dataItem.isCardVisible) {
        return true
      }
      if (!dataItem.clicked) {
        return true
      }
      const type = dataItem.type
      if (type === LEARNING_VIDEOS) {
        lastBulkDeletedItems.push({
          id: dataItem.itemId,
          type: LEARNING_VIDEOS
        })
        itemsDelete[type].push({
          id: dataItem.itemId,
          fields: { isBookmarked: false }
        })
        this.tobeDeletedItems.push({
          itemId: dataItem.itemId,
          type: LEARNING_VIDEOS
        })
      } else if (type === PRACTICE_QUESTIONS) {
        lastBulkDeletedItems.push({
          id: dataItem.itemId,
          type: PRACTICE_QUESTIONS
        })
        itemsDelete[type].push({
          id: dataItem.itemId,
          fields: { isPracticeQuestionBookmarked: false }
        })
        this.tobeDeletedItems.push({
          itemId: dataItem.itemId,
          type: LEARNING_OBJECTIVES
        })
      } else {
        lastBulkDeletedItems.push({ id: dataItem.itemId, type: CHATS })
        itemsDelete[type].push({
          id: dataItem.itemId,
          fields: { isChatBookmarked: false }
        })
        this.tobeDeletedItems.push({
          itemId: dataItem.itemId,
          type: LEARNING_OBJECTIVES
        })
      }
      return false
    })
    this.setState({
      data,
      lastBulkDeletedItems
    })
    function mergeArrays(arrays, prop) {
      const merged = {}
      arrays.forEach(arr => {
        arr.forEach(item => {
          const { id, fields } = item
          let previousFields = null
          if (merged[item[prop]]) {
            previousFields = merged[item[prop]].fields
          }
          merged[item[prop]] = {
            id,
            fields: { ...fields, ...previousFields }
          }
        })
      })

      return Object.values(merged)
    }
    itemsDelete[LEARNING_OBJECTIVES] = mergeArrays(
      [itemsDelete[CHATS], itemsDelete[PRACTICE_QUESTIONS]],
      'id'
    )
    this.deleteMultipleTimeout = setTimeout(() => {
      this.deleteMultipleTimeout = null
      this.setState({
        isSnackBarVisible: false
      })
      this.deleteMultipleItemsDelayed(itemsDelete)
    }, 4000)
  }

  // item deleting logic(backend call)
  deleteMultipleItemsDelayed = itemsDelete => {
    Promise.all([
      itemsDelete[LEARNING_VIDEOS].length > 0
        ? deleteBookmarkVideos(itemsDelete[LEARNING_VIDEOS])
        : [],
      itemsDelete[LEARNING_OBJECTIVES].length > 0
        ? deleteuserLO(itemsDelete[LEARNING_OBJECTIVES])
        : []
    ])
      .then(() => {
        this.tobeDeletedItems = []
      })
      .catch(error => {
        this.setState(prev => ({
          data: prev.restoreList,
          isSnackBarVisible: false,
          lastBulkDeletedItems: []
        }))
      })
  }

  // undo deleted items
  restoreDeleteItems = () => {
    clearTimeout(this.deleteTimeout)
    clearTimeout(this.deleteMultipleTimeout)
    const { multipleDeleteEnabled } = this.state
    this.tobeDeletedItems.pop()
    const restoreData = [...this.state.restoreList].map(dataItem => ({
      ...dataItem,
      ...(!multipleDeleteEnabled && { clicked: false })
    }))
    this.setState({
      data: restoreData,
      isSnackBarVisible: false,
      lastBulkDeletedItems: [],
      restoreList: restoreData
    })
  }

  // logic to hide checkboxes
  onBackPress = () => {
    this.setState({
      multipleDeleteEnabled: false
    })
    this.setState(prevState => {
      return {
        data: prevState.data.map(dataItem => {
          if (dataItem.clicked) {
            return {
              ...dataItem,
              clicked: false
            }
          }
          return dataItem
        }),
        selectType: 0
      }
    })
  }

  // toggle between selectAll/unselectAll
  selectToggle = value => {
    requestAnimationFrame(() => {
      this.setState(prevState => {
        return {
          data: prevState.data.map(dataItem => {
            if (dataItem.isCardVisible) {
              return {
                ...dataItem,
                clicked: value
              }
            }
            return dataItem
          }),
          selectType: prevState.selectType === 0 ? 1 : 0
        }
      })
    })
  }

  // check/uncheck each row when multiple delete mode is enabled
  selectItemToggle = item => {
    let totalCheckedItemsCount = 0
    const {
      data: prevData,
      multipleDeleteEnabled,
      totalItemsCount
    } = this.state
    if (multipleDeleteEnabled) {
      const newData = prevData.map(dataItem => {
        if (item.itemId === dataItem.itemId) {
          if (dataItem.clicked) {
            totalCheckedItemsCount -= 1
          } else {
            totalCheckedItemsCount += 1
          }
          return {
            ...dataItem,
            clicked: !dataItem.clicked
          }
        }
        if (dataItem.clicked && dataItem.isCardVisible) {
          totalCheckedItemsCount += 1
        }
        return dataItem
      })
      this.setState({
        data: newData,
        selectType: totalCheckedItemsCount < totalItemsCount ? 0 : 1
      })
    }
  }

  // enables multiple delete mode on long press of items
  multipleDeleteEnabled = (cb) => {
    if(!this.state.multipleDeleteEnabled){
      this.setState({
        multipleDeleteEnabled: true
      },()=>{
        cb()
      })
    }
  }
  handleMultiSelectBar = (e,item) => {
    const {multipleDeleteEnabled} = this.state
    if(multipleDeleteEnabled){
      this.selectItemToggle(item)
    }else{
      this.multipleDeleteEnabled(()=>this.selectItemToggle(item))
    }
  }
  hideUndoBanner = () => {
    this.setState({
      isSnackBarVisible : false
    })
  }
  /**
   * @param {MouseEvent} e
   * @param {Object} cardData contains data about the row
   */
  handleNavigation = (e,cardData) => {
    if(this.state.multipleDeleteEnabled){
      return
    }
    if(e.target.tagName !== 'DIV'){
      return
    }
    const { pathname: path } = this.props.location;
    let bookmarkSection = path.replace('/memory/bookmarks/','');
    const userRoleType = this.props.user.get('role')
    const sessionPrefix = userRoleType === 'mentee' ? '/revisit/sessions': ''
    switch (bookmarkSection) {
      case 'Video':
        this.props.history.push(`${sessionPrefix}/video/${cardData.id}`)
        break;
      case 'Chats':
        this.props.history.push(`${sessionPrefix}/chat/${cardData.topics[0].id}/${cardData.id}`)
        break;
      /* case 'Practice Questions':
        props.history.push(`/practice/${cardData.topics[0].id}/${cardData.id}`)
        break;
      case 'Quizzes':
        props.history.push(`/quiz/${cardData.id}`)
        break; */
      default:
        break;
    }
  }
  renderRowComponent = (item, props) => {
    const { type, isCardVisible } = item
    let ComponentToRender = null
    switch (type) {
      case STORYBITS:
      case LEARNING_VIDEOS:
      case OVERVIEW_VIDEOS:
        ComponentToRender = VideoComponent
        break
      case CHATS:
        ComponentToRender = ChatComponent
        break
      case PRACTICE_QUESTIONS:
        ComponentToRender = PracticeComponent
        break
      default:
        break
    }
    if (!isCardVisible) return null
    return (
      <ComponentToRender
        style={{
          backgroundColor: 'white',
          marginBottom: '2px'
        }}
        {...item}
        {...props}
        from={BOOKMARK_SECTION}
        // onLongPress={this.multipleDeleteEnabled}
        // onPress={() => this.selectItemToggle(item)}
        handleSelection = {(e)=>this.handleMultiSelectBar(e,item)}
        delayLongPress={500} /** Change here for delay for long press */
        useForeground
        {...item}
        multipleDeleteEnabled={this.state.multipleDeleteEnabled}
        selectAll={this.state.selectType}
        onClick={this.handleNavigation}
      />
    )
  }

  getMessage = (bookmarkSection) => {
    let message = ''
    switch (bookmarkSection) {
      case LEARNING_VIDEOS:
        message = emptyBookmarkVideo
        break
      case CHATS:
        message = emptyBookmarkChat
        break
      default:
        break
    }
    return message
  }

  render() {
    const { pathname: path } = this.props.location;
    let isRewatch = path.replace('/memory/', '').match(/rewatch/g);
    const currentSection = isRewatch ? 'rewatch' : 'bookmarks'
    let bookmarkSection;
    bookmarkSection = path.replace('/memory/bookmarks/','');
    switch(bookmarkSection){
      case 'Video':
        bookmarkSection = LEARNING_VIDEOS;
        break;
      case 'Chats':
        bookmarkSection = CHATS
        break;
      default:
        return <div className={styles.wrapper}></div>;
    }
    return (
      <div className={styles.wrapper}>
        <Sidebar
          {...this.props}
        />
        <div className={styles.mainWrapper}>
          <div className={styles.triangleBGContainer}>
            <TriangleBG />
          </div>
          {
            this.props.isLoading && (
              <div className={styles.section}>
                {
                  [...Array(5)].map((_,index)=>{
                    return <CardSkeleton key={index}/>
                  })
                }
              </div>
            )
          }
          {
            !this.props.isLoading && (
              this.state.data.length > 0 ? (
                <React.Fragment>
                  <Searchbar data={this.state.data} setData={this.setData} currentSection={currentSection} bookmarkSection={bookmarkSection}/>
                  {this.state.multipleDeleteEnabled && (
                    <MultiDeleteBar
                      onBackPress={this.onBackPress}
                      selectToggle={this.selectToggle}
                      onSelectedPress={this.deleteMultipleItems}
                      selectType={this.state.selectType}
                    />
                  )}
                  {
                    this.state.data.length ? (
                      <div className={styles.section}>
                        <div className={styles.mainTitle}>{this.state.data[0].type}</div>
                        {this.state.data.map(row => {
                          return this.renderRowComponent(row, {
                            currentSection: currentSection,onChange: this.multipleDeleteEnabled
                          })
                        })}
                      </div>
                    ) : null
                  }
                </React.Fragment>
              ):(
                  <div className={styles.messageContainer}>
                    <div className={styles.uhohMsgContainer}>
                      {uhohMessage}
                    </div>
                    <div className={styles.emptyMsgContainer}>
                      {this.getMessage(bookmarkSection)}
                    </div>
                  </div>
              )
            )
          }
          {this.state.isSnackBarVisible && (
            <UndoBanner
              undo={this.restoreDeleteItems}
              deletedItemsCount={this.state.lastBulkDeletedItems.length}
              dismissBanner={this.hideUndoBanner}
            />
          )}
        </div>
      </div>
    )
  }
}
export default Bookmark
