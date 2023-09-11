import React from 'react'
import styles from './sidebar.module.scss'
import { withRouter } from 'react-router-dom'
import fetchVideosRewatch from '../../../../queries/fetchLearningVideosRewatch'
import fetchChatRewatch from '../../../../queries/fetchChatRewatch'
import fetchPracticeRewatch from '../../../../queries/fetchPracticeRewatch'
import fetchUserProfileRewatch from '../../../../queries/fetchUserProfileRewatch'
import fetchLOBookmarks from '../../../../queries/fetchUserLearningObjectivesBookmark'
import fetchVideoBookmarks from '../../../../queries/fetchUserVideosBookmark'
import HistoryIcon from '../history'
import CloudSidebar from '../cloudSideBar'

const rewatchNavItems = ['Videos', 'Storybits', 'Chats', 'Practice Questions', 'Quizzes']
const bookmarkNavItems = ['Video', 'Chats']

const RenderRewatchNavItems = ({ props, changeNav, activeItem }) => {
  return (
    <nav>
      {
        rewatchNavItems.map(navItem =>
          <div key={navItem} className={`${styles.navItem} ${navItem === activeItem && styles.activeItem}`} role='navigation'
            onClick={(e) => {
              e.preventDefault();
              props.history.replace({ pathname: `/memory/rewatch/${navItem}` })
              changeNav(navItem, 'Rewatch')
            }}
          >
            <div className={styles.navBarIcon}>
              <div className={styles.historyWrapper}>
                <HistoryIcon/>
              </div>
            </div>
            <a href='#0' className={styles.navText}>
              {navItem}
            </a>
          </div>
        )
      }
    </nav>
  )
}

const RenderBookmarkNavItems = ({ props, changeNav, activeItem }) => {
  return (
    <nav>
      {
        bookmarkNavItems.map(navItem =>
          <div key={navItem} className={`${styles.navItem} ${navItem === activeItem && styles.activeItem}`} role='navigation'
            onClick={(e) => {
              e.preventDefault();
              props.history.replace({ pathname: `/memory/bookmarks/${navItem}` })
              changeNav(navItem, 'Bookmark')
            }}
          >
            <div className={styles.navBarIcon}>
              <div className={styles.historyWrapper}>
                <HistoryIcon/>
              </div>
            </div>
            <a href='#0' className={styles.navText}>
              {navItem}
            </a>
          </div>
        )
      }
    </nav>
  )
}

const fetchByRoute = (pathname, userId,props) => {
  const memorySectionPath = pathname.replace('/memory/', '');
  const isRewatch = memorySectionPath.match('rewatch')
  let activeItem;
  if (isRewatch) {
    activeItem = pathname.replace('/memory/rewatch/', '');
  } else {
    activeItem = pathname.replace('/memory/bookmarks/', '');
  }
  if (isRewatch) {
    switch (activeItem) {
      case 'Videos':
        if(!props.videosFetchSuccess){
          fetchVideosRewatch(userId);
        }
        break;
      case 'Chats':
        if(!props.chatFetchSuccess){
          fetchChatRewatch(userId);
        }
        break;
      case 'Practice Questions':
        if(!props.practiceFetchSuccess){
          fetchPracticeRewatch(userId);
        }
        break;
      case 'Quizzes':
        if(!props.quizFetchSuccess){
          fetchUserProfileRewatch(userId);
        }
        break;
      default:
        break;
    }
  } else {
    if(!props.videosFetchSuccess){
      fetchLOBookmarks(userId);
    }
    if(!props.loFetchSuccess){
      fetchVideoBookmarks(userId);
    }
  }
}

class Sidebar extends React.Component {
  state = {
    currentSection: 'rewatch',
    lastActiveRewatch: 'Videos',
    lastActiveBookmark: 'Video',
  }

  componentDidMount() {
    const memorySectionPath = this.props.history.location.pathname.replace('/memory/', '');
    const isRewatch = memorySectionPath.match('rewatch')
    let activeItem;
    if (isRewatch) {
      activeItem = this.props.history.location.pathname.replace('/memory/rewatch/', '');
    } else {
      activeItem = this.props.history.location.pathname.replace('/memory/bookmarks/', '');
    }
    this.setState({
      currentSection: isRewatch ? 'rewatch' : 'bookmarks',
      [`lastActive${isRewatch ? 'Rewatch' : 'Bookmark'}`]: activeItem
    })
    fetchByRoute(this.props.history.location.pathname, this.props.user.get('id'),this.props);
  }

  changeSection = section => {
    this.setState({
      currentSection: section
    })
    const navItem = section === 'rewatch' ? this.state.lastActiveRewatch : this.state.lastActiveBookmark;
    this.props.history.replace({
      pathname: `/memory/${section}/${navItem}`
    })
    fetchByRoute(this.props.history.location.pathname, this.props.user.get('id'),this.props);
  }

  changeLastActiveItemBySection = (category, section) => {
    this.setState({
      [`lastActive${section}`]: category
    })
    if (section === 'Rewatch') {
      fetchByRoute(this.props.history.location.pathname, this.props.user.get('id'),this.props);
    }
  }
  render() {
    const { currentSection, lastActiveBookmark, lastActiveRewatch } = this.state
    const activeItem = currentSection === 'rewatch' ? lastActiveRewatch : lastActiveBookmark
    return (
      <div className={styles.wrapper}>
        <div className={styles.tab}>
          <div className={`${styles.tabButton} ${currentSection === 'rewatch' && styles.activeTab}`} onClick={() => this.changeSection('rewatch')}>
            Rewatch
          </div>
          <div className={`${styles.tabButton} ${currentSection === 'bookmarks' && styles.activeTab}`} onClick={() => this.changeSection('bookmarks')}>
            Bookmarks
          </div>
        </div>
        {
          currentSection === 'rewatch' && <RenderRewatchNavItems props={this.props} changeNav={this.changeLastActiveItemBySection} activeItem={activeItem}/>
        }
        {
          currentSection === 'bookmarks' && <RenderBookmarkNavItems props={this.props} changeNav={this.changeLastActiveItemBySection} activeItem={activeItem}/>
        }
        <div className={styles.cloudSideBar}>
          <CloudSidebar/>
        </div>
      </div>
    )
  }
}

export default withRouter(Sidebar)
