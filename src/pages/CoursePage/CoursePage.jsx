import React, { Component } from 'react'
import { withRouter } from 'react-router'
import cx from 'classnames'
import { get } from 'lodash'
import ContentLoader from 'react-content-loader'
// import './CoursePage.scss'
import { Button3D } from '../../photon'
import { getCourseName } from '../../utils/getCourseId'
import CollapsibleTopics from '../../components/CollapsibleTopics/CollapsibleTopics'
import YoutubeEmbed from '../LandingPage/components/YoutubeEmbed'
import getPath from '../../utils/getPath'
import formatDate from '../../utils/date-utils/formateDate'
import getSlotLabel from '../../utils/slots/slot-label'
import Header from '../CodeShowcaseModule/components/Header'
import AuthModalContainer from '../CodeShowcaseModule/components/AuthModalContainer'

const CalendarIcon = () => (
  <svg width='100%' height='100%' fill="none"  viewBox="0 0 35 35">
  <path
      d="M0 31.41V9.87h35V31.41A3.648 3.648 0 0131.316 35H3.684A3.649 3.649 0 010 31.41z"
      fill="#B9F6FF"
  />
  <path
      d="M35 6.282v5.389H0V6.282a3.648 3.648 0 013.684-3.59h27.631A3.648 3.648 0 0135 6.282z"
      fill="#FF5744"
  />
  <path
      d="M25.795 3.59a2.694 2.694 0 102.757 2.693 2.728 2.728 0 00-2.757-2.693zm-16.585 0a2.694 2.694 0 102.763 2.693A2.73 2.73 0 009.21 3.59z"
      fill="#B71C1C"
  />
  <path
      d="M25.79 0a1.825 1.825 0 00-1.842 1.795v4.488a1.842 1.842 0 003.684 0V1.795A1.825 1.825 0 0025.79 0zM9.212 0a1.825 1.825 0 00-1.843 1.795v4.488a1.843 1.843 0 003.684 0V1.795A1.825 1.825 0 009.212 0z"
      fill="#B0BEC5"
  />
  <path
      d="M7.37 15.256h3.683v3.59H7.369v-3.59zm5.525 0h3.684v3.59h-3.684v-3.59zm5.527 0h3.683v3.59h-3.683v-3.59zm5.526 0h3.684v3.59h-3.684v-3.59zM7.369 20.641h3.684v3.594H7.369V20.64zm5.526 0h3.684v3.594h-3.684V20.64zm5.527 0h3.683v3.594h-3.683V20.64zm5.526 0h3.684v3.594h-3.684V20.64zM7.369 26.025h3.684v3.59H7.369v-3.59zm5.526 0h3.684v3.59h-3.684v-3.59zm5.527 0h3.683v3.59h-3.683v-3.59zm5.526 0h3.684v3.59h-3.684v-3.59z"
      fill="#00ADE6"
  />
  </svg>
)

const ClockIcon = () => (
  <svg width={'100%'} height={'100%'} fill="none" viewBox="0 0 35 35">
  <path
      d="M17.258 33.988c9.385 0 16.994-7.608 16.994-16.994S26.643 0 17.258 0C7.872 0 .264 7.608.264 16.994s7.608 16.994 16.994 16.994z"
      fill="#B9F6FF"
  />
  <path
      d="M17.26.483a17.258 17.258 0 1017.257 17.259A17.277 17.277 0 0017.26.483zm0 31.599A14.341 14.341 0 1131.6 17.74 14.358 14.358 0 0117.26 32.08z"
      fill="#00ADE6"
  />
  <path
      d="M22.97 18.632h-5.56v-8.306a1.19 1.19 0 10-2.382 0v9.5a1.191 1.191 0 001.19 1.192h6.751a1.191 1.191 0 000-2.382v-.004z"
      fill="#00ADE6"
  />
  </svg>
)

class CoursePage extends Component {
  state = {
    tabItemsWidth: [],
    activeTab: 0,
    tabItemsPadding: [],
    isSignInModalVisible: false,
    isSignUpModalVisible: false,
    trailerVisible: false
  }

  componentDidMount() {
    this.setTabWidth()
    window.addEventListener('resize', this.setTabWidth)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setTabWidth)
  }

  getDate = () => {
    const {
        bookingDate, loggedInUser, intlBookingDate
    } = this.props.bookSessionProps
    const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
    if (bookingDate) {
        if (country !== 'india') {
            return formatDate(new Date(intlBookingDate)).date
        } else {
            return formatDate(new Date(bookingDate)).date
        }
    }
    return 'Session Date'
  }

  getSlotTimeLabel = (slotTime) => {
    const slotLabel = getSlotLabel(slotTime)
    return `${slotLabel.startTime} - ${slotLabel.endTime}`
  }

  getTime = () => {
    const { slotTime, loggedInUser, intlSlotTime } = this.props.bookSessionProps
    const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
    if (slotTime || slotTime === 0) {
        if (country !== 'india') {
            return intlSlotTime
        } else {
            return this.getSlotTimeLabel(slotTime)
        }
    }
    return 'Session Timing'
  }

  setTabWidth = () => {
    const tabItemsWidth = []
    const tabWrapper = document.querySelector('#cp-tab-wrapper')
    if (!tabWrapper) return
    const tabItems = tabWrapper.children;
    const tabItemsPadding = []
    for (let i = 0; i < tabItems.length; i++) {
      if (tabItems[i].id !== 'cp-tab-active-bg') {
        tabItemsWidth.push(tabItems[i].offsetWidth);
        if (i === 1) {
          tabItemsPadding.push(0)
        } else {
          tabItemsPadding.push(
            tabItems[i].getBoundingClientRect().x - tabItems[1].getBoundingClientRect().x
          )
        }
      }
    }
    this.setState({ tabItemsWidth, tabItemsPadding })
  }

  renderCourseIcon = (gradient = false) => (
    <svg width='100%' height='100%' viewBox='0 0 31 31' fill="none">
      <defs>
        <linearGradient id="cp-course-icon" x1="26.3343" y1="13.0007" x2="-0.468897" y2="13.0008" gradientUnits="userSpaceOnUse">
        <stop stop-color="#35E4E9"/>
        <stop offset="1" stop-color="#00ADE6"/>
        </linearGradient>
      </defs>
      <path
        d="M15.538 9.688v17.438m0-17.438c.972-3.824 4.64-5.776 12.627-5.812a.97.97 0 01.971.969v17.437a.967.967 0 01-.971.969c-7.77 0-10.772 1.563-12.627 3.875-1.843-2.3-4.856-3.875-12.626-3.875-.6 0-.972-.487-.972-1.086V4.845a.963.963 0 01.972-.969c7.987.036 11.655 1.988 12.626 5.812z"
        stroke={"#00ADE6"}
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  renderSessionIcon = () => (
    <svg width="100%" height="100%" viewBox="0 0 32 31" fill="none">
      <path
        d="M10.4482 22.2749H27.9313M10.4482 8.7124H27.9313H10.4482ZM10.4482 15.4937H27.9313H10.4482Z"
        stroke="#00ADE6"
        strokeWidth="2.24989"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.59921 9.68115C6.13563 9.68115 6.57049 9.24743 6.57049 8.7124C6.57049 8.17738 6.13563 7.74365 5.59921 7.74365C5.06279 7.74365 4.62793 8.17738 4.62793 8.7124C4.62793 9.24743 5.06279 9.68115 5.59921 9.68115Z"
        stroke="#00ADE6"
        strokeWidth="2.24989"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.59921 16.4629C6.13563 16.4629 6.57049 16.0292 6.57049 15.4941C6.57049 14.9591 6.13563 14.5254 5.59921 14.5254C5.06279 14.5254 4.62793 14.9591 4.62793 15.4941C4.62793 16.0292 5.06279 16.4629 5.59921 16.4629Z"
        stroke="#00ADE6"
        strokeWidth="2.24989"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.59921 23.2476C6.13563 23.2476 6.57049 22.8138 6.57049 22.2788C6.57049 21.7438 6.13563 21.3101 5.59921 21.3101C5.06279 21.3101 4.62793 21.7438 4.62793 22.2788C4.62793 22.8138 5.06279 23.2476 5.59921 23.2476Z"
        stroke="#00ADE6"
        strokeWidth="2.24989"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  renderMentorIcon = () => (
    <svg width="100%" height="100%" viewBox="0 0 32 31">
      <path
        d="M21.7753 20.9367L21.7751 20.9366C20.2357 19.9512 18.2841 19.4079 16.2802 19.4079C14.2763 19.4079 12.3246 19.9512 10.7853 20.9366L10.7851 20.9368C10.0327 21.4107 9.37089 22.0143 8.83042 22.7194L8.80252 22.698M21.7753 20.9367L8.42979 22.7174L8.40401 22.7413C8.40402 22.7413 8.40403 22.7413 8.40403 22.7413C8.43172 22.7711 8.46564 22.7945 8.50339 22.8099C8.54115 22.8252 8.58183 22.832 8.62253 22.8299C8.66324 22.8278 8.70298 22.8168 8.73894 22.7976C8.77491 22.7785 8.80622 22.7517 8.83065 22.7191L8.80252 22.698M21.7753 20.9367C22.5276 21.4109 23.1895 22.0147 23.7299 22.72L23.7578 22.6986L23.7297 22.7197C23.7541 22.7523 23.7854 22.7791 23.8214 22.7982C23.8574 22.8174 23.8971 22.8284 23.9378 22.8305C23.9785 22.8326 24.0192 22.8258 24.0569 22.8105C24.0947 22.7951 24.1286 22.7717 24.1563 22.7419L21.7753 20.9367ZM8.80252 22.698C9.34552 21.9896 10.0105 21.3832 10.7663 20.907L8.80252 22.698ZM3.68867 15.6728C3.59303 8.60996 9.37416 2.84375 16.4557 2.93915C23.2473 3.03335 28.7772 8.54902 28.8705 15.3239C28.9673 22.3868 23.1874 28.153 16.1046 28.0563C9.31306 27.9622 3.7831 22.4465 3.68867 15.6728Z"
        fill="#00ADE6"
        stroke="#00ADE6"
        strokeWidth="0.0703092"
      />
      <path
        d="M16.2825 8.7124C15.0854 8.7124 14.0031 9.15984 13.2339 9.97299C12.4648 10.7861 12.0805 11.9105 12.1673 13.1172C12.3434 15.4937 14.1894 17.4312 16.2825 17.4312C18.3756 17.4312 20.218 15.4937 20.3977 13.1178C20.4876 11.9226 20.1063 10.8085 19.3245 9.98025C18.5523 9.16287 17.4717 8.7124 16.2825 8.7124Z"
        fill="#00ADE6"
      />
    </svg>
  )
  
  renderPricingIcon = () => (
    <svg width="100%" height="100%" viewBox="0 0 32 31">
      <path d="M16.2822 1.2915V29.7082" stroke="#00ADE6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22.7582 6.4585H13.0453C11.8432 6.4585 10.6903 6.9348 9.84028 7.78262C8.99024 8.63044 8.5127 9.78033 8.5127 10.9793C8.5127 12.1783 8.99024 13.3282 9.84028 14.176C10.6903 15.0239 11.8432 15.5002 13.0453 15.5002H19.5205C20.7227 15.5002 21.8756 15.9765 22.7256 16.8243C23.5756 17.6721 24.0532 18.822 24.0532 20.021C24.0532 21.22 23.5756 22.3699 22.7256 23.2177C21.8756 24.0655 20.7227 24.5418 19.5205 24.5418H8.5127" fill='transparent' stroke="#00ADE6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  renderBrushIcon = () => (
    <svg width="100%" height="100%" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M31.802 4.18532C31.2681 3.65147 30.5441 3.35156 29.7891 3.35156C29.0341 3.35156 28.31 3.65147 27.7761 4.18532L12.9331 20.7157C14.5559 21.0462 16.1758 22.6345 16.3966 24.1792L31.802 8.21123C32.3359 7.67735 32.6358 6.95327 32.6358 6.19828C32.6358 5.44328 32.3359 4.7192 31.802 4.18532V4.18532ZM9.69892 23.6167C7.59808 23.6167 5.90223 25.3393 5.90223 27.4738C5.90223 29.1577 4.43417 30.045 3.37109 30.045C4.53541 31.6136 6.52235 32.6163 8.43336 32.6163C11.2303 32.6163 13.4956 30.315 13.4956 27.4738C13.4956 25.3393 11.7998 23.6167 9.69892 23.6167Z" stroke="url(#cp-brush-icon)" stroke-width="2.24989" stroke-linecap="round" stroke-linejoin="round"/>
      <defs>
        <linearGradient id="cp-brush-icon" x1="35.1586" y1="17.9839" x2="0.680102" y2="17.984" gradientUnits="userSpaceOnUse">
          <stop stop-color="#35E4E9"/>
          <stop offset="1" stop-color="#00ADE6"/>
        </linearGradient>
      </defs>
    </svg>
  )

  renderPlayIcon = () => (
    <svg width="100%" height="100%" viewBox="0 0 105 105" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M41.0586 34.7961V71.7069L70.0602 53.2515L41.0586 34.7961Z" fill="white"/>
      <path opacity="0.8" d="M52.5391 101.958C79.8319 101.958 101.957 79.8329 101.957 52.5401C101.957 25.2473 79.8319 3.12207 52.5391 3.12207C25.2463 3.12207 3.12109 25.2473 3.12109 52.5401C3.12109 79.8329 25.2463 101.958 52.5391 101.958Z" stroke="white" stroke-width="5"/>
    </svg>
  )

  getTabActiveTabLeft = () => {
    let space = 0;
    for (let i = 0; i < this.state.activeTab; i++) {
      space += this.state.tabItemPadding;
      // space += this.state.tabItemsWidth[i];
    }
    return space
  }

  navItems = [
    { id: 0, title: 'Course Overview', icon: this.renderCourseIcon() },
    { id: 1, title: 'Sessions', icon: this.renderSessionIcon() },
    // { id: 2, title: 'Your Mentor', icon: this.renderMentorIcon() },
    { id: 2, title: 'Pricing', icon: this.renderPricingIcon() },
  ]

  renderHero = () => {
    const syllabus = this.props.menteeCourseSyllabus.toJS()
    const description = get(syllabus, '[0].course.description')
    const totalChapters = get(syllabus, '[0].chaptersCount')
    const totalTopics = get(syllabus, '[0].topicsCount')
    return (
      <div className='cp-hero-container'>
        <div className='cp-hero-left-container'>
          <div className='cp-hero-title'>{getCourseName()}</div>
          <div className='cp-hero-line'></div>
          <div className='cp-hero-description'>{description}</div>
          <div className='cp-hero-pointer-container'>
            <div className='cp-hero-pointer-icon'>
              {this.renderCourseIcon(true)}
            </div>
            <div className='cp-hero-text'>{totalChapters} Units | {totalTopics} Classes</div>
          </div>
          {/* <div className='cp-hero-pointer-container'>
            <div className='cp-hero-brush-icon'>
              {this.renderBrushIcon()}
            </div>
            <div className='cp-hero-text'>9 Projects</div>
          </div> */}
          <div className='cp-hero-pointer-container'>
            <div className='cp-hero-pointer-icon'>
              <div style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${require('../../assets/user-icon-gradient.png')})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center center',
                transform: 'scale(1.1)'
              }}></div>
            </div>
            <div className='cp-hero-text'>You will get a dedicated mentor</div>
          </div>
        </div>
        <div className='cp-hero-right-container'>
          {this.props.loggedInUser.get('id') ? this.renderHeroRightContainerLoggedIn() : this.renderHeroRightContainerLoggedOut()}
        </div>
      </div>
    )
  }

  renderHeroRightContainerLoggedIn = () => {
    const { topicThumbnailSmall, topicTitle } = this.props.bookSessionProps
    return (
      <div className='cp-hero-glass-wrapper'>
        <div className='cp-hero-glass-container'></div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className='cp-hero-glass-title'>{this.props.isTrialSession ? 'Your First Class' : 'Next Class'}</div>
          <div className='cp-hero-session-container'>
            <div className='cp-hero-session-thumb' style={{ backgroundImage: topicThumbnailSmall ? `url(${getPath(get(topicThumbnailSmall, 'uri'))})` : '' }}></div>
            <div>
              <div className='cp-hero-session-title'>{topicTitle}</div>
              <div className='cp-details-row'>
                <div className='cp-current-component-icon-container'>
                    <CalendarIcon />
                </div>
                <div className='cp-md-text'>
                    {this.getDate()}
                </div>
                <div className='cp-current-component-icon-container'>
                    <ClockIcon />
                </div>
                <div className='cp-md-text'>{this.getTime()}</div>
              </div>
            </div>
          </div>
          <div className='cp-course-button'>
            <Button3D title={this.props.bookSessionProps.bookingDate ? 'Go to Course': 'Book A Free Class'} onClick={() => {
              if (this.props.bookSessionProps.bookingDate) {
                this.props.history.push('/sessions')
              } else {
                this.openBookSessionPopup()
              }
            }} />
          </div>
        </div>
      </div>
    )
  }

  openBookSessionPopup = () => {
    const { showBookPopup, topicId, topicTitle, topicOrder } = this.props.bookSessionProps
    showBookPopup(topicId, topicTitle, topicOrder)
  }

  renderHeroRightContainerLoggedOut = () => {
    const { showBookPopup, topicId, topicTitle, topicOrder } = this.props.bookSessionProps
    return (
      <>
        <div className='cp-trailer-thumb'>
          <div className='cp-trailer-play-button' onClick={() => {
            this.setState({ trailerVisible: true })
          }}>
            {this.renderPlayIcon()}
          </div>
        </div>
        <Button3D title='BOOK A FREE CLASS' onClick={() => {
          if (this.props.loggedInUser.get('id')) {
            showBookPopup(topicId, topicTitle, topicOrder)
          } else {
            this.setState({ isSignUpModalVisible: true })
          }
        }} />
      </>
    )
  }

  renderAboutCourse = () => {
    return (
      <>
        <div className='cp-h2'>About Course</div>
        <div className='cp-text'>This course will contain intuitive puzzles, mazes and games that will enable the kids to have a structured thinking and building logic. </div>
        <div className='cp-h4'>Key Topics Covered:</div>
        <ul className='cp-li'>
          <li>Sequential thinking</li>
          <li>Basics of loops</li>
          <li>Events</li>
        </ul>
        <div className='cp-hr'></div>
        <div className='cp-h3'>Skills you will unlock</div>
        <div className='cp-text cp-text-narrow'>Building Logic is designed for.... et quo suscipit perspiciatis. Ipsum eum in yearly report card.</div>
        {/* <div className='cp-hr'></div> */}
        {/* <div className='cp-h3'>Projects in this course</div> */}
      </>
    )
  }
  
  renderSessionCard = () => {
    return (
      <>
        <div className='cp-h2'>About Course</div>
        <div className='cp-text'>This course will contain intuitive puzzles, mazes and games that will enable the kids to have a structured thinking and building logic. </div>
        <div className='cp-h4'>Key Topics Covered:</div>
        <ul className='cp-li'>
          <li>Sequential thinking</li>
          <li>Basics of loops</li>
          <li>Events</li>
        </ul>
        <div className='cp-hr'></div>
        <div className='cp-h3'>Skills you will unlock</div>
        <div className='cp-text cp-text-narrow'>Building Logic is designed for.... et quo suscipit perspiciatis. Ipsum eum in yearly report card.</div>
        <div className='cp-hr'></div>
        <div className='cp-h3'>Projects in this course</div>
      </>
    )
  }

  getTopicsNestedInChapter = (sessions) => {
    const chapterTopicsMap = {}
    for (const session of sessions) {
      const { chapterTitle, chapterOrder, chapterId, ...topic } = session
      if (chapterTopicsMap[chapterId]) {
        chapterTopicsMap[chapterId].topics.push(topic)
      } else {
        chapterTopicsMap[chapterId] = {
          chapterTitle,
          chapterOrder,
          id: chapterId,
          topics: [topic]
        }
      }
    }
    const chapterTopics = Object.values(chapterTopicsMap)
    return chapterTopics
  }

  renderTopics = () => {
    return (
      <CollapsibleTopics
        fromCoursePage
        isCourseCompleted={true}
        timezone={this.props.timezone}
        loadingPage={this.props.loadingPage}
        upComingChapterTopics={[]}
        completedChapterTopics={this.getTopicsNestedInChapter(this.props.allSessions)}
      />
    )
  }

  renderPrice(title, price, position) {
    return (
      <div className={position === 'center' && 'cp-pricing-wrapper'}>
        {position === 'center' && <div className='cp-pricing-best'><span>BEST OPPORTUNITY</span></div>}
        <div className={position === 'center' ? 'cp-pricing' : 'cp-pricing-sm-' + position} style={position === 'center' ? ({
          position: 'relative',
          zIndex: 2
        }) : {}}>
          <div className='cp-pricing-card-top-row'>
            <div className='cp-pricing-title'>{title}</div>
            <div className='cp-pricing-text'>
              <span className='cp-pricing-currency'>₹</span>
              <span className='cp-pricing-price'>{price}</span>
              <span className='cp-pricing-per-session'>per session</span>
            </div>
          </div>
          <Button3D
            title='Enroll Now'
            onClick={() => {}}
            className={cx(position !== 'center' && 'cp-2d-price-button', 'cp-display-only-desktop')}
          />
          <div className={cx('cp-hero-text', 'cp-margin-top-32')} style={{ color: '#504F4F' }}>1-on-1 learning with a dedicated mentor assisting you throughout the whole journey</div>
          <div className='cp-pricing-line'></div>
          <div className='cp-pricing-pointers-row' style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div className='cp-pricing-check'></div>
            <div className='cp-pricing-pointer-text'>1:1 Personal Sessions</div>
          </div>
          <div className='cp-pricing-pointers-row' style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div className='cp-pricing-check'></div>
            <div className='cp-pricing-pointer-text'>40 Mentor Assisted Sessions</div>
          </div>
          <div className='cp-pricing-pointers-row' style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div className='cp-pricing-check'></div>
            <div className='cp-pricing-pointer-text'>5 Projects</div>
          </div>
          <div className='cp-pricing-pointers-row' style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div className='cp-pricing-check'></div>
            <div className='cp-pricing-pointer-text'>Lifetime access to content</div>
          </div>
          <Button3D
            title='Enroll Now'
            onClick={() => {}}
            outerContainerStyle={{ alignSelf: 'center' }}
            className={cx(position !== 'center' && 'cp-2d-price-button', 'cp-display-only-mobile', 'cp-2d-price-button-mobile')}
          />
        </div>
      </div>
    )
  }

  renderPricing() {
    return (
      <div>
        <div className='cp-h3' style={{ textAlign: 'center' }}>Choose your learning style</div>
        <div className={cx('cp-text', 'cp-16')} style={{ width: 'auto' }}>
          At Tekie, you can choose the pace at which you learn.<br className='cp-display-only-desktop' />
          Blabber here for 2 more lines as to how it’ll be personalised.
        </div>
        <div className='cp-pricing-container'>
          {this.renderPrice(
            'Private Learning',
            750,
            'left',

          )}
          {this.renderPrice(
            '1:2 Group learning',
            525,
            'center'
          )}
          {this.renderPrice(
            '1:3 Group learning',
            420,
            'right'
          )}
        </div>
      </div>
    )
  }

  renderTab = () => {
    const { tabItemsWidth, activeTab } = this.state

    return (
      <div className='cp-tab-container'>
        <div className='cp-tab-wrapper' id='cp-tab-wrapper'>
        <div className='cp-tab-active-bg' id='cp-tab-active-bg' style={{ 
          width: tabItemsWidth[activeTab],
          left: this.state.tabItemsPadding[this.state.activeTab]
        }}></div>
        {this.navItems.map(navItem => (
          <div className={this.state.activeTab === navItem.id && 'active'} onClick={() => {
            this.setState({ activeTab: navItem.id })
          }}>
            <div className='cp-tab-icon'>
              {navItem.icon}
            </div>
            {navItem.title}
          </div>
        ))}
        </div>
      </div>
    )
  }

  render() {
    if (this.props.loadingPage) {
      return (
        <>
          {!this.props.loggedInUser.get('id') && (
            <Header
              logoClickable
              positionFixed={false}
              openEnrollmentForm={() => {
                this.setState({
                  isSignUpModalVisible: true
                })
              }}
              openLogin={() => {
                this.props.history.push('/login')
              }}
            />
          )}
          <div className='cp-hero-container'>
            <ContentLoader
              className='cp-loader-card'
              speed={5}
              interval={0.1}
              backgroundColor={'#fff'}
              foregroundColor={'#9aa3a7'}
            >
              <rect className='cp-loader-1' />
              <rect className='cp-loader-2'/>
              <rect className='cp-loader-3'/>
              <rect className='cp-loader-4'/>
              <rect className='cp-loader-5'/>
              <rect className='cp-loader-6'/>
              <rect className='cp-loader-7'/>
              <rect className='cp-loader-8'/>
              <rect className='cp-loader-9'/>
              <rect className='cp-loader-10'/>
              <rect className='cp-loader-11'/>
              <rect className='cp-loader-12'/>
              <rect className='cp-loader-13'/>
              <rect className='cp-loader-14'/>
            </ContentLoader>
          </div>
          <div style={{ opacity: 0, visibility: 'hidden' }}>
            {this.renderTab()}
          </div>
        </>
      )
    }
    return (
      <>
        {!this.props.loggedInUser.get('id') && (
          <Header
            logoClickable
            positionFixed={false}
            openEnrollmentForm={() => {
              this.setState({
                isSignUpModalVisible: true
              })
            }}
            openLogin={() => {
              this.props.history.push('/login')
            }}
          />
        )}
        {this.renderHero()}
        {this.renderTab()}
        <div className={cx('cp-tab-body-container', this.state.activeTab === 1 && 'no-padding', this.state.activeTab === 2 && 'no-padding-desktop')}>
          {this.state.activeTab === 0 && this.renderAboutCourse()}
          {this.state.activeTab === 1 && (
            <>
              <div className={cx('cp-h2', 'topics-heading')}>Topics</div>
              {this.renderTopics()}
            </>
          )}
          {this.state.activeTab === 2 && this.renderPricing()}
        </div>
        <YoutubeEmbed visible={this.state.trailerVisible} id='mhgymw0f4D4' close={() => {
          this.setState({ trailerVisible: false })
        }} />
        <AuthModalContainer
          source='coursepage'
          isSignInModalVisible={this.state.isSignInModalVisible}
          isSignUpModalVisible={this.state.isSignUpModalVisible}
          openEnrollmentForm={() => {
            this.setState({
              isSignUpModalVisible: true
            })
          }}
          closeLoginModal={() => {
            this.setState({
              isSignInModalVisible: false
            })
          }}
          closeSignupModal={() => {
            this.setState({
              isSignUpModalVisible: false
            })
          }}
        />
      </>
    )
  }
}

export default withRouter(CoursePage)